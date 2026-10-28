/* Service worker du Carpomètre : l'appli s'ouvre même sans réseau,
   avec la dernière météo chargée. Fichiers du site : réseau d'abord, cache en secours. */
const CACHE = "carpometre-v2";
const SHELL = ["./", "index.html", "style.css", "app.js", "ponds.js", "favicon.svg", "icon-192.png", "manifest.webmanifest"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;
  const u = new URL(req.url);
  const mine = u.origin === location.origin;
  const keep = mine || u.hostname === "api.open-meteo.com" || u.hostname === "unpkg.com" || u.hostname.endsWith("gstatic.com") || u.hostname === "fonts.googleapis.com";
  if(!keep) return; // tuiles de carte, Overpass : pas de cache
  e.respondWith(
    fetch(req).then(res => {
      if(res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, {ignoreSearch: u.hostname === "api.open-meteo.com" ? false : true}).then(r => r || caches.match("index.html")))
  );
});
