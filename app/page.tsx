'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { AddContentModal } from '@/components/AddContentModal'
import type { Dissection } from '@/lib/types'

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? '#ED4956' : 'none'} stroke={filled ? '#ED4956' : '#262626'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  )
}
function CommentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  )
}
function SendIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  )
}
function BookmarkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
    </svg>
  )
}

function FeedPost({ item }: { item: Dissection }) {
  const [liked, setLiked] = useState(false)
  const timeAgo = useMemo(() => {
    const diff = Date.now() - new Date(item.createdAt).getTime()
    const h = Math.floor(diff / 3600000)
    if (h < 1) return 'just now'
    if (h < 24) return `${h}h`
    return `${Math.floor(h / 24)}d`
  }, [item.createdAt])

  return (
    <article className="bg-white border border-ig-border mb-4 md:mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Story ring avatar */}
          <div
            className="w-8 h-8 rounded-full p-[1.5px] flex-shrink-0"
            style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-white border-[1.5px] border-white">
              {item.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg,#833AB4,#FD1D1D,#F77737)' }}
                >
                  {item.topic.charAt(0)}
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-ig-text leading-tight truncate max-w-[160px]">{item.topic}</p>
            <p className="text-[11px] text-ig-muted capitalize">{item.category}</p>
          </div>
        </div>
        <button className="text-ig-text px-1">
          <svg width="16" height="4" viewBox="0 0 16 4"><circle cx="2" cy="2" r="2" fill="#262626"/><circle cx="8" cy="2" r="2" fill="#262626"/><circle cx="14" cy="2" r="2" fill="#262626"/></svg>
        </button>
      </div>

      {/* Image */}
      <div className="w-full aspect-square overflow-hidden bg-ig-bg">
        {item.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.thumbnail} alt={item.topic} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white text-4xl font-bold"
            style={{ background: 'linear-gradient(135deg,#833AB4,#FD1D1D,#F77737)' }}
          >
            {item.topic.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button onClick={() => setLiked(v => !v)}>
              <HeartIcon filled={liked} />
            </button>
            <button><CommentIcon /></button>
            <button><SendIcon /></button>
          </div>
          <button><BookmarkIcon /></button>
        </div>

        {/* Hook analysis as "caption" */}
        {item.hookAnalysis && (
          <p className="text-[13px] text-ig-text leading-snug line-clamp-2">
            <span className="font-semibold">Hook: </span>{item.hookAnalysis}
          </p>
        )}

        {/* Angles count */}
        {item.angles?.length > 0 && (
          <p className="text-[12px] text-ig-muted mt-1">
            {item.angles.length} angle{item.angles.length > 1 ? 's' : ''} identified
          </p>
        )}

        <p className="text-[10px] text-ig-faint uppercase tracking-wide mt-2">{timeAgo}</p>
      </div>

      {/* View full analysis */}
      <div className="px-4 pb-3">
        <Link href="/dissections" className="text-[13px] text-ig-muted hover:text-ig-text transition-colors">
          View full dissection →
        </Link>
      </div>
    </article>
  )
}

export default function HomePage() {
  const { dissections, scripts, streamlines, addDissection } = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const recent = dissections.slice(0, 6)

  return (
    <div className="min-h-screen bg-ig-bg">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-ig-border flex items-center justify-between px-4 py-3 md:hidden">
        <span className="ig-logo">ContentOS</span>
        <div className="flex items-center gap-4">
          <button onClick={() => setAddOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-[614px] mx-auto">

        {/* ── Stories row ── */}
        {(dissections.length > 0 || true) && (
          <div className="bg-white border-b border-ig-border mb-4">
            <div className="flex items-start gap-3 px-4 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {/* Add story */}
              <button onClick={() => setAddOpen(true)} className="flex flex-col items-center gap-1 flex-shrink-0 w-[64px]">
                <div className="w-[56px] h-[56px] rounded-full border-[1.5px] border-ig-border bg-white flex items-center justify-center relative">
                  <div className="w-[18px] h-[18px] rounded-full bg-ig-blue flex items-center justify-center absolute -bottom-0.5 -right-0.5 border-2 border-white">
                    <span className="text-white text-[11px] font-bold leading-none">+</span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-ig-bg flex items-center justify-center overflow-hidden">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8E8E8E" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                </div>
                <span className="text-[10px] text-ig-text">Your story</span>
              </button>

              {dissections.slice(0, 8).map((d, i) => (
                <Link key={d.id} href="/dissections" className="flex flex-col items-center gap-1 flex-shrink-0 w-[64px]">
                  <div
                    className="w-[56px] h-[56px] rounded-full p-[2px]"
                    style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-white">
                      {d.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={d.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ background: 'linear-gradient(135deg,#833AB4,#FD1D1D,#F77737)' }}
                        >
                          {d.topic.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-ig-text text-center w-full truncate px-0.5">
                    {d.topic.split(' ')[0]}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {dissections.length === 0 && (
          <div className="bg-white border border-ig-border p-8 text-center mx-4 mt-4 rounded-lg">
            <div className="w-16 h-16 rounded-full border-2 border-ig-text mx-auto mb-4 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.5" strokeLinecap="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-ig-text mb-2">Start Creating</h2>
            <p className="text-ig-muted text-sm mb-4">Paste an Instagram reel URL to dissect it and generate scripts automatically.</p>
            <button
              onClick={() => setAddOpen(true)}
              className="ig-btn-blue"
            >
              Add Content
            </button>
          </div>
        )}

        {/* ── Feed posts ── */}
        {recent.map(d => (
          <FeedPost key={d.id} item={d} />
        ))}

        {/* ── Stats strip ── */}
        {dissections.length > 0 && (
          <div className="bg-white border border-ig-border mx-0 mb-4 p-4 grid grid-cols-3 divide-x divide-ig-border text-center">
            <div>
              <p className="text-lg font-bold text-ig-text">{dissections.length}</p>
              <p className="text-[11px] text-ig-muted">Dissections</p>
            </div>
            <div>
              <p className="text-lg font-bold text-ig-text">{scripts.length}</p>
              <p className="text-[11px] text-ig-muted">Scripts</p>
            </div>
            <div>
              <p className="text-lg font-bold text-ig-text">{streamlines.length}</p>
              <p className="text-[11px] text-ig-muted">Streamlines</p>
            </div>
          </div>
        )}
      </div>

      <AddContentModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        streamlines={streamlines}
        onSuccess={d => { addDissection(d); setAddOpen(false) }}
      />
    </div>
  )
}
