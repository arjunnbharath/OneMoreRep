import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { changePassword as apiChangePassword, deleteAccount as apiDeleteAccount, getMe, login as apiLogin, register as apiRegister, updateAvatar as apiUpdateAvatar, type User } from '../lib/api'
import { clearUserDataCache } from '../lib/userDataSync'

const TOKEN_KEY = 'onemorerep-token'
const USER_KEY = 'onemorerep-user'

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (identifier: string, password: string) => Promise<void>
  register: (name: string, username: string, email: string, password: string) => Promise<void>
  logout: () => void
  deleteAccount: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  updateAvatar: (avatar: string | null) => Promise<void>
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
    clearUserDataCache()
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    clearUserDataCache()
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
    async (identifier: string, password: string) => {
      const data = await apiLogin(identifier, password)
      persist(data.token, data.user)
    },
    [persist],
  )

  const register = useCallback(
    async (name: string, username: string, email: string, password: string) => {
      const data = await apiRegister(name, username, email, password)
      persist(data.token, data.user)
    },
    [persist],
  )

  const deleteAccount = useCallback(async () => {
    if (!token) throw new Error('Not authenticated')
    await apiDeleteAccount(token)
    logout()
  }, [token, logout])

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!token) throw new Error('Not authenticated')
      await apiChangePassword(token, currentPassword, newPassword)
    },
    [token],
  )

  const updateAvatar = useCallback(
    async (avatar: string | null) => {
      if (!token) throw new Error('Not authenticated')
      const { user: updatedUser } = await apiUpdateAvatar(token, avatar)
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
      setUser(updatedUser)
    },
    [token],
  )

  const value = useMemo(
    () => ({ user, token, isLoading, login, register, logout, deleteAccount, changePassword, updateAvatar }),
    [user, token, isLoading, login, register, logout, deleteAccount, changePassword, updateAvatar],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
