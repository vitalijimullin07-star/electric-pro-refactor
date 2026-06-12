/* ============================================================
   Electric Pro V29 — Админка (реальный бэкенд)
   Регион функций: europe-west1.
   Чтение: напрямую (админу правила разрешают):
     users, user_subscriptions, ai_accounts, user_db/{uid},
     drafts/{uid}, estimates/{uid}, ai_usage/{uid}, admin_logs.
   Подтверждение/роль/блок: прямая запись users/{uid} (admin по правилам).
   Подписки:  grantSubscription{uid,planId,periodDays,trial} / cancelSubscription{uid}
   ИИ-баланс: setAiBalanceExact{uid,balanceRub} / topUpAiBalance{uid,amountRub}
              setAiAccessMode{uid,accessMode:'admin_api'|'own_api'|'disabled'}
   Политика:  setUserSecurityPolicy{uid,allowLogin,allowAi,...}
   Планы: basic | pro_ai. Монтаж по ep:route-loaded(admin), без observer.
   ============================================================ */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const OWNER = "vits0007@gmail.com";
  const A = { users: [], selectedUid: null, section: null, onlyPending: false };
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const jn = (o) => { try { return JSON.stringify(o, null, 2); } catch (e) { return String(o); } };
  const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
  const tsDate = (t) => { if (!t) return null; const s = t._seconds || t.seconds; if (s) return new Date(s * 1000); if (t.toDate) try { return t.toDate(); } catch (e) {} const d = new Date(t); return isNaN(d) ? null : d; };
  const dstr = (t) => { const d = tsDate(t); return d ? d.toLocaleDateString("ru-RU") : "—"; };

  function me() { try { return (EP.Auth && EP.Auth.currentUser && EP.Auth.currentUser()) || (EP.state && EP.state.user) || {}; } catch (e) { return {}; } }
  function isAdmin() {
    try {
      if ((me() || {}).email === OWNER) return true;
      if (EP.Auth && EP.Auth.isAdmin && EP.Auth.isAdmin()) return true;
      const p = (EP.state && EP.state.profile) || {}; return p.role === "admin" || p.isAdmin === true;
    } catch (e) { return false; }
  }
  function db() { try { return (EP.Firebase && EP.Firebase.db) || null; } catch (e) { return null; } }
  function fns() {
    try { if (typeof firebase !== "undefined" && firebase.app) return firebase.app().functions("europe-west1"); } catch (e) {}
    try { if (typeof firebase !== "undefined" && firebase.functions) return firebase.functions("europe-west1"); } catch (e) {}
    return null;
  }
  async function call(name, payload) { const f = fns(); if (!f) throw new Error("functions-unavailable"); const r = await f.httpsCallable(name)(payload || {}); return r && r.data; }
  function status(msg) { const el = $("#ep-admin-status"); if (el) el.textContent = msg; }

  // ---------- статус-хелперы ----------
  function uStatus(u) { return u.status || (u.isApproved ? "approved" : "pending"); }
  function isPending(u) { const s = uStatus(u); return s === "pending" || s === "pending_review" || (!u.isApproved && s !== "approved" && s !== "blocked_review" && s !== "blocked" && s !== "deleted"); }
  function isBlocked(u) { const s = uStatus(u); return u.blocked === true || s === "blocked" || s === "blocked_review" || s === "deleted"; }
  function isApproved(u) { return uStatus(u) === "approved" || u.isApproved === true; }
  function subActive(s) { return s && (s.status === "active" || s.status === "trial") && (!s.expiresAt || (tsDate(s.expiresAt) && tsDate(s.expiresAt).getTime() > Date.now())); }

  // ---------- загрузка (напрямую) ----------
  async function loadUsers() {
    status("Загрузка…"); const d = db(); if (!d) { status("Firebase недоступен."); return; }
    try {
      const [us, subs, ais] = await Promise.all([
        d.collection("users").limit(800).get(),
        d.collection("user_subscriptions").limit(800).get().catch(() => ({ docs: [] })),
        d.collection("ai_accounts").limit(800).get().catch(() => ({ docs: [] }))
      ]);
      const subMap = {}, aiMap = {};
      subs.docs.forEach((x) => { subMap[x.id] = x.data() || {}; });
      ais.docs.forEach((x) => { aiMap[x.id] = x.data() || {}; });
      A.users = us.docs.map((doc) => {
        const data = doc.data() || {};
        return { uid: doc.id, email: data.email || "", displayName: data.displayName || data.name || "", role: data.role || "master", status: data.status, isApproved: data.isApproved, isAdmin: data.isAdmin, blocked: data.blocked, securityPolicy: data.securityPolicy || {}, raw: data, subscription: subMap[doc.id] || null, aiAccount: aiMap[doc.id] || null };
      });
      renderDashboard(); renderPending(); status("Пользователей: " + A.users.length);
    } catch (e) {
      const c = e && (e.code || e.message);
      status(String(c).indexOf("permission-denied") >= 0 ? "Нет прав на чтение (нужна роль admin + status approved)." : "Ошибка чтения: " + c);
    }
  }
  async function readDoc(coll, id) { const d = db(); if (!d) return { error: "no-db" }; try { const s = await d.collection(coll).doc(id).get(); return { exists: s.exists, data: s.exists ? (s.data() || {}) : null }; } catch (e) { return { error: (e && (e.code || e.message)) || "error" }; } }
  async function readColl(coll, field, val) { const d = db(); if (!d) return { error: "no-db" }; try { let q = d.collection(coll); if (field) q = q.where(field, "==", val); const s = await q.limit(50).get(); return { docs: s.docs.map((x) => ({ id: x.id, data: x.data() || {} })) }; } catch (e) { return { error: (e && (e.code || e.message)) || "error" }; } }

  // ---------- дашборд + заявки ----------
  function renderDashboard() {
    const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
    set("#ep-c-users", A.users.length);
    set("#ep-c-pending", A.users.filter(isPending).length);
    set("#ep-c-active", A.users.filter((u) => subActive(u.subscription)).length);
    set("#ep-c-blocked", A.users.filter(isBlocked).length);
    set("#ep-c-ai", A.users.filter((u) => u.aiAccount && u.aiAccount.allowAi).length);
  }
  function renderPending() {
    const host = $("#ep-admin-pending"); if (!host) return;
    const list = A.users.filter(isPending);
    if (!list.length) { host.innerHTML = ""; return; }
    host.innerHTML = `<div class="ep-admin-card"><h3>Заявки на регистрацию (${list.length})</h3>` +
      list.map((u) => `<div class="ep-admin-prow"><div><b>${esc(u.email || u.uid)}</b><span>${esc(u.displayName || "")}</span></div><div class="ep-admin-prow-act"><button data-approve="${esc(u.uid)}" class="ep-ok">Одобрить</button><button data-open="${esc(u.uid)}" class="ep-ghost">Открыть</button></div></div>`).join("") + `</div>`;
  }

  // ---------- модалка выбора ----------
  function openPicker() { const m = $("#ep-admin-modal"); if (!m) return; m.classList.add("open"); renderPickerList(); const s = $("#ep-admin-modal-search"); if (s) { s.value = ""; setTimeout(() => s.focus && s.focus(), 40); } }
  function closePicker() { const m = $("#ep-admin-modal"); if (m) m.classList.remove("open"); }
  function renderPickerList() {
    const el = $("#ep-admin-modal-list"); if (!el) return;
    const q = ($("#ep-admin-modal-search") && $("#ep-admin-modal-search").value || "").trim().toLowerCase();
    let list = A.users;
    if (A.onlyPending) list = list.filter(isPending);
    if (q) list = list.filter((u) => [u.uid, u.email, u.displayName, u.role].some((x) => String(x || "").toLowerCase().indexOf(q) >= 0));
    if (!list.length) { el.innerHTML = "<div class='ep-admin-empty'>Никого не найдено.</div>"; return; }
    el.innerHTML = list.map((u) => { const st = uStatus(u); const sub = u.subscription; return `<button type="button" class="ep-admin-pick" data-open="${esc(u.uid)}"><b>${esc(u.email || "(без email)")}</b><span>${esc(u.displayName || "—")} · ${esc(u.role)} · <i class="ep-st ep-st-${esc(st)}">${esc(st)}</i>${sub && subActive(sub) ? " · " + esc(sub.planId || "sub") : ""}</span></button>`; }).join("");
  }

  // ---------- карточка пользователя ----------
  function user() { return A.users.find((x) => x.uid === A.selectedUid); }
  function selectUser(uid) { A.selectedUid = uid; A.section = null; closePicker(); renderDetail(); const host = $("#ep-admin-detail"); if (host && host.scrollIntoView) try { host.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) {} }

  function renderDetail() {
    const host = $("#ep-admin-detail"); if (!host) return;
    const u = user();
    if (!u) { host.innerHTML = "<div class='ep-admin-empty'>Выберите пользователя.</div>"; return; }
    const st = uStatus(u), sub = u.subscription || {}, ai = u.aiAccount || {}, pol = u.securityPolicy || {};
    const sel = (id, vals, cur) => `<select id="${id}">${vals.map((v) => `<option value="${v[0]}" ${String(cur) === v[0] ? "selected" : ""}>${esc(v[1])}</option>`).join("")}</select>`;
    host.innerHTML = `
      <div class="ep-admin-card">
        <div class="ep-admin-uhead">
          <div><h2>${esc(u.email || u.uid)}</h2><p class="ep-admin-muted">${esc(u.displayName || "")} · UID ${esc(u.uid)}</p></div>
          <div class="ep-admin-badges"><span class="ep-st ep-st-${esc(st)}">${esc(st)}</span><span class="ep-badge">${esc(u.role)}</span></div>
        </div>
        <div class="ep-admin-actions">
          ${isApproved(u) ? "" : `<button id="ep-approve" class="ep-ok">✓ Одобрить</button>`}
          ${isBlocked(u) ? `<button id="ep-unblock" class="ep-ok">Разблокировать</button>` : `<button id="ep-block" class="ep-danger">Заблокировать</button>`}
          ${u.role === "admin" ? `<button id="ep-demote" class="ep-ghost">Снять админа</button>` : `<button id="ep-promote" class="ep-ghost">Сделать админом</button>`}
        </div>
        <p id="ep-act-status" class="ep-admin-muted"></p>
      </div>

      <div class="ep-admin-grid">
        <div class="ep-admin-card">
          <h3>Подписка</h3>
          <p class="ep-admin-muted">Сейчас: <b>${esc(sub.planName || sub.planId || "нет")}</b> · ${esc(sub.status || "—")}${sub.expiresAt ? " · до " + esc(dstr(sub.expiresAt)) : ""}</p>
          <div class="ep-admin-row">
            ${sel("ep-plan", [["basic", "Базовый"], ["pro_ai", "С ИИ (pro_ai)"]], sub.planId || "basic")}
            <input id="ep-days" type="number" min="1" value="30" title="дней">
            <label class="ep-admin-chk"><input id="ep-trial" type="checkbox"> пробный</label>
          </div>
          <div class="ep-admin-actions">
            <button id="ep-grant" class="ep-ok">Выдать / продлить</button>
            <button id="ep-cancel-sub" class="ep-danger">Отменить</button>
          </div>
        </div>

        <div class="ep-admin-card">
          <h3>ИИ-баланс</h3>
          <p class="ep-admin-muted">Баланс: <b>${esc(num(ai.balanceRub).toFixed(2))} ₽</b> · режим: ${esc(ai.accessMode || "—")}</p>
          <div class="ep-admin-row">
            <input id="ep-ai-balance" type="number" min="0" step="0.01" value="${esc(num(ai.balanceRub))}" title="точный баланс ₽">
            <button id="ep-ai-set" class="ep-ok">Установить</button>
          </div>
          <div class="ep-admin-row">
            <input id="ep-ai-topup" type="number" min="0" step="0.01" value="100" title="пополнить на ₽">
            <button id="ep-ai-add" class="ep-ghost">Пополнить</button>
          </div>
          <div class="ep-admin-row">
            ${sel("ep-ai-mode", [["disabled", "выкл"], ["admin_api", "общий ключ"], ["own_api", "свой ключ"]], ai.accessMode || "disabled")}
            <button id="ep-ai-mode-save" class="ep-ghost">Сохранить режим</button>
          </div>
        </div>

        <div class="ep-admin-card">
          <h3>Политика безопасности</h3>
          <label class="ep-admin-chk"><input id="ep-p-login" type="checkbox" ${pol.allowLogin !== false ? "checked" : ""}> вход разрешён</label>
          <label class="ep-admin-chk"><input id="ep-p-read" type="checkbox" ${pol.allowReadData !== false ? "checked" : ""}> чтение данных</label>
          <label class="ep-admin-chk"><input id="ep-p-ai" type="checkbox" ${pol.allowAi === true ? "checked" : ""}> ИИ разрешён</label>
          <label class="ep-admin-chk"><input id="ep-p-cache" type="checkbox" ${pol.allowLocalCache === true ? "checked" : ""}> локальный кэш</label>
          <div class="ep-admin-actions"><button id="ep-p-save" class="ep-ghost">Сохранить политику</button></div>
        </div>
      </div>

      <div class="ep-admin-card">
        <h3>Данные пользователя</h3>
        <div class="ep-admin-sections">
          <button data-sec="db">🗂️ БД</button>
          <button data-sec="sub">📄 Подписка (raw)</button>
          <button data-sec="ai">🤖 ИИ-счёт</button>
          <button data-sec="drafts">📝 Черновики</button>
          <button data-sec="estimates">🧾 Сметы</button>
          <button data-sec="usage">📊 Расход ИИ</button>
          <button data-sec="logs">📜 Логи</button>
        </div>
        <div id="ep-sec" class="ep-admin-secbox"><div class="ep-admin-empty">Выберите раздел.</div></div>
      </div>`;
    if (A.section) openSection(A.section);
  }

  // ---------- операции ----------
  function actStatus(msg) { const e = $("#ep-act-status"); if (e) e.textContent = msg; }
  async function writeUserDoc(uid, patch, okMsg) {
    const d = db(); if (!d) return; actStatus("Сохранение…");
    try {
      patch.updatedAt = (firebase && firebase.firestore && firebase.firestore.FieldValue) ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString();
      await d.collection("users").doc(uid).set(patch, { merge: true });
      const u = user(); if (u) Object.assign(u, patch, { raw: Object.assign({}, u.raw, patch) });
      actStatus(okMsg || "Готово ✓"); renderDashboard(); renderPending(); renderDetail();
    } catch (e) { const c = e && (e.code || e.message); actStatus(String(c).indexOf("permission-denied") >= 0 ? "Нет прав на запись users (проверь правила/роль)." : "Ошибка: " + c); }
  }
  async function callOp(name, payload, okMsg) {
    actStatus("Выполняю…");
    try { const r = await call(name, payload); actStatus(okMsg || "Готово ✓"); await loadUsers(); renderDetail(); return r; }
    catch (e) { const c = e && (e.code || e.message); actStatus("Ошибка (" + name + "): " + (String(c).indexOf("permission-denied") >= 0 ? "нет прав админа" : c)); }
  }

  // ---------- разделы данных ----------
  function secBox(html) { const el = $("#ep-sec"); if (el) el.innerHTML = html; }
  function errB(coll, r) { return String(r.error).indexOf("permission-denied") >= 0 ? `<div class='ep-admin-empty'>Нет доступа к <code>${esc(coll)}</code>.</div>` : `<div class='ep-admin-empty'>Ошибка <code>${esc(coll)}</code>: ${esc(r.error)}</div>`; }
  async function openSection(name) {
    A.section = name; const uid = A.selectedUid; if (!uid) return;
    document.querySelectorAll(".ep-admin-sections button").forEach((b) => b.classList.toggle("on", b.getAttribute("data-sec") === name));
    secBox("<div class='ep-admin-empty'>Загрузка…</div>");
    if (name === "db") {
      const r = await readDoc("user_db", uid); if (r.error) return secBox(errB("user_db/{uid}", r));
      const items = (r.data && Array.isArray(r.data.items)) ? r.data.items : [];
      if (!items.length) return secBox("<div class='ep-admin-empty'>Личная БД пуста.</div>");
      secBox(`<p class="ep-admin-muted">Позиций: ${items.length}</p><table class="ep-admin-table"><thead><tr><th>тип</th><th>название</th><th>ед.</th><th>цена</th></tr></thead><tbody>${items.slice(0, 300).map((x) => `<tr><td>${esc(x.type)}</td><td>${esc(x.name)}</td><td>${esc(x.unit || "")}</td><td>${esc(x.price)}</td></tr>`).join("")}</tbody></table>`);
    } else if (name === "sub" || name === "ai") {
      const coll = name === "sub" ? "user_subscriptions" : "ai_accounts";
      const r = await readDoc(coll, uid); if (r.error) return secBox(errB(coll + "/{uid}", r));
      secBox(r.exists ? `<pre class="ep-admin-pre">${esc(jn(r.data))}</pre>` : "<div class='ep-admin-empty'>Нет данных.</div>");
    } else if (name === "drafts" || name === "estimates") {
      const r = await readDoc(name, uid); if (r.error) return secBox(errB(name + "/{uid}", r));
      if (!r.exists || !r.data || !Object.keys(r.data).length) return secBox(`<div class='ep-admin-empty'>В <code>${esc(name)}/{uid}</code> нет данных (или они в подколлекции).</div>`);
      secBox(`<pre class="ep-admin-pre">${esc(jn(r.data))}</pre>`);
    } else if (name === "usage") {
      const r = await readColl("ai_usage", "uid", uid); if (r.error) return secBox(errB("ai_usage", r));
      if (!r.docs || !r.docs.length) return secBox("<div class='ep-admin-empty'>Расхода ИИ нет.</div>");
      secBox(r.docs.map((d) => `<div class="ep-admin-logrow">${esc(dstr(d.data.createdAt))} · ${esc(d.data.feature || d.data.model || "")} · ${esc(num(d.data.amountRub).toFixed(2))}₽ · ${esc(d.data.totalTokens || 0)}т</div>`).join(""));
    } else if (name === "logs") {
      const r = await readColl("admin_logs", "uid", uid); if (r.error) return secBox(errB("admin_logs", r));
      if (!r.docs || !r.docs.length) return secBox("<div class='ep-admin-empty'>Логов нет.</div>");
      secBox(r.docs.map((d) => `<div class="ep-admin-logrow">${esc(dstr(d.data.createdAt))} · <b>${esc(d.data.type || "")}</b> ${esc(d.data.planId || d.data.accessMode || d.data.feature || "")}</div>`).join(""));
    }
  }

  // ---------- делегация ----------
  function bind(root) {
    if (root.__epAdmin2) return; root.__epAdmin2 = true;
    root.addEventListener("click", (ev) => {
      const t = ev.target;
      if (t.closest("#ep-admin-open-picker")) return openPicker();
      if (t.closest("#ep-admin-modal-close") || t.closest("#ep-admin-modal-overlay")) return closePicker();
      if (t.closest("#ep-admin-refresh")) return loadUsers();
      if (t.closest("#ep-admin-toggle-pending")) { A.onlyPending = !A.onlyPending; const b = $("#ep-admin-toggle-pending"); if (b) b.classList.toggle("on", A.onlyPending); renderPickerList(); openPicker(); return; }
      const op = t.closest("[data-open]"); if (op) return selectUser(op.getAttribute("data-open"));
      const ap = t.closest("[data-approve]"); if (ap) { A.selectedUid = ap.getAttribute("data-approve"); return writeUserDoc(A.selectedUid, { status: "approved", isApproved: true, blocked: false }, "Мастер одобрен ✓"); }
      const sec = t.closest("[data-sec]"); if (sec) return openSection(sec.getAttribute("data-sec"));
      const uid = A.selectedUid;
      if (t.closest("#ep-approve")) return writeUserDoc(uid, { status: "approved", isApproved: true, blocked: false }, "Одобрен ✓");
      if (t.closest("#ep-block")) return writeUserDoc(uid, { status: "blocked_review", blocked: true }, "Заблокирован");
      if (t.closest("#ep-unblock")) return writeUserDoc(uid, { status: "approved", blocked: false, isApproved: true }, "Разблокирован");
      if (t.closest("#ep-promote")) return writeUserDoc(uid, { role: "admin" }, "Назначен админом");
      if (t.closest("#ep-demote")) return writeUserDoc(uid, { role: "master" }, "Роль: мастер");
      if (t.closest("#ep-grant")) return callOp("grantSubscription", { uid, planId: ($("#ep-plan") || {}).value || "basic", periodDays: num(($("#ep-days") || {}).value) || 30, trial: !!($("#ep-trial") || {}).checked }, "Подписка выдана ✓");
      if (t.closest("#ep-cancel-sub")) return callOp("cancelSubscription", { uid, reason: "admin_panel" }, "Подписка отменена");
      if (t.closest("#ep-ai-set")) return callOp("setAiBalanceExact", { uid, balanceRub: num(($("#ep-ai-balance") || {}).value) }, "Баланс установлен ✓");
      if (t.closest("#ep-ai-add")) return callOp("topUpAiBalance", { uid, amountRub: num(($("#ep-ai-topup") || {}).value), paymentMethod: "admin_panel" }, "Баланс пополнен ✓");
      if (t.closest("#ep-ai-mode-save")) return callOp("setAiAccessMode", { uid, accessMode: ($("#ep-ai-mode") || {}).value || "disabled" }, "Режим ИИ сохранён ✓");
      if (t.closest("#ep-p-save")) return callOp("setUserSecurityPolicy", { uid, allowLogin: !!($("#ep-p-login") || {}).checked, allowReadData: !!($("#ep-p-read") || {}).checked, allowAi: !!($("#ep-p-ai") || {}).checked, allowLocalCache: !!($("#ep-p-cache") || {}).checked }, "Политика сохранена ✓");
    });
    root.addEventListener("input", (ev) => { if (ev.target.id === "ep-admin-modal-search") renderPickerList(); });
  }
  function mount() {
    const root = $("#ep-admin-root"); if (!root) return;
    if (!isAdmin()) { root.innerHTML = "<div class='ep-admin-hero'><h1>Админка</h1><p>Доступ только для администратора.</p></div>"; return; }
    bind(root);
    if (!db()) { status("Firebase недоступен."); return; }
    loadUsers().then(() => renderDetail());
  }
  window.addEventListener("ep:route-loaded", (e) => { if (e && e.detail && e.detail.route === "admin") mount(); });
  EP.Admin = { mount, reload: loadUsers, isAdmin };
})();
