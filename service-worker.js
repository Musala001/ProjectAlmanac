const CACHE_NAME = "study-app-v1.1";

/* Install: cache core files */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        "./",
        "./index.html",
        "./style.css",
        "./script.js",
        "./resources.json",
        "./manifest.json"
      ]).then(() => {
        // Notify all clients that caching is complete
        self.clients.matchAll().then(clients => {
          clients.forEach(client => client.postMessage("CACHE_COMPLETE"));
        });
      });
    })
  );
  self.skipWaiting();
});

/* Activate: clean old caches */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* Fetch: cache EVERYTHING (including PDFs) */
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});
