import { useCallback, useEffect, useState } from 'react'
import {
  addFriend as apiAddFriend,
  getFriendProgress,
  getFriends,
  removeFriend as apiRemoveFriend,
  type FriendUser,
} from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { WorkoutSession } from '../types/tracker'

export function useFriends() {
  const { token } = useAuth()
  const [friends, setFriends] = useState<FriendUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!token) {
      setFriends([])
      setLoading(false)
      return
    }

    setError('')
    try {
      const { friends: nextFriends } = await getFriends(token)
      setFriends(nextFriends)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friends')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const addFriend = useCallback(
    async (username: string) => {
      if (!token) throw new Error('Not signed in')
      const { friend } = await apiAddFriend(token, username)
      setFriends((current) => {
        if (current.some((item) => item.id === friend.id)) return current
        return [friend, ...current]
      })
      return friend
    },
    [token],
  )

  const removeFriend = useCallback(
    async (friendId: number) => {
      if (!token) throw new Error('Not signed in')
      await apiRemoveFriend(token, friendId)
      setFriends((current) => current.filter((friend) => friend.id !== friendId))
    },
    [token],
  )

  const loadFriendProgress = useCallback(
    async (friendId: number): Promise<{ friend: FriendUser; sessions: WorkoutSession[] }> => {
      if (!token) throw new Error('Not signed in')
      return getFriendProgress(token, friendId)
    },
    [token],
  )

  return {
    friends,
    loading,
    error,
    refresh,
    addFriend,
    removeFriend,
    loadFriendProgress,
  }
}
