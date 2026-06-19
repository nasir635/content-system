import { NextRequest, NextResponse } from 'next/server'

function pick(html: string, patterns: RegExp[]): string {
  for (const re of patterns) {
    const m = html.match(re)
    if (m?.[1]) return m[1].trim()
  }
  return ''
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'").replace(/&nbsp;/g, ' ')
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'No url' }, { status: 400 })
  let target: URL
  try { target = new URL(url) } catch { return NextResponse.json({ error: 'Bad url' }, { status: 400 }) }

  const fallback = { url, title: url, description: '', image: '', favicon: `${target.origin}/favicon.ico` }
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ContentOS/1.0; +bookmark)' },
      signal: AbortSignal.timeout(7000),
    })
    if (!res.ok) return NextResponse.json(fallback)
    const html = (await res.text()).slice(0, 200_000)

    const title = decode(pick(html, [
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i,
      /<title[^>]*>([^<]+)<\/title>/i,
    ])) || url
    const description = decode(pick(html, [
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    ]))
    let image = pick(html, [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    ])
    if (image && image.startsWith('//')) image = target.protocol + image
    else if (image && image.startsWith('/')) image = target.origin + image

    return NextResponse.json({
      url,
      title: title.slice(0, 160),
      description: description.slice(0, 220),
      image,
      favicon: `https://www.google.com/s2/favicons?domain=${target.hostname}&sz=64`,
    })
  } catch {
    return NextResponse.json(fallback)
  }
}
