/**
 * GET /t/[programId]/sw.js
 *
 * Sirve un Service Worker con scope aislado por negocio: /t/{programId}/
 * Cada PWA instalada obtiene su propio SW → Chrome las trata como apps independientes.
 *
 * Por qué es necesario:
 * Un SW en /sw.js tiene scope "/" (todo el dominio). Chrome usa el scope del SW
 * junto con el campo "id" del manifest para identificar PWAs. Con scope compartido,
 * Chrome agrupa todas las tarjetas como "la misma app" → "Ya se instaló esta app".
 *
 * Con este SW en /t/{programId}/sw.js, el scope queda /t/{programId}/ → aislamiento total.
 */
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  const { programId } = await params
  const scope = `/t/${programId}/`

  // SW mínimo con scope aislado.
  // Estrategia network-first con cache para la ruta de esta tarjeta específica.
  const swCode = `
// Service Worker aislado para el programa ${programId}
// Scope: ${scope}
const CACHE = 'cal-${programId}-v1';
const SCOPE = '${scope}';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        if (url.pathname.startsWith(SCOPE) || url.pathname.startsWith('/api/fidelizacion/')) {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) { cache.put(event.request, clone); });
        }
        return response;
      })
      .catch(function() {
        return caches.match(event.request);
      })
  );
});

self.addEventListener('push', function(event) {
  if (!event.data) return;
  var data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Calificar', {
      body: data.body || '',
      icon: data.icon || '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url || '${scope}' },
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = event.notification.data && event.notification.data.url ? event.notification.data.url : '${scope}';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url === url && 'focus' in list[i]) return list[i].focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
`.trim()

  return new NextResponse(swCode, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache, no-store',
      // Service-Worker-Allowed permite que el SW controle /t/{programId}/ aunque
      // el archivo se sirva desde /t/{programId}/sw.js (misma ruta, sin conflicto)
      'Service-Worker-Allowed': scope,
    },
  })
}
