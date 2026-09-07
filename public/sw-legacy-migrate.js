/*
 * One-time bridge from the 20 August 2026 release. That client expected an
 * updating worker to activate immediately and has no control that can accept
 * a waiting worker. Once this release activates, Workbox removes the old
 * precache entries, so later releases return to the normal Reload prompt.
 */
const HELPER_LEGACY_ASSETS = [
  "/helper/assets/index-B3TIe2ML.js",
  "/helper/assets/index-C6Ov6nYT.css",
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    for (const url of HELPER_LEGACY_ASSETS) {
      if (await caches.match(url, { ignoreSearch: true })) {
        await self.skipWaiting();
        return;
      }
    }
  })());
});
