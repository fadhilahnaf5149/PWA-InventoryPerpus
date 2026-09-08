/* =========================================================
   INLIB - SERVICE WORKER
   ========================================================= */

const CACHE_NAME = "inlib-cache-v3";

const APP_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

/* =========================================================
   INSTALL
   ========================================================= */

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)

      .then((cache) => {
        console.log("InLib: Menyimpan file aplikasi...");

        return cache.addAll(APP_FILES);
      })

      .then(() => {
        return self.skipWaiting();
      }),
  );
});

/* =========================================================
   ACTIVATE
   ========================================================= */

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()

      .then((cacheNames) => {
        return Promise.all(
          cacheNames

            .filter((cacheName) => cacheName !== CACHE_NAME)

            .map((cacheName) => caches.delete(cacheName)),
        );
      })

      .then(() => {
        return self.clients.claim();
      }),
  );
});

/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestURL = new URL(event.request.url);

  /*
   * Hanya cache file dari
   * aplikasi sendiri.
   */

  if (requestURL.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches
      .match(event.request)

      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            const responseClone = networkResponse.clone();

            caches
              .open(CACHE_NAME)

              .then((cache) => {
                cache.put(event.request, responseClone);
              });

            return networkResponse;
          })

          .catch(() => {
            if (event.request.mode === "navigate") {
              return caches.match("./index.html");
            }
          });
      }),
  );
});
