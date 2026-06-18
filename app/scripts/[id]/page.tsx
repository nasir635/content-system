'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

const STATUS_STYLES = {
  draft: { label: 'Draft',          bg: 'rgba(200,217,230,0.4)', color: '#2F4156' },
  ready: { label: 'Ready to Shoot', bg: 'rgba(86,124,141,0.2)',  color: '#567C8D' },
  shot:  { label: 'Shot ✓',        bg: 'rgba(47,65,86,0.15)',   color: '#2F4156' },
}

const STATUS_NEXT: Record<string, 'draft' | 'ready' | 'shot'> = {
  draft: 'ready',
  ready: 'shot',
  shot:  'draft',
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-5">
      <h3
        className="font-bold text-[13px] uppercase tracking-wider mb-4"
        style={{ color: '#8EA7B5' }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function ScriptDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const router   = useRouter()
  const { scripts, updateScript, inspirations } = useStore()
  const [copied, setCopied] = useState(false)

  const item = scripts.find(s => s.id === id)
  const inspiration = item?.inspirationId ? inspirations.find(i => i.id === item.inspirationId) : null

  if (!item) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: '#F5EFEB' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: '#E8F0F5' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#567C8D" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p className="font-bold text-lg" style={{ color: '#2F4156' }}>Script not found</p>
        <button className="cs-btn" onClick={() => router.push('/scripts')}>← Back to Scripts</button>
      </div>
    )
  }

  const status = STATUS_STYLES[item.status]
  const date   = new Date(item.updatedAt).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  // Extract plain text from tiptap JSON
  let plainText = ''
  try {
    const doc = JSON.parse(item.content)
    const texts: string[] = []
    const walk = (node: { type?: string; text?: string; content?: typeof node[] }) => {
      if (node.type === 'text' && node.text) texts.push(node.text)
      if (node.content) node.content.forEach(walk)
    }
    doc.content?.forEach(walk)
    plainText = texts.join('\n')
  } catch {
    plainText = item.content ?? ''
  }

  function copyContent() {
    navigator.clipboard.writeText(plainText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function cycleStatus() {
    if (!item) return
    updateScript(item.id, {
      status: STATUS_NEXT[item.status],
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <div className="min-h-screen" style={{ background: '#F5EFEB' }}>

      {/* ── TOP BAR ── */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-5 py-3"
        style={{
          background: 'rgba(245,239,235,0.94)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #D0DDE6',
        }}
      >
        <button
          className="flex items-center gap-2 font-semibold text-sm"
          style={{ color: '#567C8D' }}
          onClick={() => router.push('/scripts')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#567C8D" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>

        <h1
          className="font-bold text-sm text-center flex-1 px-4 truncate"
          style={{ color: '#2F4156' }}
        >
          {item.title}
        </h1>

        {/* Status badge — tap to advance */}
        <button
          onClick={cycleStatus}
          className="text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0"
          style={{
            background: status.bg,
            color: status.color,
            border: '1px solid rgba(86,124,141,0.25)',
            transition: 'all 0.2s',
          }}
          title="Tap to advance status"
        >
          {status.label}
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── HERO ── */}
        <div
          className="rounded-[20px] overflow-hidden relative"
          style={{ boxShadow: '0 8px 40px rgba(47,65,86,0.14)' }}
        >
          <div
            className="relative w-full flex items-center justify-center"
            style={{
              minHeight: 220,
              background: 'linear-gradient(135deg, #2F4156 0%, #567C8D 60%, #C8D9E6 100%)',
            }}
          >
            {/* Watermark */}
            <svg
              width="80" height="80" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" strokeLinecap="round"
            >
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>

            {/* Overlay info */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {item.category && (
                  <span className="chip capitalize">{item.category}</span>
                )}
                <span
                  className="text-[11px] font-bold px-2 py-1 rounded-full"
                  style={{ background: status.bg, color: status.color }}
                >
                  {status.label}
                </span>
              </div>
              <h2 className="font-bold text-white text-xl leading-snug">{item.title}</h2>
              <p className="text-sm mt-1" style={{ color: 'rgba(200,217,230,0.85)' }}>{date}</p>
            </div>
          </div>
        </div>

        {/* ── SCRIPT CONTENT ── */}
        {plainText ? (
          <SectionCard title="Script">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs" style={{ color: '#8EA7B5' }}>
                {item.category ? `Category: ${item.category}` : 'No category'}
                {inspiration && ' · From inspiration'}
              </p>
              <button className="cs-btn py-1.5 px-4 text-xs" onClick={copyContent}>
                {copied ? '✓ Copied!' : 'Copy Script'}
              </button>
            </div>
            <div
              className="rounded-[14px] p-5 text-sm leading-loose whitespace-pre-wrap"
              style={{
                background: '#FFFFFF',
                border: '1px solid #D0DDE6',
                color: '#2F4156',
                minHeight: 120,
              }}
            >
              {plainText}
            </div>
          </SectionCard>
        ) : (
          <SectionCard title="Script">
            <p className="text-sm text-center py-6" style={{ color: '#8EA7B5' }}>
              No content yet. The script is empty.
            </p>
          </SectionCard>
        )}

        {/* ── VISUAL REFS ── */}
        {item.visualRefs.length > 0 && (
          <SectionCard title={`Visual References (${item.visualRefs.length})`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {item.visualRefs.map(ref => (
                <div
                  key={ref.id}
                  className="rounded-[14px] overflow-hidden"
                  style={{ background: '#FFFFFF', border: '1px solid #D0DDE6' }}
                >
                  {ref.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ref.imageUrl} alt="" className="w-full h-28 object-cover" />
                  )}
                  <div className="p-2">
                    {ref.note && (
                      <p className="text-xs leading-snug" style={{ color: '#567C8D' }}>{ref.note}</p>
                    )}
                    {ref.timestamp && (
                      <p className="text-xs mt-1" style={{ color: '#8EA7B5' }}>@ {ref.timestamp}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── MUSIC ── */}
        {item.music.length > 0 && (
          <SectionCard title={`Music (${item.music.length})`}>
            <div className="space-y-2">
              {item.music.map(m => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-3 rounded-[12px]"
                  style={{ background: '#FFFFFF', border: '1px solid #D0DDE6' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: '#E8F0F5' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#567C8D" strokeWidth="2" strokeLinecap="round">
                      <path d="M9 18V5l12-2v13"/>
                      <circle cx="6" cy="18" r="3"/>
                      <circle cx="18" cy="16" r="3"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#2F4156' }}>{m.title}</p>
                    {m.artist && (
                      <p className="text-xs" style={{ color: '#8EA7B5' }}>{m.artist}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="chip capitalize">{m.type}</span>
                    {m.timestamp && (
                      <span className="text-xs" style={{ color: '#8EA7B5' }}>@ {m.timestamp}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── ACTIONS ── */}
        <div className="flex gap-3 flex-wrap">
          <button className="cs-btn flex items-center gap-2" onClick={cycleStatus}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="9 11 12 14 22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
            Advance to {STATUS_NEXT[item.status]}
          </button>
          {inspiration && (
            <button
              onClick={() => router.push(`/inspirations/${inspiration.id}`)}
              className="cs-btn-outline flex items-center gap-2 py-2 px-4 rounded-[10px]"
              style={{ fontSize: 13 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2F4156" strokeWidth="2" strokeLinecap="round">
                <path d="M9 18h6"/><path d="M10 22h4"/>
                <path d="M12 2a7 7 0 015 11.95V17a1 1 0 01-1 1H8a1 1 0 01-1-1v-3.05A7 7 0 0112 2z"/>
              </svg>
              View inspiration
            </button>
          )}
        </div>

        <div className="h-8" />
      </div>
    </div>
  )
}
