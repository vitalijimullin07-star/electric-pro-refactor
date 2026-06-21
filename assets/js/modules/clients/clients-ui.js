/* ============================================================
   Electric Pro V29 — Клиенты и сохранённые сметы
   Хранилище: localStorage (Firestore-синк — позже, Stage 3).
   Структура: База данных → Клиенты → [клиент] → Сметы/Документы.
   API: window.EP.Clients (используется и браузером, и кнопкой
        «Сохранить» в предварительной).
   ============================================================ */
(function () {
  "use strict";
  window.EP = window.EP || {};

  var CLIENTS_KEY = "ep_clients_v29";
  var EST_KEY = "ep_saved_estimates_v29";

  function num(v) { var n = parseFloat(v); return isFinite(n) ? n : 0; }
  function uid() { return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); }
  function money(n) { return Math.round(num(n)).toLocaleString("ru-RU") + " ₽"; }
  function fmtDate(ts) { try { var d = new Date(ts); return ("0" + d.getDate()).slice(-2) + "." + ("0" + (d.getMonth() + 1)).slice(-2) + "." + d.getFullYear(); } catch (e) { return ""; } }

  function loadJSON(key) { try { var v = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function saveJSON(key, arr) { try { localStorage.setItem(key, JSON.stringify(arr)); } catch (e) {} }

  // монотонное время: гарантирует строгий порядок даже при сохранениях в одну мс
  var lastTs = 0;
  function nowTs() { var t = Date.now(); if (t <= lastTs) t = lastTs + 1; lastTs = t; return t; }

  // ---------- API ----------
  function listClients() { return loadJSON(CLIENTS_KEY); }
  function findClient(id) { return listClients().find(function (c) { return c.id === id; }) || null; }
  function addClient(name) {
    name = String(name || "").trim(); if (!name) return null;
    var arr = listClients();
    var ex = arr.find(function (c) { return c.name.toLowerCase() === name.toLowerCase(); });
    if (ex) return ex;
    var c = { id: uid(), name: name, createdAt: nowTs() };
    arr.push(c); saveJSON(CLIENTS_KEY, arr); return c;
  }
  function removeClient(id) {
    saveJSON(CLIENTS_KEY, listClients().filter(function (c) { return c.id !== id; }));
    saveJSON(EST_KEY, listEstimatesRaw().filter(function (e) { return e.clientId !== id; }));
  }
  function listEstimatesRaw() { return loadJSON(EST_KEY); }
  function listEstimates(clientId) { return listEstimatesRaw().filter(function (e) { return e.clientId === clientId; }).sort(function (a, b) { return b.createdAt - a.createdAt; }); }
  function countEstimates(clientId) { return listEstimatesRaw().filter(function (e) { return e.clientId === clientId; }).length; }
  function getEstimate(id) { return listEstimatesRaw().find(function (e) { return e.id === id; }) || null; }
  function removeEstimate(id) { saveJSON(EST_KEY, listEstimatesRaw().filter(function (e) { return e.id !== id; })); }
  function saveEstimate(rec) {
    rec = rec || {};
    var arr = listEstimatesRaw();
    var e = {
      id: uid(),
      clientId: rec.clientId || "",
      name: String(rec.name || "Смета").trim() || "Смета",
      createdAt: nowTs(),
      items: Array.isArray(rec.items) ? rec.items.map(function (x) { return { type: x.type, name: x.name, unit: x.unit || "шт", qty: num(x.qty), price: num(x.price) }; }) : [],
      total: num(rec.total)
    };
    arr.push(e); saveJSON(EST_KEY, arr); return e;
  }

  window.EP.Clients = {
    listClients: listClients, findClient: findClient, addClient: addClient, removeClient: removeClient,
    listEstimates: listEstimates, countEstimates: countEstimates,
    getEstimate: getEstimate, removeEstimate: removeEstimate, saveEstimate: saveEstimate
  };

  // ---------- Браузер (рендер в #ep-clients-root) ----------
  var view = { level: "clients", clientId: "", estimateId: "" };

  function root() { return document.getElementById("ep-clients-root"); }

  function render() {
    var el = root(); if (!el) return;
    if (view.level === "estimate") return renderEstimate(el);
    if (view.level === "folder") return renderFolder(el);
    if (view.level === "client") return renderClient(el);
    return renderClients(el);
  }

  function renderClients(el) {
    var cs = listClients();
    var rows = cs.length
      ? cs.map(function (c) {
          return '<button type="button" class="ep-cl-row" data-cl-open-client="' + esc(c.id) + '">' +
            '<span class="ep-cl-ico">📁</span>' +
            '<span class="ep-cl-main"><span class="ep-cl-name">' + esc(c.name) + '</span>' +
            '<span class="ep-cl-sub">Смет: ' + countEstimates(c.id) + '</span></span>' +
            '<span class="ep-cl-chev">›</span></button>';
        }).join("")
      : '<div class="ep-cl-empty">Пока нет клиентов. Создай первого и сохраняй в него сметы из предварительной.</div>';
    el.innerHTML =
      '<div class="ep-cl-head"><div class="ep-cl-crumbs">👥 Клиенты</div>' +
      '<button type="button" class="ep-cl-add" data-cl-newclient>＋ Новый клиент</button></div>' +
      '<div class="ep-cl-list">' + rows + '</div>';
  }

  function renderClient(el) {
    var c = findClient(view.clientId); if (!c) { view.level = "clients"; return render(); }
    var nEst = countEstimates(c.id);
    el.innerHTML =
      '<div class="ep-cl-head"><div class="ep-cl-crumbs"><button type="button" class="ep-cl-back" data-cl-back>‹ Клиенты</button> / ' + esc(c.name) + '</div></div>' +
      '<div class="ep-cl-list">' +
        '<button type="button" class="ep-cl-row" data-cl-folder="smety">' +
          '<span class="ep-cl-ico">📋</span><span class="ep-cl-main"><span class="ep-cl-name">Сметы</span>' +
          '<span class="ep-cl-sub">' + nEst + ' шт</span></span><span class="ep-cl-chev">›</span></button>' +
        '<button type="button" class="ep-cl-row" data-cl-docs="' + esc(c.id) + '">' +
          '<span class="ep-cl-ico">📄</span><span class="ep-cl-main"><span class="ep-cl-name">Документы</span>' +
          '<span class="ep-cl-sub">договор, акт, счёт, смета заказчику</span></span><span class="ep-cl-chev">›</span></button>' +
      '</div>' +
      '<button type="button" class="ep-cl-danger" data-cl-del-client="' + esc(c.id) + '">🗑 Удалить клиента</button>';
  }

  function renderFolder(el) {
    var c = findClient(view.clientId); if (!c) { view.level = "clients"; return render(); }
    var es = listEstimates(c.id);
    var rows = es.length
      ? es.map(function (e) {
          return '<button type="button" class="ep-cl-row" data-cl-open-est="' + esc(e.id) + '">' +
            '<span class="ep-cl-ico">🧾</span>' +
            '<span class="ep-cl-main"><span class="ep-cl-name">' + esc(e.name) + '</span>' +
            '<span class="ep-cl-sub">' + fmtDate(e.createdAt) + ' · ' + (e.items ? e.items.length : 0) + ' поз. · ' + money(e.total) + '</span></span>' +
            '<span class="ep-cl-chev">›</span></button>';
        }).join("")
      : '<div class="ep-cl-empty">У этого клиента пока нет сохранённых смет.</div>';
    el.innerHTML =
      '<div class="ep-cl-head"><div class="ep-cl-crumbs"><button type="button" class="ep-cl-back" data-cl-back>‹ ' + esc(c.name) + '</button> / Сметы</div></div>' +
      '<div class="ep-cl-list">' + rows + '</div>';
  }

  function renderEstimate(el) {
    var e = getEstimate(view.estimateId); if (!e) { view.level = "folder"; return render(); }
    var c = findClient(e.clientId);
    var mats = (e.items || []).filter(function (x) { return x.type !== "work"; });
    var works = (e.items || []).filter(function (x) { return x.type === "work"; });
    function sect(title, arr) {
      if (!arr.length) return "";
      return '<div class="ep-cl-sect">' + title + '</div>' + arr.map(function (x) {
        return '<div class="ep-cl-item"><span class="ep-cl-iname">' + esc(x.name) + '</span>' +
          '<span class="ep-cl-iqty">' + esc(x.qty) + ' ' + esc(x.unit || "шт") + '</span>' +
          '<span class="ep-cl-isum">' + (num(x.price) > 0 ? money(num(x.price) * num(x.qty)) : "—") + '</span></div>';
      }).join("");
    }
    el.innerHTML =
      '<div class="ep-cl-head"><div class="ep-cl-crumbs"><button type="button" class="ep-cl-back" data-cl-back>‹ Сметы</button> / ' + esc(e.name) + '</div></div>' +
      '<div class="ep-cl-card">' +
        '<div class="ep-cl-est-meta">' + (c ? esc(c.name) + ' · ' : '') + fmtDate(e.createdAt) + '</div>' +
        sect('📦 Материалы', mats) + sect('🧰 Работа', works) +
        '<div class="ep-cl-total">Итого: <b>' + money(e.total) + '</b></div>' +
      '</div>' +
      '<div class="ep-cl-actions">' +
        '<button type="button" class="ep-cl-load" data-cl-makedocs="' + esc(e.id) + '">📄 Документы по этой смете</button>' +
        '<button type="button" class="ep-cl-load" data-cl-load-est="' + esc(e.id) + '" style="background:transparent;color:var(--accent,#7c3aed);border:1px solid rgba(124,58,237,.4)">⬇️ Загрузить в предварительную</button>' +
        '<button type="button" class="ep-cl-danger" data-cl-del-est="' + esc(e.id) + '">🗑 Удалить</button>' +
      '</div>';
  }

  // ---------- Загрузка сметы обратно в предварительную ----------
  function loadEstimateToDraft(id) {
    var e = getEstimate(id); if (!e) return false;
    var d = window.EP && window.EP.EstimateDraft; if (!d || !d.setSourceItems) return false;
    var list = (e.items || []).map(function (x, i) {
      return { sourceId: "saved-" + id + "-" + i, type: x.type, name: x.name, unit: x.unit || "шт", price: num(x.price), qty: num(x.qty), source: "saved" };
    });
    d.setSourceItems("saved", list);
    return true;
  }

  // ---------- Открыть документы по сохранённой смете клиента ----------
  function openDocsFor(client, items) {
    if (window.EP && window.EP.Documents && window.EP.Documents.openFor) {
      window.EP.Documents.openFor({ items: items || [], client: client ? { name: client.name, object: "", phone: "" } : null });
    }
  }

  // ---------- Делегированный клик ----------
  document.addEventListener("click", function (ev) {
    var r = root(); if (!r) return;
    var t = ev.target; if (!t || !r.contains(t)) return;
    var el;
    if ((el = t.closest("[data-cl-newclient]"))) {
      var nm = window.prompt("Имя клиента / объекта:"); if (nm && nm.trim()) { addClient(nm.trim()); render(); } return;
    }
    if ((el = t.closest("[data-cl-open-client]"))) { view.level = "client"; view.clientId = el.getAttribute("data-cl-open-client"); render(); return; }
    if ((el = t.closest("[data-cl-folder]"))) { view.level = "folder"; render(); return; }
    if ((el = t.closest("[data-cl-open-est]"))) { view.level = "estimate"; view.estimateId = el.getAttribute("data-cl-open-est"); render(); return; }
    if ((el = t.closest("[data-cl-back]"))) {
      if (view.level === "estimate") view.level = "folder";
      else if (view.level === "folder") view.level = "client";
      else view.level = "clients";
      render(); return;
    }
    if ((el = t.closest("[data-cl-del-client]"))) {
      if (window.confirm("Удалить клиента вместе со всеми его сметами?")) { removeClient(el.getAttribute("data-cl-del-client")); view.level = "clients"; render(); } return;
    }
    if ((el = t.closest("[data-cl-del-est]"))) {
      if (window.confirm("Удалить эту сохранённую смету?")) { removeEstimate(el.getAttribute("data-cl-del-est")); view.level = "folder"; render(); } return;
    }
    if ((el = t.closest("[data-cl-load-est]"))) {
      if (loadEstimateToDraft(el.getAttribute("data-cl-load-est"))) {
        if (window.EP && window.EP.Router) window.EP.Router.go("main");
      }
      return;
    }
    if ((el = t.closest("[data-cl-docs]"))) {
      var cid = el.getAttribute("data-cl-docs"); var cc = findClient(cid); var es = listEstimates(cid);
      openDocsFor(cc, es[0] ? es[0].items : []); return;
    }
    if ((el = t.closest("[data-cl-makedocs]"))) {
      var ee = getEstimate(el.getAttribute("data-cl-makedocs"));
      if (ee) openDocsFor(findClient(ee.clientId), ee.items); return;
    }
  });

  // mount
  window.addEventListener("ep:route-loaded", function (e) {
    var route = e && e.detail && e.detail.route;
    if (route === "clients" || root()) { view = { level: "clients", clientId: "", estimateId: "" }; render(); }
  });
  if (root()) render();
})();
