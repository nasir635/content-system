'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, Check, Upload, Loader2 } from 'lucide-react'
import type { Inspiration, InspirationScreenshot, Reference } from '@/lib/types'
import { useStore } from '@/lib/store'
import { v4 as uuid } from 'uuid'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: (inspiration: Inspiration, refs: Reference[]) => void
}

function CustomSelect({ value, onChange, options }: {
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium border transition-all"
        style={{
          background: '#FFFFFF',
          border: `1.5px solid ${open ? '#516F90' : '#DFE3EB'}`,
          color: '#33475B',
        }}
      >
        <span className="capitalize truncate">{value}</span>
        <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', color: '#7C98B6', flexShrink: 0 }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute left-0 right-0 mt-1 rounded-xl z-50 overflow-hidden"
            style={{ background: '#FFFFFF', border: '1.5px solid #DFE3EB', boxShadow: '0 8px 32px rgba(47,65,86,0.18)', maxHeight: 220, overflowY: 'auto' }}
          >
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false) }}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm capitalize text-left transition-colors"
                style={{
                  background: opt === value ? 'rgba(86,124,141,0.08)' : 'transparent',
                  color: opt === value ? '#33475B' : '#516F90',
                  fontWeight: opt === value ? 600 : 400,
                }}
              >
                <span>{opt}</span>
                {opt === value && <Check size={13} style={{ color: '#516F90', flexShrink: 0 }} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function AddInspirationModal({ open, onClose, onSuccess }: Props) {
  const categories = useStore(s => s.categories)
  const [url, setUrl]           = useState('')
  const [howToUse, setHowToUse] = useState('')
  const [category, setCategory] = useState<string>('')
  const [tags, setTags]         = useState('')
  const [screenshots, setScreenshots] = useState<Array<{
    id: string; file?: File; preview: string; blobUrl: string
    title: string; note: string; uploading: boolean
  }>>([])
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!category && categories.length) setCategory(categories[0].name)
  }, [categories, category])

  function reset() {
    setUrl(''); setHowToUse(''); setCategory(categories[0]?.name ?? '')
    setTags(''); setScreenshots([]); setSaving(false)
  }

  async function handleFiles(files: FileList) {
    const newItems = Array.from(files).map(file => ({
      id: uuid(), file, preview: URL.createObjectURL(file),
      blobUrl: '', title: '', note: '', uploading: true,
    }))
    setScreenshots(prev => [...prev, ...newItems])

    for (const item of newItems) {
      try {
        const fd = new FormData()
        fd.append('file', item.file!)
        const res = await fetch('/api/references/upload', { method: 'POST', body: fd })
        const { url: blobUrl } = await res.json()
        setScreenshots(prev => prev.map(s =>
          s.id === item.id ? { ...s, blobUrl, uploading: false } : s
        ))
      } catch {
        setScreenshots(prev => prev.map(s =>
          s.id === item.id ? { ...s, blobUrl: s.preview, uploading: false } : s
        ))
      }
    }
  }

  async function handleSave() {
    if (!url.trim()) return
    setSaving(true)

    const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean)
    const now = new Date().toISOString()
    const inspirationId = uuid()

    const screenshotData: InspirationScreenshot[] = screenshots.map(s => ({
      id: s.id,
      imageUrl: s.blobUrl || s.preview,
      title: s.title,
      note: s.note,
      savedToRefs: true,
      refId: s.id,
    }))

    // Build references from screenshots — linked back to this inspiration.
    const refs: Reference[] = screenshots.map(s => ({
      id: s.id,
      title: s.title || 'Inspiration screenshot',
      imageUrl: s.blobUrl || s.preview,
      note: s.note,
      category: category,
      tags: parsedTags,
      source: 'inspiration',
      inspirationId,
      sourceUrl: url.trim(),
      createdAt: now,
      updatedAt: now,
    }))

    const inspiration: Inspiration = {
      id: inspirationId,
      url: url.trim(),
      howToUse: howToUse.trim(),
      category,
      tags: parsedTags,
      screenshots: screenshotData,
      createdAt: now,
      updatedAt: now,
    }

    onSuccess(inspiration, refs)
    reset()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(47,65,86,0.5)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) { reset(); onClose() } }}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="w-full max-w-lg rounded-[24px] overflow-hidden"
            style={{ background: '#F5F8FA', border: '1px solid #DFE3EB', boxShadow: '0 24px 64px rgba(47,65,86,0.25)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid #DFE3EB' }}>
              <h2 className="font-bold text-[15px]" style={{ color: '#33475B' }}>Add Inspiration</h2>
              <button onClick={() => { reset(); onClose() }} style={{ color: '#7C98B6' }}>
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">

              {/* URL */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#7C98B6' }}>Video URL *</label>
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/…"
                  className="cs-input w-full"
                  autoFocus
                />
              </div>

              {/* How to use */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#7C98B6' }}>How I'll use this *</label>
                <textarea
                  value={howToUse}
                  onChange={e => setHowToUse(e.target.value)}
                  placeholder="e.g. Use the hook format for product reveals. The slow zoom + audio drop works great for Faasle drops…"
                  className="cs-input w-full resize-none"
                  rows={3}
                />
              </div>

              {/* Category + Tags */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#7C98B6' }}>Category *</label>
                  <CustomSelect value={category} onChange={setCategory} options={categories.map(c => c.name)} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#7C98B6' }}>Tags</label>
                  <input
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    placeholder="#hook, #reveal, #product"
                    className="cs-input w-full"
                  />
                </div>
              </div>

              {/* Screenshots */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#7C98B6' }}>
                  Screenshots from video
                  <span className="ml-1 font-normal normal-case" style={{ color: '#99ACC2' }}>— also saved to your References library</span>
                </label>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => e.target.files && handleFiles(e.target.files)}
                />

                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 py-5 rounded-[14px] transition-all"
                  style={{ background: '#FFFFFF', border: '1.5px dashed #DFE3EB' }}
                >
                  <Upload size={20} style={{ color: '#7C98B6' }} />
                  <span className="text-xs font-semibold" style={{ color: '#7C98B6' }}>
                    Click to upload screenshots (multiple)
                  </span>
                </button>

                {/* Preview grid */}
                {screenshots.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {screenshots.map(s => (
                      <div
                        key={s.id}
                        className="flex gap-3 p-3 rounded-xl"
                        style={{ background: '#FFFFFF', border: '1px solid #DFE3EB' }}
                      >
                        <div className="relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden" style={{ background: '#EAF0F6' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={s.preview} alt="" className="w-full h-full object-cover" />
                          {s.uploading && (
                            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(47,65,86,0.5)' }}>
                              <Loader2 size={14} className="animate-spin text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <input
                            value={s.title}
                            onChange={e => setScreenshots(prev => prev.map(x => x.id === s.id ? { ...x, title: e.target.value } : x))}
                            placeholder="Title (e.g. Slow zoom reveal)"
                            className="cs-input w-full text-xs py-1.5"
                          />
                          <input
                            value={s.note}
                            onChange={e => setScreenshots(prev => prev.map(x => x.id === s.id ? { ...x, note: e.target.value } : x))}
                            placeholder="Note — how/when to use this"
                            className="cs-input w-full text-xs py-1.5"
                          />
                        </div>
                        <button
                          onClick={() => setScreenshots(prev => prev.filter(x => x.id !== s.id))}
                          style={{ color: '#7C98B6', flexShrink: 0 }}
                          className="self-start"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid #DFE3EB' }}>
              <button className="cs-btn-outline flex-1 py-2.5 rounded-[10px] text-sm font-semibold" onClick={() => { reset(); onClose() }}>
                Cancel
              </button>
              <button
                className="cs-btn flex-1 py-2.5 rounded-[10px] text-sm flex items-center justify-center gap-2"
                onClick={handleSave}
                disabled={!url.trim() || !howToUse.trim() || saving}
              >
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Save Inspiration'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
