import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isConfigured, verifyPassword, setPassword } from '@/lib/serverAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const COOKIE = 'cos_session'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days
const SECURE = process.env.NODE_ENV === 'production'

function isAuthed(): boolean {
  const c = cookies().get(COOKIE)?.value
  return !!c && !!process.env.AUTH_SECRET && c === process.env.AUTH_SECRET
}

function setSession(res: NextResponse) {
  res.cookies.set(COOKIE, process.env.AUTH_SECRET!, {
    httpOnly: true, secure: SECURE, sameSite: 'lax', path: '/', maxAge: MAX_AGE,
  })
}

export async function GET() {
  return NextResponse.json({
    configured: await isConfigured(),
    authed: isAuthed(),
    storage: !!process.env.BLOB_READ_WRITE_TOKEN,
  })
}

export async function POST(req: NextRequest) {
  let body: { action?: string; password?: string; current?: string; next?: string } = {}
  try { body = await req.json() } catch { /* empty */ }
  const { action, password, current, next } = body

  if (action === 'logout') {
    const res = NextResponse.json({ ok: true })
    res.cookies.set(COOKIE, '', { httpOnly: true, secure: SECURE, sameSite: 'lax', path: '/', maxAge: 0 })
    return res
  }

  if (!process.env.AUTH_SECRET) {
    return NextResponse.json({ ok: false, error: 'Auth is not configured on the server (missing AUTH_SECRET).' }, { status: 500 })
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ ok: false, error: 'Storage is not connected, so the password cannot be saved.' }, { status: 500 })
  }

  if (action === 'setup') {
    if (await isConfigured()) return NextResponse.json({ ok: false, error: 'A password is already set.' }, { status: 400 })
    if (!password || password.length < 6) return NextResponse.json({ ok: false, error: 'Password must be at least 6 characters.' }, { status: 400 })
    await setPassword(password)
    const res = NextResponse.json({ ok: true })
    setSession(res)
    return res
  }

  if (action === 'login') {
    if (!(await verifyPassword(password ?? ''))) return NextResponse.json({ ok: false, error: 'Incorrect password.' }, { status: 401 })
    const res = NextResponse.json({ ok: true })
    setSession(res)
    return res
  }

  if (action === 'change') {
    if (!isAuthed()) return NextResponse.json({ ok: false, error: 'Not authenticated.' }, { status: 401 })
    if (!(await verifyPassword(current ?? ''))) return NextResponse.json({ ok: false, error: 'Current password is incorrect.' }, { status: 401 })
    if (!next || next.length < 6) return NextResponse.json({ ok: false, error: 'New password must be at least 6 characters.' }, { status: 400 })
    await setPassword(next)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: false, error: 'Unknown action.' }, { status: 400 })
}
