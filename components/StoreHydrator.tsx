'use client'
import { useEffect } from 'react'
import { useStore } from '@/lib/store'

let started = false

export function StoreHydrator() {
  const hydrate = useStore(s => s.hydrate)
  useEffect(() => {
    if (started) return
    started = true
    hydrate()
  }, [hydrate])
  return null
}
