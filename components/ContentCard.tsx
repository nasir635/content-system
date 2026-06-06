'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, ExternalLink, Film, Layers, Trash2, Eye } from 'lucide-react'
import { clsx } from 'clsx'
import type { Dissection } from '@/lib/types'

const CATEGORY_DOT: Record<string, string> = {
  'best people for faasle': 'bg-purple-400',
  'business resources':     'bg-blue-400',
  'art and culture recreate':'bg-amber-400',
  'personal life recreate': 'bg-pink-400',
  'random easy recreate':   'bg-green-400',
  'cinematics references':  'bg-slate-400',
  'claude for myself':      'bg-violet-400',
  'ai content to recreate': 'bg-cyan-400',
  'business tips':          'bg-orange-400',
  'content creation tips':  'bg-rose-400',
}

interface Props {
  item: Dissection
  onClick: (item: Dissection) => void
  onDelete?: (id: string) => void
}

export function ContentCard({ item, onClick, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const dotColor = CATEGORY_DOT[item.category?.toLowerCase()] ?? 'bg-white/50'

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative group cursor-pointer bg-ig-bg aspect-square overflow-hidden"
      onClick={() => { setMenuOpen(false); onClick(item) }}
    >
      {/* Thumbnail fills the square */}
      {item.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.thumbnail}
          alt={item.topic}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' }}>
          <Film size={28} className="text-white/20" />
        </div>
      )}

      {/* Reel icon — top right */}
      {item.type === 'reel' && (
        <div className="absolute top-1.5 right-1.5">
          <Play size={14} className="text-white drop-shadow-lg fill-white" />
        </div>
      )}

      {/* Frames indicator — top left */}
      {item.hasFrames && (
        <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
          <Layers size={9} className="text-white" />
          <span className="text-[9px] text-white font-medium">{item.frameCount ?? '?'}</span>
        </div>
      )}

      {/* Category dot — bottom left */}
      <div className="absolute bottom-1.5 left-1.5">
        <span className={clsx('w-2 h-2 rounded-full block shadow-md', dotColor)} />
      </div>

      {/* Hover overlay — dark scrim + eye icon + topic */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex flex-col items-center justify-center gap-1 pointer-events-none">
        <Eye
          size={22}
          className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-lg"
        />
        <p className="text-white text-[11px] font-semibold text-center px-2 leading-tight
          opacity-0 group-hover:opacity-100 transition-opacity duration-200 line-clamp-2 max-w-full drop-shadow-lg">
          {item.topic}
        </p>
      </div>

      {/* Context menu button — only visible on hover, top right corner */}
      <button
        className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10
          p-1 rounded bg-black/70 text-white hover:bg-black leading-none"
        onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
        aria-label="Options"
      >
        <span className="text-[11px] font-bold leading-none">···</span>
      </button>

      {/* Dropdown menu */}
      {menuOpen && (
        <div
          className="absolute top-8 right-1.5 z-20 bg-ig-card border border-ig-border rounded-ig-sm
            shadow-2xl py-1 min-w-[140px] animate-scale-in"
          onClick={e => e.stopPropagation()}
        >
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-xs text-ig-text hover:bg-ig-hover"
          >
            <ExternalLink size={12} /> Open original
          </a>
          {onDelete && (
            <button
              className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-ig-hover w-full text-left"
              onClick={() => { setMenuOpen(false); onDelete(item.id) }}
            >
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}
