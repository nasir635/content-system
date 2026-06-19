'use client'
import { Extension, type Editor, type Range } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import tippy, { type Instance } from 'tippy.js'
import {
  Type, Heading1, Heading2, Heading3, ListChecks, List, ListOrdered, ChevronRight,
  Quote, Lightbulb, Minus, Code2, Table as TableIcon, Columns2, Columns3,
  ListTree, Sigma, Image as ImageIcon, Video, Music, Paperclip, Bookmark, Globe,
  type LucideIcon,
} from 'lucide-react'
import { makeColumns } from './extensions/columns'
import { toEmbedUrl } from './extensions/media'
import { pickAndUpload } from './upload'
import { humanSize } from './upload'
import { toast } from '@/lib/toast'

export interface SlashItem {
  title: string
  subtitle: string
  group: 'Basic' | 'Media' | 'Advanced'
  keywords: string
  icon: LucideIcon
  command: (props: { editor: Editor; range: Range }) => void
}

/** Place the cursor where the slash was, then run a block insertion. */
function at(editor: Editor, range: Range) {
  return editor.chain().focus().deleteRange(range)
}

async function fetchBookmark(url: string) {
  try {
    const res = await fetch(`/api/bookmark?url=${encodeURIComponent(url)}`)
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return { url, title: url, description: '', image: '', favicon: '' }
  }
}

export const SLASH_ITEMS: SlashItem[] = [
  // ── Basic ──
  { title: 'Text', subtitle: 'Plain paragraph', group: 'Basic', keywords: 'text paragraph plain body', icon: Type,
    command: ({ editor, range }) => at(editor, range).setParagraph().run() },
  { title: 'Heading 1', subtitle: 'Large section heading', group: 'Basic', keywords: 'h1 title big heading', icon: Heading1,
    command: ({ editor, range }) => at(editor, range).setNode('heading', { level: 1 }).run() },
  { title: 'Heading 2', subtitle: 'Medium section heading', group: 'Basic', keywords: 'h2 subtitle heading', icon: Heading2,
    command: ({ editor, range }) => at(editor, range).setNode('heading', { level: 2 }).run() },
  { title: 'Heading 3', subtitle: 'Small section heading', group: 'Basic', keywords: 'h3 heading', icon: Heading3,
    command: ({ editor, range }) => at(editor, range).setNode('heading', { level: 3 }).run() },
  { title: 'To-do list', subtitle: 'Track tasks with checkboxes', group: 'Basic', keywords: 'todo task checkbox check', icon: ListChecks,
    command: ({ editor, range }) => at(editor, range).toggleTaskList().run() },
  { title: 'Bulleted list', subtitle: 'Simple bullet points', group: 'Basic', keywords: 'bullet unordered list ul', icon: List,
    command: ({ editor, range }) => at(editor, range).toggleBulletList().run() },
  { title: 'Numbered list', subtitle: 'Ordered list', group: 'Basic', keywords: 'numbered ordered list ol', icon: ListOrdered,
    command: ({ editor, range }) => at(editor, range).toggleOrderedList().run() },
  { title: 'Toggle list', subtitle: 'Collapsible content', group: 'Basic', keywords: 'toggle collapse expand details accordion', icon: ChevronRight,
    command: ({ editor, range }) => at(editor, range).insertContent({
      type: 'details', attrs: { open: true },
      content: [{ type: 'detailsSummary' }, { type: 'detailsContent', content: [{ type: 'paragraph' }] }],
    }).run() },
  { title: 'Quote', subtitle: 'Capture a quotation', group: 'Basic', keywords: 'quote blockquote cite', icon: Quote,
    command: ({ editor, range }) => at(editor, range).toggleBlockquote().run() },
  { title: 'Callout', subtitle: 'Make text stand out', group: 'Basic', keywords: 'callout note info box highlight', icon: Lightbulb,
    command: ({ editor, range }) => at(editor, range).insertContent({
      type: 'callout', attrs: { icon: '💡', color: 'gray' }, content: [{ type: 'paragraph' }],
    }).run() },
  { title: 'Divider', subtitle: 'Visual separator', group: 'Basic', keywords: 'divider hr line separator rule', icon: Minus,
    command: ({ editor, range }) => at(editor, range).setHorizontalRule().run() },
  { title: 'Code', subtitle: 'Code block with syntax', group: 'Basic', keywords: 'code snippet pre', icon: Code2,
    command: ({ editor, range }) => at(editor, range).setCodeBlock().run() },

  // ── Media ──
  { title: 'Image', subtitle: 'Upload a picture', group: 'Media', keywords: 'image picture photo upload img', icon: ImageIcon,
    command: ({ editor, range }) => {
      at(editor, range).run()
      const pos = editor.state.selection.from
      pickAndUpload('image/*').then(r => { if (r) { editor.chain().insertContentAt(pos, { type: 'image', attrs: { src: r.url } }).run(); toast('Image added') } })
    } },
  { title: 'Video', subtitle: 'Upload a video file', group: 'Media', keywords: 'video upload movie mp4 clip', icon: Video,
    command: ({ editor, range }) => {
      at(editor, range).run()
      const pos = editor.state.selection.from
      pickAndUpload('video/*').then(r => { if (r) { editor.chain().insertContentAt(pos, { type: 'video', attrs: { src: r.url } }).run(); toast('Video added') } })
    } },
  { title: 'Embed', subtitle: 'YouTube, Vimeo, Loom, any URL', group: 'Media', keywords: 'embed youtube vimeo loom iframe url video link', icon: Globe,
    command: ({ editor, range }) => {
      const url = window.prompt('Paste a link to embed (YouTube, Vimeo, Loom, …)')
      at(editor, range).run()
      if (url) editor.chain().insertContent({ type: 'embed', attrs: { src: toEmbedUrl(url.trim()) } }).run()
    } },
  { title: 'Audio', subtitle: 'Upload an audio file', group: 'Media', keywords: 'audio sound music mp3 upload', icon: Music,
    command: ({ editor, range }) => {
      at(editor, range).run()
      const pos = editor.state.selection.from
      pickAndUpload('audio/*').then(r => { if (r) { editor.chain().insertContentAt(pos, { type: 'audio', attrs: { src: r.url, title: r.file.name.replace(/\.[^.]+$/, '') } }).run(); toast('Audio added') } })
    } },
  { title: 'File', subtitle: 'Upload any attachment', group: 'Media', keywords: 'file attachment upload document pdf', icon: Paperclip,
    command: ({ editor, range }) => {
      at(editor, range).run()
      const pos = editor.state.selection.from
      pickAndUpload('*').then(r => { if (r) { editor.chain().insertContentAt(pos, { type: 'fileBlock', attrs: { src: r.url, name: r.file.name, size: humanSize(r.file.size) } }).run(); toast('File added') } })
    } },
  { title: 'Bookmark', subtitle: 'Visual link to a web page', group: 'Media', keywords: 'bookmark link url web preview card', icon: Bookmark,
    command: ({ editor, range }) => {
      const url = window.prompt('Paste a link to bookmark')
      at(editor, range).run()
      if (!url) return
      const pos = editor.state.selection.from
      toast('Fetching link…')
      fetchBookmark(url.trim()).then(meta => editor.chain().insertContentAt(pos, { type: 'bookmark', attrs: meta }).run())
    } },

  // ── Advanced ──
  { title: 'Table', subtitle: 'Rows and columns', group: 'Advanced', keywords: 'table grid rows columns', icon: TableIcon,
    command: ({ editor, range }) => at(editor, range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { title: '2 columns', subtitle: 'Side-by-side layout', group: 'Advanced', keywords: 'columns two layout split', icon: Columns2,
    command: ({ editor, range }) => at(editor, range).insertContent(makeColumns(2)).run() },
  { title: '3 columns', subtitle: 'Three-column layout', group: 'Advanced', keywords: 'columns three layout split', icon: Columns3,
    command: ({ editor, range }) => at(editor, range).insertContent(makeColumns(3)).run() },
  { title: 'Table of contents', subtitle: 'Auto links to headings', group: 'Advanced', keywords: 'table of contents toc outline', icon: ListTree,
    command: ({ editor, range }) => at(editor, range).insertContent({ type: 'tableOfContents' }).run() },
  { title: 'Equation', subtitle: 'LaTeX math block', group: 'Advanced', keywords: 'equation math latex formula katex', icon: Sigma,
    command: ({ editor, range }) => at(editor, range).insertContent({ type: 'mathBlock', attrs: { latex: '' } }).run() },
]

/* ── React dropdown list ─────────────────────────────────── */
interface ListProps { items: SlashItem[]; command: (item: SlashItem) => void }
export interface ListHandle { onKeyDown: (p: { event: KeyboardEvent }) => boolean }

const SlashList = forwardRef<ListHandle, ListProps>(function SlashList({ items, command }, ref) {
  const [active, setActive] = useState(0)
  useEffect(() => setActive(0), [items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowDown') { setActive(i => (i + 1) % items.length); return true }
      if (event.key === 'ArrowUp') { setActive(i => (i - 1 + items.length) % items.length); return true }
      if (event.key === 'Enter') { if (items[active]) command(items[active]); return true }
      return false
    },
  }))

  if (!items.length) return <div className="cs-slash"><div className="cs-slash-empty">No matches</div></div>

  let lastGroup = ''
  return (
    <div className="cs-slash">
      {items.map((item, i) => {
        const header = item.group !== lastGroup ? (lastGroup = item.group, item.group) : null
        const Icon = item.icon
        return (
          <div key={item.title}>
            {header && <div className="cs-slash-group">{header}</div>}
            <button
              type="button"
              className={`cs-slash-item${i === active ? ' is-active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={e => e.preventDefault()}
              onClick={() => command(item)}
            >
              <span className="cs-slash-ico"><Icon size={17} strokeWidth={1.9} /></span>
              <span className="cs-slash-text">
                <span className="cs-slash-title">{item.title}</span>
                <span className="cs-slash-sub">{item.subtitle}</span>
              </span>
            </button>
          </div>
        )
      })}
    </div>
  )
})

/* ── Slash command extension ─────────────────────────────── */
const slashPluginKey = new PluginKey('slashCommand')

export const SlashCommand = Extension.create({
  name: 'slashCommand',
  addProseMirrorPlugins() {
    return [
      Suggestion<SlashItem>({
        pluginKey: slashPluginKey,
        editor: this.editor,
        char: '/',
        allowSpaces: false,
        allowedPrefixes: null,
        startOfLine: false,
        command: ({ editor, range, props }) => props.command({ editor, range }),
        items: ({ query }) => {
          const q = query.toLowerCase().trim()
          if (!q) return SLASH_ITEMS
          return SLASH_ITEMS.filter(i =>
            i.title.toLowerCase().includes(q) || i.keywords.includes(q),
          )
        },
        render: () => {
          let component: ReactRenderer<ListHandle, ListProps> | null = null
          let popup: Instance | null = null
          return {
            onStart: props => {
              component = new ReactRenderer(SlashList, {
                props: { items: props.items, command: (item: SlashItem) => props.command(item) },
                editor: props.editor,
              })
              if (!props.clientRect) return
              popup = tippy(document.body, {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                theme: 'cs-plain',
                maxWidth: 'none',
              })
            },
            onUpdate: props => {
              component?.updateProps({ items: props.items, command: (item: SlashItem) => props.command(item) })
              if (props.clientRect) popup?.setProps({ getReferenceClientRect: props.clientRect as () => DOMRect })
            },
            onKeyDown: props => {
              if (props.event.key === 'Escape') { popup?.hide(); return true }
              return component?.ref?.onKeyDown(props) ?? false
            },
            onExit: () => { popup?.destroy(); component?.destroy(); popup = null; component = null },
          }
        },
      }),
    ]
  },
})
