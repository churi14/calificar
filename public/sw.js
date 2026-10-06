// ─── FETCH HANDLER (requerido por Chrome para instalabilidad como PWA) ───────
// Estrategia: Network-first con fallback a cache para navegación offline básica.
self.addEventListener('fetch', function (event) {
  // Solo interceptar GET del mismo origen
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        // Cachear páginas de tarjeta para acceso offline
        if (url.pathname.startsWith('/t/') || url.pathname.startsWith('/fidelizacion/tarjeta')) {
          const clone = response.clone()
          caches.open('calificar-v1').then(function (cache) {
            cache.put(event.request, clone)
          })
        }
        return response
      })
      .catch(function () {
        // Offline: intentar desde cache
        return caches.match(event.request)
      })
  )
})

// ─── PUSH NOTIFICATIONS ──────────────────────────────────────────────────────
self.addEventListener('push', function (event) {
  if (!event.data) return

  const data = event.data.json()
  const title = data.title || 'Calificar'
  const options = {
    body: data.body || '',
    icon: data.icon || '/notification-icon.png',
    badge: '/notification-icon.png',
    data: { url: data.url || '/' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
