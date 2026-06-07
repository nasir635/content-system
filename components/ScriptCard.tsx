'use client'
import type { Script } from '@/lib/types'

const STATUS_STYLES = {
  draft:  { label: 'Draft',          bg: 'rgba(200,217,230,0.35)', color: '#2F4156' },
  ready:  { label: 'Ready to Shoot', bg: 'rgba(86,124,141,0.55)',  color: '#FFFFFF' },
  shot:   { label: 'Shot ✓',        bg: 'rgba(47,65,86,0.70)',    color: '#FFFFFF' },
}

function getGradient(category: string): string {
  const map: Record<string, string> = {
    'content creation tips':  'linear-gradient(135deg, #567C8D 0%, #C8D9E6 100%)',
    'business tips':          'linear-gradient(135deg, #2F4156 0%, #567C8D 100%)',
    'short-form':             'linear-gradient(135deg, #3d5a73 0%, #7A9BAD 100%)',
    'long-form':              'linear-gradient(135deg, #4a6a7d 0%, #C8D9E6 100%)',
    'cold open':              'linear-gradient(135deg, #1a2e3d 0%, #2F4156 100%)',
    'voiceover':              'linear-gradient(135deg, #567C8D 0%, #E8F0F5 100%)',
    'personal':               'linear-gradient(135deg, #7A9BAD 0%, #F5EFEB 100%)',
  }
  return map[category?.toLowerCase()] ?? 'linear-gradient(135deg, #2F4156 0%, #567C8D 100%)'
}

interface Props {
  script: Script
  onClick?: (script: Script) => void
  onDelete?: (id: string) => void
}

export function ScriptCard({ script, onClick, onDelete }: Props) {
  const date = new Date(script.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const status = STATUS_STYLES[script.status]

  // Extract plain text preview from tiptap JSON
  let preview = ''
  try {
    const doc = JSON.parse(script.content)
    const texts: string[] = []
    const walk = (node: { type?: string; text?: string; content?: typeof node[] }) => {
      if (node.type === 'text' && node.text) texts.push(node.text)
      if (node.content) node.content.forEach(walk)
    }
    doc.content?.forEach(walk)
    preview = texts.join(' ').slice(0, 90)
  } catch {
    preview = (script.content ?? '').slice(0, 90)
  }

  return (
    <div
      className="relative cursor-pointer group rounded-[20px] overflow-hidden"
      style={{
        boxShadow: '0 4px 24px rgba(47,65,86,0.12)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onClick={() => onClick?.(script)}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'scale(1.02)'
        el.style.boxShadow = '0 8px 40px rgba(47,65,86,0.20)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'scale(1)'
        el.style.boxShadow = '0 4px 24px rgba(47,65,86,0.12)'
      }}
    >
      {/* Full-bleed gradient */}
      <div
        className="w-full relative flex items-center justify-center"
        style={{ background: getGradient(script.category), minHeight: '200px' }}
      >
        {/* Watermark icon */}
        <svg
          width="52" height="52" viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" strokeLinecap="round"
        >
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>

        {/* Status badge — top right */}
        <div className="absolute top-3 right-3">
          <span
            className="text-[10px] font-bold px-2 py-1 rounded-full"
            style={{
              background: status.bg,
              color: status.color,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* Delete button — top left, hover only */}
      {onDelete && (
        <button
          className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
          style={{ background: 'rgba(47,65,86,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={e => { e.stopPropagation(); onDelete(script.id) }}
          title="Delete"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
          </svg>
        </button>
      )}

      {/* Frosted glass overlay */}
      <div
        className="absolute bottom-2 left-2 right-2 px-3 py-3"
        style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.5)',
        }}
      >
        <p
          className="font-bold leading-snug mb-1"
          style={{
            fontSize: '14px',
            color: '#2F4156',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          } as React.CSSProperties}
        >
          {script.title}
        </p>

        {preview && (
          <p
            style={{
              fontSize: '11px',
              color: '#567C8D',
              marginBottom: '6px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            } as React.CSSProperties}
          >
            {preview}
          </p>
        )}

        {script.category && (
          <span className="chip mb-2 capitalize">{script.category}</span>
        )}

        <div className="flex items-center justify-between mt-1.5">
          <span style={{ fontSize: '11px', color: '#8EA7B5' }}>{date}</span>
          <span style={{ fontSize: '12px', color: '#567C8D', fontWeight: 600 }}>View →</span>
        </div>
      </div>
    </div>
  )
}
