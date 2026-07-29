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

/* Уведомления чата. showNotification() зовёт сам клиент (feedback.js), пока приложение
   живо — здесь только КЛИК: открываем/поднимаем уже открытую вкладку приложения, а не
   плодим новую. Обработчик "push" оставлен на будущее (настоящий push при полностью
   закрытом приложении требует ключа Web Push/VAPID и серверного триггера — их пока
   нет; без подписки событие просто никогда не приходит, вреда от обработчика ноль). */
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) {
      if (c.url.indexOf(self.location.origin) === 0) { try { await c.focus(); return; } catch (_) {} }
    }
    try { await self.clients.openWindow("/"); } catch (_) {}
  })());
});
/* PUSH из Cloud Function (functions/index.js) — приходит, даже когда приложение
   ПОЛНОСТЬЮ закрыто. Отправляем ТОЛЬКО data-сообщения (без поля notification), поэтому
   показывает уведомление этот обработчик, а не библиотека firebase-messaging в SW —
   её importScripts здесь не нужен вовсе (меньше зависимостей, и sw.js остаётся один
   на кэш и на push). Формат FCM для data-only: { data: {...}, from, ... }, поэтому
   читаем сначала payload.data, потом верхний уровень (совместимость с ручным push). */
self.addEventListener("push", (e) => {
  let raw = {};
  try { raw = e.data ? e.data.json() : {}; } catch (_) { raw = { body: e.data ? e.data.text() : "" }; }
  const data = (raw && typeof raw.data === "object" && raw.data) ? raw.data : raw;
  const title = data.title || "Electric Pro";
  e.waitUntil((async () => {
    // если приложение ОТКРЫТО и видно на экране — уведомление рисует сама страница
    // (feedback.js notify(): там свой звук, метка и переход в нужный чат), иначе на
    // одно сообщение пришло бы ДВА уведомления
    try {
      const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      if (wins.some((c) => c.visibilityState === "visible")) return;
    } catch (_) {}
    await self.registration.showNotification(title, {
      body: data.body || "Новое сообщение в чате",
      tag: data.tag || "ep-chat",
      icon: "/assets/icon-192.png",
      badge: "/assets/icon-192.png",
      data: { chat: 1 }
    });
  })());
});

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
