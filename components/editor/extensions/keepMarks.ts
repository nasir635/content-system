import { Extension } from '@tiptap/core'

/**
 * Word/Docs-style "sticky" formatting: when you press Enter in a plain
 * paragraph or heading, carry the active marks (font family, size, color,
 * bold, …) into the new paragraph so typing continues in the same style.
 *
 * Tiptap's default keeps marks on split, but skips the case where the cursor
 * is at the start of an empty block, so formatting drops after a blank line.
 * This handler re-ensures the marks. It only acts in paragraphs/headings and
 * bails everywhere else (lists, code, tables, toggles, callouts, columns) so
 * their own Enter behavior is untouched.
 */
export const KeepMarksOnEnter = Extension.create({
  name: 'keepMarksOnEnter',
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const editor = this.editor
        const { selection, storedMarks } = editor.state
        if (!selection.empty) return false
        const { $from } = selection

        // Only handle a cursor that lives directly in a top-level paragraph/heading.
        for (let d = $from.depth; d >= 1; d--) {
          const name = $from.node(d).type.name
          if (name !== 'paragraph' && name !== 'heading') return false
        }

        const marks = storedMarks ?? $from.marks()
        const handled = editor.commands.splitBlock()
        if (handled && marks.length) {
          editor.commands.command(({ tr }) => { tr.ensureMarks(marks); return true })
        }
        return handled
      },
    }
  },
})
