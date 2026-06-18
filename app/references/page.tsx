'use client'
import { useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Masonry from 'react-masonry-css'
import { useStore } from '@/lib/store'
import { ReferenceCard } from '@/components/ReferenceCard'
import type { Reference } from '@/lib/types'
import { v4 as uuid } from 'uuid'

const BREAKPOINT_COLS = { default: 3, 1024: 2, 640: 1 }

export default function ReferencesPage() {
  const { references, addReference, deleteReference } = useStore()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [search, setSearch]       = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [addOpen, setAddOpen]     = useState(false)

  // Derive unique categories from existing references
  const categories = useMemo(() =>
    Array.from(new Set(references.map(r => r.category).filter(Boolean))).sort()
  , [references])

  const filtered = useMemo(() => {
    let r = references
    if (search)    r = r.filter(x => x.title.toLowerCase().includes(search.toLowerCase()) || x.note.toLowerCase().includes(search.toLowerCase()))
    if (filterCat) r = r.filter(x => x.category === filterCat)
    return r
  }, [references, search, filterCat])

  // ── Add modal state ──
  const [form, setForm] = useState({
    title: '', imageUrl: '', note: '', category: '', tags: '',
  })
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview]     = useState('')

  function resetForm() {
    setForm({ title: '', imageUrl: '', note: '', category: '', tags: '' })
    setPreview('')
    setAddOpen(false)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    // Upload to Vercel Blob
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/references/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const { url } = await res.json()
        setForm(f => ({ ...f, imageUrl: url }))
      } else {
        // Fallback: use base64 data URL for local-only storage
        setForm(f => ({ ...f, imageUrl: preview }))
      }
    } catch {
      setForm(f => ({ ...f, imageUrl: preview }))
    }
    setUploading(false)
  }

  function handleUrlBlur() {
    if (form.imageUrl.startsWith('http')) setPreview(form.imageUrl)
  }

  function saveReference() {
    if (!form.title.trim()) return
    const now = new Date().toISOString()
    const r: Reference = {
      id: uuid(),
      title: form.title.trim(),
      imageUrl: form.imageUrl || preview,
      note: form.note.trim(),
      category: form.category.trim().toLowerCase(),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: now,
      updatedAt: now,
    }
    addReference(r)
    resetForm()
  }

  return (
    <div className="min-h-screen" style={{ background: '#F5F8FA' }}>

      {/* ── TOP HEADER ── */}
      <div
        className="sticky top-0 z-30"
        style={{
          background: 'rgba(245,239,235,0.94)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #DFE3EB',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 max-w-5xl mx-auto">
          <h1 className="font-bold text-[18px]" style={{ color: '#33475B' }}>References</h1>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: '#FFFFFF', border: '1.5px solid #DFE3EB', minWidth: 180 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7C98B6" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search references…"
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: '#33475B' }}
              />
              {search && (
                <button onClick={() => setSearch('')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7C98B6" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
            <button className="cs-btn flex items-center gap-1.5" onClick={() => setAddOpen(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Reference
            </button>
          </div>
        </div>

        {/* Category filter pills */}
        {categories.length > 0 && (
          <div className="px-5 pb-3 max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setFilterCat('')}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: !filterCat ? '#33475B' : 'rgba(200,217,230,0.3)',
                color:      !filterCat ? '#FFFFFF'  : '#516F90',
                border:     `1px solid ${!filterCat ? '#33475B' : '#DFE3EB'}`,
              }}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(prev => prev === cat ? '' : cat)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
                style={{
                  background: filterCat === cat ? '#516F90' : 'rgba(200,217,230,0.3)',
                  color:      filterCat === cat ? '#FFFFFF'  : '#516F90',
                  border:     `1px solid ${filterCat === cat ? '#516F90' : '#DFE3EB'}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── GRID ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-32 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#EAF0F6' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#516F90" strokeWidth="1.5" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <p className="text-sm font-semibold" style={{ color: '#33475B' }}>
              {references.length === 0 ? 'No references yet' : 'No results'}
            </p>
            <p className="text-xs" style={{ color: '#7C98B6' }}>
              {references.length === 0 ? 'Save images here with notes on how to use them.' : 'Try clearing the filter.'}
            </p>
            {references.length === 0 && (
              <button className="cs-btn mt-1" onClick={() => setAddOpen(true)}>Add first reference</button>
            )}
          </div>
        ) : (
          <Masonry
            breakpointCols={BREAKPOINT_COLS}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid-column"
          >
            {filtered.map(r => (
              <ReferenceCard
                key={r.id}
                item={r}
                onClick={ref => router.push(`/references/${ref.id}`)}
                onDelete={deleteReference}
              />
            ))}
          </Masonry>
        )}
      </div>

      {/* ── ADD MODAL ── */}
      {addOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(47,65,86,0.5)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) resetForm() }}
        >
          <div
            className="w-full max-w-lg rounded-[24px] overflow-hidden"
            style={{
              background: '#F5F8FA',
              border: '1px solid #DFE3EB',
              boxShadow: '0 24px 64px rgba(47,65,86,0.25)',
            }}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid #DFE3EB' }}
            >
              <h2 className="font-bold text-[15px]" style={{ color: '#33475B' }}>Add Reference</h2>
              <button onClick={resetForm} style={{ color: '#7C98B6' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* Image upload / URL */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#7C98B6' }}>Image</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {preview || form.imageUrl ? (
                  <div className="relative rounded-[14px] overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview || form.imageUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(47,65,86,0.8)' }}
                      onClick={() => { setPreview(''); setForm(f => ({ ...f, imageUrl: '' })) }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                    {uploading && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(47,65,86,0.5)' }}>
                        <span className="text-white text-sm font-semibold">Uploading…</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="flex-1 flex flex-col items-center justify-center gap-2 rounded-[14px] py-6 transition-all"
                      style={{ background: '#FFFFFF', border: '1.5px dashed #DFE3EB' }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C98B6" strokeWidth="1.5" strokeLinecap="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span className="text-xs font-semibold" style={{ color: '#7C98B6' }}>Upload image</span>
                    </button>
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-xs" style={{ color: '#7C98B6' }}>Or paste URL</label>
                      <input
                        className="cs-input"
                        placeholder="https://…"
                        value={form.imageUrl}
                        onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                        onBlur={handleUrlBlur}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#7C98B6' }}>Title *</label>
                <input
                  className="cs-input"
                  placeholder="e.g. Cinematic close-up shot"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              {/* Note */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#7C98B6' }}>Note — where / how to use it</label>
                <textarea
                  className="cs-input resize-none"
                  rows={3}
                  placeholder="e.g. Use for dramatic product reveal, works best with slow zoom in…"
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#7C98B6' }}>Category</label>
                <input
                  className="cs-input"
                  placeholder="e.g. cinematics, lighting, transitions…"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  list="cat-suggestions"
                />
                {categories.length > 0 && (
                  <datalist id="cat-suggestions">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#7C98B6' }}>Tags (comma separated)</label>
                <input
                  className="cs-input"
                  placeholder="e.g. close-up, product, dramatic"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid #DFE3EB' }}>
              <button className="cs-btn-outline flex-1 py-2.5 rounded-[10px] text-sm font-semibold" onClick={resetForm}>Cancel</button>
              <button
                className="cs-btn flex-1 py-2.5 rounded-[10px] text-sm"
                onClick={saveReference}
                disabled={!form.title.trim()}
              >
                Save Reference
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
