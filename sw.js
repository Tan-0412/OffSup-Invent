/* OffSup-Invent Service Worker v1.3 */
const CACHE_NAME = 'offsup-invent-v3';
const BASE = '/OffSup-Invent';

const ASSETS_TO_CACHE = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/manifest.json',
  BASE + '/icon-192x192.png',
  BASE + '/icon-512x512.png',
  BASE + '/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE).catch(err => console.warn('[SW] cache fail:', err)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.hostname !== location.hostname) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(res => { caches.open(CACHE_NAME).then(c => c.put(event.request, res.clone())); return res; })
        .catch(() => caches.match(event.request).then(r => r || caches.match(BASE + '/index.html')))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request)
      .then(res => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          caches.open(CACHE_NAME).then(c => c.put(event.request, res.clone()));
        }
        return res;
      })
    )
  );
});
