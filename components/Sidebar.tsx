'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'

const IcoDashboard = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
)
const IcoBulb = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6"/><path d="M10 22h4"/>
    <path d="M12 2a7 7 0 015 11.95V17a1 1 0 01-1 1H8a1 1 0 01-1-1v-3.05A7 7 0 0112 2z"/>
  </svg>
)
const IcoScript = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)
const IcoRef = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)
const IcoSettings = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
)
const IcoTags = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H4a1 1 0 00-1 1v5l8.29 8.29a1 1 0 001.42 0l4.58-4.58a1 1 0 000-1.42L9 5z"/>
    <line x1="6.5" y1="8.5" x2="6.51" y2="8.5"/>
  </svg>
)
const IcoCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IcoToday = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>
  </svg>
)

const NAV_GROUPS = [
  {
    label: 'OVERVIEW',
    items: [
      { href: '/',              label: 'Dashboard',    Icon: IcoDashboard  },
      { href: '/today',         label: 'Today',        Icon: IcoToday      },
    ],
  },
  {
    label: 'CONTENT',
    items: [
      { href: '/inspirations',  label: 'Inspirations',       Icon: IcoBulb     },
      { href: '/scripts',       label: 'Scripts',            Icon: IcoScript   },
      { href: '/references',    label: 'References',         Icon: IcoRef      },
    ],
  },
  {
    label: 'PLANNING',
    items: [
      { href: '/categories',    label: 'Content Categories', Icon: IcoTags     },
      { href: '/planner',       label: 'Planner',            Icon: IcoCalendar },
    ],
  },
  {
    label: 'TOOLS',
    items: [
      { href: '/settings',      label: 'Settings',     Icon: IcoSettings   },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const portalName = useStore(s => s.settings.portalName) || 'Content OS'

  return (
    <aside
      className="fixed top-0 left-0 h-full flex flex-col z-40"
      style={{
        width: 220,
        background: '#FFFFFF',
        borderRight: '1px solid #DFE3EB',
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(208,221,230,0.4)' }}>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #33475B 0%, #516F90 100%)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <span className="font-bold text-sm tracking-tight truncate" style={{ color: '#33475B' }}>
            {portalName}
          </span>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" style={{ scrollbarWidth: 'none' }}>
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="px-2 mb-2 text-[9px] font-bold tracking-widest" style={{ color: '#99ACC2' }}>
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, Icon }) => {
                const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors"
                    style={{
                      background: active ? '#FFF1ED' : 'transparent',
                      color: active ? '#FF7A59' : '#516F90',
                      fontWeight: active ? 600 : 500,
                      fontSize: 13,
                    }}
                  >
                    <Icon />
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(208,221,230,0.4)' }}>
        <p className="text-[10px] font-medium" style={{ color: '#99ACC2' }}>Faasle Content OS</p>
        <p className="text-[9px]" style={{ color: '#CBD6E2' }}>v1.0</p>
      </div>
    </aside>
  )
}
