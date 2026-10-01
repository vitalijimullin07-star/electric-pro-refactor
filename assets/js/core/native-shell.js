/* Electric Pro — мост к нативной оболочке (APK «с кодом внутри», Capacitor).
   В браузере и в TWA-версии модуль НИЧЕГО не меняет: всё ниже гейтится проверкой
   Capacitor.isNativePlatform().

   Зачем он нужен. Нативная сборка показывает приложение во встроенном Android WebView, а
   он умеет меньше Chrome:
   · window.print() — пустая операция: смета, PDF-альбом плана, документы и однолинейка
     просто не печатались бы;
   · window.open("") грузит пустую страницу В ТО ЖЕ окно — то есть стирал бы всё
     приложение (новых вкладок у WebView нет);
   · ссылка «скачать» (экспорт проекта, DXF, резервная копия базы) — у WebView нет
     менеджера загрузок, файл молча не сохранялся бы;
   · нет navigator.share, нет блокировки ориентации, а настоящий полноэкранный режим
     Capacitor сразу же отменяет (элемент «входит» и тут же «выходит» — кнопки «во весь
     экран» в чате, развёртке и однолинейке мигали бы и ничего не делали).
   Всё это закрывает Java-плагин EpNative (android-native/.../EpNativePlugin.java), а
   этот файл перенаправляет в него УЖЕ существующие вызовы — модули приложения про натив
   не знают и остаются одним кодом на браузер, TWA и APK. */
(function () {
  "use strict";
  window.EP = window.EP || {};

  function cap() { return window.Capacitor || null; }
  function isNative() {
    try { const c = cap(); return !!(c && c.isNativePlatform && c.isNativePlatform()); } catch (e) { return false; }
  }
  function plugin() { const c = cap(); return (c && c.Plugins && c.Plugins.EpNative) || null; }
  function available() { return isNative() && !!plugin(); }

  function notice(text) {
    try {
      let el = document.getElementById("ep-log-toast");
      if (!el) { el = document.createElement("div"); el.id = "ep-log-toast"; document.body.appendChild(el); }
      el.textContent = text; el.style.opacity = "1";
      clearTimeout(notice._t); notice._t = setTimeout(() => { try { el.style.opacity = "0"; } catch (e) {} }, 2600);
    } catch (e) {}
  }

  // ---------- печать ----------
  // Формат, ориентация и поля бумаги — из @page самого листа (альбом плана A4…A0
  // альбомно без полей, смета A4 книжно с полями 15/12/14 мм). Поля передаём явно:
  // печать WebView задаёт их сама и CSS-поля @page тогда не учитывает — смета вышла бы
  // впритык к краю бумаги.
  const MM = { mm: 1, cm: 10, in: 25.4, pt: 25.4 / 72, px: 25.4 / 96 };
  function lenMm(t) {
    const m = /^(-?[\d.]+)(mm|cm|in|pt|px)?$/i.exec(String(t || "").trim());
    if (!m) return 0;
    const v = parseFloat(m[1]) * (MM[(m[2] || "px").toLowerCase()] || 0);
    return isFinite(v) && v > 0 ? Math.round(v * 10) / 10 : 0;
  }
  function pageOf(html) {
    const blk = /@page\s*\{([^}]*)\}/i.exec(String(html || ""));
    const body = blk ? blk[1] : "";
    const sz = /(?:^|;)\s*size\s*:\s*([^;]+)/i.exec(body);
    const v = sz ? sz[1].toLowerCase() : "";
    const a = /\ba([0-5])\b/.exec(v);
    const mg = /(?:^|;)\s*margin\s*:\s*([^;]+)/i.exec(body);
    const parts = mg ? mg[1].trim().split(/\s+/).map(lenMm) : [0];
    const [t, r = t, b = t, l = r] = parts;
    return { size: a ? "A" + a[1] : "A4", landscape: /landscape/.test(v), margins: { top: t, right: r, bottom: b, left: l } };
  }
  function titleOf(html) {
    const m = /<title[^>]*>([^<]*)<\/title>/i.exec(String(html || ""));
    return m ? m[1].replace(/\s+/g, " ").trim() : "";
  }
  function stripScripts(html) { return String(html || "").replace(/<script\b[\s\S]*?<\/script>/gi, ""); }

  function printHtml(html, opts) {
    const p = plugin();
    if (!p) return Promise.resolve(false);
    const pg = pageOf(html);
    const o = Object.assign({ title: titleOf(html) || "Electric Pro", size: pg.size, landscape: pg.landscape, margins: pg.margins }, opts || {});
    const mg = o.margins || {};
    return Promise.resolve(p.print({
      html: stripScripts(html), title: o.title, size: o.size, landscape: !!o.landscape,
      marginTop: mg.top || 0, marginRight: mg.right || 0, marginBottom: mg.bottom || 0, marginLeft: mg.left || 0
    }))
      .then(() => true, (e) => { notice("Печать недоступна: " + ((e && e.message) || e)); return false; });
  }

  // «Окно» для window.open(""): собирает то, что модуль пишет в document.write, и по
  // print() отдаёт в системную печать. Настоящее окно открыть нельзя — WebView загрузил
  // бы пустую страницу поверх самого приложения.
  function printWindow() {
    let buf = "", printed = false, autoT = 0;
    const doPrint = function () { if (printed) return; printed = true; printHtml(buf); };
    const doc = {
      title: "", body: null, readyState: "complete",
      open: function () { buf = ""; return doc; },
      write: function () { for (let i = 0; i < arguments.length; i++) buf += String(arguments[i]); },
      writeln: function () { for (let i = 0; i < arguments.length; i++) buf += String(arguments[i]) + "\n"; },
      // лист со СВОИМ авто-print скриптом (так написана печать раскладки щита): сам
      // вызывающий print() не позовёт — печатаем после закрытия документа
      close: function () {
        clearTimeout(autoT);
        autoT = setTimeout(function () { if (!printed && /\.print\s*\(/.test(buf)) doPrint(); }, 900);
      },
      addEventListener: function () {}, removeEventListener: function () {}
    };
    const w = {
      document: doc, opener: window, closed: false, onload: null, onafterprint: null,
      focus: function () {}, blur: function () {}, print: doPrint,
      close: function () { w.closed = true; },
      addEventListener: function () {}, removeEventListener: function () {},
      setTimeout: function (f, ms) { return setTimeout(f, ms); }
    };
    return w;
  }

  // ---------- файлы ----------
  // Типы, для которых расширение и MIME у Android гарантированно совпадают; для всего
  // прочего octet-stream — иначе системный диалог дописывал бы к имени второе
  // расширение («план.dxf.bin»).
  const SAFE_MIME = { json: "application/json", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", pdf: "application/pdf", txt: "text/plain" };
  function extOf(name) { const m = /\.([a-z0-9]{1,6})$/i.exec(String(name || "")); return m ? m[1].toLowerCase() : ""; }
  function mimeFor(name) { return SAFE_MIME[extOf(name)] || "application/octet-stream"; }

  function blobToBase64(blob) {
    return new Promise(function (resolve, reject) {
      const fr = new FileReader();
      fr.onload = function () { const s = String(fr.result || ""); resolve(s.slice(s.indexOf(",") + 1)); };
      fr.onerror = function () { reject(fr.error); };
      fr.readAsDataURL(blob);
    });
  }
  function dataUrlParts(url) {
    const m = /^data:([^;,]*)((?:;[^;,]*)*?)(;base64)?,([\s\S]*)$/i.exec(String(url || ""));
    if (!m) return null;
    const b64 = m[3] ? m[4] : btoa(unescape(encodeURIComponent(decodeURIComponent(m[4]))));
    return { mime: m[1] || "application/octet-stream", b64: b64 };
  }
  function saveBase64(name, b64) {
    const p = plugin();
    if (!p) return Promise.resolve(false);
    return Promise.resolve(p.saveFile({ name: name, mime: mimeFor(name), data: b64 })).then(function (r) {
      if (r && r.ok) notice("Файл сохранён: " + name);
      return !!(r && r.ok);
    }, function () { notice("Не удалось сохранить файл"); return false; });
  }
  function saveBlob(blob, name) {
    return blobToBase64(blob).then(function (b64) { return saveBase64(name, b64); }, function () { notice("Не удалось прочитать файл"); return false; });
  }

  // blob-URL → сам Blob. Модули часто отзывают URL сразу после click() — держим Blob
  // у себя, чтобы сохранение не зависело от того, успел ли он «умереть».
  const blobs = new Map();
  function downloadUrl(href, name) {
    if (/^data:/i.test(href)) {
      const d = dataUrlParts(href);
      if (d) return saveBase64(name, d.b64);
      notice("Не удалось сохранить файл");
      return Promise.resolve(false);
    }
    const b = blobs.get(href);
    if (b) return saveBlob(b, name);
    return fetch(href).then(function (r) { return r.blob(); }).then(function (b2) { return saveBlob(b2, name); })
      .catch(function () { notice("Не удалось сохранить файл"); return false; });
  }
  function nameOf(a, href) {
    const n = (a.getAttribute("download") || "").trim();
    if (n) return n;
    const m = /\/([^/?#]+)(?:[?#].*)?$/.exec(href);
    return (m && !/^blob:|^data:/i.test(href)) ? decodeURIComponent(m[1]) : "electric-pro";
  }

  // ---------- «Поделиться» ----------
  function share(data) {
    const p = plugin();
    if (!p) return Promise.reject(new Error("share unavailable"));
    const d = data || {};
    const text = [d.text, d.url].filter(Boolean).join("\n");
    if (d.files && d.files.length) {
      const f = d.files[0];
      return blobToBase64(f).then(function (b64) {
        return p.share({ title: d.title || "", text: text, name: f.name || "electric-pro", mime: f.type || "application/octet-stream", data: b64 });
      }).then(function () { return undefined; });
    }
    return Promise.resolve(p.share({ title: d.title || "", text: text })).then(function () { return undefined; });
  }

  // ---------- ориентация ----------
  let locked = false;
  function lockOrientation(mode) {
    const p = plugin();
    if (!p) return Promise.reject(new Error("orientation unavailable"));
    locked = mode !== "unlock";
    return Promise.resolve(p.setOrientation({ mode: mode })).then(function () { return undefined; });
  }
  function unlockOrientation() {
    if (!locked) return;
    locked = false;
    const p = plugin();
    if (p) Promise.resolve(p.setOrientation({ mode: "unlock" })).catch(function () {});
  }

  function info() {
    const p = plugin();
    return p ? Promise.resolve(p.getInfo()).catch(function () { return null; }) : Promise.resolve(null);
  }

  window.EP.Native = {
    isNative: isNative, available: available,
    printHtml: printHtml, saveBlob: saveBlob, saveBase64: saveBase64, share: share,
    lockOrientation: lockOrientation, unlockOrientation: unlockOrientation, info: info,
    // для тестов
    _pageOf: pageOf, _mimeFor: mimeFor, _dataUrlParts: dataUrlParts
  };

  if (!isNative()) return;           // браузер / TWA — дальше ничего не трогаем
  try { document.documentElement.dataset.native = "1"; } catch (e) {}

  // 1) window.open("") → «окно печати»; внешняя ссылка → системный браузер.
  const origOpen = window.open;
  window.open = function (url) {
    const u = String(url == null ? "" : url).trim();
    if (!u || u === "about:blank") return printWindow();
    if (/^https?:/i.test(u)) {
      try {
        const B = cap().Plugins.Browser;
        if (B && B.open) { B.open({ url: u }); return { closed: false, close: function () {}, focus: function () {}, document: null }; }
      } catch (e) {}
    }
    return origOpen ? origOpen.apply(window, arguments) : null;
  };

  // 2) скачивание: blob:/data: ссылки с атрибутом download → системный «Сохранить как»
  try {
    const origCreate = URL.createObjectURL.bind(URL);
    const origRevoke = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = function (obj) {
      const u = origCreate(obj);
      try { if (typeof Blob !== "undefined" && obj instanceof Blob) blobs.set(u, obj); } catch (e) {}
      return u;
    };
    URL.revokeObjectURL = function (u) {
      setTimeout(function () { blobs.delete(u); try { origRevoke(u); } catch (e) {} }, 60000);
    };
  } catch (e) {}
  const origClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    const href = String(this.getAttribute("href") || "");
    if (this.hasAttribute("download") && /^(blob|data):/i.test(href)) { downloadUrl(href, nameOf(this, href)); return; }
    return origClick.apply(this, arguments);
  };
  // та же ссылка, нажатая пальцем (а не программным click())
  document.addEventListener("click", function (e) {
    const a = e.target && e.target.closest ? e.target.closest("a[download]") : null;
    if (!a) return;
    const href = String(a.getAttribute("href") || "");
    if (!/^(blob|data):/i.test(href)) return;
    e.preventDefault();
    downloadUrl(href, nameOf(a, href));
  }, true);

  // 3) navigator.share — в WebView его нет вовсе
  try {
    Object.defineProperty(navigator, "share", { configurable: true, writable: true, value: share });
    Object.defineProperty(navigator, "canShare", { configurable: true, writable: true, value: function () { return true; } });
  } catch (e) {}

  // 4) «Полный экран». Capacitor отменяет настоящий fullscreen сразу же (элемент входит
  // и тут же выходит — fullscreenchange сбрасывал бы режим в чате, развёртке и
  // однолинейке). Приложению же нужно лишь состояние: окно WebView и так во весь экран,
  // а вид задают его собственные классы. Поэтому полноэкранный режим ЭМУЛИРУЕМ: элемент
  // получает класс ep-vfs (аналог :fullscreen), document.fullscreenElement честно его
  // возвращает, события fullscreenchange приходят как в браузере, а выход снимает
  // блокировку ориентации — тоже как в браузере.
  let vfs = null;
  function fire(el) {
    ["fullscreenchange", "webkitfullscreenchange"].forEach(function (type) {
      try { (el && el.isConnected ? el : document).dispatchEvent(new Event(type, { bubbles: true })); } catch (e) {}
    });
  }
  function current() {
    // элемент убрали из документа — браузер в этом случае сам выходит из полноэкранного
    if (vfs && !vfs.isConnected) {
      const el = vfs; vfs = null; el.classList.remove("ep-vfs"); unlockOrientation();
      setTimeout(function () { fire(null); }, 0);
    }
    return vfs;
  }
  function request() {
    const el = this;
    if (current() === el) return Promise.resolve();
    if (vfs) vfs.classList.remove("ep-vfs");
    vfs = el; el.classList.add("ep-vfs");
    setTimeout(function () { fire(el); }, 0);
    return Promise.resolve();
  }
  function exit() {
    const el = current();
    if (!el) return Promise.resolve();
    vfs = null; el.classList.remove("ep-vfs");
    unlockOrientation();
    setTimeout(function () { fire(el); }, 0);
    return Promise.resolve();
  }
  function defGet(obj, prop, get) { try { Object.defineProperty(obj, prop, { configurable: true, get: get }); } catch (e) {} }
  defGet(Document.prototype, "fullscreenElement", current);
  defGet(Document.prototype, "webkitFullscreenElement", current);
  defGet(Document.prototype, "webkitCurrentFullScreenElement", current);
  defGet(Document.prototype, "fullscreenEnabled", function () { return true; });
  defGet(Document.prototype, "webkitFullscreenEnabled", function () { return true; });
  Element.prototype.requestFullscreen = request;
  Element.prototype.webkitRequestFullscreen = request;
  Element.prototype.webkitRequestFullScreen = request;
  Document.prototype.exitFullscreen = exit;
  Document.prototype.webkitExitFullscreen = exit;
  Document.prototype.webkitCancelFullScreen = exit;

  // 5) screen.orientation.lock — развёртка стены (⤢) переворачивает в горизонталь
  try {
    if (window.screen && screen.orientation) {
      screen.orientation.lock = function (o) {
        const s = String(o || "");
        return lockOrientation(/landscape/.test(s) ? "landscape" : (/portrait/.test(s) ? "portrait" : "unlock"));
      };
      screen.orientation.unlock = function () { unlockOrientation(); };
    }
  } catch (e) {}

  // 6) системная кнопка «назад»: сначала выходим из «полного экрана», потом — по истории
  // приложения (её слушают роутер и «Проект квартиры»), на первом экране — сворачиваем
  // приложение, как любое Android-приложение.
  try {
    const App = cap().Plugins.App;
    if (App && App.addListener) {
      App.addListener("backButton", function (ev) {
        if (current()) { document.exitFullscreen(); return; }
        if (ev && ev.canGoBack) { window.history.back(); return; }
        if (App.minimizeApp) App.minimizeApp();
      });
    }
  } catch (e) {}
})();
