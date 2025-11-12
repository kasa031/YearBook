// Service Worker for YearBook PWA
// Dette gjør appen installérbar og støtter offline-funksjonalitet

const CACHE_NAME = 'yearbook-v1';
const RUNTIME_CACHE = 'yearbook-runtime-v1';

// Filer som skal caches ved installasjon
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/utils.js',
  './js/shared.js',
  './js/main.js',
  './manifest.json',
  './assets/images/b2school.png',
  './assets/images/classroom.jpg',
  './assets/videos/Logo.mp4',
  './assets/videos/AnimationBook.mp4',
  './assets/videos/AnimatedButton.mp4'
];

// Install event - cacher viktige filer
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[Service Worker] Precache failed:', error);
      })
  );
});

// Activate event - rydder opp i gamle caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Network first, fallback til cache
self.addEventListener('fetch', (event) => {
  // Ignorer ikke-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorer API-kall (de skal alltid gå til nettverket)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Klon responsen før vi cacher den
        const responseToCache = response.clone();
        
        // Cache suksessfulle GET requests
        if (response.status === 200) {
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Hvis nettverket feiler, prøv cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Hvis det er en navigasjon og vi ikke har cache, vis offline-side
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Message event - for å håndtere oppdateringer
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

