'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, X, SlidersHorizontal } from 'lucide-react'
import { useStore } from '@/lib/store'
import { ScriptCard } from '@/components/ScriptCard'
import { ScriptEditor } from '@/components/ScriptEditor'
import type { Script } from '@/lib/types'
import { v4 as uuid } from 'uuid'

const STATUSES = ['draft', 'ready', 'shot'] as const

export default function ScriptsPage() {
  const { scripts, addScript, deleteScript } = useStore()
  const [search, setSearch]       = useState('')
  const [filterStatus, setStatus] = useState('')
  const [filterOpen, setFilter]   = useState(false)
  const [editing, setEditing]     = useState<Script | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)

  const filtered = useMemo(() => {
    let s = scripts
    if (search) s = s.filter(x => x.title.toLowerCase().includes(search.toLowerCase()))
    if (filterStatus) s = s.filter(x => x.status === filterStatus)
    return s
  }, [scripts, search, filterStatus])

  function createNew() {
    const now = new Date().toISOString()
    const s: Script = {
      id: uuid(), title: 'Untitled Script', category: '', status: 'draft',
      content: '', visualRefs: [], music: [],
      createdAt: now, updatedAt: now,
    }
    addScript(s)
    setEditing(s)
    setEditorOpen(true)
  }

  return (
    <div className="min-h-screen bg-ig-bg">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-ig-bg/95 backdrop-blur-md border-b border-ig-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <h1 className="font-bold text-lg flex-shrink-0">Scripts</h1>
          <div className="flex-1 flex items-center gap-2 bg-ig-card border border-ig-border rounded-xl px-3 py-2 focus-within:border-ig-blue transition-colors">
            <Search size={15} className="text-ig-faint" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search scripts…"
              className="flex-1 bg-transparent text-sm text-ig-text placeholder-ig-faint outline-none"
            />
            {search && <button onClick={() => setSearch('')}><X size={13} className="text-ig-faint hover:text-ig-text" /></button>}
          </div>
          <button
            onClick={() => setFilter(v => !v)}
            className={`p-2.5 rounded-xl border transition-colors ${filterStatus ? 'border-ig-blue text-ig-blue bg-ig-blue/10' : 'border-ig-border text-ig-muted hover:text-ig-text hover:bg-ig-hover'}`}
          >
            <SlidersHorizontal size={18} />
          </button>
          <button
            onClick={createNew}
            className="flex items-center gap-2 bg-ig-blue hover:bg-ig-blue-hover text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm flex-shrink-0"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Script</span>
          </button>
        </div>

        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-ig-border"
            >
              <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2">
                <button
                  onClick={() => setStatus('')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-colors ${!filterStatus ? 'bg-ig-text text-ig-bg' : 'bg-ig-card border border-ig-border text-ig-muted hover:text-ig-text'}`}
                >
                  All
                </button>
                {STATUSES.map(st => (
                  <button
                    key={st}
                    onClick={() => setStatus(s => s === st ? '' : st)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 capitalize transition-colors ${filterStatus === st ? 'bg-ig-blue text-white' : 'bg-ig-card border border-ig-border text-ig-muted hover:text-ig-text'}`}
                  >
                    {st === 'ready' ? 'Ready to shoot' : st}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-2xl bg-ig-card border border-ig-border flex items-center justify-center mb-4">
              <Plus size={32} className="text-ig-faint" />
            </div>
            <p className="font-bold text-lg mb-2">
              {scripts.length === 0 ? 'No scripts yet' : 'No results'}
            </p>
            <p className="text-ig-muted text-sm mb-6 max-w-xs">
              {scripts.length === 0 ? 'Start writing your first script with the full editor.' : 'Try clearing the filter.'}
            </p>
            {scripts.length === 0 && (
              <button onClick={createNew} className="bg-ig-blue hover:bg-ig-blue-hover text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
                Write first script
              </button>
            )}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            <AnimatePresence>
              {filtered.map(s => (
                <ScriptCard
                  key={s.id}
                  script={s}
                  onClick={sc => { setEditing(sc); setEditorOpen(true) }}
                  onDelete={deleteScript}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <ScriptEditor
        script={editing}
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setTimeout(() => setEditing(null), 300) }}
      />
    </div>
  )
}
