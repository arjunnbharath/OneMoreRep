import { useCallback, useEffect, useState } from 'react'
import {
  getFriendNudges,
  markFriendNudgesRead,
  clearFriendNudges,
  sendFriendNudge,
  type FriendNudge,
  type NudgeType,
} from '../lib/api'
import { useAuth } from '../context/AuthContext'

export function useFriendNudges() {
  const { token } = useAuth()
  const [nudges, setNudges] = useState<FriendNudge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!token) {
      setNudges([])
      setLoading(false)
      return
    }

    setError('')
    try {
      const { nudges: nextNudges } = await getFriendNudges(token)
      setNudges(nextNudges)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load nudges')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void refresh()
    if (!token) return

    const interval = window.setInterval(() => {
      void refresh()
    }, 60_000)

    return () => window.clearInterval(interval)
  }, [refresh, token])

  const sendNudge = useCallback(
    async (friendId: number, type: NudgeType) => {
      if (!token) throw new Error('Not signed in')
      await sendFriendNudge(token, friendId, type)
    },
    [token],
  )

  const markRead = useCallback(
    async (nudgeIds?: number[]) => {
      if (!token) return
      await markFriendNudgesRead(token, nudgeIds)
      setNudges((current) =>
        current.map((nudge) => {
          if (nudgeIds && nudgeIds.length > 0 && !nudgeIds.includes(nudge.id)) return nudge
          return { ...nudge, readAt: nudge.readAt ?? new Date().toISOString() }
        }),
      )
    },
    [token],
  )

  const clearAll = useCallback(async () => {
    if (!token) return
    await clearFriendNudges(token)
    setNudges([])
  }, [token])

  const unreadNudges = nudges.filter((nudge) => !nudge.readAt)

  return {
    nudges,
    unreadNudges,
    loading,
    error,
    refresh,
    sendNudge,
    markRead,
    clearAll,
  }
}
