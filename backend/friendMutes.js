const { query, ensureDb } = require('./db.js')
const { AuthError } = require('./auth.js')

function friendshipPair(userId, friendId) {
  const low = Math.min(userId, friendId)
  const high = Math.max(userId, friendId)
  return { low, high }
}

async function verifyFriendship(userId, friendId) {
  const parsedFriendId = Number(friendId)
  if (!Number.isInteger(parsedFriendId) || parsedFriendId <= 0) {
    throw new AuthError('Invalid friend', 400)
  }

  const { low, high } = friendshipPair(userId, parsedFriendId)
  const result = await query(
    'SELECT 1 FROM friendships WHERE user_low = $1 AND user_high = $2',
    [low, high],
  )

  if (result.rows.length === 0) {
    throw new AuthError('Friend not found', 404)
  }

  return parsedFriendId
}

async function getMutedUserIdSet(userId) {
  await ensureDb()

  const result = await query(
    'SELECT muted_user_id FROM friend_notification_mutes WHERE user_id = $1',
    [userId],
  )

  return new Set(result.rows.map((row) => row.muted_user_id))
}

async function isNotificationMuted(userId, fromUserId) {
  const muted = await getMutedUserIdSet(userId)
  return muted.has(fromUserId)
}

async function setFriendNotificationMute(userId, friendId, muted) {
  await ensureDb()

  const parsedFriendId = await verifyFriendship(userId, friendId)

  if (muted) {
    await query(
      `INSERT INTO friend_notification_mutes (user_id, muted_user_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, muted_user_id) DO NOTHING`,
      [userId, parsedFriendId],
    )
  } else {
    await query(
      'DELETE FROM friend_notification_mutes WHERE user_id = $1 AND muted_user_id = $2',
      [userId, parsedFriendId],
    )
  }

  return { friendId: parsedFriendId, muted: Boolean(muted) }
}

module.exports = {
  getMutedUserIdSet,
  isNotificationMuted,
  setFriendNotificationMute,
}
