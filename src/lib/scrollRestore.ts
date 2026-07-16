const PREFIX = 'onemorerep-scroll:'

export function scrollStorageKey(pathname: string, search = '', hash = '') {
  return `${PREFIX}${pathname}${search}${hash}`
}

export function saveScrollPosition(pathname: string, search = '', hash = '') {
  sessionStorage.setItem(scrollStorageKey(pathname, search, hash), String(window.scrollY))
}

export function restoreScrollPosition(pathname: string, search = '', hash = '') {
  const key = scrollStorageKey(pathname, search, hash)
  const value = sessionStorage.getItem(key)
  if (value === null) return false

  sessionStorage.removeItem(key)
  const y = Number.parseInt(value, 10)
  if (Number.isNaN(y)) return false

  requestAnimationFrame(() => {
    window.scrollTo(0, y)
  })
  return true
}
