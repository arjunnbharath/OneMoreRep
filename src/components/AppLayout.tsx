import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Activity, BookOpen, Dumbbell, Flame, Home, User } from 'lucide-react'
import MobileBottomNav from './MobileBottomNav'
import UserAvatar from './UserAvatar'
import { TourProvider } from '../context/TourContext'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/home', icon: Home, label: 'Home', exact: true },
  { to: '/calories', icon: Flame, label: 'Calories' },
  { to: '/tracker', icon: Activity, label: 'Progress' },
  { to: '/exercises', icon: BookOpen, label: 'Exercises' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function AppLayout() {
  const location = useLocation()
  const { user } = useAuth()
  const isWorkoutDetail = location.pathname.startsWith('/workout/')
  const hideMobileNavSpacer =
    location.pathname === '/tracker/workout/library' ||
    location.pathname.startsWith('/tracker/workout/library/')

  function isNavActive(to: string, exact?: boolean) {
    if (isWorkoutDetail && to.startsWith('/tracker')) return true
    if (exact) return location.pathname === to
    return location.pathname === to || location.pathname.startsWith(`${to}/`)
  }

  return (
    <div className="min-h-dvh bg-background text-foreground lg:flex">
      <aside className="desktop-sidebar-rail hidden border-r border-border bg-surface/90 shadow-sm backdrop-blur-xl lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:px-5 lg:py-8 dark:border-white/8 dark:bg-surface/60 dark:shadow-none">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background shadow-sm">
            <Dumbbell size={18} />
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight">OneMoreRep</p>
            <p className="text-[11px] text-muted">Train · Track · Progress</p>
          </div>
        </div>

        <nav data-tour="main-nav-desktop" className="flex flex-1 flex-col gap-1">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            Menu
          </p>
          {navItems.map(({ to, icon: Icon, label, exact }) => {
            const active = isNavActive(to, exact)
            return (
              <NavLink
                key={label}
                to={to}
                className={[
                  'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted hover:bg-surface-elevated/80 hover:text-foreground dark:hover:bg-surface-elevated/50',
                ].join(' ')}
              >
                <Icon size={18} strokeWidth={active ? 2.25 : 1.75} />
                {label}
              </NavLink>
            )
          })}
        </nav>

        {user && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-background/70 px-3 py-3 dark:bg-background/40">
            <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-[11px] text-muted">
                {user.username ? `@${user.username}` : user.email}
              </p>
            </div>
          </div>
        )}
      </aside>

      <div
        className={[
          'flex min-w-0 flex-1 flex-col overflow-x-hidden',
          hideMobileNavSpacer ? 'h-dvh overflow-hidden lg:h-auto lg:overflow-visible' : 'min-h-dvh',
        ].join(' ')}
      >
        <TourProvider>
          <main
            className={[
              'desktop-main-scroll flex-1 overflow-x-hidden lg:pb-10',
              hideMobileNavSpacer
                ? 'flex h-[calc(100dvh-var(--mobile-nav-height))] min-h-0 flex-col overflow-hidden lg:h-auto lg:overflow-visible'
                : '',
            ].join(' ')}
          >
            <Outlet />
          </main>
          <div
            className={hideMobileNavSpacer ? 'hidden' : 'mobile-nav-spacer lg:hidden'}
            aria-hidden="true"
          />
          <MobileBottomNav />
        </TourProvider>
      </div>
    </div>
  )
}
