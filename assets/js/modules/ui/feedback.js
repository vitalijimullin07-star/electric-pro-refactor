/* Electric Pro V29 — чат (💬): общий онлайн-чат, личные сообщения, журнал замечаний.

   История просьб пользователя:
   · «добавь пожалуйста внутрь кнопку (чат) — я прям там косяки буду писать, или те кто
     тестит, а после копировать и присылать тебе» → локальный журнал («Заметки»);
   · «чат хотел сделать онлайн, и видеть переписку и сообщения других, общий скажем так»
     → общая коллекция chat_messages с живой подпиской;
   · «практически полноценный чат, я бы наверное как [старый мессенджер] согласился» →
     эта версия: поле
     ввода растёт по тексту, правка своего сообщения, ответ на сообщение, кто в сети,
     личная переписка, автопрокрутка к последнему, звук, красная метка у иконки, вызов
     чата с ЛЮБОГО экрана (плавающая кнопка), история «загрузить предыдущие»;
   · «экран чата хочется ближе к [старому мессенджеру]» → облик «Классика» (retro):
     ретро-окно, подписи авторов цветом, цветок статуса. НАЗВАНИЕ чужого продукта в
     интерфейсе НЕ используем — только свой ярлык «Классика» (товарный знак остаётся
     за правообладателем и после закрытия сервиса), чужих картинок/звуков тоже нет.

   Коллекции (правила — firestore.rules):
   · chat_messages — общий чат: читают одобренные, пишут от своего uid, автор правит
     свой текст, удаляет автор или админ;
   · chat_dm — личные: видят ТОЛЬКО двое участников (uids), админ здесь НЕ читает;
   · chat_presence/{uid} — «кто в сети»: свой документ, «сердцебиение» раз в 2 минуты,
     пока приложение открыто (онлайн = свежее 5 минут).

   Уведомления: пока приложение ЖИВО (открыто или свёрнуто, но страница не убита) —
   Notification API через service worker + звук + красная метка на кнопке чата и на
   иконке приложения. НАСТОЯЩИЙ push при полностью закрытом приложении требует ключа
   Web Push (VAPID) из консоли Firebase и серверного триггера — здесь его НЕТ, это
   отдельный шаг (нужен ключ от владельца проекта).

   Локальные заметки оставлены НАМЕРЕННО: работают без входа и интернета, и «📋
   Скопировать всё» остаётся способом переслать текст разработчику (у него доступа
   к базе нет). */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const KEY = "ep_feedback_v1";      // локальные заметки
  const QKEY = "ep_chat_queue_v1";   // офлайн-очередь общего чата
  const SEENK = "ep_chat_seen_v1";   // что уже прочитано { pub: ts }
  const SNDK = "ep_chat_sound_v1";   // "0" — звук выключен
  const COL = "chat_messages", DMC = "chat_dm", PRES = "chat_presence";
  const BANS = "chat_bans", REPS = "chat_reports";
  const SKINK = "ep_chat_skin_v1";   // "retro" (по умолчанию) | "modern"
  const MAX = 300;    // локальный журнал устройства
  const LIMIT = 120;  // сколько последних сообщений держим живыми
  const DM_LIMIT = 500;
  const MAXLEN = 2000;
  const ONLINE_MS = 5 * 60 * 1000;
  const HB_MS = 2 * 60 * 1000;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const cut = (s, n) => { const t = String(s || ""); return t.length > n ? t.slice(0, n - 1) + "…" : t; };

  // ---------- локальные заметки ----------
  function read() {
    try { const v = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; }
  }
  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX))); return true; } catch (e) { return false; }
  }
  // версия сборки = кэш-бастинг ?v=NNNN из разметки (ставит CI) — сразу видно, на какой
  // версии баг; без этого репорт часто невоспроизводим
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
  const fmtTime = (ms) => { try { return new Date(ms).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }); } catch (e) { return ""; } };
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
      const ta = document.createElement("textarea");
      ta.value = txt; ta.style.cssText = "position:fixed;left:-2000px;top:0";
      document.body.appendChild(ta); ta.focus(); ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch (e) { return false; }
  }
  const copyAll = () => copyText(asText());

  // ---------- состояние чата ----------
  let view = "chat";          // "chat" | "people" | "dm" | "notes"
  let dmUid = "", dmName = "";
  let msgs = [], older = [], dmAll = [], people = [];
  let unsubPub = null, unsubDm = null, unsubPres = null;
  let chatState = "off", chatErr = "";
  let flushing = false, loadingOlder = false, noMoreOlder = false;
  let replyTo = null;         // на какое сообщение отвечаем
  let editId = null;          // правим своё сообщение
  let openMsgId = null;       // у какого сообщения раскрыты действия (тап по сообщению)
  let hbTimer = null;
  let pendingNew = 0;         // «↓ N новых», если список прокручен вверх
  // «первый снапшот получен» — ИМЕННО флаг, а не проверка «msgs пуст»: на пустом чате
  // самое первое сообщение приходило вторым снапшотом при msgs.length === 0 и молча
  // не давало ни звука, ни уведомления (поймано живым прогоном)
  let gotPub = false, gotDm = false;
  const seenPending = new Set();   // какие личные уже помечаем прочитанными (без петли)
  let bans = [], reports = [];     // модерация: кто забанен и на что жалуются
  let unsubBans = null, unsubReps = null;

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
  // время сообщения: серверное, если пришло; иначе клиентское ts (у только что
  // отправленного serverTimestamp в локальном снапшоте ещё null — pending write)
  function atMs(r) {
    try { if (r && r.at && typeof r.at.toMillis === "function") return r.at.toMillis(); } catch (e) {}
    return (r && r.ts) || 0;
  }
  function seenRead() { try { const v = JSON.parse(localStorage.getItem(SEENK) || "{}"); return v && typeof v === "object" ? v : {}; } catch (e) { return {}; } }
  function seenWrite(v) { try { localStorage.setItem(SEENK, JSON.stringify(v)); } catch (e) {} }
  const soundOn = () => localStorage.getItem(SNDK) !== "0";
  // облик чата: "retro" — «Классика», окно в духе мессенджеров 2000-х (просьба
  // пользователя про вид старого мессенджера), "modern" — прежние пузыри. Переключается
  // 🌼/💬 в шапке, помнится на устройстве. ИМЯ ЧУЖОГО ПРОДУКТА В ИНТЕРФЕЙСЕ НЕ
  // ИСПОЛЬЗУЕМ (товарный знак живёт и после закрытия сервиса) — только свой «Классика»;
  // старое сохранённое значение прежнего ярлыка тоже читается как retro (всё, что не "modern").
  const skin = () => (localStorage.getItem(SKINK) === "modern" ? "modern" : "retro");
  const isBanned = (uid) => bans.some((b) => b.uid === uid);
  const iAmBanned = () => isBanned(myUid());

  // ---------- офлайн-очередь ----------
  function qread() { try { const v = JSON.parse(localStorage.getItem(QKEY) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function qwrite(l) { try { localStorage.setItem(QKEY, JSON.stringify(l.slice(-50))); } catch (e) {} }
  function qAdd(rec) { const l = qread(); l.push(rec); qwrite(l); }
  function docOf(rec) {
    const d = {
      uid: rec.uid || myUid(), name: rec.name || myName(), text: String(rec.text || "").slice(0, MAXLEN),
      ts: rec.ts || Date.now(), at: stamp(),
      route: rec.route || "", project: rec.project || "", build: rec.build || "", screen: rec.screen || "", ua: rec.ua || ""
    };
    if (rec.replyTo) d.replyTo = rec.replyTo;
    return d;
  }
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
      }).catch(() => undefined);      // не смогли — оставляем в очереди
    };
    return step().then(() => { flushing = false; return sent; }, () => { flushing = false; return sent; });
  }

  // ---------- уведомления, звук, метка ----------
  const canNotify = () => (typeof Notification !== "undefined" && Notification.permission === "granted");
  function askNotify() {
    if (typeof Notification === "undefined") return Promise.resolve(false);
    try { return Promise.resolve(Notification.requestPermission()).then((r) => r === "granted"); }
    catch (e) { return Promise.resolve(false); }
  }
  function notify(title, body, tag) {
    if (!canNotify()) return;
    const opts = { body: body, tag: tag || "ep-chat", icon: "assets/icon-192.png", badge: "assets/icon-192.png", data: { chat: 1 } };
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then((reg) => reg.showNotification(title, opts)).catch(() => { try { new Notification(title, opts); } catch (e2) {} });
        return;
      }
      new Notification(title, opts);
    } catch (e) {}
  }
  function ping() {
    if (!soundOn()) return;
    try { if (EP.SoundFeedback && EP.SoundFeedback.play) { EP.SoundFeedback.play("chime", true); return; } } catch (e) {}
    try {   // фолбэк, если модуль звука не подключён
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      const actx = ping._c || (ping._c = new C());
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = "sine"; o.frequency.value = 880; g.gain.value = 0.05;
      o.connect(g); g.connect(actx.destination);
      o.start(); o.stop(actx.currentTime + 0.12);
    } catch (e) {}
  }
  function unreadPub() {
    const uid = myUid(), s = seenRead(), from = s.pub || 0;
    return msgs.filter((m) => m.uid !== uid && atMs(m) > from).length;
  }
  function unreadDmBy() {
    const uid = myUid(), map = {};
    dmAll.forEach((m) => { if (m.to === uid && !m.seen) map[m.from] = (map[m.from] || 0) + 1; });
    return map;
  }
  function unreadTotal() {
    const dm = unreadDmBy();
    return unreadPub() + Object.keys(dm).reduce((s, k) => s + dm[k], 0);
  }
  // красная метка у ВСЕХ кнопок вызова чата (шапка плана, бургер-меню, плавающая
  // кнопка) — через data-атрибут: точку рисует CSS, DOM-хирургия не нужна
  function paintBadge() {
    const n = unreadTotal();
    document.querySelectorAll("[data-fb-open]").forEach((b) => {
      if (n > 0) b.setAttribute("data-unread", n > 99 ? "99+" : String(n));
      else b.removeAttribute("data-unread");
    });
    try {
      if (n > 0 && navigator.setAppBadge) navigator.setAppBadge(n);
      else if (navigator.clearAppBadge) navigator.clearAppBadge();
    } catch (e) {}
  }

  // ---------- подписки ----------
  function subPublic() {
    if (unsubPub) return;
    const d = fdb(), uid = myUid();
    if (!d || !uid) { chatState = "off"; return; }
    try {
      unsubPub = d.collection(COL).orderBy("ts", "desc").limit(LIMIT).onSnapshot((snap) => {
        const arr = [];
        snap.forEach((doc) => arr.push(Object.assign({ id: doc.id }, doc.data())));
        const prevIds = new Set(msgs.map((m) => m.id));
        const first = !gotPub; gotPub = true;
        msgs = arr.reverse();
        chatState = "live"; chatErr = "";
        if (!first) onIncoming(msgs.filter((m) => !prevIds.has(m.id) && m.uid !== myUid()), null);
        if (isOpen()) patch();
        paintBadge();
        flushQueue().then((n) => { if (n && isOpen()) patch(); });
      }, (err) => {
        chatState = "err";
        chatErr = String((err && (err.code || err.message)) || "ошибка");
        if (isOpen()) patch();
      });
    } catch (e) { chatState = "err"; chatErr = String((e && e.message) || e); }
  }
  // ВСЯ моя личка ОДНОЙ подпиской (список людей с превью, непрочитанные и открытый
  // диалог — из неё же). array-contains БЕЗ orderBy: так не нужен составной индекс
  // Firestore, сортируем на клиенте. ОГРАНИЧЕНИЕ: при > DM_LIMIT сообщений подтянется
  // не обязательно самый свежий срез (для рабочей переписки этого хватает).
  function subDm() {
    if (unsubDm) return;
    const d = fdb(), uid = myUid();
    if (!d || !uid) return;
    try {
      unsubDm = d.collection(DMC).where("uids", "array-contains", uid).limit(DM_LIMIT).onSnapshot((snap) => {
        const arr = [];
        snap.forEach((doc) => arr.push(Object.assign({ id: doc.id }, doc.data())));
        const prevIds = new Set(dmAll.map((m) => m.id));
        const first = !gotDm; gotDm = true;
        dmAll = arr.sort((a, b) => (a.ts || 0) - (b.ts || 0));
        if (!first) onIncoming(null, dmAll.filter((m) => !prevIds.has(m.id) && m.to === uid));
        if (isOpen()) patch();
        paintBadge();
      }, () => {});
    } catch (e) {}
  }
  function subPresence() {
    if (unsubPres) return;
    const d = fdb(), uid = myUid();
    if (!d || !uid) return;
    try {
      unsubPres = d.collection(PRES).limit(200).onSnapshot((snap) => {
        const arr = [];
        snap.forEach((doc) => arr.push(Object.assign({ uid: doc.id }, doc.data())));
        people = arr;
        if (isOpen() && (view === "people" || view === "dm")) patch();
      }, () => {});
    } catch (e) {}
  }
  // баны читают ВСЕ одобренные (клиент должен честно сказать «доступ ограничен»),
  // жалобы — только админ (правило read: isAdmin), поэтому подписка на них лишь у него
  function subBans() {
    if (unsubBans) return;
    const d = fdb(); if (!d || !myUid()) return;
    try {
      unsubBans = d.collection(BANS).limit(500).onSnapshot((snap) => {
        const arr = []; snap.forEach((doc) => arr.push(Object.assign({ uid: doc.id }, doc.data())));
        bans = arr;
        if (isOpen()) render(true);
      }, () => {});
    } catch (e) {}
  }
  function subReports() {
    if (unsubReps || !isAdm()) return;
    const d = fdb(); if (!d) return;
    try {
      unsubReps = d.collection(REPS).limit(200).onSnapshot((snap) => {
        const arr = []; snap.forEach((doc) => arr.push(Object.assign({ id: doc.id }, doc.data())));
        reports = arr.sort((a, b) => (b.ts || 0) - (a.ts || 0));
        if (isOpen() && view === "mod") patch();
      }, () => {});
    } catch (e) {}
  }
  function unsubAll() {
    [unsubPub, unsubDm, unsubPres, unsubBans, unsubReps].forEach((f) => { if (f) { try { f(); } catch (e) {} } });
    unsubPub = unsubDm = unsubPres = unsubBans = unsubReps = null;
  }
  function startAll() {
    if (!myUid() || !fdb()) { chatState = "off"; return; }
    subPublic(); subDm(); subPresence(); subBans(); subReports(); heartbeat();
    flushQueue().then(paintBadge);
  }
  // «сердцебиение» присутствия: пока страница видима — раз в 2 минуты
  function beat() {
    const d = fdb(), uid = myUid();
    if (!d || !uid || document.visibilityState === "hidden") return;
    try {
      d.collection(PRES).doc(uid).set({ name: myName(), at: Date.now(), route: (EP.state && EP.state.currentRoute) || "" }, { merge: true }).catch(() => {});
    } catch (e) {}
  }
  function heartbeat() {
    if (hbTimer) return;
    beat();
    hbTimer = setInterval(beat, HB_MS);
  }
  const isOnline = (p) => !!(p && p.at && Date.now() - p.at < ONLINE_MS);

  // новое сообщение (не моё) — звук + уведомление + «↓ N новых», если список не внизу
  function onIncoming(freshPub, freshDm) {
    const pub = freshPub || [], dm = freshDm || [];
    if (!pub.length && !dm.length) return;
    const openHere = isOpen() && ((pub.length && view === "chat") || (dm.length && view === "dm" && dm.some((m) => m.from === dmUid)));
    const last = dm.length ? dm[dm.length - 1] : pub[pub.length - 1];
    const who = dm.length ? ("✉ " + nameOf(last.from)) : (last.name || "Чат");
    ping();
    if (!openHere || document.visibilityState === "hidden") notify(who, cut(last.text, 120), dm.length ? "ep-dm-" + last.from : "ep-chat");
    if (openHere) {
      const box = listEl();
      if (box && !nearBottom(box)) pendingNew += pub.length + dm.length;
      else pendingNew = 0;
    }
  }
  function nameOf(uid) {
    const p = people.find((x) => x.uid === uid);
    if (p && p.name) return p.name;
    const m = msgs.concat(dmAll).find((x) => (x.uid || x.from) === uid && x.name);
    return (m && m.name) || "Мастер";
  }

  // ---------- отправка/правка/удаление ----------
  function sendPub(text) {
    const t = String(text || "").trim();
    if (!t) return Promise.resolve({ ok: false, queued: false });
    const rec = Object.assign({ uid: myUid(), name: myName(), text: t.slice(0, MAXLEN), ts: Date.now() }, ctx());
    if (replyTo) rec.replyTo = { id: replyTo.id, name: replyTo.name, text: cut(replyTo.text, 90) };
    const d = fdb(), uid = myUid();
    if (!d || !uid) { qAdd(rec); return Promise.resolve({ ok: false, queued: true }); }
    try {
      return d.collection(COL).add(docOf(rec)).then(() => ({ ok: true, queued: false }))
        .catch((e) => { qAdd(rec); chatErr = String((e && (e.code || e.message)) || ""); return { ok: false, queued: true }; });
    } catch (e) { qAdd(rec); return Promise.resolve({ ok: false, queued: true }); }
  }
  function sendDm(text) {
    const t = String(text || "").trim();
    const d = fdb(), uid = myUid();
    if (!t || !d || !uid || !dmUid) return Promise.resolve({ ok: false });
    const doc = {
      from: uid, to: dmUid, uids: [uid, dmUid], name: myName(), text: t.slice(0, MAXLEN),
      ts: Date.now(), at: stamp(), seen: false
    };
    if (replyTo) doc.replyTo = { id: replyTo.id, name: replyTo.name, text: cut(replyTo.text, 90) };
    try { return d.collection(DMC).add(doc).then(() => ({ ok: true })).catch(() => ({ ok: false })); }
    catch (e) { return Promise.resolve({ ok: false }); }
  }
  function editMsg(id, text, isDm) {
    const d = fdb(), t = String(text || "").trim();
    if (!d || !id || !t) return Promise.resolve(false);
    try {
      return d.collection(isDm ? DMC : COL).doc(id)
        .update({ text: t.slice(0, MAXLEN), editedAt: Date.now() })
        .then(() => true).catch(() => false);
    } catch (e) { return Promise.resolve(false); }
  }
  function removeMsg(id, isDm) {
    const d = fdb(); if (!d || !id) return Promise.resolve(false);
    try { return d.collection(isDm ? DMC : COL).doc(id).delete().then(() => true).catch(() => false); }
    catch (e) { return Promise.resolve(false); }
  }
  // ---------- модерация (только админ) ----------
  function banUser(uid, name, reason) {
    const d = fdb(); if (!d || !uid || !isAdm()) return Promise.resolve(false);
    try {
      return d.collection(BANS).doc(uid).set({
        name: name || nameOf(uid), at: Date.now(), by: myUid(), byName: myName(), reason: reason || ""
      }).then(() => true).catch(() => false);
    } catch (e) { return Promise.resolve(false); }
  }
  function unbanUser(uid) {
    const d = fdb(); if (!d || !uid || !isAdm()) return Promise.resolve(false);
    try { return d.collection(BANS).doc(uid).delete().then(() => true).catch(() => false); }
    catch (e) { return Promise.resolve(false); }
  }
  // удалить ВСЕ сообщения человека в общем чате: тянем по uid отдельным запросом
  // (в живой подписке только последние LIMIT — старые она не видит) и удаляем пачкой
  function purgeUser(uid) {
    const d = fdb(); if (!d || !uid || !isAdm()) return Promise.resolve(0);
    try {
      return d.collection(COL).where("uid", "==", uid).limit(500).get().then((snap) => {
        const ids = []; snap.forEach((doc) => ids.push(doc.id));
        return Promise.all(ids.map((id) => d.collection(COL).doc(id).delete().catch(() => {}))).then(() => ids.length);
      }).catch(() => 0);
    } catch (e) { return Promise.resolve(0); }
  }
  // жалоба: пишет любой одобренный, читает и закрывает только админ
  function reportMsg(m) {
    const d = fdb(); if (!d || !m) return Promise.resolve(false);
    try {
      return d.collection(REPS).add({
        by: myUid(), byName: myName(), uid: m.uid || m.from || "", name: m.name || "",
        msgId: m.id || "", text: cut(m.text || "", 500), ts: Date.now(), at: stamp()
      }).then(() => true).catch(() => false);
    } catch (e) { return Promise.resolve(false); }
  }
  function closeReport(id) {
    const d = fdb(); if (!d || !id || !isAdm()) return Promise.resolve(false);
    try { return d.collection(REPS).doc(id).delete().then(() => true).catch(() => false); }
    catch (e) { return Promise.resolve(false); }
  }

  // прочитано: публичный — метка времени в localStorage, личка — seen у документов
  function markSeen() {
    const uid = myUid();
    if (view === "chat") {
      const s = seenRead();
      const last = msgs.length ? atMs(msgs[msgs.length - 1]) : Date.now();
      s.pub = Math.max(s.pub || 0, last);
      seenWrite(s);
    }
    if (view === "dm" && dmUid) {
      const d = fdb();
      if (d) dmAll.filter((m) => m.from === dmUid && m.to === uid && !m.seen && !seenPending.has(m.id)).forEach((m) => {
        seenPending.add(m.id);
        try { d.collection(DMC).doc(m.id).update({ seen: true }).catch(() => { seenPending.delete(m.id); }); }
        catch (e) { seenPending.delete(m.id); }
      });
    }
    paintBadge();
  }
  // «загрузить предыдущие» — живая подписка держит последние LIMIT, историю тянем разово
  function loadOlder() {
    const d = fdb(); if (!d || loadingOlder || noMoreOlder) return;
    const all = older.concat(msgs);
    const oldest = all.length ? (all[0].ts || 0) : Date.now();
    loadingOlder = true;
    try {
      d.collection(COL).where("ts", "<", oldest).orderBy("ts", "desc").limit(LIMIT).get().then((snap) => {
        const arr = [];
        snap.forEach((doc) => arr.push(Object.assign({ id: doc.id }, doc.data())));
        if (!arr.length) noMoreOlder = true;
        older = arr.reverse().concat(older);
        loadingOlder = false;
        if (isOpen()) render(true);
      }).catch(() => { loadingOlder = false; noMoreOlder = true; });
    } catch (e) { loadingOlder = false; }
  }
  const dmMsgs = () => dmAll.filter((m) => m.from === dmUid || m.to === dmUid);
  function chatText() {
    const list = view === "dm" ? dmMsgs() : older.concat(msgs);
    if (!list.length) return "";
    const head = view === "dm" ? `Electric Pro — личная переписка с ${dmName} (${list.length})\n` : `Electric Pro — общий чат (${list.length} сообщений)\n`;
    return head + list.map((r) =>
      `\n[${fmtDate(atMs(r))}] ${r.name || nameOf(r.from) || "?"}${r.route ? " · " + r.route : ""}${r.project ? " · «" + r.project + "»" : ""}\n${r.text || ""}`
    ).join("\n");
  }

  // ---------- UI ----------
  function ovEl() { return document.getElementById("ep-fb-ov"); }
  function isOpen() { const ov = ovEl(); return !!(ov && !ov.hidden); }
  function listEl() { const ov = ovEl(); return ov && ov.querySelector(".ep-fb-list"); }
  const nearBottom = (box) => box.scrollHeight - box.scrollTop - box.clientHeight < 80;

  function statusHtml() {
    const q = qread().length;
    const bell = canNotify() ? "" : `<button type="button" class="ep-plan-mini ep-clickable" data-fb-notify aria-label="Включить уведомления">🔔</button>`;
    const snd = `<button type="button" class="ep-plan-mini ep-clickable" data-fb-sound aria-label="Звук сообщений">${soundOn() ? "🔊" : "🔇"}</button>`;
    let st = `<span class="ep-fb-st">⚪ офлайн${q ? " · в очереди " + q : ""}</span>`;
    if (chatState === "live") st = `<span class="ep-fb-st is-live">🟢 онлайн</span>${q ? ` · <span class="ep-fb-st">${q} в очереди</span>` : ""}`;
    else if (chatState === "err") st = `<span class="ep-fb-st is-err">🔴 нет доступа (${esc(chatErr)})</span>`;
    return st + bell + snd;
  }
  function msgHtml(r, isDm) {
    const uid = myUid(), mine = !!uid && (isDm ? r.from === uid : r.uid === uid);
    const canDel = mine || (!isDm && isAdm());
    const nm = esc(r.name || nameOf(r.from) || "Мастер");
    const meta = isDm
      ? esc(fmtTime(atMs(r))) + (r.editedAt ? " · изменено" : "") + (mine && r.seen ? " · прочитано" : "")
      : esc(fmtTime(atMs(r))) + " · " + esc(r.route || "—") + (r.project ? " · " + esc(r.project) : "") + " · v" + esc(r.build || "—") + (r.editedAt ? " · изменено" : "");
    const quote = r.replyTo ? `<div class="ep-fb-quote"><b>${esc(r.replyTo.name || "")}</b> ${esc(r.replyTo.text || "")}</div>` : "";
    if (editId === r.id) {
      return `<div class="ep-fb-msg is-mine"><div class="ep-fb-msgtop"><b>${nm}</b></div>
        <textarea class="ep-fb-input" data-fb-editinput rows="2">${esc(r.text || "")}</textarea>
        <div class="ep-fb-acts">
          <button type="button" class="ep-plan-chip on ep-clickable" data-fb-editsave="${esc(r.id)}">✓ Сохранить</button>
          <button type="button" class="ep-plan-chip ep-clickable" data-fb-editcancel>Отмена</button>
        </div></div>`;
    }
    const acts = openMsgId === r.id ? `<div class="ep-fb-acts">
      <button type="button" class="ep-plan-chip ep-clickable" data-fb-reply="${esc(r.id)}">↩ Ответить</button>
      ${mine ? `<button type="button" class="ep-plan-chip ep-clickable" data-fb-edit="${esc(r.id)}">✎ Изменить</button>` : ""}
      ${canDel ? `<button type="button" class="ep-plan-chip ep-clickable" data-fb-del2="${esc(r.id)}">🗑 Удалить</button>` : ""}
      ${(!isDm && !mine && r.uid) ? `<button type="button" class="ep-plan-chip ep-clickable" data-fb-dm="${esc(r.uid)}">✉ Лично</button>` : ""}
      ${(!isDm && !mine && r.uid && !isAdm()) ? `<button type="button" class="ep-plan-chip ep-clickable" data-fb-report="${esc(r.id)}">⚠ Жалоба</button>` : ""}
      ${(!isDm && !mine && r.uid && isAdm()) ? `<button type="button" class="ep-plan-chip ep-clickable" data-fb-ban="${esc(r.uid)}">🚫 Забанить</button>
        <button type="button" class="ep-plan-chip ep-clickable" data-fb-purge="${esc(r.uid)}">🧹 Все сообщения</button>` : ""}
    </div>` : "";
    // в ретро-облике подпись автора идёт «Имя (14:32):» одной строкой цветом (свои —
    // красным, чужие — синим), как в истории старых мессенджеров; в современном — как было
    const head = skin() === "retro"
      ? `<div class="ep-fb-msgtop"><b>${nm} (${esc(fmtTime(atMs(r)))}):</b></div>`
      : `<div class="ep-fb-msgtop"><b>${nm}</b></div>`;
    return `<div class="ep-fb-msg${mine ? " is-mine" : ""}" data-fb-msg="${esc(r.id)}">
      ${head}${quote}<div class="ep-fb-text">${esc(r.text || "")}</div>
      <div class="ep-fb-meta">${meta}</div>${acts}</div>`;
  }
  function pendingHtml() {
    return qread().map((r) => `<div class="ep-fb-msg is-mine is-pending">
      <div class="ep-fb-msgtop"><b>${esc(r.name || "Я")}</b><span class="ep-fb-st">⏳ не отправлено</span></div>
      <div class="ep-fb-text">${esc(r.text || "")}</div></div>`).join("");
  }
  function chatListHtml() {
    const all = older.concat(msgs);
    const more = (noMoreOlder || !all.length) ? "" : `<button type="button" class="btn btn-ghost ep-clickable ep-fb-more" data-fb-older>↑ Загрузить предыдущие</button>`;
    const rows = all.map((r) => msgHtml(r, false)).join("");
    const pend = pendingHtml();
    if (!rows && !pend) return `<div class="ep-fb-empty">${chatState === "live" ? "Пока никто ничего не писал." : "Сообщений нет."}</div>`;
    return more + rows + pend;
  }
  function dmListHtml() {
    const rows = dmMsgs().map((r) => msgHtml(r, true)).join("");
    return rows || `<div class="ep-fb-empty">Начни переписку — сообщение увидит только ${esc(dmName)}.</div>`;
  }
  function peopleListHtml() {
    const uid = myUid(), un = unreadDmBy();
    // всех, кого знаем: присутствие + авторы сообщений (мог не «биться», но писал)
    const map = {};
    people.forEach((p) => { if (p.uid !== uid) map[p.uid] = { uid: p.uid, name: p.name || "Мастер", at: p.at || 0 }; });
    msgs.concat(dmAll).forEach((m) => {
      const id = m.uid || m.from;
      if (!id || id === uid) return;
      if (!map[id]) map[id] = { uid: id, name: m.name || "Мастер", at: 0 };
    });
    const list = Object.keys(map).map((k) => map[k]).sort((a, b) => (isOnline(b) - isOnline(a)) || String(a.name).localeCompare(String(b.name)));
    if (!list.length) return `<div class="ep-fb-empty">Пока никого — как только кто-то войдёт, появится здесь.</div>`;
    return list.map((p) => {
      const last = dmAll.filter((m) => m.from === p.uid || m.to === p.uid).slice(-1)[0];
      const n = un[p.uid] || 0;
      const retro = skin() === "retro";
      return `<button type="button" class="ep-fb-person ep-clickable" data-fb-dm="${esc(p.uid)}">
        ${retro ? `<span class="ep-fb-flower${isOnline(p) ? " is-on" : ""}">🌼</span>` : `<span class="ep-fb-dot${isOnline(p) ? " is-on" : ""}"></span>`}
        <span class="ep-fb-pname">${esc(p.name)}${last ? `<i>${esc(cut(last.text, 40))}</i>` : ""}</span>
        ${n ? `<span class="ep-fb-cnt">${n}</span>` : `<span class="ep-fb-st">${isBanned(p.uid) ? "🚫 в чате ограничен" : (isOnline(p) ? "в сети" : (p.at ? "был " + fmtTime(p.at) : ""))}</span>`}
      </button>`;
    }).join("");
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
  function modListHtml() {
    if (!isAdm()) return `<div class="ep-fb-empty">Модерация доступна администратору.</div>`;
    const banRows = bans.length ? bans.map((b) => `<div class="ep-fb-item">
      <div class="ep-fb-meta">🚫 забанен ${esc(fmtDate(b.at || 0))}${b.byName ? " · " + esc(b.byName) : ""}</div>
      <div class="ep-fb-text"><b>${esc(b.name || nameOf(b.uid))}</b>${b.reason ? " — " + esc(b.reason) : ""}</div>
      <div class="ep-fb-acts">
        <button type="button" class="ep-plan-chip ep-clickable" data-fb-unban="${esc(b.uid)}">✓ Разбанить</button>
        <button type="button" class="ep-plan-chip ep-clickable" data-fb-purge="${esc(b.uid)}">🧹 Удалить все сообщения</button>
      </div></div>`).join("") : `<div class="ep-fb-empty">Забаненных нет.</div>`;
    const repRows = reports.length ? reports.map((r) => `<div class="ep-fb-item">
      <div class="ep-fb-meta">⚠ жалоба от ${esc(r.byName || "мастера")} · ${esc(fmtDate(r.ts || 0))}</div>
      <div class="ep-fb-text"><b>${esc(r.name || nameOf(r.uid))}:</b> ${esc(cut(r.text, 300))}</div>
      <div class="ep-fb-acts">
        ${isBanned(r.uid) ? `<button type="button" class="ep-plan-chip ep-clickable" data-fb-unban="${esc(r.uid)}">✓ Разбанить</button>`
          : `<button type="button" class="ep-plan-chip ep-clickable" data-fb-ban="${esc(r.uid)}">🚫 Забанить</button>`}
        ${r.msgId ? `<button type="button" class="ep-plan-chip ep-clickable" data-fb-del2="${esc(r.msgId)}">🗑 Удалить сообщение</button>` : ""}
        <button type="button" class="ep-plan-chip ep-clickable" data-fb-purge="${esc(r.uid)}">🧹 Все сообщения</button>
        <button type="button" class="ep-plan-chip ep-clickable" data-fb-closerep="${esc(r.id)}">✓ Закрыть жалобу</button>
      </div></div>`).join("") : `<div class="ep-fb-empty">Жалоб нет.</div>`;
    return `<div class="ep-fb-modsec"><b>Жалобы</b></div>` + repRows + `<div class="ep-fb-modsec"><b>Ограничен доступ к чату</b></div>` + banRows;
  }
  function bodyHtml() {
    if (view === "mod") return modListHtml();
    if (view === "people") return peopleListHtml();
    if (view === "dm") return dmListHtml();
    if (view === "notes") return notesListHtml();
    return chatListHtml();
  }
  function tabsHtml() {
    const un = unreadDmBy(), dmN = Object.keys(un).reduce((s, k) => s + un[k], 0), pubN = unreadPub();
    const t = (id, label, n) => `<button type="button" class="ep-plan-chip ep-clickable${view === id ? " on" : ""}" data-fb-tab="${id}">${label}${n ? ` <i class="ep-fb-cnt">${n}</i>` : ""}</button>`;
    const retro = skin() === "retro";
    return t("chat", "Общий", view === "chat" ? 0 : pubN)
      + t("people", retro ? "🌼 Контакты" : "Люди", dmN)
      + t("notes", "Заметки", 0)
      + (isAdm() ? t("mod", "🛡 Модерация", reports.length) : "");
  }
  // обновляем ТОЛЬКО список/статус/вкладки — иначе приходящее сообщение стирало бы
  // набранный, но не отправленный текст в поле ввода (и сбивало фокус)
  function patch() {
    const ov = ovEl(); if (!ov) return;
    const st = ov.querySelector(".ep-fb-status");
    const box = ov.querySelector(".ep-fb-list");
    if (st && view !== "notes") st.innerHTML = statusHtml();
    const tabs = ov.querySelector(".ep-fb-tabs-in"); if (tabs) tabs.innerHTML = tabsHtml();
    if (!box) return;
    const wasBottom = nearBottom(box);
    box.innerHTML = bodyHtml();
    if (wasBottom && (view === "chat" || view === "dm")) { box.scrollTop = box.scrollHeight; pendingNew = 0; }
    const chip = ov.querySelector(".ep-fb-newchip");
    if (chip) { chip.hidden = !pendingNew; chip.textContent = "↓ " + pendingNew + " новых"; }
    markSeen();
  }
  function render(keepScroll) {
    let ov = ovEl();
    if (!ov) { ov = document.createElement("div"); ov.id = "ep-fb-ov"; ov.className = "ep-fb-ov"; document.body.appendChild(ov); }
    const prevTop = keepScroll && listEl() ? listEl().scrollTop : null;
    const isNotes = view === "notes";
    const dmHead = view === "dm"
      ? `<div class="ep-fb-dmhead"><button type="button" class="ep-plan-mini ep-clickable" data-fb-tab="people">‹</button>
         <span class="ep-fb-dot${isOnline(people.find((p) => p.uid === dmUid)) ? " is-on" : ""}"></span>
         <b>${esc(dmName)}</b><span class="ep-fb-st">личная переписка</span></div>` : "";
    const hint = isNotes
      ? "Заметки только на этом устройстве (работают без входа и интернета). «Скопировать всё» → отправь текст разработчику."
      : (view === "people" ? "Тапни человека — откроется личная переписка. Зелёная точка — в сети (заходил в приложение за последние 5 минут)."
        : (view === "dm" ? "Личная переписка — видите только вы двое, даже админ её не читает. Тапни сообщение: ответить, изменить своё, удалить."
          : "Тапни сообщение — ответить, изменить своё, удалить или написать лично. К сообщению подшивается экран, проект и версия сборки."));
    const retro = skin() === "retro";
    // в ретро-облике НЕ вешаем классы card/glass: у них в base.css есть
    // background: ... !important под body[data-noblur] (перф-деградация), который
    // перебил бы ретро-фон окна (поймано живым замером: computed бело-белый)
    ov.innerHTML = `<div class="ep-fb-card${retro ? " is-retro" : " card glass"}">
      <div class="ep-fb-head">
        <b>${retro ? "🌼 Чат · Классика" : "💬 Чат"}</b>
        <span class="ep-fb-sp"></span>
        <button type="button" class="ep-plan-mini ep-clickable" data-fb-skin aria-label="Облик чата">${retro ? "💬" : "🌼"}</button>
        <button type="button" class="ep-plan-mini ep-clickable" data-fb-close aria-label="Закрыть">✕</button>
      </div>
      <div class="ep-fb-tabs"><span class="ep-fb-tabs-in">${tabsHtml()}</span><span class="ep-fb-sp"></span><span class="ep-fb-status">${isNotes ? "" : statusHtml()}</span></div>
      ${dmHead}
      <div class="ep-fb-hint">${hint}</div>
      <div class="ep-fb-list">${bodyHtml()}</div>
      <button type="button" class="ep-fb-newchip ep-clickable" data-fb-tobottom ${pendingNew ? "" : "hidden"}>↓ ${pendingNew} новых</button>
      ${replyTo ? `<div class="ep-fb-replybar"><span>↩ ${esc(replyTo.name)}: ${esc(cut(replyTo.text, 60))}</span><button type="button" class="ep-plan-mini ep-clickable" data-fb-replycancel>✕</button></div>` : ""}
      ${(view === "people" || view === "mod") ? "" : (iAmBanned() && view !== "notes" ? `<div class="ep-fb-banned">🚫 Доступ к чату ограничен администратором. Читать можно, писать — нет.</div>` : `<textarea id="ep-fb-input" class="ep-fb-input" rows="1" placeholder="${isNotes ? "Например: при тапе по проёму зависает экран…" : (view === "dm" ? "Сообщение — " + esc(dmName) : "Сообщение в общий чат…")}"></textarea>
      <div class="ep-fb-row">
        ${isNotes
          ? `<button type="button" class="btn btn-primary ep-clickable" data-fb-add>+ Записать</button>
             <button type="button" class="btn btn-ghost ep-clickable" data-fb-copy>📋 Скопировать всё</button>
             ${read().length ? `<button type="button" class="btn btn-ghost ep-clickable" data-fb-clear>Очистить</button>` : ""}`
          : `<button type="button" class="btn btn-primary ep-clickable" data-fb-send>Отправить</button>
             <button type="button" class="btn btn-ghost ep-clickable" data-fb-copychat>📋 Скопировать</button>`}
      </div>`)}
    </div>`;
    ov.hidden = false;
    const box = listEl();
    if (box) {
      if (prevTop != null) box.scrollTop = prevTop;
      else if (view === "chat" || view === "dm") box.scrollTop = box.scrollHeight;   // автопрокрутка к последнему
    }
    const inp = document.getElementById("ep-fb-input");
    if (inp) { grow(inp); setTimeout(() => { try { inp.focus(); } catch (e) {} }, 30); }
    markSeen();
    paintBadge();
  }
  // поле ввода растёт по тексту (просьба пользователя), но не выше 35% экрана
  function grow(t) {
    try {
      t.style.height = "auto";
      t.style.height = Math.min(t.scrollHeight + 2, Math.round(window.innerHeight * 0.35)) + "px";
    } catch (e) {}
  }
  function open(opts) {
    try { if (window.EP && EP.AppShell && EP.AppShell.closeDrawer) EP.AppShell.closeDrawer(); } catch (e) {}
    if (opts && opts.view) view = opts.view;
    startAll();
    render();
    flushQueue().then((n) => { if (n && isOpen()) patch(); });
  }
  function close() {
    const ov = ovEl(); if (ov) { ov.hidden = true; ov.innerHTML = ""; }
    replyTo = null; editId = null; openMsgId = null; pendingNew = 0;
    paintBadge();
  }
  function toast(msg) {
    const ov = ovEl(); if (!ov) return;
    let t = ov.querySelector(".ep-fb-toast");
    if (!t) { t = document.createElement("div"); t.className = "ep-fb-toast"; ov.appendChild(t); }
    t.textContent = msg;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { if (t && t.parentNode) t.parentNode.removeChild(t); }, 1800);
  }
  function openDm(uid) {
    if (!uid || uid === myUid()) return;
    dmUid = uid; dmName = nameOf(uid); view = "dm"; openMsgId = null; replyTo = null;
    if (!isOpen()) { startAll(); }
    render();
  }

  // плавающая кнопка чата — вызов с ЛЮБОГО экрана (просьба пользователя)
  function ensureFab() {
    let f = document.getElementById("ep-chat-fab");
    if (!f) {
      f = document.createElement("button");
      f.id = "ep-chat-fab"; f.type = "button";
      f.className = "ep-chat-fab ep-clickable";
      f.setAttribute("data-fb-open", "1");
      f.setAttribute("aria-label", "Чат");
      f.textContent = "💬";
      document.body.appendChild(f);
    }
    const route = (EP.state && EP.state.currentRoute) || "";
    f.hidden = route === "login" || !myUid();
    paintBadge();
  }

  document.addEventListener("click", (e) => {
    const t = e.target;
    if (t.closest("[data-fb-open]")) { e.preventDefault(); open(); return; }
    const ov = ovEl(); if (!ov || ov.hidden) return;
    if (t.closest("[data-fb-close]")) { close(); return; }
    const tb = t.closest("[data-fb-tab]");
    if (tb) {
      const v = tb.getAttribute("data-fb-tab");
      view = (v === "notes" || v === "people" || v === "dm" || v === "mod") ? v : "chat";
      openMsgId = null; editId = null; pendingNew = 0;
      startAll(); render(); return;
    }
    const dmBtn = t.closest("[data-fb-dm]");
    if (dmBtn) { openDm(dmBtn.getAttribute("data-fb-dm")); return; }
    if (t.closest("[data-fb-notify]")) { askNotify().then((ok) => { toast(ok ? "Уведомления включены" : "Уведомления не разрешены"); patch(); }); return; }
    if (t.closest("[data-fb-sound]")) { localStorage.setItem(SNDK, soundOn() ? "0" : "1"); if (soundOn()) ping(); patch(); return; }
    if (t.closest("[data-fb-tobottom]")) { const b = listEl(); if (b) b.scrollTop = b.scrollHeight; pendingNew = 0; patch(); return; }
    if (t.closest("[data-fb-older]")) { loadOlder(); return; }
    if (t.closest("[data-fb-replycancel]")) { replyTo = null; render(true); return; }
    const rep = t.closest("[data-fb-reply]");
    if (rep) {
      const id = rep.getAttribute("data-fb-reply");
      const src = older.concat(msgs, dmAll).find((m) => m.id === id);
      if (src) replyTo = { id: id, name: src.name || nameOf(src.from), text: src.text || "" };
      openMsgId = null; render(true); return;
    }
    const ed = t.closest("[data-fb-edit]");
    if (ed) { editId = ed.getAttribute("data-fb-edit"); openMsgId = null; render(true); return; }
    if (t.closest("[data-fb-editcancel]")) { editId = null; render(true); return; }
    const sv = t.closest("[data-fb-editsave]");
    if (sv) {
      const inp2 = ov.querySelector("[data-fb-editinput]");
      const id = sv.getAttribute("data-fb-editsave");
      editMsg(id, inp2 ? inp2.value : "", view === "dm").then((ok) => { toast(ok ? "Изменено" : "Не удалось изменить"); editId = null; render(true); });
      return;
    }
    const rp = t.closest("[data-fb-report]");
    if (rp) {
      const m = older.concat(msgs).find((x) => x.id === rp.getAttribute("data-fb-report"));
      if (m) reportMsg(m).then((ok) => toast(ok ? "Жалоба отправлена — админ разберётся" : "Не удалось отправить жалобу"));
      openMsgId = null; patch(); return;
    }
    const bn = t.closest("[data-fb-ban]");
    if (bn) {
      const uid = bn.getAttribute("data-fb-ban");
      if (!confirm("Ограничить доступ к чату для «" + nameOf(uid) + "»? Писать он больше не сможет (читать — да).")) return;
      banUser(uid, nameOf(uid)).then((ok) => { toast(ok ? "Доступ к чату ограничен" : "Не удалось (нужны права админа)"); openMsgId = null; });
      return;
    }
    const ub = t.closest("[data-fb-unban]");
    if (ub) { unbanUser(ub.getAttribute("data-fb-unban")).then((ok) => toast(ok ? "Доступ вернули" : "Не удалось")); return; }
    const pg = t.closest("[data-fb-purge]");
    if (pg) {
      const uid = pg.getAttribute("data-fb-purge");
      if (!confirm("Удалить ВСЕ сообщения «" + nameOf(uid) + "» из общего чата? Отменить нельзя.")) return;
      purgeUser(uid).then((n) => { toast(n ? "Удалено сообщений: " + n : "Сообщений не нашлось"); openMsgId = null; });
      return;
    }
    const cr = t.closest("[data-fb-closerep]");
    if (cr) { closeReport(cr.getAttribute("data-fb-closerep")).then((ok) => { if (!ok) toast("Не удалось закрыть"); }); return; }
    if (t.closest("[data-fb-skin]")) {
      localStorage.setItem(SKINK, skin() === "retro" ? "modern" : "retro");
      render(true); return;
    }
    const dl = t.closest("[data-fb-del2]");
    if (dl) {
      if (!confirm("Удалить сообщение?")) return;
      removeMsg(dl.getAttribute("data-fb-del2"), view === "dm").then((ok) => { if (!ok) toast("Не удалось удалить"); openMsgId = null; });
      return;
    }
    const mg = t.closest("[data-fb-msg]");
    if (mg) { const id = mg.getAttribute("data-fb-msg"); openMsgId = (openMsgId === id ? null : id); patch(); return; }
    if (t.closest("[data-fb-send]")) {
      const inp3 = document.getElementById("ep-fb-input");
      const v = inp3 ? inp3.value : "";
      if (!String(v).trim()) { toast("Напиши сообщение"); return; }
      if (inp3) { inp3.value = ""; grow(inp3); }
      const p = view === "dm" ? sendDm(v) : sendPub(v);
      replyTo = null;
      p.then((r) => {
        toast(r.ok ? "Отправлено" : (r.queued ? "Сохранено — уйдёт при входе" : "Не удалось отправить"));
        render(false);
      });
      return;
    }
    if (t.closest("[data-fb-copychat]")) { copyText(chatText()).then((ok) => toast(ok ? "Скопировано" : "Не удалось скопировать")); return; }
    if (t.closest("[data-fb-add]")) {
      const inp4 = document.getElementById("ep-fb-input");
      const v = inp4 ? inp4.value : "";
      if (!String(v).trim()) { toast("Напиши текст замечания"); return; }
      add(v); render(); toast("Записано"); return;
    }
    if (t.closest("[data-fb-copy]")) { copyAll().then((ok) => toast(ok ? "Скопировано — отправляй" : "Не удалось скопировать")); return; }
    if (t.closest("[data-fb-clear]")) { if (!confirm("Удалить все записи?")) return; write([]); render(); return; }
    const del = t.closest("[data-fb-del]");
    if (del) {
      const i = Number(del.getAttribute("data-fb-del"));
      const list = read();
      if (Number.isFinite(i) && i >= 0 && i < list.length) { list.splice(i, 1); write(list); render(); }
      return;
    }
    if (t === ov) close();     // клик по затемнению
  });
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (!t) return;
    if (t.id === "ep-fb-input" || (t.hasAttribute && t.hasAttribute("data-fb-editinput"))) grow(t);
  });
  document.addEventListener("scroll", (e) => {
    const box = e.target;
    if (!box || !box.classList || !box.classList.contains("ep-fb-list")) return;
    if (nearBottom(box) && pendingNew) {
      pendingNew = 0;
      const ov = ovEl(), ch = ov && ov.querySelector(".ep-fb-newchip");
      if (ch) ch.hidden = true;
      markSeen();
    }
  }, true);

  window.addEventListener("ep:auth-changed", () => {
    unsubAll();
    msgs = []; older = []; dmAll = []; people = []; bans = []; reports = []; noMoreOlder = false;
    gotPub = false; gotDm = false; seenPending.clear();
    if (myUid()) startAll();
    ensureFab();
    if (isOpen()) render(true);
  });
  window.addEventListener("ep:route-loaded", ensureFab);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { beat(); startAll(); } });
  // приложение открыто — сразу слушаем чат (метка/звук/уведомление работают и при
  // закрытом окне чата), кнопка вызова доступна с любого экрана
  setTimeout(() => { ensureFab(); if (myUid()) startAll(); }, 1500);

  EP.Feedback = {
    open, close, add, read, asText, copyAll, count: () => read().length,
    send: sendPub, sendDm, messages: () => msgs.slice(), dmMessages: () => dmMsgs(), chatText,
    queue: qread, flushQueue, state: () => chatState, unread: unreadTotal, people: () => people.slice(),
    openDm, setView: (v) => { view = v; if (isOpen()) render(); }, isOnline, notifyAsk: askNotify,
    banUser, unbanUser, purgeUser, reportMsg, closeReport, bans: () => bans.slice(), reports: () => reports.slice(),
    isBanned, skin
  };
  EP.Chat = EP.Feedback;
})();
