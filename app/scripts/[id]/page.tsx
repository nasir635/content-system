'use client'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { ScriptEditor } from '@/components/ScriptEditor'

export default function ScriptDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const script = useStore(s => s.scripts.find(x => x.id === id))

  if (!script) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#F5EFEB' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#E8F0F5' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#567C8D" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p className="font-bold text-lg" style={{ color: '#2F4156' }}>Script not found</p>
        <button className="cs-btn" onClick={() => router.push('/scripts')}>← Back to Scripts</button>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      <ScriptEditor key={script.id} script={script} onClose={() => router.push('/scripts')} />
    </div>
  )
}
