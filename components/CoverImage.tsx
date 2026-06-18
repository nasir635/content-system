'use client'
import { useRef, useState } from 'react'
import { toast } from '@/lib/toast'

// Reusable cover-image control: add / change / remove. Uploads to Vercel Blob.
export function CoverImage({ value, onChange, onRemove, height = 160 }: {
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
  height?: number
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

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
      <img src={value} alt="Cover" className="w-full h-full object-cover" />
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => fileRef.current?.click()} className="text-xs font-semibold px-2.5 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.94)', color: '#33475B' }}>{busy ? '…' : 'Change'}</button>
        <button onClick={onRemove} className="text-xs font-semibold px-2.5 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.94)', color: '#B04A4A' }}>Remove</button>
      </div>
      {input}
    </div>
  )
}
