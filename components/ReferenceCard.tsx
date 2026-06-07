'use client'
import type { Reference } from '@/lib/types'

interface Props {
  item: Reference
  onClick: (item: Reference) => void
  onDelete?: (id: string) => void
}

export function ReferenceCard({ item, onClick, onDelete }: Props) {
  const date = new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div
      className="relative cursor-pointer group rounded-[20px] overflow-hidden"
      style={{
        boxShadow: '0 4px 24px rgba(47,65,86,0.12)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onClick={() => onClick(item)}
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
      {/* Full-bleed image */}
      <div className="w-full" style={{ minHeight: 200 }}>
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
            style={{ display: 'block', minHeight: 200 }}
            draggable={false}
          />
        ) : (
          <div
            className="w-full flex items-center justify-center"
            style={{
              minHeight: 200,
              background: 'linear-gradient(135deg, #C8D9E6 0%, #567C8D 100%)',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
      </div>

      {/* Delete button — hover only */}
      {onDelete && (
        <button
          className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
          style={{ background: 'rgba(47,65,86,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={e => { e.stopPropagation(); onDelete(item.id) }}
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
            fontSize: 14,
            color: '#2F4156',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          } as React.CSSProperties}
        >
          {item.title}
        </p>

        {item.note && (
          <p
            style={{
              fontSize: 11,
              color: '#567C8D',
              marginBottom: 6,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            } as React.CSSProperties}
          >
            {item.note}
          </p>
        )}

        {item.category && (
          <span className="chip mb-2 capitalize">{item.category}</span>
        )}

        <div className="flex items-center justify-between mt-1.5">
          <span style={{ fontSize: 11, color: '#8EA7B5' }}>{date}</span>
          <span style={{ fontSize: 12, color: '#567C8D', fontWeight: 600 }}>View →</span>
        </div>
      </div>
    </div>
  )
}
