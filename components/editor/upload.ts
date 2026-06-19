import { toast } from '@/lib/toast'

/** Upload a file to Vercel Blob via the shared references endpoint, returns its URL. */
export async function uploadEditorFile(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch('/api/references/upload', { method: 'POST', body: fd })
  if (!res.ok) throw new Error('upload failed')
  return (await res.json()).url as string
}

/** Open the native file picker and resolve with the chosen file (or null if cancelled). */
export function pickFile(accept: string): Promise<File | null> {
  return new Promise(resolve => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    let settled = false
    const done = (f: File | null) => { if (!settled) { settled = true; resolve(f) } }
    input.onchange = () => done(input.files?.[0] ?? null)
    // Fallback for cancel (no change event) — resolve null once focus returns.
    window.addEventListener('focus', () => setTimeout(() => done(null), 400), { once: true })
    input.click()
  })
}

/** Pick a file then upload it, with toasts. Returns the URL or null. */
export async function pickAndUpload(accept: string): Promise<{ url: string; file: File } | null> {
  const file = await pickFile(accept)
  if (!file) return null
  try {
    toast('Uploading…')
    const url = await uploadEditorFile(file)
    return { url, file }
  } catch {
    toast('Upload failed', 'error')
    return null
  }
}

export function humanSize(bytes?: number): string {
  if (!bytes) return ''
  const u = ['B', 'KB', 'MB', 'GB']
  let i = 0, n = bytes
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++ }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${u[i]}`
}
