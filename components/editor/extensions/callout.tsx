'use client'
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewContent, NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'

export const CALLOUT_COLORS = [
  { key: 'gray',   bg: '#EFF3F7', border: '#DCE3EB' },
  { key: 'blue',   bg: '#E6F3F8', border: '#BBE0EA' },
  { key: 'green',  bg: '#E9F4EB', border: '#C2E0C8' },
  { key: 'yellow', bg: '#FCF4DD', border: '#EBD9A6' },
  { key: 'red',    bg: '#FBEBE7', border: '#F0C5BA' },
  { key: 'purple', bg: '#F1EBF7', border: '#D9C8EA' },
]
const ICONS = ['💡', '📌', '⚠️', '✅', '🔥', '📝', '❗', '⭐', '🎬', '🎯', '📣', '❓', 'ℹ️', '🚀', '💬', '🔔']

function CalloutView({ node, updateAttributes }: NodeViewProps) {
  const [openIcon, setOpenIcon] = useState(false)
  const [openColor, setOpenColor] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const color = CALLOUT_COLORS.find(c => c.key === node.attrs.color) ?? CALLOUT_COLORS[0]

  useEffect(() => {
    function close(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as HTMLElement)) { setOpenIcon(false); setOpenColor(false) }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <NodeViewWrapper>
      <div ref={wrapRef} className="cs-callout" style={{ background: color.bg, borderColor: color.border }}>
        <div className="cs-callout-icon" contentEditable={false}>
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => { setOpenIcon(v => !v); setOpenColor(false) }}>
            {node.attrs.icon}
          </button>
          {openIcon && (
            <div className="cs-pop cs-pop-icons">
              {ICONS.map(e => (
                <button key={e} type="button" onMouseDown={ev => ev.preventDefault()} onClick={() => { updateAttributes({ icon: e }); setOpenIcon(false) }}>{e}</button>
              ))}
            </div>
          )}
        </div>
        <NodeViewContent className="cs-callout-body" />
        <div className="cs-callout-color" contentEditable={false}>
          <button type="button" title="Background color" onMouseDown={e => e.preventDefault()} onClick={() => { setOpenColor(v => !v); setOpenIcon(false) }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
          </button>
          {openColor && (
            <div className="cs-pop cs-pop-colors">
              {CALLOUT_COLORS.map(c => (
                <button key={c.key} type="button" title={c.key} style={{ background: c.bg, borderColor: c.border }}
                  onMouseDown={ev => ev.preventDefault()} onClick={() => { updateAttributes({ color: c.key }); setOpenColor(false) }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,
  addAttributes() {
    return {
      icon: { default: '💡' },
      color: { default: 'gray' },
    }
  },
  parseHTML() { return [{ tag: 'div[data-type="callout"]' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'callout' }), 0]
  },
  addNodeView() { return ReactNodeViewRenderer(CalloutView) },
})
