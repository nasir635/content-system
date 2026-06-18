import type { Metadata } from 'next'
import './globals.css'
import { Shell } from '@/components/Shell'
import { StoreHydrator } from '@/components/StoreHydrator'

export const metadata: Metadata = {
  title: 'Content OS',
  description: 'Your personal content inspiration & scripting portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-cs-navy">
        <StoreHydrator />
        <Shell>{children}</Shell>
      </body>
    </html>
  )
}
