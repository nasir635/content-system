'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import { useStore } from '@/lib/store'
import { ContentCard } from '@/components/ContentCard'
import { AddContentModal } from '@/components/AddContentModal'
import { DissectionModal } from '@/components/DissectionModal'
import { CONTENT_CATEGORIES } from '@/lib/types'
import type { Dissection } from '@/lib/types'

export default function DissectionsPage() {
  const { dissections, addDissection, deleteDissection, streamlines } = useStore()
  const [addOpen, setAddOpen]         = useState(false)
  const [selected, setSelected]       = useState<Dissection | null>(null)
  const [search, setSearch]           = useState('')
  const [filterCat, setFilterCat]     = useState('')
  const [filterOpen, setFilterOpen]   = useState(false)

  const filtered = useMemo(() => {
    let d = dissections
    if (search) d = d.filter(x =>
      x.topic.toLowerCase().includes(search.toLowerCase()) ||
      x.caption.toLowerCase().includes(search.toLowerCase())
    )
    if (filterCat) d = d.filter(x => x.category === filterCat)
    return d
  }, [dissections, search, filterCat])

  return (
    <div className="min-h-screen bg-ig-bg">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-ig-bg/95 backdrop-blur-md border-b border-ig-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <h1 className="font-bold text-lg flex-shrink-0">Dissections</h1>
          <div className="flex-1 flex items-center gap-2 bg-ig-card border border-ig-border rounded-xl px-3 py-2 focus-within:border-ig-blue transition-colors">
            <Search size={15} className="text-ig-faint" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search dissections…"
              className="flex-1 bg-transparent text-sm text-ig-text placeholder-ig-faint outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <X size={13} className="text-ig-faint hover:text-ig-text" />
              </button>
            )}
          </div>
          <button
            onClick={() => setFilterOpen(v => !v)}
            className={`p-2.5 rounded-xl border transition-colors ${filterCat ? 'border-ig-blue text-ig-blue bg-ig-blue/10' : 'border-ig-border text-ig-muted hover:text-ig-text hover:bg-ig-hover'}`}
          >
            <SlidersHorizontal size={18} />
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 bg-ig-blue hover:bg-ig-blue-hover text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm flex-shrink-0"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Dissect</span>
          </button>
        </div>

        {/* Category filter row */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-ig-border"
            >
              <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setFilterCat('')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-colors ${!filterCat ? 'bg-ig-text text-ig-bg' : 'bg-ig-card border border-ig-border text-ig-muted hover:text-ig-text'}`}
                >
                  All
                </button>
                {CONTENT_CATEGORIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setFilterCat(c === filterCat ? '' : c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 capitalize transition-colors ${filterCat === c ? 'bg-ig-blue text-white' : 'bg-ig-card border border-ig-border text-ig-muted hover:text-ig-text'}`}
                  >
                    {c}
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
              {dissections.length === 0 ? 'No dissections yet' : 'No results'}
            </p>
            <p className="text-ig-muted text-sm mb-6 max-w-xs">
              {dissections.length === 0
                ? 'Paste an Instagram URL and Claude will dissect it for you.'
                : 'Try a different search or clear the filter.'}
            </p>
            {dissections.length === 0 && (
              <button
                onClick={() => setAddOpen(true)}
                className="bg-ig-blue hover:bg-ig-blue-hover text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
              >
                Add first dissection
              </button>
            )}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
          >
            <AnimatePresence>
              {filtered.map(item => (
                <ContentCard
                  key={item.id}
                  item={item}
                  onClick={setSelected}
                  onDelete={deleteDissection}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AddContentModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        streamlines={streamlines}
        onSuccess={addDissection}
      />

      <DissectionModal
        item={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
