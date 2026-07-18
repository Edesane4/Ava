/* PawPal service worker — offline support, runtime caching & web push. */

const VERSION = "pawpal-v2";
const APP_SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;
const DATA = `${VERSION}-data`;

// Minimal shell that should always be available offline.
const SHELL_URLS = ["/", "/offline", "/manifest.json", "/icons/icon.svg"];

// ── Install: pre-cache the shell ──────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL).then((cache) => cache.addAll(SHELL_URLS)),
  );
  self.skipWaiting();
});

// ── Activate: clean old versions ──────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ── Fetch strategy ────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // never cache mutations

  const url = new URL(request.url);

  // Supabase REST/data → network-first, fall back to cached data offline.
  // (This is what lets "cached bookings" show when you're offline.)
  if (url.pathname.includes("/rest/v1/")) {
    event.respondWith(networkFirst(request, DATA));
    return;
  }

  // Don't touch auth/realtime/storage-upload — always go to network.
  if (
    url.pathname.includes("/auth/v1/") ||
    url.pathname.includes("/realtime/v1/") ||
    url.pathname.includes("/storage/v1/object/upload")
  ) {
    return;
  }

  // Page navigations → network-first, fall back to cache then /offline.
  if (request.mode === "navigate") {
    event.respondWith(
      networkFirst(request, RUNTIME).catch(() => caches.match("/offline")),
    );
    return;
  }

  // Static assets (same-origin) → cache-first.
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, RUNTIME));
    return;
  }

  // Everything else (e.g. avatar images) → stale-while-revalidate.
  event.respondWith(staleWhileRevalidate(request, RUNTIME));
});

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const cache = await caches.open(cacheName);
  const fresh = await fetch(request);
  if (fresh && fresh.ok) cache.put(request, fresh.clone());
  return fresh;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res && res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || network;
}

// ── Web Push: show the "🎉 New client!" notification ──────────
self.addEventListener("push", (event) => {
  let data = { title: "PawPal 🐾", body: "You have an update!", url: "/" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (_e) {
    if (event.data) data.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      vibrate: [120, 60, 120],
      data: { url: data.url || "/" },
      tag: "pawpal-booking",
      renotify: true,
    }),
  );
});

// ── Focus / open the app when a notification is tapped ────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ("focus" in client) {
            client.navigate(target);
            return client.focus();
          }
        }
        return self.clients.openWindow(target);
      }),
  );
});
