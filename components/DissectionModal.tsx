'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, ExternalLink, Layers, Film, Zap, Copy,
  ChevronDown, ChevronUp, Play, BookOpen
} from 'lucide-react'
import type { Dissection } from '@/lib/types'

interface Props {
  item: Dissection | null
  onClose: () => void
  onUseInScript?: (item: Dissection) => void
}

const STRENGTH_COLOR = {
  strong: 'text-green-400 bg-green-400/10',
  medium: 'text-yellow-400 bg-yellow-400/10',
  weak:   'text-red-400   bg-red-400/10',
}

export function DissectionModal({ item, onClose, onUseInScript }: Props) {
  const [tab, setTab] = useState<'analysis' | 'transcript' | 'frames' | 'script'>('analysis')
  const [framesExpanded, setFramesExpanded] = useState(false)

  if (!item) return null

  const tabs = [
    { id: 'analysis',   label: 'Breakdown' },
    { id: 'transcript', label: 'Transcript' },
    ...(item.hasFrames ? [{ id: 'frames', label: `Frames (${item.frameCount})` }] : []),
    ...(item.scriptSuggestion ? [{ id: 'script', label: 'Script' }] : []),
  ] as { id: typeof tab; label: string }[]

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="bg-ig-surface border border-ig-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-ig-border flex-shrink-0">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  {item.type === 'reel' && (
                    <span className="flex items-center gap-1 text-[10px] bg-white/10 px-2 py-0.5 rounded-full">
                      <Play size={8} className="fill-white" /> Reel
                    </span>
                  )}
                  <span className="text-[10px] text-ig-faint">
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <h2 className="font-bold text-base leading-tight">{item.topic}</h2>
                <span className="text-xs text-ig-muted capitalize">{item.category}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {onUseInScript && (
                  <button
                    onClick={() => onUseInScript(item)}
                    className="flex items-center gap-2 bg-ig-blue hover:bg-ig-blue-hover text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                  >
                    <BookOpen size={13} /> Use in Script
                  </button>
                )}
                <a
                  href={item.url} target="_blank" rel="noopener noreferrer"
                  className="p-2 text-ig-muted hover:text-ig-text transition-colors rounded-lg hover:bg-ig-hover"
                >
                  <ExternalLink size={16} />
                </a>
                <button onClick={onClose} className="p-2 text-ig-muted hover:text-ig-text transition-colors rounded-lg hover:bg-ig-hover">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-ig-border flex-shrink-0 px-2">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                    tab === t.id
                      ? 'border-ig-text text-ig-text'
                      : 'border-transparent text-ig-faint hover:text-ig-muted'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">

              {/* Analysis tab */}
              {tab === 'analysis' && (
                <div className="space-y-6">
                  {/* Hook */}
                  <div>
                    <h3 className="text-xs font-bold text-ig-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Zap size={12} /> Hook Analysis
                    </h3>
                    <div className="bg-ig-card border border-ig-border rounded-xl p-4 text-sm text-ig-text leading-relaxed">
                      {item.hookAnalysis}
                    </div>
                  </div>

                  {/* Caption */}
                  <div>
                    <h3 className="text-xs font-bold text-ig-muted uppercase tracking-wider mb-3">Caption</h3>
                    <div className="bg-ig-card border border-ig-border rounded-xl p-4 text-sm text-ig-muted leading-relaxed">
                      {item.caption || 'No caption found.'}
                    </div>
                  </div>

                  {/* Angles */}
                  <div>
                    <h3 className="text-xs font-bold text-ig-muted uppercase tracking-wider mb-3">Angles Breakdown</h3>
                    <div className="space-y-3">
                      {(item.angles ?? []).map((a, i) => (
                        <div key={i} className="bg-ig-card border border-ig-border rounded-xl p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="font-semibold text-sm">{a.name}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STRENGTH_COLOR[a.strength]}`}>
                              {a.strength}
                            </span>
                          </div>
                          <p className="text-ig-muted text-sm leading-relaxed">{a.description}</p>
                          {a.timestamp && (
                            <p className="text-ig-faint text-xs mt-2">@ {a.timestamp}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Transcript tab */}
              {tab === 'transcript' && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button
                      onClick={() => navigator.clipboard.writeText(item.transcript ?? '')}
                      className="flex items-center gap-1.5 text-xs text-ig-muted hover:text-ig-text px-3 py-1.5 rounded-lg hover:bg-ig-hover transition-colors"
                    >
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                  <div className="bg-ig-card border border-ig-border rounded-xl p-5 text-sm text-ig-text leading-loose whitespace-pre-wrap">
                    {item.transcript || 'No transcript available.'}
                  </div>
                </div>
              )}

              {/* Frames tab */}
              {tab === 'frames' && (
                <div>
                  {(item.frames ?? []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-ig-faint">
                      <Film size={40} className="mb-3 opacity-30" />
                      <p className="text-sm">Frames are being processed…</p>
                    </div>
                  ) : (
                    <div className="columns-3 gap-3 space-y-3">
                      {(framesExpanded ? (item.frames ?? []) : (item.frames ?? []).slice(0, 9)).map(f => (
                        <div key={f.id} className="relative break-inside-avoid group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={f.url}
                            alt={`Frame ${f.index}`}
                            className="w-full rounded-lg border border-ig-border"
                          />
                          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded">
                            {f.timestamp}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {(item.frames ?? []).length > 9 && (
                    <button
                      onClick={() => setFramesExpanded(v => !v)}
                      className="mt-4 w-full flex items-center justify-center gap-2 text-ig-muted hover:text-ig-text text-sm py-3 border border-ig-border rounded-xl hover:bg-ig-hover transition-colors"
                    >
                      {framesExpanded ? <><ChevronUp size={16} /> Show less</> : <><ChevronDown size={16} /> Show all {(item.frames ?? []).length} frames</>}
                    </button>
                  )}
                </div>
              )}

              {/* Script tab */}
              {tab === 'script' && item.scriptSuggestion && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-ig-muted">Auto-generated in your streamline&apos;s voice</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(item.scriptSuggestion!)}
                      className="flex items-center gap-1.5 text-xs text-ig-muted hover:text-ig-text px-3 py-1.5 rounded-lg hover:bg-ig-hover transition-colors"
                    >
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                  <div className="bg-ig-card border border-ig-border rounded-xl p-5 text-sm text-ig-text leading-loose whitespace-pre-wrap">
                    {item.scriptSuggestion}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
