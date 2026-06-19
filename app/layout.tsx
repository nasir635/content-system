import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'katex/dist/katex.min.css'
import 'tippy.js/dist/tippy.css'
import { Shell } from '@/components/Shell'
import { StoreHydrator } from '@/components/StoreHydrator'
import { Toaster } from '@/components/Toaster'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: 'Content OS',
  description: 'Your personal content inspiration & scripting portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <StoreHydrator />
        <Shell>{children}</Shell>
        <Toaster />
      </body>
    </html>
  )
}
