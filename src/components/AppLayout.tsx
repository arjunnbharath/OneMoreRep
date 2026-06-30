import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Activity, Bookmark, Home, User } from 'lucide-react'

const navItems = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { to: '/tracker', icon: Activity, label: 'Tracker' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function AppLayout() {
  const location = useLocation()
  const isWorkoutDetail = location.pathname.startsWith('/workout/')

  return (
    <div className="min-h-dvh bg-white lg:flex">
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-neutral-100 lg:px-6 lg:py-8">
        <div className="mb-10">
          <span className="text-xl font-bold tracking-tight">OneMoreRep</span>
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                  isActive || (isWorkoutDetail && to === '/tracker')
                    ? 'bg-black text-white'
                    : 'text-neutral-600 hover:bg-neutral-100',
                ].join(' ')
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col">
        <main className="flex-1 pb-20 lg:pb-8">
          <Outlet />
        </main>

        <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-3rem)] max-w-xs -translate-x-1/2 rounded-2xl bg-black px-4 py-2 shadow-lg lg:hidden">
          <ul className="flex items-center justify-between">
            {navItems.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  aria-label={label}
                  className={({ isActive }) =>
                    [
                      'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                      isActive || (isWorkoutDetail && to === '/tracker')
                        ? 'bg-white text-black'
                        : 'text-white/70 hover:text-white',
                    ].join(' ')
                  }
                >
                  <Icon size={18} />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
