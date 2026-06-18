'use client'
import { useState, useEffect, useMemo } from 'react'
import { useStore } from '@/lib/store'
import type { TimeBlock, TodoItem } from '@/lib/types'
import { v4 as uuid } from 'uuid'

function ymd(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}
function shiftDay(key: string, delta: number) {
  const [y, m, d] = key.split('-').map(Number)
  const dt = new Date(y, m - 1, d + delta)
  return ymd(dt.getFullYear(), dt.getMonth(), dt.getDate())
}
function prettyDay(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function Check({ done, onClick }: { done: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center justify-center flex-shrink-0 rounded transition-colors"
      style={{ width: 18, height: 18, border: `1.5px solid ${done ? '#00A4BD' : '#CBD6E2'}`, background: done ? '#00A4BD' : '#FFFFFF' }}>
      {done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
    </button>
  )
}

export default function TodayPage() {
  const { timeBlocks, todos, addTimeBlock, updateTimeBlock, deleteTimeBlock, addTodo, updateTodo, deleteTodo } = useStore()
  const now = new Date()
  const todayKey = ymd(now.getFullYear(), now.getMonth(), now.getDate())
  const [day, setDay] = useState(todayKey)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // timetable inputs
  const [tStart, setTStart] = useState('')
  const [tTitle, setTTitle] = useState('')
  // todo input
  const [todoText, setTodoText] = useState('')

  const blocks = useMemo(() =>
    timeBlocks.filter(b => b.date === day).sort((a, b) => {
      if (!a.start) return 1
      if (!b.start) return -1
      return a.start.localeCompare(b.start)
    })
  , [timeBlocks, day])

  const sortedTodos = useMemo(() =>
    [...todos].sort((a, b) => Number(a.done) - Number(b.done))
  , [todos])
  const doneCount = todos.filter(t => t.done).length

  if (!mounted) return <div className="min-h-screen" style={{ background: '#F5F8FA' }} />

  const isToday = day === todayKey

  function addBlock() {
    if (!tTitle.trim()) return
    addTimeBlock({ id: uuid(), date: day, start: tStart, title: tTitle.trim(), done: false, createdAt: new Date().toISOString() })
    setTStart(''); setTTitle('')
  }
  function addTask() {
    if (!todoText.trim()) return
    addTodo({ id: uuid(), text: todoText.trim(), done: false, createdAt: new Date().toISOString() })
    setTodoText('')
  }
  function scheduleTodo(t: TodoItem) {
    addTimeBlock({ id: uuid(), date: day, start: '', title: t.text, done: false, createdAt: new Date().toISOString() })
  }

  return (
    <div className="min-h-screen" style={{ background: '#F5F8FA' }}>
      {/* Header */}
      <div className="sticky top-0 z-30" style={{ background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #DFE3EB' }}>
        <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto gap-3">
          <div>
            <h1 className="font-bold text-[18px]" style={{ color: '#33475B' }}>Today</h1>
            <p className="text-xs mt-0.5" style={{ color: '#7C98B6' }}>{prettyDay(day)}{isToday ? ' · Today' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDay(shiftDay(day, -1))} className="w-8 h-8 rounded-md flex items-center justify-center transition-colors" style={{ border: '1px solid #DFE3EB', color: '#516F90', background: '#FFF' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button onClick={() => setDay(shiftDay(day, 1))} className="w-8 h-8 rounded-md flex items-center justify-center transition-colors" style={{ border: '1px solid #DFE3EB', color: '#516F90', background: '#FFF' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            {!isToday && <button onClick={() => setDay(todayKey)} className="cs-btn-outline py-1.5 px-3 rounded-md text-xs font-semibold">Today</button>}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Timetable */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[15px]" style={{ color: '#33475B' }}>Timetable</h2>
            <span className="text-xs" style={{ color: '#99ACC2' }}>{blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}</span>
          </div>

          {/* Add row */}
          <div className="flex items-center gap-2 mb-4">
            <input type="time" value={tStart} onChange={e => setTStart(e.target.value)} className="cs-input" style={{ width: 110 }} />
            <input value={tTitle} onChange={e => setTTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addBlock()} placeholder="What's the block?" className="cs-input flex-1" />
            <button className="cs-btn flex-shrink-0" onClick={addBlock} disabled={!tTitle.trim()}>Add</button>
          </div>

          {blocks.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: '#99ACC2' }}>No blocks for this day yet.</p>
          ) : (
            <div className="space-y-1.5">
              {blocks.map(b => (
                <div key={b.id} className="group flex items-center gap-3 px-3 py-2.5 rounded-md" style={{ background: '#FFFFFF', border: '1px solid #DFE3EB' }}>
                  <Check done={b.done} onClick={() => updateTimeBlock(b.id, { done: !b.done })} />
                  <span className="text-xs font-bold tabular-nums flex-shrink-0" style={{ color: b.start ? '#516F90' : '#99ACC2', width: 44 }}>{b.start || '—'}</span>
                  <input
                    value={b.title}
                    onChange={e => updateTimeBlock(b.id, { title: e.target.value })}
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: '#33475B', textDecoration: b.done ? 'line-through' : 'none', opacity: b.done ? 0.55 : 1 }}
                  />
                  <button onClick={() => deleteTimeBlock(b.id)} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: '#99ACC2' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* To-dos */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-[15px]" style={{ color: '#33475B' }}>To-do list</h2>
            <span className="text-xs" style={{ color: '#99ACC2' }}>{doneCount}/{todos.length} done</span>
          </div>
          {/* progress */}
          <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: '#EAF0F6' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: todos.length ? `${(doneCount / todos.length) * 100}%` : '0%', background: '#00A4BD' }} />
          </div>

          {/* Add row */}
          <div className="flex items-center gap-2 mb-4">
            <input value={todoText} onChange={e => setTodoText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} placeholder="Add a task…" className="cs-input flex-1" />
            <button className="cs-btn flex-shrink-0" onClick={addTask} disabled={!todoText.trim()}>Add</button>
          </div>

          {todos.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: '#99ACC2' }}>No tasks yet. Add one above.</p>
          ) : (
            <div className="space-y-1.5">
              {sortedTodos.map(t => (
                <div key={t.id} className="group flex items-center gap-3 px-3 py-2.5 rounded-md" style={{ background: '#FFFFFF', border: '1px solid #DFE3EB' }}>
                  <Check done={t.done} onClick={() => updateTodo(t.id, { done: !t.done })} />
                  <input
                    value={t.text}
                    onChange={e => updateTodo(t.id, { text: e.target.value })}
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: '#33475B', textDecoration: t.done ? 'line-through' : 'none', opacity: t.done ? 0.55 : 1 }}
                  />
                  <button onClick={() => scheduleTodo(t)} title="Add to today's timetable" className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: '#516F90' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>
                  </button>
                  <button onClick={() => deleteTodo(t.id)} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: '#99ACC2' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
