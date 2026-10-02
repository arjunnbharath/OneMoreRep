import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  AtSign,
  Check,
  Cloud,
  Dumbbell,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Smartphone,
  User,
} from 'lucide-react'
import AuthPageShell from '../components/AuthPageShell'
import AuthVideoBackground from '../components/AuthVideoBackground'
import Button from '../components/Button'
import GeminiSelectCard from '../components/ui/GeminiSelectCard'
import Input from '../components/Input'
import { useAuth } from '../context/AuthContext'
import type { StorageMode } from '../lib/localAccount'

const STORAGE_OPTIONS: {
  id: StorageMode
  title: string
  description: string
  icon: typeof Smartphone
  points: string[]
}[] = [
  {
    id: 'local',
    title: 'On this device',
    description: 'Everything stays on your phone. No email or password needed.',
    icon: Smartphone,
    points: ['Works fully offline', 'Nothing is uploaded', 'No Friends feature'],
  },
  {
    id: 'cloud',
    title: 'Online account',
    description: 'Sync across devices and train with friends.',
    icon: Cloud,
    points: ['Backed up online', 'Sign in anywhere', 'Add friends & compare progress'],
  },
]

export default function Signup() {
  const navigate = useNavigate()
  const { user, isLoading, register, registerLocal } = useAuth()
  const [storageMode, setStorageMode] = useState<StorageMode | null>(null)
  const [step, setStep] = useState<'storage' | 'details'>('storage')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isLocal = storageMode === 'local'

  function handleContinue() {
    if (!storageMode) {
      setError('Choose where you want your data to be saved')
      return
    }
    setError('')
    setStep('details')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLocal) {
        registerLocal(name)
      } else {
        await register(name, username, email, password)
      }
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
            Keep your data on your phone, or create an online account to sync and share progress
            with training partners.
          </p>
        </div>
      </div>

      <div className="relative flex min-h-dvh flex-col justify-center px-6 pb-[max(3rem,var(--sab))] pt-[max(3rem,var(--sat))] sm:px-10 lg:px-16 lg:py-12">
        <AuthVideoBackground variant="auth" className="lg:hidden" />
        <div className="relative z-10 mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Dumbbell size={18} />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">OneMoreRep</span>
          </div>

          {step === 'storage' ? (
            <>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Where should your data live?
              </h1>
              <p className="mt-2 text-sm text-muted">
                Choose how OneMoreRep saves your workouts, plans, and calories. You can&apos;t change
                this later without creating a new account.
              </p>

              {error && (
                <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200 dark:bg-red-950/50 dark:text-red-400 dark:ring-red-900/50">
                  {error}
                </div>
              )}

              <div className="mt-8 space-y-3" role="radiogroup" aria-label="Data storage">
                {STORAGE_OPTIONS.map((option) => {
                  const Icon = option.icon
                  const selected = storageMode === option.id
                  return (
                    <GeminiSelectCard
                      key={option.id}
                      selected={selected}
                      onClick={() => {
                        setStorageMode(option.id)
                        setError('')
                      }}
                      innerClassName="p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={[
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition',
                            selected
                              ? 'bg-foreground text-background ring-foreground'
                              : 'bg-background text-muted ring-border',
                          ].join(' ')}
                        >
                          <Icon size={18} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold">{option.title}</p>
                            <span
                              aria-hidden="true"
                              className={[
                                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-1 transition',
                                selected
                                  ? 'bg-foreground text-background ring-foreground'
                                  : 'ring-border',
                              ].join(' ')}
                            >
                              {selected && <Check size={12} strokeWidth={3} />}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-muted">{option.description}</p>
                          <ul className="mt-2 space-y-1">
                            {option.points.map((point) => (
                              <li key={point} className="flex items-center gap-1.5 text-xs text-muted">
                                <span className="h-1 w-1 shrink-0 rounded-full bg-muted" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </GeminiSelectCard>
                  )
                })}
              </div>

              <Button
                type="button"
                fullWidth
                className="mt-6 py-3.5"
                onClick={handleContinue}
                disabled={!storageMode}
              >
                Continue
              </Button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setError('')
                  setStep('storage')
                }}
                className="mb-4 flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground"
              >
                <ArrowLeft size={14} />
                {isLocal ? 'Saving on this device' : 'Online account'} · Change
              </button>

              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {isLocal ? 'What should we call you?' : 'Create account'}
              </h1>
              <p className="mt-2 text-sm text-muted">
                {isLocal
                  ? 'Just a name. Your data never leaves this phone.'
                  : 'Choose a user ID, name, email, and password.'}
              </p>

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
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={<User size={18} />}
                />

                {!isLocal && (
                  <>
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
                  </>
                )}

                {isLocal && (
                  <p className="rounded-xl bg-surface px-4 py-3 text-xs text-muted ring-1 ring-border">
                    Clearing the app&apos;s storage or uninstalling will erase your data. Use
                    Settings → Data → Export to keep a backup.
                  </p>
                )}

                <Button type="submit" fullWidth className="mt-2 py-3.5" disabled={loading}>
                  {loading
                    ? isLocal
                      ? 'Setting up…'
                      : 'Creating account…'
                    : isLocal
                      ? 'Start training'
                      : 'Create account'}
                </Button>
              </form>
            </>
          )}

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
