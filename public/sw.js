// Service Worker for 大人のビッくらポン
// - Precaches the app shell (HTML + icons + manifests) for installability and offline use
// - Network-first for navigation so new deploys show up on reload
// - Cache-first for static assets (icons, fonts)
// - Bypasses dynamic routes (/og, /r, /api/*) — always go to network

const CACHE = 'otonano-v1';
const SHELL = [
  '/',
  '/organizer.html',
  '/manifest.webmanifest',
  '/manifest-organizer.webmanifest',
  '/icons/game-192.png',
  '/icons/game-512.png',
  '/icons/game-192-maskable.png',
  '/icons/game-512-maskable.png',
  '/icons/organizer-192.png',
  '/icons/organizer-512.png',
  '/icons/organizer-192-maskable.png',
  '/icons/organizer-512-maskable.png',
  '/icons/apple-touch-icon.png',
  '/icons/apple-touch-icon-organizer.png',
  '/icons/favicon-32.png',
  '/icons/favicon-16.png',
  '/icons/game.svg',
  '/icons/organizer.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isDynamicPath(pathname) {
  return (
    pathname === '/og' ||
    pathname.startsWith('/og?') ||
    pathname === '/og.png' ||
    pathname.startsWith('/og.png?') ||
    pathname === '/r' ||
    pathname.startsWith('/r?') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/data/')
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isDynamicPath(url.pathname)) return;

  // Navigation → network-first (fall back to cache if offline)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          const clone = resp.clone();
          caches.open(CACHE).then((c) => c.put(request, clone)).catch(() => {});
          return resp;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('/organizer.html') || caches.match('/'))
        )
    );
    return;
  }

  // Static assets → cache-first, populate on miss
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((resp) => {
        if (resp && resp.ok && resp.type === 'basic') {
          const clone = resp.clone();
          caches.open(CACHE).then((c) => c.put(request, clone)).catch(() => {});
        }
        return resp;
      });
    })
  );
});
