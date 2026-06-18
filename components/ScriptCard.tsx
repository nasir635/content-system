'use client'
import type { Script } from '@/lib/types'

const STATUS_STYLES = {
  draft:  { label: 'Draft',          bg: 'rgba(200,217,230,0.35)', color: '#33475B' },
  ready:  { label: 'Ready to Shoot', bg: 'rgba(86,124,141,0.55)',  color: '#FFFFFF' },
  shot:   { label: 'Shot ✓',        bg: 'rgba(47,65,86,0.70)',    color: '#FFFFFF' },
}

function getGradient(category: string): string {
  const map: Record<string, string> = {
    'content creation tips':  'linear-gradient(160deg, #516F90 0%, #CBD6E2 100%)',
    'business tips':          'linear-gradient(160deg, #33475B 0%, #516F90 100%)',
    'short-form':             'linear-gradient(160deg, #33475B 0%, #516F90 100%)',
    'long-form':              'linear-gradient(160deg, #33475B 0%, #CBD6E2 100%)',
    'cold open':              'linear-gradient(160deg, #213343 0%, #33475B 100%)',
    'voiceover':              'linear-gradient(160deg, #516F90 0%, #EAF0F6 100%)',
    'personal':               'linear-gradient(160deg, #516F90 0%, #CBD6E2 100%)',
  }
  return map[category?.toLowerCase()] ?? 'linear-gradient(160deg, #33475B 0%, #516F90 100%)'
}

interface Props {
  script: Script
  onClick?: (script: Script) => void
  onDelete?: (id: string) => void
}

export function ScriptCard({ script, onClick, onDelete }: Props) {
  const date   = new Date(script.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const status = STATUS_STYLES[script.status]

  let preview = ''
  try {
    const doc = JSON.parse(script.content)
    const texts: string[] = []
    const walk = (node: { type?: string; text?: string; content?: typeof node[] }) => {
      if (node.type === 'text' && node.text) texts.push(node.text)
      if (node.content) node.content.forEach(walk)
    }
    doc.content?.forEach(walk)
    preview = texts.join(' ').slice(0, 72)
  } catch {
    preview = (script.content ?? '').slice(0, 72)
  }

  return (
    <div className="glossy-card cursor-pointer group" onClick={() => onClick?.(script)}>

      {/* ── GRADIENT section ── */}
      <div
        className="relative flex items-center justify-center"
        style={{ background: getGradient(script.category), minHeight: 210 }}
      >
        {/* Watermark icon */}
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeLinecap="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>

        {/* Scrim */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(20,30,42,0.75) 0%, rgba(20,30,42,0.08) 55%, transparent 100%)' }}
        />

        {/* Title + status badge */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <div className="flex items-end justify-between gap-2">
            <h3
              className="font-bold text-white leading-tight"
              style={{
                fontSize: 15,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              } as React.CSSProperties}
            >
              {script.title}
            </h3>
            <span
              className="flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{
                background: status.bg,
                color: status.color,
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              {status.label}
            </span>
          </div>
        </div>

        {/* Delete — hover only */}
        {onDelete && (
          <button
            className="absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            style={{ background: 'rgba(20,20,20,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={e => { e.stopPropagation(); onDelete(script.id) }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
            </svg>
          </button>
        )}
      </div>

      {/* ── WHITE INFO PANEL ── */}
      <div className="px-4 pt-3 pb-4 bg-white">
        {preview && (
          <p
            className="mb-3 leading-relaxed"
            style={{
              fontSize: 12,
              color: '#516F90',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            } as React.CSSProperties}
          >
            {preview}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="chip capitalize">{script.category}</span>
          <span style={{ fontSize: 11, color: '#99ACC2' }}>{date}</span>
        </div>

        <button
          className="glossy-btn w-full"
          onClick={e => { e.stopPropagation(); onClick?.(script) }}
        >
          Open Script
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
