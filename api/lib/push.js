const webpush = require('web-push')
const { query, ensureDb } = require('./db.js')
const { AuthError } = require('./auth.js')

let vapidConfigured = false

function ensureVapid() {
  if (vapidConfigured) return true

  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:support@onemorerep.app'

  if (!publicKey || !privateKey) return false

  webpush.setVapidDetails(subject, publicKey, privateKey)
  vapidConfigured = true
  return true
}

function getVapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY || null
}

async function saveSubscription(userId, subscription) {
  await ensureDb()

  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    throw new AuthError('Invalid subscription', 400)
  }

  await query(
    `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (endpoint) DO UPDATE SET
       user_id = EXCLUDED.user_id,
       p256dh = EXCLUDED.p256dh,
       auth = EXCLUDED.auth`,
    [userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth],
  )

  return { success: true }
}

async function deleteSubscription(userId, endpoint) {
  await ensureDb()

  if (!endpoint) {
    throw new AuthError('endpoint is required', 400)
  }

  await query('DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2', [
    userId,
    endpoint,
  ])

  return { success: true }
}

async function sendPushToUser(userId, payload) {
  if (!ensureVapid()) return { sent: 0 }

  await ensureDb()

  const result = await query(
    'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1',
    [userId],
  )

  let sent = 0
  const body = JSON.stringify(payload)

  for (const row of result.rows) {
    try {
      await webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: { p256dh: row.p256dh, auth: row.auth },
        },
        body,
      )
      sent++
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        await query('DELETE FROM push_subscriptions WHERE endpoint = $1', [row.endpoint])
      } else {
        console.error('webpush error:', err)
      }
    }
  }

  return { sent }
}

module.exports = {
  getVapidPublicKey,
  saveSubscription,
  deleteSubscription,
  sendPushToUser,
}
