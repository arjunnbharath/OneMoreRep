const { query, ensureDb } = require('./db.js')
const { AuthError, getUserFromToken } = require('./auth.js')
const { getAllUserData, clearAllUserData } = require('./userData.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

function getAdminCredentials() {
  return {
    username: String(process.env.ADMIN_USERNAME || '').trim().toLowerCase(),
    password: String(process.env.ADMIN_PASSWORD || ''),
  }
}

function isAdminLoginAttempt(identifier) {
  const { username } = getAdminCredentials()
  if (!username) return false
  return String(identifier || '').trim().toLowerCase() === username
}

function signAdminToken(username) {
  return jwt.sign({ role: 'admin', username }, JWT_SECRET, { expiresIn: '8h' })
}

function verifyAdminToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (payload.role !== 'admin' || !payload.username) {
      return null
    }
    return { username: payload.username }
  } catch {
    return null
  }
}

async function loginAdmin(identifier, password) {
  const { username, password: adminPassword } = getAdminCredentials()
  if (!username || !adminPassword) {
    throw new AuthError('Admin access is not configured', 503)
  }

  const normalized = String(identifier || '').trim().toLowerCase()
  if (!normalized || !password) {
    throw new AuthError('User ID and password are required', 400)
  }

  if (normalized !== username || password !== adminPassword) {
    throw new AuthError('Invalid admin credentials', 401)
  }

  return {
    token: signAdminToken(username),
    username,
  }
}

async function requireAdmin(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Not authenticated', 401)
  }
  const token = authHeader.slice(7)

  const admin = verifyAdminToken(token)
  if (admin) {
    return { type: 'admin', username: admin.username }
  }

  try {
    const user = await getUserFromToken(token)
    if (!user.hasAdminAccess) {
      throw new AuthError('Admin access required', 403)
    }
    return {
      type: 'user',
      userId: user.id,
      username: user.username ?? user.email,
    }
  } catch (err) {
    if (err instanceof AuthError) throw err
    throw new AuthError('Not authenticated', 401)
  }
}

function formatAdminUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    username: row.username ?? null,
    createdAt: row.created_at,
    hasAvatar: Boolean(row.avatar_url),
    hasAdminAccess: Boolean(row.is_admin),
  }
}

async function listUsers({ search = '', limit = 50, offset = 0 } = {}) {
  await ensureDb()
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 500)
  const safeOffset = Math.max(Number(offset) || 0, 0)
  const term = String(search).trim().toLowerCase()

  let result
  if (term) {
    const pattern = `%${term}%`
    result = await query(
      `SELECT u.id, u.name, u.email, u.username, u.created_at, u.avatar_url, u.is_admin,
              COUNT(ud.data_key)::int AS data_keys
       FROM users u
       LEFT JOIN user_data ud ON ud.user_id = u.id
       WHERE LOWER(u.email) LIKE $1
          OR LOWER(u.name) LIKE $1
          OR LOWER(COALESCE(u.username, '')) LIKE $1
          OR CAST(u.id AS TEXT) = $2
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT $3 OFFSET $4`,
      [pattern, term, safeLimit, safeOffset],
    )
  } else {
    result = await query(
      `SELECT u.id, u.name, u.email, u.username, u.created_at, u.avatar_url, u.is_admin,
              COUNT(ud.data_key)::int AS data_keys
       FROM users u
       LEFT JOIN user_data ud ON ud.user_id = u.id
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      [safeLimit, safeOffset],
    )
  }

  return result.rows.map((row) => ({
    ...formatAdminUser(row),
    dataKeys: row.data_keys,
  }))
}

async function clearAllUsersData() {
  await ensureDb()
  await query('DELETE FROM user_data')
}

async function deleteAllUsers() {
  await ensureDb()
  const result = await query('DELETE FROM users RETURNING id')
  return result.rowCount ?? 0
}

async function getUserCount() {
  await ensureDb()
  const result = await query('SELECT COUNT(*)::int AS count FROM users')
  return result.rows[0]?.count ?? 0
}

async function getUserById(userId) {
  await ensureDb()
  const result = await query(
    `SELECT id, name, email, username, created_at, avatar_url, is_admin
     FROM users WHERE id = $1`,
    [userId],
  )
  if (result.rows.length === 0) {
    throw new AuthError('User not found', 404)
  }
  return formatAdminUser(result.rows[0])
}

async function getUserDataSummary(userId) {
  await ensureDb()
  const result = await query(
    `SELECT data_key, updated_at,
            pg_column_size(data) AS size_bytes
     FROM user_data
     WHERE user_id = $1
     ORDER BY data_key`,
    [userId],
  )
  return result.rows.map((row) => ({
    key: row.data_key,
    updatedAt: row.updated_at,
    sizeBytes: row.size_bytes,
  }))
}

async function getUserDataForAdmin(userId) {
  await getUserById(userId)
  const data = await getAllUserData(userId)
  return data
}

async function clearUserDataForAdmin(userId) {
  await getUserById(userId)
  await clearAllUserData(userId)
}

async function deleteUserForAdmin(userId) {
  await getUserById(userId)
  await query('DELETE FROM users WHERE id = $1', [userId])
}

async function deleteUsersForAdmin(userIds) {
  await ensureDb()
  const ids = [
    ...new Set(
      (Array.isArray(userIds) ? userIds : [])
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  ]
  if (ids.length === 0) {
    throw new AuthError('No users selected', 400)
  }
  const result = await query('DELETE FROM users WHERE id = ANY($1::int[]) RETURNING id', [ids])
  return result.rowCount ?? 0
}

async function resetUserPasswordForAdmin(userId, newPassword) {
  await getUserById(userId)
  const password = String(newPassword ?? '').trim()
  if (password.length < 6) {
    throw new AuthError('Password must be at least 6 characters', 400)
  }
  const passwordHash = await bcrypt.hash(password, 10)
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId])
}

async function setUserAdminAccess(userId, enabled) {
  await getUserById(userId)
  await query('UPDATE users SET is_admin = $1 WHERE id = $2', [Boolean(enabled), userId])
  return getUserById(userId)
}

module.exports = {
  loginAdmin,
  requireAdmin,
  verifyAdminToken,
  isAdminLoginAttempt,
  listUsers,
  getUserById,
  getUserDataSummary,
  getUserDataForAdmin,
  clearUserDataForAdmin,
  deleteUserForAdmin,
  deleteUsersForAdmin,
  resetUserPasswordForAdmin,
  setUserAdminAccess,
  clearAllUsersData,
  deleteAllUsers,
  getUserCount,
}
