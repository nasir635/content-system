import { Node, mergeAttributes } from '@tiptap/core'

/** A horizontal container of side-by-side columns (2–5). */
export const ColumnList = Node.create({
  name: 'columnList',
  group: 'block',
  content: 'column{2,}',
  isolating: true,
  parseHTML() { return [{ tag: 'div[data-type="column-list"]' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'column-list', class: 'cs-columns' }), 0]
  },
})

/** A single column holding block content. */
export const Column = Node.create({
  name: 'column',
  content: 'block+',
  isolating: true,
  parseHTML() { return [{ tag: 'div[data-type="column"]' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'column', class: 'cs-column' }), 0]
  },
})

/** Build the JSON for an N-column layout, each seeded with an empty paragraph. */
export function makeColumns(count: number) {
  return {
    type: 'columnList',
    content: Array.from({ length: count }, () => ({
      type: 'column',
      content: [{ type: 'paragraph' }],
    })),
  }
}
