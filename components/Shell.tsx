'use client'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'

// Full app chrome (sidebar + offset main) for normal routes; bare canvas for
// standalone screens like the login gate.
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname === '/login') return <>{children}</>
  return (
    <>
      <Sidebar />
      <main className="ml-[240px] min-h-screen">{children}</main>
    </>
  )
}
