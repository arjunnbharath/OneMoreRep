import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  getMe,
  login as apiLogin,
  loginWithApple as apiLoginWithApple,
  loginWithGoogle as apiLoginWithGoogle,
  register as apiRegister,
  type User,
} from '../lib/api'

const TOKEN_KEY = 'onemorerep-token'
const USER_KEY = 'onemorerep-user'

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  loginWithGoogle: (credential: string) => Promise<void>
  loginWithApple: (
    idToken: string,
    user?: { name?: { firstName?: string; lastName?: string } },
  ) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? (JSON.parse(stored) as User) : null
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [isLoading, setIsLoading] = useState(true)

  const persist = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }

    getMe(token)
      .then(({ user: verifiedUser }) => {
        setUser(verifiedUser)
        localStorage.setItem(USER_KEY, JSON.stringify(verifiedUser))
      })
      .catch(() => logout())
      .finally(() => setIsLoading(false))
  }, [token, logout])

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiLogin(email, password)
      persist(data.token, data.user)
    },
    [persist],
  )

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await apiRegister(name, email, password)
      persist(data.token, data.user)
    },
    [persist],
  )

  const loginWithGoogle = useCallback(
    async (credential: string) => {
      const data = await apiLoginWithGoogle(credential)
      persist(data.token, data.user)
    },
    [persist],
  )

  const loginWithApple = useCallback(
    async (
      idToken: string,
      appleUser?: { name?: { firstName?: string; lastName?: string } },
    ) => {
      const data = await apiLoginWithApple(idToken, appleUser)
      persist(data.token, data.user)
    },
    [persist],
  )

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      register,
      loginWithGoogle,
      loginWithApple,
      logout,
    }),
    [user, token, isLoading, login, register, loginWithGoogle, loginWithApple, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
