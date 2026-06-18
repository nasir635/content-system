'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import { CATEGORY_COLORS } from '@/lib/types'
import type { Category } from '@/lib/types'
import { v4 as uuid } from 'uuid'

function CategoryModal({ initial, onSave, onClose }: {
  initial?: Category; onSave: (c: Omit<Category, 'id' | 'createdAt'>) => void; onClose: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [rules, setRules] = useState(initial?.rules ?? '')
  const [shotTypes, setShotTypes] = useState(initial?.shotTypes ?? '')
  const [color, setColor] = useState(initial?.color ?? CATEGORY_COLORS[0])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(47,65,86,0.45)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ y: 28, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 28, opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', damping: 30, stiffness: 340 }}
        className="w-full max-w-lg rounded-[22px] overflow-hidden flex flex-col"
        style={{ background: '#FFFFFF', border: '1px solid #DFE3EB', boxShadow: '0 24px 64px rgba(47,65,86,0.25)', maxHeight: '90vh' }}
      >
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid #EAF0F6' }}>
          <h2 className="font-bold text-[15px]" style={{ color: '#33475B' }}>{initial ? 'Edit Category' : 'New Category'}</h2>
          <button onClick={onClose} style={{ color: '#7C98B6' }} className="transition-colors hover:text-[#33475B]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#7C98B6' }}>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Faasle BTS" className="cs-input" autoFocus />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#7C98B6' }}>Color</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className="rounded-full transition-transform"
                  style={{ width: 26, height: 26, background: c, transform: color === c ? 'scale(1.15)' : 'scale(1)', boxShadow: color === c ? `0 0 0 3px #FFF, 0 0 0 5px ${c}` : 'none' }}
                  aria-label={c} />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#7C98B6' }}>Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="What kind of content is this?" className="cs-input" />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#7C98B6' }}>Rules</label>
            <textarea value={rules} onChange={e => setRules(e.target.value)} rows={4} placeholder="Tone, pacing, length, do's and don'ts for this category…" className="cs-input resize-none" />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#7C98B6' }}>Shot Types</label>
            <textarea value={shotTypes} onChange={e => setShotTypes(e.target.value)} rows={3} placeholder="Which shots to use — e.g. slow push-ins, handheld B-roll, talking head…" className="cs-input resize-none" />
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid #EAF0F6' }}>
          <button className="cs-btn-outline flex-1 py-2.5 rounded-[10px] text-sm font-semibold" onClick={onClose}>Cancel</button>
          <button className="cs-btn flex-1 py-2.5 rounded-[10px] text-sm" disabled={!name.trim()}
            onClick={() => onSave({ name: name.trim(), description, rules, shotTypes, color })}>
            {initial ? 'Save changes' : 'Create category'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function CategoryCard({ cat, count, onEdit, onDelete, onClick }: {
  cat: Category; count: number; onEdit: () => void; onDelete: () => void; onClick: () => void
}) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="group rounded-[18px] overflow-hidden cursor-pointer"
      style={{ background: '#FFFFFF', border: '1px solid #DFE3EB', boxShadow: '0 1px 3px rgba(47,65,86,0.05)', transition: 'box-shadow .2s, transform .2s' }}
      onClick={onClick}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(47,65,86,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(47,65,86,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
    >
      <div style={{ height: 4, background: cat.color }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="rounded-full flex-shrink-0" style={{ width: 10, height: 10, background: cat.color }} />
            <div className="min-w-0">
              <p className="font-bold truncate" style={{ color: '#33475B', fontSize: 15 }}>{cat.name}</p>
              {cat.description && <p className="text-xs truncate" style={{ color: '#7C98B6' }}>{cat.description}</p>}
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button onClick={e => { e.stopPropagation(); onEdit() }} className="p-1.5 rounded-lg transition-colors" style={{ color: '#7C98B6' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#EAF0F6' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete() }} className="p-1.5 rounded-lg transition-colors" style={{ color: '#7C98B6' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FCEEEE'; (e.currentTarget as HTMLElement).style.color = '#B04A4A' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#7C98B6' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: `${cat.color}14`, color: cat.color }}>
            {count} {count === 1 ? 'script' : 'scripts'}
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#99ACC2' }}>Rules</p>
            <p className="text-xs leading-relaxed" style={{ color: cat.rules ? '#516F90' : '#CBD6E2', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
              {cat.rules || 'No rules set yet'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#99ACC2' }}>Shot Types</p>
            <p className="text-xs leading-relaxed" style={{ color: cat.shotTypes ? '#516F90' : '#CBD6E2', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
              {cat.shotTypes || 'No shot types set yet'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function CategoriesPage() {
  const { categories, scripts, addCategory, updateCategory, deleteCategory } = useStore()
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

  const countFor = (name: string) => scripts.filter(s => s.category === name).length

  function openNew() { setEditing(null); setModalOpen(true) }
  function openEdit(c: Category) { setEditing(c); setModalOpen(true) }

  function handleSave(data: Omit<Category, 'id' | 'createdAt'>) {
    if (editing) {
      updateCategory(editing.id, { ...data, updatedAt: new Date().toISOString() })
    } else {
      addCategory({ ...data, id: uuid(), createdAt: new Date().toISOString() })
    }
    setModalOpen(false); setEditing(null)
  }

  return (
    <div className="min-h-screen" style={{ background: '#F5F8FA' }}>
      <div className="sticky top-0 z-30" style={{ background: 'rgba(247,249,251,0.94)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #DFE3EB' }}>
        <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
          <div>
            <h1 className="font-bold text-[18px]" style={{ color: '#33475B' }}>Content Categories</h1>
            <p className="text-xs mt-0.5" style={{ color: '#7C98B6' }}>Define each content type, its rules, and the shots to use</p>
          </div>
          <button className="cs-btn flex items-center gap-1.5" onClick={openNew}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Category
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center py-32 gap-3 text-center">
            <p className="text-sm font-semibold" style={{ color: '#33475B' }}>No categories yet</p>
            <button className="cs-btn mt-1" onClick={openNew}>Create first category</button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(c => (
              <CategoryCard key={c.id} cat={c} count={countFor(c.name)}
                onEdit={() => openEdit(c)}
                onDelete={() => { if (confirm(`Delete "${c.name}"? Scripts keep their tag; planner entries for it are removed.`)) deleteCategory(c.id) }}
                onClick={() => router.push(`/scripts?category=${encodeURIComponent(c.name)}`)} />
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <CategoryModal initial={editing ?? undefined} onSave={handleSave} onClose={() => { setModalOpen(false); setEditing(null) }} />
        )}
      </AnimatePresence>
    </div>
  )
}
