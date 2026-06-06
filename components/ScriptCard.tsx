'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, MoreHorizontal, Trash2, Edit3, Clock, Camera, Music } from 'lucide-react'
import { clsx } from 'clsx'
import type { Script } from '@/lib/types'

const STATUS_STYLES = {
  draft:  { label: 'Draft',   cls: 'bg-zinc-500/20 text-zinc-300  border-zinc-500/30'  },
  ready:  { label: 'Ready',   cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  shot:   { label: 'Shot ✓', cls: 'bg-green-500/20  text-green-300  border-green-500/30'  },
}

interface Props {
  script: Script
  onClick: (script: Script) => void
  onDelete?: (id: string) => void
}

export function ScriptCard({ script, onClick, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const status = STATUS_STYLES[script.status]

  // Extract plain text preview from tiptap content
  let preview = ''
  try {
    const doc = JSON.parse(script.content)
    const texts: string[] = []
    const walk = (node: any) => {
      if (node.type === 'text') texts.push(node.text)
      if (node.content) node.content.forEach(walk)
    }
    doc.content?.forEach(walk)
    preview = texts.join(' ').slice(0, 120)
  } catch {
    preview = script.content?.slice(0, 120) ?? ''
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative group cursor-pointer card-hover"
      onClick={() => onClick(script)}
    >
      <div className="bg-ig-card border border-ig-border rounded-ig overflow-hidden hover:border-ig-muted transition-colors">
        {/* Cover — gradient top */}
        <div className="h-36 bg-ig-gradient relative overflow-hidden">
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full border', status.cls)}>
              {status.label}
            </span>
            {script.category && (
              <span className="text-[10px] text-white/70 bg-black/50 px-2 py-0.5 rounded-full capitalize">
                {script.category}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-3">
          <p className="font-semibold text-sm leading-tight mb-1.5 line-clamp-1">{script.title}</p>
          {preview && (
            <p className="text-ig-faint text-xs leading-relaxed line-clamp-3">{preview}</p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-3 text-ig-faint">
            {script.visualRefs.length > 0 && (
              <span className="flex items-center gap-1 text-[10px]">
                <Camera size={10} /> {script.visualRefs.length}
              </span>
            )}
            {script.music.length > 0 && (
              <span className="flex items-center gap-1 text-[10px]">
                <Music size={10} /> {script.music.length}
              </span>
            )}
            <span className="flex items-center gap-1 text-[10px] ml-auto">
              <Clock size={10} />
              {new Date(script.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <button
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-1 rounded-lg bg-black/70 text-white hover:bg-black"
        onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v) }}
      >
        <MoreHorizontal size={14} />
      </button>

      {menuOpen && (
        <div
          className="absolute top-9 right-2 z-20 bg-ig-card border border-ig-border rounded-ig-sm shadow-2xl py-1 min-w-[140px] animate-scale-in"
          onClick={e => e.stopPropagation()}
        >
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm text-ig-text hover:bg-ig-hover w-full text-left"
            onClick={() => onClick(script)}
          >
            <Edit3 size={14} /> Edit
          </button>
          {onDelete && (
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-ig-hover w-full text-left"
              onClick={() => { onDelete(script.id); setMenuOpen(false) }}
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}
