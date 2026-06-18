'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { toast } from '@/lib/toast'
import type { Script, VisualRef, MusicEntry, Reference } from '@/lib/types'
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
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = categories.find(c => c.name === value)

  useEffect(() => {
    function handle(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

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
            {categories.length === 0 && <p className="px-3 py-2 text-xs" style={{ color: '#99ACC2' }}>No categories yet</p>}
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
  const { updateScript, references, inspirations } = useStore()
  const [title, setTitle]       = useState(script.title)
  const [status, setStatus]     = useState(script.status)
  const [category, setCategory] = useState(script.category)
  const [visualRefs, setVisualRefs] = useState<VisualRef[]>(script.visualRefs ?? [])
  const [music, setMusic]       = useState<MusicEntry[]>(script.music ?? [])
  const [saved, setSaved]       = useState(false)
  const [refPickerOpen, setRefPickerOpen] = useState(false)

  const autoTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const persistRef = useRef<() => void>(() => {})
  const skipAutosave = useRef(true)

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
    extensions: [
      StarterKit.configure({ codeBlock: { HTMLAttributes: { class: 'code-block' } } }),
      Placeholder.configure({ placeholder: 'Start writing your script…\n\nTip: Use / to add headings, lists, and more.' }),
      Underline,
      Highlight.configure({ multicolor: false }),
      Link.configure({ openOnClick: false }),
    ],
    content: (() => { try { return script.content ? JSON.parse(script.content) : '' } catch { return script.content ?? '' } })(),
    editorProps: {
      attributes: { class: 'notion-editor focus:outline-none' },
    },
    onUpdate: () => scheduleAutosave(),
  }, [script.id])

  const persist = useCallback(() => {
    let content = script.content
    try { if (editor && !editor.isDestroyed) content = JSON.stringify(editor.getJSON()) } catch { /* keep prior */ }
    updateScript(script.id, {
      title, status, category, content, visualRefs, music,
      updatedAt: new Date().toISOString(),
    })
  }, [script.id, title, status, category, editor, visualRefs, music, updateScript, script.content])

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
  }, [title, status, category, visualRefs, music]) // eslint-disable-line react-hooks/exhaustive-deps

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

      {/* ── Editor body ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* ── Music ── */}
      <div className="flex-shrink-0" style={{ borderTop: '1px solid #DFE3EB' }}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#7C98B6' }}>
              Music / SFX
            </span>
            <button
              onClick={addMusicEntry}
              className="text-xs font-semibold flex items-center gap-1"
              style={{ color: '#516F90' }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add track
            </button>
          </div>
          {music.length === 0 ? (
            <p className="text-xs" style={{ color: '#99ACC2' }}>No music added — click + Add track</p>
          ) : (
            <div className="space-y-2">
              {music.map(m => (
                <div key={m.id} className="flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7C98B6" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                  <input value={m.title} onChange={e => updateMusicEntry(m.id, { title: e.target.value })} placeholder="Track name…" className="cs-input flex-1 text-xs py-1.5" />
                  <select value={m.type} onChange={e => updateMusicEntry(m.id, { type: e.target.value as any })} className="cs-input text-xs py-1.5">
                    <option value="bgm">BGM</option><option value="sfx">SFX</option><option value="transition">Transition</option>
                  </select>
                  <input value={m.timestamp ?? ''} onChange={e => updateMusicEntry(m.id, { timestamp: e.target.value })} placeholder="0:00" className="cs-input w-14 text-xs py-1.5 text-center" />
                  <button onClick={() => setMusic(x => x.filter(t => t.id !== m.id))} style={{ color: '#7C98B6' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Visual References ── */}
      <div className="flex-shrink-0" style={{ borderTop: '1px solid #DFE3EB' }}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#7C98B6' }}>
              Visual References {visualRefs.length > 0 && `(${visualRefs.length})`}
            </span>
            <button
              onClick={() => setRefPickerOpen(true)}
              className="text-xs font-semibold flex items-center gap-1"
              style={{ color: '#516F90' }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add reference
            </button>
          </div>

          {visualRefs.length === 0 ? (
            <button
              onClick={() => setRefPickerOpen(true)}
              className="w-full py-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-all"
              style={{ border: '1.5px dashed #DFE3EB', color: '#7C98B6' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Pick references from library
            </button>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {visualRefs.map(ref => (
                <div key={ref.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #DFE3EB' }}>
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
                      <input
                        value={ref.timestamp}
                        onChange={e => updateRef(ref.id, { timestamp: e.target.value })}
                        placeholder="0:00"
                        className="cs-input w-14 text-xs py-0.5 text-center"
                      />
                      <input
                        value={ref.note}
                        onChange={e => updateRef(ref.id, { note: e.target.value })}
                        placeholder="Shot note…"
                        className="cs-input flex-1 text-xs py-0.5"
                      />
                    </div>
                  </div>
                  <button onClick={() => setVisualRefs(v => v.filter(r => r.id !== ref.id))} style={{ color: '#7C98B6', flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
