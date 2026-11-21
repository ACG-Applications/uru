// ============================================================
// Uru - Service Worker
// ============================================================
//
// The cache is deliberately split in two.
//
//   SHELL_CACHE  the app itself - html, manifest, brand mark. Sizes are in the
//                kilobytes, so bumping the version on every release is cheap.
//
//   MEDIA_CACHE  the audio and the karaoke video, ~74.6 MB. This one is NOT
//                bumped for ordinary code changes, so a release re-downloads the
//                shell and leaves the media alone. Before this split every
//                version bump re-fetched all 74.8 MB, including the 47.5 MB video.
//
// Two rules to keep it that way:
//
//   1. Bump SHELL_CACHE for any change to the app (html/css/js). It is a fresh
//      cache name, so the install re-fetches those few files.
//
//   2. Bump MEDIA_CACHE only when a media file is added, replaced or removed.
//      ADDING a track: it will not be in the cache yet, so the installer picks it
//      up on its own - no bump needed, and nothing else is re-downloaded.
//      REPLACING a file but keeping its name: you MUST bump MEDIA_CACHE, or the
//      old copy keeps being served.
//      REMOVING a track: entries are pruned from the cache on activate.
//
// ============================================================

const SHELL_CACHE = 'uru-shell-v13';   // bump on every release
const MEDIA_CACHE = 'uru-media-v1';    // bump only when media changes
const KEEP_CACHES = [SHELL_CACHE, MEDIA_CACHE];

// ---- the app: small, must all be present, so a 404 should fail loudly ----
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './Antonio.png',
];

// ---- media: large, fetched once and kept across releases ----
const MEDIA_ASSETS = [
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
  './URU-Karaoke-Vid.mp4',
];

// Fill the media cache, skipping anything already downloaded. Individual failures
// are logged rather than thrown: one unavailable track should not stop the app
// from installing, and the next run will pick up whatever is still missing.
async function fillMediaCache(cache, urls, fetchImpl) {
  const doFetch = fetchImpl || fetch;
  let added = 0;
  let skipped = 0;
  let failed = 0;

  for (const url of urls) {
    if (await cache.match(url)) {
      skipped++;
      continue;
    }
    try {
      const response = await doFetch(url);
      if (!response || !response.ok) throw new Error('HTTP ' + (response ? response.status : '?'));
      await cache.put(url, response);
      added++;
    } catch (err) {
      failed++;
      console.warn('[SW] could not cache', url, err);
    }
  }

  return { added, skipped, failed };
}

// ---------------------------------------------------------------- install
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      // shell first: it is small and the app is useless without it
      const shell = await caches.open(SHELL_CACHE);
      await shell.addAll(SHELL_ASSETS);

      // then media, skipping anything already cached
      const media = await caches.open(MEDIA_CACHE);
      await fillMediaCache(media, MEDIA_ASSETS);
    })()
  );
  self.skipWaiting(); // activate immediately
});

// ---------------------------------------------------------------- activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // drop caches that are neither the current shell nor the current media
      const names = await caches.keys();
      await Promise.all(
        names.map((name) => (KEEP_CACHES.includes(name) ? null : caches.delete(name)))
      );

      // prune media entries that are no longer part of the app
      const media = await caches.open(MEDIA_CACHE);
      const wanted = new Set(MEDIA_ASSETS.map((url) => new URL(url, self.location).href));
      const keys = await media.keys();
      await Promise.all(
        keys.map((request) => (wanted.has(request.url) ? null : media.delete(request)))
      );
    })()
  );
  self.clients.claim();
});

// ---------------------------------------------------------------- fetch
// Cache first, network fallback. <video> asks for byte ranges, so a cached full
// response is answered with a 206 slice - without that the browser receives a 200
// for a range request and seeking misbehaves offline.
async function serveFromCacheOrNetwork(request) {
  const cached = await caches.match(request, { ignoreVary: true });
  const range = request.headers.get('range');

  if (!cached) return fetch(request);
  if (!range) return cached;

  try {
    const buffer = await cached.arrayBuffer();
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    const start = match && match[1] ? parseInt(match[1], 10) : 0;
    let end = match && match[2] ? parseInt(match[2], 10) : buffer.byteLength - 1;
    if (end >= buffer.byteLength) end = buffer.byteLength - 1;
    if (start > end) start = end;
    const slice = buffer.slice(start, end + 1);

    return new Response(slice, {
      status: 206,
      statusText: 'Partial Content',
      headers: {
        'Content-Type': cached.headers.get('Content-Type') || 'video/mp4',
        'Content-Range': 'bytes ' + start + '-' + end + '/' + buffer.byteLength,
        'Content-Length': String(slice.byteLength),
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (e) {
    return cached;
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  event.respondWith(serveFromCacheOrNetwork(request));
});
