'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import type { AngleBreakdown } from '@/lib/types'

const STRENGTH_STYLES: Record<AngleBreakdown['strength'], { bg: string; color: string; label: string }> = {
  strong: { bg: 'rgba(86,124,141,0.15)', color: '#2F4156', label: 'Strong' },
  medium: { bg: 'rgba(200,217,230,0.4)', color: '#567C8D', label: 'Medium' },
  weak:   { bg: 'rgba(245,239,235,0.8)', color: '#8EA7B5', label: 'Weak'   },
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

export default function DissectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const { dissections } = useStore()
  const [transcriptOpen, setTranscriptOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const item = dissections.find(d => d.id === id)

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#F5EFEB' }}>
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: '#E8F0F5' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#567C8D" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p className="font-bold text-lg" style={{ color: '#2F4156' }}>Dissection not found</p>
        <button className="cs-btn" onClick={() => router.push('/dissections')}>← Back to Dissections</button>
      </div>
    )
  }

  const date = new Date(item.createdAt).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  function copyScript() {
    if (item?.scriptSuggestion) {
      navigator.clipboard.writeText(item.scriptSuggestion)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function copyTranscript() {
    navigator.clipboard.writeText(item?.transcript ?? '')
  }

  return (
    <div className="min-h-screen" style={{ background: '#F5EFEB' }}>

      {/* Top bar */}
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
          onClick={() => router.push('/dissections')}
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
          {item.topic}
        </h1>

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm font-semibold"
          style={{ color: '#567C8D' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#567C8D" strokeWidth="2" strokeLinecap="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Original
        </a>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* HERO */}
        <div className="rounded-[20px] overflow-hidden relative" style={{ boxShadow: '0 8px 40px rgba(47,65,86,0.14)' }}>
          {item.thumbnail ? (
            <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.thumbnail}
                alt={item.topic}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay at bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1/2"
                style={{ background: 'linear-gradient(to top, rgba(47,65,86,0.7) 0%, transparent 100%)' }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="chip capitalize">{item.category}</span>
                <h2 className="font-bold text-white text-xl mt-2 leading-snug">{item.topic}</h2>
                <p className="text-sm mt-1" style={{ color: 'rgba(200,217,230,0.85)' }}>{date}</p>
              </div>
            </div>
          ) : (
            <div
              className="relative w-full flex items-center justify-center"
              style={{
                aspectRatio: '16/9',
                background: 'linear-gradient(135deg, #2F4156 0%, #567C8D 60%, #C8D9E6 100%)',
              }}
            >
              <span className="text-white font-bold" style={{ fontSize: 72, opacity: 0.3 }}>
                {item.topic.charAt(0).toUpperCase()}
              </span>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="chip capitalize">{item.category}</span>
                <h2 className="font-bold text-white text-xl mt-2 leading-snug">{item.topic}</h2>
                <p className="text-sm mt-1" style={{ color: 'rgba(200,217,230,0.85)' }}>{date}</p>
              </div>
            </div>
          )}
        </div>

        {/* 1. The Hook */}
        {item.hookAnalysis && (
          <SectionCard title="The Hook">
            <blockquote
              className="text-base leading-relaxed"
              style={{
                color: '#2F4156',
                borderLeft: '3px solid #C8D9E6',
                paddingLeft: '1rem',
                fontStyle: 'italic',
              }}
            >
              {item.hookAnalysis}
            </blockquote>
          </SectionCard>
        )}

        {/* 2. Angles */}
        {item.angles?.length > 0 && (
          <SectionCard title={`Angles (${item.angles.length})`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {item.angles.map((angle, i) => {
                const style = STRENGTH_STYLES[angle.strength]
                return (
                  <div
                    key={i}
                    className="rounded-[14px] p-4"
                    style={{ background: '#F5EFEB', border: '1px solid #D0DDE6' }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-semibold text-sm leading-tight" style={{ color: '#2F4156' }}>
                        {angle.name}
                      </p>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: style.bg, color: style.color }}
                      >
                        {style.label}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: '#567C8D' }}>
                      {angle.description}
                    </p>
                    {angle.timestamp && (
                      <p className="text-xs mt-2" style={{ color: '#8EA7B5' }}>@ {angle.timestamp}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </SectionCard>
        )}

        {/* 3. Transcript — collapsible */}
        {item.transcript && (
          <SectionCard title="Transcript">
            <button
              className="flex items-center gap-2 text-sm font-semibold mb-3"
              style={{ color: '#567C8D' }}
              onClick={() => setTranscriptOpen(v => !v)}
            >
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#567C8D"
                strokeWidth="2.5" strokeLinecap="round"
                style={{ transform: transcriptOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
              >
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              {transcriptOpen ? 'Collapse transcript' : 'Expand transcript'}
              <button
                className="ml-auto text-xs cs-btn-outline py-1 px-3"
                onClick={e => { e.stopPropagation(); copyTranscript() }}
                style={{ fontWeight: 500 }}
              >
                Copy
              </button>
            </button>
            {transcriptOpen && (
              <div
                className="rounded-[14px] p-4 text-sm leading-loose whitespace-pre-wrap"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D0DDE6',
                  color: '#2F4156',
                  fontFamily: 'monospace',
                  fontSize: 13,
                }}
              >
                {item.transcript}
              </div>
            )}
          </SectionCard>
        )}

        {/* 4. Caption */}
        {item.caption && (
          <SectionCard title="Caption">
            <p className="text-sm leading-relaxed" style={{ color: '#567C8D' }}>
              {item.caption}
            </p>
          </SectionCard>
        )}

        {/* 5. Generated Script */}
        {item.scriptSuggestion && (
          <SectionCard title="Generated Script">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs" style={{ color: '#8EA7B5' }}>
                Auto-generated in your streamline&apos;s voice
              </p>
              <button
                className="cs-btn py-1.5 px-4 text-xs"
                onClick={copyScript}
              >
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
              {item.scriptSuggestion}
            </div>
          </SectionCard>
        )}

        {/* 6. Actions row */}
        <div className="flex gap-3 flex-wrap">
          <button
            className="cs-btn flex items-center gap-2"
            onClick={() => router.push('/scripts')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Generate Script
          </button>
          {item.notionPageId && (
            <button className="cs-btn-outline flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2F4156" strokeWidth="2" strokeLinecap="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              View in Notion
            </button>
          )}
        </div>

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>
    </div>
  )
}
