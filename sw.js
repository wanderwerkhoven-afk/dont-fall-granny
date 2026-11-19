/* Don't Trip Grandma – versioned offline app shell. */
const CACHE_NAME = 'dont-trip-grandma-offline-v28-replay-ghost';
const CACHE_PREFIX = 'dont-trip-grandma-offline-';
const APP_SHELL = [
  './',
  './index.html',
  './style.css?v=28',
  './game-meta.js?v=10',
  './progression.js?v=10',
  './game-state.js?v=16',
  './run-results.js?v=17',
  './world-events.js?v=20',
  './world-mastery.js?v=21',
  './danger-soundscape.js?v=23',
  './daily-challenge.js?v=26',
  './replay-engine.js?v=28',
  './app.js?v=28',
  './granny-expressions.js?v=14',
  './storybook-worlds.js?v=11',
  './levels.js?v=10',
  './assets/hanger-spritesheet.svg'
];
const offlineUrl = path => new URL(path, self.registration.scope).toString();

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL.map(offlineUrl)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)));
          }
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match(offlineUrl('./index.html'))) || Response.error())
    );
    return;
  }

  // Prefer fresh HTML/CSS/JS online. Cache-first previously mixed an updated
  // start screen with stale app.js, leaving navigation and Start unresponsive.
  event.respondWith(
    fetch(request).then(response => {
      if (response.ok && response.type === 'basic') {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)));
      }
      return response;
    }).catch(async () => (await caches.match(request)) || Response.error())
  );
});
