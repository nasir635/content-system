'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Search, PlusSquare, Film, Zap, Settings,
  HomeIcon, SearchIcon
} from 'lucide-react'

// Instagram-style SVG icons (filled vs outline)
const IconHome = ({ filled }: { filled: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? '#262626' : 'none'} stroke={filled ? 'none' : '#262626'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
    <path d="M9 21V12h6v9" fill="white" stroke={filled ? '#262626' : '#262626'} strokeWidth="2"/>
  </svg>
)
const IconSearch = ({ filled }: { filled: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth={filled ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
)
const IconPlus = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/>
  </svg>
)
const IconReel = ({ filled }: { filled: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? '#262626' : 'none'} stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18" fill={filled ? '#262626' : 'none'}/>
    <path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5" stroke={filled ? 'white' : '#262626'} strokeWidth="1.5"/>
  </svg>
)
const IconZap = ({ filled }: { filled: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? '#262626' : 'none'} stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)
const IconSettings = ({ filled }: { filled: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth={filled ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
)

const NAV = [
  { href: '/',             label: 'Home',        Icon: IconHome    },
  { href: '/dissections',  label: 'Dissections', Icon: IconSearch  },
  { href: '/dissections',  label: 'Create',      Icon: IconPlus,   isCreate: true },
  { href: '/scripts',      label: 'Scripts',     Icon: IconReel    },
  { href: '/streamlines',  label: 'Streamlines', Icon: IconZap     },
  { href: '/settings',     label: 'Settings',    Icon: IconSettings},
]

export function Sidebar() {
  const path = usePathname()

  return (
    <>
      {/* ── DESKTOP sidebar ── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full z-40 flex-col
        w-[72px] xl:w-[244px]
        bg-white border-r border-ig-border pt-2 pb-4">

        {/* Logo */}
        <div className="px-3 xl:px-5 py-6 mb-2">
          <div className="xl:block hidden">
            <span className="ig-logo">ContentOS</span>
          </div>
          <div className="xl:hidden flex items-center justify-center">
            {/* Camera icon like Instagram mobile */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1 px-2 xl:px-3">
          {NAV.filter(n => !n.isCreate).map(({ href, label, Icon }) => {
            const active = path === href || (href !== '/' && path.startsWith(href))
            return (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-colors group
                  ${active ? 'font-bold' : 'font-normal hover:bg-ig-hover'}`}
              >
                <Icon filled={active} />
                <span className="hidden xl:block text-[16px] text-ig-text">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Profile */}
        <div className="px-2 xl:px-3">
          <Link href="/settings" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-ig-hover transition-colors">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 flex-shrink-0" />
            <span className="hidden xl:block text-[14px] text-ig-text font-medium">Profile</span>
          </Link>
        </div>
      </aside>

      {/* ── MOBILE bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-ig-border
        flex items-center justify-around h-[49px] px-2">
        {[
          { href: '/',            label: 'Home',    Icon: IconHome    },
          { href: '/dissections', label: 'Search',  Icon: IconSearch  },
          { href: '/dissections', label: 'Create',  Icon: IconPlus    },
          { href: '/scripts',     label: 'Reels',   Icon: IconReel    },
          { href: '/settings',    label: 'Profile', Icon: IconSettings},
        ].map(({ href, label, Icon }) => {
          const active = path === href || (href !== '/' && path.startsWith(href))
          return (
            <Link key={label} href={href} className="flex items-center justify-center w-12 h-full">
              <Icon filled={active} />
            </Link>
          )
        })}
      </nav>
    </>
  )
}
