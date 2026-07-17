import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getNotificationPermission, isPushSupported, syncPushSubscription } from '../lib/pushNotifications'

export default function PushNotificationSync() {
  const { token } = useAuth()

  useEffect(() => {
    if (!token || !isPushSupported() || getNotificationPermission() !== 'granted') return
    void syncPushSubscription(token)
  }, [token])

  return null
}
