import { create } from 'zustand'

export interface ToastItem { id: string; message: string; type: 'success' | 'error' }

interface ToastStore {
  toasts: ToastItem[]
  show: (message: string, type?: 'success' | 'error') => void
  dismiss: (id: string) => void
}

let n = 0

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  show: (message, type = 'success') => {
    const id = `t${Date.now()}_${n++}`
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 2600)
  },
  dismiss: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}))

// Fire-and-forget helper usable outside React.
export const toast = (message: string, type?: 'success' | 'error') =>
  useToast.getState().show(message, type)
