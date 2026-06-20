import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (lineHeight: string) => ReturnType
      unsetLineHeight: () => ReturnType
    }
  }
}

/** Adds a `lineHeight` attribute to block nodes, with set/unset commands. */
export const LineHeight = Extension.create({
  name: 'lineHeight',
  addOptions() { return { types: ['paragraph', 'heading'] } },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        lineHeight: {
          default: null,
          parseHTML: el => (el as HTMLElement).style.lineHeight || null,
          renderHTML: attrs => (attrs.lineHeight ? { style: `line-height: ${attrs.lineHeight}` } : {}),
        },
      },
    }]
  },
  addCommands() {
    return {
      setLineHeight: lineHeight => ({ commands }) =>
        (this.options.types as string[]).map((type: string) => commands.updateAttributes(type, { lineHeight })).every(Boolean),
      unsetLineHeight: () => ({ commands }) =>
        (this.options.types as string[]).map((type: string) => commands.resetAttributes(type, 'lineHeight')).every(Boolean),
    }
  },
})
