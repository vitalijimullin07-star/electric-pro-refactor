/*
 * Electric PRO Refactor
 * V68 Database Lazy Render
 *
 * Новый безопасный просмотр базы.
 * Старый UI не ломает.
 */

(function () {
  "use strict";

  const VERSION = "V68_DATABASE_LAZY_RENDER";
  const STYLE_ID = "ep-db-v68-style";
  const BTN_ID = "ep-db-v68-open-btn";
  const MODAL_ID = "ep-db-v68-modal";

  function arr(v) {
    return Array.isArray(v) ? v : [];
  }

  function text(el) {
    return String((el && el.textContent) || "").replace(/\s+/g, " ").trim();
  }

  function lower(el) {
    return text(el).toLowerCase();
  }

  function getScope() {
    if (window.EP_DB && typeof window.EP_DB.getScope === "function") {
      return window.EP_DB.getScope();
    }

    if (typeof window.epGetDbScope === "function") {
      const s = window.epGetDbScope();
      return s === "global" ? "server" : s;
    }

    return "server";
  }

  function getScopeTitle() {
    return getScope() === "my" ? "Моя база" : "База сервера";
  }

  function getActive(type) {
    if (window.EP_DB && typeof window.EP_DB.getActiveStore === "function") {
      return arr(window.EP_DB.getActiveStore(type));
    }

    if (type === "work") return arr(window.workDB);
    return arr(window.matDB);
  }

  function itemName(item) {
    return String(
      item.name ||
      item.title ||
      item.label ||
      item.Наименование ||
      item["Наименование"] ||
      "Без названия"
    ).trim();
  }

  function itemPrice(item) {
    return item.price ?? item.cost ?? item.amount ?? item["Цена"] ?? item["цена"] ?? "";
  }

  function itemUnit(item) {
    return item.unit || item.measure || item.uom || item["Ед"] || item["ед"] || item["Ед."] || "шт";
  }

  function itemCat(item) {
    return String(
      item.category ||
      item.cat ||
      item.group ||
      item.section ||
      item.type ||
      "Другое"
    ).trim() || "Другое";
  }

  function itemSub(item) {
    return String(
      item.subcategory ||
      item.subcat ||
      item.sub ||
      item.kind ||
      item.folder ||
      "Без подкатегории"
    ).trim() || "Без подкатегории";
  }

  function canEdit() {
    if (window.EP_DB && typeof window.EP_DB.canEdit === "function") {
      return window.EP_DB.canEdit(getScope());
    }

    return getScope() === "my";
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${BTN_ID} {
        width: 100%;
        border: 0;
        border-radius: 16px;
        padding: 13px 16px;
        margin: 10px 0;
        background: linear-gradient(135deg, #111827, #2563eb);
        color: #fff;
        font-size: 15px;
        font-weight: 900;
        box-shadow: 0 8px 22px rgba(37,99,235,.22);
        cursor: pointer;
      }

      #${MODAL_ID} {
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: rgba(17,24,39,.62);
        display: none;
        align-items: center;
        justify-content: center;
        padding: 14px;
      }

      #${MODAL_ID}.show {
        display: flex;
      }

      .ep-db-v68-card {
        width: min(760px, 100%);
        height: min(88dvh, 900px);
        background: #fff;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 18px 60px rgba(0,0,0,.32);
        display: flex;
        flex-direction: column;
      }

      .ep-db-v68-head {
        padding: 14px 16px;
        background: #111827;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .ep-db-v68-title {
        font-size: 17px;
        font-weight: 900;
      }

      .ep-db-v68-subtitle {
        font-size: 12px;
        opacity: .75;
        margin-top: 3px;
      }

      .ep-db-v68-close {
        border: 0;
        border-radius: 12px;
        padding: 9px 12px;
        font-weight: 900;
        background: #ef4444;
        color: #fff;
      }

      .ep-db-v68-tabs {
        padding: 10px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        background: #f3f4f6;
      }

      .ep-db-v68-tab {
        border: 0;
        border-radius: 14px;
        padding: 12px;
        font-weight: 900;
        background: #fff;
        color: #4f46e5;
      }

      .ep-db-v68-tab.active {
        background: #4f46e5;
        color: #fff;
      }

      .ep-db-v68-body {
        flex: 1;
        overflow: auto;
        padding: 12px;
        background: #f9fafb;
      }

      .ep-db-v68-cat {
        margin-bottom: 10px;
        border-radius: 18px;
        overflow: hidden;
        background: #fff;
        border: 1px solid rgba(17,24,39,.08);
      }

      .ep-db-v68-cat-head {
        width: 100%;
        border: 0;
        background: #eef2ff;
        padding: 14px;
        text-align: left;
        font-size: 16px;
        font-weight: 900;
        color: #3730a3;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .ep-db-v68-sub {
        padding: 10px 12px;
        border-top: 1px solid rgba(17,24,39,.08);
      }

      .ep-db-v68-sub-title {
        font-weight: 900;
        color: #111827;
        margin: 4px 0 8px;
      }

      .ep-db-v68-item {
        display: grid;
        grid-template-columns: 1fr 92px 78px;
        gap: 8px;
        align-items: center;
        padding: 9px 0;
        border-top: 1px solid rgba(17,24,39,.06);
      }

      .ep-db-v68-name {
        font-size: 13px;
        font-weight: 800;
        color: #1f2937;
      }

      .ep-db-v68-meta {
        font-size: 11px;
        color: #6b7280;
        margin-top: 2px;
      }

      .ep-db-v68-price,
      .ep-db-v68-unit {
        width: 100%;
        border: 1px solid #d1d5db;
        border-radius: 12px;
        padding: 9px 8px;
        font-size: 13px;
        font-weight: 800;
        background: #fff;
      }

      .ep-db-v68-price:disabled,
      .ep-db-v68-unit:disabled {
        background: #f3f4f6;
        opacity: .65;
      }
    `;

    document.head.appendChild(style);
  }

  function findDbEditorBlock() {
    const blocks = Array.from(document.querySelectorAll("section, article, aside, main, div"))
      .filter((el) => {
        const t = lower(el);
        return (
          t.includes("база данных") &&
          (t.includes("моя база") || t.includes("база сервера")) &&
          t.includes("материалы") &&
          t.includes("работы")
        );
      })
      .sort((a, b) => {
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        return (ar.width * ar.height) - (br.width * br.height);
      });

    return blocks[0] || null;
  }

  function mountOpenButton() {
    ensureStyle();

    let btn = document.getElementById(BTN_ID);

    if (!btn) {
      btn = document.createElement("button");
      btn.id = BTN_ID;
      btn.type = "button";
      btn.textContent = "🧪 Открыть базу V68 без зависаний";
      btn.addEventListener("click", openModal);
    }

    const block = findDbEditorBlock();

    if (block && !block.contains(btn)) {
      const tabArea = Array.from(block.querySelectorAll("button"))
        .find((b) => lower(b).includes("материалы"));

      if (tabArea && tabArea.parentElement) {
        tabArea.parentElement.insertAdjacentElement("afterend", btn);
      } else {
        block.insertBefore(btn, block.firstChild ? block.firstChild.nextSibling : null);
      }
    }
  }

  function ensureModal() {
    ensureStyle();

    let modal = document.getElementById(MODAL_ID);

    if (!modal) {
      modal = document.createElement("div");
      modal.id = MODAL_ID;
      modal.innerHTML = `
        <div class="ep-db-v68-card">
          <div class="ep-db-v68-head">
            <div>
              <div class="ep-db-v68-title">🧪 База V68</div>
              <div class="ep-db-v68-subtitle">Lazy-render: категории не зависают</div>
            </div>
            <button type="button" class="ep-db-v68-close">Закрыть</button>
          </div>

          <div class="ep-db-v68-tabs">
            <button type="button" class="ep-db-v68-tab active" data-type="mat">Материалы</button>
            <button type="button" class="ep-db-v68-tab" data-type="work">Работы</button>
          </div>

          <div class="ep-db-v68-body"></div>
        </div>
      `;

      modal.querySelector(".ep-db-v68-close").addEventListener("click", closeModal);

      modal.querySelectorAll(".ep-db-v68-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          modal.querySelectorAll(".ep-db-v68-tab").forEach((x) => x.classList.remove("active"));
          tab.classList.add("active");
          renderCategories(tab.dataset.type);
        });
      });

      document.body.appendChild(modal);
    }

    return modal;
  }

  function openModal() {
    const modal = ensureModal();
    modal.classList.add("show");
    renderCategories(getActiveTab());
  }

  function closeModal() {
    const modal = document.getElementById(MODAL_ID);
    if (modal) modal.classList.remove("show");
  }

  function getActiveTab() {
    const modal = ensureModal();
    const active = modal.querySelector(".ep-db-v68-tab.active");
    return active ? active.dataset.type : "mat";
  }

  function groupByCategory(items) {
    const result = new Map();

    items.forEach((item) => {
      const cat = itemCat(item);
      const sub = itemSub(item);

      if (!result.has(cat)) result.set(cat, new Map());
      const subMap = result.get(cat);

      if (!subMap.has(sub)) subMap.set(sub, []);
      subMap.get(sub).push(item);
    });

    return result;
  }

  function renderCategories(type) {
    const modal = ensureModal();
    const body = modal.querySelector(".ep-db-v68-body");

    const items = getActive(type);
    const grouped = groupByCategory(items);

    body.innerHTML = "";

    const info = document.createElement("div");
    info.style.cssText = "margin:0 0 12px;padding:10px 12px;border-radius:14px;background:#fff;font-weight:900;color:#111827;";
    info.textContent = `${getScopeTitle()} · ${type === "work" ? "Работы" : "Материалы"} · позиций: ${items.length}`;
    body.appendChild(info);

    Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b, "ru")).forEach((cat) => {
      const subMap = grouped.get(cat);
      const count = Array.from(subMap.values()).reduce((sum, list) => sum + list.length, 0);

      const box = document.createElement("div");
      box.className = "ep-db-v68-cat";

      const head = document.createElement("button");
      head.type = "button";
      head.className = "ep-db-v68-cat-head";
      head.innerHTML = `<span>${cat}</span><span>${count}</span>`;

      const content = document.createElement("div");
      content.hidden = true;

      head.addEventListener("click", () => {
        if (content.hidden) {
          content.hidden = false;
          if (!content.dataset.rendered) {
            renderCategoryContent(content, type, subMap);
            content.dataset.rendered = "1";
          }
        } else {
          content.hidden = true;
        }
      });

      box.appendChild(head);
      box.appendChild(content);
      body.appendChild(box);
    });
  }

  function renderCategoryContent(content, type, subMap) {
    content.innerHTML = "";

    Array.from(subMap.keys()).sort((a, b) => a.localeCompare(b, "ru")).forEach((sub) => {
      const wrap = document.createElement("div");
      wrap.className = "ep-db-v68-sub";

      const title = document.createElement("div");
      title.className = "ep-db-v68-sub-title";
      title.textContent = sub;

      wrap.appendChild(title);

      subMap.get(sub).forEach((item, index) => {
        wrap.appendChild(renderItem(type, item, index));
      });

      content.appendChild(wrap);
    });
  }

  function renderItem(type, item, index) {
    const row = document.createElement("div");
    row.className = "ep-db-v68-item";

    const name = document.createElement("div");
    name.innerHTML = `
      <div class="ep-db-v68-name">${escapeHtml(itemName(item))}</div>
      <div class="ep-db-v68-meta">${escapeHtml(itemCat(item))} · ${escapeHtml(itemSub(item))}</div>
    `;

    const price = document.createElement("input");
    price.className = "ep-db-v68-price";
    price.type = "number";
    price.value = itemPrice(item);
    price.disabled = !canEdit();

    const unit = document.createElement("select");
    unit.className = "ep-db-v68-unit";
    ["ед", "м.п", "м", "упк", "шт"].forEach((u) => {
      const opt = document.createElement("option");
      opt.value = u;
      opt.textContent = u;
      unit.appendChild(opt);
    });

    unit.value = itemUnit(item);
    unit.disabled = !canEdit();

    function save() {
      item.price = Number(price.value || 0);
      item.unit = unit.value;

      if (window.EP_DB && typeof window.EP_DB.updateItem === "function" && item.id) {
        try {
          window.EP_DB.updateItem(type, item.id, {
            price: item.price,
            unit: item.unit
          });
        } catch (e) {
          console.warn(e);
        }
      }
    }

    price.addEventListener("change", save);
    unit.addEventListener("change", save);

    row.appendChild(name);
    row.appendChild(price);
    row.appendChild(unit);

    return row;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function boot() {
    mountOpenButton();

    let ticks = 0;
    const timer = setInterval(() => {
      mountOpenButton();
      ticks += 1;
      if (ticks > 20) clearInterval(timer);
    }, 500);

    const observer = new MutationObserver(() => {
      mountOpenButton();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"]
    });

    console.log("04-database-lazy-render-v68.js", VERSION, "loaded");
  }

  window.EP_DB_V68 = {
    version: VERSION,
    open: openModal,
    close: closeModal,
    renderCategories
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
