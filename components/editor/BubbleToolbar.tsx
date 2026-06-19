'use client'
import { BubbleMenu, type Editor } from '@tiptap/react'
import { useState } from 'react'
import { Bold, Italic, Underline as U, Strikethrough, Code, Link2, Highlighter, ChevronDown, Baseline, PaintBucket } from 'lucide-react'

const TEXT_COLORS = [
  { name: 'Default', value: '' },
  { name: 'Gray', value: '#7C98B6' },
  { name: 'Navy', value: '#2F4156' },
  { name: 'Teal', value: '#00A4BD' },
  { name: 'Green', value: '#3a7d44' },
  { name: 'Orange', value: '#FF7A59' },
  { name: 'Red', value: '#D14343' },
  { name: 'Purple', value: '#9A7BB0' },
]
const BG_COLORS = [
  { name: 'None', value: '' },
  { name: 'Yellow', value: '#FFE9B0' },
  { name: 'Green', value: '#C8EAD0' },
  { name: 'Blue', value: '#C5E4F2' },
  { name: 'Pink', value: '#F5CEDC' },
  { name: 'Purple', value: '#E2D4F0' },
  { name: 'Gray', value: '#E0E6ED' },
  { name: 'Orange', value: '#FFD9C7' },
]

const TURN_INTO = [
  { label: 'Text', run: (e: Editor) => e.chain().focus().setParagraph().run() },
  { label: 'Heading 1', run: (e: Editor) => e.chain().focus().setNode('heading', { level: 1 }).run() },
  { label: 'Heading 2', run: (e: Editor) => e.chain().focus().setNode('heading', { level: 2 }).run() },
  { label: 'Heading 3', run: (e: Editor) => e.chain().focus().setNode('heading', { level: 3 }).run() },
  { label: 'Bulleted list', run: (e: Editor) => e.chain().focus().toggleBulletList().run() },
  { label: 'To-do list', run: (e: Editor) => e.chain().focus().toggleTaskList().run() },
  { label: 'Quote', run: (e: Editor) => e.chain().focus().toggleBlockquote().run() },
]

function B({ active, onClick, title, children }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button type="button" title={title} className={`cs-bm-btn${active ? ' is-active' : ''}`}
      onMouseDown={e => e.preventDefault()} onClick={onClick}>{children}</button>
  )
}

export function BubbleToolbar({ editor }: { editor: Editor }) {
  const [menu, setMenu] = useState<'' | 'turn' | 'color'>('')

  function setLink() {
    const prev = editor.getAttributes('link').href || ''
    const url = window.prompt('Link URL', prev)
    if (url === null) return
    if (url === '') editor.chain().focus().extendMarkRange('link').unsetLink().run()
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 120, maxWidth: 'none', onHidden: () => setMenu('') }}
      shouldShow={({ editor: e, state }) => {
        const { empty, from, to } = state.selection
        if (empty || from === to) return false
        if (e.isActive('codeBlock') || e.isActive('image') || e.isActive('mathBlock')) return false
        return true
      }}
    >
      <div className="cs-bm">
        {/* Turn into */}
        <div className="cs-bm-drop">
          <button type="button" className="cs-bm-turn" onMouseDown={e => e.preventDefault()} onClick={() => setMenu(m => m === 'turn' ? '' : 'turn')}>
            Turn into <ChevronDown size={13} />
          </button>
          {menu === 'turn' && (
            <div className="cs-bm-pop">
              {TURN_INTO.map(t => (
                <button key={t.label} type="button" className="cs-bm-popitem" onMouseDown={e => e.preventDefault()}
                  onClick={() => { t.run(editor); setMenu('') }}>{t.label}</button>
              ))}
            </div>
          )}
        </div>
        <span className="cs-bm-sep" />
        <B active={editor.isActive('bold')} title="Bold" onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={15} /></B>
        <B active={editor.isActive('italic')} title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={15} /></B>
        <B active={editor.isActive('underline')} title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()}><U size={15} /></B>
        <B active={editor.isActive('strike')} title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={15} /></B>
        <B active={editor.isActive('code')} title="Inline code" onClick={() => editor.chain().focus().toggleCode().run()}><Code size={15} /></B>
        <B active={editor.isActive('link')} title="Link" onClick={setLink}><Link2 size={15} /></B>
        <B active={editor.isActive('highlight')} title="Highlight" onClick={() => editor.chain().focus().toggleHighlight().run()}><Highlighter size={15} /></B>
        <span className="cs-bm-sep" />
        {/* Color */}
        <div className="cs-bm-drop">
          <button type="button" className="cs-bm-btn" title="Color" onMouseDown={e => e.preventDefault()} onClick={() => setMenu(m => m === 'color' ? '' : 'color')}>
            <Baseline size={15} /><ChevronDown size={11} />
          </button>
          {menu === 'color' && (
            <div className="cs-bm-pop cs-bm-colorpop">
              <div className="cs-bm-poplabel"><Baseline size={12} /> Text</div>
              <div className="cs-bm-swatches">
                {TEXT_COLORS.map(c => (
                  <button key={c.name} type="button" title={c.name} className="cs-swatch" style={{ color: c.value || 'var(--text)' }}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => { c.value ? editor.chain().focus().setColor(c.value).run() : editor.chain().focus().unsetColor().run(); setMenu('') }}>
                    A
                  </button>
                ))}
              </div>
              <div className="cs-bm-poplabel"><PaintBucket size={12} /> Background</div>
              <div className="cs-bm-swatches">
                {BG_COLORS.map(c => (
                  <button key={c.name} type="button" title={c.name} className="cs-swatch cs-swatch-bg" style={{ background: c.value || '#fff' }}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => { c.value ? editor.chain().focus().setHighlight({ color: c.value }).run() : editor.chain().focus().unsetHighlight().run(); setMenu('') }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </BubbleMenu>
  )
}
