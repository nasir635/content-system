'use client'
import { useState, useMemo } from 'react'
import { Search, X, Camera } from 'lucide-react'
import { useStore } from '@/lib/store'
import { ContentCard } from '@/components/ContentCard'
import { AddContentModal } from '@/components/AddContentModal'
import { DissectionModal } from '@/components/DissectionModal'
import type { Dissection } from '@/lib/types'

function StoryBubble({
  item,
  onClick,
}: {
  item: Dissection
  onClick: (d: Dissection) => void
}) {
  return (
    <button
      onClick={() => onClick(item)}
      className="flex flex-col items-center gap-1 flex-shrink-0 w-[68px]"
    >
      {/* gradient ring */}
      <div
        className="w-[56px] h-[56px] rounded-full p-[2px] flex-shrink-0"
        style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}
      >
        <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white">
          {item.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-lg font-bold"
              style={{ background: 'linear-gradient(135deg,#833AB4,#FD1D1D,#F77737)' }}
            >
              {item.topic.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
      <span className="text-[10px] text-ig-text text-center w-full truncate px-1 leading-tight">
        {item.topic.split(' ').slice(0, 2).join(' ')}
      </span>
    </button>
  )
}

export default function DissectionsPage() {
  const { dissections, addDissection, deleteDissection, streamlines } = useStore()
  void streamlines // used in AddContentModal
  const [addOpen, setAddOpen]     = useState(false)
  const [selected, setSelected]   = useState<Dissection | null>(null)
  const [search, setSearch]       = useState('')

  const filtered = useMemo(() => {
    if (!search) return dissections
    const q = search.toLowerCase()
    return dissections.filter(d =>
      d.topic.toLowerCase().includes(q) || d.caption?.toLowerCase().includes(q)
    )
  }, [dissections, search])

  const stories = dissections.slice(0, 10)

  return (
    <div className="min-h-screen bg-ig-bg">

      {/* ── Top header — Instagram-style ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-ig-border">

        {/* Title row */}
        <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto">
          <h1 className="text-[16px] font-bold text-ig-text">Dissections</h1>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 text-ig-blue font-semibold text-[14px]"
          >
            <Camera size={20} />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 bg-ig-bg border border-ig-border rounded-lg px-3 py-2">
            <Search size={14} className="text-ig-muted flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              className="flex-1 bg-transparent text-sm text-ig-text placeholder-ig-muted outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <X size={14} className="text-ig-muted" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">

        {/* ── Stories row ── */}
        {stories.length > 0 && (
          <div className="bg-white border-b border-ig-border">
            <div className="flex items-start gap-3 px-4 py-3 overflow-x-auto"
              style={{ scrollbarWidth: 'none' }}>

              {/* Add new bubble */}
              <button
                onClick={() => setAddOpen(true)}
                className="flex flex-col items-center gap-1 flex-shrink-0 w-[68px]"
              >
                <div className="w-[56px] h-[56px] rounded-full border-2 border-ig-border bg-white flex items-center justify-center relative">
                  <div className="w-[18px] h-[18px] rounded-full bg-ig-blue flex items-center justify-center absolute -bottom-0.5 -right-0.5 border-2 border-white">
                    <span className="text-white text-[11px] font-bold leading-none">+</span>
                  </div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
                <span className="text-[10px] text-ig-text text-center">New</span>
              </button>

              {stories.map(d => (
                <StoryBubble key={d.id} item={d} onClick={setSelected} />
              ))}
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {dissections.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 rounded-full border-2 border-ig-text flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.5" strokeLinecap="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-ig-text">Share Reels</p>
              <p className="text-ig-muted text-sm mt-1">Paste an Instagram link to dissect it</p>
            </div>
            <button
              onClick={() => setAddOpen(true)}
              className="text-ig-blue font-semibold text-sm"
            >
              Add your first
            </button>
          </div>
        )}

        {/* ── Instagram Explore-style 3-column grid ── */}
        {filtered.length > 0 && (
          <div
            className="grid gap-[3px]"
            style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
          >
            {filtered.map(d => (
              <ContentCard
                key={d.id}
                item={d}
                onClick={setSelected}
                onDelete={deleteDissection}
              />
            ))}
          </div>
        )}

        {filtered.length === 0 && search && (
          <div className="flex flex-col items-center py-16 gap-2">
            <Search size={32} className="text-ig-faint" />
            <p className="text-ig-muted text-sm">No results for &ldquo;{search}&rdquo;</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddContentModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        streamlines={streamlines}
        onSuccess={d => { addDissection(d); setAddOpen(false) }}
      />
      {selected && (
        <DissectionModal
          item={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
