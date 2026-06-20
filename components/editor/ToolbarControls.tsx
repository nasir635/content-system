'use client'
import { type Editor } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import { Baseline, PaintBucket, ChevronDown } from 'lucide-react'

const LINE_SPACINGS = [
  { label: 'Compact', value: 1.35 },
  { label: 'Normal', value: 1.6 },
  { label: 'Relaxed', value: 1.9 },
  { label: 'Double', value: 2.3 },
]

const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  // System / web-safe (no download)
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Garamond', value: 'Garamond, "Times New Roman", serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Comic Sans MS', value: '"Comic Sans MS", "Comic Sans", cursive' },
  { label: 'Impact', value: 'Impact, Charcoal, sans-serif' },
  // Google Fonts (loaded in layout) — sans
  { label: 'Roboto', value: '"Roboto", sans-serif' },
  { label: 'Open Sans', value: '"Open Sans", sans-serif' },
  { label: 'Lato', value: '"Lato", sans-serif' },
  { label: 'Montserrat', value: '"Montserrat", sans-serif' },
  { label: 'Poppins', value: '"Poppins", sans-serif' },
  { label: 'Raleway', value: '"Raleway", sans-serif' },
  { label: 'Nunito', value: '"Nunito", sans-serif' },
  { label: 'Work Sans', value: '"Work Sans", sans-serif' },
  { label: 'Inter', value: '"Inter", sans-serif' },
  // Google Fonts — serif
  { label: 'Merriweather', value: '"Merriweather", serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'Lora', value: '"Lora", serif' },
  { label: 'PT Serif', value: '"PT Serif", serif' },
  // Google Fonts — display / handwriting
  { label: 'Oswald', value: '"Oswald", sans-serif' },
  { label: 'Bebas Neue', value: '"Bebas Neue", sans-serif' },
  { label: 'Pacifico', value: '"Pacifico", cursive' },
  { label: 'Dancing Script', value: '"Dancing Script", cursive' },
  { label: 'Caveat', value: '"Caveat", cursive' },
  { label: 'Lobster', value: '"Lobster", cursive' },
  // Google Fonts — monospace
  { label: 'Roboto Mono', value: '"Roboto Mono", monospace' },
  { label: 'Source Code Pro', value: '"Source Code Pro", monospace' },
  { label: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
]

const FONT_SIZES = [
  { label: 'Small', value: '13px' },
  { label: 'Normal', value: '' },
  { label: 'Medium', value: '18px' },
  { label: 'Large', value: '24px' },
  { label: 'Huge', value: '30px' },
]

export const TEXT_COLORS = [
  { name: 'Default', value: '' },
  { name: 'Gray', value: '#7C98B6' },
  { name: 'Navy', value: '#2F4156' },
  { name: 'Teal', value: '#00A4BD' },
  { name: 'Green', value: '#3a7d44' },
  { name: 'Orange', value: '#FF7A59' },
  { name: 'Red', value: '#D14343' },
  { name: 'Purple', value: '#9A7BB0' },
]
export const BG_COLORS = [
  { name: 'None', value: '' },
  { name: 'Yellow', value: '#FFE9B0' },
  { name: 'Green', value: '#C8EAD0' },
  { name: 'Blue', value: '#C5E4F2' },
  { name: 'Pink', value: '#F5CEDC' },
  { name: 'Purple', value: '#E2D4F0' },
  { name: 'Gray', value: '#E0E6ED' },
  { name: 'Orange', value: '#FFD9C7' },
]

const selStyle: React.CSSProperties = {
  border: '1px solid #DFE3EB', color: '#33475B', background: '#F5F8FA',
  height: 28, fontSize: 12, borderRadius: 8, padding: '0 6px', outline: 'none', cursor: 'pointer',
}

export function FontFamilySelect({ editor }: { editor: Editor }) {
  const active = editor.getAttributes('textStyle').fontFamily || ''
  return (
    <select
      title="Font"
      value={active}
      onChange={e => { const v = e.target.value; v ? editor.chain().focus().setFontFamily(v).run() : editor.chain().focus().unsetFontFamily().run() }}
      style={{ ...selStyle, maxWidth: 132, minWidth: 96 }}
    >
      {FONT_FAMILIES.map(f => <option key={f.label} value={f.value} style={{ fontFamily: f.value || undefined }}>{f.label}</option>)}
    </select>
  )
}

export function FontSizeSelect({ editor }: { editor: Editor }) {
  const active = editor.getAttributes('textStyle').fontSize || ''
  return (
    <select
      title="Font size"
      value={active}
      onChange={e => { const v = e.target.value; v ? editor.chain().focus().setFontSize(v).run() : editor.chain().focus().unsetFontSize().run() }}
      style={{ ...selStyle, maxWidth: 90 }}
    >
      {FONT_SIZES.map(s => <option key={s.label} value={s.value}>{s.label}</option>)}
    </select>
  )
}

export function TableControls({ editor }: { editor: Editor }) {
  if (!editor.isActive('table')) return null
  const B = (run: () => void, label: string, title: string) => (
    <button type="button" title={title} className="cs-tablectl-btn"
      onMouseDown={e => e.preventDefault()} onClick={run}>{label}</button>
  )
  const c = () => editor.chain().focus()
  return (
    <span className="cs-tablectl">
      {B(() => c().addRowAfter().run(), '+ Row', 'Add row below')}
      {B(() => c().addColumnAfter().run(), '+ Col', 'Add column right')}
      {B(() => c().deleteRow().run(), '− Row', 'Delete row')}
      {B(() => c().deleteColumn().run(), '− Col', 'Delete column')}
      {B(() => c().toggleHeaderRow().run(), 'Header', 'Toggle header row')}
      {B(() => c().deleteTable().run(), 'Delete', 'Delete table')}
    </span>
  )
}

export function LineSpacingSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  // Snap the stored value to the nearest preset for display.
  const nearest = LINE_SPACINGS.reduce((a, b) => Math.abs(b.value - value) < Math.abs(a.value - value) ? b : a)
  return (
    <select
      title="Line spacing (whole document)"
      value={nearest.value}
      onChange={e => onChange(parseFloat(e.target.value))}
      style={{ ...selStyle, maxWidth: 100 }}
    >
      {LINE_SPACINGS.map(s => <option key={s.label} value={s.value}>{s.label}</option>)}
    </select>
  )
}

export function ColorControl({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = editor.getAttributes('textStyle').color || ''

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as HTMLElement)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        title="Text & highlight color"
        onMouseDown={e => e.preventDefault()}
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-center rounded transition-colors"
        style={{ height: 28, padding: '0 5px', gap: 2, color: '#516F90', display: 'flex' }}
      >
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
          <Baseline size={15} />
          <span style={{ width: 15, height: 3, borderRadius: 2, background: current || '#33475B', marginTop: 1 }} />
        </span>
        <ChevronDown size={11} />
      </button>
      {open && (
        <div className="cs-bm-pop cs-bm-colorpop" style={{ top: 32 }}>
          <div className="cs-bm-poplabel"><Baseline size={12} /> Text</div>
          <div className="cs-bm-swatches">
            {TEXT_COLORS.map(c => (
              <button key={c.name} type="button" title={c.name} className="cs-swatch" style={{ color: c.value || 'var(--text)' }}
                onMouseDown={e => e.preventDefault()}
                onClick={() => { c.value ? editor.chain().focus().setColor(c.value).run() : editor.chain().focus().unsetColor().run(); setOpen(false) }}>
                A
              </button>
            ))}
          </div>
          <div className="cs-bm-poplabel"><PaintBucket size={12} /> Highlight</div>
          <div className="cs-bm-swatches">
            {BG_COLORS.map(c => (
              <button key={c.name} type="button" title={c.name} className="cs-swatch cs-swatch-bg" style={{ background: c.value || '#fff' }}
                onMouseDown={e => e.preventDefault()}
                onClick={() => { c.value ? editor.chain().focus().setHighlight({ color: c.value }).run() : editor.chain().focus().unsetHighlight().run(); setOpen(false) }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
