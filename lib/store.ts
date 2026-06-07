import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Dissection, Script, Streamline, Reference } from './types'

interface AppState {
  dissections: Dissection[]
  scripts: Script[]
  streamlines: Streamline[]
  references: Reference[]

  addDissection: (d: Dissection) => void
  updateDissection: (id: string, d: Partial<Dissection>) => void
  deleteDissection: (id: string) => void

  addScript: (s: Script) => void
  updateScript: (id: string, s: Partial<Script>) => void
  deleteScript: (id: string) => void

  addStreamline: (s: Streamline) => void
  updateStreamline: (id: string, s: Partial<Streamline>) => void
  deleteStreamline: (id: string) => void

  addReference: (r: Reference) => void
  updateReference: (id: string, r: Partial<Reference>) => void
  deleteReference: (id: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      dissections: [],
      scripts: [],
      streamlines: [],
      references: [],

      addDissection: (d) => set(s => ({ dissections: [d, ...s.dissections] })),
      updateDissection: (id, d) => set(s => ({
        dissections: s.dissections.map(x => x.id === id ? { ...x, ...d } : x)
      })),
      deleteDissection: (id) => set(s => ({
        dissections: s.dissections.filter(x => x.id !== id)
      })),

      addScript: (sc) => set(s => ({ scripts: [sc, ...s.scripts] })),
      updateScript: (id, sc) => set(s => ({
        scripts: s.scripts.map(x => x.id === id ? { ...x, ...sc } : x)
      })),
      deleteScript: (id) => set(s => ({
        scripts: s.scripts.filter(x => x.id !== id)
      })),

      addStreamline: (st) => set(s => ({ streamlines: [st, ...s.streamlines] })),
      updateStreamline: (id, st) => set(s => ({
        streamlines: s.streamlines.map(x => x.id === id ? { ...x, ...st } : x)
      })),
      deleteStreamline: (id) => set(s => ({
        streamlines: s.streamlines.filter(x => x.id !== id)
      })),

      addReference: (r) => set(s => ({ references: [r, ...s.references] })),
      updateReference: (id, r) => set(s => ({
        references: s.references.map(x => x.id === id ? { ...x, ...r } : x)
      })),
      deleteReference: (id) => set(s => ({
        references: s.references.filter(x => x.id !== id)
      })),
    }),
    { name: 'content-system-store' }
  )
)
