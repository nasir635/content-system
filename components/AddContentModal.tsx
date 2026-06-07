'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, Loader2, Check } from 'lucide-react'
import { CONTENT_CATEGORIES } from '@/lib/types'
import type { ContentCategory, Streamline } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  streamlines: Streamline[]
  onSuccess: (dissection: any) => void
}

type Step = 'url' | 'options' | 'processing' | 'done' | 'error'

const STEPS = [
  'Fetching Instagram post…',
  'Downloading video…',
  'Uploading to AI…',
  'Analysing hooks & angles…',
  'Generating script…',
  'Saving to Notion…',
  'Done!',
]

/* ── Custom Select ─────────────────────────────────────────── */
function CustomSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  renderLabel,
}: {
  value: T
  onChange: (v: T) => void
  options: T[]
  placeholder?: string
  renderLabel?: (v: T) => string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const label = (v: T) => renderLabel ? renderLabel(v) : v

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
        style={{
          background: '#FFFFFF',
          border: `1.5px solid ${open ? '#567C8D' : '#D0DDE6'}`,
          color: '#2F4156',
          boxShadow: open ? '0 0 0 3px rgba(86,124,141,0.12)' : 'none',
        }}
      >
        <span className="capitalize truncate">{value ? label(value) : placeholder}</span>
        <ChevronDown
          size={14}
          className="flex-shrink-0 ml-2 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'none', color: '#8EA7B5' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 mt-1.5 rounded-xl overflow-hidden z-50"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #D0DDE6',
              boxShadow: '0 8px 32px rgba(47,65,86,0.18)',
              maxHeight: 240,
              overflowY: 'auto',
            }}
          >
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false) }}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm capitalize transition-colors text-left"
                style={{
                  background: opt === value ? 'rgba(86,124,141,0.08)' : 'transparent',
                  color: opt === value ? '#2F4156' : '#567C8D',
                  fontWeight: opt === value ? 600 : 400,
                }}
                onMouseEnter={e => { if (opt !== value) (e.currentTarget as HTMLElement).style.background = 'rgba(86,124,141,0.05)' }}
                onMouseLeave={e => { if (opt !== value) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <span>{label(opt)}</span>
                {opt === value && <Check size={13} style={{ color: '#567C8D', flexShrink: 0 }} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Modal ─────────────────────────────────────────────────── */
export function AddContentModal({ open, onClose, streamlines, onSuccess }: Props) {
  const [step, setStep]             = useState<Step>('url')
  const [url, setUrl]               = useState('')
  const [category, setCategory]     = useState<ContentCategory>('content creation tips')
  const [streamlineId, setStreamlineId] = useState('')
  const [procStep, setProcStep]     = useState(0)
  const [error, setError]           = useState('')

  function reset() {
    setStep('url'); setUrl(''); setStreamlineId('')
    setProcStep(0); setError('')
    setCategory('content creation tips')
  }

  async function handleAnalyse() {
    setStep('processing')
    setProcStep(0)
    const interval = setInterval(() => setProcStep(p => Math.min(p + 1, STEPS.length - 2)), 2500)
    try {
      const res = await fetch('/api/dissect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, category, streamlineId: streamlineId || undefined }),
      })
      clearInterval(interval)
      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.error || 'Analysis failed')
      }
      const data = await res.json()
      setProcStep(STEPS.length - 1)
      setTimeout(() => { onSuccess(data); reset() }, 600)
    } catch (e: any) {
      clearInterval(interval)
      // Clean up Gemini quota errors into plain English
      let msg: string = e.message ?? 'Analysis failed'
      if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
        msg = 'Gemini API quota exceeded. Please add a paid Gemini API key in your Vercel environment variables (GEMINI_API_KEY).'
      } else if (msg.includes('Could not parse Instagram')) {
        msg = 'That doesn\'t look like a valid Instagram reel URL. Try copying the link directly from the Instagram app.'
      }
      setError(msg)
      setStep('error')
    }
  }

  const streamlineOptions = streamlines.map(s => s.id)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
          onClick={e => { if (e.target === e.currentTarget) { reset(); onClose() } }}
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="bg-white w-full max-w-[400px] rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-ig-faint" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-ig-border">
              {step === 'url' && (
                <button onClick={() => { reset(); onClose() }} className="text-ig-text text-sm font-semibold">Cancel</button>
              )}
              {step === 'options' && (
                <button onClick={() => setStep('url')} className="text-ig-text text-sm font-semibold">← Back</button>
              )}
              {(step === 'processing' || step === 'done' || step === 'error') && <div className="w-12" />}

              <h2 className="text-[15px] font-bold text-ig-text text-center flex-1">
                {step === 'url' ? 'New Dissection'
                  : step === 'options' ? 'Options'
                  : step === 'processing' ? 'Analysing…'
                  : step === 'done' ? 'Done'
                  : 'Error'}
              </h2>

              {(step === 'url' || step === 'options') && (
                <button
                  onClick={step === 'url' ? () => url && setStep('options') : handleAnalyse}
                  disabled={!url}
                  className="text-sm font-bold disabled:opacity-40 transition-opacity"
                  style={{ color: '#0095F6' }}
                >
                  {step === 'url' ? 'Next →' : 'Analyse'}
                </button>
              )}
              {(step === 'done' || step === 'error') && (
                <button onClick={() => { reset(); onClose() }} className="text-ig-text">
                  <X size={20} />
                </button>
              )}
            </div>

            {/* URL step */}
            {step === 'url' && (
              <div className="p-4 space-y-3">
                <p className="text-[13px] text-ig-muted text-center">Paste an Instagram reel or post URL</p>
                <input
                  autoFocus
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/…"
                  className="ig-input"
                  onKeyDown={e => e.key === 'Enter' && url && setStep('options')}
                />
                <p className="text-[12px] text-ig-muted text-center">
                  The app will automatically download and analyse the video
                </p>
              </div>
            )}

            {/* Options step */}
            {step === 'options' && (
              <div className="p-4 space-y-4">
                {/* URL preview */}
                <div className="bg-ig-bg rounded-lg px-3 py-2">
                  <p className="text-[12px] text-ig-muted truncate">{url}</p>
                </div>

                {/* Category — custom select */}
                <div>
                  <label className="text-[12px] font-semibold text-ig-text block mb-1.5">Category</label>
                  <CustomSelect
                    value={category}
                    onChange={v => setCategory(v)}
                    options={CONTENT_CATEGORIES as unknown as ContentCategory[]}
                  />
                </div>

                {/* Streamline — custom select */}
                {streamlines.length > 0 && (
                  <div>
                    <label className="text-[12px] font-semibold text-ig-text block mb-1.5">Apply Streamline <span style={{ color: '#8EA7B5', fontWeight: 400 }}>(optional)</span></label>
                    <CustomSelect
                      value={streamlineId as any}
                      onChange={v => setStreamlineId(v)}
                      options={['', ...streamlineOptions] as any}
                      placeholder="None — just dissect"
                      renderLabel={v => v ? (streamlines.find(s => s.id === v)?.name ?? v) : 'None — just dissect'}
                    />
                    {streamlineId && (
                      <p className="text-[11px] text-ig-muted mt-1.5">✦ AI will auto-generate a script in your voice.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Processing step */}
            {step === 'processing' && (
              <div className="p-8 flex flex-col items-center gap-5">
                <div className="relative w-16 h-16">
                  <div
                    className="absolute inset-0 rounded-full animate-spin"
                    style={{ background: 'conic-gradient(from 0deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888, #f09433)', WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), white 0)' }}
                  />
                  <div className="absolute inset-[6px] rounded-full bg-white flex items-center justify-center">
                    <Loader2 size={16} className="animate-spin text-ig-muted" />
                  </div>
                </div>
                <div className="text-center w-full">
                  <p className="text-[14px] font-semibold text-ig-text mb-3">{STEPS[procStep]}</p>
                  <div className="flex items-center justify-center gap-1.5">
                    {STEPS.map((_, i) => (
                      <div
                        key={i}
                        className="rounded-full transition-all duration-300"
                        style={{
                          width: i === procStep ? 20 : 6,
                          height: 6,
                          background: i <= procStep ? '#0095F6' : '#DBDBDB'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Done step */}
            {step === 'done' && (
              <div className="p-8 flex flex-col items-center gap-3 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(45deg,#f09433,#dc2743,#bc1888)' }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <p className="text-[16px] font-bold text-ig-text">Dissection saved</p>
                <p className="text-[13px] text-ig-muted">Synced to Notion automatically.</p>
              </div>
            )}

            {/* Error step */}
            {step === 'error' && (
              <div className="p-6 space-y-4">
                <div className="rounded-xl p-4" style={{ background: '#FFF1F1', border: '1px solid #FFCDD2' }}>
                  <p className="text-[13px] font-semibold mb-1" style={{ color: '#C62828' }}>Something went wrong</p>
                  <p className="text-[12px] leading-relaxed" style={{ color: '#D32F2F' }}>{error}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={reset} className="ig-btn-ghost flex-1">Start over</button>
                  <button onClick={handleAnalyse} className="ig-btn-blue flex-1">Retry</button>
                </div>
              </div>
            )}

            <div className="pb-2 sm:pb-0" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
