import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const auth = require('../api/lib/auth.js')

export const AuthError = auth.AuthError
export const registerUser = auth.registerUser
export const loginUser = auth.loginUser
export const getUserFromToken = auth.getUserFromToken
export const changeUserPassword = auth.changeUserPassword
export const deleteUser = auth.deleteUser
export const updateUserAvatar = auth.updateUserAvatar
