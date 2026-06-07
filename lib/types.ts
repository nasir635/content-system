export type ContentCategory =
  | 'best people for faasle'
  | 'business resources'
  | 'art and culture recreate'
  | 'personal life recreate'
  | 'random easy recreate'
  | 'cinematics references'
  | 'claude for myself'
  | 'ai content to recreate'
  | 'business tips'
  | 'content creation tips'

export const CONTENT_CATEGORIES: ContentCategory[] = [
  'best people for faasle',
  'business resources',
  'art and culture recreate',
  'personal life recreate',
  'random easy recreate',
  'cinematics references',
  'claude for myself',
  'ai content to recreate',
  'business tips',
  'content creation tips',
]

// ── INSPIRATIONS ─────────────────────────────────────────────
export interface Inspiration {
  id: string
  url: string
  howToUse: string
  category: ContentCategory
  tags: string[]
  screenshots: InspirationScreenshot[]
  createdAt: string
  notionPageId?: string
}

export interface InspirationScreenshot {
  id: string
  imageUrl: string
  title?: string
  note?: string
  savedToRefs: boolean
  refId?: string
}

// ── SCRIPTS ──────────────────────────────────────────────────
export interface Script {
  id: string
  title: string
  category: string
  status: 'draft' | 'ready' | 'shot'
  content: string
  visualRefs: VisualRef[]
  music: MusicEntry[]
  streamlineId?: string
  inspirationId?: string
  dissectionId?: string
  createdAt: string
  updatedAt: string
  notionPageId?: string
}

export interface VisualRef {
  id: string
  referenceId?: string
  imageUrl: string
  title?: string
  timestamp: string
  note: string
}

export interface MusicEntry {
  id: string
  title: string
  artist?: string
  type: 'bgm' | 'sfx' | 'transition'
  timestamp?: string
  note?: string
}

// ── STREAMLINES ──────────────────────────────────────────────
export interface Streamline {
  id: string
  name: string
  description: string
  voiceRules: string
  scriptRules: string
  tone: string
  contentStyle: string
  exampleOpeners: string
  wordsToAvoid: string
  createdAt: string
  updatedAt: string
}

// ── REFERENCES ───────────────────────────────────────────────
export interface Reference {
  id: string
  title: string
  imageUrl: string
  note: string
  category: string
  tags: string[]
  sourceUrl?: string
  createdAt: string
  updatedAt?: string
}

// ── DISSECTIONS (legacy + active) ────────────────────────────
export interface ContentAngle {
  name: string
  description: string
  timestamp?: string
  strength: 'strong' | 'medium' | 'weak'
}
export type AngleBreakdown = ContentAngle

export interface Dissection {
  id: string
  url: string
  topic: string
  caption?: string
  category: ContentCategory
  type?: string
  thumbnail?: string
  tags: string[]
  notes: string
  transcript?: string
  hookAnalysis?: string
  emotionalDrivers?: string
  pacing?: string
  callToAction?: string
  angles?: ContentAngle[]
  scriptSuggestion?: string
  streamlineId?: string
  notionPageId?: string
  hasFrames?: boolean
  frameCount?: number
  frames?: { id: string; url: string; index: number; timestamp: string; note?: string }[]
  createdAt: string
  updatedAt: string
}
