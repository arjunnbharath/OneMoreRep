import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Dumbbell, Home, LineChart, User } from 'lucide-react'

const navItems = [
  { to: '/home', icon: Home, label: 'Home', exact: true },
  { to: '/home#workouts', icon: Dumbbell, label: 'Workouts', hash: '#workouts' },
  { to: '/tracker', icon: LineChart, label: 'Progress' },
  { to: '/profile', icon: User, label: 'Profile' },
]

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
    <div className="min-h-dvh bg-black lg:flex">
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-neutral-800 lg:px-6 lg:py-8">
        <div className="mb-10 flex items-center gap-2">
          <Dumbbell size={22} className="text-orange-500" />
          <span className="text-xl font-bold tracking-tight text-white">OneMoreRep</span>
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map(({ to, icon: Icon, label, exact, hash }) => (
            <NavLink
              key={label}
              to={to}
              className={() =>
                [
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                  isNavActive(to, exact, hash)
                    ? 'bg-orange-500/15 text-orange-400'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white',
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
        <main className="flex-1 pb-24 lg:pb-8">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur lg:hidden">
          <ul className="flex items-stretch justify-around px-2 py-2">
            {navItems.map(({ to, icon: Icon, label, exact, hash }) => {
              const active = isNavActive(to, exact, hash)
              return (
                <li key={label} className="flex-1">
                  <NavLink
                    to={to}
                    className="flex flex-col items-center gap-1 py-1"
                  >
                    <Icon
                      size={20}
                      className={active ? 'text-orange-500' : 'text-neutral-500'}
                    />
                    <span
                      className={[
                        'text-[10px] font-medium',
                        active ? 'text-orange-500' : 'text-neutral-500',
                      ].join(' ')}
                    >
                      {label}
                    </span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}
