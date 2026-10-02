import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Dumbbell, Eye, EyeOff, AtSign, Lock, Smartphone } from 'lucide-react'
import AuthPageShell from '../components/AuthPageShell'
import AuthVideoBackground from '../components/AuthVideoBackground'
import Button from '../components/Button'
import Input from '../components/Input'
import { useAdminAuth } from '../context/AdminAuthContext'
import { useAuth } from '../context/AuthContext'
import { login as apiLogin } from '../lib/api'

export default function Login() {
  const navigate = useNavigate()
  const {
    user,
    isLoading,
    establishSession: establishUserSession,
    localProfile,
    resumeLocalSession,
    continueAsGuest,
  } = useAuth()
  const { token: adminToken, isLoading: adminLoading, establishSession: establishAdminSession } =
    useAdminAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleGuest() {
    setError('')
    continueAsGuest()
    navigate('/home', { replace: true })
  }

  function handleContinueLocal() {
    setError('')
    try {
      resumeLocalSession()
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open the account on this device')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await apiLogin(identifier, password)
      if (result.role === 'admin') {
        establishAdminSession(result.token, result.username)
        navigate('/admin', { replace: true })
        return
      }
      establishUserSession(result.token, result.user)
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || adminLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    )
  }

  if (adminToken) {
    return <Navigate to="/admin" replace />
  }

  if (user) {
    return <Navigate to={user.hasAdminAccess ? '/admin' : '/home'} replace />
  }

  return (
    <AuthPageShell className="h-dvh overflow-hidden lg:grid lg:grid-cols-2">
      <div className="relative hidden min-h-dvh lg:block">
        <AuthVideoBackground variant="auth" />
        <div className="absolute bottom-16 left-12 right-12 z-10 text-white">
          <div className="flex items-center gap-2">
            <Dumbbell size={22} />
            <span className="text-sm font-bold tracking-widest">ONEMOREREP</span>
          </div>
          <h2 className="mt-6 text-4xl font-bold leading-tight">
            Welcome back.
          </h2>
        </div>
      </div>

      <div className="relative flex h-dvh flex-col justify-center overflow-hidden px-6 pb-[max(1rem,var(--sab))] pt-[calc(var(--sat)+3rem)] sm:px-10 lg:px-16 lg:py-10">
        <AuthVideoBackground variant="auth" className="fixed lg:hidden" />
        <div className="relative z-10 mx-auto w-full max-w-md">
          <div className="mb-5 flex items-center gap-2 lg:hidden">
            <Dumbbell size={20} />
            <span className="text-sm font-bold tracking-widest text-white">ONEMOREREP</span>
          </div>

          <div className="lg:p-0">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Sign in</h1>

            {error && (
              <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200 dark:bg-red-950/50 dark:text-red-400 dark:ring-red-900/50">
                {error}
              </div>
            )}

            {localProfile && (
              <>
                <button
                  type="button"
                  onClick={handleContinueLocal}
                  className="mt-5 flex w-full items-center gap-3 rounded-2xl bg-surface p-4 text-left ring-1 ring-border transition hover:ring-foreground/20"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
                    <Smartphone size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      Continue as {localProfile.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">
                      Account saved on this device · no password needed
                    </span>
                  </span>
                </button>
                <div className="mt-4 flex items-center gap-3 text-xs text-muted">
                  <span className="h-px flex-1 bg-border" />
                  or sign in to an online account
                  <span className="h-px flex-1 bg-border" />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className={localProfile ? 'mt-4 space-y-3' : 'mt-6 space-y-3'}>
              <Input
                label="User ID or email"
                type="text"
                placeholder="your_id or you@example.com"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                icon={<AtSign size={18} />}
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

              <Button type="submit" fullWidth className="mt-1 py-3.5 text-base" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            {!localProfile?.isGuest && (
              <>
                <div className="mt-4 flex items-center gap-3 text-xs text-muted">
                  <span className="h-px flex-1 bg-border" />
                  or
                  <span className="h-px flex-1 bg-border" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  className="mt-3 py-3.5 text-base"
                  onClick={handleGuest}
                >
                  Continue as guest
                </Button>
              </>
            )}

            <p className="mt-5 text-center text-sm text-muted">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="font-semibold text-foreground underline-offset-2 hover:underline">
                Create one
              </Link>
            </p>

            <p className="mt-2 text-center">
              <Link to="/" className="text-sm text-muted hover:text-foreground">
                ← Back to welcome
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthPageShell>
  )
}
