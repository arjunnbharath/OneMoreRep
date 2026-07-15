import { NavLink, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { Activity, Flame, Home, User } from 'lucide-react'

const navItems: {
  to: string
  icon: LucideIcon
  label: string
  exact?: boolean
}[] = [
  { to: '/home', icon: Home, label: 'Home', exact: true },
  { to: '/calories', icon: Flame, label: 'Calories' },
  { to: '/tracker', icon: Activity, label: 'Progress' },
  { to: '/profile', icon: User, label: 'Profile' },
]

function isActive(pathname: string, to: string, exact?: boolean) {
  if (pathname.startsWith('/workout/') && to === '/tracker') return true
  if (exact) return pathname === to
  return pathname === to || pathname.startsWith(`${to}/`)
}

export default function MobileBottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 overflow-hidden rounded-t-3xl bg-surface/90 shadow-[var(--shadow-nav)] backdrop-blur-xl lg:hidden dark:bg-surface/75"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Main navigation"
    >
      <div className="mx-auto grid h-14 max-w-lg grid-cols-4">
        {navItems.map(({ to, icon: Icon, label, exact }) => {
          const active = isActive(pathname, to, exact)
          return (
            <NavLink
              key={to}
              to={to}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center gap-0.5 px-1"
            >
              {active && (
                <span className="absolute inset-x-3 top-1/2 h-10 -translate-y-1/2 rounded-xl bg-surface-elevated ring-1 ring-border dark:bg-surface-elevated dark:ring-white/8" />
              )}
              <Icon
                size={18}
                strokeWidth={active ? 2.25 : 1.75}
                className={['relative z-10', active ? 'text-foreground' : 'text-muted'].join(' ')}
              />
              <span
                className={[
                  'relative z-10 text-[10px] leading-none',
                  active ? 'font-semibold text-foreground' : 'font-medium text-muted',
                ].join(' ')}
              >
                {label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
