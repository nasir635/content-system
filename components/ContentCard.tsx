'use client'
import { useState } from 'react'
import { Trash2, ExternalLink, MoreHorizontal } from 'lucide-react'
import type { Dissection } from '@/lib/types'

interface Props {
  item: Dissection
  onClick: (item: Dissection) => void
  onDelete?: (id: string) => void
}

export function ContentCard({ item, onClick, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      className="relative group cursor-pointer overflow-hidden bg-white"
      style={{ aspectRatio: '1' }}
      onClick={() => onClick(item)}
    >
      {/* Thumbnail */}
      {item.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.thumbnail}
          alt={item.topic}
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-white font-bold text-2xl"
          style={{ background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)' }}
        >
          {item.topic.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Reel indicator (top right) */}
      {item.type === 'reel' && (
        <div className="absolute top-2 right-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
      )}

      {/* Hover overlay — like Instagram Explore */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-5">
        <div className="flex items-center gap-1.5 text-white font-bold text-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          <span>{item.angles?.length ?? 0}</span>
        </div>
        <div className="flex items-center gap-1.5 text-white font-bold text-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <span>{item.topic.split(' ').length}</span>
        </div>
      </div>

      {/* 3-dot menu */}
      {onDelete && (
        <button
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10
            w-7 h-7 rounded-full bg-black/60 flex items-center justify-center"
          onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
        >
          <MoreHorizontal size={14} color="white" />
        </button>
      )}

      {menuOpen && (
        <div
          className="absolute top-9 left-2 z-20 bg-white border border-ig-border rounded-lg shadow-lg py-1 min-w-[140px]"
          onClick={e => e.stopPropagation()}
        >
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-ig-text hover:bg-ig-hover"
          >
            <ExternalLink size={14} /> View original
          </a>
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-ig-hover w-full text-left"
            onClick={() => onDelete!(item.id)}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}
