'use client'
import { useState } from 'react'
import { Settings, Cloud, CloudOff, Database, Download, CheckCircle2, Loader2 } from 'lucide-react'
import { useStore } from '@/lib/store'

export default function SettingsPage() {
  const { inspirations, scripts, categories, references, cloud, loaded } = useStore()
  const [refreshing, setRefreshing] = useState(false)

  async function checkNow() {
    setRefreshing(true)
    await useStore.getState().hydrate()
    setRefreshing(false)
  }

  function exportData() {
    const data = { inspirations, scripts, categories, references, plans: useStore.getState().plans, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contentos-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const counts = [
    { label: 'Inspirations', value: inspirations.length },
    { label: 'Scripts', value: scripts.length },
    { label: 'References', value: references.length },
    { label: 'Categories', value: categories.length },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#F5EFEB' }}>
      <div className="sticky top-0 z-30" style={{ background: 'rgba(245,239,235,0.94)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #D0DDE6' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="font-bold text-[18px]" style={{ color: '#2F4156' }}>Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Storage & Sync */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2F4156 0%, #567C8D 100%)' }}>
              {cloud ? <Cloud size={18} className="text-white" /> : <CloudOff size={18} className="text-white" />}
            </div>
            <div>
              <h2 className="font-bold" style={{ color: '#2F4156' }}>Storage &amp; Sync</h2>
              <p className="text-xs" style={{ color: '#8EA7B5' }}>Where your portal data lives</p>
            </div>
          </div>

          {!loaded ? (
            <div className="flex items-center gap-2 text-sm" style={{ color: '#8EA7B5' }}>
              <Loader2 size={15} className="animate-spin" /> Checking…
            </div>
          ) : cloud ? (
            <div className="flex items-start gap-2 rounded-xl px-4 py-3" style={{ background: 'rgba(58,125,68,0.1)', border: '1px solid rgba(58,125,68,0.25)' }}>
              <CheckCircle2 size={16} style={{ color: '#3a7d44', flexShrink: 0, marginTop: 1 }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#2F4156' }}>Cloud sync is active</p>
                <p className="text-xs mt-0.5" style={{ color: '#567C8D' }}>Your data is saved online and loads on any device you open this URL from.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl px-4 py-4 space-y-2" style={{ background: 'rgba(176,74,74,0.08)', border: '1px solid rgba(176,74,74,0.2)' }}>
              <p className="text-sm font-semibold" style={{ color: '#B04A4A' }}>Cloud sync not connected — saving to this browser only</p>
              <p className="text-xs leading-relaxed" style={{ color: '#567C8D' }}>
                To sync across devices, connect a free Vercel Blob store:
              </p>
              <ol className="text-xs leading-relaxed list-decimal pl-4 space-y-0.5" style={{ color: '#567C8D' }}>
                <li>Open your project on <span className="font-semibold">vercel.com</span> → <span className="font-semibold">Storage</span></li>
                <li>Create / connect a <span className="font-semibold">Blob</span> store to this project</li>
                <li>Redeploy — Vercel injects the token automatically</li>
              </ol>
            </div>
          )}

          <button onClick={checkNow} disabled={refreshing}
            className="cs-btn-outline w-full py-2.5 rounded-[10px] text-sm font-semibold flex items-center justify-center gap-2">
            {refreshing ? <><Loader2 size={14} className="animate-spin" /> Checking…</> : 'Re-check connection'}
          </button>
        </div>

        {/* Data */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#E8F0F5' }}>
              <Database size={18} style={{ color: '#567C8D' }} />
            </div>
            <div>
              <h2 className="font-bold" style={{ color: '#2F4156' }}>Your Data</h2>
              <p className="text-xs" style={{ color: '#8EA7B5' }}>A snapshot of everything in your portal</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {counts.map(c => (
              <div key={c.label} className="rounded-xl px-3 py-3 text-center" style={{ background: '#FFFFFF', border: '1px solid #D0DDE6' }}>
                <p className="text-2xl font-bold" style={{ color: '#2F4156' }}>{c.value}</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#8EA7B5' }}>{c.label}</p>
              </div>
            ))}
          </div>

          <button onClick={exportData} className="cs-btn-outline w-full py-2.5 rounded-[10px] text-sm font-semibold flex items-center justify-center gap-2">
            <Download size={15} /> Export backup (JSON)
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 pt-2" style={{ color: '#A0B8C6' }}>
          <Settings size={12} />
          <span className="text-[11px]">Faasle Content OS · v2.0</span>
        </div>
      </div>
    </div>
  )
}
