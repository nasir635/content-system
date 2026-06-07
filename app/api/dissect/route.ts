import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager, FileState } from '@google/generative-ai/server'
import { v4 as uuid } from 'uuid'
import { saveDissectionToNotion } from '@/lib/notion'
import type { Dissection } from '@/lib/types'
import * as fs from 'fs/promises'
import * as os from 'os'
import * as path from 'path'

const genAI       = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!)

function parseShortcode(url: string): string | null {
  const m = url.match(/\/(p|reel|tv|r)\/([A-Za-z0-9_-]+)\//)
  return m ? m[2] : null
}

function decodeInstagramUrl(raw: string): string {
  return raw
    .replace(/\\u0026/g, '&').replace(/\\\//g, '/')
    .replace(/\\u003C/g, '<').replace(/\\u003E/g, '>').replace(/\\/g, '')
}

async function fetchInstagramEmbed(code: string) {
  const res = await fetch(`https://www.instagram.com/p/${code}/embed/captioned/`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.instagram.com/',
    },
  })
  if (!res.ok) throw new Error(`Instagram embed fetch failed: ${res.status}`)
  const html = await res.text()
  const videoMatch = html.match(/"video_url":"([^"]+)"/)
  const videoUrl   = videoMatch ? decodeInstagramUrl(videoMatch[1]) : ''
  const thumbMatch = html.match(/"thumbnail_src":"([^"]+)"/) || html.match(/"display_url":"([^"]+)"/)
  const thumbnail  = thumbMatch ? decodeInstagramUrl(thumbMatch[1]) : ''
  const capMatch   = html.match(/"accessibility_caption":"([^"]*)"/) || html.match(/"text":"([^"]{10,})"/)
  const caption    = capMatch ? decodeInstagramUrl(capMatch[1]) : ''
  return { videoUrl, thumbnail, caption }
}

async function fetchOEmbedFallback(url: string) {
  try {
    const res = await fetch(`https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`)
    if (!res.ok) return { thumbnail: '', caption: '', videoUrl: '' }
    const d = await res.json()
    return { thumbnail: d.thumbnail_url ?? '', caption: d.title ?? '', videoUrl: '' }
  } catch { return { thumbnail: '', caption: '', videoUrl: '' } }
}

async function downloadVideo(videoUrl: string) {
  const tmpPath = path.join(os.tmpdir(), `ig-${Date.now()}.mp4`)
  const res = await fetch(videoUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.instagram.com/' },
  })
  if (!res.ok) throw new Error(`Video download failed: ${res.status}`)
  await fs.writeFile(tmpPath, Buffer.from(await res.arrayBuffer()))
  return tmpPath
}

async function uploadToGemini(tmpPath: string) {
  const result = await fileManager.uploadFile(tmpPath, {
    mimeType: 'video/mp4',
    displayName: `ig-video-${Date.now()}`,
  })
  let file = result.file
  let attempts = 0
  while (file.state === FileState.PROCESSING && attempts < 15) {
    await new Promise(r => setTimeout(r, 3000))
    file = await fileManager.getFile(file.name)
    attempts++
  }
  if (file.state !== FileState.ACTIVE) throw new Error(`File not active (state: ${file.state})`)
  return file.uri
}

async function analyseWithGemini(data: {
  caption: string; url: string; fileUri?: string; streamlineRules?: string
}) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const jsonShape = `{
  "topic": "A concise, descriptive topic/title for this piece (max 8 words)",
  "transcript": "Full verbatim transcript of speech in the video, or empty string if none",
  "hookAnalysis": "Analysis of the opening hook — what makes it work and why it stops the scroll",
  "angles": [{ "name": "Angle name", "description": "How used", "timestamp": "0:00-0:05", "strength": "strong|medium|weak" }],
  "contentType": "reel|post",
  "emotionalDrivers": "What emotions this triggers and why",
  "pacing": "How the content is paced — cuts, timing, energy shifts",
  "callToAction": "What action the content drives"${data.streamlineRules ? ',\n  "generatedScript": "Full script rewritten in creator voice"' : ''}
}`

  const prompt = `You are an expert content analyst specialising in Instagram reels and posts.
Analyse this Instagram content and return a JSON object with EXACTLY this structure:\n${jsonShape}\n
${data.caption ? `CAPTION:\n${data.caption}\n` : ''}
${data.streamlineRules ? `STREAMLINE RULES:\n${data.streamlineRules}\n` : ''}
${data.fileUri ? 'Watch the entire video and extract full transcript plus analysis.' : 'Analyse based on the caption only.'}
Return ONLY valid JSON. No markdown fences. No extra text.`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: any[] = []
  if (data.fileUri) parts.push({ fileData: { mimeType: 'video/mp4', fileUri: data.fileUri } })
  parts.push({ text: prompt })

  const result  = await model.generateContent({ contents: [{ role: 'user', parts }] })
  const cleaned = result.response.text().replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(cleaned)
}

// ── Main POST handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let tmpPath: string | null = null
  try {
    const body = await req.json()
    const { url, category = 'content creation tips', tags = [], streamlineRules, saveToNotion } = body

    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

    // 1. Get Instagram embed data
    const code = parseShortcode(url)
    let thumbnail = '', caption = '', videoUrl = ''

    if (code) {
      try {
        const embed = await fetchInstagramEmbed(code)
        thumbnail = embed.thumbnail; caption = embed.caption; videoUrl = embed.videoUrl
      } catch {
        const fallback = await fetchOEmbedFallback(url)
        thumbnail = fallback.thumbnail; caption = fallback.caption
      }
    } else {
      const fallback = await fetchOEmbedFallback(url)
      thumbnail = fallback.thumbnail; caption = fallback.caption
    }

    // 2. Upload video to Gemini if available
    let fileUri: string | undefined
    if (videoUrl) {
      try {
        tmpPath = await downloadVideo(videoUrl)
        fileUri = await uploadToGemini(tmpPath)
      } catch { /* fall through to caption-only analysis */ }
    }

    // 3. Analyse
    const analysis = await analyseWithGemini({ caption, url, fileUri, streamlineRules })

    // 4. Build Dissection
    const now = new Date().toISOString()
    const dissection: Dissection = {
      id:               uuid(),
      url,
      topic:            analysis.topic ?? 'Untitled',
      caption,
      category,
      type:             analysis.contentType ?? 'reel',
      thumbnail,
      tags,
      notes:            '',
      transcript:       analysis.transcript ?? '',
      hookAnalysis:     analysis.hookAnalysis ?? '',
      emotionalDrivers: analysis.emotionalDrivers ?? '',
      pacing:           analysis.pacing ?? '',
      callToAction:     analysis.callToAction ?? '',
      angles:           analysis.angles ?? [],
      scriptSuggestion: analysis.generatedScript,
      createdAt:        now,
      updatedAt:        now,
    }

    // 5. Optionally save to Notion
    if (saveToNotion) {
      try {
        const pageId = await saveDissectionToNotion({
          id:              dissection.id,
          topic:           dissection.topic,
          url:             dissection.url,
          category:        dissection.category,
          caption:         dissection.caption         ?? '',
          transcript:      dissection.transcript      ?? '',
          hookAnalysis:    dissection.hookAnalysis     ?? '',
          angles:          JSON.stringify(dissection.angles ?? []),
          scriptSuggestion: dissection.scriptSuggestion,
          streamlineId:    dissection.streamlineId,
        })
        dissection.notionPageId = pageId
      } catch (e) {
        console.error('Notion save failed:', e)
      }
    }

    return NextResponse.json({ dissection })

  } catch (err) {
    console.error('Dissect API error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  } finally {
    if (tmpPath) fs.unlink(tmpPath).catch(() => {})
  }
}
