'use client'
import type { Dissection } from '@/lib/types'

interface Props {
  item: Dissection
  onClick: (item: Dissection) => void
  onDelete?: (id: string) => void
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  'content creation tips':  'linear-gradient(135deg, #567C8D 0%, #C8D9E6 100%)',
  'business tips':          'linear-gradient(135deg, #2F4156 0%, #567C8D 100%)',
  'business resources':     'linear-gradient(135deg, #3d5a73 0%, #7A9BAD 100%)',
  'ai content to recreate': 'linear-gradient(135deg, #4a6a7d 0%, #C8D9E6 100%)',
  'cinematics references':  'linear-gradient(135deg, #1a2e3d 0%, #2F4156 100%)',
  'art and culture recreate':'linear-gradient(135deg, #567C8D 0%, #E8F0F5 100%)',
  'personal life recreate': 'linear-gradient(135deg, #7A9BAD 0%, #F5EFEB 100%)',
  'random easy recreate':   'linear-gradient(135deg, #C8D9E6 0%, #F5EFEB 100%)',
  'best people for faasle': 'linear-gradient(135deg, #2F4156 0%, #C8D9E6 100%)',
  'claude for myself':      'linear-gradient(135deg, #567C8D 0%, #2F4156 100%)',
}

function getFallbackGradient(item: Dissection): string {
  return CATEGORY_GRADIENTS[item.category] ?? 'linear-gradient(135deg, #C8D9E6 0%, #F5EFEB 100%)'
}

export function ContentCard({ item, onClick, onDelete }: Props) {
  const date = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

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
      {/* Full-bleed image / gradient */}
      <div className="w-full" style={{ minHeight: '200px' }}>
        {item.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail}
            alt={item.topic}
            className="w-full h-full object-cover"
            style={{ display: 'block', minHeight: '200px' }}
            draggable={false}
          />
        ) : (
          <div
            className="w-full flex items-center justify-center text-white font-bold text-3xl"
            style={{
              background: getFallbackGradient(item),
              minHeight: '200px',
            }}
          >
            {item.topic.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Reel play icon — top right */}
      {item.type === 'reel' && (
        <div
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#2F4156">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
      )}

      {/* Delete button — top left, on hover */}
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

      {/* Glass overlay at bottom */}
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
        {/* Title */}
        <p
          className="font-bold leading-snug mb-1.5"
          style={{
            fontSize: '14px',
            color: '#2F4156',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.topic}
        </p>

        {/* Category chip */}
        <span className="chip mb-2 capitalize">{item.category}</span>

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-1.5">
          <span style={{ fontSize: '11px', color: '#8EA7B5' }}>{date}</span>
          <span
            style={{ fontSize: '12px', color: '#567C8D', fontWeight: 600 }}
          >
            View →
          </span>
        </div>
      </div>
    </div>
  )
}
