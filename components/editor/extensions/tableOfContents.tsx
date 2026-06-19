'use client'
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { useEffect, useState } from 'react'

interface Heading { level: number; text: string; pos: number }

function TocView({ editor }: NodeViewProps) {
  const [headings, setHeadings] = useState<Heading[]>([])

  useEffect(() => {
    const collect = () => {
      const out: Heading[] = []
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          out.push({ level: node.attrs.level, text: node.textContent || 'Untitled', pos })
        }
      })
      setHeadings(out)
    }
    collect()
    editor.on('update', collect)
    return () => { editor.off('update', collect) }
  }, [editor])

  function goTo(pos: number) {
    editor.chain().focus().setTextSelection(pos + 1).run()
    const dom = editor.view.nodeDOM(pos) as HTMLElement | null
    dom?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <NodeViewWrapper>
      <div className="cs-toc" contentEditable={false}>
        <div className="cs-toc-label">Table of contents</div>
        {headings.length === 0 ? (
          <p className="cs-toc-empty">Add headings to build the table of contents.</p>
        ) : (
          headings.map((h, i) => (
            <button key={i} type="button" className="cs-toc-item" style={{ paddingLeft: (h.level - 1) * 16 }} onClick={() => goTo(h.pos)}>
              {h.text}
            </button>
          ))
        )}
      </div>
    </NodeViewWrapper>
  )
}

export const TableOfContents = Node.create({
  name: 'tableOfContents',
  group: 'block',
  atom: true,
  selectable: true,
  parseHTML() { return [{ tag: 'div[data-type="toc"]' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'toc' })]
  },
  addNodeView() { return ReactNodeViewRenderer(TocView) },
})
