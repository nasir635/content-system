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

export interface Dissection {
  id: string
  url: string
  type: 'reel' | 'post'
  thumbnail?: string
  topic: string
  caption: string
  transcript: string
  angles: AngleBreakdown[]
  hookAnalysis: string
  scriptSuggestion?: string
  category: ContentCategory
  streamlineId?: string
  hasFrames: boolean
  frameCount?: number
  frames: FrameImage[]
  createdAt: string
  notionPageId?: string
}

export interface AngleBreakdown {
  name: string
  description: string
  timestamp?: string
  strength: 'strong' | 'medium' | 'weak'
}

export interface FrameImage {
  id: string
  url: string
  timestamp: string
  index: number
}

export interface Script {
  id: string
  title: string
  category: string
  status: 'draft' | 'ready' | 'shot'
  content: string // tiptap JSON string
  visualRefs: VisualRef[]
  music: MusicEntry[]
  streamlineId?: string
  dissectionId?: string
  createdAt: string
  updatedAt: string
  notionPageId?: string
}

export interface VisualRef {
  id: string
  imageUrl: string
  timestamp: string
  note: string
  frameId?: string
}

export interface MusicEntry {
  id: string
  title: string
  artist?: string
  type: 'bgm' | 'sfx' | 'transition'
  timestamp?: string
  note?: string
}

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
}

// ── REFERENCE LIBRARY ────────────────────────────────────────
export interface Reference {
  id: string
  title: string
  imageUrl: string        // Vercel Blob URL or pasted URL
  note: string            // where/how to use it
  category: string        // free-text, user defined
  tags: string[]
  createdAt: string
  updatedAt: string
}
