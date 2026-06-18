import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { StoreHydrator } from '@/components/StoreHydrator'

export const metadata: Metadata = {
  title: 'ContentOS',
  description: 'Your personal content inspiration & scripting portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-cs-navy">
        <StoreHydrator />
        <Sidebar />
        <main className="ml-[240px] min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
