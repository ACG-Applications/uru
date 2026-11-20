const CACHE_NAME = 'uru-app-v10';
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
  './17.end.mp3',
    // ---- full-length and per-block vocals, so nothing needs a connection ----
    './01.一つずつ_vocals.mp3',
    './02.この胸が教えている_vocals.mp3',
    './03.感じてるよ_vocals.mp3',
    './04.迎えにいくから_vocals.mp3',
    './05.笑わらってくれ_vocals.mp3',
    './06.離さないように_vocals.mp3',
    './07.そこにあるんだよ_vocals.mp3',
    './08.大馬鹿者だ_vocals.mp3',
    './09.この幼さも_vocals.mp3',
    './10.くれたこと_vocals.mp3',
    './11.迎えにいくから_vocals.mp3',
    './12.伝えにいくよ_vocals.mp3',
    './13.たった一つの輝き_vocals.mp3',
    './14.揺るがない形になって_vocals.mp3',
    './15.それを愛と呼ぶなら_vocals.mp3',
    './16.君がいて欲しい_vocals.mp3',
    './Uru-Karaoke.mp3',
    './Uru-Vocals.mp3',
    './瀬戸山智之助 - 【歌詞付き】それを愛と呼ぶなら⧸Uru(ウル)ドラマ「マイファミリー」主題歌.mp3',
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