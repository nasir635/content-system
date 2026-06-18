'use client'
import { useState, useEffect } from 'react'

export default function LoginPage() {
  const [mode, setMode] = useState<'loading' | 'setup' | 'login'>('loading')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetch('/api/auth')
      .then(r => r.json())
      .then(d => setMode(d.configured ? 'login' : 'setup'))
      .catch(() => setMode('login'))
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (mode === 'setup') {
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
      if (password !== confirm) { setError('Passwords do not match.'); return }
    }
    setBusy(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: mode === 'setup' ? 'setup' : 'login', password }),
      })
      const d = await res.json()
      if (!res.ok || !d.ok) { setError(d.error || 'Something went wrong.'); setBusy(false); return }
      const from = new URLSearchParams(window.location.search).get('from')
      window.location.href = from || '/'
    } catch {
      setError('Network error. Try again.')
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(160deg, #F5EFEB 0%, #E8F0F5 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #2F4156 0%, #567C8D 100%)', boxShadow: '0 8px 24px rgba(47,65,86,0.25)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <h1 className="font-bold text-lg" style={{ color: '#2F4156' }}>Content OS</h1>
          <p className="text-xs mt-0.5" style={{ color: '#8EA7B5' }}>
            {mode === 'setup' ? 'Create a password to protect your portal' : 'Enter your password to continue'}
          </p>
        </div>

        <div className="rounded-[20px] p-6" style={{ background: '#FFFFFF', border: '1px solid #E6EDF2', boxShadow: '0 12px 40px rgba(47,65,86,0.12)' }}>
          {mode === 'loading' ? (
            <p className="text-sm text-center py-6" style={{ color: '#8EA7B5' }}>Loading…</p>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#8EA7B5' }}>
                  {mode === 'setup' ? 'New password' : 'Password'}
                </label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoFocus
                  className="cs-input" placeholder="••••••••" />
              </div>
              {mode === 'setup' && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#8EA7B5' }}>Confirm password</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="cs-input" placeholder="••••••••" />
                </div>
              )}
              {error && <p className="text-xs font-medium" style={{ color: '#B04A4A' }}>{error}</p>}
              <button type="submit" disabled={busy || !password} className="cs-btn w-full py-2.5 rounded-[12px] text-sm">
                {busy ? 'Please wait…' : mode === 'setup' ? 'Set password & enter' : 'Unlock'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[11px] mt-4" style={{ color: '#A0B8C6' }}>Faasle Content OS</p>
      </div>
    </div>
  )
}
