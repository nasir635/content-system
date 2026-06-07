'use client'
import type { Reference } from '@/lib/types'

interface Props {
  item: Reference
  onClick: (item: Reference) => void
  onDelete?: (id: string) => void
}

export function ReferenceCard({ item, onClick, onDelete }: Props) {
  const date = new Date(item.updatedAt ?? item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="glossy-card cursor-pointer group" onClick={() => onClick(item)}>

      {/* ── PHOTO / PLACEHOLDER section ── */}
      <div className="relative" style={{ minHeight: 210 }}>
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full object-cover"
            style={{ display: 'block', minHeight: 210, maxHeight: 300 }}
            draggable={false}
          />
        ) : (
          <div
            className="w-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(160deg, #C8D9E6 0%, #567C8D 100%)',
              minHeight: 210,
            }}
          >
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}

        {/* Scrim */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(20,30,42,0.75) 0%, rgba(20,30,42,0.08) 55%, transparent 100%)' }}
        />

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
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
            {item.title}
          </h3>
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
        {item.note && (
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
            {item.note}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          {item.category
            ? <span className="chip capitalize">{item.category}</span>
            : <span />
          }
          <span style={{ fontSize: 11, color: '#A0B8C6' }}>{date}</span>
        </div>

        <button className="glossy-btn" onClick={e => { e.stopPropagation(); onClick(item) }}>
          View Reference
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginLeft: 6 }}>
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
