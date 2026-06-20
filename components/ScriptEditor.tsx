'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { buildEditorExtensions } from '@/components/editor/extensions'
import { BubbleToolbar } from '@/components/editor/BubbleToolbar'
import { FontFamilySelect, FontSizeSelect, LineSpacingSelect, ColorControl } from '@/components/editor/ToolbarControls'
import { printScriptPdf } from '@/components/editor/exportPdf'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { toast } from '@/lib/toast'
import { CoverImage } from '@/components/CoverImage'
import type { Script, VisualRef, MusicEntry, Reference, ScriptComment } from '@/lib/types'
import { CATEGORY_COLORS } from '@/lib/types'
import { v4 as uuid } from 'uuid'

/* ── Toolbar button ─────────────────────────────────────── */
function TB({
  active, onMouseDown, children, title,
}: {
  active?: boolean; onMouseDown: () => void; children: React.ReactNode; title?: string
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onMouseDown() }}
      className="flex items-center justify-center rounded transition-colors"
      style={{
        width: 28, height: 28,
        background: active ? '#33475B' : 'transparent',
        color: active ? '#FFFFFF' : '#516F90',
        fontSize: 13, fontWeight: active ? 700 : 500,
      }}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div style={{ width: 1, height: 18, background: '#DFE3EB', margin: '0 4px', flexShrink: 0 }} />
}

/* ── Reference picker modal ─────────────────────────────── */
function RefPicker({
  references,
  onAdd,
  onClose,
}: {
  references: Reference[]
  onAdd: (ref: Reference) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  const categories = Array.from(new Set(references.map(r => r.category).filter(Boolean))).sort()

  const filtered = references.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.note.toLowerCase().includes(search.toLowerCase())
    const matchCat = !filterCat || r.category === filterCat
    return matchSearch && matchCat
  })

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function addSelected() {
    selected.forEach(id => {
      const ref = references.find(r => r.id === id)
      if (ref) onAdd(ref)
    })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(47,65,86,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 350 }}
        className="w-full rounded-lg overflow-hidden flex flex-col"
        style={{ maxWidth: 520, maxHeight: '80vh', background: '#F5F8FA', border: '1px solid #DFE3EB', boxShadow: '0 24px 64px rgba(47,65,86,0.25)' }}
      >
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid #DFE3EB' }}>
          <h3 className="font-bold text-[14px]" style={{ color: '#33475B' }}>Add References to Script</h3>
          <button onClick={onClose} style={{ color: '#7C98B6' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Search + filter */}
        <div className="px-4 pt-3 pb-2 flex-shrink-0 space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#FFFFFF', border: '1.5px solid #DFE3EB' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7C98B6" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search references…" className="flex-1 bg-transparent outline-none text-sm" style={{ color: '#33475B' }} />
          </div>
          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={() => setFilterCat('')}
                className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{ background: !filterCat ? '#33475B' : 'rgba(200,217,230,0.3)', color: !filterCat ? '#fff' : '#516F90', border: `1px solid ${!filterCat ? '#33475B' : '#DFE3EB'}` }}
              >All</button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(prev => prev === cat ? '' : cat)}
                  className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all"
                  style={{ background: filterCat === cat ? '#516F90' : 'rgba(200,217,230,0.3)', color: filterCat === cat ? '#fff' : '#516F90', border: `1px solid ${filterCat === cat ? '#516F90' : '#DFE3EB'}` }}
                >{cat}</button>
              ))}
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-2">
              <p className="text-sm font-semibold" style={{ color: '#33475B' }}>No references yet</p>
              <p className="text-xs" style={{ color: '#7C98B6' }}>Add images in the References tab first</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filtered.map(ref => {
                const sel = selected.includes(ref.id)
                return (
                  <button
                    key={ref.id}
                    onClick={() => toggle(ref.id)}
                    className="rounded-md overflow-hidden text-left relative transition-all"
                    style={{
                      border: sel ? '2px solid #516F90' : '1px solid #DFE3EB',
                      background: sel ? 'rgba(86,124,141,0.06)' : '#FFFFFF',
                    }}
                  >
                    <div style={{ height: 80, background: '#EAF0F6', position: 'relative' }}>
                      {ref.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ref.imageUrl} alt={ref.title} className="w-full h-full object-cover" draggable={false} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ color: '#7C98B6' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                      )}
                      {sel && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#516F90' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      )}
                    </div>
                    <div className="px-2 py-2">
                      <p className="text-xs font-semibold truncate" style={{ color: '#33475B' }}>{ref.title}</p>
                      {ref.category && <p className="text-[10px] capitalize truncate" style={{ color: '#7C98B6' }}>{ref.category}</p>}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid #DFE3EB' }}>
          <button className="cs-btn-outline flex-1 py-2.5 rounded-md text-sm font-semibold" onClick={onClose}>Cancel</button>
          <button
            className="cs-btn flex-1 py-2.5 rounded-md text-sm"
            onClick={addSelected}
            disabled={selected.length === 0}
          >
            Add {selected.length > 0 ? `${selected.length} ` : ''}selected
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Category dropdown ──────────────────────────────────── */
function CategoryDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const categories = useStore(s => s.categories)
  const addCategory = useStore(s => s.addCategory)
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const newInputRef = useRef<HTMLInputElement>(null)
  const current = categories.find(c => c.name === value)

  useEffect(() => {
    function handle(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setCreating(false) } }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  useEffect(() => { if (creating) newInputRef.current?.focus() }, [creating])

  function createCategory() {
    const name = newName.trim()
    if (!name) return
    const existing = categories.find(c => c.name.toLowerCase() === name.toLowerCase())
    if (existing) { onChange(existing.name); setCreating(false); setNewName(''); setOpen(false); return }
    const now = new Date().toISOString()
    const color = CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length]
    addCategory({ id: uuid(), name, description: '', rules: '', shotTypes: '', color, createdAt: now, updatedAt: now })
    onChange(name)
    setNewName(''); setCreating(false); setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors"
        style={{ background: current ? `${current.color}14` : 'rgba(200,217,230,0.3)', color: current ? current.color : '#7C98B6', border: `1px solid ${current ? `${current.color}33` : '#DFE3EB'}` }}>
        {current && <span className="rounded-full" style={{ width: 7, height: 7, background: current.color }} />}
        {current ? current.name : 'Set category'}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }}
            className="absolute left-0 mt-1.5 rounded-lg overflow-hidden z-50" style={{ minWidth: 180, background: '#FFFFFF', border: '1px solid #DFE3EB', boxShadow: '0 8px 28px rgba(47,65,86,0.16)', maxHeight: 240, overflowY: 'auto' }}>
            {value && (
              <button type="button" onClick={() => { onChange(''); setOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors" style={{ color: '#7C98B6' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F5F8FA'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                Clear category
              </button>
            )}
            {categories.map(c => (
              <button key={c.id} type="button" onClick={() => { onChange(c.name); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-left transition-colors"
                style={{ background: c.name === value ? '#F5F8FA' : 'transparent', color: '#33475B' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F5F8FA'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = c.name === value ? '#F5F8FA' : 'transparent'}>
                <span className="rounded-full flex-shrink-0" style={{ width: 8, height: 8, background: c.color }} />
                {c.name}
              </button>
            ))}
            {categories.length === 0 && <p className="px-3 pt-2 pb-1 text-xs" style={{ color: '#99ACC2' }}>No categories yet</p>}

            {/* Create a custom category inline */}
            <div style={{ borderTop: '1px solid #EAF0F6', marginTop: 2 }}>
              {creating ? (
                <div className="flex items-center gap-1.5 px-2 py-2">
                  <input
                    ref={newInputRef}
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); createCategory() } if (e.key === 'Escape') { setCreating(false); setNewName('') } }}
                    placeholder="New category name…"
                    className="cs-input flex-1 text-xs py-1.5"
                  />
                  <button type="button" onClick={createCategory} disabled={!newName.trim()} className="cs-btn flex-shrink-0" style={{ fontSize: 11, padding: '6px 10px' }}>Add</button>
                </div>
              ) : (
                <button type="button" onClick={() => setCreating(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-left transition-colors"
                  style={{ color: '#516F90' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F5F8FA'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Create new category
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Main ScriptEditor component ────────────────────────── */
interface Props {
  script: Script
  onClose?: () => void
}

export function ScriptEditor({ script, onClose }: Props) {
  const { updateScript, references, inspirations, addReference } = useStore()
  const [title, setTitle]       = useState(script.title)
  const [status, setStatus]     = useState(script.status)
  const [category, setCategory] = useState(script.category)
  const [visualRefs, setVisualRefs] = useState<VisualRef[]>(script.visualRefs ?? [])
  const [music, setMusic]       = useState<MusicEntry[]>(script.music ?? [])
  const [comments, setComments] = useState<ScriptComment[]>(script.comments ?? [])
  const [commentText, setCommentText] = useState('')
  const [cover, setCover] = useState(script.coverImage ?? '')
  const [coverPos, setCoverPos] = useState(script.coverPosition ?? 50)
  const [saved, setSaved]       = useState(false)
  const [refPickerOpen, setRefPickerOpen] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)

  const autoTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const persistRef = useRef<() => void>(() => {})
  const skipAutosave = useRef(true)
  const imgInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const audioTargetRef = useRef<string | null>(null)

  const inspiration = script.inspirationId
    ? inspirations.find(i => i.id === script.inspirationId)
    : null

  useEffect(() => {
    skipAutosave.current = true
    setTitle(script.title)
    setStatus(script.status)
    setCategory(script.category)
    setVisualRefs(script.visualRefs ?? [])
    setMusic(script.music ?? [])
    setComments(script.comments ?? [])
    setCover(script.coverImage ?? '')
    setCoverPos(script.coverPosition ?? 50)
  }, [script.id]) // eslint-disable-line react-hooks/exhaustive-deps

  function scheduleAutosave() {
    if (autoTimer.current) clearTimeout(autoTimer.current)
    autoTimer.current = setTimeout(() => {
      persistRef.current()
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }, 1000)
  }

  const editor = useEditor({
    extensions: buildEditorExtensions('Write, or press “/” for commands…'),
    content: (() => { try { return script.content ? JSON.parse(script.content) : '' } catch { return script.content ?? '' } })(),
    editorProps: {
      attributes: { class: 'notion-editor focus:outline-none' },
    },
    onUpdate: () => scheduleAutosave(),
  }, [script.id])

  /* Open the slash menu for the block next to the “+” gutter button. */
  const openSlashAtHandle = useCallback((handle: HTMLElement) => {
    if (!editor) return
    const rect = handle.getBoundingClientRect()
    const found = editor.view.posAtCoords({ left: rect.right + 40, top: rect.top + 8 })
    if (!found) { editor.chain().focus().insertContent('/').run(); return }
    try {
      const $pos = editor.state.doc.resolve(found.pos)
      if ($pos.depth < 1) { editor.chain().focus().insertContent('/').run(); return }
      const node = $pos.node(1)
      const emptyPara = node.type.name === 'paragraph' && node.content.size === 0
      if (emptyPara) {
        editor.chain().focus().setTextSelection($pos.before(1) + 1).insertContent('/').run()
      } else {
        const after = $pos.after(1)
        editor.chain().focus().insertContentAt(after, { type: 'paragraph' }).setTextSelection(after + 1).insertContent('/').run()
      }
    } catch {
      editor.chain().focus().insertContent('/').run()
    }
  }, [editor])

  /* Turn the drag-handle into a Notion-style “+” + drag gutter. */
  useEffect(() => {
    if (!editor) return
    const parent = editor.view.dom.parentElement
    if (!parent) return
    let onClick: ((e: Event) => void) | null = null
    let handleEl: HTMLElement | null = null
    const inject = () => {
      const handles = parent.querySelectorAll(':scope > .drag-handle')
      handles.forEach((h, i) => { if (i > 0) h.remove() })
      const handle = handles[0] as HTMLElement | undefined
      if (!handle || handle.dataset.csReady) return
      handle.dataset.csReady = '1'
      handle.classList.add('cs-gutter')
      handle.setAttribute('title', 'Click to add a block · drag to move')
      handle.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'
      handleEl = handle
      onClick = (e: Event) => { e.preventDefault(); e.stopPropagation(); openSlashAtHandle(handle) }
      handle.addEventListener('click', onClick)
    }
    inject()
    const obs = new MutationObserver(inject)
    obs.observe(parent, { childList: true })
    return () => { obs.disconnect(); if (handleEl && onClick) handleEl.removeEventListener('click', onClick) }
  }, [editor, openSlashAtHandle])

  const persist = useCallback(() => {
    let content = script.content
    try { if (editor && !editor.isDestroyed) content = JSON.stringify(editor.getJSON()) } catch { /* keep prior */ }
    updateScript(script.id, {
      title, status, category, content, coverImage: cover || undefined, coverPosition: coverPos, visualRefs, music, comments,
      updatedAt: new Date().toISOString(),
    })
  }, [script.id, title, status, category, cover, coverPos, editor, visualRefs, music, comments, updateScript, script.content])

  const save = useCallback(() => {
    persist()
    setSaved(true)
    toast('Script saved')
    setTimeout(() => setSaved(false), 1800)
  }, [persist])

  // Keep a live ref to persist so the debounced timer always flushes latest.
  useEffect(() => { persistRef.current = persist }, [persist])

  // Autosave when fields change (skip the reload that fires on script switch).
  useEffect(() => {
    if (skipAutosave.current) { skipAutosave.current = false; return }
    scheduleAutosave()
  }, [title, status, category, cover, coverPos, visualRefs, music, comments]) // eslint-disable-line react-hooks/exhaustive-deps

  // Flush any pending save on unmount (e.g. navigating away).
  useEffect(() => () => {
    if (autoTimer.current) { clearTimeout(autoTimer.current); persistRef.current() }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [save])

  function addRef(ref: Reference) {
    const exists = visualRefs.some(r => r.referenceId === ref.id)
    if (exists) return
    setVisualRefs(v => [...v, {
      id: uuid(), referenceId: ref.id,
      imageUrl: ref.imageUrl, title: ref.title,
      timestamp: '', note: '',
    }])
  }

  function addMusicEntry() {
    setMusic(m => [...m, { id: uuid(), title: '', type: 'bgm', timestamp: '', note: '' }])
  }

  function updateRef(id: string, fields: Partial<VisualRef>) {
    setVisualRefs(v => v.map(r => r.id === id ? { ...r, ...fields } : r))
  }

  function updateMusicEntry(id: string, fields: Partial<MusicEntry>) {
    setMusic(m => m.map(x => x.id === id ? { ...x, ...fields } : x))
  }

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/references/upload', { method: 'POST', body: fd })
    if (!res.ok) throw new Error('upload failed')
    return (await res.json()).url as string
  }

  // Upload images directly into the script (also saved to the References library).
  async function uploadRefImages(files: FileList) {
    setUploadingImg(true)
    const now = new Date().toISOString()
    for (const file of Array.from(files)) {
      try {
        const url = await uploadFile(file)
        const refId = uuid()
        const title = file.name.replace(/\.[^.]+$/, '') || 'Uploaded image'
        addReference({ id: refId, title, imageUrl: url, note: '', category: '', tags: [], source: 'manual', createdAt: now, updatedAt: now })
        setVisualRefs(v => [...v, { id: uuid(), referenceId: refId, imageUrl: url, title, timestamp: '', note: '' }])
      } catch { toast('Image upload failed', 'error') }
    }
    setUploadingImg(false)
  }

  function beginAudioUpload(id: string) { audioTargetRef.current = id; audioInputRef.current?.click() }
  async function handleAudioFile(files: FileList) {
    const file = files[0]; const id = audioTargetRef.current
    if (!file || !id) return
    try {
      const url = await uploadFile(file)
      updateMusicEntry(id, { audioUrl: url, title: music.find(m => m.id === id)?.title || file.name.replace(/\.[^.]+$/, '') })
      toast('Track uploaded')
    } catch { toast('Track upload failed', 'error') }
    audioTargetRef.current = null
  }

  function addComment() {
    if (!commentText.trim()) return
    setComments(c => [...c, { id: uuid(), text: commentText.trim(), createdAt: new Date().toISOString() }])
    setCommentText('')
  }
  function deleteComment(id: string) { setComments(c => c.filter(x => x.id !== id)) }

  const statusColors = {
    draft: { bg: 'rgba(200,217,230,0.4)', color: '#33475B' },
    ready: { bg: 'rgba(86,124,141,0.7)', color: '#FFFFFF' },
    shot:  { bg: 'rgba(47,65,86,0.85)', color: '#FFFFFF' },
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#F5F8FA' }}>

      {/* ── Top bar ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #DFE3EB' }}
      >
        {onClose && (
          <button onClick={onClose} style={{ color: '#7C98B6' }} className="flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Script title…"
          className="flex-1 bg-transparent font-bold text-base outline-none"
          style={{ color: '#33475B', minWidth: 0 }}
        />

        {/* Status pills */}
        <div className="flex gap-1.5 flex-shrink-0">
          {(['draft', 'ready', 'shot'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
              style={{
                background: status === s ? statusColors[s].bg : 'rgba(200,217,230,0.2)',
                color: status === s ? statusColors[s].color : '#7C98B6',
                border: `1px solid ${status === s ? 'transparent' : '#DFE3EB'}`,
              }}
            >
              {s === 'ready' ? 'Ready' : s}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            if (!editor) return
            printScriptPdf({
              title,
              bodyHtml: editor.getHTML(),
              coverImage: cover || undefined,
              coverPosition: coverPos,
              meta: [category, status === 'ready' ? 'Ready to shoot' : status === 'shot' ? 'Shot' : 'Draft'].filter(Boolean).join('  ·  '),
            })
          }}
          title="Download / print as PDF"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0"
          style={{ background: '#FFFFFF', color: '#33475B', border: '1px solid #CBD6E2' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          PDF
        </button>

        <button
          onClick={save}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0"
          style={{
            background: saved ? '#3a7d44' : '#33475B',
            color: '#FFFFFF',
          }}
        >
          {saved ? (
            <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> Saved</>
          ) : (
            <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save</>
          )}
        </button>
      </div>

      {/* Category */}
      <div className="px-4 py-2 flex-shrink-0 flex items-center gap-2" style={{ borderBottom: '1px solid #DFE3EB', background: '#FFFFFF' }}>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#7C98B6' }}>Category</span>
        <CategoryDropdown
          value={category}
          onChange={(v) => { setCategory(v); updateScript(script.id, { category: v, updatedAt: new Date().toISOString() }) }}
        />
      </div>

      {/* Inspiration tag */}
      {inspiration && (
        <div className="px-4 py-2 flex-shrink-0 flex items-center gap-2" style={{ borderBottom: '1px solid #DFE3EB', background: 'rgba(200,217,230,0.12)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#516F90" strokeWidth="2" strokeLinecap="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 015 11.95V17a1 1 0 01-1 1H8a1 1 0 01-1-1v-3.05A7 7 0 0112 2z"/></svg>
          <span className="text-xs" style={{ color: '#516F90' }}>Inspired by:</span>
          <a href={inspiration.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold truncate hover:underline" style={{ color: '#33475B', maxWidth: 300 }}>
            {inspiration.url}
          </a>
          <span className="text-xs capitalize" style={{ color: '#7C98B6' }}>({inspiration.category})</span>
        </div>
      )}

      {/* ── TipTap Toolbar ── */}
      <div
        className="flex items-center flex-wrap gap-0.5 px-4 py-2 flex-shrink-0"
        style={{ background: '#FFFFFF', borderBottom: '1px solid #DFE3EB' }}
      >
        {/* Text type */}
        <select
          onChange={e => {
            const v = e.target.value
            if (v === 'p') editor?.chain().focus().setParagraph().run()
            else editor?.chain().focus().toggleHeading({ level: parseInt(v) as 1|2|3 }).run()
          }}
          value={
            editor?.isActive('heading', { level: 1 }) ? '1' :
            editor?.isActive('heading', { level: 2 }) ? '2' :
            editor?.isActive('heading', { level: 3 }) ? '3' : 'p'
          }
          className="text-xs rounded-lg px-2 py-1 outline-none transition-colors mr-1"
          style={{ border: '1px solid #DFE3EB', color: '#33475B', background: '#F5F8FA', height: 28 }}
        >
          <option value="p">Text</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>

        {editor && <FontFamilySelect editor={editor} />}
        {editor && <FontSizeSelect editor={editor} />}
        {editor && <LineSpacingSelect editor={editor} />}

        <Sep />

        <TB active={editor?.isActive('bold')} onMouseDown={() => editor?.chain().focus().toggleBold().run()} title="Bold (⌘B)"><b>B</b></TB>
        <TB active={editor?.isActive('italic')} onMouseDown={() => editor?.chain().focus().toggleItalic().run()} title="Italic (⌘I)"><i>I</i></TB>
        <TB active={editor?.isActive('underline')} onMouseDown={() => editor?.chain().focus().toggleUnderline().run()} title="Underline (⌘U)"><u>U</u></TB>
        <TB active={editor?.isActive('strike')} onMouseDown={() => editor?.chain().focus().toggleStrike().run()} title="Strikethrough">
          <s>S</s>
        </TB>
        <TB active={editor?.isActive('highlight')} onMouseDown={() => editor?.chain().focus().toggleHighlight().run()} title="Highlight">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </TB>
        {editor && <ColorControl editor={editor} />}

        <Sep />

        <TB active={editor?.isActive('bulletList')} onMouseDown={() => editor?.chain().focus().toggleBulletList().run()} title="Bullet list">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
        </TB>
        <TB active={editor?.isActive('orderedList')} onMouseDown={() => editor?.chain().focus().toggleOrderedList().run()} title="Numbered list">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
        </TB>

        <Sep />

        <TB active={editor?.isActive('blockquote')} onMouseDown={() => editor?.chain().focus().toggleBlockquote().run()} title="Quote">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
        </TB>
        <TB active={editor?.isActive('code')} onMouseDown={() => editor?.chain().focus().toggleCode().run()} title="Inline code">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </TB>
        <TB active={editor?.isActive('codeBlock')} onMouseDown={() => editor?.chain().focus().toggleCodeBlock().run()} title="Code block">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/></svg>
        </TB>
        <TB active={false} onMouseDown={() => editor?.chain().focus().setHorizontalRule().run()} title="Divider">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="2" y1="12" x2="22" y2="12"/></svg>
        </TB>

        <Sep />

        <TB active={false} onMouseDown={() => editor?.chain().focus().undo().run()} title="Undo (⌘Z)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 00-4-4H4"/></svg>
        </TB>
        <TB active={false} onMouseDown={() => editor?.chain().focus().redo().run()} title="Redo (⌘⇧Z)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 014-4h12"/></svg>
        </TB>
      </div>

      {/* ── Editor body + sections (scroll together) ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 pt-5">
          <CoverImage value={cover} onChange={setCover} onRemove={() => setCover('')} height={220} position={coverPos} onPositionChange={setCoverPos} />
        </div>
        <div className="max-w-2xl mx-auto px-6 pt-5 pb-6">
          <EditorContent editor={editor} />
          {editor && <BubbleToolbar editor={editor} />}
        </div>

        <div className="max-w-2xl mx-auto px-6 pb-10 space-y-4">

          {/* Music / SFX */}
          <div className="rounded-lg" style={{ border: '1px solid #DFE3EB', background: '#FFFFFF' }}>
            <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: music.length ? '1px solid #EAF0F6' : 'none' }}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#7C98B6' }}>Music / SFX</span>
              <button onClick={addMusicEntry} className="text-xs font-semibold flex items-center gap-1" style={{ color: '#516F90' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add track
              </button>
            </div>
            <div className="p-3">
              {music.length === 0 ? (
                <p className="text-xs" style={{ color: '#99ACC2' }}>No music yet — add a track, then upload the audio file.</p>
              ) : (
                <div className="space-y-2.5">
                  {music.map(m => (
                    <div key={m.id} className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <input value={m.title} onChange={e => updateMusicEntry(m.id, { title: e.target.value })} placeholder="Track name…" className="cs-input flex-1 text-xs py-1.5" />
                        <select value={m.type} onChange={e => updateMusicEntry(m.id, { type: e.target.value as MusicEntry['type'] })} className="cs-input text-xs py-1.5" style={{ width: 'auto' }}>
                          <option value="bgm">BGM</option><option value="sfx">SFX</option><option value="transition">Transition</option>
                        </select>
                        <input value={m.timestamp ?? ''} onChange={e => updateMusicEntry(m.id, { timestamp: e.target.value })} placeholder="0:00" className="cs-input w-14 text-xs py-1.5 text-center" />
                        <button onClick={() => beginAudioUpload(m.id)} title="Upload audio file" className="flex-shrink-0" style={{ color: m.audioUrl ? '#00A4BD' : '#516F90' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        </button>
                        <button onClick={() => setMusic(x => x.filter(t => t.id !== m.id))} className="flex-shrink-0" style={{ color: '#99ACC2' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                      {m.audioUrl && <audio controls src={m.audioUrl} style={{ width: '100%', height: 34 }} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Visual References */}
          <div className="rounded-lg" style={{ border: '1px solid #DFE3EB', background: '#FFFFFF' }}>
            <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: visualRefs.length ? '1px solid #EAF0F6' : 'none' }}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#7C98B6' }}>
                Visual References {visualRefs.length > 0 && `(${visualRefs.length})`}
              </span>
              <div className="flex items-center gap-3">
                <button onClick={() => imgInputRef.current?.click()} className="text-xs font-semibold flex items-center gap-1" style={{ color: '#516F90' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  {uploadingImg ? 'Uploading…' : 'Upload'}
                </button>
                <button onClick={() => setRefPickerOpen(true)} className="text-xs font-semibold flex items-center gap-1" style={{ color: '#516F90' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  Library
                </button>
              </div>
            </div>
            <div className="p-3">
              {visualRefs.length === 0 ? (
                <div className="flex gap-2">
                  <button onClick={() => imgInputRef.current?.click()} className="flex-1 py-3 rounded-lg text-xs flex items-center justify-center gap-2" style={{ border: '1.5px dashed #DFE3EB', color: '#7C98B6' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Upload image
                  </button>
                  <button onClick={() => setRefPickerOpen(true)} className="flex-1 py-3 rounded-lg text-xs flex items-center justify-center gap-2" style={{ border: '1.5px dashed #DFE3EB', color: '#7C98B6' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    Pick from library
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {visualRefs.map(ref => (
                    <div key={ref.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: '#F5F8FA', border: '1px solid #DFE3EB' }}>
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ background: '#EAF0F6' }}>
                        {ref.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={ref.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C98B6" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: '#33475B' }}>{ref.title || 'Reference'}</p>
                        <div className="flex gap-2 mt-1">
                          <input value={ref.timestamp} onChange={e => updateRef(ref.id, { timestamp: e.target.value })} placeholder="0:00" className="cs-input w-14 text-xs py-0.5 text-center" />
                          <input value={ref.note} onChange={e => updateRef(ref.id, { note: e.target.value })} placeholder="Shot note…" className="cs-input flex-1 text-xs py-0.5" />
                        </div>
                      </div>
                      <button onClick={() => setVisualRefs(v => v.filter(r => r.id !== ref.id))} className="flex-shrink-0" style={{ color: '#99ACC2' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="rounded-lg" style={{ border: '1px solid #DFE3EB', background: '#FFFFFF' }}>
            <div className="px-4 py-2.5" style={{ borderBottom: '1px solid #EAF0F6' }}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#7C98B6' }}>
                Comments {comments.length > 0 && `(${comments.length})`}
              </span>
            </div>
            <div className="p-3 space-y-2">
              {comments.map(c => (
                <div key={c.id} className="group flex items-start gap-2 px-3 py-2 rounded-md" style={{ background: '#F5F8FA', border: '1px solid #DFE3EB' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs" style={{ color: '#33475B', whiteSpace: 'pre-wrap' }}>{c.text}</p>
                    <p className="text-[10px] mt-1" style={{ color: '#99ACC2' }}>{new Date(c.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                  </div>
                  <button onClick={() => deleteComment(c.id)} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: '#99ACC2' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addComment()} placeholder="Add a comment…" className="cs-input flex-1 text-xs" />
                <button className="cs-btn flex-shrink-0" style={{ fontSize: 12, padding: '7px 14px' }} onClick={addComment} disabled={!commentText.trim()}>Post</button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Hidden upload inputs */}
      <input ref={imgInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { if (e.target.files) uploadRefImages(e.target.files); e.target.value = '' }} />
      <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={e => { if (e.target.files) handleAudioFile(e.target.files); e.target.value = '' }} />

      {/* Reference picker modal */}
      <AnimatePresence>
        {refPickerOpen && (
          <RefPicker
            references={references}
            onAdd={addRef}
            onClose={() => setRefPickerOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
