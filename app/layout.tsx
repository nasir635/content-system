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
      <body className="bg-cs-beige text-cs-navy">
        <Sidebar />
        <main className="md:ml-[72px] xl:ml-[240px] pb-[56px] md:pb-0 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
