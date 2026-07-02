self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// 캐싱 없이 설치 가능(installable) 조건만 충족하는 최소 서비스워커
self.addEventListener("fetch", () => {});
