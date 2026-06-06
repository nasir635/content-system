'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Link, Layers, Zap, ChevronDown, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { CONTENT_CATEGORIES } from '@/lib/types'
import type { ContentCategory, Streamline } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  streamlines: Streamline[]
  onSuccess: (dissection: any) => void
}

type Step = 'url' | 'options' | 'processing' | 'done' | 'error'

const PROCESSING_STEPS = [
  'Fetching Instagram post…',
  'Downloading media…',
  'Extracting transcript & caption…',
  'Analysing angles & hooks…',
  'Generating script (if applicable)…',
  'Extracting frames…',
  'Saving to Notion…',
  'All done!',
]

export function AddContentModal({ open, onClose, streamlines, onSuccess }: Props) {
  const [step, setStep]               = useState<Step>('url')
  const [url, setUrl]                 = useState('')
  const [category, setCategory]       = useState<ContentCategory>('content creation tips')
  const [withFrames, setWithFrames]   = useState(false)
  const [streamlineId, setStreamlineId] = useState('')
  const [procStep, setProcStep]       = useState(0)
  const [error, setError]             = useState('')
  const [result, setResult]           = useState<any>(null)

  function reset() {
    setStep('url'); setUrl(''); setWithFrames(false)
    setStreamlineId(''); setProcStep(0); setError(''); setResult(null)
    setCategory('content creation tips')
  }

  async function handleAnalyse() {
    setStep('processing')
    setProcStep(0)

    // Simulate step progression while real API runs
    const interval = setInterval(() => {
      setProcStep(p => Math.min(p + 1, PROCESSING_STEPS.length - 2))
    }, 2200)

    try {
      const res = await fetch('/api/dissect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, category, withFrames, streamlineId: streamlineId || undefined }),
      })
      clearInterval(interval)

      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.error || 'Analysis failed')
      }

      const data = await res.json()
      setProcStep(PROCESSING_STEPS.length - 1)
      setResult(data)
      setTimeout(() => { setStep('done'); onSuccess(data) }, 800)
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) { reset(); onClose() } }}
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="bg-ig-surface border border-ig-border rounded-2xl w-full max-w-lg overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-ig-border">
              <h2 className="font-bold text-base">
                {step === 'url' ? 'Add Content'
                  : step === 'options' ? 'Dissection Options'
                  : step === 'processing' ? 'Analysing…'
                  : step === 'done' ? 'Done!'
                  : 'Error'}
              </h2>
              <button onClick={() => { reset(); onClose() }} className="text-ig-muted hover:text-ig-text transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            {/* URL step */}
            {step === 'url' && (
              <div className="p-6 space-y-4">
                <p className="text-ig-muted text-sm">Paste an Instagram reel or post URL</p>
                <div className="flex items-center gap-3 bg-ig-card border border-ig-border rounded-xl px-4 py-3 focus-within:border-ig-blue transition-colors">
                  <Link size={18} className="text-ig-faint flex-shrink-0" />
                  <input
                    autoFocus
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://www.instagram.com/reel/…"
                    className="flex-1 bg-transparent text-ig-text placeholder-ig-faint text-sm outline-none"
                    onKeyDown={e => e.key === 'Enter' && url && setStep('options')}
                  />
                </div>
                <button
                  disabled={!url}
                  onClick={() => setStep('options')}
                  className="w-full bg-ig-blue hover:bg-ig-blue-hover disabled:opacity-40 disabled:cursor-not-allowed
                    text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Options step */}
            {step === 'options' && (
              <div className="p-6 space-y-5">
                {/* Category */}
                <div>
                  <label className="text-xs font-semibold text-ig-muted uppercase tracking-wider mb-2 block">Category</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as ContentCategory)}
                      className="w-full bg-ig-card border border-ig-border text-ig-text text-sm px-4 py-3 rounded-xl
                        appearance-none outline-none focus:border-ig-blue transition-colors cursor-pointer capitalize"
                    >
                      {CONTENT_CATEGORIES.map(c => (
                        <option key={c} value={c} className="capitalize bg-ig-card">{c}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-ig-faint pointer-events-none" />
                  </div>
                </div>

                {/* Frame extraction */}
                <div
                  onClick={() => setWithFrames(v => !v)}
                  className={clsx(
                    'flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all',
                    withFrames ? 'border-ig-blue bg-ig-blue/10' : 'border-ig-border bg-ig-card hover:border-ig-muted'
                  )}
                >
                  <div className={clsx(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                    withFrames ? 'bg-ig-blue border-ig-blue' : 'border-ig-faint'
                  )}>
                    {withFrames && <CheckCircle2 size={14} className="text-white fill-white" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Layers size={15} className={withFrames ? 'text-ig-blue' : 'text-ig-muted'} />
                      <p className="font-semibold text-sm">Extract frames</p>
                    </div>
                    <p className="text-ig-faint text-xs mt-1">Save frame-by-frame screenshots. Use them as visual references in your scripts.</p>
                  </div>
                </div>

                {/* Streamline */}
                {streamlines.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-ig-muted uppercase tracking-wider mb-2 block">
                      <Zap size={12} className="inline mr-1" />
                      Apply Streamline (optional)
                    </label>
                    <div className="relative">
                      <select
                        value={streamlineId}
                        onChange={e => setStreamlineId(e.target.value)}
                        className="w-full bg-ig-card border border-ig-border text-ig-text text-sm px-4 py-3 rounded-xl
                          appearance-none outline-none focus:border-ig-blue transition-colors cursor-pointer"
                      >
                        <option value="">No streamline</option>
                        {streamlines.map(s => (
                          <option key={s.id} value={s.id} className="bg-ig-card">{s.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-ig-faint pointer-events-none" />
                    </div>
                    {streamlineId && (
                      <p className="text-ig-faint text-xs mt-2">
                        AI will auto-generate a script in your streamline&apos;s voice after dissecting.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button onClick={() => setStep('url')} className="flex-1 border border-ig-border text-ig-muted hover:text-ig-text hover:border-ig-muted py-3 rounded-xl text-sm font-semibold transition-colors">
                    Back
                  </button>
                  <button onClick={handleAnalyse} className="flex-1 bg-ig-blue hover:bg-ig-blue-hover text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                    Dissect
                  </button>
                </div>
              </div>
            )}

            {/* Processing step */}
            {step === 'processing' && (
              <div className="p-8 flex flex-col items-center gap-6">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full bg-ig-gradient opacity-20 animate-ping" />
                  <div className="absolute inset-0 rounded-full bg-ig-gradient opacity-40" />
                  <div className="absolute inset-2 rounded-full bg-ig-surface flex items-center justify-center">
                    <Loader2 size={20} className="animate-spin text-ig-blue" />
                  </div>
                </div>
                <div className="text-center space-y-2 w-full">
                  <p className="font-semibold text-sm">{PROCESSING_STEPS[procStep]}</p>
                  <div className="w-full bg-ig-border rounded-full h-1.5">
                    <motion.div
                      className="h-1.5 rounded-full bg-ig-gradient"
                      animate={{ width: `${((procStep + 1) / PROCESSING_STEPS.length) * 100}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <p className="text-ig-faint text-xs">{procStep + 1} / {PROCESSING_STEPS.length}</p>
                </div>
              </div>
            )}

            {/* Done step */}
            {step === 'done' && (
              <div className="p-8 flex flex-col items-center gap-4 text-center">
                <CheckCircle2 size={48} className="text-green-400" />
                <p className="font-bold text-lg">Dissection complete</p>
                <p className="text-ig-muted text-sm">Saved to your library and synced to Notion.</p>
                <button onClick={() => { reset(); onClose() }} className="mt-2 bg-ig-blue hover:bg-ig-blue-hover text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm">
                  View it
                </button>
              </div>
            )}

            {/* Error step */}
            {step === 'error' && (
              <div className="p-8 flex flex-col items-center gap-4 text-center">
                <AlertCircle size={48} className="text-red-400" />
                <p className="font-bold text-lg">Something went wrong</p>
                <p className="text-ig-muted text-sm">{error}</p>
                <div className="flex gap-3 w-full">
                  <button onClick={reset} className="flex-1 border border-ig-border text-ig-muted hover:text-ig-text py-3 rounded-xl text-sm font-semibold transition-colors">
                    Start over
                  </button>
                  <button onClick={handleAnalyse} className="flex-1 bg-ig-blue hover:bg-ig-blue-hover text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                    Retry
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
