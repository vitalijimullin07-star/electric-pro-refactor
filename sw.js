/* Electric Pro V29 — service worker (оффлайн + установка как приложение).
   Кэшируем ТОЛЬКО свой origin и GET. Firebase (Auth/Firestore) и gstatic не трогаем —
   они идут напрямую в сеть. Навигация: сеть -> оффлайн-фолбэк на кэш index.html.
   Статика: cache-first + фоновое обновление (stale-while-revalidate). */
"use strict";
const CACHE = "ep-v29-shell-3";
const CORE = ["/", "/index.html", "/manifest.webmanifest", "/assets/icon.svg", "/assets/icon-192.png", "/assets/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()).catch(() => {}));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("message", (e) => { if (e.data === "skipWaiting") self.skipWaiting(); });

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;                       // POST (Firestore/Auth) — мимо SW
  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.origin !== self.location.origin) return;        // только свой origin (не gstatic/googleapis)

  // Страница И ЛЮБОЙ прямой запрос /index.html (в т.ч. fetch из pwa.js, который
  // сверяет отпечаток версий для автообновления) — ВСЕГДА network-first.
  // РАНЬШЕ network-first был ТОЛЬКО для req.mode==="navigate", а fetch("/index.html",
  // {cache:"no-store"}) из pwa.js — это НЕ navigate: он падал в ветку статики ниже
  // (cache-first) и получал СТАРЫЙ index.html из кэша SW, даже когда на сервере уже
  // лежал новый — cache:"no-store" обходит только HTTP-кэш, но не перехват SW.
  // Проверка новой версии «слепла» на целый цикл (баг класса «грузится старая часть
  // вместо новой», пойман живым тестом наложения: на диске ?v=9999, fetch вернул 3182).
  if (req.mode === "navigate" || url.pathname === "/" || url.pathname === "/index.html") {
    e.respondWith(
      fetch(req).then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put("/index.html", cp)).catch(() => {}); return r; })
        .catch(() => caches.match("/index.html").then((m) => m || caches.match("/")))
    );
    return;
  }
  // статика: сначала кэш, параллельно обновляем из сети
  e.respondWith(
    caches.match(req).then((cached) => {
      const net = fetch(req).then((r) => {
        if (r && r.status === 200 && r.type === "basic") { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)).catch(() => {}); }
        return r;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
