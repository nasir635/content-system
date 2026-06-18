'use client'
import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { ScriptEditor } from '@/components/ScriptEditor'
import { CoverImage } from '@/components/CoverImage'
import type { Reference, Script } from '@/lib/types'
import { v4 as uuid } from 'uuid'

export default function InspirationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const {
    inspirations, scripts, references, categories,
    updateInspiration, deleteInspiration, addReference, addScript,
  } = useStore()

  const item = inspirations.find(i => i.id === id)

  const linkedScripts = scripts.filter(s => s.inspirationId === id)
  const linkedRefs = references.filter(
    r => r.inspirationId === id || (item?.screenshots ?? []).some(s => s.refId === r.id || s.id === r.id)
  )

  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null)
  const [editingHowTo, setEditingHowTo] = useState(false)
  const [howTo, setHowTo] = useState(item?.howToUse ?? '')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [editingMeta, setEditingMeta] = useState(false)
  const [mTitle, setMTitle] = useState(item?.title ?? '')
  const [mCategory, setMCategory] = useState(item?.category ?? '')
  const [mTags, setMTags] = useState((item?.tags ?? []).join(', '))

  useEffect(() => {
    if (!selectedScriptId && linkedScripts.length) setSelectedScriptId(linkedScripts[0].id)
  }, [linkedScripts, selectedScriptId])

  useEffect(() => { setHowTo(item?.howToUse ?? '') }, [item?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#F5F8FA' }}>
        <p className="font-bold text-lg" style={{ color: '#33475B' }}>Inspiration not found</p>
        <button className="cs-btn" onClick={() => router.push('/inspirations')}>← Back to Inspirations</button>
      </div>
    )
  }

  const selectedScript = linkedScripts.find(s => s.id === selectedScriptId) ?? null

  function createScript() {
    const now = new Date().toISOString()
    const s: Script = {
      id: uuid(),
      title: item!.title || 'Script from inspiration',
      category: item!.category,
      status: 'draft',
      content: '',
      visualRefs: [],
      music: [],
      inspirationId: item!.id,
      createdAt: now,
      updatedAt: now,
    }
    addScript(s)
    setSelectedScriptId(s.id)
  }

  function saveHowTo() {
    updateInspiration(item!.id, { howToUse: howTo, updatedAt: new Date().toISOString() })
    setEditingHowTo(false)
  }

  function startMeta() {
    setMTitle(item!.title ?? '')
    setMCategory(item!.category ?? '')
    setMTags((item!.tags ?? []).join(', '))
    setEditingMeta(true)
  }
  function saveMeta() {
    updateInspiration(item!.id, {
      title: mTitle.trim() || undefined,
      category: mCategory,
      tags: mTags.split(',').map(t => t.trim()).filter(Boolean),
      updatedAt: new Date().toISOString(),
    })
    setEditingMeta(false)
  }

  async function handleAddShots(files: FileList) {
    setUploading(true)
    const now = new Date().toISOString()
    const newShots: { id: string; imageUrl: string; title: string; note: string; savedToRefs: boolean; refId: string }[] = []

    for (const file of Array.from(files)) {
      let imageUrl = ''
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/references/upload', { method: 'POST', body: fd })
        if (res.ok) imageUrl = (await res.json()).url
      } catch { /* fall through */ }
      if (!imageUrl) {
        imageUrl = await new Promise<string>(resolve => {
          const reader = new FileReader()
          reader.onload = ev => resolve(ev.target?.result as string)
          reader.readAsDataURL(file)
        })
      }
      const refId = uuid()
      const ref: Reference = {
        id: refId,
        title: 'Inspiration shot',
        imageUrl,
        note: '',
        category: item!.category,
        tags: item!.tags,
        source: 'inspiration',
        inspirationId: item!.id,
        sourceUrl: item!.url,
        createdAt: now,
        updatedAt: now,
      }
      addReference(ref)
      newShots.push({ id: refId, imageUrl, title: '', note: '', savedToRefs: true, refId })
    }

    // Merge all new shots in a single update (avoids stale-closure clobbering).
    if (newShots.length) {
      updateInspiration(item!.id, {
        screenshots: [...item!.screenshots, ...newShots],
        updatedAt: now,
      })
    }
    setUploading(false)
  }

  return (
    <div className="min-h-screen" style={{ background: '#F5F8FA' }}>

      {/* Top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-3"
        style={{ background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid #DFE3EB' }}>
        <button className="flex items-center gap-2 font-semibold text-sm" style={{ color: '#516F90' }} onClick={() => router.push('/inspirations')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#516F90" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        <h1 className="font-bold text-sm text-center flex-1 px-4 truncate" style={{ color: '#33475B' }}>
          {item.title || item.howToUse?.slice(0, 50) || 'Inspiration'}
        </h1>
        <button
          className="text-xs font-semibold flex items-center gap-1.5"
          style={{ color: '#B04A4A' }}
          onClick={() => { if (confirm('Delete this inspiration? Its reference shots stay in your library.')) { deleteInspiration(item.id); router.push('/inspirations') } }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
          Delete
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Cover */}
        <CoverImage
          value={item.coverImage}
          onChange={(url) => updateInspiration(item.id, { coverImage: url, updatedAt: new Date().toISOString() })}
          onRemove={() => updateInspiration(item.id, { coverImage: undefined, updatedAt: new Date().toISOString() })}
        />

        {/* Source link + meta */}
        <div className="glass-card p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="chip capitalize">{item.category || 'uncategorized'}</span>
              {item.tags.map(t => (
                <span key={t} className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(86,124,141,0.12)', color: '#516F90' }}>#{t.replace(/^#/, '')}</span>
              ))}
            </div>
            {!editingMeta
              ? <button className="text-xs font-semibold flex-shrink-0" style={{ color: '#516F90' }} onClick={startMeta}>Edit</button>
              : <button className="text-xs font-semibold flex-shrink-0" style={{ color: '#516F90' }} onClick={saveMeta}>Save</button>}
          </div>

          {editingMeta ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#7C98B6' }}>Title</label>
                <input className="cs-input" value={mTitle} onChange={e => setMTitle(e.target.value)} placeholder="Optional title" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#7C98B6' }}>Category</label>
                  <select className="cs-input" value={mCategory} onChange={e => setMCategory(e.target.value)}>
                    <option value="">Uncategorized</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#7C98B6' }}>Tags</label>
                  <input className="cs-input" value={mTags} onChange={e => setMTags(e.target.value)} placeholder="comma, separated" />
                </div>
              </div>
            </div>
          ) : null}

          <a href={item.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-semibold hover:underline break-all mt-3" style={{ color: '#33475B' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#516F90" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
            {item.url}
          </a>
        </div>

        {/* How to use */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[13px] uppercase tracking-wider" style={{ color: '#7C98B6' }}>How I’ll use this</h3>
            {!editingHowTo
              ? <button className="text-xs font-semibold" style={{ color: '#516F90' }} onClick={() => setEditingHowTo(true)}>Edit</button>
              : <button className="text-xs font-semibold" style={{ color: '#516F90' }} onClick={saveHowTo}>Save</button>}
          </div>
          {editingHowTo ? (
            <textarea value={howTo} onChange={e => setHowTo(e.target.value)} rows={4} autoFocus
              className="cs-input w-full resize-none" placeholder="How will you use this idea?" />
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#33475B' }}>
              {item.howToUse || <span style={{ color: '#99ACC2' }}>No notes yet — click Edit.</span>}
            </p>
          )}
        </div>

        {/* Reference shots */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[13px] uppercase tracking-wider" style={{ color: '#7C98B6' }}>
              Reference Shots {linkedRefs.length > 0 && `(${linkedRefs.length})`}
            </h3>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files && handleAddShots(e.target.files)} />
            <button className="text-xs font-semibold flex items-center gap-1" style={{ color: '#516F90' }} onClick={() => fileRef.current?.click()} disabled={uploading}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {uploading ? 'Uploading…' : 'Add shots'}
            </button>
          </div>
          {linkedRefs.length === 0 ? (
            <p className="text-xs" style={{ color: '#99ACC2' }}>No reference shots yet — add some. They’ll also appear in your References tab.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {linkedRefs.map(r => (
                <button key={r.id} onClick={() => router.push(`/references/${r.id}`)} className="rounded-md overflow-hidden text-left" style={{ border: '1px solid #DFE3EB', background: '#FFFFFF' }}>
                  <div style={{ height: 88, background: '#EAF0F6' }}>
                    {r.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.imageUrl} alt={r.title} className="w-full h-full object-cover" draggable={false} />
                    )}
                  </div>
                  {r.title && <p className="px-2 py-1.5 text-[11px] font-semibold truncate" style={{ color: '#33475B' }}>{r.title}</p>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Script */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 className="font-bold text-[13px] uppercase tracking-wider" style={{ color: '#7C98B6' }}>Script</h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              {linkedScripts.map(s => (
                <button key={s.id} onClick={() => setSelectedScriptId(s.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold truncate"
                  style={{ maxWidth: 160, background: s.id === selectedScriptId ? '#33475B' : 'rgba(200,217,230,0.35)', color: s.id === selectedScriptId ? '#FFF' : '#516F90', border: `1px solid ${s.id === selectedScriptId ? '#33475B' : '#DFE3EB'}` }}>
                  {s.title || 'Untitled'}
                </button>
              ))}
              <button onClick={createScript} className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1" style={{ background: 'rgba(86,124,141,0.12)', color: '#516F90', border: '1px solid #DFE3EB' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                New
              </button>
            </div>
          </div>

          {selectedScript ? (
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #DFE3EB', height: '74vh' }}>
              <ScriptEditor key={selectedScript.id} script={selectedScript} />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center rounded-md" style={{ border: '1.5px dashed #CBD6E2', background: '#FAFBFC' }}>
              <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: '#EAF0F6' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#516F90" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#33475B' }}>Write the script for this inspiration</p>
                <p className="text-xs mt-1" style={{ color: '#7C98B6' }}>Opens the full editor — formatting, reference shots, and music — right here. Syncs to your Scripts tab.</p>
              </div>
              <button className="cs-btn" onClick={createScript}>Open script editor</button>
            </div>
          )}
        </div>

        <div className="h-8" />
      </div>
    </div>
  )
}
