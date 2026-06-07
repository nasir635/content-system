'use client'
import { useState } from 'react'
import { Settings, Database, Key, ExternalLink, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const [notionToken, setNotionToken] = useState('')
  const [parentPageId, setParentPageId] = useState('')
  const [setting, setSetting] = useState(false)
  const [result, setResult]   = useState<any>(null)
  const [error, setError]     = useState('')

  async function setupNotion() {
    setSetting(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/notion/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notionToken, parentPageId }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const data = await res.json()
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSetting(false)
    }
  }

  return (
    <div className="min-h-screen bg-ig-bg">
      <div className="sticky top-0 z-30 bg-ig-bg/95 backdrop-blur-md border-b border-ig-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="font-bold text-lg">Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Notion Setup */}
        <div className="bg-ig-card border border-ig-border rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black border border-ig-border flex items-center justify-center">
              <Database size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold">Notion Databases</h2>
              <p className="text-xs text-ig-muted">Auto-create the databases your content system needs</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-ig-muted uppercase tracking-wider mb-2 block flex items-center gap-1">
                <Key size={11} /> Notion Integration Token
              </label>
              <input
                value={notionToken}
                onChange={e => setNotionToken(e.target.value)}
                placeholder="secret_xxxxxxxxxxxxxxxxxxxx"
                type="password"
                className="w-full bg-ig-surface border border-ig-border rounded-xl px-4 py-3 text-sm text-ig-text placeholder-ig-faint outline-none focus:border-ig-blue transition-colors font-mono"
              />
              <p className="text-xs text-ig-faint mt-1.5">
                Get this from <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-ig-blue hover:underline inline-flex items-center gap-0.5">notion.so/my-integrations <ExternalLink size={10} /></a>
              </p>
            </div>
            <div>
              <label className="text-xs font-bold text-ig-muted uppercase tracking-wider mb-2 block">
                Parent Page ID
              </label>
              <input
                value={parentPageId}
                onChange={e => setParentPageId(e.target.value)}
                placeholder="32-character page ID from the Notion URL"
                className="w-full bg-ig-surface border border-ig-border rounded-xl px-4 py-3 text-sm text-ig-text placeholder-ig-faint outline-none focus:border-ig-blue transition-colors font-mono"
              />
              <p className="text-xs text-ig-faint mt-1.5">Open any Notion page → copy the 32-char ID from the URL</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {result && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-4 space-y-2">
              <p className="flex items-center gap-2 text-green-400 font-semibold text-sm"><CheckCircle2 size={15} /> Databases created!</p>
              <p className="text-xs text-ig-muted">Copy these IDs into your <code className="bg-ig-border px-1 py-0.5 rounded">.env</code> file on Vercel:</p>
              <div className="space-y-1 font-mono text-xs">
                <p className="text-ig-text">NOTION_DISSECTIONS_DB_ID=<span className="text-ig-blue">{result.dissId}</span></p>
                <p className="text-ig-text">NOTION_SCRIPTS_DB_ID=<span className="text-ig-blue">{result.scriptsId}</span></p>
                <p className="text-ig-text">NOTION_STREAMLINES_DB_ID=<span className="text-ig-blue">{result.streamlinesId}</span></p>
              </div>
            </div>
          )}

          <button
            onClick={setupNotion}
            disabled={!notionToken || !parentPageId || setting}
            className="w-full bg-ig-blue hover:bg-ig-blue-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
          >
            {setting ? <><Loader2 size={15} className="animate-spin" /> Creating databases…</> : <><Database size={15} /> Create Notion Databases</>}
          </button>
        </div>

        {/* Env vars reference */}
        <div className="bg-ig-card border border-ig-border rounded-2xl p-6 space-y-4">
          <h2 className="font-bold flex items-center gap-2"><Settings size={16} /> Required Environment Variables</h2>
          <p className="text-ig-muted text-sm">Set these in your Vercel project settings → Environment Variables:</p>
          <div className="bg-ig-surface rounded-xl p-4 font-mono text-xs space-y-1.5 text-ig-muted">
            {[
              'ANTHROPIC_API_KEY',
              'NOTION_TOKEN',
              'NOTION_DISSECTIONS_DB_ID',
              'NOTION_SCRIPTS_DB_ID',
              'NOTION_STREAMLINES_DB_ID',
              'BLOB_READ_WRITE_TOKEN',
            ].map(v => <p key={v}><span className="text-ig-blue">{v}</span>=your_value</p>)}
          </div>
        </div>
      </div>
    </div>
  )
}
