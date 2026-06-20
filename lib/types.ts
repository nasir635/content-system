// ── CONTENT CATEGORIES ───────────────────────────────────────
// User-defined content categories (formerly "streamlines"). Each holds the
// rules and shot guidance for that kind of content. Scripts are tagged with a
// category by name; the script count per category is derived, not stored.
export interface Category {
  id: string
  name: string
  description: string
  rules: string
  shotTypes: string
  color: string
  createdAt: string
  updatedAt?: string
}

export const CATEGORY_COLORS = [
  '#2F4156', // navy
  '#567C8D', // teal
  '#9A7BB0', // violet
  '#CC785C', // clay
  '#7FA37E', // sage
  '#C2A14D', // ochre
  '#6E94A6', // steel
  '#B5836B', // terracotta
]

// ── INSPIRATIONS ─────────────────────────────────────────────
export interface Inspiration {
  id: string
  url: string
  title?: string
  howToUse: string
  category: string
  tags: string[]
  coverImage?: string
  screenshots: InspirationScreenshot[]
  createdAt: string
  updatedAt?: string
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
export interface ScriptComment {
  id: string
  text: string
  createdAt: string
}

export interface Script {
  id: string
  title: string
  category: string
  status: 'draft' | 'ready' | 'shot'
  content: string
  coverImage?: string
  coverPosition?: number   // vertical focal point 0–100 (%) for the cover crop
  lineSpacing?: number     // document-wide line spacing (e.g. 1.35, 1.6, 1.9)
  visualRefs: VisualRef[]
  music: MusicEntry[]
  comments?: ScriptComment[]
  inspirationId?: string
  createdAt: string
  updatedAt: string
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
  audioUrl?: string
}

// ── CONTENT PLANNER ──────────────────────────────────────────
export interface PlanEntry {
  id: string
  date: string          // 'YYYY-MM-DD'
  categoryId: string
  title: string
  note?: string
  scriptId?: string
  status: 'planned' | 'posted'
  createdAt: string
  updatedAt?: string
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
  source?: 'manual' | 'inspiration'
  inspirationId?: string
  createdAt: string
  updatedAt?: string
}

// ── WORKSPACE SETTINGS (editable branding) ───────────────────
export interface AppSettings {
  portalName: string
  ownerName: string
}

export const DEFAULT_SETTINGS: AppSettings = {
  portalName: 'Content OS',
  ownerName: '',
}

// ── DAILY: TIMETABLE + TO-DOS ────────────────────────────────
export interface TimeBlock {
  id: string
  date: string          // 'YYYY-MM-DD'
  start: string         // 'HH:MM' (may be empty until set)
  end?: string
  title: string
  done: boolean
  createdAt: string
}

export interface TodoItem {
  id: string
  text: string
  done: boolean
  createdAt: string
}

// ── PERSISTED APP STATE (cloud sync payload) ─────────────────
export interface AppData {
  inspirations: Inspiration[]
  scripts: Script[]
  categories: Category[]
  references: Reference[]
  plans: PlanEntry[]
  timeBlocks: TimeBlock[]
  todos: TodoItem[]
  settings: AppSettings
}
