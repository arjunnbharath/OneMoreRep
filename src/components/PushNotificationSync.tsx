import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getNotificationPermission, isPushSupported, syncPushSubscription } from '../lib/pushNotifications'

export default function PushNotificationSync() {
  const { token, isLocal } = useAuth()

  useEffect(() => {
    if (!token || isLocal || !isPushSupported() || getNotificationPermission() !== 'granted') return
    void syncPushSubscription(token)
  }, [token, isLocal])

  return null
}
