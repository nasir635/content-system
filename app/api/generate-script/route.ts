import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { topic, transcript, caption, angles, hookAnalysis, streamlineRules } = await req.json()

    const prompt = `You are writing a script for a content creator based on their streamline rules.

ORIGINAL CONTENT ANALYSIS:
Topic: ${topic}
Caption: ${caption}
Transcript: ${transcript}
Hook: ${hookAnalysis}
Angles: ${JSON.stringify(angles)}

CREATOR'S STREAMLINE RULES (follow STRICTLY):
${streamlineRules}

Write a complete, ready-to-record script for this topic in the creator's exact voice.
- Match their tone, vocabulary, and style exactly as defined in the rules
- Use their script structure rules
- Make it feel natural and authentic, not rewritten
- Include scene directions or visual cues in [brackets] where helpful
- Return only the script text, no metadata`

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent(prompt)
    const script = result.response.text()

    return NextResponse.json({ script })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
