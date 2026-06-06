import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

export async function POST(req: NextRequest) {
  try {
    const { notionToken, parentPageId } = await req.json()
    if (!notionToken || !parentPageId) {
      return NextResponse.json({ error: 'Token and parent page ID required' }, { status: 400 })
    }
    const notion = new Client({ auth: notionToken })

    const diss = await notion.databases.create({
      parent: { page_id: parentPageId },
      title: [{ type: 'text', text: { content: 'Content Dissections' } }],
      properties: {
        Title: { title: {} }, URL: { url: {} },
        Category: { select: { options: [] } },
        ExternalID: { rich_text: {} }, CreatedAt: { created_time: {} },
      },
    })
    const scrp = await notion.databases.create({
      parent: { page_id: parentPageId },
      title: [{ type: 'text', text: { content: 'Scripts' } }],
      properties: {
        Title: { title: {} },
        Category: { select: { options: [] } },
        Status: { select: { options: [
          { name: 'draft', color: 'gray' }, { name: 'ready', color: 'yellow' }, { name: 'shot', color: 'green' },
        ]}},
        ExternalID: { rich_text: {} }, CreatedAt: { created_time: {} },
      },
    })
    const strm = await notion.databases.create({
      parent: { page_id: parentPageId },
      title: [{ type: 'text', text: { content: 'Streamlines' } }],
      properties: { Title: { title: {} }, ExternalID: { rich_text: {} } },
    })
    return NextResponse.json({ dissId: diss.id, scriptsId: scrp.id, streamlinesId: strm.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
