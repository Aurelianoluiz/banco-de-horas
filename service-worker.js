const CACHE_NAME = 'banco-horas-v2';
const APP_SHELL = [
  '/',
  '/app-shell.html',
  '/login.html',
  '/manifest.webmanifest',
  '/web/responsive.css',
  '/web/auth-session.js',
  '/web/auth-guard.js',
  '/web/api-client.js',
  '/web/dashboard-controller.js',
  '/web/dashboard-view.js',
  '/web/pwa.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) return;
  event.respondWith(fetch(request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
    return response;
  }).catch(() => caches.match(request).then((cached) => cached || caches.match('/app-shell.html'))));
});
