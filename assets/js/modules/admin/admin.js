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
  const A = { tab: "users", users: [], selectedUid: null, section: null, srv: null, srvKeys: new Set(), masterDb: [], exp: new Set(), contact: null, uq: "" };
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

  // Статусы: сначала V29 (accessStatus), потом легаси-поля для старых документов
  function uStatus(u) { return u.accessStatus || u.status || (u.isApproved ? "approved" : "pending"); }
  function isPending(u) { const s = uStatus(u); return s === "pending" || s === "pending_review" || (!u.isApproved && ["approved", "blocked", "blocked_review", "deleted"].indexOf(s) < 0); }
  function isBlocked(u) { const s = uStatus(u); return u.blocked === true || ["blocked", "blocked_review", "deleted"].indexOf(s) >= 0; }
  function isApproved(u) { return uStatus(u) === "approved" || u.isApproved === true; }
  function subActive(s) {
    if (!s) return false;
    const notExpired = !s.expiresAt || (tsDate(s.expiresAt) && tsDate(s.expiresAt).getTime() > Date.now());
    if (typeof s.active === "boolean") return s.active && s.plan !== "none" && notExpired; // V29
    return (s.status === "active" || s.status === "trial") && notExpired; // легаси
  }

  // ====== загрузка ======
  async function loadUsers() {
    status("Загрузка пользователей…"); const d = db(); if (!d) { status("Firebase недоступен."); return; }
    try {
      const us = await d.collection("users").limit(800).get();
      A.users = us.docs.map((doc) => { const dt = doc.data() || {}; return { uid: doc.id, email: dt.email || "", displayName: dt.displayName || dt.name || "", role: dt.role || "master", accessStatus: dt.accessStatus, status: dt.status, isApproved: dt.isApproved, isAdmin: dt.isAdmin, blocked: dt.blocked, createdAt: dt.createdAt, adminNote: dt.adminNote || "", subscription: dt.subscription || null, ai: dt.ai || null }; });
      status("Пользователей: " + A.users.length); if (A.tab === "users") renderUsersTab();
    } catch (e) { const c = e && (e.code || e.message); status(String(c).indexOf("permission-denied") >= 0 ? "Нет прав (нужна роль admin + accessStatus approved)." : "Ошибка: " + c); }
  }
  async function readDoc(coll, id) { const d = db(); if (!d) return { error: "no-db" }; try { const s = await d.collection(coll).doc(id).get(); return { exists: s.exists, data: s.exists ? (s.data() || {}) : null }; } catch (e) { return { error: (e && (e.code || e.message)) || "error" }; } }
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
    if (mode === "master") { const inS = A.srvKeys.has(dbKey(it)); act = inS ? `<span class="ep-adb-in">✓ в сервере</span>` : `<button class="ep-mini ep-mini-ok" data-add-srv="${esc(it.id)}" title="Добавить в БД сервера" aria-label="Добавить «${esc(it.name)}» в БД сервера">➕</button>`; }
    else if (mode === "server") { act = `<button class="ep-mini" data-srv-edit="${esc(it.id)}" title="Изменить" aria-label="Изменить «${esc(it.name)}»">✎</button><button class="ep-mini ep-mini-d" data-srv-del="${esc(it.id)}" title="Удалить" aria-label="Удалить «${esc(it.name)}»">✕</button>`; }
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
    if (ok && A.view === "user" && A.section === "db") loadUserData("db");
  }

  // ====== навигация ======
  function renderNav() { const tabs = [["users", "👥 Пользователи"], ["serverdb", "🗄️ БД сервера"], ["aiserver", "🤖 ИИ-сервер"], ["layouts", "🏠 Контуры квартир"], ["backups", "💾 Бекапы"], ["contacts", "⚙️ Контакты"]]; const nav = $("#ep-admin-nav"); if (nav) nav.innerHTML = tabs.map((t) => `<button data-tab="${t[0]}" class="${A.tab === t[0] ? "on" : ""}">${t[1]}</button>`).join(""); }
  function switchTab(tab) { A.tab = tab; renderNav(); if (tab === "users") { renderUsersTab(); if (!A.users.length) loadUsers(); } else if (tab === "serverdb") renderServerDb(); else if (tab === "aiserver") renderAiServer(); else if (tab === "layouts") renderLayouts(); else if (tab === "backups") renderBackups(); else if (tab === "contacts") renderContacts(); }

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

  // ====== ПОЛЬЗОВАТЕЛИ (полноэкранный вид: список → карточка) ======
  function uBal(u) { const v = num(u.ai && u.ai.balanceRub); return (Math.round(v * 100) / 100) + " ₽"; }
  function isTrialSub(s) { return subActive(s) && (s.status === "trial" || /trial/i.test(s.planId || s.plan || "")); }
  function user() { return A.users.find((x) => x.uid === A.selectedUid); }
  function openUser(uid) { A.selectedUid = uid; A.view = "user"; A.tab = "users"; renderNav(); renderUsersTab(); const h = $("#ep-admin-body"); if (h && h.scrollIntoView) try { h.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) {} }
  function downloadJSON(name, obj) {
    try { const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(() => URL.revokeObjectURL(url), 1500); return true; }
    catch (e) { try { status("Не удалось скачать: " + (e && e.message)); } catch (x) {} return false; }
  }
  function aiKeyBalanceStr() { try { const o = JSON.parse(localStorage.getItem("ep_ai_v29") || "null") || {}; const p = o.provider || "openai"; const pb = (o.personal && o.personal[p]) ? num(o.personal[p].balance) : 0; const sb = (o.server && o.server[p]) ? num(o.server[p].balance) : 0; return "личный $" + pb + " / сервер $" + sb; } catch (e) { return "—"; } }

  const UFILTERS = [["all", "Все"], ["pending", "Заявки"], ["active", "Активные"], ["blocked", "Заблок."]];
  function matchFilter(u) { if (A.ufilter === "pending") return isPending(u); if (A.ufilter === "active") return subActive(u.subscription); if (A.ufilter === "blocked") return isBlocked(u); return true; }
  function uRow(u) {
    const st = uStatus(u);
    return `<button type="button" class="ep-urow ${isBlocked(u) ? "is-blk" : ""}" data-u-open="${esc(u.uid)}">
      <span class="ep-urow-main"><b>${esc(u.email || u.uid)}</b><small>${esc(u.displayName || "—")} · рег. ${esc(dstr(u.createdAt))}</small></span>
      <span class="ep-urow-meta"><span class="ep-urow-bal">${esc(uBal(u))}</span><span class="ep-st ep-st-${esc(st)}">${esc(st)}</span></span>
      <span class="ep-urow-go">›</span></button>`;
  }
  function renderUsersTab() {
    const host = $("#ep-admin-body"); if (!host) return;
    if (A.view === "user" && A.selectedUid) return renderUserPage();
    A.ufilter = A.ufilter || "all";
    const pend = A.users.filter(isPending);
    const q = (A.uq || "").toLowerCase();
    let list = A.users.filter(matchFilter);
    if (q) list = list.filter((u) => [u.email, u.displayName, u.uid].some((x) => String(x || "").toLowerCase().indexOf(q) >= 0));
    host.innerHTML = `<div class="ep-admin-dashboard">
        <div class="ep-admin-card ep-stat"><span>Всего</span><b>${A.users.length}</b></div>
        <div class="ep-admin-card ep-stat"><span>Заявки</span><b>${pend.length}</b></div>
        <div class="ep-admin-card ep-stat"><span>Подписка</span><b>${A.users.filter((u) => subActive(u.subscription)).length}</b></div>
        <div class="ep-admin-card ep-stat"><span>Заблок.</span><b>${A.users.filter(isBlocked).length}</b></div></div>
      ${pend.length ? `<div class="ep-admin-card ep-pend"><h3>🔔 Новые заявки (${pend.length})</h3>${pend.map((u) => `<div class="ep-admin-prow"><div><b>${esc(u.email || u.uid)}</b><span>${esc(u.displayName || "")} · ${esc(dstr(u.createdAt))}</span></div><div class="ep-admin-prow-act"><button data-u-open="${esc(u.uid)}" class="ep-btn ep-btn-sm">Открыть</button></div></div>`).join("")}</div>` : ""}
      <div class="ep-ufilters">${UFILTERS.map((f) => `<button type="button" class="ep-facet ${A.ufilter === f[0] ? "on" : ""}" data-ufilter="${f[0]}">${f[1]}</button>`).join("")}</div>
      <div class="ep-admin-toolbar"><input id="ep-uq" placeholder="🔍 поиск" value="${esc(A.uq || "")}"><button id="ep-admin-refresh" class="ep-btn ep-btn-sm">Обновить</button></div>
      <div class="ep-ulist">${list.length ? list.map(uRow).join("") : "<div class='ep-admin-empty'>Никого не найдено.</div>"}</div>`;
  }
  function renderUserPage() {
    const host = $("#ep-admin-body"); if (!host) return; const u = user(); if (!u) { A.view = "list"; return renderUsersTab(); }
    const st = uStatus(u); const sub = u.subscription || {}; const ai = u.ai || {};
    const blocked = isBlocked(u); const access = isApproved(u) && !blocked;
    const planId = sub.planId || sub.plan || "basic";
    const opt = (v, l, cur) => `<option value="${v}" ${cur === v ? "selected" : ""}>${l}</option>`;
    host.innerHTML = `<div class="ep-uback"><button type="button" class="ep-btn ep-btn-sm" data-u-back>‹ К списку</button></div>
      <div class="ep-uhead"><h2>${esc(u.email || u.uid)}</h2><p class="ep-admin-muted">${esc(u.displayName || "—")} · рег. ${esc(dstr(u.createdAt))}</p><div class="ep-uhead-badges"><span class="ep-st ep-st-${esc(st)}">${esc(st)}</span><span class="ep-badge">${esc(u.role || "master")}</span></div></div>

      <div class="ep-usec"><h3>🔐 Доступ</h3><div class="ep-usec-btns">
        ${access ? `<button type="button" class="ep-btn ep-btn-danger" data-u-act="block">Заблокировать</button>` : `<button type="button" class="ep-btn ep-btn-ok" data-u-act="approve">Открыть доступ</button>`}
        ${blocked ? `<button type="button" class="ep-btn ep-btn-ok" data-u-act="unblock">Разблокировать</button>` : ""}</div></div>

      <div class="ep-usec"><h3>💳 Подписка</h3>
        <p class="ep-admin-muted">${subActive(sub) ? "Активна: <b>" + esc(isTrialSub(sub) ? "Тест" : planId) + "</b>" + (sub.expiresAt ? " · до " + esc(dstr(sub.expiresAt)) : "") : "Подписки нет."}</p>
        <div class="ep-uform">
          <label class="ep-ufield"><span>План</span><select id="ep-uplan">${opt("basic", "Базовый", planId)}${opt("ai", "С ИИ", planId)}</select></label>
          <label class="ep-uchk"><input type="checkbox" id="ep-utrial"> пробный (тест)</label>
        </div>
        <div class="ep-udur"><span class="ep-udur-lbl">Срок:</span>${[30, 60, 90, 180, 365].map((d) => `<button type="button" class="ep-chip" data-u-dur="${d}">${d} дн</button>`).join("")}</div>
        <div class="ep-uform">
          <label class="ep-ufield"><span>или дней</span><input type="number" min="1" id="ep-udays" placeholder="напр. 45"></label>
          <label class="ep-ufield"><span>или до даты</span><input type="date" id="ep-udate"></label>
        </div>
        <div class="ep-usec-btns"><button type="button" class="ep-btn ep-btn-ok" data-u-act="grant">Выдать / продлить</button><button type="button" class="ep-btn ep-btn-danger" data-u-act="cancelsub">Отменить</button></div>
      </div>

      <div class="ep-usec"><h3>🤖 ИИ / API</h3>
        <label class="ep-ufield"><span>Режим</span><select id="ep-uaimode">${opt("off", "выкл", ai.mode || "off")}${opt("client", "свой ключ", ai.mode || "off")}${opt("server", "общий ключ (сервер)", ai.mode || "off")}</select></label>
        <div class="ep-usec-btns"><button type="button" class="ep-btn" data-u-act="aimode">Сохранить режим</button></div>
        <p class="ep-admin-muted">Сейчас: ${esc(ai.mode || "выкл")}. Баланс твоих ключей (из ИИ-ассистента): <b>${esc(aiKeyBalanceStr())}</b>.</p>
      </div>

      <div class="ep-usec"><h3>💰 Баланс мастера (₽)</h3>
        <div class="ep-ubal"><input type="number" step="0.01" min="0" id="ep-ubalamt" value="${ai.balanceRub != null ? esc(ai.balanceRub) : ""}" placeholder="0"><button type="button" class="ep-btn ep-btn-ok" data-u-act="setbal">Задать</button><input type="number" step="0.01" min="0" id="ep-utopup" placeholder="+ сумма"><button type="button" class="ep-btn" data-u-act="topup">Пополнить</button></div>
        <p class="ep-admin-muted">Баланс, выделенный мастеру на ИИ (заработает с ИИ-прокси). Реальный баланс твоих ключей — в ИИ-ассистенте.</p></div>

      <div class="ep-usec"><h3>🗂️ Данные</h3>
        <div class="ep-usec-btns"><button type="button" class="ep-btn" data-u-data="db">🗂️ База мастера</button><button type="button" class="ep-btn" data-u-data="docs">🧾 Сметы / документы</button></div>
        <div id="ep-udata" class="ep-udata"></div>
        <div class="ep-usec-btns"><button type="button" class="ep-btn ep-btn-ok" data-u-act="backupuser">⬇️ Бекап этого пользователя</button></div></div>

      <p id="ep-act-status" class="ep-act-st"></p>`;
  }
  function grantDays() {
    const dt = ($("#ep-udate") || {}).value; if (dt) { const ms = new Date(dt + "T23:59:59").getTime() - Date.now(); const d = Math.ceil(ms / 86400000); if (d > 0) return d; }
    const days = num(($("#ep-udays") || {}).value); if (days > 0) return days;
    return 30;
  }
  async function uAct(act) {
    const u = user(); if (!u) return; const uid = u.uid;
    if (act === "approve") return adminOp(uid, "approve", {}, "Доступ открыт ✓");
    if (act === "block") return adminOp(uid, "block", {}, "Заблокирован");
    if (act === "unblock") return adminOp(uid, "unblock", {}, "Разблокирован");
    if (act === "grant") { const trial = !!($("#ep-utrial") || {}).checked; const plan = trial ? "trial" : (($("#ep-uplan") || {}).value || "basic"); return adminOp(uid, "grantSubscription", { plan, days: grantDays() }, "Подписка выдана ✓"); }
    if (act === "cancelsub") return adminOp(uid, "cancelSubscription", {}, "Подписка отменена");
    if (act === "aimode") { const mode = ($("#ep-uaimode") || {}).value || "off"; return adminOp(uid, "setAiMode", { mode }, "Режим ИИ сохранён ✓"); }
    if (act === "setbal") { const balanceRub = num(($("#ep-ubalamt") || {}).value); return adminOp(uid, "setAiBalance", { balanceRub }, "Баланс задан ✓"); }
    if (act === "topup") { const amountRub = num(($("#ep-utopup") || {}).value); if (!(amountRub > 0)) return actStatus("Введите сумму пополнения."); return adminOp(uid, "topUpAiBalance", { amountRub }, "Баланс пополнен ✓"); }
    if (act === "backupuser") { actStatus("Собираю бекап…"); const dbr = await readDoc("user_db", uid); const er = await readDoc("estimates", uid); const dr = await readDoc("drafts", uid); const dump = { type: "ep-user-backup", uid, email: u.email, exportedAt: new Date().toISOString(), user_db: dbr.data || null, estimates: er.data || null, drafts: dr.data || null }; downloadJSON("ep-backup-" + (u.email || uid).replace(/[^a-z0-9]+/gi, "_") + ".json", dump); actStatus("Бекап скачан ✓"); }
  }
  async function loadUserData(which) {
    const box = $("#ep-udata"); if (!box || !A.selectedUid) return; const uid = A.selectedUid; box.innerHTML = "<div class='ep-admin-empty'>Загрузка…</div>";
    if (which === "db") { await ensureSrv(); const r = await readDoc("user_db", uid); if (r.error) { box.innerHTML = errB("user_db/{uid}", r); return; } A.masterDb = (r.data && Array.isArray(r.data.items)) ? r.data.items : []; A.section = "db"; box.innerHTML = A.masterDb.length ? `<div class="ep-adb-hint">➕ — добавить позицию в БД сервера</div>` + renderTree(A.masterDb, "master") : "<div class='ep-admin-empty'>Личная БД мастера пуста.</div>"; }
    else { const er = await readDoc("estimates", uid); const dr = await readDoc("drafts", uid); if (er.error && dr.error) { box.innerHTML = errB("estimates/{uid}", er); return; } let h = ""; if (er.exists && er.data && Object.keys(er.data).length) h += `<p class="ep-admin-muted">Сметы:</p><pre class="ep-admin-pre">${esc(jn(er.data))}</pre>`; if (dr.exists && dr.data && Object.keys(dr.data).length) h += `<p class="ep-admin-muted">Черновики:</p><pre class="ep-admin-pre">${esc(jn(dr.data))}</pre>`; box.innerHTML = h || "<div class='ep-admin-empty'>Смет и документов нет.</div>"; }
  }

  // ====== БЕКАПЫ ======
  /* 🏠 КОНТУРЫ КВАРТИР — модерация общей базы шаблонов планировок.
     Мастера присылают ТОЛЬКО геометрию (стены и размеры) — см. EP.Plan.Layouts.strip.
     Одобрение КОПИРУЕТ очищенные поля в публичную коллекцию и удаляет заявку: автор
     (by/byName) в публичную коллекцию не переносится вообще, поэтому одобренный контур
     обезличен не «скрытием поля на клиенте», а тем, что этого поля там физически нет. */
  function LAY() { return window.EP && EP.Plan && EP.Plan.Layouts; }
  function layPreview(x) {
    const rooms = (x.rooms || []).slice(0, 40);
    if (!rooms.length) return "";
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    rooms.forEach((r) => (r.points || []).forEach((q) => {
      if (q.x < x0) x0 = q.x; if (q.x > x1) x1 = q.x; if (q.y < y0) y0 = q.y; if (q.y > y1) y1 = q.y;
    }));
    if (!isFinite(x0)) return "";
    const pad = 20;
    return `<svg class="ep-lay-prev" viewBox="${x0 - pad} ${y0 - pad} ${(x1 - x0) + pad * 2} ${(y1 - y0) + pad * 2}" preserveAspectRatio="xMidYMid meet">
      ${rooms.map((r) => `<polygon points="${(r.points || []).map((q) => q.x + "," + q.y).join(" ")}"></polygon>`).join("")}
    </svg>`;
  }
  async function renderLayouts() {
    const host = $("#ep-admin-body"); if (!host) return;
    const L = LAY();
    if (!L) { host.innerHTML = `<div class="ep-admin-card"><h3>🏠 Контуры квартир</h3><p class="ep-admin-muted">Модуль плана не загружен на этой странице.</p></div>`; return; }
    host.innerHTML = `<div class="ep-admin-card"><h3>🏠 Контуры квартир</h3><p class="ep-admin-muted">Загружаю…</p></div>`;
    const [subs, pub] = await Promise.all([L.pending(), L.list(true)]);
    A.laySubs = subs;
    const subCard = (x) => `<div class="ep-lay-item">
        ${layPreview(x)}
        <div class="ep-lay-info"><b>${esc(x.title || "Без названия")}</b>
          <span>${x.areaM2 || 0} м² · комнат ${(x.rooms || []).length}${x.series ? " · " + esc(x.series) : ""}</span>
          <span class="ep-admin-muted">от ${esc(x.byName || "—")} · ${new Date(x.ts || 0).toLocaleDateString("ru-RU")}</span></div>
        <div class="ep-lay-btns">
          <button type="button" class="ep-btn ep-btn-ok" data-lay-ok="${esc(x.id)}">✓ Опубликовать</button>
          <button type="button" class="ep-btn ep-btn-danger" data-lay-no="${esc(x.id)}">✕ Отклонить</button>
        </div>
      </div>`;
    const pubCard = (x) => `<div class="ep-lay-item">
        ${layPreview(x)}
        <div class="ep-lay-info"><b>${esc(x.title || "Без названия")}</b>
          <span>${x.areaM2 || 0} м² · комнат ${(x.rooms || []).length}${x.series ? " · " + esc(x.series) : ""}</span></div>
        <div class="ep-lay-btns"><button type="button" class="ep-btn ep-btn-danger" data-lay-del="${esc(x.id)}">🗑 Убрать</button></div>
      </div>`;
    host.innerHTML = `<div class="ep-admin-card"><h3>🏠 Контуры квартир</h3>
        <p class="ep-admin-muted">Мастера присылают только стены и размеры. При публикации автор НЕ переносится — контур становится обезличенным.</p>
        <h4>На проверке (${subs.length})</h4>
        ${subs.length ? subs.map(subCard).join("") : `<p class="ep-admin-muted">Заявок нет.</p>`}
        <h4>В общей базе (${pub.length})</h4>
        ${pub.length ? pub.map(pubCard).join("") : `<p class="ep-admin-muted">Пока пусто.</p>`}
        <p id="ep-lay-status" class="ep-act-st"></p></div>`;
  }
  // Одобрение работает с ЦЕЛЫМ документом заявки (approve копирует из него геометрию в
  // публичную коллекцию), поэтому список заявок держим в A.laySubs — по одному id из
  // атрибута кнопки публиковать было бы нечего.
  async function layAct(op, id) {
    const L = LAY(); if (!L) return;
    const st = $("#ep-lay-status"); if (st) st.textContent = "Выполняю…";
    let ok = false;
    if (op === "remove") ok = await L.removePublic(id);
    else {
      const sub = (A.laySubs || []).find((x) => x.id === id);
      if (!sub) { if (st) st.textContent = "Заявка не найдена — обнови вкладку."; return; }
      ok = op === "approve" ? await L.approve(sub) : await L.reject(sub);
    }
    if (!ok) { if (st) st.textContent = "Не получилось — проверь права админа и связь."; return; }
    renderLayouts();
  }

  async function renderBackups() {
    const host = $("#ep-admin-body"); if (!host) return;
    host.innerHTML = `<div class="ep-admin-card"><h3>💾 Бекапы</h3>
      <p class="ep-admin-muted">Скачиваются JSON-файлами на устройство. Можно целиком или по отдельности.</p>
      <div class="ep-usec-btns ep-bk-btns">
        <button type="button" class="ep-btn ep-btn-ok" data-bk="all">⬇️ Бекап ВСЕГО (сервер + все пользователи)</button>
        <button type="button" class="ep-btn" data-bk="server">🗄️ Бекап базы сервера (каталог)</button>
        <button type="button" class="ep-btn" data-bk="users">👥 Бекап данных всех пользователей</button>
      </div>
      <p id="ep-bk-status" class="ep-act-st"></p>
      <p class="ep-admin-muted">«Бекап всего» может занять время — читает базу каждого пользователя.</p></div>`;
  }
  function bkStatus(m) { const e = $("#ep-bk-status"); if (e) e.textContent = m; status(m); }
  async function backupServer() { const r = await readDoc("server_db", SRV_DOC); if (r.error) { bkStatus("Ошибка чтения server_db: " + r.error); return null; } return { server_db: r.data || null }; }
  async function backupAllUsers() {
    const out = []; let i = 0;
    for (const u of A.users) { i++; bkStatus("Чтение пользователей… " + i + "/" + A.users.length); const dbr = await readDoc("user_db", u.uid); const er = await readDoc("estimates", u.uid); const dr = await readDoc("drafts", u.uid); out.push({ uid: u.uid, email: u.email, displayName: u.displayName, status: uStatus(u), subscription: u.subscription || null, ai: u.ai || null, user_db: dbr.data || null, estimates: er.data || null, drafts: dr.data || null }); }
    return out;
  }
  async function doBackup(kind) {
    const ts = new Date().toISOString().slice(0, 10);
    if (kind === "server") { bkStatus("Собираю базу сервера…"); const s = await backupServer(); if (!s) return; downloadJSON("ep-backup-server-" + ts + ".json", { type: "ep-server-backup", exportedAt: new Date().toISOString(), ...s }); bkStatus("Бекап сервера скачан ✓"); return; }
    if (kind === "users") { const us = await backupAllUsers(); downloadJSON("ep-backup-users-" + ts + ".json", { type: "ep-users-backup", exportedAt: new Date().toISOString(), count: us.length, users: us }); bkStatus("Бекап пользователей скачан ✓ (" + us.length + ")"); return; }
    if (kind === "all") { bkStatus("Собираю полный бекап…"); const s = await backupServer(); const us = await backupAllUsers(); downloadJSON("ep-backup-FULL-" + ts + ".json", { type: "ep-full-backup", exportedAt: new Date().toISOString(), server_db: s ? s.server_db : null, usersCount: us.length, users: us }); bkStatus("Полный бекап скачан ✓"); return; }
  }


  // ====== БД СЕРВЕРА (вид как у мастера + ручное добавление) ======
  async function renderServerDb() {
    const host = $("#ep-admin-body"); if (!host) return;
    host.innerHTML = `<div class="ep-admin-card"><h3>🗄️ База сервера (общий каталог)</h3><p class="ep-admin-muted">Хранится в <code>server_db/main</code>, мастера тянут в кэш. Добавлять можно из БД мастера (➕) или вручную ниже.</p>
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

  // ====== КОНТАКТЫ ======
  async function renderContacts() {
    const host = $("#ep-admin-body"); if (!host) return;
    if (!A.contact) { const r = await readDoc("server_db", META_DOC); A.contact = (r.data && r.data.contact) ? r.data.contact : {}; }
    const c = A.contact || {};
    host.innerHTML = `<div class="ep-admin-card"><h3>⚙️ Контакты для мастеров</h3><p class="ep-admin-muted">Мастера увидят это, чтобы связаться (оплата/вопросы). Хранится в <code>server_db/__meta__</code>.</p>
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
  // Запись в users с клиента запрещена правилами — все действия идут через
  // Cloud Function adminUpdateUser (см. functions/index.js).
  function actStatus(m) { const e = $("#ep-act-status"); if (e) e.textContent = m; status(m); }
  async function adminOp(uid, op, extra, ok) {
    actStatus("Выполняю…");
    try {
      const res = await call("adminUpdateUser", Object.assign({ targetUid: uid, op }, extra || {}));
      const fresh = res && res.user;
      const u = A.users.find((x) => x.uid === uid);
      if (u && fresh) Object.assign(u, fresh, { accessStatus: fresh.accessStatus, subscription: fresh.subscription, ai: fresh.ai });
      actStatus(ok || "Готово ✓");
      if (A.tab === "users") renderUsersTab();
    } catch (e) {
      const c = e && (e.code || e.message);
      actStatus("Ошибка (" + op + "): " + (String(c).indexOf("permission-denied") >= 0 ? "нет прав админа" : c));
    }
  }

  // ====== ошибки чтения ======
  function errB(coll, r) { return String(r.error).indexOf("permission-denied") >= 0 ? `<div class='ep-admin-empty'>Нет доступа к <code>${esc(coll)}</code>.</div>` : `<div class='ep-admin-empty'>Ошибка <code>${esc(coll)}</code>: ${esc(r.error)}</div>`; }

  // ====== делегация ======
  function bind(root) {
    if (root.__epAdmin4) return; root.__epAdmin4 = true;
    root.addEventListener("click", (ev) => {
      const t = ev.target;
      const nav = t.closest("[data-tab]"); if (nav) return switchTab(nav.getAttribute("data-tab"));
      const fold = t.closest("[data-fold]"); if (fold) { const k = fold.getAttribute("data-fold"); if (A.exp.has(k)) A.exp.delete(k); else A.exp.add(k); if (A.tab === "serverdb") { const el = $("#ep-srv-list"); if (el) el.innerHTML = renderTree(A.srv, "server"); } else if (A.view === "user" && A.section === "db") { const box = $("#ep-udata"); if (box && A.masterDb.length) box.innerHTML = `<div class="ep-adb-hint">➕ — добавить позицию в БД сервера</div>` + renderTree(A.masterDb, "master"); } return; }
      const addS = t.closest("[data-add-srv]"); if (addS) return addToServer(addS.getAttribute("data-add-srv"));
      if (t.closest("#ep-admin-refresh")) return loadUsers();
      const uopen = t.closest("[data-u-open]"); if (uopen) { openUser(uopen.getAttribute("data-u-open")); return; }
      if (t.closest("[data-u-back]")) { A.view = "list"; A.selectedUid = null; renderUsersTab(); return; }
      const uf = t.closest("[data-ufilter]"); if (uf) { A.ufilter = uf.getAttribute("data-ufilter"); renderUsersTab(); return; }
      const udur = t.closest("[data-u-dur]"); if (udur) { const f = $("#ep-udays"); if (f) f.value = udur.getAttribute("data-u-dur"); const dt = $("#ep-udate"); if (dt) dt.value = ""; document.querySelectorAll("[data-u-dur]").forEach((b) => b.classList && b.classList.toggle("on", b === udur)); return; }
      const uact = t.closest("[data-u-act]"); if (uact) return uAct(uact.getAttribute("data-u-act"));
      const udata = t.closest("[data-u-data]"); if (udata) return loadUserData(udata.getAttribute("data-u-data"));
      const bk = t.closest("[data-bk]"); if (bk) return doBackup(bk.getAttribute("data-bk"));
      const lok = t.closest("[data-lay-ok]"); if (lok) return layAct("approve", lok.getAttribute("data-lay-ok"));
      const lno = t.closest("[data-lay-no]"); if (lno) return layAct("reject", lno.getAttribute("data-lay-no"));
      const ldel = t.closest("[data-lay-del]"); if (ldel) return layAct("remove", ldel.getAttribute("data-lay-del"));
      const asp = t.closest("[data-aisrv-prov]"); if (asp) { A.aiProv = asp.getAttribute("data-aisrv-prov"); return renderAiServer(); }
      if (t.closest("#ep-srv-add")) return srvAddManual();
      const se = t.closest("[data-srv-edit]"); if (se) return srvEdit(se.getAttribute("data-srv-edit"));
      const sd = t.closest("[data-srv-del]"); if (sd) return srvDel(sd.getAttribute("data-srv-del"));
      if (t.closest("#ep-c-save")) return saveContacts();
    });
    root.addEventListener("input", (ev) => {
      if (ev.target.getAttribute && ev.target.getAttribute("data-aisrv")) { const f = ev.target.getAttribute("data-aisrv"); const p = A.aiProv || "openai"; const o = aiSrvCfg(p); o.server[p][f] = (f === "key" || f === "model") ? ev.target.value : num(ev.target.value); aiSaveObj(o); return; }
      if (ev.target.id === "ep-uq") { A.uq = ev.target.value; const el = $(".ep-ulist"); if (el) { const q = A.uq.toLowerCase(); let list = A.users.filter(matchFilter); if (q) list = list.filter((x) => [x.email, x.displayName, x.uid].some((v) => String(v || "").toLowerCase().indexOf(q) >= 0)); el.innerHTML = list.length ? list.map(uRow).join("") : "<div class='ep-admin-empty'>Никого не найдено.</div>"; } }
    });
  }
  function mount() { const root = $("#ep-admin-root"); if (!root) return; if (!isAdmin()) { root.innerHTML = "<div class='ep-admin-hero'><h1>Админка</h1><p>Доступ только для администратора.</p></div>"; return; } bind(root); renderNav(); if (!db()) { status("Firebase недоступен."); return; } A.srv = null; A.contact = null; loadUsers().then(() => { if (A.tab === "users") renderUsersTab(); }); }
  window.addEventListener("ep:route-loaded", (e) => { if (e && e.detail && e.detail.route === "admin") mount(); });
  EP.Admin = { mount, reload: loadUsers, isAdmin };
})();
