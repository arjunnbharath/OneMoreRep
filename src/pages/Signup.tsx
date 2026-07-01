import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Dumbbell, Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import SelfieCapture from '../components/SelfieCapture'
import { useAuth } from '../context/AuthContext'
import { heroImage } from '../data/mockData'

export default function Signup() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!avatar) {
      setError('Please add a profile selfie to continue')
      return
    }

    setLoading(true)

    try {
      await register(name, email, password, avatar)
      navigate('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-background text-foreground lg:grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={heroImage} alt="" className="h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
        <div className="absolute bottom-16 left-12 right-12 text-white">
          <div className="flex items-center gap-2">
            <Dumbbell size={22} />
            <span className="text-sm font-bold tracking-widest">ONEMOREREP</span>
          </div>
          <h2 className="mt-6 text-4xl font-bold leading-tight">
            Start your<br />
            transformation.
          </h2>
          <p className="mt-4 max-w-md text-lg text-white/70">
            Create an account and track every rep, set, and workout.
          </p>
        </div>
      </div>

      <div className="flex min-h-dvh flex-col justify-center px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Dumbbell size={20} />
            <span className="text-sm font-bold tracking-widest">ONEMOREREP</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Create account</h1>
          <p className="mt-2 text-muted">Join thousands crushing their goals.</p>

          {error && (
            <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200 dark:bg-red-950/50 dark:text-red-400 dark:ring-red-900/50">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <SelfieCapture value={avatar} onChange={setAvatar} />

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
                {showPassword ? 'Hide password' : 'Show password'}
              </button>
            </div>

            <Button type="submit" fullWidth className="mt-2 py-4 text-base" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-foreground underline-offset-2 hover:underline">
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
    </div>
  )
}
