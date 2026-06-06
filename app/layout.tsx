import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Content System',
  description: 'Your personal content dissection & scripting portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-ig-bg text-ig-text">
        {/* Desktop left sidebar — hidden on mobile */}
        <Sidebar />
        {/* Main content: bottom padding for mobile bottom nav, left margin for desktop sidebar */}
        <main className="min-h-screen overflow-y-auto pb-16 md:pb-0 md:ml-[72px] xl:ml-[245px]">
          {children}
        </main>
      </body>
    </html>
  )
}
