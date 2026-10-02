import { Navigate, useNavigate } from 'react-router-dom'
import { Dumbbell } from 'lucide-react'
import AuthPageShell from '../components/AuthPageShell'
import AuthVideoBackground from '../components/AuthVideoBackground'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'

export default function Splash() {
  const navigate = useNavigate()
  const { user, isLoading, localProfile, resumeLocalSession, continueAsGuest } = useAuth()

  function handleGuest() {
    continueAsGuest()
    navigate('/home', { replace: true })
  }

  function handleContinueLocal() {
    try {
      resumeLocalSession()
      navigate('/home', { replace: true })
    } catch {
      navigate('/login')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/home" replace />
  }

  return (
    <AuthPageShell className="relative">
      <AuthVideoBackground variant="splash" className="fixed" />

      <div className="relative flex h-dvh flex-col overflow-hidden px-6 pb-[max(3rem,env(safe-area-inset-bottom))] pt-[max(3.5rem,env(safe-area-inset-top))] sm:px-10">
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
            {localProfile ? (
              <>
                <Button fullWidth className="py-4 text-base" onClick={handleContinueLocal}>
                  Continue as {localProfile.name}
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  className="py-4 text-base"
                  onClick={() => navigate('/login')}
                >
                  Sign in to an online account
                </Button>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="w-full py-2 text-sm text-muted hover:text-foreground"
                >
                  Create a new account
                </button>
              </>
            ) : (
              <>
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
                <button
                  type="button"
                  onClick={handleGuest}
                  className="w-full py-2 text-sm text-muted hover:text-foreground"
                >
                  Continue as guest
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </AuthPageShell>
  )
}
