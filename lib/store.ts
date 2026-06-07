import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Inspiration, Script, Streamline, Reference, Dissection } from './types'

interface AppState {
  inspirations: Inspiration[]
  dissections:  Dissection[]
  scripts:      Script[]
  streamlines:  Streamline[]
  references:   Reference[]

  addInspiration:    (i: Inspiration) => void
  updateInspiration: (id: string, i: Partial<Inspiration>) => void
  deleteInspiration: (id: string) => void

  addDissection:    (d: Dissection) => void
  deleteDissection: (id: string) => void

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

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      inspirations: [],
      dissections:  [],
      scripts:      [],
      streamlines:  [],
      references:   [],

      addInspiration: (i) => set(s => ({ inspirations: [i, ...s.inspirations] })),
      updateInspiration: (id, i) => set(s => ({
        inspirations: s.inspirations.map(x => x.id === id ? { ...x, ...i } : x),
      })),
      deleteInspiration: (id) => set(s => ({
        inspirations: s.inspirations.filter(x => x.id !== id),
      })),

      addDissection: (d) => set(s => ({ dissections: [d, ...s.dissections] })),
      deleteDissection: (id) => set(s => ({
        dissections: s.dissections.filter(x => x.id !== id),
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
    }),
    { name: 'content-system-store' }
  )
)
