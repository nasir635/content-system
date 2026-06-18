'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useToast } from '@/lib/toast'

export function Toaster() {
  const toasts = useToast(s => s.toasts)
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2" style={{ pointerEvents: 'none' }}>
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
            className="toast"
            style={{ pointerEvents: 'auto' }}
          >
            <span
              className="flex items-center justify-center rounded-full flex-shrink-0"
              style={{ width: 18, height: 18, background: t.type === 'error' ? '#F2545B' : '#00BDA5' }}
            >
              {t.type === 'error' ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              )}
            </span>
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
