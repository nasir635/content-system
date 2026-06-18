'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-5">
      <h3 className="font-bold text-[13px] uppercase tracking-wider mb-4" style={{ color: '#7C98B6' }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function ReferenceDetailPage() {
  const { id }  = useParams<{ id: string }>()
  const router  = useRouter()
  const { references, updateReference, deleteReference } = useStore()

  const [editing, setEditing]   = useState(false)
  const [noteVal, setNoteVal]   = useState('')
  const [catVal, setCatVal]     = useState('')
  const [titleVal, setTitleVal] = useState('')

  const item = references.find(r => r.id === id)

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#F5F8FA' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#EAF0F6' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#516F90" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p className="font-bold text-lg" style={{ color: '#33475B' }}>Reference not found</p>
        <button className="cs-btn" onClick={() => router.push('/references')}>← Back to References</button>
      </div>
    )
  }

  const date = new Date(item.updatedAt ?? item.createdAt).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  function startEdit() {
    setTitleVal(item?.title ?? '')
    setNoteVal(item?.note ?? '')
    setCatVal(item?.category ?? '')
    setEditing(true)
  }

  function saveEdit() {
    if (!item) return
    updateReference(item.id, {
      title:    titleVal.trim() || item.title,
      note:     noteVal.trim(),
      category: catVal.trim().toLowerCase(),
      updatedAt: new Date().toISOString(),
    })
    setEditing(false)
  }

  function handleDelete() {
    if (!item) return
    deleteReference(item.id)
    router.push('/references')
  }

  return (
    <div className="min-h-screen" style={{ background: '#F5F8FA' }}>

      {/* ── TOP BAR ── */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-5 py-3"
        style={{
          background: 'rgba(245,239,235,0.94)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #DFE3EB',
        }}
      >
        <button
          className="flex items-center gap-2 font-semibold text-sm"
          style={{ color: '#516F90' }}
          onClick={() => router.push('/references')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#516F90" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>

        <h1 className="font-bold text-sm text-center flex-1 px-4 truncate" style={{ color: '#33475B' }}>
          {item.title}
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={startEdit}
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(86,124,141,0.15)', color: '#516F90' }}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(200,100,100,0.12)', color: '#8B4040' }}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── HERO IMAGE ── */}
        <div
          className="rounded-[20px] overflow-hidden relative"
          style={{ boxShadow: '0 8px 40px rgba(47,65,86,0.14)' }}
        >
          {item.imageUrl ? (
            <div className="relative w-full" style={{ maxHeight: 480 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full object-cover"
                style={{ maxHeight: 480 }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 p-5"
                style={{ background: 'linear-gradient(to top, rgba(47,65,86,0.75) 0%, transparent 100%)' }}
              >
                {item.category && <span className="chip capitalize">{item.category}</span>}
                <h2 className="font-bold text-white text-xl mt-2 leading-snug">{item.title}</h2>
                <p className="text-sm mt-1" style={{ color: 'rgba(200,217,230,0.85)' }}>{date}</p>
              </div>
            </div>
          ) : (
            <div
              className="relative w-full flex items-center justify-center"
              style={{ minHeight: 240, background: 'linear-gradient(135deg, #CBD6E2 0%, #516F90 100%)' }}
            >
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                {item.category && <span className="chip capitalize">{item.category}</span>}
                <h2 className="font-bold text-white text-xl mt-2">{item.title}</h2>
              </div>
            </div>
          )}
        </div>

        {/* ── NOTES ── */}
        <SectionCard title="Notes — where to use">
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#7C98B6' }}>Title</label>
                <input
                  className="cs-input"
                  value={titleVal}
                  onChange={e => setTitleVal(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#7C98B6' }}>Note</label>
                <textarea
                  className="cs-input resize-none"
                  rows={4}
                  value={noteVal}
                  onChange={e => setNoteVal(e.target.value)}
                  placeholder="Where or how to use this reference…"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#7C98B6' }}>Category</label>
                <input
                  className="cs-input"
                  value={catVal}
                  onChange={e => setCatVal(e.target.value)}
                  placeholder="e.g. cinematics, lighting…"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button className="cs-btn-outline flex-1 py-2 rounded-[10px] text-sm font-semibold" onClick={() => setEditing(false)}>Cancel</button>
                <button className="cs-btn flex-1 py-2 rounded-[10px] text-sm" onClick={saveEdit}>Save</button>
              </div>
            </div>
          ) : (
            <>
              {item.note ? (
                <p className="text-sm leading-relaxed" style={{ color: '#33475B' }}>{item.note}</p>
              ) : (
                <p className="text-sm" style={{ color: '#7C98B6' }}>No notes yet. Tap Edit to add where / how you plan to use this.</p>
              )}
            </>
          )}
        </SectionCard>

        {/* ── TAGS ── */}
        {item.tags.length > 0 && (
          <SectionCard title="Tags">
            <div className="flex flex-wrap gap-2">
              {item.tags.map(tag => (
                <span key={tag} className="chip capitalize">{tag}</span>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── META ── */}
        <SectionCard title="Details">
          <div className="space-y-0">
            {[
              { k: 'Category', v: item.category || '—' },
              { k: 'Added',    v: date },
              { k: 'Tags',     v: item.tags.join(', ') || '—' },
            ].map(({ k, v }) => (
              <div key={k} className="flex justify-between py-3" style={{ borderBottom: '1px solid #EAF0F6' }}>
                <span className="text-xs" style={{ color: '#7C98B6' }}>{k}</span>
                <span className="text-sm font-medium capitalize" style={{ color: '#33475B' }}>{v}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="h-8" />
      </div>
    </div>
  )
}
