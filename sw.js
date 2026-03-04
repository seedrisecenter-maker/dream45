const CACHE_NAME = 'dream45-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  '/data/quotes.json',
  '/manifest.json',
  '/game/index.html',
  '/game/css/game.css',
  '/game/js/game-config.js',
  '/game/js/game-physics.js',
  '/game/js/game-particles.js',
  '/game/js/game-audio.js',
  '/game/js/game-render.js',
  '/game/js/game-input.js',
  '/game/js/game-state.js',
  '/game/js/game-main.js'
];

// Install: cache core assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
