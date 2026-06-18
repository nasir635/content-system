import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE = 'cos_session'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always-public paths: the login screen and the auth API itself.
  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  const token = req.cookies.get(COOKIE)?.value
  const authed = !!token && !!process.env.AUTH_SECRET && token === process.env.AUTH_SECRET
  if (authed) return NextResponse.next()

  // Block API calls outright; redirect page navigations to the login screen.
  if (pathname.startsWith('/api/')) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'content-type': 'application/json' },
    })
  }

  const url = req.nextUrl.clone()
  url.pathname = '/login'
  url.search = pathname && pathname !== '/' ? `?from=${encodeURIComponent(pathname)}` : ''
  return NextResponse.redirect(url)
}

export const config = {
  // Run on everything except Next internals and the static icon files.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|icon|apple-icon|robots.txt|sitemap.xml).*)'],
}
