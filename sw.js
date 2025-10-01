/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const CACHE_NAME = 'sudoku-cache-v4'; // Bump version to force update
const PRECACHE_ASSETS = [
  './', // This caches the index.html at the root
  'public/icon.svg',
  'manifest.json'
];

// On install, pre-cache the main shell of the application
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Pre-caching assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// Clean up old caches on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Claiming clients');
      return self.clients.claim();
    })
  );
});

// On fetch, use a network-first strategy for navigation requests (HTML page)
// and a stale-while-revalidate strategy for everything else.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  // Network-first for HTML pages
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If successful, clone it, cache it, and return it
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // If the network fails, serve the cached version
          return caches.match(event.request.url) || caches.match('./');
        })
    );
    return;
  }

  // Stale-while-revalidate for other assets (e.g., icons, manifest)
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);
      
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(error => {
        // Suppress fetch error logs if we have a cached response.
        if (!cachedResponse) {
          console.error("Fetch failed with no cached response:", error);
        }
      });

      return cachedResponse || fetchPromise;
    })
  );
});
