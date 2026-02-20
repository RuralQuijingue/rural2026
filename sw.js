const CACHE_NAME = "rural-static-v2";

/* cache SOMENTE arquivos estáticos */
const STATIC_ASSETS = [
  "/styles/styles.css",
  "/styles/index.css",
  "/styles/noticias.css",
  "/styles/players.css",
  "/styles/stylespart.css",

  "/scripts/index.js",
  "/scripts/noticias.js",
  "/scripts/partidas.js",
  "/scripts/players.js",
  "/scripts/scripts.js",

  "/players_data.json",
  "/imgs/LOGORURAL.png"
];

/* install */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});

/* fetch — cache only static */
self.addEventListener("fetch", event => {

  const req = event.request;

  /* NÃO intercepta páginas HTML */
  if (req.mode === "navigate") return;

  event.respondWith(
    caches.match(req)
      .then(res => res || fetch(req))
  );
});

/* limpa cache antigo */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => caches.delete(k))
      )
    )
  );
});
