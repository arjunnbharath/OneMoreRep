const { query, ensureDb } = require('./db.js')
const { AuthError } = require('./auth.js')
const { sendPushToUser } = require('./push.js')
const { isNotificationMuted } = require('./friendMutes.js')

const NUDGE_TYPES = ['wave', 'workout_reminder', 'cheer_streak', 'rest_day']

const NUDGE_COPY = {
  wave: {
    title: (name) => `${name} waved at you`,
    body: 'Wave back or check their progress.',
  },
  workout_reminder: {
    title: (name) => `${name} wants to workout`,
    body: 'Time to train together!',
  },
  cheer_streak: {
    title: (name) => `${name} cheered you on`,
    body: 'Nice streak — keep it going!',
  },
  rest_day: {
    title: (name) => `${name} checked in`,
    body: 'Hope you are resting well. Ready when you are!',
  },
}

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

async function sendNudge(fromUserId, friendId, nudgeType) {
  await ensureDb()

  if (!NUDGE_TYPES.includes(nudgeType)) {
    throw new AuthError('Invalid nudge type', 400)
  }

  const toUserId = await verifyFriendship(fromUserId, friendId)

  const insert = await query(
    `INSERT INTO friend_nudges (from_user_id, to_user_id, nudge_type)
     VALUES ($1, $2, $3)
     RETURNING id, nudge_type, created_at`,
    [fromUserId, toUserId, nudgeType],
  )

  const senderResult = await query('SELECT name FROM users WHERE id = $1', [fromUserId])
  const senderName = senderResult.rows[0]?.name || 'Your friend'
  const copy = NUDGE_COPY[nudgeType]

  const title = copy.title(senderName)
  const body = copy.body

  try {
    const muted = await isNotificationMuted(toUserId, fromUserId)
    if (!muted) {
      await sendPushToUser(toUserId, { title, body, url: '/tracker' })
    }
  } catch (err) {
    console.error('Push notification failed:', err)
  }

  return {
    id: insert.rows[0].id,
    type: insert.rows[0].nudge_type,
    createdAt: insert.rows[0].created_at,
  }
}

async function listNudges(userId) {
  await ensureDb()

  const result = await query(
    `SELECT
       n.id,
       n.nudge_type,
       n.read_at,
       n.created_at,
       u.id AS from_id,
       u.name AS from_name,
       u.username AS from_username,
       u.avatar_url AS from_avatar_url
     FROM friend_nudges n
     JOIN users u ON u.id = n.from_user_id
     WHERE n.to_user_id = $1
       AND n.created_at > NOW() - INTERVAL '7 days'
     ORDER BY n.created_at DESC
     LIMIT 50`,
    [userId],
  )

  return result.rows.map((row) => ({
    id: row.id,
    type: row.nudge_type,
    readAt: row.read_at,
    createdAt: row.created_at,
    fromUser: {
      id: row.from_id,
      name: row.from_name,
      username: row.from_username,
      avatarUrl: row.from_avatar_url ?? null,
    },
  }))
}

async function markNudgesRead(userId, nudgeIds) {
  await ensureDb()

  if (!Array.isArray(nudgeIds) || nudgeIds.length === 0) {
    await query(
      `UPDATE friend_nudges SET read_at = NOW()
       WHERE to_user_id = $1 AND read_at IS NULL`,
      [userId],
    )
    return { success: true }
  }

  const ids = nudgeIds.map(Number).filter((id) => Number.isInteger(id) && id > 0)
  if (ids.length === 0) {
    throw new AuthError('Invalid nudge ids', 400)
  }

  await query(
    `UPDATE friend_nudges SET read_at = NOW()
     WHERE to_user_id = $1 AND id = ANY($2::int[]) AND read_at IS NULL`,
    [userId, ids],
  )

  return { success: true }
}

module.exports = {
  sendNudge,
  listNudges,
  markNudgesRead,
}
