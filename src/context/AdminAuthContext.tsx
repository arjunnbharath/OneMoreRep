import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { adminLogin, getAdminSession } from '../lib/api'

const STORAGE_KEY = 'onemorerep_admin_token'
const USERNAME_KEY = 'onemorerep_admin_username'

type AdminAuthContextValue = {
  token: string | null
  username: string | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  establishSession: (token: string, username: string) => void
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(STORAGE_KEY))
  const [username, setUsername] = useState<string | null>(() => sessionStorage.getItem(USERNAME_KEY))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    getAdminSession(token)
      .then(({ username: name }) => {
        if (cancelled) return
        setUsername(name)
        sessionStorage.setItem(USERNAME_KEY, name)
      })
      .catch(() => {
        if (cancelled) return
        sessionStorage.removeItem(STORAGE_KEY)
        sessionStorage.removeItem(USERNAME_KEY)
        setToken(null)
        setUsername(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const establishSession = useCallback((nextToken: string, nextUsername: string) => {
    sessionStorage.setItem(STORAGE_KEY, nextToken)
    sessionStorage.setItem(USERNAME_KEY, nextUsername)
    setToken(nextToken)
    setUsername(nextUsername)
    setIsLoading(false)
  }, [])

  const login = useCallback(async (userId: string, password: string) => {
    const { token: nextToken, username: nextUsername } = await adminLogin(userId, password)
    establishSession(nextToken, nextUsername)
  }, [establishSession])

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(USERNAME_KEY)
    setToken(null)
    setUsername(null)
  }, [])

  const value = useMemo(
    () => ({ token, username, isLoading, login, establishSession, logout }),
    [token, username, isLoading, login, establishSession, logout],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}
