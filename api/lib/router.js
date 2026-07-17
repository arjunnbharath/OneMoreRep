const { ensureDb } = require('./db.js')
const {
  AuthError,
  registerUser,
  loginUser,
  getUserFromToken,
  changeUserPassword,
  deleteUser,
  updateUserAvatar,
} = require('./auth.js')
const {
  getUserIdFromAuthHeader,
  getAllUserData,
  setUserDataEntry,
  clearAllUserData,
} = require('./userData.js')
const {
  listFriends,
  addFriendByUsername,
  removeFriend,
  getFriendProgress,
} = require('./friends.js')

function parseBody(req) {
  if (!req.body) return {}
  return typeof req.body === 'string' ? JSON.parse(req.body) : req.body
}

function getRoute(req) {
  const path = req.query.path
  if (!path) return ''
  return Array.isArray(path) ? path.join('/') : String(path)
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}

function sendAuthError(res, err) {
  if (err instanceof AuthError) {
    return res.status(err.status).json({ error: err.message })
  }
  return null
}

async function handleHealth(_req, res) {
  await ensureDb()
  return res.status(200).json({ ok: true, database: 'connected' })
}

async function handleAuthLogin(req, res) {
  const body = parseBody(req)
  const { identifier, email, password } = body
  const data = await loginUser(identifier || email || '', password || '')
  return res.status(200).json(data)
}

async function handleAuthRegister(req, res) {
  const body = parseBody(req)
  const { name, username, email, password, avatar } = body
  const data = await registerUser(
    name || '',
    username || '',
    email || '',
    password || '',
    avatar,
  )
  return res.status(201).json(data)
}

async function handleAuthMe(req, res) {
  const token = getBearerToken(req)
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  const user = await getUserFromToken(token)
  return res.status(200).json({ user })
}

async function handleAuthAvatar(req, res) {
  const token = getBearerToken(req)
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  const { avatar } = parseBody(req)
  const user = await updateUserAvatar(token, avatar)
  return res.status(200).json({ user })
}

async function handleAuthDelete(req, res) {
  const token = getBearerToken(req)
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  await deleteUser(token)
  return res.status(200).json({ success: true })
}

async function handleAuthChangePassword(req, res) {
  const token = getBearerToken(req)
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  const { currentPassword, newPassword } = parseBody(req)
  await changeUserPassword(token, currentPassword, newPassword)
  return res.status(200).json({ success: true })
}

async function handleUserData(req, res) {
  const userId = await getUserIdFromAuthHeader(req.headers.authorization)

  if (req.method === 'GET') {
    const data = await getAllUserData(userId)
    return res.status(200).json({ data })
  }

  if (req.method === 'PUT') {
    const { key, data } = parseBody(req)
    if (!key || typeof key !== 'string') {
      return res.status(400).json({ error: 'key is required' })
    }
    if (key.length > 64) {
      return res.status(400).json({ error: 'Invalid key' })
    }
    await setUserDataEntry(userId, key, data ?? null)
    return res.status(200).json({ success: true })
  }

  if (req.method === 'DELETE') {
    await clearAllUserData(userId)
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

async function handleFriends(req, res) {
  const userId = await getUserIdFromAuthHeader(req.headers.authorization)

  if (req.method === 'GET') {
    const friends = await listFriends(userId)
    return res.status(200).json({ friends })
  }

  if (req.method === 'POST') {
    const { username } = parseBody(req)
    const friend = await addFriendByUsername(userId, username || '')
    return res.status(201).json({ friend })
  }

  if (req.method === 'DELETE') {
    const body = parseBody(req)
    const friendId = req.query?.friendId ?? body?.friendId
    await removeFriend(userId, friendId)
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

async function handleFriendsProgress(req, res) {
  const userId = await getUserIdFromAuthHeader(req.headers.authorization)
  const friendId = req.query?.friendId
  const data = await getFriendProgress(userId, friendId)
  return res.status(200).json(data)
}

const routes = [
  { route: 'health', method: 'GET', handler: handleHealth },
  { route: 'auth/login', method: 'POST', handler: handleAuthLogin },
  { route: 'auth/register', method: 'POST', handler: handleAuthRegister },
  { route: 'auth/me', method: 'GET', handler: handleAuthMe },
  { route: 'auth/avatar', method: 'POST', handler: handleAuthAvatar },
  { route: 'auth/delete', method: 'DELETE', handler: handleAuthDelete },
  { route: 'auth/change-password', method: 'POST', handler: handleAuthChangePassword },
  { route: 'user-data', method: 'GET', handler: handleUserData },
  { route: 'user-data', method: 'PUT', handler: handleUserData },
  { route: 'user-data', method: 'DELETE', handler: handleUserData },
  { route: 'friends', method: 'GET', handler: handleFriends },
  { route: 'friends', method: 'POST', handler: handleFriends },
  { route: 'friends', method: 'DELETE', handler: handleFriends },
  { route: 'friends/progress', method: 'GET', handler: handleFriendsProgress },
]

async function handleRequest(req, res) {
  const route = getRoute(req)
  const match = routes.find((entry) => entry.route === route && entry.method === req.method)

  if (!match) {
    return res.status(404).json({ error: 'Not found' })
  }

  try {
    return await match.handler(req, res)
  } catch (err) {
    const authResponse = sendAuthError(res, err)
    if (authResponse) return authResponse

    console.error(`API error [${req.method} /api/${route}]:`, err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return res.status(500).json({ error: message })
  }
}

module.exports = { handleRequest }
