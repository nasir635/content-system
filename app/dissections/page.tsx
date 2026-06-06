'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, X, SlidersHorizontal } from 'lucide-react'
import { useStore } from '@/lib/store'
import { ContentCard } from '@/components/ContentCard'
import { AddContentModal } from '@/components/AddContentModal'
import { DissectionModal } from '@/components/DissectionModal'
import { CONTENT_CATEGORIES } from '@/lib/types'
import type { Dissection } from '@/lib/types'

// Gradient ring colours cycling through Instagram palette
const RING_GRADIENTS = [
  'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
  'linear-gradient(45deg, #bc1888, #cc2366, #dc2743)',
  'linear-gradient(45deg, #f09433, #e6683c, #dc2743)',
  'linear-gradient(45deg, #833AB4, #FD1D1D, #F77737)',
]

function StoryCircle({
  item,
  index,
  onClick,
}: {
  item: Dissection
  index: number
  onClick: (item: Dissection) => void
}) {
  return (
    <button
      onClick={() => onClick(item)}
      className="flex flex-col items-center gap-1.5 flex-shrink-0 w-16"
    >
      <div
        className="w-14 h-14 rounded-full p-[2px]"
        style={{ background: RING_GRADIENTS[index % RING_GRADIENTS.length] }}
      >
        <div className="w-full h-full rounded-full overflow-hidden bg-ig-card border-2 border-black">
          {item.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.thumbnail} alt={item.topic} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ig-faint text-xs font-bold"
              style={{ background: 'linear-gradient(45deg, #1a1a1a, #2a2a2a)' }}>
              {item.topic.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
      <span className="text-[10px] text-ig-muted text-center leading-tight line-clamp-1 w-full px-0.5">
        {item.topic}
      </span>
    </button>
  )
}

export default function DissectionsPage() {
  const { dissections, addDissection, deleteDissection, streamlines } = useStore()
  const [addOpen, setAddOpen]       = useState(false)
  const [selected, setSelected]     = useState<Dissection | null>(null)
  const [search, setSearch]         = useState('')
  const [filterCat, setFilterCat]   = useState('')
  const [filterOpen, setFilterOpen] = useState(false)

  const filtered = useMemo(() => {
    let d = dissections
    if (search) d = d.filter(x =>
      x.topic.toLowerCase().includes(search.toLowerCase()) ||
      x.caption.toLowerCase().includes(search.toLowerCase())
    )
    if (filterCat) d = d.filter(x => x.category === filterCat)
    return d
  }, [dissections, search, filterCat])

  // Most recent 8 for stories row
  const stories = useMemo(() => [...dissections].slice(0, 8), [dissections])

  return (
    <div className="min-h-screen bg-ig-bg">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-ig-bg/95 backdrop-blur-md border-b border-ig-border">
        <div className="flex items-center gap-2 px-3 py-3">
          <h1 className="font-bold text-base flex-shrink-0">Dissections</h1>
          <div className="flex-1 flex items-center gap-2 bg-ig-card border border-ig-border rounded-xl px-3 py-2 focus-within:border-ig-blue transition-colors">
            <Search size={14} className="text-ig-faint flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="flex-1 bg-transparent text-sm text-ig-text placeholder-ig-faint outline-none min-w-0"
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <X size={13} className="text-ig-faint hover:text-ig-text" />
              </button>
            )}
          </div>
          <button
            onClick={() => setFilterOpen(v => !v)}
            className={`p-2 rounded-xl border transition-colors flex-shrink-0 ${
              filterCat
                ? 'border-ig-blue text-ig-blue bg-ig-blue/10'
                : 'border-ig-border text-ig-muted hover:text-ig-text hover:bg-ig-hover'
            }`}
          >
            <SlidersHorizontal size={17} />
          </button>
        </div>

        {/* Category filter chips */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-ig-border"
            >
              <div className="flex items-center gap-2 px-3 py-2.5 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setFilterCat('')}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 transition-colors ${
                    !filterCat ? 'bg-ig-text text-ig-bg' : 'bg-ig-card border border-ig-border text-ig-muted'
                  }`}
                >All</button>
                {CONTENT_CATEGORIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setFilterCat(c === filterCat ? '' : c)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 capitalize transition-colors ${
                      filterCat === c
                        ? 'bg-ig-blue text-white'
                        : 'bg-ig-card border border-ig-border text-ig-muted'
                    }`}
                  >{c}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Stories row ─────────────────────────────────────────────────── */}
      {stories.length > 0 && (
        <div className="border-b border-ig-border">
          <div className="flex items-center gap-4 px-3 py-3 overflow-x-auto scrollbar-hide">
            {/* "New" add button as a story circle */}
            <button
              onClick={() => setAddOpen(true)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 w-16"
            >
              <div className="w-14 h-14 rounded-full bg-ig-card border border-ig-border flex items-center justify-center relative">
                <div
                  className="absolute inset-0 rounded-full p-[2px]"
                  style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
                >
                  <div className="w-full h-full rounded-full bg-ig-bg" />
                </div>
                <Plus size={22} className="text-white relative z-10" />
              </div>
              <span className="text-[10px] text-ig-muted text-center">New</span>
            </button>

            {stories.map((item, i) => (
              <StoryCircle key={item.id} item={item} index={i} onClick={setSelected} />
            ))}
          </div>
        </div>
      )}

      {/* ── Grid ────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center px-6">
          <div className="w-20 h-20 rounded-2xl bg-ig-card border border-ig-border flex items-center justify-center mb-4">
            <Plus size={32} className="text-ig-faint" />
          </div>
          <p className="font-bold text-lg mb-2">
            {dissections.length === 0 ? 'No dissections yet' : 'No results'}
          </p>
          <p className="text-ig-muted text-sm mb-6 max-w-xs">
            {dissections.length === 0
              ? 'Paste an Instagram URL and Gemini will dissect it for you.'
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
        /* Gapless 3-column Instagram Explore grid */
        <motion.div
          layout
          className="grid grid-cols-3 gap-[1px] bg-ig-border"
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

      {/* Floating Action Button — visible when grid has content */}
      {dissections.length > 0 && (
        <button
          onClick={() => setAddOpen(true)}
          className="fixed bottom-20 right-4 md:bottom-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
          style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
          aria-label="Add dissection"
        >
          <Plus size={24} className="text-white" strokeWidth={2.5} />
        </button>
      )}

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
