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
import { clearLocalUserData, clearUserDataCache, flushSyncQueue } from '../lib/userDataSync'
import { markPendingTour } from '../lib/tourSession'
import {
  createGuestUser,
  createLocalUser,
  isLocalToken,
  LOCAL_TOKEN,
  readLocalProfile,
  removeLocalProfile,
  writeLocalProfile,
} from '../lib/localAccount'

const TOKEN_KEY = 'onemorerep-token'
const USER_KEY = 'onemorerep-user'

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  /** True when the signed-in account stores everything on this device only. */
  isLocal: boolean
  /** A local account saved on this device (if any), even when signed out. */
  localProfile: User | null
  login: (identifier: string, password: string) => Promise<void>
  establishSession: (token: string, user: User) => void
  register: (name: string, username: string, email: string, password: string) => Promise<void>
  registerLocal: (name: string) => void
  continueAsGuest: () => void
  resumeLocalSession: () => void
  logout: () => void
  refreshUser: () => Promise<void>
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
  const [localProfile, setLocalProfile] = useState<User | null>(() => readLocalProfile())
  const isLocal = isLocalToken(token)

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

  const refreshUser = useCallback(async () => {
    if (!token || isLocalToken(token)) return
    const { user: verifiedUser } = await getMe(token)
    setUser(verifiedUser)
    localStorage.setItem(USER_KEY, JSON.stringify(verifiedUser))
  }, [token])

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }

    if (isLocalToken(token)) {
      // Local accounts have nothing to verify against the server.
      const stored = readLocalProfile()
      if (stored) {
        setUser(stored)
        localStorage.setItem(USER_KEY, JSON.stringify(stored))
      } else {
        logout()
      }
      setIsLoading(false)
      return
    }

    getMe(token)
      .then(({ user: verifiedUser }) => {
        setUser(verifiedUser)
        localStorage.setItem(USER_KEY, JSON.stringify(verifiedUser))
        void flushSyncQueue(verifiedUser.id, token)
      })
      .catch(() => logout())
      .finally(() => setIsLoading(false))
  }, [token, logout])

  useEffect(() => {
    function handleOnline() {
      if (!user?.id || !token) return
      void flushSyncQueue(user.id, token)
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [user?.id, token])

  useEffect(() => {
    if (!token || isLocalToken(token)) return

    function handleFocus() {
      void refreshUser().catch(() => {
        // Ignore transient refresh failures; session validation still runs on navigation.
      })
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [token, refreshUser])

  const login = useCallback(
    async (identifier: string, password: string) => {
      const data = await apiLogin(identifier, password)
      if (data.role !== 'user') {
        throw new Error('Invalid credentials')
      }
      persist(data.token, data.user)
    },
    [persist],
  )

  const establishSession = useCallback(
    (newToken: string, newUser: User) => {
      persist(newToken, newUser)
    },
    [persist],
  )

  const register = useCallback(
    async (name: string, username: string, email: string, password: string) => {
      const data = await apiRegister(name, username, email, password)
      persist(data.token, data.user)
      markPendingTour()
    },
    [persist],
  )

  const registerLocal = useCallback(
    (name: string) => {
      const trimmed = name.trim()
      if (!trimmed) throw new Error('Please enter your name')
      const localUser = createLocalUser(trimmed)
      setLocalProfile(localUser)
      persist(LOCAL_TOKEN, localUser)
      markPendingTour()
    },
    [persist],
  )

  const continueAsGuest = useCallback(() => {
    const alreadySaved = readLocalProfile()
    const guest = createGuestUser()
    setLocalProfile(guest)
    persist(LOCAL_TOKEN, guest)
    if (!alreadySaved) markPendingTour()
  }, [persist])

  const resumeLocalSession = useCallback(() => {
    const stored = readLocalProfile()
    if (!stored) throw new Error('No account is saved on this device')
    persist(LOCAL_TOKEN, stored)
  }, [persist])

  const deleteAccount = useCallback(async () => {
    if (!token) throw new Error('Not authenticated')
    if (isLocalToken(token)) {
      if (user?.id !== undefined) clearLocalUserData(user.id)
      removeLocalProfile()
      setLocalProfile(null)
      logout()
      return
    }
    await apiDeleteAccount(token)
    logout()
  }, [token, user?.id, logout])

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!token) throw new Error('Not authenticated')
      if (isLocalToken(token)) {
        throw new Error('Accounts stored on this device do not use a password')
      }
      await apiChangePassword(token, currentPassword, newPassword)
    },
    [token],
  )

  const updateAvatar = useCallback(
    async (avatar: string | null) => {
      if (!token) throw new Error('Not authenticated')
      if (isLocalToken(token)) {
        if (!user) throw new Error('Not authenticated')
        const updatedUser: User = { ...user, avatarUrl: avatar }
        writeLocalProfile(updatedUser)
        setLocalProfile(updatedUser)
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
        setUser(updatedUser)
        return
      }
      const { user: updatedUser } = await apiUpdateAvatar(token, avatar)
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
      setUser(updatedUser)
    },
    [token, user],
  )

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isLocal,
      localProfile,
      login,
      establishSession,
      register,
      registerLocal,
      continueAsGuest,
      resumeLocalSession,
      logout,
      refreshUser,
      deleteAccount,
      changePassword,
      updateAvatar,
    }),
    [
      user,
      token,
      isLoading,
      isLocal,
      localProfile,
      login,
      establishSession,
      register,
      registerLocal,
      continueAsGuest,
      resumeLocalSession,
      logout,
      refreshUser,
      deleteAccount,
      changePassword,
      updateAvatar,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
