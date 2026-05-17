/*
 * Electric PRO Refactor
 * Module: 06-single-line-scheme.js
 * V55: separate scheme screen.
 *
 * Схема живёт отдельным экраном:
 * - public/scheme.html
 * - кнопка в конфигураторе щита открывает этот экран
 * - дальше сюда добавим передачу schemeTree из конфигуратора
 */

(function () {
  "use strict";

  const VERSION = "V55_SCHEME_SCREEN";
  const STYLE_ID = "ep-v55-scheme-button-style";
  const ROW_ID = "ep-v55-scheme-row";
  const BTN_ID = "ep-v55-scheme-btn";

  function norm(text) {
    return String(text || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #ep-single-line-launcher,
      #ep-scheme-inside-shield,
      #ep-sl-shield-host,
      #ep-scheme-shield-row-v50,
      #ep-scheme-shield-row-v51,
      #ep-tree-scheme-inline-body-v52,
      #ep-tree-scheme-modal-v51,
      #ep-single-line-modal {
        display: none !important;
      }

      #${ROW_ID} {
        width: 100%;
        margin: 10px 0 14px;
      }

      #${BTN_ID} {
        width: 100%;
        border: 0;
        border-radius: 18px;
        padding: 14px 16px;
        background: linear-gradient(135deg, #4f46e5, #2563eb, #0891b2);
        color: #fff;
        font-size: 16px;
        font-weight: 900;
        box-shadow: 0 10px 25px rgba(37,99,235,.30);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
      }

      #${BTN_ID}:active {
        transform: scale(.985);
      }

      #${BTN_ID} small {
        font-size: 12px;
        font-weight: 800;
        opacity: .86;
      }
    `;

    document.head.appendChild(style);
  }

  function removeOldBad() {
    document.querySelectorAll(
      "#ep-single-line-launcher, #ep-scheme-inside-shield, #ep-sl-shield-host, #ep-scheme-shield-row-v50, #ep-scheme-shield-row-v51, #ep-tree-scheme-inline-body-v52, #ep-tree-scheme-modal-v51, #ep-single-line-modal"
    ).forEach((el) => el.remove());
  }

  function isVisible(el) {
    if (!el || !el.getBoundingClientRect) return false;
    const r = el.getBoundingClientRect();
    return r.width > 10 && r.height > 10 && r.bottom > 0 && r.top < window.innerHeight;
  }

  function findManualBuildButton() {
    return Array.from(document.querySelectorAll("button")).find((btn) => {
      return isVisible(btn) && norm(btn.textContent).includes("ручная сборка");
    }) || null;
  }

  function createButtonRow() {
    let row = document.getElementById(ROW_ID);
    if (row) return row;

    row = document.createElement("div");
    row.id = ROW_ID;
    row.innerHTML = `
      <button type="button" id="${BTN_ID}">
        <span>📐 Схема щита</span>
        <small>открыть экран</small>
      </button>
    `;

    return row;
  }

  function openSchemeScreen() {
    try {
      const treeBuilder =
        window.EP_BUILD_SCHEME_TREE_FROM_SHIELD ||
        window.epBuildSchemeTreeFromShield ||
        window.buildSchemeTreeFromShield;

      if (typeof treeBuilder === "function") {
        const tree = treeBuilder();
        if (tree) {
          localStorage.setItem("ep_pending_scheme_tree", JSON.stringify(tree));
        }
      }
    } catch (e) {
      console.warn("Не удалось подготовить данные щита для схемы", e);
    }

    window.location.href = "scheme.html?v=v55";
  }

  function mountButton() {
    ensureStyle();
    removeOldBad();

    const manualBtn = findManualBuildButton();
    if (!manualBtn) return false;

    const row = createButtonRow();

    if (!document.body.contains(row)) {
      const host = manualBtn.closest("div") || manualBtn.parentElement;
      host.insertAdjacentElement("afterend", row);
    }

    const btn = document.getElementById(BTN_ID);
    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = "1";
      btn.addEventListener("click", openSchemeScreen);
    }

    return true;
  }

  function boot() {
    mountButton();

    const observer = new MutationObserver(() => {
      mountButton();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"]
    });

    console.log("06-single-line-scheme.js", VERSION, "loaded");
  }

  window.EP_SINGLE_LINE_SCHEME = {
    version: VERSION,
    open: openSchemeScreen
  };

  window.openSingleLineScheme = openSchemeScreen;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
