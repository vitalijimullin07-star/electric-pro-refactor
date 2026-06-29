/* ============================================================
   Electric Pro V29 — Админка v3
   Вид БД (мастера и сервера): тип → категория(папка) → подкатегория(подпапка) → карточки.
   Из БД мастера позицию можно добавить в БД сервера (➕). Бэкенд: europe-west1.
   ============================================================ */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const OWNER = "vits0007@gmail.com";
  const SRV_DOC = "main", META_DOC = "__meta__";
  const A = { tab: "users", users: [], selectedUid: null, userTab: "status", section: null, onlyPending: false, srv: null, srvKeys: new Set(), masterDb: [], exp: new Set(), contact: null, uexp: new Set(), uq: "" };
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const jn = (o) => { try { return JSON.stringify(o, null, 2); } catch (e) { return String(o); } };
  const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
  const tsDate = (t) => { if (!t) return null; const s = t._seconds || t.seconds; if (s) return new Date(s * 1000); if (t.toDate) try { return t.toDate(); } catch (e) {} const d = new Date(t); return isNaN(d) ? null : d; };
  const dstr = (t) => { const d = tsDate(t); return d ? d.toLocaleDateString("ru-RU") : "—"; };
  const uid4 = () => "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  function me() { try { return (EP.Auth && EP.Auth.currentUser && EP.Auth.currentUser()) || (EP.state && EP.state.user) || {}; } catch (e) { return {}; } }
  function isAdmin() { try { if ((me() || {}).email === OWNER) return true; if (EP.Auth && EP.Auth.isAdmin && EP.Auth.isAdmin()) return true; const p = (EP.state && EP.state.profile) || {}; return p.role === "admin" || p.isAdmin === true; } catch (e) { return false; } }
  function db() { try { return (EP.Firebase && EP.Firebase.db) || null; } catch (e) { return null; } }
  function fns() { try { if (typeof firebase !== "undefined" && firebase.app) return firebase.app().functions("europe-west1"); } catch (e) {} try { if (typeof firebase !== "undefined" && firebase.functions) return firebase.functions("europe-west1"); } catch (e) {} return null; }
  async function call(name, payload) { const f = fns(); if (!f) throw new Error("functions-unavailable"); const r = await f.httpsCallable(name)(payload || {}); return r && r.data; }
  function FV() { return (typeof firebase !== "undefined" && firebase.firestore && firebase.firestore.FieldValue) ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString(); }
  function status(m) { const el = $("#ep-admin-status"); if (el) el.textContent = m; }

  function uStatus(u) { return u.status || (u.isApproved ? "approved" : "pending"); }
  function isPending(u) { const s = uStatus(u); return s === "pending" || s === "pending_review" || (!u.isApproved && ["approved", "blocked", "blocked_review", "deleted"].indexOf(s) < 0); }
  function isBlocked(u) { const s = uStatus(u); return u.blocked === true || ["blocked", "blocked_review", "deleted"].indexOf(s) >= 0; }
  function isApproved(u) { return uStatus(u) === "approved" || u.isApproved === true; }
  function subActive(s) { return s && (s.status === "active" || s.status === "trial") && (!s.expiresAt || (tsDate(s.expiresAt) && tsDate(s.expiresAt).getTime() > Date.now())); }

  // ====== загрузка ======
  async function loadUsers() {
    status("Загрузка пользователей…"); const d = db(); if (!d) { status("Firebase недоступен."); return; }
    try {
      const [us, subs, ais] = await Promise.all([d.collection("users").limit(800).get(), d.collection("user_subscriptions").limit(800).get().catch(() => ({ docs: [] })), d.collection("ai_accounts").limit(800).get().catch(() => ({ docs: [] }))]);
      const sm = {}, am = {}; subs.docs.forEach((x) => sm[x.id] = x.data() || {}); ais.docs.forEach((x) => am[x.id] = x.data() || {});
      A.users = us.docs.map((doc) => { const dt = doc.data() || {}; return { uid: doc.id, email: dt.email || "", displayName: dt.displayName || dt.name || "", role: dt.role || "master", status: dt.status, isApproved: dt.isApproved, isAdmin: dt.isAdmin, blocked: dt.blocked, createdAt: dt.createdAt, aiBalance: dt.aiBalance, aiBalanceCurrency: dt.aiBalanceCurrency, securityPolicy: dt.securityPolicy || {}, subscription: sm[doc.id] || null, aiAccount: am[doc.id] || null }; });
      status("Пользователей: " + A.users.length); if (A.tab === "users") renderUsersTab();
    } catch (e) { const c = e && (e.code || e.message); status(String(c).indexOf("permission-denied") >= 0 ? "Нет прав (нужна роль admin + status approved)." : "Ошибка: " + c); }
  }
  async function readDoc(coll, id) { const d = db(); if (!d) return { error: "no-db" }; try { const s = await d.collection(coll).doc(id).get(); return { exists: s.exists, data: s.exists ? (s.data() || {}) : null }; } catch (e) { return { error: (e && (e.code || e.message)) || "error" }; } }
  async function readColl(coll, field, val) { const d = db(); if (!d) return { error: "no-db" }; try { let q = d.collection(coll); if (field) q = q.where(field, "==", val); const s = await q.limit(80).get(); return { docs: s.docs.map((x) => ({ id: x.id, data: x.data() || {} })) }; } catch (e) { return { error: (e && (e.code || e.message)) || "error" }; } }
  async function ensureSrv() { if (A.srv !== null) return true; const r = await readDoc("server_db", SRV_DOC); if (r.error) { A.srv = null; return false; } A.srv = (r.data && Array.isArray(r.data.items)) ? r.data.items.slice() : []; buildSrvKeys(); return true; }
  function buildSrvKeys() { A.srvKeys = new Set((A.srv || []).map(dbKey)); }
  async function saveSrv(msg) { const d = db(); if (!d) return false; try { await d.collection("server_db").doc(SRV_DOC).set({ items: A.srv || [], workCount: (A.srv || []).filter((x) => x.type === "work").length, materialCount: (A.srv || []).filter((x) => x.type === "material").length, updatedByEmail: (me() || {}).email || "", updatedAt: FV() }, { merge: true }); buildSrvKeys(); status(msg || "БД сервера сохранена ✓"); return true; } catch (e) { const c = e && (e.code || e.message); status(String(c).indexOf("permission-denied") >= 0 ? "Нет прав на запись server_db." : "Ошибка: " + c); return false; } }

  // ====== общий вид БД: папки/подпапки/карточки ======
  function dbKey(it) { return (it.type === "work" ? "work" : "material") + "|" + String(it.name || "").trim().toLowerCase(); }
  function groupTree(items) {
    const out = { material: {}, work: {} };
    (items || []).forEach((it) => { const t = it.type === "work" ? "work" : "material"; const cat = it.category || ""; const sub = it.subcategory || ""; out[t][cat] = out[t][cat] || {}; (out[t][cat][sub] = out[t][cat][sub] || []).push(it); });
    return out;
  }
  function card(it, mode) {
    const price = it.price ? num(it.price).toFixed(2) + " ₽" : "—";
    let act = "";
    if (mode === "master") { const inS = A.srvKeys.has(dbKey(it)); act = inS ? `<span class="ep-adb-in">✓ в сервере</span>` : `<button class="ep-mini ep-mini-ok" data-add-srv="${esc(it.id)}" title="Добавить в БД сервера">➕</button>`; }
    else if (mode === "server") { act = `<button class="ep-mini" data-srv-edit="${esc(it.id)}" title="Изменить">✎</button><button class="ep-mini ep-mini-d" data-srv-del="${esc(it.id)}" title="Удалить">✕</button>`; }
    return `<div class="ep-adb-card"><div class="ep-adb-info"><b>${esc(it.name)}</b><span>${esc(it.unit || "")} · ${price}</span></div>${act}</div>`;
  }
  function renderTree(items, mode) {
    if (!items || !items.length) return "<div class='ep-admin-empty'>Пусто.</div>";
    if (mode === "master") buildSrvKeys();
    const tree = groupTree(items);
    let html = `<p class="ep-admin-muted">Позиций: ${items.length} · нажми папку, чтобы раскрыть</p>`;
    [["material", "📦 Материалы"], ["work", "🧰 Работа"]].forEach(([t, label]) => {
      const cats = tree[t]; const catNames = Object.keys(cats).sort((a, b) => a.localeCompare(b, "ru"));
      const total = catNames.reduce((n, c) => n + Object.values(cats[c]).reduce((m, arr) => m + arr.length, 0), 0);
      if (!total) return;
      html += `<div class="ep-adb-type">${label} <span class="ep-adb-cnt">${total}</span></div>`;
      catNames.forEach((cat) => {
        const subs = cats[cat]; const catItems = Object.values(subs).reduce((m, arr) => m + arr.length, 0);
        const fkey = t + "|" + cat; const open = A.exp.has(fkey); const catLabel = cat || "Без категории";
        html += `<div class="ep-adb-folder ${open ? "is-open" : ""}"><button class="ep-adb-fhead" data-fold="${esc(fkey)}">${open ? "▼" : "▶"} 📁 ${esc(catLabel)} <span class="ep-adb-cnt">${catItems}</span></button>`;
        if (open) {
          (subs[""] || []).forEach((it) => { html += card(it, mode); });
          Object.keys(subs).filter((s) => s).sort((a, b) => a.localeCompare(b, "ru")).forEach((sub) => {
            const skey = fkey + "|" + sub; const sopen = A.exp.has(skey);
            html += `<div class="ep-adb-subfolder ${sopen ? "is-open" : ""}"><button class="ep-adb-shead" data-fold="${esc(skey)}">${sopen ? "▼" : "▶"} 📂 ${esc(sub)} <span class="ep-adb-cnt">${subs[sub].length}</span></button>`;
            if (sopen) subs[sub].forEach((it) => { html += card(it, mode); });
            html += `</div>`;
          });
        }
        html += `</div>`;
      });
    });
    return html;
  }
  async function addToServer(id) {
    const it = (A.masterDb || []).find((x) => String(x.id) === String(id)); if (!it) return;
    if (!(await ensureSrv())) { status("Нет доступа к server_db."); return; }
    if (A.srvKeys.has(dbKey(it))) { status("Эта позиция уже в сервере."); return; }
    A.srv.push({ id: uid4(), type: it.type === "work" ? "work" : "material", name: it.name, unit: it.unit || "", price: num(it.price), category: it.category || "", subcategory: it.subcategory || "" });
    buildSrvKeys();
    const ok = await saveSrv("«" + (it.name || "позиция") + "» добавлена в сервер ✓");
    if (ok && A.section === "db") openSection("db");
  }

  // ====== навигация ======
  function renderNav() { const tabs = [["users", "👥 Пользователи"], ["serverdb", "🗄️ БД сервера"], ["aiserver", "🤖 ИИ-сервер"], ["requests", "📥 Запросы"], ["contacts", "⚙️ Контакты"]]; const nav = $("#ep-admin-nav"); if (nav) nav.innerHTML = tabs.map((t) => `<button data-tab="${t[0]}" class="${A.tab === t[0] ? "on" : ""}">${t[1]}</button>`).join(""); }
  function switchTab(tab) { A.tab = tab; renderNav(); if (tab === "users") { renderUsersTab(); if (!A.users.length) loadUsers(); } else if (tab === "serverdb") renderServerDb(); else if (tab === "aiserver") renderAiServer(); else if (tab === "requests") renderRequests(); else if (tab === "contacts") renderContacts(); }

  // ====== ИИ-СЕРВЕР (серверные ключи API) ======
  const AIKEY = "ep_ai_v29";
  function aiLoad() { try { return JSON.parse(localStorage.getItem(AIKEY) || "null") || {}; } catch (e) { return {}; } }
  function aiSaveObj(o) { try { localStorage.setItem(AIKEY, JSON.stringify(o)); } catch (e) {} }
  function aiSrvCfg(prov) { const o = aiLoad(); o.server = o.server || {}; o.server[prov] = Object.assign({ key: "", model: "", priceIn: 0, priceOut: 0, balance: 0 }, o.server[prov] || {}); return o; }
  function renderAiServer() {
    const host = $("#ep-admin-body"); if (!host) return; A.aiProv = A.aiProv || "openai";
    const o = aiSrvCfg(A.aiProv); const c = o.server[A.aiProv];
    const provs = [["openai", "OpenAI (ChatGPT)"], ["gemini", "Google Gemini"]];
    host.innerHTML = `<div class="ep-admin-card"><h3>🤖 Серверные API (для ИИ-прокси)</h3>
      <p class="ep-admin-muted">Общие ключи, на которых работает ИИ через сервер. Баланс привязан к ключу — расход списывается с него. Сам серверный прокси (Cloud Functions) подключим позже; пока это хранилище ключей + тест под админом (переключатель «Серверный» в ИИ-ассистенте).</p>
      <div class="ep-ai-ptabs">${provs.map((p) => `<button type="button" class="ep-ai-ptab ${A.aiProv === p[0] ? "on" : ""}" data-aisrv-prov="${p[0]}">${esc(p[1])}</button>`).join("")}</div>
      <label class="ep-ai-f"><span>Серверный API-ключ</span><input type="password" data-aisrv="key" value="${esc(c.key || "")}" placeholder="ключ ${esc(A.aiProv)}" autocomplete="off"></label>
      <label class="ep-ai-f"><span>Модель</span><input type="text" data-aisrv="model" value="${esc(c.model || "")}" placeholder="${A.aiProv === "openai" ? "gpt-4o-mini" : "gemini-1.5-flash"}"></label>
      <div class="ep-ai-f2"><label class="ep-ai-f"><span>Цена 1M вход, $</span><input type="number" step="0.01" min="0" data-aisrv="priceIn" value="${c.priceIn || ""}"></label><label class="ep-ai-f"><span>Цена 1M исход, $</span><input type="number" step="0.01" min="0" data-aisrv="priceOut" value="${c.priceOut || ""}"></label></div>
      <label class="ep-ai-f"><span>Баланс серверного ключа, $</span><input type="number" step="0.01" min="0" data-aisrv="balance" value="${c.balance || ""}" placeholder="напр. 50"></label>
      <p class="ep-admin-muted">Сохраняется на этом устройстве (для теста). Для общего доступа мастеров вынесем ключи в Firestore + прокси.</p></div>`;
  }

  // ====== ПОЛЬЗОВАТЕЛИ (карточки-гармошки с тумблерами) ======
  const CURSYM = { USD: "$", EUR: "€", RUB: "₽" };
  function curSym(c) { return CURSYM[c] || "$"; }
  function uBal(u) { const v = num(u.aiBalance); return curSym(u.aiBalanceCurrency || "USD") + (Math.round(v * 100) / 100); }
  function isTrialSub(s) { return subActive(s) && (s.status === "trial" || /trial/i.test(s.planId || s.plan || "")); }
  function tog(uid, id, on, label) { return `<label class="ep-tog"><span>${label}</span><input type="checkbox" data-u-tog="${id}" data-uid="${esc(uid)}" ${on ? "checked" : ""}><i></i></label>`; }
  function uCard(u) {
    const open = A.uexp.has(u.uid); const st = uStatus(u); const sub = u.subscription || {};
    const trial = isTrialSub(sub); const paid = subActive(sub) && !trial;
    const aiOn = !!(u.aiAccount && u.aiAccount.accessMode && u.aiAccount.accessMode !== "disabled");
    const blocked = isBlocked(u); const access = isApproved(u) && !blocked;
    let body = "";
    if (open) body = `<div class="ep-ucard-body">
        <div class="ep-togs">
          ${tog(u.uid, "access", access, "Доступ")}
          ${tog(u.uid, "sub", paid, "Подписка")}
          ${tog(u.uid, "trial", trial, "Тест 10 дней")}
          ${tog(u.uid, "ai", aiOn, "ИИ")}
          ${tog(u.uid, "block", blocked, "Заблокирован")}
        </div>
        <div class="ep-ubal">
          <span>Баланс:</span>
          <input type="number" step="0.01" min="0" data-u-bal="${esc(u.uid)}" value="${u.aiBalance != null ? esc(u.aiBalance) : ""}" placeholder="0">
          <select data-u-cur="${esc(u.uid)}">${["USD", "EUR", "RUB"].map((c) => `<option value="${c}" ${(u.aiBalanceCurrency || "USD") === c ? "selected" : ""}>${curSym(c)} ${c}</option>`).join("")}</select>
          <button type="button" class="ep-mini ep-mini-ok" data-u-balset="${esc(u.uid)}">задать</button>
        </div>
        ${subActive(sub) ? `<p class="ep-admin-muted ep-ucard-sub">План: ${esc(sub.planId || sub.plan || "—")}${sub.expiresAt ? " · до " + esc(dstr(sub.expiresAt)) : ""}</p>` : ""}
        <div class="ep-ucard-more"><button type="button" class="ep-ghost" data-open="${esc(u.uid)}">Данные / подробно →</button></div>
        <p class="ep-act-st" id="ep-act-${esc(u.uid)}"></p>
      </div>`;
    return `<div class="ep-ucard ${open ? "is-open" : ""} ${blocked ? "is-blk" : ""}">
      <button type="button" class="ep-ucard-head" data-u-exp="${esc(u.uid)}">
        <span class="ep-ucard-ex">${open ? "▼" : "▶"}</span>
        <span class="ep-ucard-main"><b>${esc(u.email || u.uid)}</b><small>${esc(u.displayName || "—")} · рег. ${esc(dstr(u.createdAt))}</small></span>
        <span class="ep-ucard-bal">${esc(uBal(u))}</span>
        <span class="ep-st ep-st-${esc(st)}">${esc(st)}</span>
      </button>${body}</div>`;
  }
  function renderUsersTab() {
    const host = $("#ep-admin-body"); if (!host) return;
    const pend = A.users.filter(isPending);
    const q = (A.uq || "").toLowerCase();
    let list = A.users.slice();
    if (q) list = list.filter((u) => [u.email, u.displayName, u.uid].some((x) => String(x || "").toLowerCase().indexOf(q) >= 0));
    host.innerHTML = `<div class="ep-admin-dashboard">
        <div class="ep-admin-card ep-stat"><span>Всего</span><b>${A.users.length}</b></div>
        <div class="ep-admin-card ep-stat"><span>Заявки</span><b>${pend.length}</b></div>
        <div class="ep-admin-card ep-stat"><span>Подписка</span><b>${A.users.filter((u) => subActive(u.subscription)).length}</b></div>
        <div class="ep-admin-card ep-stat"><span>Заблок.</span><b>${A.users.filter(isBlocked).length}</b></div></div>
      ${pend.length ? `<div class="ep-admin-card ep-pend"><h3>🔔 Новые заявки (${pend.length})</h3>${pend.map((u) => `<div class="ep-admin-prow"><div><b>${esc(u.email || u.uid)}</b><span>${esc(u.displayName || "")} · ${esc(dstr(u.createdAt))}</span></div><div class="ep-admin-prow-act"><button data-u-tog="access" data-uid="${esc(u.uid)}" data-quick="1" class="ep-ok">Одобрить</button></div></div>`).join("")}</div>` : ""}
      <div class="ep-admin-toolbar"><input id="ep-uq" placeholder="🔍 поиск по пользователям" value="${esc(A.uq || "")}"><button id="ep-admin-refresh" class="ep-ghost">Обновить</button></div>
      <div class="ep-ulist">${list.length ? list.map(uCard).join("") : "<div class='ep-admin-empty'>Никого не найдено.</div>"}</div>
      <div id="ep-admin-detail"></div>`;
    if (A.selectedUid && A.uexp.has(A.selectedUid)) renderDetail();
  }
  function uToggle(uid, which, on) {
    A.selectedUid = uid;
    if (which === "access") return on ? writeUserDoc(uid, { status: "approved", isApproved: true, blocked: false }, "Доступ открыт ✓") : writeUserDoc(uid, { status: "blocked_review", blocked: true }, "Доступ закрыт");
    if (which === "block") return on ? writeUserDoc(uid, { status: "blocked_review", blocked: true }, "Заблокирован") : writeUserDoc(uid, { status: "approved", blocked: false, isApproved: true }, "Разблокирован");
    if (which === "sub") return on ? callOp("grantSubscription", { uid, planId: "basic", periodDays: 30, trial: false }, "Подписка включена ✓") : callOp("cancelSubscription", { uid, reason: "admin_panel" }, "Подписка выключена");
    if (which === "trial") return on ? callOp("grantSubscription", { uid, planId: "basic", periodDays: 10, trial: true }, "Тест 10 дней включён ✓") : callOp("cancelSubscription", { uid, reason: "admin_panel" }, "Тест выключен");
    if (which === "ai") return on ? callOp("setAiAccessMode", { uid, accessMode: "own_api" }, "ИИ включён ✓") : callOp("setAiAccessMode", { uid, accessMode: "disabled" }, "ИИ выключен");
  }
  function user() { return A.users.find((x) => x.uid === A.selectedUid); }
  function selectUser(uid) { A.selectedUid = uid; A.userTab = "status"; A.section = null; A.masterDb = []; closePicker(); renderDetail(); const h = $("#ep-admin-detail"); if (h && h.scrollIntoView) try { h.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) {} }
  function renderDetail() {
    const host = $("#ep-admin-detail"); if (!host) return; const u = user(); if (!u) { host.innerHTML = "<div class='ep-admin-empty'>Выберите пользователя.</div>"; return; }
    const st = uStatus(u); const tabs = [["status", "Статус"], ["sub", "Подписка"], ["ai", "ИИ"], ["sec", "Безопасность"], ["data", "Данные"]];
    host.innerHTML = `<div class="ep-admin-card"><div class="ep-admin-uhead"><div><h2>${esc(u.email || u.uid)}</h2><p class="ep-admin-muted">${esc(u.displayName || "")} · UID ${esc(u.uid)}</p></div><div class="ep-admin-badges"><span class="ep-st ep-st-${esc(st)}">${esc(st)}</span><span class="ep-badge">${esc(u.role)}</span></div></div>
      <div class="ep-admin-subtabs">${tabs.map((t) => `<button data-utab="${t[0]}" class="${A.userTab === t[0] ? "on" : ""}">${t[1]}</button>`).join("")}</div><div id="ep-utab"></div><p id="ep-act-status" class="ep-admin-muted"></p></div>`;
    renderUserTab();
  }
  function renderUserTab() {
    const box = $("#ep-utab"); if (!box) return; const u = user(); if (!u) return;
    const sel = (id, vals, cur) => `<select id="${id}">${vals.map((v) => `<option value="${v[0]}" ${String(cur) === v[0] ? "selected" : ""}>${esc(v[1])}</option>`).join("")}</select>`;
    if (A.userTab === "status") box.innerHTML = `<div class="ep-admin-actions">${isApproved(u) ? "" : `<button id="ep-approve" class="ep-ok">✓ Одобрить</button>`}${isBlocked(u) ? `<button id="ep-unblock" class="ep-ok">Разблокировать</button>` : `<button id="ep-block" class="ep-danger">Заблокировать</button>`}${u.role === "admin" ? `<button id="ep-demote" class="ep-ghost">Снять админа</button>` : `<button id="ep-promote" class="ep-ghost">Сделать админом</button>`}</div>`;
    else if (A.userTab === "sub") { const s = u.subscription || {}; box.innerHTML = `<p class="ep-admin-muted">Сейчас: <b>${esc(s.planName || s.planId || "нет")}</b> · ${esc(s.status || "—")}${s.expiresAt ? " · до " + esc(dstr(s.expiresAt)) : ""}</p><div class="ep-admin-row">${sel("ep-plan", [["basic", "Базовый"], ["pro_ai", "С ИИ (pro_ai)"]], s.planId || "basic")}<input id="ep-days" type="number" min="1" value="30" title="дней"><label class="ep-admin-chk"><input id="ep-trial" type="checkbox"> пробный</label></div><div class="ep-admin-row"><input id="ep-amount" type="number" min="0" step="1" value="0" title="сумма ₽"><span class="ep-admin-muted">₽ (лог/чек)</span></div><div class="ep-admin-actions"><button id="ep-grant" class="ep-ok">Выдать / продлить</button><button id="ep-cancel-sub" class="ep-danger">Отменить</button></div>`; }
    else if (A.userTab === "ai") { const ai = u.aiAccount || {}; box.innerHTML = `<p class="ep-admin-muted">Баланс: <b>${esc(num(ai.balanceRub).toFixed(2))} ₽</b> · режим: ${esc(ai.accessMode || "—")}</p><div class="ep-admin-row"><input id="ep-ai-balance" type="number" min="0" step="0.01" value="${esc(num(ai.balanceRub))}"><button id="ep-ai-set" class="ep-ok">Установить</button></div><div class="ep-admin-row"><input id="ep-ai-topup" type="number" min="0" step="0.01" value="100"><button id="ep-ai-add" class="ep-ghost">Пополнить</button></div><div class="ep-admin-row">${sel("ep-ai-mode", [["disabled", "выкл"], ["admin_api", "общий ключ (контроль токенов)"], ["own_api", "свой ключ"]], ai.accessMode || "disabled")}<button id="ep-ai-mode-save" class="ep-ghost">Сохранить режим</button></div>`; }
    else if (A.userTab === "sec") { const p = u.securityPolicy || {}; box.innerHTML = `<label class="ep-admin-chk"><input id="ep-p-login" type="checkbox" ${p.allowLogin !== false ? "checked" : ""}> вход разрешён</label><label class="ep-admin-chk"><input id="ep-p-read" type="checkbox" ${p.allowReadData !== false ? "checked" : ""}> чтение данных</label><label class="ep-admin-chk"><input id="ep-p-ai" type="checkbox" ${p.allowAi === true ? "checked" : ""}> ИИ разрешён</label><label class="ep-admin-chk"><input id="ep-p-cache" type="checkbox" ${p.allowLocalCache === true ? "checked" : ""}> локальный кэш</label><div class="ep-admin-actions"><button id="ep-p-save" class="ep-ghost">Сохранить политику</button></div>`; }
    else if (A.userTab === "data") { box.innerHTML = `<div class="ep-admin-sections"><button data-sec="db">🗂️ БД мастера</button><button data-sec="sub">📄 Подписка</button><button data-sec="ai">🤖 ИИ-счёт</button><button data-sec="drafts">📝 Черновики</button><button data-sec="estimates">🧾 Сметы</button><button data-sec="usage">📊 Расход ИИ</button><button data-sec="logs">📜 Логи</button></div><div id="ep-sec" class="ep-admin-secbox"><div class="ep-admin-empty">Выберите раздел.</div></div>`; if (A.section) openSection(A.section); }
  }

  // ====== БД СЕРВЕРА (вид как у мастера + ручное добавление) ======
  async function renderServerDb() {
    const host = $("#ep-admin-body"); if (!host) return;
    host.innerHTML = `<div class="ep-admin-card"><h3>База сервера (общий каталог)</h3><p class="ep-admin-muted">Хранится в <code>server_db/main</code>, мастера тянут в кэш. Добавлять можно из БД мастера (➕) или вручную ниже.</p>
      <details class="ep-adb-manual"><summary>+ добавить вручную</summary><div class="ep-admin-row"><select id="ep-srv-type"><option value="material">материал</option><option value="work">работа</option></select><input id="ep-srv-name" placeholder="название" style="flex:1;min-width:140px"><input id="ep-srv-cat" placeholder="категория" style="width:130px"><input id="ep-srv-unit" placeholder="ед." style="width:80px"><input id="ep-srv-price" type="number" step="0.01" placeholder="цена" style="width:100px"><button id="ep-srv-add" class="ep-ok">Добавить</button></div></details>
      <div id="ep-srv-list"><div class="ep-admin-empty">Загрузка…</div></div></div>`;
    if (!(await ensureSrv())) { $("#ep-srv-list").innerHTML = "<div class='ep-admin-empty'>Нет доступа к server_db.</div>"; return; }
    $("#ep-srv-list").innerHTML = renderTree(A.srv, "server");
  }
  async function srvAddManual() {
    const n = (($("#ep-srv-name") || {}).value || "").trim(); if (!n) { status("Введите название."); return; }
    if (!(await ensureSrv())) return;
    A.srv.push({ id: uid4(), type: ($("#ep-srv-type") || {}).value || "material", name: n, category: (($("#ep-srv-cat") || {}).value || "").trim(), subcategory: "", unit: (($("#ep-srv-unit") || {}).value || "").trim(), price: num(($("#ep-srv-price") || {}).value) });
    ["ep-srv-name", "ep-srv-cat", "ep-srv-unit", "ep-srv-price"].forEach((id) => { const e = $("#" + id); if (e) e.value = ""; });
    if (await saveSrv("Добавлено ✓")) { const el = $("#ep-srv-list"); if (el) el.innerHTML = renderTree(A.srv, "server"); }
  }
  function srvEdit(id) {
    const it = (A.srv || []).find((x) => String(x.id) === String(id)); if (!it) return;
    const name = prompt("Название:", it.name); if (name === null) return; it.name = name.trim() || it.name;
    const cat = prompt("Категория:", it.category || ""); if (cat !== null) it.category = cat.trim();
    const unit = prompt("Единица:", it.unit || ""); if (unit !== null) it.unit = unit.trim();
    const price = prompt("Цена (пусто = без):", it.price || ""); if (price !== null) it.price = num(price);
    saveSrv("Изменено ✓").then(() => { const el = $("#ep-srv-list"); if (el) el.innerHTML = renderTree(A.srv, "server"); });
  }
  function srvDel(id) { A.srv = (A.srv || []).filter((x) => String(x.id) !== String(id)); saveSrv("Удалено ✓").then(() => { const el = $("#ep-srv-list"); if (el) el.innerHTML = renderTree(A.srv, "server"); }); }

  // ====== ЗАЯВКИ ======
  async function renderRequests() {
    const host = $("#ep-admin-body"); if (!host) return;
    host.innerHTML = `<div class="ep-admin-card"><h3>Заявки на пополнение / подписку</h3><div id="ep-req-ai"><div class="ep-admin-empty">Загрузка…</div></div><div id="ep-req-sub"></div></div>`;
    const em = {}; A.users.forEach((u) => em[u.uid] = u.email || u.uid);
    const ra = await readColl("ai_payment_requests", "status", "pending"); const rs = await readColl("subscription_payment_requests", "status", "pending");
    const eA = $("#ep-req-ai"), eS = $("#ep-req-sub");
    if (eA) eA.innerHTML = ra.error ? `<div class='ep-admin-empty'>ИИ-заявки: нет доступа.</div>` : (ra.docs.length ? `<h4>Пополнение ИИ (${ra.docs.length})</h4>` + ra.docs.map((d) => `<div class="ep-admin-prow"><div><b>${esc(em[d.data.uid] || d.data.uid)}</b><span>${esc(num(d.data.amountRub).toFixed(2))} ₽ · ${esc(d.data.comment || "")}</span></div><div class="ep-admin-prow-act"><button data-req-topup="${esc(d.data.uid)}" data-amt="${esc(num(d.data.amountRub))}" class="ep-ok">Пополнить</button><button data-open="${esc(d.data.uid)}" class="ep-ghost">Открыть</button></div></div>`).join("") : "<div class='ep-admin-empty'>Заявок на ИИ нет.</div>");
    if (eS) eS.innerHTML = rs.error ? `<div class='ep-admin-empty'>Заявки на подписку: нет доступа.</div>` : (rs.docs.length ? `<h4>Подписка (${rs.docs.length})</h4>` + rs.docs.map((d) => `<div class="ep-admin-prow"><div><b>${esc(em[d.data.uid] || d.data.uid)}</b><span>${esc(d.data.planId || "")} · ${esc(d.data.periodDays || 30)} дн · ${esc(d.data.comment || "")}</span></div><div class="ep-admin-prow-act"><button data-open="${esc(d.data.uid)}" class="ep-ok">Открыть и выдать</button></div></div>`).join("") : "<div class='ep-admin-empty'>Заявок на подписку нет.</div>");
  }

  // ====== КОНТАКТЫ ======
  async function renderContacts() {
    const host = $("#ep-admin-body"); if (!host) return;
    if (!A.contact) { const r = await readDoc("server_db", META_DOC); A.contact = (r.data && r.data.contact) ? r.data.contact : {}; }
    const c = A.contact || {};
    host.innerHTML = `<div class="ep-admin-card"><h3>Контакты для мастеров</h3><p class="ep-admin-muted">Мастера увидят это, чтобы связаться (оплата/вопросы). Хранится в <code>server_db/__meta__</code>.</p>
      <div class="ep-admin-row"><label class="ep-admin-fl">Telegram</label><input id="ep-c-tg" value="${esc(c.telegram || "")}" placeholder="@username" style="flex:1"></div>
      <div class="ep-admin-row"><label class="ep-admin-fl">Телефон</label><input id="ep-c-phone" value="${esc(c.phone || "")}" placeholder="+7…" style="flex:1"></div>
      <div class="ep-admin-row"><label class="ep-admin-fl">E-mail</label><input id="ep-c-email" value="${esc(c.email || "")}" placeholder="mail@…" style="flex:1"></div>
      <div class="ep-admin-row"><label class="ep-admin-fl">Реквизиты/QR</label><input id="ep-c-pay" value="${esc(c.payment || "")}" placeholder="карта / ссылка" style="flex:1"></div>
      <div class="ep-admin-row"><label class="ep-admin-fl">Сообщение</label><input id="ep-c-note" value="${esc(c.note || "")}" placeholder="как связаться / часы" style="flex:1"></div>
      <div class="ep-admin-actions"><button id="ep-c-save" class="ep-admin-primary">💾 Сохранить контакты</button></div></div>`;
  }
  async function saveContacts() {
    const d = db(); if (!d) return; status("Сохранение…");
    const c = { telegram: ($("#ep-c-tg") || {}).value || "", phone: ($("#ep-c-phone") || {}).value || "", email: ($("#ep-c-email") || {}).value || "", payment: ($("#ep-c-pay") || {}).value || "", note: ($("#ep-c-note") || {}).value || "" };
    try { await d.collection("server_db").doc(META_DOC).set({ contact: c, updatedAt: FV() }, { merge: true }); A.contact = c; status("Контакты сохранены ✓"); } catch (e) { const x = e && (e.code || e.message); status(String(x).indexOf("permission-denied") >= 0 ? "Нет прав на запись server_db." : "Ошибка: " + x); }
  }

  // ====== операции пользователя ======
  function actStatus(m) { const e = $("#ep-act-status"); if (e) e.textContent = m; status(m); }
  async function writeUserDoc(uid, patch, ok) { const d = db(); if (!d) return; actStatus("Сохранение…"); try { patch.updatedAt = FV(); await d.collection("users").doc(uid).set(patch, { merge: true }); const u = user(); if (u) Object.assign(u, patch); actStatus(ok || "Готово ✓"); if (A.tab === "users") renderUsersTab(); } catch (e) { const c = e && (e.code || e.message); actStatus(String(c).indexOf("permission-denied") >= 0 ? "Нет прав на запись users." : "Ошибка: " + c); } }
  async function callOp(name, payload, ok) { actStatus("Выполняю…"); try { await call(name, payload); actStatus(ok || "Готово ✓"); await loadUsers(); renderDetail(); } catch (e) { const c = e && (e.code || e.message); actStatus("Ошибка (" + name + "): " + (String(c).indexOf("permission-denied") >= 0 ? "нет прав админа" : c)); } }

  // ====== разделы данных пользователя ======
  function secBox(h) { const el = $("#ep-sec"); if (el) el.innerHTML = h; }
  function errB(coll, r) { return String(r.error).indexOf("permission-denied") >= 0 ? `<div class='ep-admin-empty'>Нет доступа к <code>${esc(coll)}</code>.</div>` : `<div class='ep-admin-empty'>Ошибка <code>${esc(coll)}</code>: ${esc(r.error)}</div>`; }
  async function openSection(name) {
    A.section = name; const uid = A.selectedUid; if (!uid) return;
    document.querySelectorAll(".ep-admin-sections button").forEach((b) => b.classList.toggle("on", b.getAttribute("data-sec") === name));
    secBox("<div class='ep-admin-empty'>Загрузка…</div>");
    if (name === "db") { await ensureSrv(); const r = await readDoc("user_db", uid); if (r.error) return secBox(errB("user_db/{uid}", r)); A.masterDb = (r.data && Array.isArray(r.data.items)) ? r.data.items : []; if (!A.masterDb.length) return secBox("<div class='ep-admin-empty'>Личная БД мастера пуста.</div>"); secBox(`<div class="ep-adb-hint">➕ — добавить позицию в БД сервера</div>` + renderTree(A.masterDb, "master")); }
    else if (name === "sub" || name === "ai") { const coll = name === "sub" ? "user_subscriptions" : "ai_accounts"; const r = await readDoc(coll, uid); if (r.error) return secBox(errB(coll + "/{uid}", r)); secBox(r.exists ? `<pre class="ep-admin-pre">${esc(jn(r.data))}</pre>` : "<div class='ep-admin-empty'>Нет данных.</div>"); }
    else if (name === "drafts" || name === "estimates") { const r = await readDoc(name, uid); if (r.error) return secBox(errB(name + "/{uid}", r)); if (!r.exists || !r.data || !Object.keys(r.data).length) return secBox(`<div class='ep-admin-empty'>В <code>${esc(name)}/{uid}</code> нет данных.</div>`); secBox(`<pre class="ep-admin-pre">${esc(jn(r.data))}</pre>`); }
    else if (name === "usage") { const r = await readColl("ai_usage", "uid", uid); if (r.error) return secBox(errB("ai_usage", r)); if (!r.docs || !r.docs.length) return secBox("<div class='ep-admin-empty'>Расхода ИИ нет.</div>"); secBox(r.docs.map((d) => `<div class="ep-admin-logrow">${esc(dstr(d.data.createdAt))} · ${esc(d.data.feature || d.data.model || "")} · ${esc(num(d.data.amountRub).toFixed(2))}₽ · ${esc(d.data.totalTokens || 0)}т</div>`).join("")); }
    else if (name === "logs") { const r = await readColl("admin_logs", "uid", uid); if (r.error) return secBox(errB("admin_logs", r)); if (!r.docs || !r.docs.length) return secBox("<div class='ep-admin-empty'>Логов нет.</div>"); secBox(r.docs.map((d) => `<div class="ep-admin-logrow">${esc(dstr(d.data.createdAt))} · <b>${esc(d.data.type || "")}</b> ${esc(d.data.planId || d.data.accessMode || d.data.feature || "")}</div>`).join("")); }
  }

  // ====== модалка ======
  function openPicker() { const m = $("#ep-admin-modal"); if (!m) return; m.classList.add("open"); renderPickerList(); const s = $("#ep-admin-modal-search"); if (s) s.value = ""; }
  function closePicker() { const m = $("#ep-admin-modal"); if (m) m.classList.remove("open"); }
  function renderPickerList() { const el = $("#ep-admin-modal-list"); if (!el) return; const q = ($("#ep-admin-modal-search") && $("#ep-admin-modal-search").value || "").trim().toLowerCase(); let list = A.users; if (A.onlyPending) list = list.filter(isPending); if (q) list = list.filter((u) => [u.uid, u.email, u.displayName, u.role].some((x) => String(x || "").toLowerCase().indexOf(q) >= 0)); el.innerHTML = list.length ? list.map((u) => { const st = uStatus(u), sub = u.subscription; return `<button type="button" class="ep-admin-pick" data-open="${esc(u.uid)}"><b>${esc(u.email || "(без email)")}</b><span>${esc(u.displayName || "—")} · ${esc(u.role)} · <i class="ep-st ep-st-${esc(st)}">${esc(st)}</i>${sub && subActive(sub) ? " · " + esc(sub.planId || "sub") : ""}</span></button>`; }).join("") : "<div class='ep-admin-empty'>Никого не найдено.</div>"; }

  // ====== делегация ======
  function bind(root) {
    if (root.__epAdmin4) return; root.__epAdmin4 = true;
    root.addEventListener("click", (ev) => {
      const t = ev.target;
      const nav = t.closest("[data-tab]"); if (nav) return switchTab(nav.getAttribute("data-tab"));
      const fold = t.closest("[data-fold]"); if (fold) { const k = fold.getAttribute("data-fold"); if (A.exp.has(k)) A.exp.delete(k); else A.exp.add(k); if (A.tab === "serverdb") { const el = $("#ep-srv-list"); if (el) el.innerHTML = renderTree(A.srv, "server"); } else if (A.section === "db") openSection("db"); return; }
      const addS = t.closest("[data-add-srv]"); if (addS) return addToServer(addS.getAttribute("data-add-srv"));
      if (t.closest("#ep-admin-open-picker")) return openPicker();
      if (t.closest("#ep-admin-modal-close") || t.closest("#ep-admin-modal-overlay")) return closePicker();
      if (t.closest("#ep-admin-refresh")) return loadUsers();
      const uexp = t.closest("[data-u-exp]"); if (uexp) { const id = uexp.getAttribute("data-u-exp"); if (A.uexp.has(id)) A.uexp.delete(id); else { A.uexp.add(id); A.selectedUid = id; } renderUsersTab(); return; }
      const uquick = t.closest("[data-u-tog][data-quick]"); if (uquick) return uToggle(uquick.getAttribute("data-uid"), uquick.getAttribute("data-u-tog"), true);
      const ubs = t.closest("[data-u-balset]"); if (ubs) { const id = ubs.getAttribute("data-u-balset"); const amt = num(($('[data-u-bal="' + id + '"]') || {}).value); const cur = ($('[data-u-cur="' + id + '"]') || {}).value || "USD"; A.selectedUid = id; return writeUserDoc(id, { aiBalance: amt, aiBalanceCurrency: cur }, "Баланс задан ✓"); }
      const asp = t.closest("[data-aisrv-prov]"); if (asp) { A.aiProv = asp.getAttribute("data-aisrv-prov"); return renderAiServer(); }
      if (t.closest("#ep-admin-toggle-pending")) { A.onlyPending = !A.onlyPending; renderPickerList(); const b = $("#ep-admin-toggle-pending"); if (b) b.classList.toggle("on", A.onlyPending); return; }
      const op = t.closest("[data-open]"); if (op) { if (A.tab !== "users") switchTab("users"); return selectUser(op.getAttribute("data-open")); }
      const ap = t.closest("[data-approve]"); if (ap) { A.selectedUid = ap.getAttribute("data-approve"); return writeUserDoc(A.selectedUid, { status: "approved", isApproved: true, blocked: false }, "Мастер одобрен ✓"); }
      const utab = t.closest("[data-utab]"); if (utab) { A.userTab = utab.getAttribute("data-utab"); A.section = null; return renderDetail(); }
      const sec = t.closest("[data-sec]"); if (sec) return openSection(sec.getAttribute("data-sec"));
      if (t.closest("#ep-srv-add")) return srvAddManual();
      const se = t.closest("[data-srv-edit]"); if (se) return srvEdit(se.getAttribute("data-srv-edit"));
      const sd = t.closest("[data-srv-del]"); if (sd) return srvDel(sd.getAttribute("data-srv-del"));
      if (t.closest("#ep-c-save")) return saveContacts();
      const rt = t.closest("[data-req-topup]"); if (rt) { A.selectedUid = rt.getAttribute("data-req-topup"); return callOp("topUpAiBalance", { uid: A.selectedUid, amountRub: num(rt.getAttribute("data-amt")), paymentMethod: "admin_request" }, "Пополнено по заявке ✓"); }
      const uid = A.selectedUid;
      if (t.closest("#ep-approve")) return writeUserDoc(uid, { status: "approved", isApproved: true, blocked: false }, "Одобрен ✓");
      if (t.closest("#ep-block")) return writeUserDoc(uid, { status: "blocked_review", blocked: true }, "Заблокирован");
      if (t.closest("#ep-unblock")) return writeUserDoc(uid, { status: "approved", blocked: false, isApproved: true }, "Разблокирован");
      if (t.closest("#ep-promote")) return writeUserDoc(uid, { role: "admin" }, "Назначен админом");
      if (t.closest("#ep-demote")) return writeUserDoc(uid, { role: "master" }, "Роль: мастер");
      if (t.closest("#ep-grant")) return callOp("grantSubscription", { uid, planId: ($("#ep-plan") || {}).value || "basic", periodDays: num(($("#ep-days") || {}).value) || 30, trial: !!($("#ep-trial") || {}).checked, amountRub: num(($("#ep-amount") || {}).value) }, "Подписка выдана ✓");
      if (t.closest("#ep-cancel-sub")) return callOp("cancelSubscription", { uid, reason: "admin_panel" }, "Подписка отменена");
      if (t.closest("#ep-ai-set")) return callOp("setAiBalanceExact", { uid, balanceRub: num(($("#ep-ai-balance") || {}).value) }, "Баланс установлен ✓");
      if (t.closest("#ep-ai-add")) return callOp("topUpAiBalance", { uid, amountRub: num(($("#ep-ai-topup") || {}).value), paymentMethod: "admin_panel" }, "Баланс пополнен ✓");
      if (t.closest("#ep-ai-mode-save")) return callOp("setAiAccessMode", { uid, accessMode: ($("#ep-ai-mode") || {}).value || "disabled" }, "Режим ИИ сохранён ✓");
      if (t.closest("#ep-p-save")) return callOp("setUserSecurityPolicy", { uid, allowLogin: !!($("#ep-p-login") || {}).checked, allowReadData: !!($("#ep-p-read") || {}).checked, allowAi: !!($("#ep-p-ai") || {}).checked, allowLocalCache: !!($("#ep-p-cache") || {}).checked }, "Политика сохранена ✓");
    });
    root.addEventListener("change", (ev) => { const u = ev.target.closest && ev.target.closest("[data-u-tog]"); if (u && u.type === "checkbox") uToggle(u.getAttribute("data-uid"), u.getAttribute("data-u-tog"), !!u.checked); });
    root.addEventListener("input", (ev) => {
      if (ev.target.id === "ep-admin-modal-search") return renderPickerList();
      if (ev.target.getAttribute && ev.target.getAttribute("data-aisrv")) { const f = ev.target.getAttribute("data-aisrv"); const p = A.aiProv || "openai"; const o = aiSrvCfg(p); o.server[p][f] = (f === "key" || f === "model") ? ev.target.value : num(ev.target.value); aiSaveObj(o); return; }
      if (ev.target.id === "ep-uq") { A.uq = ev.target.value; const el = $(".ep-ulist"); if (el) { const q = A.uq.toLowerCase(); let list = A.users.slice(); if (q) list = list.filter((x) => [x.email, x.displayName, x.uid].some((v) => String(v || "").toLowerCase().indexOf(q) >= 0)); el.innerHTML = list.length ? list.map(uCard).join("") : "<div class='ep-admin-empty'>Никого не найдено.</div>"; } }
    });
  }
  function mount() { const root = $("#ep-admin-root"); if (!root) return; if (!isAdmin()) { root.innerHTML = "<div class='ep-admin-hero'><h1>Админка</h1><p>Доступ только для администратора.</p></div>"; return; } bind(root); renderNav(); if (!db()) { status("Firebase недоступен."); return; } A.srv = null; A.contact = null; loadUsers().then(() => { if (A.tab === "users") renderUsersTab(); }); }
  window.addEventListener("ep:route-loaded", (e) => { if (e && e.detail && e.detail.route === "admin") mount(); });
  EP.Admin = { mount, reload: loadUsers, isAdmin };
})();
