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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&family=Montserrat:wght@400;700&family=Poppins:wght@400;700&family=Raleway:wght@400;700&family=Nunito:wght@400;700&family=Work+Sans:wght@400;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;700&family=Lora:wght@400;700&family=PT+Serif:wght@400;700&family=Oswald:wght@400;700&family=Bebas+Neue&family=Pacifico&family=Dancing+Script:wght@400;700&family=Caveat:wght@400;700&family=Lobster&family=Roboto+Mono:wght@400;700&family=Source+Code+Pro:wght@400;700&family=JetBrains+Mono:wght@400;700&display=swap"
        />
      </head>
      <body>
        <StoreHydrator />
        <Shell>{children}</Shell>
        <Toaster />
      </body>
    </html>
  )
}
