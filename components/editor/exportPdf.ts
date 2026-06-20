// Render a script into a clean, print-ready document and open the browser's
// print pipeline (where "Save as PDF" downloads the file, or it prints directly).
// Text stays vector/selectable; inline color/font/spacing styles are preserved.

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const PRINT_CSS = `
  @page { margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    color: #1f2733; font-size: 12.5pt; line-height: 1.6;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .doc { max-width: 720px; margin: 0 auto; }
  .doc-title { font-size: 24pt; font-weight: 800; margin: 0 0 4px; line-height: 1.15; }
  .doc-meta { font-size: 9.5pt; color: #6b7c8f; margin: 0 0 16px; }
  .doc-cover { width: 100%; max-height: 260px; object-fit: cover; border-radius: 8px; margin: 0 0 18px; break-inside: avoid; }

  h1 { font-size: 19pt; font-weight: 700; margin: 18px 0 8px; }
  h2 { font-size: 15.5pt; font-weight: 700; margin: 16px 0 6px; }
  h3 { font-size: 13.5pt; font-weight: 700; margin: 14px 0 5px; }
  p { margin: 6px 0; }
  a { color: #0a6c80; text-decoration: underline; }
  strong { font-weight: 700; } em { font-style: italic; }
  mark { background: #ffe9b0; padding: 0 2px; border-radius: 2px; }
  code { background: #eef2f6; padding: 1px 4px; border-radius: 3px; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: .92em; }
  pre { background: #f4f6f9; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; overflow: auto; break-inside: avoid; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 3px solid #cbd6e2; margin: 8px 0; padding: 2px 0 2px 14px; color: #44586b; }
  hr { border: none; border-top: 1px solid #d9e0e8; margin: 16px 0; }

  ul, ol { padding-left: 24px; margin: 6px 0; }
  ul { list-style: disc; } ul ul { list-style: circle; } ul ul ul { list-style: square; }
  ol { list-style: decimal; } ol ol { list-style: lower-alpha; }
  li { margin: 3px 0; } li > p { margin: 0; }

  ul[data-type="taskList"] { list-style: none; padding-left: 2px; }
  ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 8px; }
  ul[data-type="taskList"] li > label { margin: 0; }
  ul[data-type="taskList"] input[type="checkbox"] { width: 13px; height: 13px; margin-top: 3px; }

  img { max-width: 100%; height: auto; border-radius: 6px; break-inside: avoid; }

  table { border-collapse: collapse; width: 100%; margin: 10px 0; break-inside: avoid; }
  td, th { border: 1px solid #cbd6e2; padding: 6px 9px; text-align: left; vertical-align: top; }
  th { background: #f1f5f9; font-weight: 700; }

  [data-type="callout"] { background: #f1f5f9; border: 1px solid #dce3eb; border-radius: 8px; padding: 10px 14px; margin: 10px 0; break-inside: avoid; }
  [data-type="callout"] p { margin: 2px 0; }

  [data-type="toggle"] { margin: 8px 0; }
  [data-type="toggle-summary"] { font-weight: 600; }
  [data-type="toggle-content"] { padding-left: 14px; border-left: 2px solid #e2e8f0; margin-top: 2px; }

  [data-type="column-list"] { display: flex; gap: 18px; margin: 10px 0; }
  [data-type="column"] { flex: 1; }

  [data-type="math"]::before { content: attr(latex); font-family: ui-monospace, Menlo, monospace; background: #f4f6f9; padding: 6px 10px; border-radius: 6px; display: block; text-align: center; }
  [data-type="toc"] { display: none; }
  iframe { display: none; }

  a[data-type="bookmark"], a[data-type="file"] { display: inline-block; color: #0a6c80; }
`

export function buildScriptPrintHtml(opts: { title: string; bodyHtml: string; coverImage?: string; coverPosition?: number; meta?: string }): string {
  const { title, bodyHtml, coverImage, coverPosition = 50, meta } = opts
  const safeTitle = esc(title || 'Untitled script')
  const cover = coverImage
    ? `<img class="doc-cover" style="object-position:center ${coverPosition}%" src="${esc(coverImage)}" alt="" />`
    : ''
  const metaLine = meta ? `<p class="doc-meta">${esc(meta)}</p>` : ''
  return `<!doctype html><html><head><meta charset="utf-8" />
    <title>${safeTitle}</title>
    <style>${PRINT_CSS}</style></head>
    <body><div class="doc">
      <h1 class="doc-title">${safeTitle}</h1>
      ${metaLine}
      ${cover}
      ${bodyHtml || '<p></p>'}
    </div></body></html>`
}

/** Render the script to a hidden iframe and open the print dialog. */
export function printScriptPdf(opts: { title: string; bodyHtml: string; coverImage?: string; coverPosition?: number; meta?: string }) {
  const html = buildScriptPrintHtml(opts)
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  Object.assign(iframe.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0', opacity: '0' })
  document.body.appendChild(iframe)

  const cw = iframe.contentWindow
  if (!cw) { iframe.remove(); return }
  cw.document.open()
  cw.document.write(html)
  cw.document.close()

  const run = () => {
    const imgs = Array.from(cw.document.images)
    const ready = Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise<void>(res => { img.onload = img.onerror = () => res() })))
    const timeout = new Promise<void>(res => setTimeout(res, 2500))
    Promise.race([ready, timeout]).then(() => {
      cw.focus()
      cw.print()
      setTimeout(() => iframe.remove(), 1000)
    })
  }

  // Give the iframe document a tick to parse, then wait on images.
  setTimeout(run, 120)
}
