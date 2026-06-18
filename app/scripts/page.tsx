'use client'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Masonry from 'react-masonry-css'
import { useStore } from '@/lib/store'
import { ScriptCard } from '@/components/ScriptCard'
import type { Script } from '@/lib/types'
import { v4 as uuid } from 'uuid'

const BREAKPOINT_COLS = {
  default: 3,
  1024: 2,
  640: 1,
}

const STATUSES = ['draft', 'ready', 'shot'] as const

export default function ScriptsPage() {
  const { scripts, categories, addScript, deleteScript } = useStore()
  const [search, setSearch]           = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCat, setFilterCat]     = useState('')
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
      content: '', visualRefs: [], music: [],
      createdAt: now, updatedAt: now,
    }
    addScript(s)
    router.push(`/scripts/${s.id}`)
  }

  return (
    <div className="min-h-screen" style={{ background: '#F5EFEB' }}>

      {/* ── TOP HEADER ── */}
      <div
        className="sticky top-0 z-30"
        style={{
          background: 'rgba(245,239,235,0.94)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #D0DDE6',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 max-w-5xl mx-auto">
          <h1 className="font-bold text-[18px]" style={{ color: '#2F4156' }}>Scripts</h1>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: '#FFFFFF', border: '1.5px solid #D0DDE6', minWidth: 180 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8EA7B5" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search scripts…"
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: '#2F4156' }}
              />
              {search && (
                <button onClick={() => setSearch('')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8EA7B5" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
            {/* New button */}
            <button className="cs-btn flex items-center gap-1.5" onClick={createNew}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Script
            </button>
          </div>
        </div>

        {/* Status filter pills */}
        <div
          className="px-5 pb-3 max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          <button
            onClick={() => setFilterStatus('')}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: !filterStatus ? '#2F4156' : 'rgba(200,217,230,0.3)',
              color:      !filterStatus ? '#FFFFFF'  : '#567C8D',
              border:     `1px solid ${!filterStatus ? '#2F4156' : '#D0DDE6'}`,
            }}
          >
            All
          </button>
          {STATUSES.map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(prev => prev === st ? '' : st)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
              style={{
                background: filterStatus === st ? '#567C8D' : 'rgba(200,217,230,0.3)',
                color:      filterStatus === st ? '#FFFFFF'  : '#567C8D',
                border:     `1px solid ${filterStatus === st ? '#567C8D' : '#D0DDE6'}`,
              }}
            >
              {st === 'ready' ? 'Ready to Shoot' : st}
            </button>
          ))}
        </div>

        {/* Category filter pills */}
        {categories.length > 0 && (
          <div className="px-5 pb-3 max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setFilterCat('')}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{ background: !filterCat ? '#2F4156' : 'rgba(200,217,230,0.3)', color: !filterCat ? '#FFFFFF' : '#567C8D', border: `1px solid ${!filterCat ? '#2F4156' : '#D0DDE6'}` }}
            >
              All categories
            </button>
            {categories.map(c => {
              const active = filterCat === c.name
              return (
                <button
                  key={c.id}
                  onClick={() => setFilterCat(prev => prev === c.name ? '' : c.name)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{ background: active ? `${c.color}1A` : 'rgba(200,217,230,0.3)', color: active ? c.color : '#567C8D', border: `1px solid ${active ? `${c.color}55` : '#D0DDE6'}` }}
                >
                  <span className="rounded-full" style={{ width: 7, height: 7, background: c.color }} />
                  {c.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-32 gap-3 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: '#E8F0F5' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#567C8D" strokeWidth="1.5" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <p className="text-sm font-semibold" style={{ color: '#2F4156' }}>
              {scripts.length === 0 ? 'No scripts yet' : 'No results'}
            </p>
            <p className="text-xs" style={{ color: '#8EA7B5' }}>
              {scripts.length === 0
                ? 'Write your first script to get started.'
                : 'Try clearing the filter or search.'}
            </p>
            {scripts.length === 0 && (
              <button className="cs-btn mt-1" onClick={createNew}>Write first script</button>
            )}
          </div>
        ) : (
          <Masonry
            breakpointCols={BREAKPOINT_COLS}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid-column"
          >
            {filtered.map(s => (
              <ScriptCard
                key={s.id}
                script={s}
                onClick={sc => router.push(`/scripts/${sc.id}`)}
                onDelete={deleteScript}
              />
            ))}
          </Masonry>
        )}
      </div>
    </div>
  )
}
