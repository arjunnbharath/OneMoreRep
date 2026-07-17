export function getFriendIdFromPath(pathname: string): number | null {
  const match = pathname.match(/^\/tracker\/friends\/(\d+)\/?$/)
  if (!match) return null

  const id = Number(match[1])
  return Number.isInteger(id) && id > 0 ? id : null
}
