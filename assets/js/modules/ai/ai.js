/* Electric Pro V29 — ИИ-ассистент (пока admin-only, тестовый режим).
   Провайдеры: OpenAI, Gemini (легко добавить ещё). Ключ — свой (BYOK) + серверный (для будущего прокси).
   Полный учёт токенов и баланса. Реальные запросы идут из браузера — проверять на устройстве. */
(() => {
  "use strict";
  const KEY = "ep_ai_v29";
  const SYS = "Ты — помощник электрика. Отвечай кратко, по делу, на русском. Помогаешь с расчётами, подбором кабеля/автоматов/УЗО, нормами (ПУЭ/ГОСТ), проверкой смет и щитов.";

  const PROVIDERS = {
    openai: {
      name: "OpenAI (ChatGPT)", defaultModel: "gpt-4o-mini",
      hint: "напр. gpt-4o-mini, gpt-4.1, o4-mini",
      async send(key, model, messages) {
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
          body: JSON.stringify({ model: model, messages: messages })
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error((d.error && d.error.message) || ("Ошибка " + r.status));
        const text = (((d.choices || [])[0] || {}).message || {}).content || "";
        const u = d.usage || {};
        return { text: text, pTok: u.prompt_tokens || 0, cTok: u.completion_tokens || 0 };
      }
    },
    gemini: {
      name: "Google Gemini", defaultModel: "gemini-1.5-flash",
      hint: "напр. gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash",
      async send(key, model, messages) {
        const sys = messages.find(m => m.role === "system");
        const contents = messages.filter(m => m.role !== "system").map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
        const body = { contents: contents };
        if (sys) body.systemInstruction = { parts: [{ text: sys.content }] };
        const url = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent?key=" + encodeURIComponent(key);
        const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error((d.error && d.error.message) || ("Ошибка " + r.status));
        const cand = (d.candidates || [])[0] || {};
        const text = ((cand.content || {}).parts || []).map(p => p.text || "").join("");
        const u = d.usageMetadata || {};
        return { text: text, pTok: u.promptTokenCount || 0, cTok: u.candidatesTokenCount || 0 };
      }
    }
  };
  const PROV_IDS = Object.keys(PROVIDERS);

  function blankCfg(id) { return { key: "", serverKey: "", model: PROVIDERS[id].defaultModel, priceIn: 0, priceOut: 0, balance: 0 }; }
  function blankUsage() { return { req: 0, pTok: 0, cTok: 0, cost: 0 }; }
  function load() {
    let s = null; try { s = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
    if (!s || typeof s !== "object") s = {};
    if (!s.provider || PROV_IDS.indexOf(s.provider) < 0) s.provider = "openai";
    s.cfg = s.cfg || {}; s.usage = s.usage || {};
    PROV_IDS.forEach(id => { s.cfg[id] = Object.assign(blankCfg(id), s.cfg[id] || {}); s.usage[id] = Object.assign(blankUsage(), s.usage[id] || {}); });
    return s;
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function num(v) { return Number(v) || 0; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function money(v) { return "$" + (Math.round(num(v) * 10000) / 10000); }

  let st = load();
  let chat = [{ role: "system", content: SYS }];
  let view = "chat";      // chat | settings
  let busy = false;

  function curCfg() { return st.cfg[st.provider]; }
  function curUsage() { return st.usage[st.provider]; }

  function addUsage(pTok, cTok) {
    const c = curCfg(), u = curUsage();
    u.req += 1; u.pTok += num(pTok); u.cTok += num(cTok);
    u.cost += (num(pTok) / 1e6) * num(c.priceIn) + (num(cTok) / 1e6) * num(c.priceOut);
    save(st);
  }

  async function ask(messages) {
    const c = curCfg();
    if (!c.key) throw new Error("Не задан API-ключ (Настройки → ключ).");
    const res = await PROVIDERS[st.provider].send(c.key, c.model || PROVIDERS[st.provider].defaultModel, messages);
    addUsage(res.pTok, res.cTok);
    return res;
  }

  window.EP = window.EP || {};
  EP.AI = {
    getData: () => st, save: () => save(st),
    ask, addUsage,
    usage: () => curUsage(), resetUsage: () => { st.usage[st.provider] = blankUsage(); save(st); },
    providers: PROVIDERS
  };

  /* ---------------- UI ---------------- */
  function isAdmin() { try { return !!(window.EP && EP.Auth && EP.Auth.isAdmin && EP.Auth.isAdmin()); } catch (e) { return false; } }

  function usagePanel() {
    const c = curCfg(), u = curUsage();
    const total = u.pTok + u.cTok;
    const remain = num(c.balance) - num(u.cost);
    const pct = num(c.balance) > 0 ? Math.max(0, Math.min(100, remain / num(c.balance) * 100)) : 0;
    return `<div class="ep-ai-usage">
      <div class="ep-ai-ubar"><span>Провайдер: <b>${esc(PROVIDERS[st.provider].name)}</b></span><span>модель: ${esc(c.model || "—")}</span></div>
      <div class="ep-ai-stats">
        <div class="ep-ai-stat"><span>${u.req}</span><small>запросов</small></div>
        <div class="ep-ai-stat"><span>${u.pTok}</span><small>вход. токенов</small></div>
        <div class="ep-ai-stat"><span>${u.cTok}</span><small>исход. токенов</small></div>
        <div class="ep-ai-stat"><span>${total}</span><small>всего токенов</small></div>
        <div class="ep-ai-stat"><span>${money(u.cost)}</span><small>потрачено (оц.)</small></div>
      </div>
      ${num(c.balance) > 0 ? `<div class="ep-ai-bal">
        <div class="ep-ai-balrow"><span>Баланс: ${money(c.balance)}</span><span>Осталось: <b>${money(remain)}</b></span></div>
        <div class="ep-ai-baltrack"><div class="ep-ai-balfill" style="width:${pct}%"></div></div>
      </div>` : `<div class="ep-ai-hint">Задай баланс провайдера в Настройках, чтобы видеть остаток.</div>`}
      <button type="button" class="ep-ai-reset ep-clickable" data-ai-reset>Обнулить счётчик</button>
    </div>`;
  }

  function chatView() {
    const msgs = chat.filter(m => m.role !== "system");
    const list = msgs.length ? msgs.map(m => `
      <div class="ep-ai-msg ${m.role}">
        <div class="ep-ai-bub">${esc(m.content)}</div>
        ${m.tok ? `<div class="ep-ai-mtok">${m.tok} ток.</div>` : ""}
      </div>`).join("") : `<div class="ep-ai-empty">Задай вопрос: подбор кабеля/автомата, проверка сметы, нормы. Это тестовый режим — следи за счётчиком токенов выше.</div>`;
    return `<div class="ep-ai-chat">
      <div class="ep-ai-msgs" id="ep-ai-msgs">${list}${busy ? '<div class="ep-ai-typing">ИИ печатает…</div>' : ""}</div>
      <div class="ep-ai-input">
        <textarea id="ep-ai-text" rows="2" placeholder="Вопрос ассистенту…" ${busy ? "disabled" : ""}></textarea>
        <button type="button" class="btn btn-primary ep-clickable" data-ai-send ${busy ? "disabled" : ""}>▶</button>
      </div>
      <div class="ep-ai-clearrow"><button type="button" class="ep-ai-clear ep-clickable" data-ai-clear>Очистить диалог</button></div>
    </div>`;
  }

  function settingsView() {
    const provTabs = PROV_IDS.map(id => `<button type="button" class="ep-ai-ptab ${st.provider === id ? "on" : ""}" data-ai-prov="${id}">${esc(PROVIDERS[id].name)}</button>`).join("");
    const c = curCfg();
    return `<div class="ep-ai-settings">
      <div class="ep-ai-ptabs">${provTabs}</div>
      <label class="ep-ai-f"><span>Мой API-ключ</span>
        <input type="password" data-ai-key value="${esc(c.key)}" placeholder="вставь ключ ${esc(PROVIDERS[st.provider].name)}" autocomplete="off"></label>
      <label class="ep-ai-f"><span>Серверный ключ (для общего доступа — подключим с прокси)</span>
        <input type="password" data-ai-serverkey value="${esc(c.serverKey)}" placeholder="необязательно сейчас" autocomplete="off"></label>
      <label class="ep-ai-f"><span>Модель</span>
        <input type="text" data-ai-model value="${esc(c.model)}" placeholder="${esc(PROVIDERS[st.provider].defaultModel)}">
        <small>${esc(PROVIDERS[st.provider].hint)}</small></label>
      <div class="ep-ai-f2">
        <label class="ep-ai-f"><span>Цена за 1M вход. токенов, $</span><input type="number" inputmode="decimal" step="0.01" min="0" data-ai-pricein value="${c.priceIn || ""}" placeholder="0"></label>
        <label class="ep-ai-f"><span>Цена за 1M исход. токенов, $</span><input type="number" inputmode="decimal" step="0.01" min="0" data-ai-priceout value="${c.priceOut || ""}" placeholder="0"></label>
      </div>
      <label class="ep-ai-f"><span>Баланс провайдера, $ (для контроля остатка)</span>
        <input type="number" inputmode="decimal" step="0.01" min="0" data-ai-balance value="${c.balance || ""}" placeholder="напр. 8.28"></label>
      <div class="ep-ai-hint">Ключ хранится только на этом устройстве. Цены за токены возьми из тарифов провайдера — по ним считается «потрачено» и «осталось».</div>
    </div>`;
  }

  function render() {
    const root = document.getElementById("ep-ai-root"); if (!root) return;
    if (!isAdmin()) {
      root.innerHTML = `<div class="ep-ai"><div class="ep-ai-locked"><div class="ep-ai-lock">🔒</div><div class="ep-ai-lockt">ИИ-ассистент</div><div class="ep-ai-locks">Сейчас доступен только администратору (тестовый режим). Скоро откроем по плану «С ИИ».</div><button type="button" class="btn btn-ghost ep-clickable" data-route="main">На главный</button></div></div>`;
      return;
    }
    root.innerHTML = `<div class="ep-ai">
      <div class="page-head"><h1>🤖 ИИ-ассистент <span class="ep-ai-test">тест</span></h1></div>
      ${usagePanel()}
      <div class="ep-ai-tabs">
        <button type="button" class="ep-ai-tab ${view === "chat" ? "on" : ""}" data-ai-tab="chat">Ассистент</button>
        <button type="button" class="ep-ai-tab ${view === "settings" ? "on" : ""}" data-ai-tab="settings">Настройки</button>
      </div>
      ${view === "chat" ? chatView() : settingsView()}
    </div>`;
    const m = document.getElementById("ep-ai-msgs"); if (m) m.scrollTop = m.scrollHeight;
  }

  async function doSend() {
    if (busy) return;
    const root = document.getElementById("ep-ai-root"); if (!root) return;
    const ta = root.querySelector("#ep-ai-text"); const text = ta ? ta.value.trim() : "";
    if (!text) return;
    if (!curCfg().key) { view = "settings"; render(); alert("Сначала вставь API-ключ в Настройках."); return; }
    chat.push({ role: "user", content: text });
    busy = true; render();
    try {
      const hist = chat.slice(-21); // система + последние 20
      const res = await ask(hist);
      chat.push({ role: "assistant", content: res.text || "(пустой ответ)", tok: res.pTok + res.cTok });
    } catch (e) {
      chat.push({ role: "assistant", content: "⚠ " + (e && e.message ? e.message : "Ошибка запроса. Проверь ключ/модель/сеть."), tok: 0 });
    }
    busy = false; render();
  }

  document.addEventListener("input", (e) => {
    const t = e.target; if (!t || !t.getAttribute || !document.getElementById("ep-ai-root")) return;
    const c = curCfg();
    if (t.hasAttribute("data-ai-key")) { c.key = t.value; save(st); }
    else if (t.hasAttribute("data-ai-serverkey")) { c.serverKey = t.value; save(st); }
    else if (t.hasAttribute("data-ai-model")) { c.model = t.value; save(st); }
    else if (t.hasAttribute("data-ai-pricein")) { c.priceIn = num(t.value); save(st); }
    else if (t.hasAttribute("data-ai-priceout")) { c.priceOut = num(t.value); save(st); }
    else if (t.hasAttribute("data-ai-balance")) { c.balance = num(t.value); save(st); }
  });
  document.addEventListener("click", (e) => {
    const t = e.target; if (!t || !t.closest || !document.getElementById("ep-ai-root")) return; let el;
    if ((el = t.closest("[data-ai-tab]"))) { view = el.getAttribute("data-ai-tab") === "settings" ? "settings" : "chat"; render(); return; }
    if ((el = t.closest("[data-ai-prov]"))) { st.provider = el.getAttribute("data-ai-prov"); save(st); render(); return; }
    if (t.closest("[data-ai-send]")) { doSend(); return; }
    if (t.closest("[data-ai-reset]")) { if (confirm("Обнулить счётчик токенов и потрачено для этого провайдера?")) { EP.AI.resetUsage(); render(); } return; }
    if (t.closest("[data-ai-clear]")) { chat = [{ role: "system", content: SYS }]; render(); return; }
  });

  window.addEventListener("ep:route-loaded", (e) => { const r = e && e.detail && e.detail.route; if (r === "ai") { st = load(); view = "chat"; render(); } });
})();
