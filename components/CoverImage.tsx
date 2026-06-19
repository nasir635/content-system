'use client'
import { useRef, useState } from 'react'
import { toast } from '@/lib/toast'

// Reusable cover-image control: add / change / reposition / remove. Uploads to Vercel Blob.
export function CoverImage({ value, onChange, onRemove, height = 160, position = 50, onPositionChange }: {
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
  height?: number
  position?: number
  onPositionChange?: (pos: number) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [reposition, setReposition] = useState(false)
  const drag = useRef<{ startY: number; startPos: number } | null>(null)

  async function upload(files: FileList) {
    const file = files[0]
    if (!file) return
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/references/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error()
      onChange((await res.json()).url)
      toast('Cover updated')
    } catch { toast('Cover upload failed', 'error') }
    setBusy(false)
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!reposition) return
    e.preventDefault()
    drag.current = { startY: e.clientY, startPos: position }
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId) } catch { /* noop */ }
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!reposition || !drag.current || !onPositionChange) return
    const delta = e.clientY - drag.current.startY
    // Drag down → reveal more of the top (objectPosition Y decreases).
    const next = Math.max(0, Math.min(100, drag.current.startPos - (delta / height) * 100))
    onPositionChange(Math.round(next))
  }
  function onPointerUp(e: React.PointerEvent) {
    if (drag.current) { try { (e.target as HTMLElement).releasePointerCapture(e.pointerId) } catch { /* noop */ } }
    drag.current = null
  }

  const input = (
    <input ref={fileRef} type="file" accept="image/*" className="hidden"
      onChange={e => { if (e.target.files) upload(e.target.files); e.target.value = '' }} />
  )

  if (!value) {
    return (
      <button onClick={() => fileRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-colors"
        style={{ height: 56, border: '1.5px dashed #CBD6E2', color: '#7C98B6', background: '#FFFFFF' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        {busy ? 'Uploading…' : 'Add cover image'}
        {input}
      </button>
    )
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden group" style={{ height }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={value}
        alt="Cover"
        className="w-full h-full object-cover select-none"
        draggable={false}
        style={{ objectPosition: `center ${position}%`, cursor: reposition ? (drag.current ? 'grabbing' : 'grab') : 'default', touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />

      {reposition && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 py-2"
          style={{ background: 'linear-gradient(to top, rgba(33,51,67,0.72), transparent)', pointerEvents: 'none' }}>
          <span className="text-xs font-semibold" style={{ color: '#fff' }}>Drag image to reposition</span>
        </div>
      )}

      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: reposition ? 1 : undefined }}>
        {onPositionChange && (
          reposition ? (
            <button onClick={() => setReposition(false)} className="text-xs font-semibold px-2.5 py-1 rounded-md" style={{ background: '#33475B', color: '#fff' }}>Save position</button>
          ) : (
            <button onClick={() => setReposition(true)} className="text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.94)', color: '#33475B' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>
              Reposition
            </button>
          )
        )}
        {!reposition && <button onClick={() => fileRef.current?.click()} className="text-xs font-semibold px-2.5 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.94)', color: '#33475B' }}>{busy ? '…' : 'Change'}</button>}
        {!reposition && <button onClick={onRemove} className="text-xs font-semibold px-2.5 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.94)', color: '#B04A4A' }}>Remove</button>}
      </div>
      {input}
    </div>
  )
}
