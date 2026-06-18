'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { AddInspirationModal } from '@/components/AddInspirationModal'
import type { Inspiration, Script } from '@/lib/types'
import { v4 as uuid } from 'uuid'

function StatCard({ value, label, accent }: { value: number; label: string; accent?: string }) {
  return (
    <div className="stat-card flex-1 min-w-0" style={{ borderLeft: `4px solid ${accent ?? '#567C8D'}` }}>
      <p className="text-3xl font-bold" style={{ color: '#2F4156' }}>{value}</p>
      <p className="text-xs mt-1 font-medium" style={{ color: '#8EA7B5' }}>{label}</p>
    </div>
  )
}

function inspoLabel(i: Inspiration): string {
  if (i.title) return i.title
  if (i.howToUse) return i.howToUse
  try { return new URL(i.url).hostname.replace('www.', '') } catch { return i.url }
}

function MiniCard({ item, onClick }: { item: Inspiration; onClick: () => void }) {
  const cover = item.screenshots?.[0]?.imageUrl
  const label = inspoLabel(item)
  return (
    <button onClick={onClick}
      className="flex-shrink-0 rounded-[16px] overflow-hidden cursor-pointer relative"
      style={{ width: 140, height: 180, boxShadow: '0 4px 16px rgba(47,65,86,0.12)', transition: 'transform 0.18s ease' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
    >
      {cover
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={cover} alt={label} className="w-full h-full object-cover" draggable={false} />
        : <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl"
            style={{ background: 'linear-gradient(135deg, #567C8D 0%, #C8D9E6 100%)' }}>
            {label.charAt(0).toUpperCase()}
          </div>
      }
      <div className="absolute bottom-0 left-0 right-0 px-2 py-2"
        style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(10px)' }}>
        <p className="font-semibold leading-tight truncate" style={{ fontSize: 11, color: '#2F4156' }}>{label}</p>
        <p className="capitalize truncate" style={{ fontSize: 10, color: '#8EA7B5', marginTop: 2 }}>{item.category}</p>
      </div>
    </button>
  )
}

const QA_ICONS: Record<string, React.ReactNode> = {
  inspiration: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#567C8D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 015 11.95V17a1 1 0 01-1 1H8a1 1 0 01-1-1v-3.05A7 7 0 0112 2z"/></svg>,
  script: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#567C8D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  reference: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#567C8D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  planner: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#567C8D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
}

export default function HomePage() {
  const { inspirations, scripts, references, categories, addInspiration, addReference } = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const router = useRouter()

  const readyCount   = scripts.filter(s => s.status === 'ready').length
  const shotCount    = scripts.filter(s => s.status === 'shot').length
  const draftCount   = scripts.filter(s => s.status === 'draft').length
  const totalScripts = scripts.length
  const recent       = inspirations.slice(0, 6)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  function newScript() {
    const now = new Date().toISOString()
    const s: Script = {
      id: uuid(), title: 'Untitled Script', category: '', status: 'draft',
      content: '', visualRefs: [], music: [], createdAt: now, updatedAt: now,
    }
    useStore.getState().addScript(s)
    router.push(`/scripts/${s.id}`)
  }

  const quickActions = [
    { key: 'inspiration', label: 'Add Inspiration',   action: () => setAddOpen(true) },
    { key: 'script',      label: 'New Script',         action: newScript },
    { key: 'reference',   label: 'Browse References',  action: () => router.push('/references') },
    { key: 'planner',     label: 'Open Planner',       action: () => router.push('/planner') },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF' }}>

      {/* Top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-4"
        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #D0DDE6' }}>
        <div>
          <h1 className="font-bold text-[18px]" style={{ color: '#2F4156' }}>Welcome back, Nasir</h1>
          <p className="text-xs mt-0.5" style={{ color: '#8EA7B5' }}>{today}</p>
        </div>
        <button className="cs-btn flex items-center gap-2" onClick={() => setAddOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Inspiration
        </button>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Stats row */}
        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <StatCard value={inspirations.length} label="Inspirations"   accent="#567C8D" />
          <StatCard value={scripts.length}      label="Scripts"        accent="#2F4156" />
          <StatCard value={readyCount}          label="Ready to Shoot" accent="#7A9BAD" />
          <StatCard value={references.length}   label="References"     accent="#C8D9E6" />
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* LEFT — 2/3 */}
          <div className="lg:col-span-2 space-y-5">

            {/* Recent Inspirations */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[15px]" style={{ color: '#2F4156' }}>Recent Inspirations</h2>
                <button className="text-xs font-semibold" style={{ color: '#567C8D' }} onClick={() => router.push('/inspirations')}>See all</button>
              </div>
              {recent.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-3 text-center">
                  <p className="text-sm font-semibold" style={{ color: '#2F4156' }}>No inspirations yet</p>
                  <p className="text-xs" style={{ color: '#8EA7B5' }}>Paste a reel or any link to get started</p>
                  <button className="cs-btn mt-1" onClick={() => setAddOpen(true)}>Add first inspiration</button>
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  {recent.map(d => (
                    <MiniCard key={d.id} item={d} onClick={() => router.push(`/inspirations/${d.id}`)} />
                  ))}
                </div>
              )}
            </div>

            {/* Script Pipeline */}
            <div className="glass-card p-5">
              <h2 className="font-bold text-[15px] mb-4" style={{ color: '#2F4156' }}>Script Pipeline</h2>
              {scripts.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: '#8EA7B5' }}>No scripts yet.</p>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: 'Draft',          count: draftCount,  color: '#C8D9E6', total: totalScripts },
                    { label: 'Ready to Shoot', count: readyCount,  color: '#567C8D', total: totalScripts },
                    { label: 'Shot',           count: shotCount,   color: '#2F4156', total: totalScripts },
                  ].map(({ label, count, color, total }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold" style={{ color: '#567C8D' }}>{label}</span>
                        <span className="text-xs font-bold" style={{ color: '#2F4156' }}>{count}</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: '#E8F0F5' }}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: total > 0 ? `${(count/total)*100}%` : '0%', background: color }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — 1/3 */}
          <div className="space-y-5">

            {/* Quick Actions */}
            <div className="glass-card p-5">
              <h2 className="font-bold text-[15px] mb-4" style={{ color: '#2F4156' }}>Quick Actions</h2>
              <div className="space-y-2">
                {quickActions.map(({ key, label, action }) => (
                  <button key={key}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                    style={{ background: '#F5F8FA', border: '1px solid #E0EAF0' }}
                    onClick={action}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E8F0F5' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#F5F8FA' }}
                  >
                    <span className="flex-shrink-0">{QA_ICONS[key]}</span>
                    <span className="text-sm font-semibold" style={{ color: '#2F4156' }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Categories snapshot */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[15px]" style={{ color: '#2F4156' }}>Content Categories</h2>
                <button className="text-xs font-semibold" style={{ color: '#567C8D' }} onClick={() => router.push('/categories')}>Manage</button>
              </div>
              {categories.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: '#A0B8C6' }}>No categories yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {categories.map(c => {
                    const count = scripts.filter(s => s.category === c.name).length
                    return (
                      <button key={c.id}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all"
                        style={{ background: '#F5F8FA', border: '1px solid #E0EAF0' }}
                        onClick={() => router.push(`/scripts?category=${encodeURIComponent(c.name)}`)}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E8F0F5' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#F5F8FA' }}
                      >
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                        <span className="text-xs font-semibold truncate flex-1" style={{ color: '#2F4156' }}>{c.name}</span>
                        <span className="text-xs font-bold flex-shrink-0" style={{ color: '#8EA7B5' }}>{count}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddInspirationModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={(inspiration, refs) => {
          addInspiration(inspiration)
          refs.forEach(addReference)
          setAddOpen(false)
        }}
      />
    </div>
  )
}
