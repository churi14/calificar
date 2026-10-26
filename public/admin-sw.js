// Service worker del panel de administración: solo hace posible instalarlo como app.
// No guarda nada en caché: el admin siempre muestra datos en vivo.
self.addEventListener('install', function () { self.skipWaiting() })
self.addEventListener('activate', function (event) { event.waitUntil(self.clients.claim()) })
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return
  event.respondWith(fetch(event.request))
})
