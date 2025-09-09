// Cache verze
const CACHE = 'pwa-vote-v1';

// Soubory, které budeme cacheovat pro offline
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Instalace SW → přednačti assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
});

// Aktivace SW → promaž staré cache
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

// Fetch → API požadavky zkusit síť, assets z cache
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const isApi = url.searchParams.get('path'); // naše Apps Script volání používají ?path=

  if (isApi) {
    // síť-first (když nejde síť, zkus cache – spíš nic, ale nevadí)
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  } else {
    // cache-first pro statická aktiva
    e.respondWith(
      caches.match(e.request).then(res => res || fetch(e.request))
    );
  }
});
