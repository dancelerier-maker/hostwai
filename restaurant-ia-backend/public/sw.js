// Minimal service worker: just enough for Chrome/Android to consider this
// an installable PWA. It doesn't do offline caching of the dashboard data
// (that data needs to be live anyway) — only caches the app shell.

const CACHE_NAME = "restaurant-ia-shell-v1";
const SHELL_ASSETS = ["/", "/dashboard", "/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for everything (this app is live-data-driven), falling back
// to the cached shell only if the network is unreachable.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
