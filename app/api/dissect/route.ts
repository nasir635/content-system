import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager, FileState } from '@google/generative-ai/server'
import { v4 as uuid } from 'uuid'
import { saveDissectionToNotion } from '@/lib/notion'
import type { Dissection } from '@/lib/types'
import * as fs from 'fs/promises'
import * as os from 'os'
import * as path from 'path'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!)

// ── Instagram extraction ──────────────────────────────────────────────────────

function parseShortcode(url: string): string | null {
  const m = url.match(/\/(p|reel|tv|r)\/([A-Za-z0-9_-]+)\//)
  return m ? m[2] : null
}

function decodeInstagramUrl(raw: string): string {
  return raw.replace(/\\u0026/g, '&').replace(/\\\//g, '/').replace(/\\u003C/g, '<').replace(/\\u003E/g, '>').replace(/\\/g, '')
}

async function fetchInstagramEmbed(code: string): Promise<{
  videoUrl: string; thumbnail: string; caption: string
}> {
  const embedUrl = `https://www.instagram.com/p/${code}/embed/captioned/`
  const res = await fetch(embedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.instagram.com/',
    },
  })
  if (!res.ok) throw new Error(`Instagram embed fetch failed: ${res.status}`)
  const html = await res.text()

  // Extract video_url from embedded JSON
  const videoMatch = html.match(/"video_url":"([^"]+)"/)
  const videoUrl = videoMatch ? decodeInstagramUrl(videoMatch[1]) : ''

  // Extract thumbnail
  const thumbMatch = html.match(/"thumbnail_src":"([^"]+)"/) || html.match(/"display_url":"([^"]+)"/)
  const thumbnail = thumbMatch ? decodeInstagramUrl(thumbMatch[1]) : ''

  // Extract caption from accessibility_caption or edge_media_to_caption
  const captionMatch = html.match(/"accessibility_caption":"([^"]*)"/) ||
    html.match(/"text":"([^"]{10,})"/)
  const caption = captionMatch ? decodeInstagramUrl(captionMatch[1]) : ''

  return { videoUrl, thumbnail, caption }
}

async function fetchOEmbedFallback(url: string): Promise<{ thumbnail: string; caption: string }> {
  try {
    const res = await fetch(`https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`)
    if (!res.ok) return { thumbnail: '', caption: '' }
    const data = await res.json()
    return { thumbnail: data.thumbnail_url ?? '', caption: data.title ?? '' }
  } catch {
    return { thumbnail: '', caption: '' }
  }
}

// ── Video download & Gemini File API upload ───────────────────────────────────

async function downloadVideo(videoUrl: string): Promise<string> {
  const tmpPath = path.join(os.tmpdir(), `ig-${Date.now()}.mp4`)
  const res = await fetch(videoUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      'Referer': 'https://www.instagram.com/',
    },
  })
  if (!res.ok) throw new Error(`Video download failed: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  await fs.writeFile(tmpPath, buffer)
  return tmpPath
}

async function uploadToGemini(tmpPath: string): Promise<string> {
  const uploadResult = await fileManager.uploadFile(tmpPath, {
    mimeType: 'video/mp4',
    displayName: `ig-video-${Date.now()}`,
  })

  // Poll until ACTIVE
  let file = uploadResult.file
  let attempts = 0
  while (file.state === FileState.PROCESSING && attempts < 15) {
    await new Promise(r => setTimeout(r, 3000))
    file = await fileManager.getFile(file.name)
    attempts++
  }

  if (file.state !== FileState.ACTIVE) {
    throw new Error(`File not active after polling (state: ${file.state})`)
  }

  return file.uri
}

// ── Gemini analysis ───────────────────────────────────────────────────────────

async function analyseWithGemini(data: {
  caption: string
  url: string
  fileUri?: string
  streamlineRules?: string
}) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const jsonShape = `{
  "topic": "A concise, descriptive topic/title for this piece (max 8 words)",
  "transcript": "Full verbatim transcript of speech in the video, or empty string if none",
  "hookAnalysis": "Detailed analysis of the opening hook — what makes it work, the psychological mechanism, why it stops the scroll",
  "angles": [
    {
      "name": "Angle name (2-4 words)",
      "description": "What this angle is and how it's used in the content",
      "timestamp": "e.g. 0:00-0:05 if applicable",
      "strength": "strong|medium|weak"
    }
  ],
  "contentType": "reel|post",
  "emotionalDrivers": "What emotions this content triggers and why",
  "pacing": "How the content is paced — cuts, timing, energy shifts",
  "callToAction": "What action the content drives (implicit or explicit)"${data.streamlineRules ? `,
  "generatedScript": "A full script for this same topic rewritten in the creator's voice using their streamline rules below"` : ''}
}`

  const prompt = `You are an expert content analyst specialising in Instagram reels and posts.
Analyse this Instagram content and return a JSON object with EXACTLY this structure:

${jsonShape}

${data.caption ? `CAPTION:\n${data.caption}\n` : ''}
${data.streamlineRules ? `STREAMLINE RULES (write the generatedScript following these EXACTLY):\n${data.streamlineRules}\n` : ''}

${data.fileUri ? 'Watch the entire video above and extract the full transcript plus analysis.' : 'Analyse based on the caption only (no video available).'}

Return ONLY valid JSON. No markdown fences. No extra text.`

  const parts: any[] = []

  if (data.fileUri) {
    parts.push({
      fileData: {
        mimeType: 'video/mp4',
        fileUri: data.fileUri,
      },
    })
  }

  parts.push({ text: prompt })

  const result = await model.generateContent({ contents: [{ role: 'user', parts }] })
  const text = result.response.text().trim()

  // Strip any accidental markdown fences
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
  return JSON.parse(cleaned)
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { url, category, withFrames, streamlineId, streamlineRules } = await req.json()
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

    // 1. Parse shortcode
    const code = parseShortcode(url)
    if (!code) return NextResponse.json({ error: 'Could not parse Instagram shortcode from URL' }, { status: 400 })

    // 2. Fetch Instagram embed data
    let caption = ''
    let thumbnail = ''
    let videoUrl = ''
    let fileUri: string | undefined

    try {
      const igData = await fetchInstagramEmbed(code)
      caption   = igData.caption
      thumbnail = igData.thumbnail
      videoUrl  = igData.videoUrl
    } catch (e) {
      console.warn('Instagram embed fetch failed, trying oEmbed fallback:', e)
      const fallback = await fetchOEmbedFallback(url)
      thumbnail = fallback.thumbnail
      caption   = fallback.caption
    }

    // 3. Download video + upload to Gemini File API
    let tmpPath: string | undefined
    try {
      if (videoUrl) {
        tmpPath  = await downloadVideo(videoUrl)
        fileUri  = await uploadToGemini(tmpPath)
      }
    } catch (e) {
      console.warn('Video download/upload failed, falling back to caption-only analysis:', e)
      fileUri = undefined
    } finally {
      // Clean up tmp file
      if (tmpPath) {
        fs.unlink(tmpPath).catch(() => {})
      }
    }

    // 4. Analyse with Gemini
    const analysis = await analyseWithGemini({ caption, url, fileUri, streamlineRules })

    // 5. Build dissection object
    const dissection: Dissection = {
      id:               uuid(),
      url,
      type:             analysis.contentType ?? 'reel',
      thumbnail,
      topic:            analysis.topic ?? 'Untitled',
      caption,
      transcript:       analysis.transcript ?? '',
      angles:           analysis.angles ?? [],
      hookAnalysis:     analysis.hookAnalysis ?? '',
      scriptSuggestion: analysis.generatedScript,
      category,
      streamlineId,
      hasFrames:        false,
      frameCount:       0,
      frames:           [],
      createdAt:        new Date().toISOString(),
    }

    // 6. Save to Notion
    try {
      const notionPage = await saveDissectionToNotion({
        id:               dissection.id,
        topic:            dissection.topic,
        url:              dissection.url,
        category:         dissection.category,
        caption:          dissection.caption,
        transcript:       dissection.transcript,
        hookAnalysis:     dissection.hookAnalysis,
        angles:           JSON.stringify(dissection.angles, null, 2),
        scriptSuggestion: dissection.scriptSuggestion,
      })
      dissection.notionPageId = (notionPage as any).id
    } catch (e) {
      console.warn('Notion sync failed:', e)
    }

    return NextResponse.json(dissection)
  } catch (e: any) {
    console.error('Dissect error:', e)
    return NextResponse.json({ error: e.message ?? 'Analysis failed' }, { status: 500 })
  }
}
