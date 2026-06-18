import { create } from 'zustand'
import type { Script, Category, Reference, Inspiration, PlanEntry, AppData } from './types'

const SEED_DATE = '2026-01-01T00:00:00.000Z'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-faasle-bts', name: 'Faasle BTS', description: 'Behind-the-scenes of building Faasle.', rules: '', shotTypes: '', color: '#2F4156', createdAt: SEED_DATE },
  { id: 'cat-culture',    name: 'Culture',    description: '', rules: '', shotTypes: '', color: '#567C8D', createdAt: SEED_DATE },
  { id: 'cat-art',        name: 'Art',        description: '', rules: '', shotTypes: '', color: '#9A7BB0', createdAt: SEED_DATE },
  { id: 'cat-claude',     name: 'Claude',     description: '', rules: '', shotTypes: '', color: '#CC785C', createdAt: SEED_DATE },
  { id: 'cat-lifestyle',  name: 'Lifestyle',  description: '', rules: '', shotTypes: '', color: '#7FA37E', createdAt: SEED_DATE },
]

interface AppState extends AppData {
  loaded: boolean
  syncing: boolean
  cloud: boolean

  hydrate: () => Promise<void>

  addInspiration:    (i: Inspiration) => void
  updateInspiration: (id: string, i: Partial<Inspiration>) => void
  deleteInspiration: (id: string) => void

  addScript:    (s: Script) => void
  updateScript: (id: string, s: Partial<Script>) => void
  deleteScript: (id: string) => void

  addCategory:    (c: Category) => void
  updateCategory: (id: string, c: Partial<Category>) => void
  deleteCategory: (id: string) => void

  addReference:    (r: Reference) => void
  updateReference: (id: string, r: Partial<Reference>) => void
  deleteReference: (id: string) => void

  addPlan:    (p: PlanEntry) => void
  updatePlan: (id: string, p: Partial<PlanEntry>) => void
  deletePlan: (id: string) => void
}

const LS_KEY = 'content-system-store'

function snapshot(s: AppState): AppData {
  return {
    inspirations: s.inspirations,
    scripts:      s.scripts,
    categories:   s.categories,
    references:   s.references,
    plans:        s.plans,
  }
}

// Has the user created any actual content (categories excluded — they're seeded)?
function hasContent(d: Partial<AppData> | null | undefined) {
  if (!d) return false
  return !!(d.inspirations?.length || d.scripts?.length || d.references?.length || d.plans?.length)
}

// Normalise any stored payload (incl. older "streamlines" shape) into AppData.
function normalize(d: any): AppData { // eslint-disable-line @typescript-eslint/no-explicit-any
  let categories: Category[] = Array.isArray(d?.categories) ? d.categories : []
  if (!categories.length && Array.isArray(d?.streamlines) && d.streamlines.length) {
    categories = d.streamlines.map((s: any, i: number) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
      id: s.id ?? `cat-${i}`,
      name: s.name ?? 'Untitled',
      description: s.description ?? '',
      rules: s.scriptRules ?? s.voiceRules ?? '',
      shotTypes: s.contentStyle ?? '',
      color: DEFAULT_CATEGORIES[i % DEFAULT_CATEGORIES.length].color,
      createdAt: s.createdAt ?? SEED_DATE,
    }))
  }
  if (!categories.length) categories = DEFAULT_CATEGORIES
  return {
    inspirations: Array.isArray(d?.inspirations) ? d.inspirations : [],
    scripts:      Array.isArray(d?.scripts) ? d.scripts : [],
    references:   Array.isArray(d?.references) ? d.references : [],
    plans:        Array.isArray(d?.plans) ? d.plans : [],
    categories,
  }
}

function readLocal(): AppData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? normalize(JSON.parse(raw)) : null
  } catch { return null }
}

function writeLocal(data: AppData) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)) } catch { /* quota */ }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

async function pushToCloud(data: AppData) {
  if (typeof window === 'undefined') return
  try {
    await fetch('/api/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch { /* offline — localStorage still holds it */ }
}

export const useStore = create<AppState>()((set, get) => ({
  inspirations: [],
  scripts:      [],
  categories:   DEFAULT_CATEGORIES,
  references:   [],
  plans:        [],
  loaded:  false,
  syncing: false,
  cloud:   false,

  hydrate: async () => {
    const local = readLocal()
    if (local) set({ ...local })

    try {
      const res = await fetch('/api/state', { cache: 'no-store' })
      const { configured, data } = await res.json()
      set({ cloud: !!configured })

      if (data && (hasContent(data) || Array.isArray(data?.categories))) {
        const norm = normalize(data)
        set({ ...norm, loaded: true })
        writeLocal(norm)
      } else if (configured && local && hasContent(local)) {
        set({ loaded: true })
        pushToCloud(local)
      } else {
        set({ loaded: true })
      }
    } catch {
      set({ loaded: true })
    }
  },

  addInspiration: (i) => set(s => ({ inspirations: [i, ...s.inspirations] })),
  updateInspiration: (id, i) => set(s => ({
    inspirations: s.inspirations.map(x => x.id === id ? { ...x, ...i } : x),
  })),
  deleteInspiration: (id) => set(s => ({
    inspirations: s.inspirations.filter(x => x.id !== id),
  })),

  addScript: (sc) => set(s => ({ scripts: [sc, ...s.scripts] })),
  updateScript: (id, sc) => set(s => ({
    scripts: s.scripts.map(x => x.id === id ? { ...x, ...sc } : x),
  })),
  deleteScript: (id) => set(s => ({
    scripts: s.scripts.filter(x => x.id !== id),
    plans: s.plans.map(p => p.scriptId === id ? { ...p, scriptId: undefined } : p),
  })),

  addCategory: (c) => set(s => ({ categories: [...s.categories, c] })),
  updateCategory: (id, c) => set(s => ({
    categories: s.categories.map(x => x.id === id ? { ...x, ...c } : x),
  })),
  deleteCategory: (id) => set(s => ({
    categories: s.categories.filter(x => x.id !== id),
    plans: s.plans.filter(p => p.categoryId !== id),
  })),

  addReference: (r) => set(s => ({ references: [r, ...s.references] })),
  updateReference: (id, r) => set(s => ({
    references: s.references.map(x => x.id === id ? { ...x, ...r } : x),
  })),
  deleteReference: (id) => set(s => ({
    references: s.references.filter(x => x.id !== id),
  })),

  addPlan: (p) => set(s => ({ plans: [...s.plans, p] })),
  updatePlan: (id, p) => set(s => ({
    plans: s.plans.map(x => x.id === id ? { ...x, ...p } : x),
  })),
  deletePlan: (id) => set(s => ({
    plans: s.plans.filter(x => x.id !== id),
  })),
}))

// Persist on every change once hydration is done: localStorage immediately,
// cloud debounced.
if (typeof window !== 'undefined') {
  useStore.subscribe((state) => {
    if (!state.loaded) return
    const data = snapshot(state)
    writeLocal(data)
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => { pushToCloud(data) }, 800)
  })
}
