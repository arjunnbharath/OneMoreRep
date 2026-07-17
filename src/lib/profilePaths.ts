export type ProfileView = 'main' | 'settings' | 'account' | 'data' | 'permissions'

export const PROFILE_PATHS = {
  main: '/profile',
  settings: '/profile/settings',
  account: '/profile/settings/account',
  data: '/profile/settings/data',
  permissions: '/profile/settings/permissions',
} as const

export function getProfileView(pathname: string): ProfileView {
  if (pathname === PROFILE_PATHS.account) return 'account'
  if (pathname === PROFILE_PATHS.data) return 'data'
  if (pathname === PROFILE_PATHS.permissions) return 'permissions'
  if (pathname === PROFILE_PATHS.settings) return 'settings'
  return 'main'
}

export function isProfileSubPath(pathname: string) {
  return pathname.startsWith('/profile/') && pathname !== PROFILE_PATHS.main
}
