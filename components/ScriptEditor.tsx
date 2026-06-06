'use client'
import { useState, useCallback, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Bold, Italic, UnderlineIcon, List, ListOrdered, Quote,
  Heading2, Heading3, Link2, ImageIcon, Highlighter,
  Camera, Music, Plus, Trash2, ChevronDown,
  Clock, MessageSquare, Save, CheckCircle2
} from 'lucide-react'
import { clsx } from 'clsx'
import { useStore } from '@/lib/store'
import type { Script, VisualRef, MusicEntry } from '@/lib/types'
import { v4 as uuid } from 'uuid'

interface Props {
  script: Script | null
  open: boolean
  onClose: () => void
}

type EditorTab = 'script' | 'visual' | 'music'

export function ScriptEditor({ script, open, onClose }: Props) {
  const { updateScript, dissections } = useStore()
  const [tab, setTab]         = useState<EditorTab>('script')
  const [title, setTitle]     = useState(script?.title ?? '')
  const [category, setCategory] = useState(script?.category ?? '')
  const [status, setStatus]   = useState(script?.status ?? 'draft')
  const [visualRefs, setVisualRefs] = useState<VisualRef[]>(script?.visualRefs ?? [])
  const [music, setMusic]     = useState<MusicEntry[]>(script?.music ?? [])
  const [saved, setSaved]     = useState(false)

  // Reset when script changes
  useEffect(() => {
    setTitle(script?.title ?? '')
    setCategory(script?.category ?? '')
    setStatus(script?.status ?? 'draft')
    setVisualRefs(script?.visualRefs ?? [])
    setMusic(script?.music ?? [])
  }, [script])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing your script here…' }),
      Underline,
      Highlight.configure({ multicolor: false }),
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: (() => {
      try { return script?.content ? JSON.parse(script.content) : '' } catch { return script?.content ?? '' }
    })(),
    editorProps: {
      attributes: { class: 'tiptap prose prose-invert max-w-none focus:outline-none min-h-[400px] text-sm text-ig-text' }
    },
  }, [script?.id])

  const save = useCallback(() => {
    if (!script) return
    updateScript(script.id, {
      title,
      category,
      status: status as Script['status'],
      content: JSON.stringify(editor?.getJSON()),
      visualRefs,
      music,
      updatedAt: new Date().toISOString(),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [script, title, category, status, editor, visualRefs, music, updateScript])

  // Keyboard save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [save])

  const addVisualRef = () => {
    setVisualRefs(v => [...v, { id: uuid(), imageUrl: '', timestamp: '', note: '' }])
  }

  const addMusic = () => {
    setMusic(m => [...m, { id: uuid(), title: '', type: 'bgm', timestamp: '', note: '' }])
  }

  const updateRef = (id: string, fields: Partial<VisualRef>) =>
    setVisualRefs(v => v.map(r => r.id === id ? { ...r, ...fields } : r))

  const updateMusic = (id: string, fields: Partial<MusicEntry>) =>
    setMusic(m => m.map(x => x.id === id ? { ...x, ...fields } : x))

  if (!script) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-ig-bg flex flex-col"
        >
          {/* Top bar */}
          <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-ig-border flex-shrink-0 bg-ig-surface">
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-ig-hover text-ig-muted hover:text-ig-text transition-colors">
              <X size={18} />
            </button>

            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Script title…"
              className="flex-1 bg-transparent text-ig-text font-bold text-base outline-none placeholder-ig-faint"
            />

            {/* Status */}
            <div className="relative">
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="bg-ig-card border border-ig-border text-ig-text text-xs px-3 py-1.5 rounded-lg appearance-none outline-none cursor-pointer pr-7"
              >
                <option value="draft">Draft</option>
                <option value="ready">Ready to shoot</option>
                <option value="shot">Shot</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-ig-faint pointer-events-none" />
            </div>

            <button
              onClick={save}
              className={clsx(
                'flex items-center gap-2 font-semibold text-sm px-4 py-2 rounded-xl transition-all',
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-ig-blue hover:bg-ig-blue-hover text-white'
              )}
            >
              {saved ? <><CheckCircle2 size={15} /> Saved</> : <><Save size={15} /> Save</>}
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left: tabs + content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Tab bar */}
              <div className="flex border-b border-ig-border px-4 sm:px-6 flex-shrink-0">
                {[
                  { id: 'script', label: 'Script',   icon: null },
                  { id: 'visual', label: `Visual Refs ${visualRefs.length ? `(${visualRefs.length})` : ''}`, icon: Camera },
                  { id: 'music',  label: `Music / SFX ${music.length ? `(${music.length})` : ''}`, icon: Music },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id as EditorTab)}
                    className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2 ${
                      tab === t.id ? 'border-ig-text text-ig-text' : 'border-transparent text-ig-faint hover:text-ig-muted'
                    }`}
                  >
                    {t.icon && <t.icon size={13} />}
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Script tab */}
              {tab === 'script' && (
                <div className="flex-1 overflow-hidden flex flex-col">
                  {/* Toolbar */}
                  <div className="flex items-center gap-0.5 px-4 sm:px-6 py-2 border-b border-ig-border flex-shrink-0 flex-wrap">
                    {[
                      { icon: Bold,         action: () => editor?.chain().focus().toggleBold().run(),          active: editor?.isActive('bold') },
                      { icon: Italic,       action: () => editor?.chain().focus().toggleItalic().run(),        active: editor?.isActive('italic') },
                      { icon: UnderlineIcon,action: () => editor?.chain().focus().toggleUnderline().run(),     active: editor?.isActive('underline') },
                      { icon: Highlighter,  action: () => editor?.chain().focus().toggleHighlight().run(),     active: editor?.isActive('highlight') },
                      { icon: Heading2,     action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive('heading', { level: 2 }) },
                      { icon: Heading3,     action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), active: editor?.isActive('heading', { level: 3 }) },
                      { icon: List,         action: () => editor?.chain().focus().toggleBulletList().run(),     active: editor?.isActive('bulletList') },
                      { icon: ListOrdered,  action: () => editor?.chain().focus().toggleOrderedList().run(),   active: editor?.isActive('orderedList') },
                      { icon: Quote,        action: () => editor?.chain().focus().toggleBlockquote().run(),    active: editor?.isActive('blockquote') },
                    ].map(({ icon: Icon, action, active }, i) => (
                      <button
                        key={i}
                        onMouseDown={e => { e.preventDefault(); action() }}
                        className={clsx(
                          'p-2 rounded-lg transition-colors',
                          active ? 'bg-white/15 text-white' : 'text-ig-muted hover:text-ig-text hover:bg-ig-hover'
                        )}
                      >
                        <Icon size={15} />
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
                    <EditorContent editor={editor} />
                  </div>
                </div>
              )}

              {/* Visual refs tab */}
              {tab === 'visual' && (
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-ig-muted">Add frame images with timestamps and shot notes.</p>
                    <button
                      onClick={addVisualRef}
                      className="flex items-center gap-2 bg-ig-blue hover:bg-ig-blue-hover text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                    >
                      <Plus size={13} /> Add Reference
                    </button>
                  </div>

                  {visualRefs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-ig-faint">
                      <Camera size={40} className="mb-3 opacity-30" />
                      <p className="text-sm">No visual references yet</p>
                      <p className="text-xs mt-1 text-ig-faint">Add frame images from your dissections or upload your own</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {visualRefs.map((ref, i) => (
                        <div key={ref.id} className="bg-ig-card border border-ig-border rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-ig-muted">REF #{i + 1}</span>
                            <button onClick={() => setVisualRefs(v => v.filter(r => r.id !== ref.id))} className="text-red-400 hover:text-red-300 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {/* Image upload / URL */}
                          <div className="flex gap-3">
                            <div className="w-24 h-24 rounded-lg bg-ig-border border border-ig-border flex-shrink-0 overflow-hidden relative">
                              {ref.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={ref.imageUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-white/5 transition-colors gap-1">
                                  <ImageIcon size={18} className="text-ig-faint" />
                                  <span className="text-[9px] text-ig-faint">Upload</span>
                                  <input type="file" accept="image/*" className="sr-only"
                                    onChange={async e => {
                                      const file = e.target.files?.[0]
                                      if (!file) return
                                      const form = new FormData()
                                      form.append('file', file)
                                      const res = await fetch('/api/frames/upload', { method: 'POST', body: form })
                                      const { url } = await res.json()
                                      updateRef(ref.id, { imageUrl: url })
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 bg-ig-border rounded-lg px-3 py-2">
                                <Clock size={13} className="text-ig-faint" />
                                <input
                                  value={ref.timestamp}
                                  onChange={e => updateRef(ref.id, { timestamp: e.target.value })}
                                  placeholder="Timestamp e.g. 0:04"
                                  className="flex-1 bg-transparent text-sm text-ig-text placeholder-ig-faint outline-none"
                                />
                              </div>
                              <div className="flex items-start gap-2 bg-ig-border rounded-lg px-3 py-2">
                                <MessageSquare size={13} className="text-ig-faint mt-0.5" />
                                <textarea
                                  value={ref.note}
                                  onChange={e => updateRef(ref.id, { note: e.target.value })}
                                  placeholder="Shot note: how to use this frame…"
                                  rows={2}
                                  className="flex-1 bg-transparent text-sm text-ig-text placeholder-ig-faint outline-none resize-none"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Music tab */}
              {tab === 'music' && (
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-ig-muted">Add background music, SFX, or transition audio.</p>
                    <button
                      onClick={addMusic}
                      className="flex items-center gap-2 bg-ig-blue hover:bg-ig-blue-hover text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                    >
                      <Plus size={13} /> Add Track
                    </button>
                  </div>

                  {music.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-ig-faint">
                      <Music size={40} className="mb-3 opacity-30" />
                      <p className="text-sm">No music or SFX added</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {music.map((m, i) => (
                        <div key={m.id} className="bg-ig-card border border-ig-border rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-ig-muted">TRACK #{i + 1}</span>
                            <button onClick={() => setMusic(x => x.filter(t => t.id !== m.id))} className="text-red-400 hover:text-red-300 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              value={m.title}
                              onChange={e => updateMusic(m.id, { title: e.target.value })}
                              placeholder="Track / SFX name"
                              className="col-span-2 bg-ig-border rounded-lg px-3 py-2 text-sm text-ig-text placeholder-ig-faint outline-none"
                            />
                            <input
                              value={m.artist ?? ''}
                              onChange={e => updateMusic(m.id, { artist: e.target.value })}
                              placeholder="Artist (optional)"
                              className="bg-ig-border rounded-lg px-3 py-2 text-sm text-ig-text placeholder-ig-faint outline-none"
                            />
                            <select
                              value={m.type}
                              onChange={e => updateMusic(m.id, { type: e.target.value as any })}
                              className="bg-ig-border rounded-lg px-3 py-2 text-sm text-ig-text outline-none appearance-none cursor-pointer"
                            >
                              <option value="bgm">Background Music</option>
                              <option value="sfx">SFX</option>
                              <option value="transition">Transition</option>
                            </select>
                            <input
                              value={m.timestamp ?? ''}
                              onChange={e => updateMusic(m.id, { timestamp: e.target.value })}
                              placeholder="Timestamp"
                              className="bg-ig-border rounded-lg px-3 py-2 text-sm text-ig-text placeholder-ig-faint outline-none"
                            />
                            <input
                              value={m.note ?? ''}
                              onChange={e => updateMusic(m.id, { note: e.target.value })}
                              placeholder="Note"
                              className="bg-ig-border rounded-lg px-3 py-2 text-sm text-ig-text placeholder-ig-faint outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
