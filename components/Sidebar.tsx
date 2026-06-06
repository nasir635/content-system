'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Scissors, FileText, Settings, Zap, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'

const nav = [
  { href: '/',             icon: LayoutDashboard, label: 'Dashboard'   },
  { href: '/dissections',  icon: Scissors,        label: 'Dissections' },
  { href: '/scripts',      icon: FileText,        label: 'Scripts'     },
  { href: '/streamlines',  icon: Zap,             label: 'Streamlines' },
  { href: '/settings',     icon: Settings,        label: 'Settings'    },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full z-50 flex flex-col
      w-[72px] xl:w-[245px]
      bg-ig-bg border-r border-ig-border
      transition-all duration-300">

      {/* Logo */}
      <div className="px-3 xl:px-6 py-6 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-ig-gradient flex items-center justify-center flex-shrink-0">
            <Scissors size={16} className="text-white" />
          </div>
          <span className="hidden xl:block font-bold text-lg tracking-tight ig-gradient-text">
            ContentOS
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 xl:px-3 space-y-1">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-150 group relative',
                active
                  ? 'bg-ig-hover text-ig-text font-semibold'
                  : 'text-ig-muted hover:bg-ig-hover hover:text-ig-text'
              )}
            >
              <Icon
                size={24}
                strokeWidth={active ? 2.5 : 2}
                className="flex-shrink-0"
              />
              <span className="hidden xl:block text-sm">{label}</span>
              {active && (
                <ChevronRight size={14} className="hidden xl:block ml-auto text-ig-faint" />
              )}
              {/* Tooltip on collapsed */}
              <span className="xl:hidden absolute left-14 bg-ig-card border border-ig-border
                text-ig-text text-sm px-3 py-1.5 rounded-lg whitespace-nowrap
                opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom brand */}
      <div className="px-3 xl:px-6 py-5 border-t border-ig-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-ig-gradient flex-shrink-0" />
          <div className="hidden xl:block">
            <p className="text-xs font-semibold text-ig-text">Nasir</p>
            <p className="text-xs text-ig-faint">Creator</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
