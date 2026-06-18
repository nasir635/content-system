import { NextRequest, NextResponse } from 'next/server'
import { put, list, del } from '@vercel/blob'

// Single-document cloud store for the whole portal. Small payload (text + image
// URLs only — the images themselves live as their own blobs). Saved on every
// change from the client, read on load from any device.

const PREFIX = 'app-state/'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function isConfigured() {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}

export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ configured: false, data: null })
  }
  try {
    const { blobs } = await list({ prefix: PREFIX })
    if (!blobs.length) return NextResponse.json({ configured: true, data: null })
    const newest = [...blobs].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0]
    const res = await fetch(newest.url, { cache: 'no-store' })
    const data = await res.json()
    return NextResponse.json({ configured: true, data })
  } catch (e) {
    return NextResponse.json({ configured: true, data: null, error: String(e) }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ configured: false, ok: false })
  }
  try {
    const body = await req.text()
    const written = await put(`${PREFIX}state.json`, body, {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'application/json',
      cacheControlMaxAge: 0,
    })
    // Drop older snapshots so the store doesn't accumulate.
    try {
      const { blobs } = await list({ prefix: PREFIX })
      await Promise.all(
        blobs.filter(b => b.url !== written.url).map(b => del(b.url).catch(() => {}))
      )
    } catch { /* cleanup is best-effort */ }
    return NextResponse.json({ configured: true, ok: true })
  } catch (e) {
    return NextResponse.json({ configured: true, ok: false, error: String(e) }, { status: 500 })
  }
}
