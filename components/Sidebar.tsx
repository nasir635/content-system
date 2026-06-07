'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const IconHome = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'white' : 'none'} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
    <path d="M9 21V12h6v9" fill={active ? 'rgba(255,255,255,0.3)' : 'none'} stroke="white" strokeWidth="2"/>
  </svg>
)

const IconDissect = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35"/>
  </svg>
)

const IconScript = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
)

const IconZap = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'white' : 'none'} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)

const IconSettings = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
)

const NAV = [
  { href: '/',            label: 'Home',        Icon: IconHome     },
  { href: '/dissections', label: 'Dissections', Icon: IconDissect  },
  { href: '/scripts',     label: 'Scripts',     Icon: IconScript   },
  { href: '/streamlines', label: 'Streamlines', Icon: IconZap      },
  { href: '/settings',    label: 'Settings',    Icon: IconSettings },
]

export function Sidebar() {
  const path = usePathname()

  return (
    <>
      {/* ── DESKTOP sidebar ── */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-full z-40 flex-col w-[72px] xl:w-[240px] pt-2 pb-6"
        style={{ background: '#2F4156' }}
      >
        {/* Logo */}
        <div className="px-3 xl:px-5 py-6 mb-4">
          <div className="hidden xl:block">
            <span className="text-white font-bold text-[18px] tracking-tight">ContentOS</span>
            <div className="h-0.5 w-8 mt-1 rounded-full" style={{ background: '#C8D9E6' }} />
          </div>
          <div className="xl:hidden flex items-center justify-center">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(200,217,230,0.18)' }}
            >
              <span className="text-white font-bold text-sm">C</span>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1 px-2 xl:px-3">
          {NAV.map(({ href, label, Icon }) => {
            const active = path === href || (href !== '/' && path.startsWith(href))
            return (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all group"
                style={{
                  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                <Icon active={active} />
                <span
                  className="hidden xl:block text-[14px] transition-colors"
                  style={{
                    color: active ? '#ffffff' : 'rgba(255,255,255,0.7)',
                    fontWeight: active ? 700 : 400,
                  }}
                >
                  {label}
                </span>
                {active && (
                  <div
                    className="hidden xl:block ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#C8D9E6' }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Profile avatar at bottom */}
        <div className="px-2 xl:px-3">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #567C8D, #C8D9E6)' }}
            >
              N
            </div>
            <span className="hidden xl:block text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Nasir
            </span>
          </div>
        </div>
      </aside>

      {/* ── MOBILE bottom nav ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around h-[56px] px-2"
        style={{ background: '#2F4156', borderTop: '1px solid rgba(200,217,230,0.2)' }}
      >
        {NAV.map(({ href, label, Icon }) => {
          const active = path === href || (href !== '/' && path.startsWith(href))
          return (
            <Link
              key={label}
              href={href}
              className="flex items-center justify-center w-12 h-full relative"
            >
              <Icon active={active} />
              {active && (
                <div
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: '#C8D9E6' }}
                />
              )}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
