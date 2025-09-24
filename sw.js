/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const CACHE_NAME = 'sudoku-cache-v1';

// On install, pre-cache the main shell of the application
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/public/icon.svg',
      ]);
    })
  );
});

// On fetch, use a stale-while-revalidate strategy.
// This serves content from cache immediately for offline speed,
// but also fetches a fresh version from the network in the background
// to keep the app up-to-date for the next visit.
self.addEventListener('fetch', (event) => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);
      
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // If we received a valid response, clone it and cache it.
        if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(err => {
        // Fetch failed, possibly due to no network.
        // If we have a cached response, this error is not critical.
        // If we don't, the promise will reject and the user will see the browser's offline page.
        console.warn('Fetch failed:', err);
      });

      // Return the cached response if it exists, otherwise wait for the network response.
      return cachedResponse || fetchPromise;
    })
  );
});
