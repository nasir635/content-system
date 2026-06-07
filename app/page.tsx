'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { AddContentModal } from '@/components/AddContentModal'
import type { Dissection } from '@/lib/types'

function StatCard({ value, label, accent }: { value: number; label: string; accent?: string }) {
  return (
    <div
      className="stat-card flex-1 min-w-0 relative overflow-hidden"
      style={{ borderLeft: `4px solid ${accent ?? '#567C8D'}` }}
    >
      <p className="text-3xl font-bold" style={{ color: '#2F4156' }}>{value}</p>
      <p className="text-xs mt-1 font-medium" style={{ color: '#8EA7B5' }}>{label}</p>
    </div>
  )
}

function MiniCard({ item, onClick }: { item: Dissection; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 rounded-[16px] overflow-hidden cursor-pointer relative group"
      style={{
        width: 140,
        height: 180,
        boxShadow: '0 4px 16px rgba(47,65,86,0.12)',
        transition: 'transform 0.18s ease',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
    >
      {item.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.thumbnail} alt={item.topic} className="w-full h-full object-cover" draggable={false} />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-white font-bold text-2xl"
          style={{ background: 'linear-gradient(135deg, #567C8D 0%, #C8D9E6 100%)' }}
        >
          {item.topic.charAt(0).toUpperCase()}
        </div>
      )}
      <div
        className="absolute bottom-0 left-0 right-0 px-2 py-2"
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <p className="font-semibold leading-tight truncate" style={{ fontSize: 11, color: '#2F4156' }}>
          {item.topic}
        </p>
        <p className="capitalize truncate" style={{ fontSize: 10, color: '#8EA7B5', marginTop: 2 }}>
          {item.category}
        </p>
      </div>
    </button>
  )
}

export default function HomePage() {
  const { dissections, scripts, streamlines, addDissection } = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const router = useRouter()

  const readyCount = scripts.filter(s => s.status === 'ready').length
  const shotCount  = scripts.filter(s => s.status === 'shot').length
  const recent     = dissections.slice(0, 6)

  const draftCount  = scripts.filter(s => s.status === 'draft').length
  const totalScripts = scripts.length

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen" style={{ background: '#F5EFEB' }}>

      {/* Floating gradient blob — top right decoration */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 right-0 w-[420px] h-[320px] opacity-40"
        style={{
          background: 'linear-gradient(135deg, #C8D9E6 0%, #F5EFEB 100%)',
          borderRadius: '0 0 0 60%',
          zIndex: 0,
        }}
      />

      {/* Sticky top bar */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-5 py-4"
        style={{
          background: 'rgba(245,239,235,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #D0DDE6',
        }}
      >
        <div>
          <h1 className="font-bold text-[18px]" style={{ color: '#2F4156' }}>
            Welcome back, Nasir 👋
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#8EA7B5' }}>{today}</p>
        </div>
        <button className="cs-btn flex items-center gap-2" onClick={() => setAddOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Content
        </button>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Stats row */}
        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <StatCard value={dissections.length} label="Dissections"    accent="#567C8D" />
          <StatCard value={scripts.length}     label="Scripts"        accent="#2F4156" />
          <StatCard value={readyCount}          label="Ready to Shoot" accent="#7A9BAD" />
          <StatCard value={shotCount}           label="Shot"           accent="#C8D9E6" />
        </div>

        {/* Main two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* LEFT — wider column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Recent Dissections — horizontal scroll */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[15px]" style={{ color: '#2F4156' }}>Recent Dissections</h2>
                <button
                  className="text-xs font-semibold"
                  style={{ color: '#567C8D' }}
                  onClick={() => router.push('/dissections')}
                >
                  See all →
                </button>
              </div>

              {recent.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-3 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: '#E8F0F5' }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#567C8D" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#2F4156' }}>No dissections yet</p>
                  <p className="text-xs" style={{ color: '#8EA7B5' }}>Paste an Instagram reel URL to get started</p>
                  <button className="cs-btn mt-1" onClick={() => setAddOpen(true)}>Add first dissection</button>
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  {recent.map(d => (
                    <MiniCard
                      key={d.id}
                      item={d}
                      onClick={() => router.push(`/dissections/${d.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Script Pipeline */}
            <div className="glass-card p-5">
              <h2 className="font-bold text-[15px] mb-4" style={{ color: '#2F4156' }}>Script Pipeline</h2>
              {scripts.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: '#8EA7B5' }}>No scripts yet. Generate one from a dissection.</p>
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
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: total > 0 ? `${(count / total) * 100}%` : '0%',
                            background: color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — narrower column */}
          <div className="space-y-5">

            {/* Active Streamlines */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[15px]" style={{ color: '#2F4156' }}>Streamlines</h2>
                <button
                  className="text-xs font-semibold"
                  style={{ color: '#567C8D' }}
                  onClick={() => router.push('/streamlines')}
                >
                  Manage →
                </button>
              </div>
              {streamlines.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-sm" style={{ color: '#8EA7B5' }}>No streamlines defined</p>
                  <button
                    className="text-xs font-semibold mt-2"
                    style={{ color: '#567C8D' }}
                    onClick={() => router.push('/streamlines')}
                  >
                    + Create one
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {streamlines.slice(0, 5).map(s => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                      style={{ background: '#F5EFEB', border: '1px solid #D0DDE6' }}
                    >
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#567C8D' }} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#2F4156' }}>{s.name}</p>
                        {s.description && (
                          <p className="text-xs truncate" style={{ color: '#8EA7B5' }}>{s.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Add */}
            <div className="glass-card p-5">
              <h2 className="font-bold text-[15px] mb-3" style={{ color: '#2F4156' }}>Quick Add</h2>
              <p className="text-xs mb-3" style={{ color: '#8EA7B5' }}>Paste an Instagram URL to dissect it instantly</p>
              <button
                className="cs-btn w-full flex items-center justify-center gap-2"
                onClick={() => setAddOpen(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Paste URL &amp; Analyse
              </button>
            </div>
          </div>
        </div>
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
