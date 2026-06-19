'use client'
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import katex from 'katex'

function MathView({ node, updateAttributes, editor }: NodeViewProps) {
  const latex: string = node.attrs.latex || ''
  const [editing, setEditing] = useState(!latex)
  const [draft, setDraft] = useState(latex)
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { if (editing) taRef.current?.focus() }, [editing])

  let html = ''
  let error = ''
  try {
    html = katex.renderToString(latex || '\\,', { displayMode: true, throwOnError: false })
  } catch (e) {
    error = e instanceof Error ? e.message : 'Invalid equation'
  }

  function commit() {
    updateAttributes({ latex: draft.trim() })
    setEditing(false)
  }

  if (editing) {
    return (
      <NodeViewWrapper>
        <div className="cs-math cs-math-editing" contentEditable={false}>
          <textarea
            ref={taRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); commit() }
              if (e.key === 'Escape') { e.preventDefault(); setDraft(latex); setEditing(false); editor.commands.focus() }
            }}
            placeholder="E = mc^2"
            spellCheck={false}
          />
          <div className="cs-math-preview" dangerouslySetInnerHTML={{ __html: html }} />
          <p className="cs-math-hint">LaTeX · ⌘↵ to save · Esc to cancel</p>
        </div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper>
      <div
        className="cs-math"
        contentEditable={false}
        onClick={() => { setDraft(latex); setEditing(true) }}
        title="Click to edit equation"
      >
        {latex
          ? <div dangerouslySetInnerHTML={{ __html: html }} />
          : <span className="cs-math-empty">Add an equation…</span>}
        {error && <span className="cs-math-err">{error}</span>}
      </div>
    </NodeViewWrapper>
  )
}

export const MathBlock = Node.create({
  name: 'mathBlock',
  group: 'block',
  atom: true,
  selectable: true,
  addAttributes() { return { latex: { default: '' } } },
  parseHTML() { return [{ tag: 'div[data-type="math"]' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'math' })]
  },
  addNodeView() { return ReactNodeViewRenderer(MathView) },
})
