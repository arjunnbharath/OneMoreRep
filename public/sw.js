const CACHE_NAME = 'onemorerep-v3'
const PRECACHE_URLS = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  const isAppShell =
    url.origin === self.location.origin &&
    (url.pathname === '/' || url.pathname === '/index.html' || url.pathname.endsWith('.webmanifest'))

  if (isAppShell) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request)),
    )
    return
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  )
})

self.addEventListener('push', (event) => {
  let data = { title: 'OneMoreRep', body: '', url: '/tracker' }

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() }
    }
  } catch {
    // use defaults
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: { url: data.url || '/tracker' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/tracker'
  const absoluteUrl = new URL(url, self.location.origin).href

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(absoluteUrl)
      }
      return undefined
    }),
  )
})
