'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Masonry from 'react-masonry-css'
import { useStore } from '@/lib/store'
import { ContentCard } from '@/components/ContentCard'
import { AddContentModal } from '@/components/AddContentModal'
import type { Dissection } from '@/lib/types'

const BREAKPOINT_COLS = {
  default: 3,
  1024: 2,
  640: 1,
}

function StoryBubble({ item, onClick }: { item: Dissection; onClick: (d: Dissection) => void }) {
  return (
    <button
      onClick={() => onClick(item)}
      className="flex flex-col items-center gap-1.5 flex-shrink-0 w-[68px]"
    >
      <div
        className="w-[54px] h-[54px] rounded-full p-[2.5px]"
        style={{ background: 'linear-gradient(135deg, #567C8D 0%, #C8D9E6 100%)' }}
      >
        <div className="w-full h-full rounded-full overflow-hidden" style={{ border: '2px solid #F5EFEB' }}>
          {item.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #2F4156 0%, #567C8D 100%)' }}
            >
              {item.topic.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
      <span
        className="text-center w-full truncate px-1 leading-tight"
        style={{ fontSize: 10, color: '#567C8D' }}
      >
        {item.topic.split(' ').slice(0, 2).join(' ')}
      </span>
    </button>
  )
}

// Alternate aspect ratios for Pinterest effect
const ASPECT_RATIOS = ['aspect-[3/4]', 'aspect-[4/5]', 'aspect-square', 'aspect-[3/4]', 'aspect-[4/5]', 'aspect-square']

export default function DissectionsPage() {
  const { dissections, addDissection, deleteDissection, streamlines } = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const [search, setSearch]   = useState('')
  const router = useRouter()

  const filtered = useMemo(() => {
    if (!search) return dissections
    const q = search.toLowerCase()
    return dissections.filter(d =>
      d.topic.toLowerCase().includes(q) || d.caption?.toLowerCase().includes(q)
    )
  }, [dissections, search])

  const stories = dissections.slice(0, 10)

  return (
    <div className="min-h-screen" style={{ background: '#F5EFEB' }}>

      {/* Top header */}
      <div
        className="sticky top-0 z-30"
        style={{
          background: 'rgba(245,239,235,0.94)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #D0DDE6',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 max-w-5xl mx-auto">
          <h1 className="font-bold text-[18px]" style={{ color: '#2F4156' }}>Dissections</h1>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: '#FFFFFF', border: '1.5px solid #D0DDE6', minWidth: 180 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8EA7B5" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: '#2F4156' }}
              />
              {search && (
                <button onClick={() => setSearch('')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8EA7B5" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
            {/* Add button */}
            <button
              className="cs-btn flex items-center gap-1.5"
              onClick={() => setAddOpen(true)}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Stories row */}
        {stories.length > 0 && (
          <div
            className="py-4 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-4"
            style={{ borderBottom: '1px solid #D0DDE6' }}
          >
            <div className="flex items-start gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {/* Add new bubble */}
              <button
                onClick={() => setAddOpen(true)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 w-[68px]"
              >
                <div
                  className="w-[54px] h-[54px] rounded-full flex items-center justify-center relative"
                  style={{ background: '#FFFFFF', border: '1.5px solid #D0DDE6' }}
                >
                  <div
                    className="w-[18px] h-[18px] rounded-full flex items-center justify-center absolute -bottom-0.5 -right-0.5"
                    style={{ background: '#2F4156', border: '2px solid #F5EFEB' }}
                  >
                    <span className="text-white font-bold leading-none" style={{ fontSize: 11 }}>+</span>
                  </div>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8EA7B5" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
                <span style={{ fontSize: 10, color: '#8EA7B5' }}>New</span>
              </button>

              {stories.map(d => (
                <StoryBubble
                  key={d.id}
                  item={d}
                  onClick={() => router.push(`/dissections/${d.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {dissections.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: '#E8F0F5' }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#567C8D" strokeWidth="1.5" strokeLinecap="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: '#2F4156' }}>No dissections yet</p>
              <p className="text-sm mt-1" style={{ color: '#8EA7B5' }}>Paste an Instagram link to dissect it</p>
            </div>
            <button className="cs-btn" onClick={() => setAddOpen(true)}>
              Add your first
            </button>
          </div>
        )}

        {/* No search results */}
        {filtered.length === 0 && search && (
          <div className="flex flex-col items-center py-20 gap-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D0DDE6" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <p className="text-sm" style={{ color: '#8EA7B5' }}>No results for &ldquo;{search}&rdquo;</p>
          </div>
        )}

        {/* Masonry grid */}
        {filtered.length > 0 && (
          <div className="py-5">
            <Masonry
              breakpointCols={BREAKPOINT_COLS}
              className="my-masonry-grid"
              columnClassName="my-masonry-grid-column"
            >
              {filtered.map((d, i) => (
                <div key={d.id} className={ASPECT_RATIOS[i % ASPECT_RATIOS.length]}>
                  <ContentCard
                    item={d}
                    onClick={() => router.push(`/dissections/${d.id}`)}
                    onDelete={deleteDissection}
                  />
                </div>
              ))}
            </Masonry>
          </div>
        )}
      </div>

      <AddContentModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        streamlines={streamlines}
        onSuccess={d => { addDissection(d); setAddOpen(false) }}
      />
    </div>
  )
}
