import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getNotificationPermission,
  isPushSupported,
  subscribeToPushNotifications,
  syncPushSubscription,
} from '../lib/pushNotifications'
import { getVapidPublicKey } from '../lib/api'

export function usePushNotifications() {
  const { token } = useAuth()
  const [permission, setPermission] = useState(getNotificationPermission())
  const [available, setAvailable] = useState(false)
  const [enabling, setEnabling] = useState(false)
  const [error, setError] = useState('')

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
    if (!token || permission !== 'granted') return
    void syncPushSubscription(token).catch(() => {
      // subscription may fail if SW not ready yet
    })
  }, [token, permission])

  const enable = useCallback(async () => {
    if (!token) throw new Error('Not signed in')

    setError('')
    setEnabling(true)
    try {
      await subscribeToPushNotifications(token)
      setPermission(getNotificationPermission())
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to enable notifications'
      setError(message)
      throw err
    } finally {
      setEnabling(false)
    }
  }, [token])

  return {
    supported: isPushSupported(),
    available,
    permission,
    enabling,
    error,
    enable,
  }
}
