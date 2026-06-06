'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Zap, Trash2, Edit3, Save } from 'lucide-react'
import { useStore } from '@/lib/store'
import type { Streamline } from '@/lib/types'
import { v4 as uuid } from 'uuid'

function StreamlineForm({ initial, onSave, onCancel }: {
  initial?: Partial<Streamline>; onSave: (s: Partial<Streamline>) => void; onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '', description: initial?.description ?? '',
    voiceRules: initial?.voiceRules ?? '', scriptRules: initial?.scriptRules ?? '',
    tone: initial?.tone ?? '', contentStyle: initial?.contentStyle ?? '',
    exampleOpeners: initial?.exampleOpeners ?? '', wordsToAvoid: initial?.wordsToAvoid ?? '',
  })
  const fields = [
    { key: 'name',           label: 'Streamline Name',           placeholder: 'e.g. Faasle Brand', rows: 1 },
    { key: 'description',    label: 'What is this for?',         placeholder: 'Quick description of this content style', rows: 2 },
    { key: 'voiceRules',     label: 'Voice Rules',               placeholder: 'How should it sound? e.g. Intimate, poetic, uses Urdu phrases naturally…', rows: 4 },
    { key: 'tone',           label: 'Tone',                      placeholder: 'e.g. Warm but cool, nostalgic, aspirational, not corporate…', rows: 3 },
    { key: 'scriptRules',    label: 'Script Rules',              placeholder: 'e.g. Always open with a hook question, max 60 seconds, short punchy lines…', rows: 4 },
    { key: 'contentStyle',   label: 'Content Style',             placeholder: 'e.g. Cinematic B-roll with voiceover, talking head, POV…', rows: 3 },
    { key: 'exampleOpeners', label: 'Example Openers',           placeholder: 'Paste a few opening lines in your voice…', rows: 4 },
    { key: 'wordsToAvoid',   label: 'Words / Phrases to Avoid',  placeholder: 'e.g. "game-changer", "hustle"…', rows: 2 },
  ] as const
  return (
    <div className="bg-ig-card border border-ig-border rounded-2xl p-6 space-y-5">
      {fields.map(f => (
        <div key={f.key}>
          <label className="text-xs font-bold text-ig-muted uppercase tracking-wider mb-2 block">{f.label}</label>
          {f.rows === 1
            ? <input value={form[f.key]} onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))} placeholder={f.placeholder}
                className="w-full bg-ig-surface border border-ig-border rounded-xl px-4 py-3 text-sm text-ig-text placeholder-ig-faint outline-none focus:border-ig-blue transition-colors" />
            : <textarea value={form[f.key]} onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))} placeholder={f.placeholder} rows={f.rows}
                className="w-full bg-ig-surface border border-ig-border rounded-xl px-4 py-3 text-sm text-ig-text placeholder-ig-faint outline-none focus:border-ig-blue transition-colors resize-none" />
          }
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 border border-ig-border text-ig-muted hover:text-ig-text py-3 rounded-xl text-sm font-semibold transition-colors hover:bg-ig-hover">Cancel</button>
        <button onClick={() => onSave(form)} disabled={!form.name}
          className="flex-1 bg-ig-blue hover:bg-ig-blue-hover disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
          <Save size={15} /> Save Streamline
        </button>
      </div>
    </div>
  )
}

export default function StreamlinesPage() {
  const { streamlines, addStreamline, updateStreamline, deleteStreamline } = useStore()
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  return (
    <div className="min-h-screen bg-ig-bg">
      <div className="sticky top-0 z-30 bg-ig-bg/95 backdrop-blur-md border-b border-ig-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Streamlines</h1>
            <p className="text-ig-faint text-xs mt-0.5">Define your voice, rules, and style for each content stream</p>
          </div>
          <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-ig-blue hover:bg-ig-blue-hover text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm">
            <Plus size={16} /><span className="hidden sm:inline">New Streamline</span>
          </button>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <AnimatePresence>
          {creating && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <StreamlineForm onSave={form => { addStreamline({ ...form, id: uuid(), createdAt: new Date().toISOString() } as Streamline); setCreating(false) }} onCancel={() => setCreating(false)} />
            </motion.div>
          )}
        </AnimatePresence>
        {streamlines.length === 0 && !creating ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-2xl bg-ig-card border border-ig-border flex items-center justify-center mb-4"><Zap size={32} className="text-ig-faint" /></div>
            <p className="font-bold text-lg mb-2">No streamlines yet</p>
            <p className="text-ig-muted text-sm mb-6 max-w-sm">Define your voice, tone and script rules. Claude will use this to generate scripts in your exact style.</p>
            <button onClick={() => setCreating(true)} className="bg-ig-blue hover:bg-ig-blue-hover text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">Create first streamline</button>
          </div>
        ) : (
          <div className="space-y-4">
            {streamlines.map(s => (
              <motion.div key={s.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {editingId === s.id ? (
                  <StreamlineForm initial={s} onSave={form => { updateStreamline(s.id, form); setEditingId(null) }} onCancel={() => setEditingId(null)} />
                ) : (
                  <div className="bg-ig-card border border-ig-border rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-ig-gradient flex items-center justify-center flex-shrink-0"><Zap size={15} className="text-white" /></div>
                        <div><p className="font-bold">{s.name}</p>{s.description && <p className="text-xs text-ig-muted mt-0.5">{s.description}</p>}</div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingId(s.id)} className="p-2 text-ig-muted hover:text-ig-text rounded-lg hover:bg-ig-hover transition-colors"><Edit3 size={15} /></button>
                        <button onClick={() => deleteStreamline(s.id)} className="p-2 text-ig-muted hover:text-red-400 rounded-lg hover:bg-ig-hover transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ label: 'Voice', val: s.voiceRules }, { label: 'Tone', val: s.tone }, { label: 'Script Rules', val: s.scriptRules }, { label: 'Style', val: s.contentStyle }]
                        .filter(x => x.val).map(({ label, val }) => (
                        <div key={label} className="bg-ig-surface rounded-xl p-3">
                          <p className="text-[10px] font-bold text-ig-faint uppercase tracking-wider mb-1">{label}</p>
                          <p className="text-xs text-ig-muted line-clamp-3">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
