const CACHE_NAME = 'uru-app-v6';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './Antonio.png',
  './00.intro.mp3',
  './01.一つずつ.mp3',
  './02.この胸が教えている.mp3',
  './03.感じてるよ.mp3',
  './04.迎えにいくから.mp3',
  './05.笑わらってくれ.mp3',
  './06.離さないように.mp3',
  './07.そこにあるんだよ.mp3',
  './08.大馬鹿者だ.mp3',
  './09.この幼さも.mp3',
  './10.くれたこと.mp3',
  './11.迎えにいくから.mp3',
  './12.伝えにいくよ.mp3',
  './13.たった一つの輝き.mp3',
  './14.揺るがない形になって.mp3',
  './15.それを愛と呼ぶなら.mp3',
  './16.君がいて欲しい.mp3',
  './17.end.mp3'
];

// Install event: cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: serve from cache first, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});