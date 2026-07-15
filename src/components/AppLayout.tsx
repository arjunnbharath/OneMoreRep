import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Activity, Dumbbell, Flame, Home, User } from 'lucide-react'
import MobileBottomNav from './MobileBottomNav'

const navItems = [
  { to: '/home', icon: Home, label: 'Home', exact: true },
  { to: '/calories', icon: Flame, label: 'Calories' },
  { to: '/tracker', icon: Activity, label: 'Progress' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function AppLayout() {
  const location = useLocation()
  const isWorkoutDetail = location.pathname.startsWith('/workout/')

  function isNavActive(to: string, exact?: boolean) {
    if (isWorkoutDetail && to.startsWith('/tracker')) return true
    if (exact) return location.pathname === to
    return location.pathname === to || location.pathname.startsWith(`${to}/`)
  }

  return (
    <div className="min-h-dvh bg-background text-foreground lg:flex">
      <aside className="hidden border-r border-border bg-surface/80 shadow-sm backdrop-blur-xl lg:flex lg:w-60 lg:flex-col lg:px-5 lg:py-8 xl:w-64 dark:border-white/8 dark:bg-surface/55 dark:shadow-none">
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background">
            <Dumbbell size={18} />
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight">OneMoreRep</p>
            <p className="text-[11px] text-muted">Fitness & nutrition</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5">
          {navItems.map(({ to, icon: Icon, label, exact }) => {
            const active = isNavActive(to, exact)
            return (
              <NavLink
                key={label}
                to={to}
                className={[
                  'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-surface text-foreground shadow-sm ring-1 ring-border dark:bg-surface-elevated dark:ring-white/10'
                    : 'text-muted hover:bg-surface-elevated/70 hover:text-foreground dark:hover:bg-surface-elevated/50',
                ].join(' ')}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-foreground" />
                )}
                <Icon size={18} strokeWidth={active ? 2.25 : 1.75} />
                {label}
              </NavLink>
            )
          })}
        </nav>

        <p className="px-2 text-[11px] text-muted">Train hard. Track everything.</p>
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col overflow-x-hidden">
        <main className="flex-1 overflow-x-hidden lg:pb-8">
          <Outlet />
        </main>
        <div className="mobile-nav-spacer lg:hidden" aria-hidden="true" />
        <MobileBottomNav />
      </div>
    </div>
  )
}
