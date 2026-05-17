/*
 * Electric PRO Refactor
 * Module: 06-single-line-scheme.js
 * V56: exact button placement under visible "Ручная сборка".
 */

(function () {
  "use strict";

  const VERSION = "V56_EXACT_UNDER_MANUAL_BUILD";
  const STYLE_ID = "ep-v56-scheme-button-style";
  const ROW_ID = "ep-v56-scheme-row";
  const BTN_ID = "ep-v56-scheme-btn";

  const OLD_SELECTORS = [
    "#ep-v55-scheme-row",
    "#ep-v54-scheme-row",
    "#ep-v53-scheme-row",
    "#ep-single-line-launcher",
    "#ep-scheme-inside-shield",
    "#ep-sl-shield-host",
    "#ep-scheme-shield-row-v50",
    "#ep-scheme-shield-row-v51",
    "#ep-tree-scheme-inline-body-v52",
    "#ep-tree-scheme-modal-v51",
    "#ep-single-line-modal"
  ].join(",");

  function norm(text) {
    return String(text || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      ${OLD_SELECTORS} {
        display: none !important;
      }

      #${ROW_ID} {
        width: 100% !important;
        flex: 0 0 100% !important;
        display: block !important;
        margin: 10px 0 14px !important;
        padding: 0 !important;
        box-sizing: border-box !important;
      }

      #${BTN_ID} {
        width: 100% !important;
        min-height: 58px !important;
        border: 0 !important;
        border-radius: 18px !important;
        padding: 14px 16px !important;
        background: linear-gradient(135deg, #4f46e5, #2563eb, #0891b2) !important;
        color: #fff !important;
        font-size: 16px !important;
        font-weight: 900 !important;
        box-shadow: 0 10px 25px rgba(37,99,235,.30) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 8px !important;
        cursor: pointer !important;
      }

      #${BTN_ID}:active {
        transform: scale(.985);
      }

      #${BTN_ID} small {
        font-size: 12px !important;
        font-weight: 800 !important;
        opacity: .86 !important;
      }
    `;

    document.head.appendChild(style);
  }

  function removeOldButtons() {
    document.querySelectorAll(OLD_SELECTORS).forEach((el) => el.remove());

    document.querySelectorAll("#" + ROW_ID).forEach((el, index) => {
      if (index > 0) el.remove();
    });
  }

  function isVisible(el) {
    if (!el || !el.getBoundingClientRect) return false;

    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) {
      return false;
    }

    const r = el.getBoundingClientRect();

    return (
      r.width > 20 &&
      r.height > 20 &&
      r.bottom > 0 &&
      r.right > 0 &&
      r.top < window.innerHeight &&
      r.left < window.innerWidth
    );
  }

  function isOnTop(el) {
    if (!isVisible(el)) return false;

    const r = el.getBoundingClientRect();

    const points = [
      [r.left + r.width / 2, r.top + r.height / 2],
      [r.left + 20, r.top + r.height / 2],
      [r.right - 20, r.top + r.height / 2]
    ];

    return points.some(([x, y]) => {
      if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) return false;

      const stack = document.elementsFromPoint(x, y);

      return stack.some((topEl) => {
        return topEl === el || el.contains(topEl) || (topEl.closest && topEl.closest("button") === el);
      });
    });
  }

  function findVisibleManualBuildButton() {
    const buttons = Array.from(document.querySelectorAll("button"));

    const candidates = buttons
      .filter((btn) => norm(btn.textContent).includes("ручная сборка"))
      .filter(isVisible)
      .map((btn) => {
        const r = btn.getBoundingClientRect();
        let score = 0;

        if (isOnTop(btn)) score += 1000;
        if (r.left >= 0 && r.left < window.innerWidth * 0.75) score += 100;
        if (r.top > 0 && r.top < window.innerHeight) score += 100;
        if (r.width > 250) score += 50;

        const parentText = norm(btn.parentElement ? btn.parentElement.textContent : "");
        if (parentText.includes("сборка щита")) score += 50;

        return { btn, score, top: r.top, left: r.left };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.top !== b.top) return a.top - b.top;
        return a.left - b.left;
      });

    return candidates.length ? candidates[0].btn : null;
  }

  function createRow() {
    let row = document.getElementById(ROW_ID);
    if (row) return row;

    row = document.createElement("div");
    row.id = ROW_ID;
    row.innerHTML = `
      <button type="button" id="${BTN_ID}">
        <span>📐 Схема щита</span>
        <small>открыть</small>
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
      console.warn("Не удалось подготовить дерево щита для схемы", e);
    }

    window.location.href = "scheme.html?v=v56";
  }

  function mountButton() {
    ensureStyle();
    removeOldButtons();

    const manualBtn = findVisibleManualBuildButton();
    if (!manualBtn) return false;

    const row = createRow();

    if (row.previousElementSibling !== manualBtn) {
      manualBtn.insertAdjacentElement("afterend", row);
    }

    const btn = document.getElementById(BTN_ID);
    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = "1";
      btn.addEventListener("click", openSchemeScreen);
    }

    return true;
  }

  function boot() {
    ensureStyle();

    let ticks = 0;
    const timer = setInterval(() => {
      mountButton();
      ticks += 1;
      if (ticks > 20) clearInterval(timer);
    }, 250);

    document.addEventListener("click", () => {
      setTimeout(mountButton, 80);
      setTimeout(mountButton, 250);
      setTimeout(mountButton, 600);
    }, true);

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
