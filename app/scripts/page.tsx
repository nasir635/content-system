'use client'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Masonry from 'react-masonry-css'
import { useStore } from '@/lib/store'
import { ScriptCard } from '@/components/ScriptCard'
import { Tabs } from '@/components/Tabs'
import { CardSkeletonGrid } from '@/components/Skeleton'
import { toast } from '@/lib/toast'
import type { Script } from '@/lib/types'
import { v4 as uuid } from 'uuid'

const BREAKPOINT_COLS = { default: 3, 1024: 2, 640: 1 }

export default function ScriptsPage() {
  const { scripts, categories, addScript, deleteScript, loaded } = useStore()
  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCat, setFilterCat]       = useState('')
  const router = useRouter()

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('category')
    if (c) setFilterCat(c)
  }, [])

  const filtered = useMemo(() => {
    let s = scripts
    if (search)       s = s.filter(x => x.title.toLowerCase().includes(search.toLowerCase()))
    if (filterStatus) s = s.filter(x => x.status === filterStatus)
    if (filterCat)    s = s.filter(x => x.category === filterCat)
    return s
  }, [scripts, search, filterStatus, filterCat])

  function createNew() {
    const now = new Date().toISOString()
    const s: Script = {
      id: uuid(), title: 'Untitled Script', category: '', status: 'draft',
      content: '', visualRefs: [], music: [], createdAt: now, updatedAt: now,
    }
    addScript(s)
    router.push(`/scripts/${s.id}`)
  }

  function remove(id: string) { deleteScript(id); toast('Script deleted') }

  const statusTabs = [
    { key: '', label: 'All' },
    { key: 'draft', label: 'Draft' },
    { key: 'ready', label: 'Ready to Shoot' },
    { key: 'shot', label: 'Shot' },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#F5F8FA' }}>
      <div className="sticky top-0 z-30" style={{ background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid #DFE3EB' }}>
        <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto gap-3">
          <h1 className="font-bold text-[18px]" style={{ color: '#33475B' }}>Scripts</h1>
          <div className="flex items-center gap-2.5">
            {categories.length > 0 && (
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="cs-input" style={{ width: 'auto', paddingRight: 28, fontWeight: 600 }}>
                <option value="">All categories</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            )}
            <div className="flex items-center gap-2 px-3 rounded-md" style={{ background: '#FFFFFF', border: '1px solid #CBD6E2', height: 38, minWidth: 190 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C98B6" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search scripts…" className="flex-1 bg-transparent outline-none text-sm" style={{ color: '#33475B' }} />
            </div>
            <button className="cs-btn flex items-center gap-1.5" onClick={createNew}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Script
            </button>
          </div>
        </div>
        <div className="px-6 max-w-5xl mx-auto">
          <Tabs tabs={statusTabs} active={filterStatus} onChange={setFilterStatus} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {!loaded ? (
          <CardSkeletonGrid />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-32 gap-3 text-center">
            <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ background: '#EAF0F6' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#516F90" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <p className="text-sm font-semibold" style={{ color: '#33475B' }}>{scripts.length === 0 ? 'No scripts yet' : 'No results'}</p>
            <p className="text-xs" style={{ color: '#7C98B6' }}>{scripts.length === 0 ? 'Write your first script to get started.' : 'Try clearing the filter or search.'}</p>
            {scripts.length === 0 && <button className="cs-btn mt-1" onClick={createNew}>Write first script</button>}
          </div>
        ) : (
          <Masonry breakpointCols={BREAKPOINT_COLS} className="my-masonry-grid" columnClassName="my-masonry-grid-column">
            {filtered.map(s => (
              <ScriptCard key={s.id} script={s} onClick={sc => router.push(`/scripts/${sc.id}`)} onDelete={remove} />
            ))}
          </Masonry>
        )}
      </div>
    </div>
  )
}
