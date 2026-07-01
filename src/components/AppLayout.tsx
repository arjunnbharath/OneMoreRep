import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Activity, Bookmark, Dumbbell, Home, User } from 'lucide-react'

const navItems = [
  { to: '/home', icon: Home, label: 'Home', exact: true },
  { to: '/home#workouts', icon: Bookmark, label: 'Workouts', hash: '#workouts' },
  { to: '/tracker', icon: Activity, label: 'Progress' },
  { to: '/profile', icon: User, label: 'Profile' },
]

const ISLAND_BG = '#1a1a1a'
const INACTIVE_ICON = '#a1a1a6'

function IslandNavLink({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string
  icon: typeof Home
  label: string
  active: boolean
}) {
  return (
    <NavLink
      to={to}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className="flex flex-1 items-center justify-center"
    >
      <span
        className={[
          'flex h-[50px] w-[50px] items-center justify-center',
          active ? 'rounded-[13px] bg-white' : '',
        ].join(' ')}
        style={{ color: active ? ISLAND_BG : INACTIVE_ICON }}
      >
        <Icon size={22} strokeWidth={active ? 2.25 : 1.75} />
      </span>
    </NavLink>
  )
}

export default function AppLayout() {
  const location = useLocation()
  const isWorkoutDetail = location.pathname.startsWith('/workout/')

  function isNavActive(to: string, exact?: boolean, hash?: string) {
    if (isWorkoutDetail && to.startsWith('/tracker')) return true
    if (hash) return location.pathname === '/home' && location.hash === hash
    if (exact) return location.pathname === to && !location.hash
    return location.pathname === to
  }

  return (
    <div className="min-h-dvh bg-background text-foreground lg:flex">
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border lg:px-6 lg:py-8">
        <div className="mb-10 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
            <Dumbbell size={18} className="text-accent-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">OneMoreRep</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map(({ to, icon: Icon, label, exact, hash }) => (
            <NavLink
              key={label}
              to={to}
              className={() =>
                [
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                  isNavActive(to, exact, hash)
                    ? 'bg-foreground/10 text-foreground'
                    : 'text-muted hover:bg-surface hover:text-foreground',
                ].join(' ')
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
        <p className="text-xs text-muted">Train hard. Track everything.</p>
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col">
        <main className="flex-1 pb-[5.5rem] lg:pb-8">
          <Outlet />
        </main>

        <nav
          className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-5 pb-5 lg:hidden"
          aria-label="Main navigation"
        >
          <div
            className="pointer-events-auto isolate flex w-full max-w-[400px] items-center rounded-[26px] px-1 py-[5px]"
            style={{
              backgroundColor: ISLAND_BG,
              boxShadow:
                '0 4px 16px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.06) inset',
              border: '1px solid rgba(255,255,255,0.08)',
              WebkitFontSmoothing: 'antialiased',
            }}
          >
            {navItems.map(({ to, icon, label, exact, hash }) => (
              <IslandNavLink
                key={label}
                to={to}
                icon={icon}
                label={label}
                active={isNavActive(to, exact, hash)}
              />
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
