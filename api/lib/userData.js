const { query, ensureDb } = require('./db.js')
const { AuthError, getUserFromToken } = require('./auth.js')

async function getUserIdFromAuthHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('Not authenticated', 401)
  }
  const token = authHeader.slice(7)
  const user = await getUserFromToken(token)
  return user.id
}

async function getAllUserData(userId) {
  await ensureDb()
  const result = await query(
    'SELECT data_key, data FROM user_data WHERE user_id = $1',
    [userId],
  )
  const store = {}
  for (const row of result.rows) {
    store[row.data_key] = row.data
  }
  return store
}

async function setUserDataEntry(userId, dataKey, data) {
  await ensureDb()
  await query(
    `INSERT INTO user_data (user_id, data_key, data, updated_at)
     VALUES ($1, $2, $3::jsonb, NOW())
     ON CONFLICT (user_id, data_key)
     DO UPDATE SET data = $3::jsonb, updated_at = NOW()`,
    [userId, dataKey, JSON.stringify(data)],
  )
}

module.exports = {
  getUserIdFromAuthHeader,
  getAllUserData,
  setUserDataEntry,
}
