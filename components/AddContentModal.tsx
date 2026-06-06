'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, Loader2 } from 'lucide-react'
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
      setError(e.message)
      setStep('error')
    }
  }

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
                <button onClick={() => setStep('url')} className="text-ig-text text-sm font-semibold">Back</button>
              )}
              {(step === 'processing' || step === 'done' || step === 'error') && <div className="w-12" />}

              <h2 className="text-[15px] font-bold text-ig-text text-center flex-1">
                {step === 'url' ? 'New Dissection'
                  : step === 'options' ? 'Options'
                  : step === 'processing' ? 'Analysing'
                  : step === 'done' ? 'Done'
                  : 'Error'}
              </h2>

              {(step === 'url' || step === 'options') && (
                <button
                  onClick={step === 'url' ? () => url && setStep('options') : handleAnalyse}
                  disabled={!url}
                  className="text-ig-blue text-sm font-bold disabled:opacity-40"
                >
                  {step === 'url' ? 'Next' : 'Analyse'}
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

                {/* Or paste from clipboard hint */}
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

                {/* Category */}
                <div>
                  <label className="text-[12px] font-semibold text-ig-text block mb-1.5">Category</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as ContentCategory)}
                      className="ig-input appearance-none pr-8 capitalize"
                    >
                      {CONTENT_CATEGORIES.map(c => (
                        <option key={c} value={c} className="capitalize">{c}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ig-muted pointer-events-none" />
                  </div>
                </div>

                {/* Streamline */}
                {streamlines.length > 0 && (
                  <div>
                    <label className="text-[12px] font-semibold text-ig-text block mb-1.5">Apply Streamline (optional)</label>
                    <div className="relative">
                      <select
                        value={streamlineId}
                        onChange={e => setStreamlineId(e.target.value)}
                        className="ig-input appearance-none pr-8"
                      >
                        <option value="">None — just dissect</option>
                        {streamlines.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ig-muted pointer-events-none" />
                    </div>
                    {streamlineId && (
                      <p className="text-[11px] text-ig-muted mt-1">AI will auto-generate a script in your voice.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Processing step */}
            {step === 'processing' && (
              <div className="p-8 flex flex-col items-center gap-5">
                {/* Instagram-style gradient spinner */}
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
                  {/* Progress dots like Instagram */}
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
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-[13px] text-red-600">{error}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={reset} className="ig-btn-ghost flex-1">Start over</button>
                  <button onClick={handleAnalyse} className="ig-btn-blue flex-1">Retry</button>
                </div>
              </div>
            )}

            {/* Bottom safe area */}
            <div className="h-safe-bottom pb-2 sm:pb-0" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
