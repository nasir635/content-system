import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { v4 as uuid } from 'uuid'
import { saveDissectionToNotion } from '@/lib/notion'
import type { Dissection, AngleBreakdown } from '@/lib/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function fetchInstagramData(url: string) {
  // Bright Data Web Unlocker API
  const res = await fetch('https://api.brightdata.com/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.BRIGHTDATA_API_KEY}`,
    },
    body: JSON.stringify({
      zone: process.env.BRIGHTDATA_ZONE ?? 'instagram_scraper',
      url,
      format: 'json',
      country: 'us',
    }),
  })
  if (!res.ok) throw new Error(`Bright Data error: ${res.status}`)
  return res.json()
}

async function analyseWithClaude(data: {
  caption: string; transcript: string; url: string; streamlineRules?: string
}) {
  const systemPrompt = `You are an expert content analyst specialising in Instagram reels and posts.
Your job is to deeply dissect pieces of content and extract actionable insights for content creators.`

  const userPrompt = `Analyse this Instagram content and return a JSON object with EXACTLY this structure:

{
  "topic": "A concise, descriptive topic/title for this piece (max 8 words)",
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
}

CAPTION:
${data.caption || 'Not available'}

TRANSCRIPT:
${data.transcript || 'Not available'}

${data.streamlineRules ? `STREAMLINE RULES (write the generatedScript following these EXACTLY):
${data.streamlineRules}` : ''}

Return ONLY valid JSON. No markdown fences.`

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return JSON.parse(text.trim())
}

export async function POST(req: NextRequest) {
  try {
    const { url, category, withFrames, streamlineId } = await req.json()
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

    // 1. Fetch Instagram data via Bright Data
    let caption = ''
    let transcript = ''
    let thumbnail = ''
    let videoUrl = ''

    try {
      const igData = await fetchInstagramData(url)
      caption   = igData.caption   ?? igData.edge_media_to_caption?.edges?.[0]?.node?.text ?? ''
      thumbnail = igData.thumbnail_url ?? igData.display_url ?? ''
      videoUrl  = igData.video_url ?? ''
      // Transcript from captions if available
      transcript = igData.accessibility_caption ?? ''
    } catch (e) {
      console.warn('Bright Data fetch failed, proceeding with empty data:', e)
    }

    // 2. Get streamline rules if applicable
    let streamlineRules: string | undefined
    // (streamline data is client-side in zustand; client passes the rules if needed)
    // For server-side script generation, client should pass rules in body

    // 3. Analyse with Claude
    const analysis = await analyseWithClaude({ caption, transcript, url, streamlineRules })

    // 4. Extract frames if requested
    let frames: any[] = []
    let frameCount = 0
    if (withFrames && videoUrl) {
      try {
        const framesRes = await fetch(`${process.env.NEXTAUTH_URL}/api/frames/extract`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoUrl }),
        })
        const framesData = await framesRes.json()
        frames = framesData.frames ?? []
        frameCount = frames.length
      } catch (e) {
        console.warn('Frame extraction failed:', e)
      }
    }

    // 5. Build dissection object
    const dissection: Dissection = {
      id:          uuid(),
      url,
      type:        analysis.contentType ?? 'reel',
      thumbnail,
      topic:       analysis.topic ?? 'Untitled',
      caption,
      transcript,
      angles:      analysis.angles ?? [],
      hookAnalysis: analysis.hookAnalysis ?? '',
      scriptSuggestion: analysis.generatedScript,
      category,
      streamlineId,
      hasFrames:   withFrames && frames.length > 0,
      frameCount,
      frames,
      createdAt:   new Date().toISOString(),
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
