import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'ContentOS',
  description: 'Your personal content dissection & scripting portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-ig-bg text-ig-text">
        <Sidebar />
        {/* Desktop: offset for left sidebar. Mobile: offset bottom for nav */}
        <main className="md:ml-[72px] xl:ml-[244px] pb-[49px] md:pb-0 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
