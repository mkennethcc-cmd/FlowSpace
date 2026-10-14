// Freely's offline shell: lets the website open with no connection.
//
// It keeps a copy of the page and the files it loads. Your data never passes through here — Supabase
// requests go straight to the network, and the app shows its own on-device copy of your data when
// there isn't one (App.jsx, "fs_cache_…"). Phone and desktop apps carry their files inside the app,
// so this only matters for the website.

const CACHE = "freely-shell-v2";
// Saved files are looked up by address alone. Servers often send "Vary: Origin", and the browser fetches
// the app's script WITH an Origin header that the saved copy was taken without — so without ignoreVary the
// copy is never found, and the page opens offline as a blank screen (found testing, 2026-10).
const MATCH = { ignoreVary: true };

// Save the page and every file it references. Built files are named after their contents, so a saved
// copy is never stale — a new version simply has new names. Old ones are cleared out each time.
async function saveShell() {
  const cache = await caches.open(CACHE);
  const res = await fetch("./index.html", { cache: "no-store" });
  if (!res.ok) return;
  const html = await res.clone().text();
  await cache.put("./index.html", res);
  const files = [...html.matchAll(/(?:src|href)="(\.?\/?[^"?#]+\.(?:js|css|png|svg|ico|webmanifest|woff2?))"/g)]
    .map(m => new URL(m[1], self.registration.scope).href);
  await Promise.all(files.map(f => cache.match(f, MATCH).then(hit => hit || cache.add(f).catch(() => {}))));
  // forget built files the current page no longer uses
  for (const req of await cache.keys()) {
    if (req.url.includes("/assets/") && !files.includes(req.url)) await cache.delete(req);
  }
}

self.addEventListener("install", e => { e.waitUntil(saveShell().catch(() => {}).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("freely-shell-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;            // Supabase, fonts: always the network

  if (req.mode === "navigate") {
    // The page: fresh when there's a connection (so a new version arrives at once), the saved copy when
    // there isn't. A fresh copy also refreshes the saved files in the background.
    e.respondWith(
      fetch(req)
        .then(res => { if (res.ok) e.waitUntil(saveShell().catch(() => {})); return res; })
        .catch(() => caches.match("./index.html", MATCH))
    );
    return;
  }

  // Scripts, styles, icons: the saved copy if there is one (it can't be stale), else the network.
  e.respondWith(
    caches.match(req, MATCH).then(hit => hit || fetch(req).then(res => {
      if (res.ok && url.pathname.includes("/assets/")) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});
