'use client'
import type { Dissection } from '@/lib/types'

interface Props {
  item: Dissection
  onClick: (item: Dissection) => void
  onDelete?: (id: string) => void
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  'content creation tips':    'linear-gradient(160deg, #3a5a72 0%, #7aafc2 100%)',
  'business tips':            'linear-gradient(160deg, #2F4156 0%, #567C8D 100%)',
  'business resources':       'linear-gradient(160deg, #3d5a73 0%, #6a9bb0 100%)',
  'ai content to recreate':   'linear-gradient(160deg, #2a4560 0%, #5a8fa8 100%)',
  'cinematics references':    'linear-gradient(160deg, #1a2e3d 0%, #2F4156 100%)',
  'art and culture recreate': 'linear-gradient(160deg, #4a6d7c 0%, #8fb5c6 100%)',
  'personal life recreate':   'linear-gradient(160deg, #567C8D 0%, #a8ccd8 100%)',
  'random easy recreate':     'linear-gradient(160deg, #6a8fa0 0%, #C8D9E6 100%)',
  'best people for faasle':   'linear-gradient(160deg, #2F4156 0%, #C8D9E6 100%)',
  'claude for myself':        'linear-gradient(160deg, #567C8D 0%, #2F4156 100%)',
}

export function ContentCard({ item, onClick, onDelete }: Props) {
  const date     = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const gradient = CATEGORY_GRADIENTS[item.category] ?? 'linear-gradient(160deg, #C8D9E6 0%, #567C8D 100%)'
  const preview  = item.caption?.slice(0, 72) ?? ''

  return (
    <div className="glossy-card cursor-pointer group" onClick={() => onClick(item)}>

      {/* ── PHOTO / GRADIENT section ── */}
      <div className="relative" style={{ minHeight: 210 }}>
        {item.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail}
            alt={item.topic}
            className="w-full object-cover"
            style={{ display: 'block', minHeight: 210, maxHeight: 280 }}
            draggable={false}
          />
        ) : (
          <div
            className="w-full flex items-center justify-center"
            style={{ background: gradient, minHeight: 210 }}
          >
            <span className="font-bold opacity-20 text-white" style={{ fontSize: 72 }}>
              {item.topic.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Scrim */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(20,30,42,0.75) 0%, rgba(20,30,42,0.08) 55%, transparent 100%)' }}
        />

        {/* Title + type badge */}
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
              {item.topic}
            </h3>
            {item.type && (
              <span
                className="flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(8px)',
                  color: 'rgba(255,255,255,0.95)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {item.type}
              </span>
            )}
          </div>
        </div>

        {/* Delete — hover only */}
        {onDelete && (
          <button
            className="absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            style={{ background: 'rgba(20,20,20,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={e => { e.stopPropagation(); onDelete(item.id) }}
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
              color: '#6B8FA3',
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
          <span className="chip capitalize">{item.category}</span>
          <span style={{ fontSize: 11, color: '#A0B8C6' }}>{date}</span>
        </div>

        <button
          className="glossy-btn w-full"
          onClick={e => { e.stopPropagation(); onClick(item) }}
        >
          View Dissection
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
