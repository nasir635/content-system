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
      <body className="bg-ig-bg text-ig-text flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto ml-0 md:ml-[72px] xl:ml-[245px]">
          {children}
        </main>
      </body>
    </html>
  )
}
