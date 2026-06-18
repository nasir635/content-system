import { create } from 'zustand'
import type { Script, Streamline, Reference, Inspiration, AppData } from './types'

interface AppState extends AppData {
  loaded: boolean
  syncing: boolean
  cloud: boolean        // true once we know cloud storage is configured

  hydrate: () => Promise<void>

  addInspiration:    (i: Inspiration) => void
  updateInspiration: (id: string, i: Partial<Inspiration>) => void
  deleteInspiration: (id: string) => void

  addScript:    (s: Script) => void
  updateScript: (id: string, s: Partial<Script>) => void
  deleteScript: (id: string) => void

  addStreamline:    (s: Streamline) => void
  updateStreamline: (id: string, s: Partial<Streamline>) => void
  deleteStreamline: (id: string) => void

  addReference:    (r: Reference) => void
  updateReference: (id: string, r: Partial<Reference>) => void
  deleteReference: (id: string) => void
}

const LS_KEY = 'content-system-store'

function snapshot(s: AppState): AppData {
  return {
    inspirations: s.inspirations,
    scripts:      s.scripts,
    streamlines:  s.streamlines,
    references:   s.references,
  }
}

function isEmpty(d: Partial<AppData> | null | undefined) {
  if (!d) return true
  return (
    !(d.inspirations?.length) &&
    !(d.scripts?.length) &&
    !(d.streamlines?.length) &&
    !(d.references?.length)
  )
}

function readLocal(): AppData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : null
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
  streamlines:  [],
  references:   [],
  loaded:  false,
  syncing: false,
  cloud:   false,

  hydrate: async () => {
    const local = readLocal()
    // Paint local cache instantly if present.
    if (local && !isEmpty(local)) set({ ...local })

    try {
      const res = await fetch('/api/state', { cache: 'no-store' })
      const { configured, data } = await res.json()
      set({ cloud: !!configured })

      if (!isEmpty(data)) {
        // Cloud is source of truth.
        set({ ...(data as AppData), loaded: true })
        writeLocal(data as AppData)
      } else if (configured && local && !isEmpty(local)) {
        // First device had local data, cloud is empty → seed cloud from local.
        set({ loaded: true })
        pushToCloud(local)
      } else {
        set({ loaded: true })
      }
    } catch {
      // No network / not configured — run on local cache only.
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
  })),

  addStreamline: (st) => set(s => ({ streamlines: [st, ...s.streamlines] })),
  updateStreamline: (id, st) => set(s => ({
    streamlines: s.streamlines.map(x => x.id === id ? { ...x, ...st } : x),
  })),
  deleteStreamline: (id) => set(s => ({
    streamlines: s.streamlines.filter(x => x.id !== id),
  })),

  addReference: (r) => set(s => ({ references: [r, ...s.references] })),
  updateReference: (id, r) => set(s => ({
    references: s.references.map(x => x.id === id ? { ...x, ...r } : x),
  })),
  deleteReference: (id) => set(s => ({
    references: s.references.filter(x => x.id !== id),
  })),
}))

// Persist on every change once initial hydration is done. Writes to
// localStorage immediately and debounces the cloud sync.
if (typeof window !== 'undefined') {
  useStore.subscribe((state) => {
    if (!state.loaded) return
    const data = snapshot(state)
    writeLocal(data)
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => { pushToCloud(data) }, 800)
  })
}
