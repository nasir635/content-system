import { Client } from '@notionhq/client'

export const notion = new Client({ auth: process.env.NOTION_TOKEN })

const DISS_DB  = process.env.NOTION_DISSECTIONS_DB_ID!
const SCRP_DB  = process.env.NOTION_SCRIPTS_DB_ID!
const STRM_DB  = process.env.NOTION_STREAMLINES_DB_ID!

export async function saveDissectionToNotion(d: {
  id: string; topic: string; url: string; category: string;
  caption: string; transcript: string; hookAnalysis: string;
  angles: string; scriptSuggestion?: string; streamlineId?: string;
}) {
  return notion.pages.create({
    parent: { database_id: DISS_DB },
    properties: {
      Title:      { title: [{ text: { content: d.topic } }] },
      URL:        { url: d.url },
      Category:   { select: { name: d.category } },
      ExternalID: { rich_text: [{ text: { content: d.id } }] },
    },
    children: [
      { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ text: { content: 'Caption' } }] } },
      { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ text: { content: d.caption } }] } },
      { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ text: { content: 'Transcript' } }] } },
      { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ text: { content: d.transcript } }] } },
      { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ text: { content: 'Hook Analysis' } }] } },
      { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ text: { content: d.hookAnalysis } }] } },
      { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ text: { content: 'Angles Breakdown' } }] } },
      { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ text: { content: d.angles } }] } },
      ...(d.scriptSuggestion ? [
        { object: 'block' as const, type: 'heading_2' as const, heading_2: { rich_text: [{ text: { content: 'Generated Script' } }] } },
        { object: 'block' as const, type: 'paragraph' as const, paragraph: { rich_text: [{ text: { content: d.scriptSuggestion } }] } },
      ] : []),
    ],
  })
}

export async function saveScriptToNotion(s: {
  id: string; title: string; category: string; status: string; content: string;
}) {
  return notion.pages.create({
    parent: { database_id: SCRP_DB },
    properties: {
      Title:      { title: [{ text: { content: s.title } }] },
      Category:   { select: { name: s.category } },
      Status:     { select: { name: s.status } },
      ExternalID: { rich_text: [{ text: { content: s.id } }] },
    },
    children: [
      { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ text: { content: s.content } }] } },
    ],
  })
}

export async function createNotionDatabases(parentPageId: string) {
  // Creates all three databases under a parent page
  const diss = await notion.databases.create({
    parent: { page_id: parentPageId },
    title: [{ type: 'text', text: { content: 'Content Dissections' } }],
    properties: {
      Title:      { title: {} },
      URL:        { url: {} },
      Category:   { select: { options: [] } },
      ExternalID: { rich_text: {} },
      CreatedAt:  { created_time: {} },
    },
  })

  const scrp = await notion.databases.create({
    parent: { page_id: parentPageId },
    title: [{ type: 'text', text: { content: 'Scripts' } }],
    properties: {
      Title:      { title: {} },
      Category:   { select: { options: [] } },
      Status:     { select: { options: [
        { name: 'draft', color: 'gray' },
        { name: 'ready', color: 'yellow' },
        { name: 'shot',  color: 'green' },
      ]}},
      ExternalID: { rich_text: {} },
      CreatedAt:  { created_time: {} },
    },
  })

  const strm = await notion.databases.create({
    parent: { page_id: parentPageId },
    title: [{ type: 'text', text: { content: 'Streamlines' } }],
    properties: {
      Title:      { title: {} },
      ExternalID: { rich_text: {} },
    },
  })

  return { dissId: diss.id, scriptsId: scrp.id, streamlinesId: strm.id }
}
