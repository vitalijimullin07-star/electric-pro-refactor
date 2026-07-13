# Electric Pro — установка как приложение и сборка APK

Приложение теперь **устанавливаемое PWA**: `manifest.webmanifest` + иконка + service worker
(`sw.js`) для оффлайна. Это даёт «приложение» без магазина и без переписывания на другой язык.

## 1. Установка прямо из браузера (проще всего, ничего собирать не надо)

**Android (Chrome):** открой сайт → меню ⋮ → «Установить приложение» (или баннер
«Добавить на главный экран»). Появится иконка, запуск в полный экран, работает оффлайн.

**iPhone (Safari):** «Поделиться» → «На экран Домой».

Оффлайн: после первого захода интерфейс кэшируется и открывается без сети. Данные
проекта хранятся локально (localStorage) и синхронизируются в облако при появлении сети.

## 2. APK-файл для магазина / раздачи (когда нужен именно .apk)

Есть два пути. Оба берут уже готовую PWA — код приложения не меняется.

### Вариант A — TWA через Bubblewrap (рекомендуется, самый лёгкий)

Оборачивает размещённый сайт в APK (Trusted Web Activity).

```bash
npm i -g @bwip/bubblewrap   # или: npm i -g @bubblewrap/cli
bubblewrap init --manifest https://<ваш-домен>/manifest.webmanifest
bubblewrap build            # соберёт app-release-signed.apk
```

Нужно: JDK 17, Android SDK. Bubblewrap сам предложит их поставить. Для публикации в
Google Play подпись делает сам Bubblewrap (создаст keystore) — храни его надёжно.
Также он выдаст `assetlinks.json` — положи его в `/.well-known/assetlinks.json`
(на хостинге) для проверки владения доменом.

### Вариант B — Capacitor (если нужен нативный код/плагины)

```bash
npm i @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Electric Pro" com.electricpro.app --web-dir=.
npx cap add android
npx cap copy
npx cap open android     # откроет Android Studio -> Build APK
```

Подпись релизного APK — своим keystore (Android Studio → Build → Generate Signed Bundle/APK).

## Что уже сделано в репозитории
- `manifest.webmanifest` — имя, иконка, `display: standalone`, тема.
- `assets/icon.svg` — иконка приложения.
- `sw.js` — service worker: оффлайн-кэш оболочки, network-first для навигации,
  stale-while-revalidate для статики. Firebase (Auth/Firestore) и gstatic не кэшируются.
- `assets/js/core/pwa.js` — регистрация service worker (inline нельзя из-за CSP).
- `firebase.json` — `sw.js`/`manifest` отдаются с `Cache-Control: no-cache` (быстрые обновления).

> Примечание: для магазина Google Play всё равно нужен ваш keystore и аккаунт разработчика
> ($25 разово) — это шаги, которые делаются под вашей учётной записью.
