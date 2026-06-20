'use client'
import { type Editor } from '@tiptap/react'
import {
  Undo2, Redo2, Bold, Italic, Underline as U, Strikethrough, Superscript as Sup, Subscript as Sub,
  Link2, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, ListChecks,
  IndentIncrease, IndentDecrease, Quote, Code2, Minus, RemoveFormatting,
} from 'lucide-react'
import { FontFamilySelect, LineSpacingSelect, ColorControl, TableControls } from './ToolbarControls'

function Btn({ active, disabled, onClick, title, children }: {
  active?: boolean; disabled?: boolean; onClick: () => void; title: string; children: React.ReactNode
}) {
  return (
    <button type="button" title={title} disabled={disabled} aria-pressed={active}
      className={`cs-tb-btn${active ? ' is-on' : ''}`}
      onMouseDown={e => e.preventDefault()} onClick={onClick}>
      {children}
    </button>
  )
}
function Sep() { return <span className="cs-tb-sep" /> }

function StyleSelect({ editor }: { editor: Editor }) {
  const val = editor.isActive('heading', { level: 1 }) ? 'h1'
    : editor.isActive('heading', { level: 2 }) ? 'h2'
    : editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'
  return (
    <select className="cs-tb-select" style={{ minWidth: 104 }} title="Paragraph style" value={val}
      onChange={e => {
        const v = e.target.value
        if (v === 'p') editor.chain().focus().setParagraph().run()
        else editor.chain().focus().setNode('heading', { level: Number(v[1]) as 1 | 2 | 3 }).run()
      }}>
      <option value="p">Normal text</option>
      <option value="h1">Heading 1</option>
      <option value="h2">Heading 2</option>
      <option value="h3">Heading 3</option>
    </select>
  )
}

function FontSizeStepper({ editor }: { editor: Editor }) {
  const raw = editor.getAttributes('textStyle').fontSize as string | undefined
  const size = raw ? parseInt(raw, 10) : 16
  const set = (n: number) => editor.chain().focus().setFontSize(`${Math.max(8, Math.min(96, n))}px`).run()
  return (
    <span className="cs-tb-size">
      <button type="button" title="Decrease font size" onMouseDown={e => e.preventDefault()} onClick={() => set(size - 1)}>−</button>
      <input
        className="cs-tb-size-input"
        value={size}
        onChange={e => { const n = parseInt(e.target.value, 10); if (!Number.isNaN(n)) set(n) }}
        inputMode="numeric"
      />
      <button type="button" title="Increase font size" onMouseDown={e => e.preventDefault()} onClick={() => set(size + 1)}>+</button>
    </span>
  )
}

export function EditorToolbar({ editor, lineSpacing, setLineSpacing }: {
  editor: Editor; lineSpacing: number; setLineSpacing: (n: number) => void
}) {
  const c = () => editor.chain().focus()

  function setLink() {
    const prev = editor.getAttributes('link').href || ''
    const url = window.prompt('Link URL', prev)
    if (url === null) return
    if (url === '') c().extendMarkRange('link').unsetLink().run()
    else c().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="cs-toolbar">
      <Btn title="Undo (⌘Z)" onClick={() => c().undo().run()}><Undo2 size={15} /></Btn>
      <Btn title="Redo (⌘⇧Z)" onClick={() => c().redo().run()}><Redo2 size={15} /></Btn>
      <Sep />

      <StyleSelect editor={editor} />
      <FontFamilySelect editor={editor} />
      <FontSizeStepper editor={editor} />
      <Sep />

      <Btn title="Bold (⌘B)" active={editor.isActive('bold')} onClick={() => c().toggleBold().run()}><Bold size={15} /></Btn>
      <Btn title="Italic (⌘I)" active={editor.isActive('italic')} onClick={() => c().toggleItalic().run()}><Italic size={15} /></Btn>
      <Btn title="Underline (⌘U)" active={editor.isActive('underline')} onClick={() => c().toggleUnderline().run()}><U size={15} /></Btn>
      <Btn title="Strikethrough" active={editor.isActive('strike')} onClick={() => c().toggleStrike().run()}><Strikethrough size={15} /></Btn>
      <Btn title="Superscript" active={editor.isActive('superscript')} onClick={() => c().toggleSuperscript().run()}><Sup size={15} /></Btn>
      <Btn title="Subscript" active={editor.isActive('subscript')} onClick={() => c().toggleSubscript().run()}><Sub size={15} /></Btn>
      <ColorControl editor={editor} />
      <Btn title="Link (⌘K)" active={editor.isActive('link')} onClick={setLink}><Link2 size={15} /></Btn>
      <Sep />

      <Btn title="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => c().setTextAlign('left').run()}><AlignLeft size={15} /></Btn>
      <Btn title="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => c().setTextAlign('center').run()}><AlignCenter size={15} /></Btn>
      <Btn title="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => c().setTextAlign('right').run()}><AlignRight size={15} /></Btn>
      <Btn title="Justify" active={editor.isActive({ textAlign: 'justify' })} onClick={() => c().setTextAlign('justify').run()}><AlignJustify size={15} /></Btn>
      <LineSpacingSelect value={lineSpacing} onChange={setLineSpacing} />
      <Sep />

      <Btn title="Checklist" active={editor.isActive('taskList')} onClick={() => c().toggleTaskList().run()}><ListChecks size={15} /></Btn>
      <Btn title="Bulleted list" active={editor.isActive('bulletList')} onClick={() => c().toggleBulletList().run()}><List size={15} /></Btn>
      <Btn title="Numbered list" active={editor.isActive('orderedList')} onClick={() => c().toggleOrderedList().run()}><ListOrdered size={15} /></Btn>
      <Btn title="Decrease indent" onClick={() => c().outdent().run()}><IndentDecrease size={15} /></Btn>
      <Btn title="Increase indent" onClick={() => c().indent().run()}><IndentIncrease size={15} /></Btn>
      <Sep />

      <Btn title="Quote" active={editor.isActive('blockquote')} onClick={() => c().toggleBlockquote().run()}><Quote size={15} /></Btn>
      <Btn title="Code block" active={editor.isActive('codeBlock')} onClick={() => c().toggleCodeBlock().run()}><Code2 size={15} /></Btn>
      <Btn title="Divider" onClick={() => c().setHorizontalRule().run()}><Minus size={15} /></Btn>
      <Btn title="Clear formatting" onClick={() => c().unsetAllMarks().run()}><RemoveFormatting size={15} /></Btn>

      <TableControls editor={editor} />
    </div>
  )
}
