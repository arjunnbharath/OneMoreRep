import { useNavigate } from 'react-router-dom'
import { Dumbbell } from 'lucide-react'
import Button from '../components/Button'
import { heroImage } from '../data/mockData'

export default function Splash() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-dvh bg-background">
      <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50 dark:opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40 dark:from-black dark:via-black/70 dark:to-black/40" />

      <div className="relative flex min-h-dvh flex-col px-6 pb-12 pt-14 text-foreground sm:px-10">
        <div className="flex items-center gap-2">
          <Dumbbell size={24} className="text-foreground" />
          <span className="text-sm font-bold tracking-[0.2em]">ONEMOREREP</span>
        </div>

        <div className="mt-auto">
          <p className="text-sm font-medium text-muted">Train smarter. Lift harder.</p>
          <h1 className="mt-3 text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl">
            One more rep.<br />
            Every day.
          </h1>
          <p className="mt-4 max-w-md text-base text-muted sm:text-lg">
            Track workouts, watch exercise demos, and build unstoppable momentum.
          </p>

          <div className="mt-10 space-y-3">
            <Button fullWidth className="py-4 text-base" onClick={() => navigate('/signup')}>
              Get Started
            </Button>
            <Button
              variant="outline"
              fullWidth
              className="py-4 text-base"
              onClick={() => navigate('/login')}
            >
              I already have an account
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
