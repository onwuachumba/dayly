/* DAYLY service worker — minimal and privacy-safe.
 *
 * Policy:
 * - NEVER cache /api/* (auth, sessions, user data). All API traffic is
 *   network-only so one user can never see another user's cached data and
 *   signed-out sessions cannot leak through stale responses.
 * - Static, version-hashed Next.js assets + icons are cache-first.
 * - Navigations are network-first with an offline fallback page.
 * - Versioned cache name: old caches are deleted on activate so updates
 *   can never trap the user on a stale shell.
 */

const CACHE_VERSION = "dayly-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  (event as ExtendableEvent).waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(["/offline", "/icons/icon-192.png", "/icons/maskable-512.png"]),
    ).catch(() => undefined),
  );
  (self as unknown as { skipWaiting: () => void }).skipWaiting();
});

self.addEventListener("activate", (event) => {
  (event as ExtendableEvent).waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k)));
      await (self as unknown as { clients: { claim: () => Promise<void> } }).clients.claim();
    })(),
  );
});

function isApiRequest(url: URL): boolean {
  return url.pathname.startsWith("/api/");
}

self.addEventListener("fetch", (event) => {
  const evt = event as FetchEvent;
  const { request } = evt;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Authenticated data and auth endpoints: always network, never cached.
  if (isApiRequest(url)) return;

  // Versioned static assets + icons: cache-first.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    evt.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const res = await fetch(request);
        if (res.ok) {
          const cache = await caches.open(STATIC_CACHE);
          cache.put(request, res.clone()).catch(() => undefined);
        }
        return res;
      })(),
    );
    return;
  }

  // Navigations: network-first, offline fallback. Never serve app pages stale
  // as if they were current user data — the fallback page says so explicitly.
  if (request.mode === "navigate") {
    evt.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch {
          const fallback = await caches.match(OFFLINE_URL);
          return (
            fallback ||
            new Response("DAYLY is offline. Reconnect to continue.", {
              status: 503,
              headers: { "Content-Type": "text/plain" },
            })
          );
        }
      })(),
    );
  }
});

// Minimal ambient types so this file typechecks without DOM lib conflicts.
declare const self: ServiceWorkerGlobalScope & typeof globalThis;
interface FetchEvent extends Event {
  request: Request;
  respondWith(r: Promise<Response> | Response): void;
}
interface ExtendableEvent extends Event {
  waitUntil(p: Promise<unknown>): void;
}
