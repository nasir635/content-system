'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Scissors, PlusCircle, FileText, Zap } from 'lucide-react'
import { clsx } from 'clsx'

const nav = [
  { href: '/',            icon: Home,        label: 'Home'        },
  { href: '/dissections', icon: Scissors,    label: 'Dissections' },
  { href: '/scripts',     icon: FileText,    label: 'Scripts'     },
  { href: '/streamlines', icon: Zap,         label: 'Streamlines' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* ── MOBILE: fixed bottom nav bar ───────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around
          bg-black/95 backdrop-blur-xl border-t border-ig-border h-16 px-2"
      >
        {/* Home */}
        <MobileNavItem href="/" label="Home" pathname={pathname}>
          <Home size={26} strokeWidth={pathname === '/' ? 2.5 : 1.8} />
        </MobileNavItem>

        {/* Dissections */}
        <MobileNavItem href="/dissections" label="Dissections" pathname={pathname}>
          <Scissors size={26} strokeWidth={pathname.startsWith('/dissections') ? 2.5 : 1.8} />
        </MobileNavItem>

        {/* Add / centre button with gradient ring */}
        <Link
          href="/dissections"
          className="flex items-center justify-center w-12 h-12 rounded-full
            bg-ig-gradient p-[2px] flex-shrink-0"
          aria-label="Dissect"
        >
          <span className="w-full h-full rounded-full bg-black flex items-center justify-center">
            <PlusCircle size={26} strokeWidth={1.8} className="text-white" />
          </span>
        </Link>

        {/* Scripts */}
        <MobileNavItem href="/scripts" label="Scripts" pathname={pathname}>
          <FileText size={26} strokeWidth={pathname.startsWith('/scripts') ? 2.5 : 1.8} />
        </MobileNavItem>

        {/* Streamlines */}
        <MobileNavItem href="/streamlines" label="Streamlines" pathname={pathname}>
          <Zap size={26} strokeWidth={pathname.startsWith('/streamlines') ? 2.5 : 1.8} />
        </MobileNavItem>
      </nav>

      {/* ── DESKTOP: fixed left sidebar ────────────────────────────────── */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-full z-50 flex-col
          w-[72px] xl:w-[245px]
          bg-ig-bg border-r border-ig-border
          transition-all duration-300"
      >
        {/* Logo */}
        <div className="px-3 xl:px-6 py-6 mb-2">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
            >
              <Scissors size={16} className="text-white" />
            </div>
            <span className="hidden xl:block font-bold text-lg tracking-tight ig-gradient-text">
              ContentOS
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 xl:px-3 space-y-1">
          {nav.map(({ href, icon: Icon, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
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
                  strokeWidth={active ? 2.5 : 1.8}
                  className="flex-shrink-0"
                />
                <span className="hidden xl:block text-sm">{label}</span>

                {/* Tooltip when collapsed */}
                <span
                  className="xl:hidden absolute left-14 bg-ig-card border border-ig-border
                    text-ig-text text-sm px-3 py-1.5 rounded-lg whitespace-nowrap
                    opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl"
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Avatar area */}
        <div className="px-3 xl:px-6 py-5 border-t border-ig-border">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex-shrink-0"
              style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
            />
            <div className="hidden xl:block">
              <p className="text-xs font-semibold text-ig-text">Nasir</p>
              <p className="text-xs text-ig-faint">Creator</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

function MobileNavItem({
  href, label, pathname, children,
}: {
  href: string; label: string; pathname: string; children: React.ReactNode
}) {
  const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
  return (
    <Link
      href={href}
      aria-label={label}
      className={clsx(
        'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors',
        active ? 'text-ig-text' : 'text-ig-muted'
      )}
    >
      {children}
    </Link>
  )
}
