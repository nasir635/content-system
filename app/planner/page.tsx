'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { toast } from '@/lib/toast'
import type { PlanEntry } from '@/lib/types'
import { v4 as uuid } from 'uuid'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function ymd(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function prettyDate(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return `${WEEKDAYS[new Date(y, m - 1, d).getDay()]}, ${MONTHS[m - 1]} ${d}`
}

function PlanModal({ dateKey, entry, onClose }: {
  dateKey: string; entry?: PlanEntry; onClose: () => void
}) {
  const { categories, scripts, addPlan, updatePlan, deletePlan } = useStore()
  const [categoryId, setCategoryId] = useState(entry?.categoryId ?? categories[0]?.id ?? '')
  const [title, setTitle] = useState(entry?.title ?? '')
  const [note, setNote] = useState(entry?.note ?? '')
  const [scriptId, setScriptId] = useState(entry?.scriptId ?? '')
  const [status, setStatus] = useState<PlanEntry['status']>(entry?.status ?? 'planned')

  function save() {
    if (!categoryId) return
    const now = new Date().toISOString()
    if (entry) {
      updatePlan(entry.id, { categoryId, title: title.trim(), note, scriptId: scriptId || undefined, status, updatedAt: now })
      toast('Plan updated')
    } else {
      addPlan({ id: uuid(), date: dateKey, categoryId, title: title.trim(), note, scriptId: scriptId || undefined, status, createdAt: now })
      toast('Added to plan')
    }
    onClose()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(47,65,86,0.45)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div initial={{ y: 26, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 26, opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', damping: 30, stiffness: 340 }}
        className="w-full max-w-md rounded-lg overflow-hidden flex flex-col"
        style={{ background: '#FFFFFF', border: '1px solid #DFE3EB', boxShadow: '0 24px 64px rgba(47,65,86,0.25)', maxHeight: '90vh' }}>
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid #EAF0F6' }}>
          <div>
            <h2 className="font-bold text-[15px]" style={{ color: '#33475B' }}>{entry ? 'Edit plan' : 'Plan a post'}</h2>
            <p className="text-xs mt-0.5" style={{ color: '#7C98B6' }}>{prettyDate(dateKey)}</p>
          </div>
          <button onClick={onClose} style={{ color: '#7C98B6' }} className="transition-colors hover:text-[#33475B]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#7C98B6' }}>Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => {
                const active = categoryId === c.id
                return (
                  <button key={c.id} type="button" onClick={() => setCategoryId(c.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{ background: active ? `${c.color}1A` : '#F5F8FA', color: active ? c.color : '#516F90', border: `1.5px solid ${active ? c.color : '#DFE3EB'}` }}>
                    <span className="rounded-full" style={{ width: 8, height: 8, background: c.color }} />
                    {c.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#7C98B6' }}>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What are you posting?" className="cs-input" autoFocus />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#7C98B6' }}>Note</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Optional details…" className="cs-input resize-none" />
          </div>

          {scripts.length > 0 && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#7C98B6' }}>Link a script</label>
              <select value={scriptId} onChange={e => setScriptId(e.target.value)} className="cs-input">
                <option value="">None</option>
                {scripts.map(s => <option key={s.id} value={s.id}>{s.title || 'Untitled'}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#7C98B6' }}>Status</label>
            <div className="flex gap-2">
              {(['planned', 'posted'] as const).map(st => (
                <button key={st} type="button" onClick={() => setStatus(st)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all"
                  style={{ background: status === st ? '#33475B' : '#F5F8FA', color: status === st ? '#FFF' : '#516F90', border: `1.5px solid ${status === st ? '#33475B' : '#DFE3EB'}` }}>
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid #EAF0F6' }}>
          {entry && (
            <button className="py-2.5 px-4 rounded-md text-sm font-semibold transition-colors" style={{ color: '#B04A4A', border: '1.5px solid #F0D0D0' }}
              onClick={() => { deletePlan(entry.id); toast('Plan removed'); onClose() }}>
              Delete
            </button>
          )}
          <button className="cs-btn-outline flex-1 py-2.5 rounded-md text-sm font-semibold" onClick={onClose}>Cancel</button>
          <button className="cs-btn flex-1 py-2.5 rounded-md text-sm" disabled={!categoryId} onClick={save}>
            {entry ? 'Save' : 'Add to plan'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function PlannerPage() {
  const { plans, categories } = useStore()
  const router = useRouter()
  const now = new Date()
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const [modal, setModal] = useState<{ dateKey: string; entry?: PlanEntry } | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const todayKey = ymd(now.getFullYear(), now.getMonth(), now.getDate())

  // Avoid SSR/client date mismatch — render after mount.
  if (!mounted) return <div className="min-h-screen" style={{ background: '#F5F8FA' }} />

  const catById = (id: string) => categories.find(c => c.id === id)

  const firstWeekday = new Date(view.y, view.m, 1).getDay()
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  function shift(delta: number) {
    setView(v => {
      const m = v.m + delta
      if (m < 0) return { y: v.y - 1, m: 11 }
      if (m > 11) return { y: v.y + 1, m: 0 }
      return { y: v.y, m }
    })
  }
  function goToday() { setView({ y: now.getFullYear(), m: now.getMonth() }) }

  const monthCount = plans.filter(p => {
    const [py, pm] = p.date.split('-').map(Number)
    return py === view.y && pm === view.m + 1
  }).length

  return (
    <div className="min-h-screen" style={{ background: '#F5F8FA' }}>
      <div className="sticky top-0 z-30" style={{ background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #DFE3EB' }}>
        <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
          <div>
            <h1 className="font-bold text-[18px]" style={{ color: '#33475B' }}>Planner</h1>
            <p className="text-xs mt-0.5" style={{ color: '#7C98B6' }}>{monthCount} {monthCount === 1 ? 'post' : 'posts'} planned this month</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => shift(-1)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ border: '1px solid #DFE3EB', color: '#516F90', background: '#FFF' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#EAF0F6'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#FFF'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="text-sm font-bold text-center" style={{ color: '#33475B', minWidth: 140 }}>{MONTHS[view.m]} {view.y}</span>
            <button onClick={() => shift(1)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ border: '1px solid #DFE3EB', color: '#516F90', background: '#FFF' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#EAF0F6'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#FFF'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <button onClick={goToday} className="cs-btn-outline py-1.5 px-3 rounded-md text-xs font-semibold ml-1">Today</button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Legend */}
        {categories.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap mb-4">
            {categories.map(c => (
              <div key={c.id} className="flex items-center gap-1.5">
                <span className="rounded-full" style={{ width: 8, height: 8, background: c.color }} />
                <span className="text-xs font-medium" style={{ color: '#516F90' }}>{c.name}</span>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-lg overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #DFE3EB', boxShadow: '0 1px 3px rgba(47,65,86,0.05)' }}>
          {/* Weekday header */}
          <div className="grid grid-cols-7" style={{ borderBottom: '1px solid #EAF0F6' }}>
            {WEEKDAYS.map(w => (
              <div key={w} className="px-2 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider" style={{ color: '#99ACC2' }}>{w}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {cells.map((d, i) => {
              if (d === null) return <div key={i} style={{ minHeight: 104, background: '#FAFBFC', borderRight: (i % 7 !== 6) ? '1px solid #EEF2F7' : 'none', borderBottom: '1px solid #EEF2F7' }} />
              const key = ymd(view.y, view.m, d)
              const dayPlans = plans.filter(p => p.date === key)
              const isToday = key === todayKey
              return (
                <div key={i} className="group p-1.5 flex flex-col gap-1 transition-colors"
                  style={{ minHeight: 104, borderRight: (i % 7 !== 6) ? '1px solid #EEF2F7' : 'none', borderBottom: '1px solid #EEF2F7', cursor: 'pointer' }}
                  onClick={() => setModal({ dateKey: key })}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFBFC'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold flex items-center justify-center rounded-full"
                      style={{ width: 22, height: 22, color: isToday ? '#FFF' : '#33475B', background: isToday ? '#33475B' : 'transparent' }}>{d}</span>
                    <button onClick={e => { e.stopPropagation(); setModal({ dateKey: key }) }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-md flex items-center justify-center" style={{ color: '#99ACC2' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    {dayPlans.map(p => {
                      const c = catById(p.categoryId)
                      const color = c?.color ?? '#7C98B6'
                      return (
                        <button key={p.id} onClick={e => { e.stopPropagation(); setModal({ dateKey: key, entry: p }) }}
                          className="text-left rounded-md px-1.5 py-1 truncate transition-transform"
                          style={{ background: `${color}14`, borderLeft: `2.5px solid ${color}`, opacity: p.status === 'posted' ? 0.6 : 1 }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateX(1px)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateX(0)'}>
                          <span className="text-[10px] font-semibold truncate block" style={{ color: '#33475B' }}>
                            {p.title || c?.name || 'Post'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {categories.length === 0 && (
          <p className="text-center text-xs mt-4" style={{ color: '#99ACC2' }}>
            Add some <button className="font-semibold underline" style={{ color: '#516F90' }} onClick={() => router.push('/categories')}>content categories</button> first.
          </p>
        )}
      </div>

      <AnimatePresence>
        {modal && <PlanModal dateKey={modal.dateKey} entry={modal.entry} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </div>
  )
}
