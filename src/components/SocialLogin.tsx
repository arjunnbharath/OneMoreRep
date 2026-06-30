import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOAuthConfig } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { AppleIcon } from './SocialAuthIcons'

function loadScript(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.id = id
    script.src = src
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

interface SocialLoginProps {
  onError?: (message: string) => void
}

export default function SocialLogin({ onError }: SocialLoginProps) {
  const navigate = useNavigate()
  const { loginWithGoogle, loginWithApple } = useAuth()
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const [googleClientId, setGoogleClientId] = useState(
    import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  )
  const [appleClientId, setAppleClientId] = useState(import.meta.env.VITE_APPLE_CLIENT_ID || '')
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null)
  const [appleReady, setAppleReady] = useState(false)

  useEffect(() => {
    getOAuthConfig()
      .then((config) => {
        if (config.googleClientId) setGoogleClientId(config.googleClientId)
        if (config.appleClientId) setAppleClientId(config.appleClientId)
      })
      .catch(() => {
        // Fall back to Vite env vars
      })
  }, [])

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return

    let cancelled = false

    loadScript('https://accounts.google.com/gsi/client', 'google-gsi')
      .then(() => {
        if (cancelled || !googleButtonRef.current || !window.google) return

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            setLoading('google')
            try {
              await loginWithGoogle(response.credential)
              navigate('/home')
            } catch (err) {
              onError?.(err instanceof Error ? err.message : 'Google sign-in failed')
            } finally {
              setLoading(null)
            }
          },
        })

        googleButtonRef.current.innerHTML = ''
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width: googleButtonRef.current.offsetWidth || 280,
        })
      })
      .catch(() => {
        onError?.('Could not load Google sign-in')
      })

    return () => {
      cancelled = true
    }
  }, [googleClientId, loginWithGoogle, navigate, onError])

  useEffect(() => {
    if (!appleClientId) return

    let cancelled = false

    loadScript(
      'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js',
      'apple-auth',
    )
      .then(() => {
        if (cancelled || !window.AppleID) return

        window.AppleID.auth.init({
          clientId: appleClientId,
          scope: 'name email',
          redirectURI: window.location.origin,
          usePopup: true,
        })
        setAppleReady(true)
      })
      .catch(() => {
        onError?.('Could not load Apple sign-in')
      })

    return () => {
      cancelled = true
    }
  }, [appleClientId, onError])

  async function handleAppleSignIn() {
    if (!window.AppleID || !appleReady) {
      onError?.('Apple sign-in is not ready yet')
      return
    }

    setLoading('apple')
    try {
      const response = await window.AppleID.auth.signIn()
      await loginWithApple(response.authorization.id_token, response.user)
      navigate('/home')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Apple sign-in failed'
      if (!message.toLowerCase().includes('popup closed')) {
        onError?.(message)
      }
    } finally {
      setLoading(null)
    }
  }

  if (!googleClientId && !appleClientId) {
    return (
      <p className="text-center text-xs text-neutral-400">
        Add Google and Apple client IDs in your environment to enable social sign-in.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {googleClientId && (
        <div className="relative min-h-[48px] flex-1 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div
            ref={googleButtonRef}
            className="absolute inset-0 flex items-center justify-center [&>div]:!w-full"
          />
          {loading === 'google' && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-sm font-medium">
              Signing in...
            </div>
          )}
        </div>
      )}

      {appleClientId && (
        <button
          type="button"
          onClick={handleAppleSignIn}
          disabled={!appleReady || loading !== null}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-3.5 text-sm font-semibold transition hover:bg-neutral-50 disabled:opacity-50"
        >
          <AppleIcon />
          {loading === 'apple' ? 'Signing in...' : 'Apple'}
        </button>
      )}
    </div>
  )
}
