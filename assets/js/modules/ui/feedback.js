/* Electric Pro V29 — встроенный чат замечаний (💬).

   Просьба пользователя: «добавь пожалуйста внутрь кнопку (чат) — я прям там косяки
   буду писать, или те кто тестит, а после копировать и присылать тебе», затем —
   «чат хотел сделать онлайн, и видеть переписку и сообщения других, общий скажем так».

   Поэтому здесь ДВЕ вкладки:
   · «Общий чат» — ОНЛАЙН, Firestore-коллекция chat_messages, одна на всех:
     каждый одобренный пользователь читает сообщения остальных и пишет свои
     (onSnapshot → живое обновление без перезагрузки). Правила доступа —
     firestore.rules: читать может isApproved()/админ, писать — только от своего
     uid, править задним числом нельзя вообще, удалять — автор своего сообщения
     или админ (модерация).
   · «Мои заметки» — ЛОКАЛЬНЫЙ журнал (localStorage), как было до онлайна: работает
     без входа и без интернета, а «📋 Скопировать всё» отдаёт весь журнал одним
     текстом в буфер — переслать разработчику любым мессенджером.

   Офлайн/без входа общий чат не теряет написанное: сообщение уходит в очередь
   (localStorage) и отправляется само, как только появится вход и связь.

   К каждой записи АВТОМАТИЧЕСКИ подшивается контекст (экран, проект, версия сборки,
   устройство, размер экрана) — по опыту сессии именно его всегда приходится
   выспрашивать отдельно, а без него репорт часто невоспроизводим. В общем чате его
   видят все участники — так и задумано (это рабочий чат тестирования). */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const KEY = "ep_feedback_v1";      // локальные заметки
  const QKEY = "ep_chat_queue_v1";   // офлайн-очередь общего чата
  const COL = "chat_messages";       // общая коллекция (см. firestore.rules)
  const MAX = 300;   // журнал устройства, не архив: старые записи вытесняются
  const LIMIT = 120; // сколько последних сообщений чата держим на экране
  const MAXLEN = 2000; // тот же предел, что и в правилах Firestore
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function read() {
    try { const v = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; }
  }
  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX))); return true; } catch (e) { return false; }
  }
  // версия сборки = кэш-бастинг ?v=NNNN из подключённых скриптов (его ставит CI,
  // см. scripts/bump-cache-version.js) — по нему сразу видно, на какой версии баг
  function build() {
    try {
      const m = String(document.documentElement.outerHTML).match(/[?&]v=(\d+)/);
      return m ? m[1] : "—";
    } catch (e) { return "—"; }
  }
  function ctx() {
    const st = window.EP && EP.state ? EP.state : {};
    let proj = "";
    try { const p = EP.Plan && EP.Plan.Core && EP.Plan.Core.project; if (p) proj = p.name || ""; } catch (e) {}
    return {
      route: st.currentRoute || location.hash || "—",
      project: proj,
      build: build(),
      screen: (window.innerWidth || 0) + "×" + (window.innerHeight || 0),
      ua: (navigator.userAgent || "").slice(0, 120)
    };
  }
  function add(text) {
    const t = String(text || "").trim();
    if (!t) return null;
    const list = read();
    const rec = Object.assign({ at: Date.now(), text: t }, ctx());
    list.push(rec);
    write(list);
    return rec;
  }
  const fmtDate = (ms) => { try { return new Date(ms).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); } catch (e) { return String(ms); } };
  // текст для отправки: сначала общая шапка (устройство/версия), потом записи по одной
  function asText() {
    const list = read();
    if (!list.length) return "";
    const last = list[list.length - 1];
    const head = `Electric Pro — замечания (${list.length} шт.)\nСборка: ${last.build} · Экран: ${last.screen}\n${last.ua}\n`;
    return head + list.map((r, i) =>
      `\n#${i + 1} ${fmtDate(r.at)} · ${r.route}${r.project ? " · проект «" + r.project + "»" : ""}\n${r.text}`
    ).join("\n");
  }
  async function copyText(txt) {
    if (!txt) return false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(txt); return true; }
    } catch (e) { /* нет доступа к буферу (не-HTTPS, старый WebView) — фолбэк ниже */ }
    try {
      // фолбэк для старых WebView: временная textarea + execCommand («Скопировать логи»
      // в logger.js работает так же; глобальный user-select:none её не касается —
      // поля ввода в белом списке, см. base.css)
      const ta = document.createElement("textarea");
      ta.value = txt; ta.style.cssText = "position:fixed;left:-2000px;top:0";
      document.body.appendChild(ta); ta.focus(); ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch (e) { return false; }
  }
  const copyAll = () => copyText(asText());

  // ---------- общий ОНЛАЙН-чат (Firestore) ----------
  let tab = "chat";        // "chat" | "notes"
  let msgs = [];           // последние LIMIT сообщений общего чата (по возрастанию времени)
  let unsub = null;        // активная подписка onSnapshot (только пока чат открыт)
  let chatState = "off";   // "off" (нет входа/БД) | "live" | "err"
  let chatErr = "";
  let flushing = false;

  function fdb() { try { return (window.EP && EP.Firebase && EP.Firebase.db) || null; } catch (e) { return null; } }
  function me() {
    try {
      const u = (EP.Auth && EP.Auth.currentUser && EP.Auth.currentUser()) || (EP.state && EP.state.user) || null;
      return u && u.uid ? u : null;
    } catch (e) { return null; }
  }
  function myUid() { const u = me(); return u ? u.uid : ""; }
  function myName() {
    const u = me() || {};
    const p = (window.EP && EP.state && EP.state.profile) || {};
    return String(p.displayName || p.name || u.displayName || u.email || "Мастер").slice(0, 60);
  }
  function isAdm() { try { return !!(EP.Auth && EP.Auth.isAdmin && EP.Auth.isAdmin()); } catch (e) { return false; } }
  function stamp() { try { return window.firebase.firestore.FieldValue.serverTimestamp(); } catch (e) { return null; } }
  // время сообщения: серверное, если уже подтверждено; иначе клиентское ts
  // (у только что отправленного serverTimestamp в локальном снапшоте ещё null —
  // поэтому и сортируем/показываем по ts, а at храним как авторитетное значение)
  function atMs(r) {
    try { if (r && r.at && typeof r.at.toMillis === "function") return r.at.toMillis(); } catch (e) {}
    return (r && r.ts) || 0;
  }

  function qread() { try { const v = JSON.parse(localStorage.getItem(QKEY) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function qwrite(l) { try { localStorage.setItem(QKEY, JSON.stringify(l.slice(-50))); } catch (e) {} }
  function qAdd(rec) { const l = qread(); l.push(rec); qwrite(l); }

  function docOf(rec) {
    return {
      uid: rec.uid || myUid(), name: rec.name || myName(), text: String(rec.text || "").slice(0, MAXLEN),
      ts: rec.ts || Date.now(), at: stamp(),
      route: rec.route || "", project: rec.project || "", build: rec.build || "", screen: rec.screen || "", ua: rec.ua || ""
    };
  }
  // отправить накопленное офлайн (по одному, с удалением из очереди только по факту успеха)
  function flushQueue() {
    if (flushing) return Promise.resolve(0);
    const d = fdb(), uid = myUid();
    let l = qread();
    if (!d || !uid || !l.length) return Promise.resolve(0);
    flushing = true;
    let sent = 0;
    const step = () => {
      l = qread();
      if (!l.length) return Promise.resolve();
      const rec = l[0];
      return d.collection(COL).add(docOf(Object.assign({}, rec, { uid: uid }))).then(() => {
        const cur = qread(); cur.shift(); qwrite(cur); sent++;
        return step();
      }).catch(() => undefined); // не смогли — оставляем в очереди, попробуем позже
    };
    return step().then(() => { flushing = false; return sent; }, () => { flushing = false; return sent; });
  }

  function subscribe() {
    if (unsub) return;
    const d = fdb(), uid = myUid();
    if (!d || !uid) { chatState = "off"; return; }
    try {
      unsub = d.collection(COL).orderBy("ts", "desc").limit(LIMIT).onSnapshot((snap) => {
        const arr = [];
        snap.forEach((doc) => arr.push(Object.assign({ id: doc.id }, doc.data())));
        msgs = arr.reverse();
        chatState = "live"; chatErr = "";
        if (isOpen()) patchChat();
        flushQueue().then((n) => { if (n && isOpen()) patchChat(); });
      }, (err) => {
        chatState = "err";
        chatErr = String((err && (err.code || err.message)) || "ошибка");
        if (isOpen()) patchChat();
      });
    } catch (e) { chatState = "err"; chatErr = String(e && e.message || e); }
  }
  function unsubscribe() { if (unsub) { try { unsub(); } catch (e) {} unsub = null; } }

  function send(text) {
    const t = String(text || "").trim();
    if (!t) return Promise.resolve({ ok: false, queued: false });
    const c = ctx();
    const rec = Object.assign({ uid: myUid(), name: myName(), text: t.slice(0, MAXLEN), ts: Date.now() }, c);
    const d = fdb(), uid = myUid();
    if (!d || !uid) { qAdd(rec); return Promise.resolve({ ok: false, queued: true }); }
    try {
      return d.collection(COL).add(docOf(rec)).then(() => ({ ok: true, queued: false }))
        .catch((e) => { qAdd(rec); chatErr = String((e && (e.code || e.message)) || ""); return { ok: false, queued: true }; });
    } catch (e) { qAdd(rec); return Promise.resolve({ ok: false, queued: true }); }
  }
  function removeMsg(id) {
    const d = fdb(); if (!d || !id) return Promise.resolve(false);
    try { return d.collection(COL).doc(id).delete().then(() => true).catch(() => false); }
    catch (e) { return Promise.resolve(false); }
  }
  // текст общего чата для пересылки разработчику (у него доступа к базе нет —
  // копипаста остаётся основным каналом, как и у локальных заметок)
  function chatText() {
    if (!msgs.length) return "";
    const head = `Electric Pro — общий чат (${msgs.length} посл. сообщений)\n`;
    return head + msgs.map((r) =>
      `\n[${fmtDate(atMs(r))}] ${r.name || "?"} · ${r.route || "—"}${r.project ? " · «" + r.project + "»" : ""} · v${r.build || "—"}\n${r.text || ""}`
    ).join("\n");
  }

  // ---------- UI: свой оверлей (работает на ЛЮБОМ экране, не только в плане) ----------
  function ovEl() { return document.getElementById("ep-fb-ov"); }
  function isOpen() { const ov = ovEl(); return !!(ov && !ov.hidden); }

  function statusHtml() {
    const q = qread().length;
    if (chatState === "live") return `<span class="ep-fb-st is-live">🟢 онлайн</span>${q ? ` · <span class="ep-fb-st">${q} в очереди</span>` : ""}`;
    if (chatState === "err") return `<span class="ep-fb-st is-err">🔴 нет доступа к чату (${esc(chatErr)})</span>${q ? ` · ${q} в очереди` : ""}`;
    return `<span class="ep-fb-st">⚪ офлайн — уйдёт при входе${q ? ", в очереди " + q : ""}</span>`;
  }
  function chatListHtml() {
    const uid = myUid(), adm = isAdm();
    const q = qread();
    const rows = msgs.map((r) => {
      const mine = uid && r.uid === uid;
      const meta = `${esc(fmtDate(atMs(r)))} · ${esc(r.route || "—")}${r.project ? " · " + esc(r.project) : ""} · v${esc(r.build || "—")}`;
      const del = (mine || adm) ? `<button type="button" class="ep-plan-mini ep-clickable" data-fb-msgdel="${esc(r.id)}" aria-label="Удалить сообщение">✕</button>` : "";
      return `<div class="ep-fb-msg${mine ? " is-mine" : ""}">
        <div class="ep-fb-msgtop"><b>${esc(r.name || "Мастер")}</b>${del}</div>
        <div class="ep-fb-text">${esc(r.text || "")}</div>
        <div class="ep-fb-meta">${meta}</div>
      </div>`;
    }).join("");
    const pend = q.map((r) => `<div class="ep-fb-msg is-mine is-pending">
      <div class="ep-fb-msgtop"><b>${esc(r.name || "Я")}</b><span class="ep-fb-st">⏳ не отправлено</span></div>
      <div class="ep-fb-text">${esc(r.text || "")}</div>
    </div>`).join("");
    if (!rows && !pend) return `<div class="ep-fb-empty">${chatState === "live" ? "Пока никто ничего не писал." : "Сообщений нет."}</div>`;
    return rows + pend;
  }
  function notesListHtml() {
    const list = read().slice().reverse();
    if (!list.length) return `<div class="ep-fb-empty">Пока пусто.</div>`;
    return list.map((r, i) => `
      <div class="ep-fb-item">
        <div class="ep-fb-meta">${esc(fmtDate(r.at))} · ${esc(r.route)}${r.project ? " · " + esc(r.project) : ""} · v${esc(r.build)}
          <button type="button" class="ep-plan-mini ep-clickable" data-fb-del="${list.length - 1 - i}" aria-label="Удалить запись">✕</button></div>
        <div class="ep-fb-text">${esc(r.text)}</div>
      </div>`).join("");
  }
  // обновление ТОЛЬКО списка и статуса — чтобы приходящие сообщения не стирали
  // уже набранный, но не отправленный текст в поле ввода (и не сбивали фокус)
  function patchChat() {
    const ov = ovEl(); if (!ov) return;
    const st = ov.querySelector(".ep-fb-status");
    const box = ov.querySelector(".ep-fb-list");
    if (st) st.innerHTML = statusHtml();
    if (!box) return;
    const atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 60;
    box.innerHTML = tab === "chat" ? chatListHtml() : notesListHtml();
    if (tab === "chat" && atBottom) box.scrollTop = box.scrollHeight;
  }
  function render() {
    let ov = ovEl();
    if (!ov) { ov = document.createElement("div"); ov.id = "ep-fb-ov"; ov.className = "ep-fb-ov"; document.body.appendChild(ov); }
    const chat = tab === "chat";
    ov.innerHTML = `<div class="ep-fb-card card glass">
      <div class="ep-fb-head">
        <b>💬 Замечания и баги</b>
        <span class="ep-fb-sp"></span>
        <button type="button" class="ep-plan-mini ep-clickable" data-fb-close aria-label="Закрыть">✕</button>
      </div>
      <div class="ep-fb-tabs">
        <button type="button" class="ep-plan-chip ep-clickable${chat ? " on" : ""}" data-fb-tab="chat">Общий чат</button>
        <button type="button" class="ep-plan-chip ep-clickable${chat ? "" : " on"}" data-fb-tab="notes">Мои заметки</button>
        <span class="ep-fb-sp"></span>
        <span class="ep-fb-status">${chat ? statusHtml() : ""}</span>
      </div>
      <div class="ep-fb-hint">${chat
        ? "Общий чат тестирования: сообщения видят все участники. К записи подшивается экран, проект и версия сборки — так баг воспроизводим."
        : "Заметки только на этом устройстве (работают без входа и интернета). «Скопировать всё» → отправь текст разработчику."}</div>
      <div class="ep-fb-list">${chat ? chatListHtml() : notesListHtml()}</div>
      <textarea id="ep-fb-input" class="ep-fb-input" rows="2" placeholder="${chat ? "Сообщение в общий чат…" : "Например: при тапе по проёму в развёртке зависает экран…"}"></textarea>
      <div class="ep-fb-row">
        ${chat
          ? `<button type="button" class="btn btn-primary ep-clickable" data-fb-send>Отправить</button>
             <button type="button" class="btn btn-ghost ep-clickable" data-fb-copychat>📋 Скопировать чат</button>`
          : `<button type="button" class="btn btn-primary ep-clickable" data-fb-add>+ Записать</button>
             <button type="button" class="btn btn-ghost ep-clickable" data-fb-copy>📋 Скопировать всё</button>
             ${read().length ? `<button type="button" class="btn btn-ghost ep-clickable" data-fb-clear>Очистить</button>` : ""}`}
      </div>
    </div>`;
    ov.hidden = false;
    const box = ov.querySelector(".ep-fb-list");
    if (box && chat) box.scrollTop = box.scrollHeight;
    const inp = document.getElementById("ep-fb-input");
    if (inp) setTimeout(() => { try { inp.focus(); } catch (e) {} }, 30);
  }
  function open() {
    // чат открывают и из бургер-меню — не оставлять выдвинутое меню под оверлеем
    try { if (window.EP && EP.AppShell && EP.AppShell.closeDrawer) EP.AppShell.closeDrawer(); } catch (e) {}
    render(); subscribe();
    flushQueue().then((n) => { if (n && isOpen()) patchChat(); });
  }
  function close() { unsubscribe(); const ov = ovEl(); if (ov) { ov.hidden = true; ov.innerHTML = ""; } }
  function toast(msg) {
    const ov = ovEl(); if (!ov) return;
    let t = ov.querySelector(".ep-fb-toast");
    if (!t) { t = document.createElement("div"); t.className = "ep-fb-toast"; ov.appendChild(t); }
    t.textContent = msg;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { if (t && t.parentNode) t.parentNode.removeChild(t); }, 1800);
  }

  document.addEventListener("click", (e) => {
    const t = e.target;
    if (t.closest("[data-fb-open]")) { e.preventDefault(); open(); return; }
    const ov = ovEl(); if (!ov || ov.hidden) return;
    if (t.closest("[data-fb-close]")) { close(); return; }
    const tb = t.closest("[data-fb-tab]");
    if (tb) { tab = tb.getAttribute("data-fb-tab") === "notes" ? "notes" : "chat"; render(); if (tab === "chat") subscribe(); return; }
    if (t.closest("[data-fb-send]")) {
      const inp = document.getElementById("ep-fb-input");
      const v = inp ? inp.value : "";
      if (!String(v).trim()) { toast("Напиши сообщение"); return; }
      if (inp) inp.value = "";
      send(v).then((r) => { toast(r.ok ? "Отправлено" : "Сохранено — уйдёт при входе"); patchChat(); });
      return;
    }
    if (t.closest("[data-fb-copychat]")) {
      copyText(chatText()).then((ok) => toast(ok ? "Чат скопирован" : "Не удалось скопировать"));
      return;
    }
    const md = t.closest("[data-fb-msgdel]");
    if (md) {
      if (!confirm("Удалить сообщение?")) return;
      removeMsg(md.getAttribute("data-fb-msgdel")).then((ok) => { if (!ok) toast("Не удалось удалить"); });
      return;
    }
    if (t.closest("[data-fb-add]")) {
      const inp = document.getElementById("ep-fb-input");
      const v = inp ? inp.value : "";
      if (!String(v).trim()) { toast("Напиши текст замечания"); return; }
      add(v);
      render();
      toast("Записано");
      return;
    }
    if (t.closest("[data-fb-copy]")) {
      copyAll().then((ok) => toast(ok ? "Скопировано — отправляй" : "Не удалось скопировать"));
      return;
    }
    if (t.closest("[data-fb-clear]")) {
      if (!confirm("Удалить все записи?")) return;
      write([]); render(); return;
    }
    const del = t.closest("[data-fb-del]");
    if (del) {
      const i = Number(del.getAttribute("data-fb-del"));
      const list = read();
      if (Number.isFinite(i) && i >= 0 && i < list.length) { list.splice(i, 1); write(list); render(); }
      return;
    }
    // клик по затемнению (мимо карточки) — закрыть
    if (t === ov) close();
  });

  // вход случился (или сменился) при открытом чате — подписаться и дослать очередь
  window.addEventListener("ep:auth-changed", () => {
    unsubscribe();
    if (isOpen()) { subscribe(); patchChat(); }
    flushQueue().then((n) => { if (n && isOpen()) patchChat(); });
  });

  EP.Feedback = {
    open, close, add, read, asText, copyAll, count: () => read().length,
    send, messages: () => msgs.slice(), chatText, queue: qread, flushQueue,
    state: () => chatState
  };
})();
