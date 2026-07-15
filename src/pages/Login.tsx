import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Dumbbell, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import AuthVideoBackground from '../components/AuthVideoBackground'
import Button from '../components/Button'
import Input from '../components/Input'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-background text-foreground lg:grid lg:grid-cols-2">
      <div className="relative hidden min-h-dvh lg:block">
        <AuthVideoBackground variant="auth" />
        <div className="absolute bottom-16 left-12 right-12 z-10 text-white">
          <div className="flex items-center gap-2">
            <Dumbbell size={22} />
            <span className="text-sm font-bold tracking-widest">ONEMOREREP</span>
          </div>
          <h2 className="mt-6 text-4xl font-bold leading-tight">
            Welcome back,<br />
            champion.
          </h2>
          <p className="mt-4 max-w-md text-lg text-white/70">
            Your workouts, progress, and exercise guides — all in one place.
          </p>
        </div>
      </div>

      <div className="relative flex min-h-dvh flex-col justify-center px-6 py-10 sm:px-10 lg:px-16">
        <AuthVideoBackground variant="auth" className="lg:hidden" />
        <div className="relative z-10 mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Dumbbell size={20} />
            <span className="text-sm font-bold tracking-widest text-white">ONEMOREREP</span>
          </div>

          <div className="lg:p-0">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Sign in</h1>
            <p className="mt-2 text-muted">Continue your fitness journey.</p>

            {error && (
              <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200 dark:bg-red-950/50 dark:text-red-400 dark:ring-red-900/50">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={18} />}
              />
              <div>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock size={18} />}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showPassword ? 'Hide password' : 'Show password'}
                </button>
              </div>

              <Button type="submit" fullWidth className="mt-2 py-4 text-base" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="font-semibold text-foreground underline-offset-2 hover:underline">
                Create one
              </Link>
            </p>

            <p className="mt-4 text-center">
              <Link to="/" className="text-sm text-muted hover:text-foreground">
                ← Back to welcome
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
