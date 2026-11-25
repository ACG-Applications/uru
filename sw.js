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

const SHELL_CACHE = 'uru-shell-v15';   // bump on every release
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
  // ---- the recorded sentences, one per line (tap a line to hear it) ----
  './01-掛け違えていたボタン.mp3',
  './02-一つずつ.mp3',
  './03-下から順に外して.mp3',
  './04-もう一度重ねていく.mp3',
  './05-君がくれた時間と.mp3',
  './06-温かさを.mp3',
  './07-この胸が教えている.mp3',
  './08-空が青いとか.mp3',
  './09-花が咲くとか.mp3',
  './10-君が笑うとか.mp3',
  './11-抱きしめるとか.mp3',
  './12-すぐそばに.mp3',
  './13-あったこの幸せを.mp3',
  './14-今痛いくらい.mp3',
  './15-感じてるよ.mp3',
  './16-守りたいものがあると、.mp3',
  './17-そこに未来があるんだと.mp3',
  './18-君のいる場所まで.mp3',
  './19-迎えにいくから.mp3',
  './20-雨風に打たれて.mp3',
  './21-ボロボロになったら.mp3',
  './22-不格好な姿を.mp3',
  './23-笑ってくれ.mp3',
  './24-一度転んだからこそ.mp3',
  './25-見える世界があるなら.mp3',
  './26-もう二度とその手を.mp3',
  './27-離さないように.mp3',
  './28-やっと気づいたんだ.mp3',
  './29-君と過ごす日々.mp3',
  './30-本当に欲しかったものが.mp3',
  './31-そこにあるんだよ.mp3',
  './32-一人で歩いて来た.mp3',
  './33-顔をして.mp3',
  './34-失いかけてから.mp3',
  './35-ようやく目を覚ました.mp3',
  './36-そばにあった存在の.mp3',
  './37-その温もり.mp3',
  './38-僕はそう.mp3',
  './39-大馬鹿者だ.mp3',
  './40-初めて知る自分の.mp3',
  './41-弱さとか.mp3',
  './42-隠し切れなかった.mp3',
  './43-この幼さも.mp3',
  './44-きっと君は.mp3',
  './45-知っていたんだろう.mp3',
  './46-それでも信じて.mp3',
  './47-くれたこと.mp3',
  './48-返したいものがあると.mp3',
  './49-見つけたいものがあると.mp3',
  './50-君のいる場所まで.mp3',
  './51-迎えにいくから.mp3',
  './52-雨風に打たれて.mp3',
  './53-ボロボロになっても.mp3',
  './54-変わらないこの想いを.mp3',
  './55-伝えにいくよ.mp3',
  './56-見落としてきた涙も.mp3',
  './57-すり替えてきた感情も.mp3',
  './58-取り戻すように走れ.mp3',
  './59-走れ.mp3',
  './60-同じものはない.mp3',
  './61-たった一つの輝き.mp3',
  './62-支え合える喜びも.mp3',
  './63-分かち合える悲しみも.mp3',
  './64-いつの日か.mp3',
  './65-揺るがない形になって.mp3',
  './66-世界中を探しても.mp3',
  './67-ここにしかないもの.mp3',
  './68-それを愛と呼ぶなら.mp3',
  './69-守りたいものがあると.mp3',
  './70-そこに未来があるんだと.mp3',
  './71-君のいる場所まで.mp3',
  './72-迎えにいくから.mp3',
  './73-今はっきりと言えるよ.mp3',
  './74-大切な人よ.mp3',
  './75-いつまでも.mp3',
  './76-僕のそばには.mp3',
  './77-君がいて欲しい.mp3',
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
