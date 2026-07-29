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
  const CONT = "chat_contacts", FILES = "chat_files";
  const ROOMS = "chat_rooms", GRP = "chat_group", TOKENS = "chat_tokens";
  const FILE_MAX = 900000;   // предел тела вложения (лимит документа Firestore — 1 МиБ)
  const SKINK = "ep_chat_skin_v1";   // "retro" (по умолчанию) | "modern"
  const FULLK = "ep_chat_full_v1";   // "1" — окно чата развёрнуто во весь экран
  const STK = "ep_chat_status_v1";   // мой статус: "online" | "away" | "dnd"
  const AVK = "ep_chat_avatar_v1";   // моя «аватарка» — эмодзи (файлы не грузим)
  const TYPING_MS = 8000;            // «печатает…» живёт 8с, обновляем не чаще 4с
  const AVATARS = ["⚡", "🔧", "🔌", "🧰", "💡", "🪛", "🛠", "🧑‍🔧", "🙂", "😎", "🐱", "🦊"];
  const STATUSES = { online: { ico: "🟢", name: "в сети" }, away: { ico: "🌙", name: "отошёл" }, dnd: { ico: "⛔", name: "не беспокоить" } };
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
  let gotPub = false, gotDm = false, gotGrp = false;
  const seenPending = new Set();   // какие личные уже помечаем прочитанными (без петли)
  let bans = [], reports = [];     // модерация: кто забанен и на что жалуются
  let unsubBans = null, unsubReps = null;
  let contacts = [], unsubCont = null;   // контакты: заявки и принятые
  let rooms = [], grpAll = [], unsubRooms = null, unsubGrp = null;  // группы и их сообщения
  let roomId = "";                       // открытая группа
  let roomShowPeople = false;            // в окне группы раскрыт список участников
  let statusPane = null;                 // раскрытая панель: "status" | "avatar"
  let searchOn = false;                  // раскрыта строка поиска
  let searchQ = "";                      // строка поиска по переписке
  let hitId = "";                        // найденное сообщение, к которому прокрутились
  let attachPane = null;                 // открытая панель 📎 ("menu"|"plan"|"db"|"est")
  let attachQ = "";                      // строка поиска в пикере позиций БД
  let attachPick = null;                 // выбранное вложение — уйдёт со сообщением

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
  const myStatus = () => (STATUSES[localStorage.getItem(STK)] ? localStorage.getItem(STK) : "online");
  const myAvatar = () => localStorage.getItem(AVK) || AVATARS[0];
  // «не беспокоить» глушит ТОЛЬКО звук и всплывающие уведомления — сами сообщения,
  // метка и переписка работают как обычно (иначе легко пропустить рабочую задачу)
  const quiet = () => myStatus() === "dnd";
  /* «Во весь экран» окна чата. ДВА независимых механизма разом, и это осознанно:
     (1) КЛАСС is-full на оверлее — чистый CSS (оверлей и так position:fixed;inset:0,
         снимаем только паддинги и лимиты карточки). Работает ВСЕГДА, в том числе там,
         где нативный Fullscreen API молча не срабатывает (старый WebView, встроенный
         браузер мессенджера без allow="fullscreen") — в этой сессии на такое уже
         наступали со шторками плана.
     (2) НАТИВНЫЙ requestFullscreen — только он убирает адресную строку браузера и
         системные панели, то есть даёт «прям реально во весь экран». Не обязателен:
         если промахнётся, пункт (1) уже гарантировал покрытие вьюпорта.
     ВАЖНО: фуллскрин запрашиваем на ОВЕРЛЕЕ, а не на карточке — у карточки в
     «современном» облике есть backdrop-filter, а элемент, который САМ является
     нативным fullscreen-элементом, из-за blur на части реальных устройств рисуется
     плоским серым (уже пойманный в этой сессии баг шторок плана). */
  const fullOn = () => localStorage.getItem(FULLK) === "1";
  let nativeFsMine = false;                 // нативный фуллскрин включили МЫ, не план
  const fsEl = () => (document.fullscreenElement || document.webkitFullscreenElement || null);
  let fsPending = false;                    // запрос уже в полёте — не дублируем
  function enterNativeFs(ov) {
    if (!ov || fsEl() || fsPending) return; // чужой фуллскрин не перебиваем
    const req = ov.requestFullscreen || ov.webkitRequestFullscreen;
    if (!req) return;
    fsPending = true;
    // requestFullscreen возвращает промис, и между вызовом и его разрешением render()
    // успевает пройти ещё раз (сначала setFull, потом перерисовка) — без флага туда
    // уходил бы второй запрос на тот же элемент
    try { Promise.resolve(req.call(ov)).then(() => { nativeFsMine = true; fsPending = false; }, () => { fsPending = false; }); }
    catch (e) { fsPending = false; }
  }
  function exitNativeFs() {
    // ТОЛЬКО если в фуллскрине именно НАШ оверлей: иначе закрытие чата погасило бы
    // фуллскрин плана/развёртки, открытый по другому поводу
    const ov = ovEl();
    if (!nativeFsMine || !ov || fsEl() !== ov) { nativeFsMine = false; return; }
    nativeFsMine = false;
    try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {}
  }
  function setFull(on) {
    localStorage.setItem(FULLK, on ? "1" : "0");
    const ov = ovEl();
    if (ov) ov.classList.toggle("is-full", !!on);
    if (on) enterNativeFs(ov); else exitNativeFs();
    // высота списка/поля ввода считается от новых размеров — перерисуем поле
    const inp = ov && ov.querySelector("#ep-fb-input");
    if (inp) grow(inp);
  }
  // системный выход (жест «назад», Esc) — синхронизируем и класс, и запомненный выбор,
  // иначе чат остался бы «развёрнутым» без нативного фуллскрина и наоборот
  ["fullscreenchange", "webkitfullscreenchange"].forEach((ev) => document.addEventListener(ev, () => {
    const ov = ovEl();
    if (!nativeFsMine || !ov) return;
    if (fsEl() !== ov) { nativeFsMine = false; localStorage.setItem(FULLK, "0"); ov.classList.remove("is-full"); }
  }));
  const statusOf = (p) => (p && STATUSES[p.status] ? p.status : "online");
  const avatarOf = (uid) => { const p = people.find((x) => x.uid === uid); return (p && p.avatar) || "⚡"; };
  const isTyping = (uid, where) => {
    const p = people.find((x) => x.uid === uid);
    return !!(p && p.typing && p.typing.at && Date.now() - p.typing.at < TYPING_MS && (!where || p.typing.where === where));
  };
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
    if (rec.attach) d.attach = rec.attach;
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
      return d.collection(COL).add(docOf(Object.assign({}, rec, { uid: uid }))).then((r) => {
        // отложенное сообщение из офлайн-очереди тоже должно дать push получателям
        askServerPush("pub", r && r.id);
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
  /* ---------- PUSH при ПОЛНОСТЬЮ закрытом приложении (FCM) ----------
     Клиентское уведомление (notify() выше) живёт только пока страница жива — закрыл
     приложение, и оно молчит. Настоящий push требует три вещи: разрешение на
     уведомления, ТОКЕН устройства от FCM (по публичному ключу VAPID) и серверную
     отправку (Cloud Function на создание сообщения, functions/index.js).
     Токен кладём в chat_tokens/{token} — ключ ДОКУМЕНТА это сам токен, поэтому
     повторный вход с того же устройства не плодит дубли, а функция может удалить
     мёртвый токен по его же id. Поле mute зеркалит «⛔ не беспокоить»: статус живёт
     в localStorage (устройство), сервер его иначе не увидит. */
  let pushToken = "";
  const pushSupported = () => {
    try { return !!(window.firebase && firebase.messaging && firebase.messaging.isSupported && firebase.messaging.isSupported()); }
    catch (e) { return false; }
  };
  function saveToken(token) {
    const d = fdb(), uid = myUid();
    if (!d || !uid || !token) return;
    const ua = String(navigator.userAgent || "").slice(0, 200);
    try {
      d.collection(TOKENS).doc(token).set({
        uid: uid, name: myName(), mute: quiet(), ua: ua, at: Date.now(), srv: stamp()
      }, { merge: true }).catch(() => {});
    } catch (e) {}
  }
  /* Регистрация НАШЕГО sw.js. `ready` умеет висеть вечно, если SW почему-то не
     зарегистрирован (тогда getToken не вызовется вовсе), поэтому сначала спрашиваем
     getRegistration() и лишь при отсутствии ждём ready — с таймаутом. */
  function swReg() {
    const sw = navigator.serviceWorker;
    if (!sw) return Promise.resolve(null);
    const wait = new Promise((res) => setTimeout(() => res(null), 8000));
    return Promise.resolve()
      .then(() => (sw.getRegistration ? sw.getRegistration("/") : null))
      .then((r) => r || Promise.race([sw.ready, wait]))
      .catch(() => null);
  }
  function registerPush() {
    if (!pushSupported() || !canNotify() || !myUid()) return;
    if (!window.EP_VAPID_KEY) return;                 // ключ не прошит — тихо выходим
    if (!navigator.serviceWorker) return;
    swReg().then((reg) => {
      // КРИТИЧНО: без своей регистрации getToken НЕ зовём вообще. SDK в этом случае
      // регистрирует «дефолтный» /firebase-messaging-sw.js, которого у нас нет, а
      // hosting на любой несуществующий путь отдаёт index.html — и SDK падал с
      // «unsupported MIME type ('text/html')» (реальный лог с устройства
      // пользователя). Своя регистрация нужна и по делу: push должен приходить в наш
      // sw.js, где живёт проверка «окно открыто — не дублировать уведомление».
      if (!reg || typeof ServiceWorkerRegistration === "undefined" || !(reg instanceof ServiceWorkerRegistration)) return null;
      return firebase.messaging().getToken({ vapidKey: window.EP_VAPID_KEY, serviceWorkerRegistration: reg });
    }).then((token) => {
      if (!token) return;
      pushToken = token;
      saveToken(token);
    }).catch(() => {});                                // нет разрешения/сети — не шумим
  }
  function syncPushMute() {                            // сменил статус — обновляем «тишину»
    const d = fdb();
    if (!d || !pushToken) return;
    try { d.collection(TOKENS).doc(pushToken).set({ mute: quiet(), at: Date.now() }, { merge: true }).catch(() => {}); } catch (e) {}
  }
  function dropPushToken() {                           // вышел из аккаунта — токен чужой
    const d = fdb(), t = pushToken;
    if (!d || !t) return;
    pushToken = "";
    try { d.collection(TOKENS).doc(t).delete().catch(() => {}); } catch (e) {}
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
  // контакты — одна подписка по array-contains (equality-only, составной индекс не нужен)
  function subContacts() {
    if (unsubCont) return;
    const d = fdb(), uid = myUid(); if (!d || !uid) return;
    try {
      unsubCont = d.collection(CONT).where("uids", "array-contains", uid).limit(300).onSnapshot((snap) => {
        const arr = []; snap.forEach((doc) => arr.push(Object.assign({ id: doc.id }, doc.data())));
        const before = contacts.filter((c) => c.to === uid && c.status === "pending").length;
        contacts = arr;
        const after = contacts.filter((c) => c.to === uid && c.status === "pending").length;
        if (after > before) { ping(); notify("Заявка в контакты", "Мастер хочет добавить тебя в контакты", "ep-cont"); }
        if (isOpen()) patch();
        paintBadge();
      }, () => {});
    } catch (e) {}
  }
  // группы: комнаты и сообщения — по array-contains (equality-only, без составного индекса).
  // Сообщение несёт СВОЙ снимок uids, поэтому правило доступа не делает get() комнаты.
  function subRooms() {
    if (unsubRooms) return;
    const d = fdb(), uid = myUid(); if (!d || !uid) return;
    try {
      unsubRooms = d.collection(ROOMS).where("uids", "array-contains", uid).limit(100).onSnapshot((snap) => {
        const arr = []; snap.forEach((doc) => arr.push(Object.assign({ id: doc.id }, doc.data())));
        rooms = arr.sort((a, b) => (b.ts || 0) - (a.ts || 0));
        if (isOpen()) patch();
      }, () => {});
    } catch (e) {}
  }
  function subGroups() {
    if (unsubGrp) return;
    const d = fdb(), uid = myUid(); if (!d || !uid) return;
    try {
      unsubGrp = d.collection(GRP).where("uids", "array-contains", uid).limit(DM_LIMIT).onSnapshot((snap) => {
        const arr = []; snap.forEach((doc) => arr.push(Object.assign({ id: doc.id }, doc.data())));
        const prevIds = new Set(grpAll.map((m) => m.id));
        const first = !gotGrp; gotGrp = true;
        grpAll = arr.sort((a, b) => (a.ts || 0) - (b.ts || 0));
        if (!first) onIncoming(null, grpAll.filter((m) => !prevIds.has(m.id) && m.from !== uid));
        if (isOpen()) patch();
        paintBadge();
      }, () => {});
    } catch (e) {}
  }
  function unsubAll() {
    [unsubPub, unsubDm, unsubPres, unsubBans, unsubReps, unsubCont, unsubRooms, unsubGrp].forEach((f) => { if (f) { try { f(); } catch (e) {} } });
    unsubPub = unsubDm = unsubPres = unsubBans = unsubReps = unsubCont = unsubRooms = unsubGrp = null;
  }
  function startAll() {
    if (!myUid() || !fdb()) { chatState = "off"; return; }
    subPublic(); subDm(); subPresence(); subBans(); subReports(); subContacts(); subRooms(); subGroups(); heartbeat();
    flushQueue().then(paintBadge);
  }
  // «сердцебиение» присутствия: пока страница видима — раз в 2 минуты
  function beat() {
    const d = fdb(), uid = myUid();
    if (!d || !uid || document.visibilityState === "hidden") return;
    try {
      d.collection(PRES).doc(uid).set({ name: myName(), at: Date.now(), status: myStatus(), avatar: myAvatar(),
        route: (EP.state && EP.state.currentRoute) || "" }, { merge: true }).catch(() => {});
    } catch (e) {}
  }
  function heartbeat() {
    if (hbTimer) return;
    beat();
    hbTimer = setInterval(beat, HB_MS);
  }
  const isOnline = (p) => !!(p && p.at && Date.now() - p.at < ONLINE_MS);

  // «печатает…» — отметка в СВОЁМ документе присутствия (не отдельная коллекция: одна
  // запись на 4 секунды набора, и читатели уже подписаны на присутствие)
  let typingSentAt = 0;
  function markTyping() {
    const d = fdb(), uid = myUid();
    if (!d || !uid) return;
    const now = Date.now();
    if (now - typingSentAt < 4000) return;
    typingSentAt = now;
    const where = view === "dm" ? ("dm:" + dmUid) : (view === "room" ? ("room:" + roomId) : "pub");
    try { d.collection(PRES).doc(uid).set({ typing: { at: now, where: where }, at: now }, { merge: true }).catch(() => {}); } catch (e) {}
  }
  // кто сейчас печатает в ЭТОЙ ветке (себя не считаем)
  function typingHtml() {
    const uid = myUid();
    const where = view === "dm" ? ("dm:" + dmUid) : (view === "room" ? ("room:" + roomId) : "pub");
    const who = people.filter((p) => p.uid !== uid && isTyping(p.uid, where)).map((p) => p.name || nameOf(p.uid));
    if (!who.length) return "";
    return `<div class="ep-fb-typing">${esc(who.slice(0, 3).join(", "))} печата${who.length > 1 ? "ют" : "ет"}…</div>`;
  }

  // новое сообщение (не моё) — звук + уведомление + «↓ N новых», если список не внизу
  function onIncoming(freshPub, freshDm) {
    const pub = freshPub || [], dm = freshDm || [];
    if (!pub.length && !dm.length) return;
    const openHere = isOpen() && ((pub.length && view === "chat") || (dm.length && view === "dm" && dm.some((m) => m.from === dmUid)));
    const last = dm.length ? dm[dm.length - 1] : pub[pub.length - 1];
    const who = dm.length ? ("✉ " + nameOf(last.from)) : (last.name || "Чат");
    if (!quiet()) ping();
    if (!quiet() && (!openHere || document.visibilityState === "hidden")) notify(who, cut(last.text, 120), dm.length ? "ep-dm-" + last.from : "ep-chat");
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
    if (attachPick) rec.attach = attachPick;
    const d = fdb(), uid = myUid();
    if (!d || !uid) { qAdd(rec); return Promise.resolve({ ok: false, queued: true }); }
    try {
      return d.collection(COL).add(docOf(rec)).then((r) => { askServerPush("pub", r && r.id); return { ok: true, queued: false }; })
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
    if (attachPick) doc.attach = attachPick;
    try { return d.collection(DMC).add(doc).then((r) => { askServerPush("dm", r && r.id); return { ok: true }; }).catch(() => ({ ok: false })); }
    catch (e) { return Promise.resolve({ ok: false }); }
  }
  const colOf = () => (view === "room" ? GRP : (view === "dm" ? DMC : COL));
  function editMsg(id, text) {
    const d = fdb(), t = String(text || "").trim();
    if (!d || !id || !t) return Promise.resolve(false);
    try {
      return d.collection(colOf()).doc(id)
        .update({ text: t.slice(0, MAXLEN), editedAt: Date.now() })
        .then(() => true).catch(() => false);
    } catch (e) { return Promise.resolve(false); }
  }
  function removeMsg(id) {
    const d = fdb(); if (!d || !id) return Promise.resolve(false);
    try { return d.collection(colOf()).doc(id).delete().then(() => true).catch(() => false); }
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

  // ---------- контакты ----------
  const pairId = (a, b) => [a, b].sort().join("__");
  const contactWith = (uid) => contacts.find((c) => (c.uids || []).indexOf(uid) >= 0);
  const isContact = (uid) => { const c = contactWith(uid); return !!(c && c.status === "ok"); };
  function addContact(uid) {
    const d = fdb(), meU = myUid();
    if (!d || !uid || uid === meU) return Promise.resolve(false);
    const doc = { from: meU, to: uid, uids: [meU, uid], fromName: myName(), toName: nameOf(uid), status: "pending", ts: Date.now(), at: stamp() };
    try { return d.collection(CONT).doc(pairId(meU, uid)).set(doc).then(() => true).catch(() => false); }
    catch (e) { return Promise.resolve(false); }
  }
  function acceptContact(id) {
    const d = fdb(); if (!d || !id) return Promise.resolve(false);
    try { return d.collection(CONT).doc(id).update({ status: "ok" }).then(() => true).catch(() => false); }
    catch (e) { return Promise.resolve(false); }
  }
  function dropContact(id) {
    const d = fdb(); if (!d || !id) return Promise.resolve(false);
    try { return d.collection(CONT).doc(id).delete().then(() => true).catch(() => false); }
    catch (e) { return Promise.resolve(false); }
  }

  // ---------- группы ----------
  const roomMsgs = () => grpAll.filter((m) => m.roomId === roomId);
  const roomOf = (id) => rooms.find((r) => r.id === id);
  function createRoom(name, uids) {
    const d = fdb(), meU = myUid();
    if (!d || !meU) return Promise.resolve(null);
    const list = [meU].concat((uids || []).filter((x) => x && x !== meU)).slice(0, 50);
    const doc = { name: String(name || "Группа").slice(0, 80), by: meU, byName: myName(), uids: list, ts: Date.now(), at: stamp() };
    try { return d.collection(ROOMS).add(doc).then((ref) => ref.id).catch(() => null); }
    catch (e) { return Promise.resolve(null); }
  }
  function roomAdd(id, uid) {
    const d = fdb(), r = roomOf(id);
    if (!d || !r || !uid || (r.uids || []).indexOf(uid) >= 0) return Promise.resolve(false);
    try { return d.collection(ROOMS).doc(id).update({ uids: (r.uids || []).concat([uid]).slice(0, 50) }).then(() => true).catch(() => false); }
    catch (e) { return Promise.resolve(false); }
  }
  function roomKick(id, uid) {
    const d = fdb(), r = roomOf(id);
    if (!d || !r) return Promise.resolve(false);
    try { return d.collection(ROOMS).doc(id).update({ uids: (r.uids || []).filter((x) => x !== uid) }).then(() => true).catch(() => false); }
    catch (e) { return Promise.resolve(false); }
  }
  function sendGroup(text) {
    const t = String(text || "").trim();
    const d = fdb(), uid = myUid(), r = roomOf(roomId);
    if (!t || !d || !uid || !r) return Promise.resolve({ ok: false });
    const doc = { roomId: roomId, uids: (r.uids || []).slice(), from: uid, name: myName(),
      text: t.slice(0, MAXLEN), ts: Date.now(), at: stamp() };
    if (replyTo) doc.replyTo = { id: replyTo.id, name: replyTo.name, text: cut(replyTo.text, 90) };
    if (attachPick) doc.attach = attachPick;
    try { return d.collection(GRP).add(doc).then((r) => { askServerPush("group", r && r.id); return { ok: true }; }).catch(() => ({ ok: false })); }
    catch (e) { return Promise.resolve({ ok: false }); }
  }

  // ---------- вложения: проект / позиция БД / предварительная смета ----------
  // тело кладём ОТДЕЛЬНЫМ документом chat_files, в сообщение — только ссылка: сообщение
  // остаётся маленьким, тяжёлое тело читается лишь когда получатель нажал «применить»
  function putFile(kind, title, data, forUid) {
    const d = fdb(), meU = myUid();
    if (!d || !meU) return Promise.resolve(null);
    const body = String(data || "");
    if (body.length > FILE_MAX) return Promise.resolve({ tooBig: true });
    const doc = {
      by: meU, byName: myName(), kind: kind, title: String(title || "").slice(0, 200),
      data: body, ts: Date.now(), at: stamp(),
      pub: !forUid, uids: forUid ? [meU, forUid] : [meU]
    };
    try { return d.collection(FILES).add(doc).then((ref) => ({ id: ref.id })).catch(() => null); }
    catch (e) { return Promise.resolve(null); }
  }
  function getFile(id) {
    const d = fdb(); if (!d || !id) return Promise.resolve(null);
    try { return d.collection(FILES).doc(id).get().then((sn) => (sn && sn.exists ? sn.data() : null)).catch(() => null); }
    catch (e) { return Promise.resolve(null); }
  }
  // применить вложение у ПОЛУЧАТЕЛЯ теми же публичными API, что и обычные экраны:
  // проект → импорт в «Проект квартиры», позиция → в «Мою БД», смета → в предварительную
  function applyAttach(att) {
    if (!att || !att.fileId) return Promise.resolve("Вложение не найдено");
    return getFile(att.fileId).then((f) => {
      if (!f || !f.data) return "Вложение недоступно";
      try {
        if (f.kind === "plan") {
          const pr = EP.Plan && EP.Plan.Core && EP.Plan.Core.importJSON(f.data);
          if (!pr) return "Не удалось прочитать проект";
          try { EP.Router.go("plan"); } catch (e) {}
          return "Проект «" + (pr.name || "") + "» добавлен";
        }
        if (f.kind === "dbitem") {
          const it = JSON.parse(f.data);
          if (!EP.Database || !EP.Database.addMyItem) return "База данных недоступна";
          EP.Database.addMyItem({ name: it.name, type: it.type, price: it.price, unit: it.unit,
            category: it.category || "Из чата", subcategory: it.subcategory || "" });
          return "Позиция добавлена в «Мою БД»";
        }
        if (f.kind === "client") {
          const c = JSON.parse(f.data);
          if (!EP.Clients || !EP.Clients.addClient) return "Клиенты недоступны";
          // ВАЖНО: EP.Clients.addClient принимает ИМЯ (строку), а не запись клиента —
          // модуль клиентов хранит только {id,name,createdAt} и сам генерирует id, чтобы
          // чужой id не затёр локальную запись. Передача объекта давала String(obj) и
          // клиента с именем «[object Object]» (поймано живым прогоном).
          const nm = String(c && c.name || "").trim();
          if (!nm) return "В вложении нет имени клиента";
          EP.Clients.addClient(nm);
          return "Клиент «" + nm + "» добавлен";
        }
        if (f.kind === "shield") {
          // конфигурация щита живёт одним ключом localStorage — ЗАМЕНА чужой на свою,
          // поэтому спрашиваем подтверждение (в отличие от проекта, который добавляется копией)
          if (!confirm("Загрузить конфигурацию щита? Текущая сборка в конфигураторе будет заменена.")) return "Отменено";
          try { localStorage.setItem("ep_shield_v28_config", f.data); } catch (e) { return "Не удалось сохранить"; }
          try { EP.Router.go("shield"); } catch (e) {}
          return "Конфигурация щита загружена";
        }
        if (f.kind === "photo" || f.kind === "file") {
          // фото/файл не «применяются» — их скачивают (data:-ссылка, без сервера)
          try {
            const a = document.createElement("a");
            a.href = f.data; a.download = f.title || (f.kind === "photo" ? "photo.jpg" : "file");
            document.body.appendChild(a); a.click(); a.remove();
            return "Скачивание началось";
          } catch (e) { return "Не удалось скачать"; }
        }
        if (f.kind === "estimate") {
          const items = JSON.parse(f.data) || [];
          if (!EP.EstimateDraft) return "Смета недоступна";
          if (EP.EstimateDraft.setSourceItems) EP.EstimateDraft.setSourceItems("chat", items);
          else items.forEach((x) => EP.EstimateDraft.addItem(x));
          return "Позиций в предварительной смете: " + items.length;
        }
      } catch (e) { return "Не удалось применить вложение"; }
      return "Неизвестный тип вложения";
    });
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
    if (view === "room" && roomId) {
      const s2 = seenRead(); s2.rooms = s2.rooms || {};
      const ms = roomMsgs();
      s2.rooms[roomId] = Math.max(s2.rooms[roomId] || 0, ms.length ? (ms[ms.length - 1].ts || 0) : Date.now());
      seenWrite(s2);
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
    const st2 = `<button type="button" class="ep-plan-mini ep-clickable" data-fb-status aria-label="Мой статус">${STATUSES[myStatus()].ico}</button>`
      + `<button type="button" class="ep-plan-mini ep-clickable" data-fb-avatar aria-label="Моя аватарка">${esc(myAvatar())}</button>`;
    let st = `<span class="ep-fb-st">⚪ офлайн${q ? " · в очереди " + q : ""}</span>`;
    if (chatState === "live") st = `<span class="ep-fb-st is-live">🟢 онлайн</span>${q ? ` · <span class="ep-fb-st">${q} в очереди</span>` : ""}`;
    else if (chatState === "err") st = `<span class="ep-fb-st is-err">🔴 нет доступа (${esc(chatErr)})</span>`;
    return st + bell + snd + st2;
  }
  function msgHtml(r, isDm) {
    const uid = myUid(), mine = !!uid && (isDm ? r.from === uid : r.uid === uid);
    const canDel = mine || (!isDm && isAdm());
    const nm = esc(r.name || nameOf(r.from) || "Мастер");
    const meta = isDm
      ? esc(fmtTime(atMs(r))) + (r.editedAt ? " · изменено" : "") + (mine && r.seen ? " · прочитано" : "")
      : esc(fmtTime(atMs(r))) + " · " + esc(r.route || "—") + (r.project ? " · " + esc(r.project) : "") + " · v" + esc(r.build || "—") + (r.editedAt ? " · изменено" : "");
    const quote = r.replyTo ? `<div class="ep-fb-quote"><b>${esc(r.replyTo.name || "")}</b> ${esc(r.replyTo.text || "")}</div>` : "";
    const ATT_ICO = { plan: "🏗", dbitem: "📦", estimate: "📋", client: "👤", shield: "🛡", photo: "🖼", file: "📄" };
    const ATT_BTN = { plan: "⤒ Импортировать проект", dbitem: "+ В мою БД", estimate: "+ В смету",
      client: "+ В клиентов", shield: "⤒ Загрузить в конфигуратор", photo: "⤓ Скачать", file: "⤓ Скачать" };
    const att = (r.attach && r.attach.fileId) ? `<div class="ep-fb-att">
      <span class="ep-fb-attico">${ATT_ICO[r.attach.kind] || "📄"}</span>
      <span class="ep-fb-attname">${esc(r.attach.title || "вложение")}${r.attach.note ? `<i>${esc(r.attach.note)}</i>` : ""}</span>
      ${mine ? "" : `<button type="button" class="ep-plan-chip ep-clickable" data-fb-apply="${esc(r.id)}">${ATT_BTN[r.attach.kind] || "Применить"}</button>`}
    </div>` : "";
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
    const q = String(searchQ || "").trim();
    const hit = q && String(r.text || "").toLowerCase().indexOf(q.toLowerCase()) >= 0;
    return `<div class="ep-fb-msg${mine ? " is-mine" : ""}${hit ? " is-hit" : ""}${hitId === r.id ? " is-cur" : ""}" data-fb-msg="${esc(r.id)}">
      ${head}${quote}<div class="ep-fb-text">${esc(r.text || "")}</div>${att}
      <div class="ep-fb-meta">${meta}</div>${acts}</div>`;
  }
  function pendingHtml() {
    return qread().map((r) => `<div class="ep-fb-msg is-mine is-pending">
      <div class="ep-fb-msgtop"><b>${esc(r.name || "Я")}</b><span class="ep-fb-st">⏳ не отправлено</span></div>
      <div class="ep-fb-text">${esc(r.text || "")}</div></div>`).join("");
  }
  // поиск по загруженной переписке: подсветка совпадений + переход к сообщению.
  // Ищем ПО КЛИЕНТУ, а не запросом в Firestore: у Firestore нет полнотекстового поиска
  // (только префикс по одному полю), а история чата и так уже в памяти — 120 последних
  // плюс всё, что дотянули «Загрузить предыдущие».
  function searchHits() {
    const q = String(searchQ || "").trim().toLowerCase();
    if (!q) return [];
    const pool = view === "dm" ? dmMsgs() : (view === "room" ? roomMsgs() : older.concat(msgs));
    return pool.filter((m) => String(m.text || "").toLowerCase().indexOf(q) >= 0);
  }
  function searchBarHtml() {
    if (!searchOn) return "";
    const hits = searchHits();
    return `<div class="ep-fb-attpane">
      <input type="text" class="ep-fb-attsearch" data-fb-searchq placeholder="поиск по переписке…" value="${esc(searchQ)}">
      <span class="ep-fb-st">${searchQ ? (hits.length ? "найдено: " + hits.length : "не найдено") : ""}</span>
      ${hits.length ? `<button type="button" class="ep-plan-chip ep-clickable" data-fb-searchnext>↓ к следующему</button>` : ""}
      <button type="button" class="ep-plan-mini ep-clickable" data-fb-searchclose>✕</button></div>`;
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
    // заявки в контакты (мне) — сверху, как в старых мессенджерах
    const inReq = contacts.filter((c) => c.to === uid && c.status === "pending");
    const outReq = contacts.filter((c) => c.from === uid && c.status === "pending");
    const otherOf = (c) => (c.uids || []).filter((x) => x !== uid)[0] || "";
    const reqHtml = inReq.length ? `<div class="ep-fb-modsec"><b>Заявки в контакты</b></div>` + inReq.map((c) => `<div class="ep-fb-item">
      <div class="ep-fb-text"><b>${esc(c.fromName || nameOf(otherOf(c)))}</b> хочет добавить тебя в контакты</div>
      <div class="ep-fb-acts">
        <button type="button" class="ep-plan-chip on ep-clickable" data-fb-cok="${esc(c.id)}">✓ Принять</button>
        <button type="button" class="ep-plan-chip ep-clickable" data-fb-cdel="${esc(c.id)}">✕ Отклонить</button>
      </div></div>`).join("") : "";
    const rowOf = (p) => {
      const last = dmAll.filter((m) => m.from === p.uid || m.to === p.uid).slice(-1)[0];
      const n = un[p.uid] || 0;
      const retro = skin() === "retro";
      return `<div class="ep-fb-prow"><button type="button" class="ep-fb-person ep-clickable" data-fb-dm="${esc(p.uid)}">
        <span class="ep-fb-ava">${esc(p.avatar || "⚡")}</span>
        ${retro ? `<span class="ep-fb-flower${isOnline(p) ? " is-on" : ""}">${isOnline(p) ? STATUSES[statusOf(p)].ico : "🌼"}</span>` : `<span class="ep-fb-dot${isOnline(p) ? " is-on" : ""}"></span>`}
        <span class="ep-fb-pname">${esc(p.name)}${last ? `<i>${esc(cut(last.text, 40))}</i>` : ""}</span>
        ${n ? `<span class="ep-fb-cnt">${n}</span>` : `<span class="ep-fb-st">${isBanned(p.uid) ? "🚫 в чате ограничен" : (isTyping(p.uid) ? "печатает…" : (isOnline(p) ? STATUSES[statusOf(p)].name : (p.at ? "был " + fmtTime(p.at) : "")))}</span>`}
      </button>${contactBtnHtml(p, outReq)}</div>`;
    };
    const mineC = list.filter((p) => isContact(p.uid)), rest = list.filter((p) => !isContact(p.uid));
    return reqHtml
      + (mineC.length ? `<div class="ep-fb-modsec"><b>Мои контакты</b></div>` + mineC.map(rowOf).join("") : "")
      + (rest.length ? `<div class="ep-fb-modsec"><b>Все мастера</b></div>` + rest.map(rowOf).join("") : "");
  }
  // кнопка контакта рядом с человеком: добавить / «заявка отправлена» / убрать
  function contactBtnHtml(p, outReq) {
    const c = contactWith(p.uid);
    if (c && c.status === "ok") return `<button type="button" class="ep-plan-mini ep-clickable ep-fb-cbtn" data-fb-cdel="${esc(c.id)}" aria-label="Убрать из контактов">✕</button>`;
    if ((outReq || []).some((x) => (x.uids || []).indexOf(p.uid) >= 0)) return `<span class="ep-fb-st ep-fb-cbtn">заявка</span>`;
    return `<button type="button" class="ep-plan-mini ep-clickable ep-fb-cbtn" data-fb-cadd="${esc(p.uid)}" aria-label="Добавить в контакты">＋</button>`;
  }
  // панель 📎: что отправить — проект квартиры, позицию БД или предварительную смету
  function attachPaneHtml() {
    const close = `<button type="button" class="ep-plan-mini ep-clickable" data-fb-attclose>✕</button>`;
    if (attachPane === "menu") {
      return `<div class="ep-fb-attpane">
        <button type="button" class="ep-plan-chip ep-clickable" data-fb-attkind="plan">🏗 Проект</button>
        <button type="button" class="ep-plan-chip ep-clickable" data-fb-attkind="db">📦 Позиция БД</button>
        <button type="button" class="ep-plan-chip ep-clickable" data-fb-attkind="est">📋 Смета</button>
        <button type="button" class="ep-plan-chip ep-clickable" data-fb-attkind="client">👤 Клиент</button>
        <button type="button" class="ep-plan-chip ep-clickable" data-fb-attkind="shield">🛡 Щит</button>
        <label class="ep-plan-chip ep-clickable">🖼 Фото/файл<input type="file" data-fb-attfile accept="image/*,application/pdf" hidden></label>${close}</div>`;
    }
    if (attachPane === "plan") {
      let list = [];
      try { list = (EP.Plan && EP.Plan.Core && EP.Plan.Core.listProjects()) || []; } catch (e) {}
      const rows = list.length
        ? list.slice(0, 30).map((pr) => `<button type="button" class="ep-plan-chip ep-clickable" data-fb-attplan="${esc(pr.id)}">${esc(cut(pr.name || "проект", 28))}</button>`).join("")
        : `<span class="ep-fb-st">Проектов пока нет.</span>`;
      return `<div class="ep-fb-attpane"><span class="ep-fb-st">Какой проект отправить:</span>${rows}${close}</div>`;
    }
    if (attachPane === "db") {
      let items = [];
      try { items = (EP.Database && EP.Database.getItems && EP.Database.getItems()) || []; } catch (e) {}
      const q = String(attachQ || "").toLowerCase();
      const found = (q ? items.filter((x) => String(x.name || "").toLowerCase().indexOf(q) >= 0) : items).slice(0, 15);
      const rows = found.length
        ? found.map((it) => `<button type="button" class="ep-plan-chip ep-clickable" data-fb-attdb="${esc(it.id)}">${esc(cut(it.name, 34))}${it.price ? " · " + it.price + "₽" : ""}</button>`).join("")
        : `<span class="ep-fb-st">Ничего не найдено.</span>`;
      return `<div class="ep-fb-attpane"><input type="text" class="ep-fb-attsearch" data-fb-attq placeholder="поиск по БД…" value="${esc(attachQ || "")}">${rows}${close}</div>`;
    }
    if (attachPane === "client") {
      let list = [];
      try { list = (EP.Clients && EP.Clients.listClients && EP.Clients.listClients()) || []; } catch (e) {}
      const rows = list.length ? list.slice(0, 20).map((c) => `<button type="button" class="ep-plan-chip ep-clickable" data-fb-attclient="${esc(c.id)}">${esc(cut(c.name || "клиент", 30))}</button>`).join("")
        : `<span class="ep-fb-st">Клиентов пока нет.</span>`;
      return `<div class="ep-fb-attpane"><span class="ep-fb-st">Какого клиента отправить:</span>${rows}${close}</div>`;
    }
    if (attachPane === "shield") {
      let has = false;
      try { has = !!localStorage.getItem("ep_shield_v28_config"); } catch (e) {}
      return `<div class="ep-fb-attpane"><span class="ep-fb-st">${has ? "Отправить текущую сборку щита:" : "В конфигураторе пока ничего нет."}</span>
        ${has ? `<button type="button" class="ep-plan-chip on ep-clickable" data-fb-attshield>🛡 Прикрепить конфигурацию</button>` : ""}${close}</div>`;
    }
    if (attachPane === "est") {
      let n = 0;
      try { n = ((EP.EstimateDraft && EP.EstimateDraft.getItems && EP.EstimateDraft.getItems()) || []).length; } catch (e) {}
      return `<div class="ep-fb-attpane"><span class="ep-fb-st">В предварительной смете позиций: ${n}</span>
        ${n ? `<button type="button" class="ep-plan-chip on ep-clickable" data-fb-attest>📋 Прикрепить</button>` : `<span class="ep-fb-st">Сначала собери смету.</span>`}${close}</div>`;
    }
    return "";
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
  function roomsListHtml() {
    const uid = myUid(), sn = seenRead(), seenR = sn.rooms || {};
    const add = `<button type="button" class="btn btn-ghost ep-clickable ep-fb-more" data-fb-roomnew>＋ Новая группа</button>`;
    if (!rooms.length) return add + `<div class="ep-fb-empty">Групп пока нет. Группа — чат по объекту или бригаде: участников добавляешь сам.</div>`;
    return add + rooms.map((r) => {
      const ms = grpAll.filter((m) => m.roomId === r.id);
      const last = ms[ms.length - 1];
      const n = ms.filter((m) => m.from !== uid && (m.ts || 0) > (seenR[r.id] || 0)).length;
      return `<div class="ep-fb-prow"><button type="button" class="ep-fb-person ep-clickable" data-fb-room="${esc(r.id)}">
        <span class="ep-fb-attico">👥</span>
        <span class="ep-fb-pname">${esc(r.name || "Группа")}<i>${esc((r.uids || []).length + " участн." + (last ? " · " + cut(last.text, 30) : ""))}</i></span>
        ${n ? `<span class="ep-fb-cnt">${n}</span>` : ""}
      </button></div>`;
    }).join("");
  }
  function roomBodyHtml() {
    const r = roomOf(roomId);
    if (!r) return `<div class="ep-fb-empty">Группа недоступна.</div>`;
    const rows = roomMsgs().map((m) => msgHtml(m, true)).join("");
    return rows || `<div class="ep-fb-empty">Пока никто не писал. Участников: ${(r.uids || []).length}.</div>`;
  }
  function roomPeopleHtml() {
    const r = roomOf(roomId); if (!r) return "";
    const uid = myUid(), owner = r.by === uid;
    const inRoom = (r.uids || []).map((u) => `<span class="ep-plan-chip">${esc(nameOf(u))}${(owner && u !== uid) ? ` <button type="button" class="ep-fb-kick ep-clickable" data-fb-roomkick="${esc(u)}" aria-label="Убрать">✕</button>` : ""}</span>`).join("");
    const cand = people.concat(contacts.filter((c) => c.status === "ok").map((c) => ({ uid: (c.uids || []).filter((x) => x !== uid)[0], name: c.fromName || c.toName })))
      .filter((x) => x && x.uid && x.uid !== uid && (r.uids || []).indexOf(x.uid) < 0);
    const seen2 = {};
    const addBtns = cand.filter((x) => (seen2[x.uid] ? false : (seen2[x.uid] = true))).slice(0, 20)
      .map((x) => `<button type="button" class="ep-plan-chip ep-clickable" data-fb-roomadd="${esc(x.uid)}">＋ ${esc(nameOf(x.uid))}</button>`).join("");
    return `<div class="ep-fb-attpane"><span class="ep-fb-st">В группе:</span>${inRoom}</div>
      ${addBtns ? `<div class="ep-fb-attpane"><span class="ep-fb-st">Добавить:</span>${addBtns}</div>` : ""}`;
  }
  function statusPaneHtml() {
    if (statusPane === "status") {
      return `<div class="ep-fb-attpane"><span class="ep-fb-st">Мой статус:</span>` + Object.keys(STATUSES).map((k) =>
        `<button type="button" class="ep-plan-chip ep-clickable${myStatus() === k ? " on" : ""}" data-fb-setstatus="${k}">${STATUSES[k].ico} ${STATUSES[k].name}</button>`).join("")
        + `<button type="button" class="ep-plan-mini ep-clickable" data-fb-statusclose>✕</button></div>`;
    }
    if (statusPane === "avatar") {
      return `<div class="ep-fb-attpane"><span class="ep-fb-st">Аватарка:</span>` + AVATARS.map((a) =>
        `<button type="button" class="ep-plan-chip ep-clickable${myAvatar() === a ? " on" : ""}" data-fb-setavatar="${esc(a)}">${esc(a)}</button>`).join("")
        + `<button type="button" class="ep-plan-mini ep-clickable" data-fb-statusclose>✕</button></div>`;
    }
    return "";
  }
  function bodyHtml() {
    if (view === "rooms") return roomsListHtml();
    if (view === "room") return (roomShowPeople ? roomPeopleHtml() : "") + roomBodyHtml();
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
    const uid = myUid(), sn = seenRead(), seenR = sn.rooms || {};
    const grpN = grpAll.filter((m) => m.from !== uid && (m.ts || 0) > (seenR[m.roomId] || 0)).length;
    return t("chat", "Общий", view === "chat" ? 0 : pubN)
      + t("people", retro ? "🌼 Контакты" : "Люди", dmN)
      + t("rooms", "👥 Группы", view === "room" ? 0 : grpN)
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
    const rm = view === "room" ? roomOf(roomId) : null;
    const roomHead = rm ? `<div class="ep-fb-dmhead"><button type="button" class="ep-plan-mini ep-clickable" data-fb-tab="rooms">‹</button>
      <span class="ep-fb-attico">👥</span><b>${esc(rm.name || "Группа")}</b>
      <button type="button" class="ep-plan-mini ep-clickable" data-fb-roompeople>${(rm.uids || []).length} участн.</button></div>` : "";
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
        <button type="button" class="ep-plan-mini ep-clickable" data-fb-search aria-label="Поиск по переписке">🔍</button>
        <button type="button" class="ep-plan-mini ep-clickable" data-fb-skin aria-label="Облик чата">${retro ? "💬" : "🌼"}</button>
        <button type="button" class="ep-plan-mini ep-clickable" data-fb-full aria-label="${fullOn() ? "Свернуть окно чата" : "Во весь экран"}">${fullOn() ? "🗗" : "⛶"}</button>
        <button type="button" class="ep-plan-mini ep-clickable" data-fb-close aria-label="Закрыть">✕</button>
      </div>
      <div class="ep-fb-tabs"><span class="ep-fb-tabs-in">${tabsHtml()}</span><span class="ep-fb-sp"></span><span class="ep-fb-status">${isNotes ? "" : statusHtml()}</span></div>
      ${dmHead}${roomHead}
      <div class="ep-fb-searchwrap">${searchBarHtml()}</div>
      <div class="ep-fb-hint">${hint}</div>
      <div class="ep-fb-list">${bodyHtml()}</div>
      ${typingHtml()}
      ${statusPane ? statusPaneHtml() : ""}
      <button type="button" class="ep-fb-newchip ep-clickable" data-fb-tobottom ${pendingNew ? "" : "hidden"}>↓ ${pendingNew} новых</button>
      ${attachPane ? attachPaneHtml() : ""}
      ${attachPick ? `<div class="ep-fb-replybar"><span>📎 ${esc(attachPick.title)}</span><button type="button" class="ep-plan-mini ep-clickable" data-fb-attcancel>✕</button></div>` : ""}
      ${replyTo ? `<div class="ep-fb-replybar"><span>↩ ${esc(replyTo.name)}: ${esc(cut(replyTo.text, 60))}</span><button type="button" class="ep-plan-mini ep-clickable" data-fb-replycancel>✕</button></div>` : ""}
      ${(view === "people" || view === "mod" || view === "rooms") ? "" : (iAmBanned() && view !== "notes" ? `<div class="ep-fb-banned">🚫 Доступ к чату ограничен администратором. Читать можно, писать — нет.</div>` : `<textarea id="ep-fb-input" class="ep-fb-input" rows="1" placeholder="${isNotes ? "Например: при тапе по проёму зависает экран…" : (view === "dm" ? "Сообщение — " + esc(dmName) : (view === "room" ? "Сообщение в группу…" : "Сообщение в общий чат…"))}"></textarea>
      <div class="ep-fb-row">
        ${isNotes
          ? `<button type="button" class="btn btn-primary ep-clickable" data-fb-add>+ Записать</button>
             <button type="button" class="btn btn-ghost ep-clickable" data-fb-copy>📋 Скопировать всё</button>
             ${read().length ? `<button type="button" class="btn btn-ghost ep-clickable" data-fb-clear>Очистить</button>` : ""}`
          : `<button type="button" class="btn btn-primary ep-clickable" data-fb-send>Отправить</button>
             <button type="button" class="btn btn-ghost ep-clickable" data-fb-attach aria-label="Вложение">📎</button>
             <button type="button" class="btn btn-ghost ep-clickable" data-fb-copychat>📋 Скопировать</button>`}
      </div>`)}
    </div>`;
    ov.hidden = false;
    // класс восстанавливаем на КАЖДЫЙ рендер (render() пересобирает innerHTML, но сам
    // оверлей переиспользуется — иначе после любой перерисовки чат «сворачивался»)
    ov.classList.toggle("is-full", fullOn());
    if (fullOn()) enterNativeFs(ov);
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
  /* Просим сервер разослать push по этому сообщению. Функция САМА читает сообщение и
     проверяет, что зовущий — его автор (подсунуть чужой id нельзя), поэтому передаём
     только вид и id. Best-effort: не смогли позвать — сообщение всё равно на месте и
     придёт получателю при открытии приложения. */
  function askServerPush(kind, id) {
    if (!id) return;
    try {
      if (!window.EP || !EP.Auth || !EP.Auth.callFunction) return;
      EP.Auth.callFunction("chatPush", { kind: kind, id: id }).catch(() => {});
    } catch (e) {}
  }
  function grow(t) {
    try {
      t.style.height = "auto";
      // в развёрнутом окне поле ввода может занять почти половину экрана: длинное
      // сообщение видно целиком, а не через щёлку в три строки
      const cap = fullOn() ? 0.45 : 0.35;
      t.style.height = Math.min(t.scrollHeight + 2, Math.round(window.innerHeight * cap)) + "px";
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
    // сначала гасим нативный фуллскрин: иначе браузер остался бы в нём с пустой
    // страницей (тот же класс бага, что уже чинили у шторок плана)
    exitNativeFs();
    const ov = ovEl(); if (ov) { ov.hidden = true; ov.innerHTML = ""; ov.classList.remove("is-full"); }
    replyTo = null; editId = null; openMsgId = null; pendingNew = 0; attachPick = null; attachPane = null;
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
      view = (v === "notes" || v === "people" || v === "dm" || v === "mod" || v === "rooms" || v === "room") ? v : "chat";
      if (view !== "room") roomShowPeople = false;
      openMsgId = null; editId = null; pendingNew = 0;
      startAll(); render(); return;
    }
    const dmBtn = t.closest("[data-fb-dm]");
    if (dmBtn) { openDm(dmBtn.getAttribute("data-fb-dm")); return; }
    if (t.closest("[data-fb-notify]")) {
      // разрешение получено — СРАЗУ берём токен устройства: без него push при
      // полностью закрытом приложении не придёт, а второго повода спросить не будет
      askNotify().then((ok) => { if (ok) registerPush(); toast(ok ? "Уведомления включены" : "Уведомления не разрешены"); patch(); });
      return;
    }
    if (t.closest("[data-fb-sound]")) { localStorage.setItem(SNDK, soundOn() ? "0" : "1"); if (soundOn()) ping(); patch(); return; }
    if (t.closest("[data-fb-tobottom]")) { const b = listEl(); if (b) b.scrollTop = b.scrollHeight; pendingNew = 0; patch(); return; }
    if (t.closest("[data-fb-older]")) { loadOlder(); return; }
    if (t.closest("[data-fb-replycancel]")) { replyTo = null; render(true); return; }
    const rep = t.closest("[data-fb-reply]");
    if (rep) {
      const id = rep.getAttribute("data-fb-reply");
      const src = older.concat(msgs, dmAll, grpAll).find((m) => m.id === id);
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
      editMsg(id, inp2 ? inp2.value : "").then((ok) => { toast(ok ? "Изменено" : "Не удалось изменить"); editId = null; render(true); });
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
    // ВАЖНО: setFull() зовём ИЗ обработчика клика — requestFullscreen разрешён браузером
    // только внутри стека вызовов пользовательского жеста (из таймера он тихо откажет)
    if (t.closest("[data-fb-full]")) { setFull(!fullOn()); render(true); return; }
    if (t.closest("[data-fb-skin]")) {
      localStorage.setItem(SKINK, skin() === "retro" ? "modern" : "retro");
      render(true); return;
    }
    // ---- контакты ----
    const cadd = t.closest("[data-fb-cadd]");
    if (cadd) { addContact(cadd.getAttribute("data-fb-cadd")).then((ok) => toast(ok ? "Заявка отправлена" : "Не удалось")); return; }
    const cok = t.closest("[data-fb-cok]");
    if (cok) { acceptContact(cok.getAttribute("data-fb-cok")).then((ok) => toast(ok ? "Теперь вы в контактах" : "Не удалось")); return; }
    const cdel = t.closest("[data-fb-cdel]");
    if (cdel) { dropContact(cdel.getAttribute("data-fb-cdel")).then((ok) => { if (!ok) toast("Не удалось"); }); return; }
    // ---- поиск по переписке ----
    if (t.closest("[data-fb-search]")) { searchOn = !searchOn; if (!searchOn) { searchQ = ""; hitId = ""; } render(true); return; }
    if (t.closest("[data-fb-searchclose]")) { searchOn = false; searchQ = ""; hitId = ""; render(true); return; }
    if (t.closest("[data-fb-searchnext]")) {
      const hits = searchHits();
      if (!hits.length) return;
      const i = hits.findIndex((m) => m.id === hitId);
      hitId = hits[(i + 1) % hits.length].id;
      patch();
      const el = ovEl().querySelector(`[data-fb-msg="${hitId}"]`);
      if (el && el.scrollIntoView) el.scrollIntoView({ block: "center" });
      return;
    }
    // ---- статус / аватарка ----
    if (t.closest("[data-fb-status]")) { statusPane = statusPane === "status" ? null : "status"; render(true); return; }
    if (t.closest("[data-fb-avatar]")) { statusPane = statusPane === "avatar" ? null : "avatar"; render(true); return; }
    if (t.closest("[data-fb-statusclose]")) { statusPane = null; render(true); return; }
    const sst = t.closest("[data-fb-setstatus]");
    // syncPushMute: «⛔ не беспокоить» живёт в localStorage (устройство) — сервер
    // о нём иначе не узнает и продолжит присылать push при закрытом приложении
    if (sst) { localStorage.setItem(STK, sst.getAttribute("data-fb-setstatus")); beat(); syncPushMute(); statusPane = null; render(true); return; }
    const sav = t.closest("[data-fb-setavatar]");
    if (sav) { localStorage.setItem(AVK, sav.getAttribute("data-fb-setavatar")); beat(); statusPane = null; render(true); return; }
    // ---- группы ----
    if (t.closest("[data-fb-roomnew]")) {
      const nm = prompt("Название группы (объект, бригада):", "Объект");
      if (!nm) return;
      createRoom(nm, contacts.filter((c) => c.status === "ok").map((c) => (c.uids || []).filter((x) => x !== myUid())[0]))
        .then((id) => { if (!id) { toast("Не удалось создать"); return; } roomId = id; view = "room"; render(); toast("Группа создана — добавь участников"); });
      return;
    }
    const rmBtn = t.closest("[data-fb-room]");
    if (rmBtn) { roomId = rmBtn.getAttribute("data-fb-room"); view = "room"; roomShowPeople = false; render(); return; }
    if (t.closest("[data-fb-roompeople]")) { roomShowPeople = !roomShowPeople; render(true); return; }
    const radd = t.closest("[data-fb-roomadd]");
    if (radd) { roomAdd(roomId, radd.getAttribute("data-fb-roomadd")).then((ok) => toast(ok ? "Добавлен" : "Не удалось")); return; }
    const rkick = t.closest("[data-fb-roomkick]");
    if (rkick) { roomKick(roomId, rkick.getAttribute("data-fb-roomkick")).then((ok) => { if (!ok) toast("Не удалось"); }); return; }
    // ---- вложения ----
    if (t.closest("[data-fb-attach]")) { attachPane = attachPane ? null : "menu"; render(true); return; }
    if (t.closest("[data-fb-attclose]")) { attachPane = null; render(true); return; }
    if (t.closest("[data-fb-attcancel]")) { attachPick = null; render(true); return; }
    const ak = t.closest("[data-fb-attkind]");
    if (ak) { attachPane = ak.getAttribute("data-fb-attkind"); attachQ = ""; render(true); return; }
    const ap = t.closest("[data-fb-attplan]");
    if (ap) {
      const id = ap.getAttribute("data-fb-attplan");
      let nm = id;
      try { const f2 = (EP.Plan.Core.listProjects() || []).find((x) => x.id === id); if (f2) nm = f2.name || id; } catch (e) {}
      toast("Готовлю проект…");
      Promise.resolve(EP.Plan.Core.exportJSONById(id)).then((json) => {
        if (!json) { toast("Проект не найден"); return; }
        return putFile("plan", nm, json, view === "dm" ? dmUid : null).then((res) => {
          if (!res) { toast("Не удалось подготовить вложение"); return; }
          if (res.tooBig) { toast("Проект слишком большой для чата (фото) — отправь файлом через ⤓ Экспорт"); return; }
          attachPick = { kind: "plan", title: nm, fileId: res.id, note: "проект квартиры" };
          attachPane = null; render(true);
        });
      });
      return;
    }
    const ad = t.closest("[data-fb-attdb]");
    if (ad) {
      const id = ad.getAttribute("data-fb-attdb");
      let it = null;
      try { it = (EP.Database.getItems() || []).find((x) => x.id === id); } catch (e) {}
      if (!it) { toast("Позиция не найдена"); return; }
      putFile("dbitem", it.name, JSON.stringify(it), view === "dm" ? dmUid : null).then((res) => {
        if (!res || res.tooBig) { toast("Не удалось подготовить вложение"); return; }
        attachPick = { kind: "dbitem", title: cut(it.name, 60), fileId: res.id, note: (it.price ? it.price + "₽" : "") + (it.unit ? "/" + it.unit : "") };
        attachPane = null; render(true);
      });
      return;
    }
    if (t.closest("[data-fb-attest]")) {
      let items = [];
      try { items = (EP.EstimateDraft.getItems() || []); } catch (e) {}
      if (!items.length) { toast("Смета пуста"); return; }
      putFile("estimate", "Предварительная смета (" + items.length + ")", JSON.stringify(items), view === "dm" ? dmUid : null).then((res) => {
        if (!res) { toast("Не удалось подготовить вложение"); return; }
        if (res.tooBig) { toast("Смета слишком большая для чата"); return; }
        attachPick = { kind: "estimate", title: "Смета: " + items.length + " поз.", fileId: res.id, note: "предварительная" };
        attachPane = null; render(true);
      });
      return;
    }
    const ac = t.closest("[data-fb-attclient]");
    if (ac) {
      const id = ac.getAttribute("data-fb-attclient");
      let c = null;
      try { c = (EP.Clients.listClients() || []).find((x) => x.id === id); } catch (e) {}
      if (!c) { toast("Клиент не найден"); return; }
      putFile("client", c.name || "клиент", JSON.stringify(c), view === "dm" ? dmUid : null).then((res) => {
        if (!res || res.tooBig) { toast("Не удалось подготовить вложение"); return; }
        attachPick = { kind: "client", title: cut(c.name || "клиент", 60), fileId: res.id, note: c.phone || c.address || "" };
        attachPane = null; render(true);
      });
      return;
    }
    if (t.closest("[data-fb-attshield]")) {
      let cfg = "";
      try { cfg = localStorage.getItem("ep_shield_v28_config") || ""; } catch (e) {}
      if (!cfg) { toast("В конфигураторе пусто"); return; }
      putFile("shield", "Сборка щита", cfg, view === "dm" ? dmUid : null).then((res) => {
        if (!res || res.tooBig) { toast("Не удалось подготовить вложение"); return; }
        attachPick = { kind: "shield", title: "Сборка щита", fileId: res.id, note: "конфигуратор" };
        attachPane = null; render(true);
      });
      return;
    }
    const apl = t.closest("[data-fb-apply]");
    if (apl) {
      const id = apl.getAttribute("data-fb-apply");
      const m2 = older.concat(msgs, dmAll, grpAll).find((x) => x.id === id);
      if (!m2 || !m2.attach) { toast("Вложение не найдено"); return; }
      toast("Применяю…");
      applyAttach(m2.attach).then((msg) => toast(msg));
      return;
    }
    const dl = t.closest("[data-fb-del2]");
    if (dl) {
      if (!confirm("Удалить сообщение?")) return;
      removeMsg(dl.getAttribute("data-fb-del2")).then((ok) => { if (!ok) toast("Не удалось удалить"); openMsgId = null; });
      return;
    }
    const mg = t.closest("[data-fb-msg]");
    if (mg) { const id = mg.getAttribute("data-fb-msg"); openMsgId = (openMsgId === id ? null : id); patch(); return; }
    if (t.closest("[data-fb-send]")) {
      const inp3 = document.getElementById("ep-fb-input");
      const v = inp3 ? inp3.value : "";
      if (!String(v).trim()) { toast("Напиши сообщение"); return; }
      if (inp3) { inp3.value = ""; grow(inp3); }
      const p = view === "room" ? sendGroup(v) : (view === "dm" ? sendDm(v) : sendPub(v));
      replyTo = null; attachPick = null; attachPane = null;
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
  // фото сжимаем до 1280px/JPEG q0.72 (иначе снимок с телефона — 3-5 МБ и в документ
  // Firestore не влезет), остальные файлы берём как есть и проверяем предел
  function readAsAttach(file) {
    return new Promise((resolve) => {
      if (!file) { resolve(null); return; }
      const fr = new FileReader();
      fr.onerror = () => resolve(null);
      fr.onload = () => {
        const data = String(fr.result || "");
        if (!/^image\//.test(file.type)) { resolve({ kind: "file", title: file.name || "файл", data: data }); return; }
        const img = new Image();
        img.onerror = () => resolve({ kind: "photo", title: file.name || "фото", data: data });
        img.onload = () => {
          try {
            const side = 1280, k = Math.min(1, side / Math.max(img.width, img.height));
            const cv = document.createElement("canvas");
            cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
            cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
            resolve({ kind: "photo", title: file.name || "фото", data: cv.toDataURL("image/jpeg", 0.72) });
          } catch (e2) { resolve({ kind: "photo", title: file.name || "фото", data: data }); }
        };
        img.src = data;
      };
      fr.readAsDataURL(file);
    });
  }
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (!t || !t.hasAttribute || !t.hasAttribute("data-fb-attfile")) return;
    const file = t.files && t.files[0];
    t.value = "";
    if (!file) return;
    toast("Готовлю вложение…");
    readAsAttach(file).then((att) => {
      if (!att) { toast("Не удалось прочитать файл"); return; }
      return putFile(att.kind, att.title, att.data, view === "dm" ? dmUid : null).then((res) => {
        if (!res) { toast("Не удалось подготовить вложение"); return; }
        if (res.tooBig) { toast("Файл слишком большой для чата (до ~0.9 МБ)"); return; }
        attachPick = { kind: att.kind, title: cut(att.title, 60), fileId: res.id, note: Math.round(att.data.length / 1024) + " КБ" };
        attachPane = null; render(true);
      });
    });
  });
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (!t) return;
    if (t.id === "ep-fb-input" || (t.hasAttribute && t.hasAttribute("data-fb-editinput"))) grow(t);
    if (t.id === "ep-fb-input" && String(t.value || "").trim()) markTyping();
    if (t.hasAttribute && t.hasAttribute("data-fb-searchq")) {
      searchQ = t.value; hitId = "";
      patch();
      // САМУ строку поиска перерисовываем ЦЕЛИКОМ (её отдельная обёртка .ep-fb-searchwrap),
      // а не только счётчик найденного: раньше правился текст первого .ep-fb-attpane .ep-fb-st
      // в оверлее — из-за этого (а) кнопка «↓ к следующему» не появлялась вообще, пока не
      // случится полный render() из другого места (набрал запрос — «найдено: 2», а
      // переходить к находкам нечем), и (б) при открытой панели 📎/статуса счётчик писался
      // в ЧУЖУЮ панель (первый .ep-fb-attpane в DOM — не обязательно поиск).
      const wrap = ovEl() && ovEl().querySelector(".ep-fb-searchwrap");
      if (wrap) {
        wrap.innerHTML = searchBarHtml();
        const bar = wrap.querySelector("[data-fb-searchq]");
        // курсор ставим в конец: перерисовка узла сбрасывает фокус и каретку
        if (bar) { bar.focus(); try { bar.setSelectionRange(bar.value.length, bar.value.length); } catch (e2) {} }
      }
      return;
    }
    if (t.hasAttribute && t.hasAttribute("data-fb-attq")) {
      attachQ = t.value;
      const pane = ovEl() && ovEl().querySelector(".ep-fb-attpane");
      if (pane) { pane.outerHTML = attachPaneHtml(); const inp5 = ovEl().querySelector("[data-fb-attq]"); if (inp5) { inp5.focus(); inp5.setSelectionRange(inp5.value.length, inp5.value.length); } }
    }
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
    // токен push принадлежал ПРЕЖНЕМУ аккаунту — иначе новый владелец устройства
    // получал бы уведомления о чужой личке
    dropPushToken();
    msgs = []; older = []; dmAll = []; people = []; bans = []; reports = []; contacts = []; rooms = []; grpAll = []; noMoreOlder = false;
    gotPub = false; gotDm = false; gotGrp = false; seenPending.clear();
    if (myUid()) { startAll(); registerPush(); }
    ensureFab();
    if (isOpen()) render(true);
  });
  window.addEventListener("ep:route-loaded", ensureFab);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { beat(); startAll(); } });
  // приложение открыто — сразу слушаем чат (метка/звук/уведомление работают и при
  // закрытом окне чата), кнопка вызова доступна с любого экрана
  setTimeout(() => { ensureFab(); if (myUid()) { startAll(); registerPush(); } }, 1500);

  EP.Feedback = {
    open, close, add, read, asText, copyAll, count: () => read().length,
    send: sendPub, sendDm, messages: () => msgs.slice(), dmMessages: () => dmMsgs(), chatText,
    queue: qread, flushQueue, state: () => chatState, unread: unreadTotal, people: () => people.slice(),
    openDm, setView: (v) => { view = v; if (isOpen()) render(); }, isOnline, notifyAsk: askNotify,
    banUser, unbanUser, purgeUser, reportMsg, closeReport, bans: () => bans.slice(), reports: () => reports.slice(),
    isBanned, skin, myStatus, myAvatar, isTyping, STATUSES,
    search: (q) => { searchOn = true; searchQ = q || ""; if (isOpen()) render(true); return searchHits().length; },
    addContact, acceptContact, dropContact, contacts: () => contacts.slice(), isContact,
    putFile, getFile, applyAttach,
    rooms: () => rooms.slice(), createRoom, roomAdd, roomKick, openRoom: (id) => { roomId = id; view = "room"; if (isOpen()) render(); },
    roomMessages: () => roomMsgs()
  };
  EP.Chat = EP.Feedback;
})();
