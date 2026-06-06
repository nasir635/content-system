'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, ExternalLink, Film, Layers, MoreHorizontal, Trash2, Eye } from 'lucide-react'
import { clsx } from 'clsx'
import type { Dissection } from '@/lib/types'

const CATEGORY_COLORS: Record<string, string> = {
  'best people for faasle': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'business resources':     'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'art and culture recreate':'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'personal life recreate': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'random easy recreate':   'bg-green-500/20 text-green-300 border-green-500/30',
  'cinematics references':  'bg-slate-500/20 text-slate-300 border-slate-500/30',
  'claude for myself':      'bg-violet-500/20 text-violet-300 border-violet-500/30',
  'ai content to recreate': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'business tips':          'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'content creation tips':  'bg-rose-500/20 text-rose-300 border-rose-500/30',
}

function CategoryBadge({ cat }: { cat: string }) {
  const cls = CATEGORY_COLORS[cat.toLowerCase()] ?? 'bg-white/10 text-white/70 border-white/10'
  return (
    <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize', cls)}>
      {cat}
    </span>
  )
}

interface Props {
  item: Dissection
  onClick: (item: Dissection) => void
  onDelete?: (id: string) => void
}

export function ContentCard({ item, onClick, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative group cursor-pointer card-hover"
      onClick={() => onClick(item)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/5] rounded-ig overflow-hidden bg-ig-card border border-ig-border">
        {item.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail}
            alt={item.topic}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-ig-gradient opacity-20 flex items-center justify-center">
            <Film size={36} className="text-white/40" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />

        {/* Reel indicator */}
        {item.type === 'reel' && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
            <Play size={10} className="text-white fill-white" />
            <span className="text-[10px] text-white font-medium">Reel</span>
          </div>
        )}

        {/* Frames indicator */}
        {item.hasFrames && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
            <Layers size={10} className="text-white" />
            <span className="text-[10px] text-white">{item.frameCount ?? '?'}</span>
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <CategoryBadge cat={item.category} />
          <p className="mt-2 text-white text-sm font-semibold leading-tight line-clamp-2">
            {item.topic}
          </p>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
          <Eye size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
      </div>

      {/* Date */}
      <p className="mt-2 text-ig-faint text-xs px-1">
        {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </p>

      {/* Menu button */}
      <button
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity
          z-10 p-1 rounded-lg bg-black/70 text-white hover:bg-black"
        onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v) }}
      >
        <MoreHorizontal size={14} />
      </button>

      {menuOpen && (
        <div
          className="absolute top-9 right-2 z-20 bg-ig-card border border-ig-border rounded-ig-sm
            shadow-2xl py-1 min-w-[140px] animate-scale-in"
          onClick={e => e.stopPropagation()}
        >
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-ig-text hover:bg-ig-hover"
          >
            <ExternalLink size={14} /> Open original
          </a>
          {onDelete && (
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-ig-hover w-full text-left"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}
