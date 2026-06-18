'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Masonry from 'react-masonry-css'
import { useStore } from '@/lib/store'
import { AddInspirationModal } from '@/components/AddInspirationModal'
import type { Inspiration } from '@/lib/types'

const BREAKPOINT_COLS = { default: 3, 1024: 2, 640: 1 }

function label(i: Inspiration): string {
  if (i.title) return i.title
  if (i.howToUse) return i.howToUse.slice(0, 60)
  try { return new URL(i.url).hostname.replace('www.', '') } catch { return i.url }
}

function InspirationCard({ item, onClick, onDelete }: {
  item: Inspiration; onClick: () => void; onDelete: (id: string) => void
}) {
  const cover = item.screenshots?.[0]?.imageUrl
  const date = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return (
    <div className="glossy-card cursor-pointer group" onClick={onClick}>
      <div className="relative" style={{ minHeight: 180 }}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="w-full object-cover" style={{ display: 'block', minHeight: 180, maxHeight: 280 }} draggable={false} />
        ) : (
          <div className="w-full flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #516F90 0%, #CBD6E2 100%)', minHeight: 180 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" strokeLinecap="round">
              <path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 015 11.95V17a1 1 0 01-1 1H8a1 1 0 01-1-1v-3.05A7 7 0 0112 2z"/>
            </svg>
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(20,30,42,0.7) 0%, rgba(20,30,42,0.06) 55%, transparent 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
          <h3 className="font-bold text-white leading-tight" style={{ fontSize: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
            {label(item)}
          </h3>
        </div>
        {item.screenshots?.length > 0 && (
          <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.85)', color: '#33475B' }}>
            {item.screenshots.length} shot{item.screenshots.length > 1 ? 's' : ''}
          </span>
        )}
        <button
          className="absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
          style={{ background: 'rgba(20,20,20,0.6)', backdropFilter: 'blur(6px)' }}
          onClick={e => { e.stopPropagation(); onDelete(item.id) }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/>
          </svg>
        </button>
      </div>
      <div className="px-4 pt-3 pb-4 bg-white">
        {item.howToUse && (
          <p className="mb-3 leading-relaxed" style={{ fontSize: 12, color: '#516F90', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
            {item.howToUse}
          </p>
        )}
        <div className="flex items-center justify-between mb-3">
          <span className="chip capitalize">{item.category}</span>
          <span style={{ fontSize: 11, color: '#99ACC2' }}>{date}</span>
        </div>
        <button className="glossy-btn w-full" onClick={e => { e.stopPropagation(); onClick() }}>
          Open
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6 }}>
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function InspirationsPage() {
  const { inspirations, addInspiration, addReference, deleteInspiration } = useStore()
  const router = useRouter()
  const [search, setSearch]       = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [addOpen, setAddOpen]     = useState(false)

  const categories = useMemo(() =>
    Array.from(new Set(inspirations.map(i => i.category).filter(Boolean))).sort()
  , [inspirations])

  const filtered = useMemo(() => {
    let list = inspirations
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(i => i.howToUse.toLowerCase().includes(q) || i.url.toLowerCase().includes(q) || (i.title ?? '').toLowerCase().includes(q) || i.tags.some(t => t.toLowerCase().includes(q)))
    }
    if (filterCat) list = list.filter(i => i.category === filterCat)
    return list
  }, [inspirations, search, filterCat])

  return (
    <div className="min-h-screen" style={{ background: '#F5F8FA' }}>
      <div className="sticky top-0 z-30" style={{ background: 'rgba(245,239,235,0.94)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid #DFE3EB' }}>
        <div className="flex items-center justify-between px-5 py-4 max-w-5xl mx-auto">
          <h1 className="font-bold text-[18px]" style={{ color: '#33475B' }}>Inspirations</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#FFFFFF', border: '1.5px solid #DFE3EB', minWidth: 180 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7C98B6" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inspirations…" className="flex-1 bg-transparent outline-none text-sm" style={{ color: '#33475B' }} />
              {search && (
                <button onClick={() => setSearch('')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7C98B6" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
            <button className="cs-btn flex items-center gap-1.5" onClick={() => setAddOpen(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Inspiration
            </button>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="px-5 pb-3 max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <button onClick={() => setFilterCat('')} className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{ background: !filterCat ? '#33475B' : 'rgba(200,217,230,0.3)', color: !filterCat ? '#FFFFFF' : '#516F90', border: `1px solid ${!filterCat ? '#33475B' : '#DFE3EB'}` }}>All</button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilterCat(prev => prev === cat ? '' : cat)} className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
                style={{ background: filterCat === cat ? '#516F90' : 'rgba(200,217,230,0.3)', color: filterCat === cat ? '#FFFFFF' : '#516F90', border: `1px solid ${filterCat === cat ? '#516F90' : '#DFE3EB'}` }}>{cat}</button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-32 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#EAF0F6' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#516F90" strokeWidth="1.5" strokeLinecap="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 015 11.95V17a1 1 0 01-1 1H8a1 1 0 01-1-1v-3.05A7 7 0 0112 2z"/></svg>
            </div>
            <p className="text-sm font-semibold" style={{ color: '#33475B' }}>{inspirations.length === 0 ? 'No inspirations yet' : 'No results'}</p>
            <p className="text-xs" style={{ color: '#7C98B6' }}>{inspirations.length === 0 ? 'Paste a reel or any link, note how you’ll use it, and add reference shots.' : 'Try clearing the filter.'}</p>
            {inspirations.length === 0 && <button className="cs-btn mt-1" onClick={() => setAddOpen(true)}>Add first inspiration</button>}
          </div>
        ) : (
          <Masonry breakpointCols={BREAKPOINT_COLS} className="my-masonry-grid" columnClassName="my-masonry-grid-column">
            {filtered.map(i => (
              <InspirationCard key={i.id} item={i} onClick={() => router.push(`/inspirations/${i.id}`)} onDelete={deleteInspiration} />
            ))}
          </Masonry>
        )}
      </div>

      <AddInspirationModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={(inspiration, refs) => {
          addInspiration(inspiration)
          refs.forEach(addReference)
          setAddOpen(false)
        }}
      />
    </div>
  )
}
