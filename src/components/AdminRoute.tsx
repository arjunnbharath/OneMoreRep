import { useEffect, useMemo, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import { useAuth } from '../context/AuthContext'
import { getAdminSession } from '../lib/api'

export default function AdminRoute() {
  const { token: adminToken, isLoading: adminLoading, logout: adminLogout } = useAdminAuth()
  const { user, token: userToken, isLoading: userLoading } = useAuth()
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  const apiToken = useMemo(
    () => adminToken ?? (user?.hasAdminAccess ? userToken : null),
    [adminToken, user?.hasAdminAccess, userToken],
  )

  useEffect(() => {
    if (!apiToken) {
      setChecking(false)
      setAuthenticated(false)
      return
    }

    let cancelled = false
    setChecking(true)

    getAdminSession(apiToken)
      .then(() => {
        if (!cancelled) setAuthenticated(true)
      })
      .catch(() => {
        if (!cancelled) {
          if (adminToken) adminLogout()
          setAuthenticated(false)
        }
      })
      .finally(() => {
        if (!cancelled) setChecking(false)
      })

    return () => {
      cancelled = true
    }
  }, [apiToken, adminToken, adminLogout])

  if (adminLoading || userLoading || checking) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f4f5f7] dark:bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    )
  }

  if (!apiToken || !authenticated) {
    if (user) {
      return <Navigate to="/home" replace />
    }
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
