const SHELL_CACHE_NAME = 'onlytry-shell-v0.6.1'
const RUNTIME_CACHE_NAME = 'onlytry-runtime-v0.6.1'
const APP_SHELL = [
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
]

function isOnlytryCache(key) {
  return key.startsWith('onlytry-shell-') || key.startsWith('onlytry-runtime-')
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => isOnlytryCache(key) && key !== SHELL_CACHE_NAME && key !== RUNTIME_CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  const requestUrl = new URL(event.request.url)

  if (requestUrl.origin !== self.location.origin) {
    return
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone()

          caches.open(SHELL_CACHE_NAME).then((cache) => {
            cache.put('/index.html', responseClone)
          })

          return networkResponse
        })
        .catch(() => caches.match('/index.html')),
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(event.request).then((networkResponse) => {
        const responseClone = networkResponse.clone()
        caches.open(RUNTIME_CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone)
        })
        return networkResponse
      })
    }),
  )
})
