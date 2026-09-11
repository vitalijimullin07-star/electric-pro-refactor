#!/usr/bin/env node
/* Electric Pro — сборка папки www/ для нативного APK (Capacitor).
   В отличие от TWA, который открывает сайт, нативная сборка кладёт ВЕСЬ интерфейс
   внутрь APK: тестер получает зафиксированную версию, не зависящую от того, что
   сейчас на проде, и приложение запускается, даже если хостинг недоступен.

   Копируем только то, что реально нужно приложению. docs/, test/, functions/,
   android/ и служебные файлы в APK не идут — это лишние мегабайты.

   Запуск: node scripts/build-www.js   →  www/
*/
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "www");

// Файлы и папки, которые составляют само приложение
const ITEMS = [
  "index.html", "manifest.webmanifest", "version.json",
  "sw.js", "firebase-messaging-sw.js",
  "assets", "pages", "config"
];

function copy(src, dst) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const n of fs.readdirSync(src)) copy(path.join(src, n), path.join(dst, n));
  } else {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
  }
}

function du(dir) {
  let n = 0, bytes = 0;
  const walk = (d) => {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f), st = fs.statSync(p);
      if (st.isDirectory()) walk(p); else { n++; bytes += st.size; }
    }
  };
  walk(dir);
  return { n, mb: (bytes / 1048576).toFixed(2) };
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const item of ITEMS) {
  const src = path.join(ROOT, item);
  if (!fs.existsSync(src)) { console.warn("  пропущен (нет в репозитории):", item); continue; }
  copy(src, path.join(OUT, item));
}

/* Кэш-бастинг ?v= в нативной сборке не нужен и ВРЕДЕН: файлы лежат локально, версия
   меняется только вместе с самим APK, а лишний query-параметр мешает WebView кэшировать
   их между запусками. Service worker тоже выключаем — оффлайн тут обеспечивает сам APK,
   а sw попытался бы кэшировать localhost-адреса поверх уже локальных файлов. */
const idx = path.join(OUT, "index.html");
let html = fs.readFileSync(idx, "utf8");
html = html.replace(/\?v=\d+/g, "");

/* Флаг нативной сборки ОТДЕЛЬНЫМ ФАЙЛОМ, а не инлайном: CSP приложения разрешает
   script-src 'self', и встроенный <script> просто не выполняется (проверено — флаг
   не доезжал). По нему pwa.js не регистрирует service worker и не проверяет «не вышла
   ли новая версия на сайте»: в APK код лежит внутри, версия меняется вместе с самим
   файлом приложения, и автоперезагрузка тут ни к чему. */
fs.writeFileSync(path.join(OUT, "native-flag.js"), "window.EP_NATIVE = true;\n");
const flagTag = '<script src="native-flag.js"></script>';
html = html.replace("<script defer src=\"https://www.gstatic.com", flagTag + "\n  <script defer src=\"https://www.gstatic.com");
if (html.indexOf("native-flag.js") < 0) throw new Error("не удалось подключить native-flag.js");

/* Firebase SDK — ЛОКАЛЬНО. На сайте он тянется с gstatic, но нативная сборка должна
   запускаться и без интернета: иначе при первом запуске в офлайне не инициализируется
   вообще ничего, включая чтение уже сохранённых локально проектов. */
const VENDOR = path.join(OUT, "vendor/firebase");
fs.mkdirSync(VENDOR, { recursive: true });
const sdk = [...html.matchAll(/https:\/\/www\.gstatic\.com\/firebasejs\/([\d.]+)\/([a-z-]+\.js)/g)]
  .map((m) => ({ url: m[0], ver: m[1], file: m[2] }));
const seen = new Set();
for (const s of sdk) {
  if (seen.has(s.file)) continue;
  seen.add(s.file);
  const dst = path.join(VENDOR, s.file);
  if (!fs.existsSync(dst)) {
    const r = require("child_process").spawnSync("curl", ["-sSfL", "-o", dst, s.url], { encoding: "utf8" });
    if (r.status !== 0) throw new Error("не скачался " + s.url + ": " + (r.stderr || "").trim());
  }
  html = html.split(s.url).join("vendor/firebase/" + s.file);
  console.log("  локально:", s.file, (fs.statSync(dst).size / 1024).toFixed(0) + " КБ");
}
if (/gstatic\.com\/firebasejs/.test(html)) throw new Error("остались ссылки на gstatic — SDK не полностью локальный");
fs.writeFileSync(idx, html);
fs.rmSync(path.join(OUT, "sw.js"), { force: true });
fs.rmSync(path.join(OUT, "firebase-messaging-sw.js"), { force: true });

const s = du(OUT);
console.log(`www/ готова: ${s.n} файлов, ${s.mb} МБ`);
