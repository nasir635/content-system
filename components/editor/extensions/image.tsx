'use client'
import Image from '@tiptap/extension-image'
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { useRef } from 'react'
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

function ImageView({ node, updateAttributes, selected, editor }: NodeViewProps) {
  const align: string = node.attrs.align || 'center'
  const width: number | null = node.attrs.width
  const imgRef = useRef<HTMLImageElement>(null)
  const drag = useRef<{ x: number; w: number } | null>(null)

  function down(e: React.PointerEvent) {
    e.preventDefault()
    const w = imgRef.current?.getBoundingClientRect().width ?? 0
    drag.current = { x: e.clientX, w }
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId) } catch { /* noop */ }
  }
  function move(e: React.PointerEvent, dir: 1 | -1) {
    if (!drag.current) return
    const dx = (e.clientX - drag.current.x) * dir
    const max = (editor.view.dom as HTMLElement).clientWidth || 1200
    const next = Math.max(80, Math.min(max, Math.round(drag.current.w + dx)))
    updateAttributes({ width: next })
  }
  function up(e: React.PointerEvent) {
    drag.current = null
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId) } catch { /* noop */ }
  }

  const set = (attrs: Record<string, unknown>) => (e: React.MouseEvent) => { e.preventDefault(); updateAttributes(attrs) }

  return (
    <NodeViewWrapper className="cs-image-nv" style={{ textAlign: align as React.CSSProperties['textAlign'] }} data-align={align}>
      <div className={`cs-image${selected ? ' is-selected' : ''}`} contentEditable={false}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={imgRef} src={node.attrs.src} alt={node.attrs.alt || ''} draggable={false}
          style={{ width: width ? `${width}px` : 'auto', maxWidth: '100%' }} />

        {editor.isEditable && (
          <>
            <div className="cs-image-toolbar" contentEditable={false}>
              <button type="button" className={align === 'left' ? 'on' : ''} onMouseDown={set({ align: 'left' })} title="Align left"><AlignLeft size={14} /></button>
              <button type="button" className={align === 'center' ? 'on' : ''} onMouseDown={set({ align: 'center' })} title="Align center"><AlignCenter size={14} /></button>
              <button type="button" className={align === 'right' ? 'on' : ''} onMouseDown={set({ align: 'right' })} title="Align right"><AlignRight size={14} /></button>
              <span className="cs-image-sep" />
              <button type="button" onMouseDown={set({ width: 240 })} title="Small">S</button>
              <button type="button" onMouseDown={set({ width: 440 })} title="Medium">M</button>
              <button type="button" onMouseDown={set({ width: null })} title="Full width">Full</button>
            </div>
            <span className="cs-image-handle left" onPointerDown={down} onPointerMove={e => move(e, -1)} onPointerUp={up} onPointerCancel={up} />
            <span className="cs-image-handle right" onPointerDown={down} onPointerMove={e => move(e, 1)} onPointerUp={up} onPointerCancel={up} />
          </>
        )}
      </div>
    </NodeViewWrapper>
  )
}

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: el => { const w = (el as HTMLElement).getAttribute('width'); return w ? parseInt(w, 10) : null },
        renderHTML: attrs => (attrs.width ? { width: attrs.width } : {}),
      },
      align: {
        default: 'center',
        parseHTML: el => (el as HTMLElement).getAttribute('data-align') || 'center',
        renderHTML: attrs => ({ 'data-align': attrs.align }),
      },
    }
  },
  addNodeView() { return ReactNodeViewRenderer(ImageView) },
})
