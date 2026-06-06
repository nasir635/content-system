'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Scissors, FileText, Film, CheckCircle2, Clock, Sparkles, TrendingUp } from 'lucide-react'
import { useStore } from '@/lib/store'
import { CONTENT_CATEGORIES } from '@/lib/types'
import Link from 'next/link'

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: number | string; sub?: string; color: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-ig-card border border-ig-border rounded-ig p-5 flex items-start gap-4"
    >
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-ig-muted">{label}</p>
        {sub && <p className="text-xs text-ig-faint mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  )
}

const CAT_COLORS = [
  'bg-purple-500', 'bg-blue-500', 'bg-amber-500', 'bg-pink-500', 'bg-green-500',
  'bg-slate-500',  'bg-violet-500','bg-cyan-500',  'bg-orange-500','bg-rose-500',
]

export default function DashboardPage() {
  const { dissections, scripts, streamlines } = useStore()

  const stats = useMemo(() => {
    const byCat = CONTENT_CATEGORIES.map((cat, i) => ({
      cat,
      count: dissections.filter(d => d.category === cat).length,
      color: CAT_COLORS[i],
    })).filter(x => x.count > 0).sort((a, b) => b.count - a.count)

    const drafts = scripts.filter(s => s.status === 'draft').length
    const ready  = scripts.filter(s => s.status === 'ready').length
    const shot   = scripts.filter(s => s.status === 'shot').length

    return { byCat, drafts, ready, shot }
  }, [dissections, scripts])

  const recentDissections = dissections.slice(0, 4)
  const recentScripts     = scripts.slice(0, 4)

  return (
    <div className="min-h-screen bg-ig-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-ig-muted text-sm">Your content system at a glance.</p>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard icon={Scissors}     label="Dissections"     value={dissections.length}     color="bg-purple-600" />
          <StatCard icon={FileText}     label="Scripts"         value={scripts.length}         color="bg-blue-600"   />
          <StatCard icon={Clock}        label="Ready to Shoot"  value={stats.ready}            color="bg-yellow-600" />
          <StatCard icon={CheckCircle2} label="Shot"            value={stats.shot}             color="bg-green-600"  />
        </div>

        {/* Script pipeline */}
        <div>
          <h2 className="font-bold text-base mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-ig-blue" /> Script Pipeline
          </h2>
          <div className="bg-ig-card border border-ig-border rounded-ig p-5">
            {scripts.length === 0 ? (
              <p className="text-ig-faint text-sm text-center py-4">No scripts yet</p>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Draft',          count: stats.drafts, total: scripts.length, color: 'bg-zinc-500'   },
                  { label: 'Ready to shoot', count: stats.ready,  total: scripts.length, color: 'bg-yellow-500' },
                  { label: 'Shot',           count: stats.shot,   total: scripts.length, color: 'bg-green-500'  },
                ].map(({ label, count, total, color }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-ig-muted">{label}</span>
                      <span className="text-sm font-semibold">{count}</span>
                    </div>
                    <div className="h-2 bg-ig-border rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: total ? `${(count / total) * 100}%` : '0%' }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className={`h-full ${color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dissections by category */}
        {stats.byCat.length > 0 && (
          <div>
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-ig-blue" /> Dissections by Category
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stats.byCat.map(({ cat, count, color }, i) => (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-ig-card border border-ig-border rounded-xl flex items-center gap-4 px-4 py-3"
                >
                  <div className={`w-3 h-3 rounded-full ${color} flex-shrink-0`} />
                  <span className="flex-1 text-sm capitalize text-ig-text">{cat}</span>
                  <span className="font-bold text-sm">{count}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recent activity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Recent dissections */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base">Recent Dissections</h2>
              <Link href="/dissections" className="text-ig-blue text-xs font-semibold hover:underline">See all</Link>
            </div>
            <div className="space-y-2">
              {recentDissections.length === 0 ? (
                <p className="text-ig-faint text-sm py-4 text-center">None yet</p>
              ) : recentDissections.map(d => (
                <div key={d.id} className="flex items-center gap-3 bg-ig-card border border-ig-border rounded-xl px-3 py-2.5">
                  <div className="w-10 h-10 rounded-lg bg-ig-border flex-shrink-0 overflow-hidden">
                    {d.thumbnail
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={d.thumbnail} alt="" className="w-full h-full object-cover" />
                      : <Film size={16} className="text-ig-faint m-auto mt-2.5" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{d.topic}</p>
                    <p className="text-xs text-ig-faint capitalize">{d.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent scripts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base">Recent Scripts</h2>
              <Link href="/scripts" className="text-ig-blue text-xs font-semibold hover:underline">See all</Link>
            </div>
            <div className="space-y-2">
              {recentScripts.length === 0 ? (
                <p className="text-ig-faint text-sm py-4 text-center">None yet</p>
              ) : recentScripts.map(s => (
                <div key={s.id} className="flex items-center gap-3 bg-ig-card border border-ig-border rounded-xl px-3 py-2.5">
                  <div className={`w-2 h-10 rounded-full flex-shrink-0 ${
                    s.status === 'shot' ? 'bg-green-500' : s.status === 'ready' ? 'bg-yellow-500' : 'bg-zinc-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{s.title}</p>
                    <p className="text-xs text-ig-faint capitalize">{s.status === 'ready' ? 'Ready to shoot' : s.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Streamlines chip */}
        {streamlines.length > 0 && (
          <div>
            <h2 className="font-bold text-base mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-ig-blue" /> Active Streamlines
            </h2>
            <div className="flex flex-wrap gap-2">
              {streamlines.map(s => (
                <span key={s.id} className="px-3 py-1.5 bg-ig-card border border-ig-border rounded-full text-sm text-ig-text">
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
