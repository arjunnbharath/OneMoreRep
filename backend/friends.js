const { query, ensureDb } = require('./db.js')
const { AuthError, getUserFromToken } = require('./auth.js')
const { USER_DATA_KEYS } = require('./userDataKeys.js')
const { getMutedUserIdSet } = require('./friendMutes.js')

async function getUserIdFromAuthHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('Not authenticated', 401)
  }
  const token = authHeader.slice(7)
  const user = await getUserFromToken(token)
  return user.id
}

function friendshipPair(userId, friendId) {
  const low = Math.min(userId, friendId)
  const high = Math.max(userId, friendId)
  return { low, high }
}

async function listFriends(userId) {
  await ensureDb()

  const result = await query(
    `SELECT
       u.id,
       u.name,
       u.username,
       u.avatar_url,
       f.created_at
     FROM friendships f
     JOIN users u ON u.id = CASE WHEN f.user_low = $1 THEN f.user_high ELSE f.user_low END
     WHERE f.user_low = $1 OR f.user_high = $1
     ORDER BY f.created_at DESC`,
    [userId],
  )

  const mutedIds = await getMutedUserIdSet(userId)

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    username: row.username,
    avatarUrl: row.avatar_url ?? null,
    friendsSince: row.created_at,
    notificationsMuted: mutedIds.has(row.id),
  }))
}

async function addFriendByUsername(userId, username) {
  await ensureDb()

  const normalized = username.trim().toLowerCase()
  if (!normalized) {
    throw new AuthError('User ID is required', 400)
  }

  const friendResult = await query(
    'SELECT id, name, username, avatar_url FROM users WHERE LOWER(username) = $1',
    [normalized],
  )

  if (friendResult.rows.length === 0) {
    throw new AuthError('No user found with that ID', 404)
  }

  const friend = friendResult.rows[0]
  if (friend.id === userId) {
    throw new AuthError('You cannot add yourself', 400)
  }

  const { low, high } = friendshipPair(userId, friend.id)
  const existing = await query(
    'SELECT 1 FROM friendships WHERE user_low = $1 AND user_high = $2',
    [low, high],
  )

  if (existing.rows.length > 0) {
    throw new AuthError('Already friends with this user', 409)
  }

  await query('INSERT INTO friendships (user_low, user_high) VALUES ($1, $2)', [low, high])

  return {
    id: friend.id,
    name: friend.name,
    username: friend.username,
    avatarUrl: friend.avatar_url ?? null,
  }
}

async function removeFriend(userId, friendId) {
  await ensureDb()

  const parsedFriendId = Number(friendId)
  if (!Number.isInteger(parsedFriendId) || parsedFriendId <= 0) {
    throw new AuthError('Invalid friend', 400)
  }

  const { low, high } = friendshipPair(userId, parsedFriendId)
  const result = await query(
    'DELETE FROM friendships WHERE user_low = $1 AND user_high = $2 RETURNING user_low',
    [low, high],
  )

  if (result.rows.length === 0) {
    throw new AuthError('Friend not found', 404)
  }

  return { success: true }
}

async function getFriendProgress(userId, friendId) {
  await ensureDb()

  const parsedFriendId = Number(friendId)
  if (!Number.isInteger(parsedFriendId) || parsedFriendId <= 0) {
    throw new AuthError('Invalid friend', 400)
  }

  const { low, high } = friendshipPair(userId, parsedFriendId)
  const friendship = await query(
    'SELECT 1 FROM friendships WHERE user_low = $1 AND user_high = $2',
    [low, high],
  )

  if (friendship.rows.length === 0) {
    throw new AuthError('Friend not found', 404)
  }

  const friendResult = await query(
    'SELECT id, name, username, avatar_url FROM users WHERE id = $1',
    [parsedFriendId],
  )

  if (friendResult.rows.length === 0) {
    throw new AuthError('Friend not found', 404)
  }

  const sessionsResult = await query(
    'SELECT data FROM user_data WHERE user_id = $1 AND data_key = $2',
    [parsedFriendId, USER_DATA_KEYS.trackerSessions],
  )

  const sessions =
    sessionsResult.rows.length > 0 && Array.isArray(sessionsResult.rows[0].data)
      ? sessionsResult.rows[0].data
      : []

  const friend = friendResult.rows[0]
  const mutedIds = await getMutedUserIdSet(userId)

  return {
    friend: {
      id: friend.id,
      name: friend.name,
      username: friend.username,
      avatarUrl: friend.avatar_url ?? null,
      notificationsMuted: mutedIds.has(friend.id),
    },
    sessions,
  }
}

async function listFriendsActivity(userId, limit = 20) {
  await ensureDb()

  const friends = await listFriends(userId)
  if (friends.length === 0) return []

  const friendIds = friends.map((friend) => friend.id)
  const sessionsResult = await query(
    `SELECT user_id, data
     FROM user_data
     WHERE user_id = ANY($1::int[])
       AND data_key = $2`,
    [friendIds, USER_DATA_KEYS.trackerSessions],
  )

  const sessionsByFriend = new Map(
    friendIds.map((id) => [id, []]),
  )

  for (const row of sessionsResult.rows) {
    if (Array.isArray(row.data)) {
      sessionsByFriend.set(row.user_id, row.data)
    }
  }

  const items = []

  for (const friend of friends) {
    const sessions = sessionsByFriend.get(friend.id) ?? []
    for (const session of sessions) {
      if (!session?.id) continue
      items.push({
        id: `${friend.id}-${session.id}`,
        friend: {
          id: friend.id,
          name: friend.name,
          username: friend.username,
          avatarUrl: friend.avatarUrl ?? null,
        },
        session,
      })
    }
  }

  return items
    .sort((a, b) => {
      const aTime = new Date(a.session.completedAt ?? a.session.date).getTime()
      const bTime = new Date(b.session.completedAt ?? b.session.date).getTime()
      return bTime - aTime
    })
    .slice(0, limit)
}

module.exports = {
  getUserIdFromAuthHeader,
  listFriends,
  addFriendByUsername,
  removeFriend,
  getFriendProgress,
  listFriendsActivity,
}
