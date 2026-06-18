'use client'
import { useState } from 'react'
import { Settings, Cloud, CloudOff, Database, Download, CheckCircle2, Loader2, Briefcase, Lock, LogOut } from 'lucide-react'
import { useStore } from '@/lib/store'

export default function SettingsPage() {
  const { inspirations, scripts, categories, references, settings, cloud, loaded, updateSettings } = useStore()
  const [refreshing, setRefreshing] = useState(false)

  // password change
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [pwBusy, setPwBusy] = useState(false)

  async function checkNow() {
    setRefreshing(true)
    await useStore.getState().hydrate()
    setRefreshing(false)
  }

  function exportData() {
    const data = { ...useStore.getState(), exportedAt: new Date().toISOString() }
    const payload = {
      inspirations: data.inspirations, scripts: data.scripts, categories: data.categories,
      references: data.references, plans: data.plans, settings: data.settings, exportedAt: data.exportedAt,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contentos-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwMsg(null)
    if (next.length < 6) { setPwMsg({ ok: false, text: 'New password must be at least 6 characters.' }); return }
    if (next !== confirm) { setPwMsg({ ok: false, text: 'New passwords do not match.' }); return }
    setPwBusy(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change', current, next }),
      })
      const d = await res.json()
      if (!res.ok || !d.ok) { setPwMsg({ ok: false, text: d.error || 'Could not change password.' }) }
      else { setPwMsg({ ok: true, text: 'Password updated.' }); setCurrent(''); setNext(''); setConfirm('') }
    } catch { setPwMsg({ ok: false, text: 'Network error.' }) }
    setPwBusy(false)
  }

  async function logout() {
    await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) })
    window.location.href = '/login'
  }

  const counts = [
    { label: 'Inspirations', value: inspirations.length },
    { label: 'Scripts', value: scripts.length },
    { label: 'References', value: references.length },
    { label: 'Categories', value: categories.length },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#F5F8FA' }}>
      <div className="sticky top-0 z-30" style={{ background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #DFE3EB' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="font-bold text-[18px]" style={{ color: '#33475B' }}>Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Workspace */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#EAF0F6' }}>
              <Briefcase size={18} style={{ color: '#516F90' }} />
            </div>
            <div>
              <h2 className="font-bold" style={{ color: '#33475B' }}>Workspace</h2>
              <p className="text-xs" style={{ color: '#7C98B6' }}>Name your portal and yourself — used across the app</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#7C98B6' }}>Portal name</label>
              <input className="cs-input" value={settings.portalName} onChange={e => updateSettings({ portalName: e.target.value })} placeholder="Content OS" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#7C98B6' }}>Your name</label>
              <input className="cs-input" value={settings.ownerName} onChange={e => updateSettings({ ownerName: e.target.value })} placeholder="e.g. Nasir" />
            </div>
          </div>
          <p className="text-[11px]" style={{ color: '#99ACC2' }}>Saved automatically.</p>
        </div>

        {/* Security */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #33475B 0%, #516F90 100%)' }}>
              <Lock size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold" style={{ color: '#33475B' }}>Security</h2>
              <p className="text-xs" style={{ color: '#7C98B6' }}>Change the password that protects this portal</p>
            </div>
          </div>
          <form onSubmit={changePassword} className="space-y-3">
            <input type="password" className="cs-input" value={current} onChange={e => setCurrent(e.target.value)} placeholder="Current password" autoComplete="current-password" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="password" className="cs-input" value={next} onChange={e => setNext(e.target.value)} placeholder="New password" autoComplete="new-password" />
              <input type="password" className="cs-input" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm new password" autoComplete="new-password" />
            </div>
            {pwMsg && <p className="text-xs font-medium" style={{ color: pwMsg.ok ? '#3a7d44' : '#B04A4A' }}>{pwMsg.text}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={logout} className="cs-btn-outline py-2.5 px-4 rounded-md text-sm font-semibold flex items-center gap-2">
                <LogOut size={14} /> Log out
              </button>
              <button type="submit" disabled={pwBusy || !current || !next} className="cs-btn flex-1 py-2.5 rounded-md text-sm">
                {pwBusy ? 'Saving…' : 'Update password'}
              </button>
            </div>
          </form>
        </div>

        {/* Storage & Sync */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #33475B 0%, #516F90 100%)' }}>
              {cloud ? <Cloud size={18} className="text-white" /> : <CloudOff size={18} className="text-white" />}
            </div>
            <div>
              <h2 className="font-bold" style={{ color: '#33475B' }}>Storage &amp; Sync</h2>
              <p className="text-xs" style={{ color: '#7C98B6' }}>Where your portal data lives</p>
            </div>
          </div>

          {!loaded ? (
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7C98B6' }}>
              <Loader2 size={15} className="animate-spin" /> Checking…
            </div>
          ) : cloud ? (
            <div className="flex items-start gap-2 rounded-lg px-4 py-3" style={{ background: 'rgba(58,125,68,0.1)', border: '1px solid rgba(58,125,68,0.25)' }}>
              <CheckCircle2 size={16} style={{ color: '#3a7d44', flexShrink: 0, marginTop: 1 }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#33475B' }}>Cloud sync is active</p>
                <p className="text-xs mt-0.5" style={{ color: '#516F90' }}>Your data is saved online and loads on any device you open this URL from.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg px-4 py-4 space-y-2" style={{ background: 'rgba(176,74,74,0.08)', border: '1px solid rgba(176,74,74,0.2)' }}>
              <p className="text-sm font-semibold" style={{ color: '#B04A4A' }}>Cloud sync not connected — saving to this browser only</p>
              <p className="text-xs leading-relaxed" style={{ color: '#516F90' }}>Connect a Vercel Blob store in your project&apos;s Storage tab, then redeploy.</p>
            </div>
          )}

          <button onClick={checkNow} disabled={refreshing}
            className="cs-btn-outline w-full py-2.5 rounded-md text-sm font-semibold flex items-center justify-center gap-2">
            {refreshing ? <><Loader2 size={14} className="animate-spin" /> Checking…</> : 'Re-check connection'}
          </button>
        </div>

        {/* Data */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#EAF0F6' }}>
              <Database size={18} style={{ color: '#516F90' }} />
            </div>
            <div>
              <h2 className="font-bold" style={{ color: '#33475B' }}>Your Data</h2>
              <p className="text-xs" style={{ color: '#7C98B6' }}>A snapshot of everything in your portal</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {counts.map(c => (
              <div key={c.label} className="rounded-lg px-3 py-3 text-center" style={{ background: '#FFFFFF', border: '1px solid #DFE3EB' }}>
                <p className="text-2xl font-bold" style={{ color: '#33475B' }}>{c.value}</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#7C98B6' }}>{c.label}</p>
              </div>
            ))}
          </div>

          <button onClick={exportData} className="cs-btn-outline w-full py-2.5 rounded-md text-sm font-semibold flex items-center justify-center gap-2">
            <Download size={15} /> Export backup (JSON)
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 pt-2" style={{ color: '#99ACC2' }}>
          <Settings size={12} />
          <span className="text-[11px]">{settings.portalName || 'Content OS'} · v2.1</span>
        </div>
      </div>
    </div>
  )
}
