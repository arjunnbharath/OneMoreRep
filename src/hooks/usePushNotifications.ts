import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getNotificationPermission,
  getPushSubscription,
  isPushSupported,
  subscribeToPushNotifications,
  syncPushSubscription,
  unsubscribeFromPushNotifications,
} from '../lib/pushNotifications'
import { getVapidPublicKey } from '../lib/api'

export function usePushNotifications() {
  const { token } = useAuth()
  const [permission, setPermission] = useState(getNotificationPermission())
  const [subscribed, setSubscribed] = useState(false)
  const [available, setAvailable] = useState(false)
  const [enabling, setEnabling] = useState(false)
  const [error, setError] = useState('')

  const refreshState = useCallback(async () => {
    setPermission(getNotificationPermission())
    if (!isPushSupported()) {
      setSubscribed(false)
      return
    }
    const subscription = await getPushSubscription()
    setSubscribed(Boolean(subscription))
  }, [])

  useEffect(() => {
    if (!isPushSupported()) {
      setAvailable(false)
      return
    }

    void getVapidPublicKey()
      .then(({ publicKey }) => setAvailable(Boolean(publicKey)))
      .catch(() => setAvailable(false))
  }, [])

  useEffect(() => {
    void refreshState()
  }, [refreshState])

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible') void refreshState()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [refreshState])

  useEffect(() => {
    if (!token || permission !== 'granted' || !subscribed) return
    void syncPushSubscription(token).catch(() => {
      // subscription may fail if SW not ready yet
    })
  }, [token, permission, subscribed])

  const enable = useCallback(async () => {
    if (!token) throw new Error('Not signed in')

    setError('')
    setEnabling(true)
    try {
      await subscribeToPushNotifications(token)
      await refreshState()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to enable notifications'
      setError(message)
      throw err
    } finally {
      setEnabling(false)
    }
  }, [token, refreshState])

  const disable = useCallback(async () => {
    if (!token) throw new Error('Not signed in')

    setError('')
    setEnabling(true)
    try {
      await unsubscribeFromPushNotifications(token)
      await refreshState()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disable notifications'
      setError(message)
      throw err
    } finally {
      setEnabling(false)
    }
  }, [token, refreshState])

  const enabled = permission === 'granted' && subscribed

  return {
    supported: isPushSupported(),
    available,
    permission,
    subscribed,
    enabled,
    enabling,
    error,
    enable,
    disable,
    refreshState,
  }
}
