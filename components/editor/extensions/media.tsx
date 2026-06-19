'use client'
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react'

/* ── helpers ─────────────────────────────────────────────── */
export function toEmbedUrl(raw: string): string {
  try {
    const u = new URL(raw)
    const host = u.hostname.replace(/^www\./, '')
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = u.searchParams.get('v')
      if (id) return `https://www.youtube.com/embed/${id}`
    }
    if (host === 'youtu.be') return `https://www.youtube.com/embed/${u.pathname.slice(1)}`
    if (host === 'vimeo.com') return `https://player.vimeo.com/video/${u.pathname.split('/').filter(Boolean)[0]}`
    if (host === 'loom.com' && u.pathname.includes('/share/')) return raw.replace('/share/', '/embed/')
    return raw
  } catch { return raw }
}

/* ── Audio ───────────────────────────────────────────────── */
function AudioView({ node }: NodeViewProps) {
  return (
    <NodeViewWrapper>
      <div className="cs-media cs-audio" contentEditable={false}>
        {node.attrs.title && <p className="cs-media-title">{node.attrs.title}</p>}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio controls src={node.attrs.src} style={{ width: '100%' }} />
      </div>
    </NodeViewWrapper>
  )
}
export const AudioBlock = Node.create({
  name: 'audio',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() { return { src: { default: '' }, title: { default: '' } } },
  parseHTML() { return [{ tag: 'div[data-type="audio"]' }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'audio' })] },
  addNodeView() { return ReactNodeViewRenderer(AudioView) },
})

/* ── Video (uploaded file) ──────────────────────────────── */
function VideoView({ node }: NodeViewProps) {
  return (
    <NodeViewWrapper>
      <div className="cs-media cs-video" contentEditable={false}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video controls src={node.attrs.src} style={{ width: '100%', borderRadius: 8 }} />
      </div>
    </NodeViewWrapper>
  )
}
export const VideoBlock = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() { return { src: { default: '' } } },
  parseHTML() { return [{ tag: 'video[src]' }] },
  renderHTML({ HTMLAttributes }) { return ['div', { 'data-type': 'video' }, ['video', mergeAttributes(HTMLAttributes, { controls: 'true' })]] },
  addNodeView() { return ReactNodeViewRenderer(VideoView) },
})

/* ── Embed (iframe: YouTube / Vimeo / Loom / any URL) ─────── */
function EmbedView({ node }: NodeViewProps) {
  const src = toEmbedUrl(node.attrs.src)
  return (
    <NodeViewWrapper>
      <div className="cs-media cs-embed" contentEditable={false}>
        <iframe src={src} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="embed" />
      </div>
    </NodeViewWrapper>
  )
}
export const EmbedBlock = Node.create({
  name: 'embed',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() { return { src: { default: '' } } },
  parseHTML() { return [{ tag: 'div[data-type="embed"]' }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'embed' })] },
  addNodeView() { return ReactNodeViewRenderer(EmbedView) },
})

/* ── File attachment ─────────────────────────────────────── */
function FileView({ node }: NodeViewProps) {
  const { src, name, size } = node.attrs
  return (
    <NodeViewWrapper>
      <a className="cs-file" href={src} target="_blank" rel="noopener noreferrer" contentEditable={false}>
        <span className="cs-file-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </span>
        <span className="cs-file-meta">
          <span className="cs-file-name">{name || 'File'}</span>
          {size && <span className="cs-file-size">{size}</span>}
        </span>
        <span className="cs-file-dl">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </span>
      </a>
    </NodeViewWrapper>
  )
}
export const FileBlock = Node.create({
  name: 'fileBlock',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() { return { src: { default: '' }, name: { default: '' }, size: { default: '' } } },
  parseHTML() { return [{ tag: 'a[data-type="file"]' }] },
  renderHTML({ HTMLAttributes }) { return ['a', mergeAttributes(HTMLAttributes, { 'data-type': 'file' })] },
  addNodeView() { return ReactNodeViewRenderer(FileView) },
})

/* ── Web bookmark ────────────────────────────────────────── */
function BookmarkView({ node }: NodeViewProps) {
  const { url, title, description, image, favicon } = node.attrs
  let host = url
  try { host = new URL(url).hostname.replace(/^www\./, '') } catch { /* keep raw */ }
  return (
    <NodeViewWrapper>
      <a className="cs-bookmark" href={url} target="_blank" rel="noopener noreferrer" contentEditable={false}>
        <div className="cs-bookmark-text">
          <div className="cs-bookmark-title">{title || url}</div>
          {description && <div className="cs-bookmark-desc">{description}</div>}
          <div className="cs-bookmark-host">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {favicon && <img src={favicon} alt="" width={14} height={14} />}
            <span>{host}</span>
          </div>
        </div>
        {image && (
          <div className="cs-bookmark-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" />
          </div>
        )}
      </a>
    </NodeViewWrapper>
  )
}
export const BookmarkBlock = Node.create({
  name: 'bookmark',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return { url: { default: '' }, title: { default: '' }, description: { default: '' }, image: { default: '' }, favicon: { default: '' } }
  },
  parseHTML() { return [{ tag: 'a[data-type="bookmark"]' }] },
  renderHTML({ HTMLAttributes }) { return ['a', mergeAttributes(HTMLAttributes, { 'data-type': 'bookmark' })] },
  addNodeView() { return ReactNodeViewRenderer(BookmarkView) },
})
