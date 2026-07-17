import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Dumbbell, Eye, EyeOff, AtSign, Lock, Mail, User } from 'lucide-react'
import AuthPageShell from '../components/AuthPageShell'
import AuthVideoBackground from '../components/AuthVideoBackground'
import Button from '../components/Button'
import Input from '../components/Input'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const navigate = useNavigate()
  const { user, isLoading, register } = useAuth()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
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
      await register(name, username, email, password)
      navigate('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
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
    <AuthPageShell className="lg:grid lg:grid-cols-2">
      <div className="relative hidden min-h-dvh lg:block">
        <AuthVideoBackground variant="auth" />
        <div className="absolute bottom-16 left-12 right-12 z-10 text-white">
          <div className="flex items-center gap-2">
            <Dumbbell size={22} />
            <span className="text-sm font-bold tracking-widest">ONEMOREREP</span>
          </div>
          <h2 className="mt-6 text-4xl font-bold leading-tight">
            Start tracking.<br />
            Start improving.
          </h2>
          <p className="mt-4 max-w-md text-lg text-white/70">
            Pick a user ID, build your plan, and share progress with training partners.
          </p>
        </div>
      </div>

      <div className="relative flex min-h-dvh flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        <AuthVideoBackground variant="auth" className="lg:hidden" />
        <div className="relative z-10 mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Dumbbell size={18} />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">OneMoreRep</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Create account</h1>
          <p className="mt-2 text-sm text-muted">Choose a user ID, name, email, and password.</p>

          {error && (
            <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200 dark:bg-red-950/50 dark:text-red-400 dark:ring-red-900/50">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              label="Name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User size={18} />}
            />
            <Input
              label="User ID"
              type="text"
              placeholder="e.g. arjun_lifts"
              autoComplete="username"
              required
              minLength={3}
              maxLength={20}
              pattern="[A-Za-z0-9_]{3,20}"
              title="3-20 characters: letters, numbers, or underscores"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<AtSign size={18} />}
            />
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
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
                minLength={6}
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
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <Button type="submit" fullWidth className="mt-2 py-3.5" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-foreground underline-offset-2 hover:underline">
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center">
            <Link to="/" className="text-sm text-muted hover:text-foreground">
              ← Back to welcome
            </Link>
          </p>
        </div>
      </div>
    </AuthPageShell>
  )
}
