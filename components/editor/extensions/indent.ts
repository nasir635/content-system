import { Extension } from '@tiptap/core'
import type { Node as PMNode } from '@tiptap/pm/model'

const STEP = 32
const MAX = 10

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType
      outdent: () => ReturnType
    }
  }
}

/** Paragraph/heading left indentation with increase/decrease commands. */
export const Indent = Extension.create({
  name: 'indent',
  addOptions() { return { types: ['paragraph', 'heading'] } },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        indent: {
          default: 0,
          parseHTML: el => {
            const m = parseInt((el as HTMLElement).style.marginLeft || '0', 10)
            return m ? Math.round(m / STEP) : 0
          },
          renderHTML: attrs => (attrs.indent ? { style: `margin-left: ${attrs.indent * STEP}px` } : {}),
        },
      },
    }]
  },
  addCommands() {
    const apply = (delta: number) => ({ state, dispatch }: { state: import('@tiptap/pm/state').EditorState; dispatch?: (tr: import('@tiptap/pm/state').Transaction) => void }) => {
      const { from, to } = state.selection
      const tr = state.tr
      let changed = false
      state.doc.nodesBetween(from, to, (node: PMNode, pos: number) => {
        if (this.options.types.includes(node.type.name)) {
          const cur: number = node.attrs.indent || 0
          const next = Math.max(0, Math.min(MAX, cur + delta))
          if (next !== cur) { tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: next }); changed = true }
        }
      })
      if (changed && dispatch) dispatch(tr)
      return changed
    }
    return { indent: () => apply(1), outdent: () => apply(-1) }
  },
})
