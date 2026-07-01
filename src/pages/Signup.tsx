import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import { useAuth } from '../context/AuthContext'
import { heroImage } from '../data/mockData'

export default function Signup() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [name, setName] = useState('')
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
      await register(name, email, password)
      navigate('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={heroImage} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute bottom-16 left-12 right-12 text-white">
          <h2 className="text-4xl font-bold leading-tight">Start your journey</h2>
          <p className="mt-3 max-w-md text-lg text-white/80">
            Create an account and track every rep, set, and workout.
          </p>
        </div>
      </div>

      <div className="flex min-h-dvh flex-col justify-center bg-white px-6 py-10 dark:bg-neutral-950 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <p className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
            OneMoreRep
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Create account</h1>
          <p className="mt-2 text-neutral-500">Sign up to get started.</p>

          {error && (
            <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
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
                className="mt-2 flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-black dark:hover:text-white"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                {showPassword ? 'Hide password' : 'Show password'}
              </button>
            </div>

            <Button type="submit" fullWidth className="mt-2 py-4 text-base" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-black hover:underline dark:text-white">
              Log in
            </Link>
          </p>

          <p className="mt-4 text-center">
            <Link to="/" className="text-sm text-neutral-400 hover:text-neutral-600">
              ← Back to welcome
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
