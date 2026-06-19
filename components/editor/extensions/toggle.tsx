'use client'
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewContent, NodeViewWrapper, type NodeViewProps } from '@tiptap/react'

/**
 * Notion-style toggle: a `details` node holding a summary line and a collapsible
 * content area. Open/closed state lives on the `details` node's `open` attribute.
 */

function DetailsView({ node, updateAttributes }: NodeViewProps) {
  const open = node.attrs.open !== false
  return (
    <NodeViewWrapper>
      <div className="cs-toggle" data-open={open ? 'true' : 'false'}>
        <button
          type="button"
          className="cs-toggle-caret"
          contentEditable={false}
          onMouseDown={e => e.preventDefault()}
          onClick={() => updateAttributes({ open: !open })}
          aria-label={open ? 'Collapse' : 'Expand'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5l8 7-8 7z" /></svg>
        </button>
        <NodeViewContent className="cs-toggle-inner" />
      </div>
    </NodeViewWrapper>
  )
}

export const Details = Node.create({
  name: 'details',
  group: 'block',
  content: 'detailsSummary detailsContent',
  defining: true,
  isolating: true,
  addAttributes() {
    return {
      open: {
        default: true,
        parseHTML: el => (el as HTMLElement).getAttribute('data-open') !== 'false',
        renderHTML: attrs => ({ 'data-open': attrs.open ? 'true' : 'false' }),
      },
    }
  },
  parseHTML() { return [{ tag: 'div[data-type="toggle"]' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'toggle' }), 0]
  },
  addNodeView() { return ReactNodeViewRenderer(DetailsView) },
})

export const DetailsSummary = Node.create({
  name: 'detailsSummary',
  content: 'inline*',
  defining: true,
  selectable: false,
  parseHTML() { return [{ tag: 'div[data-type="toggle-summary"]' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'toggle-summary', class: 'cs-toggle-summary' }), 0]
  },
})

export const DetailsContent = Node.create({
  name: 'detailsContent',
  content: 'block+',
  defining: true,
  selectable: false,
  parseHTML() { return [{ tag: 'div[data-type="toggle-content"]' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'toggle-content', class: 'cs-toggle-content' }), 0]
  },
})
