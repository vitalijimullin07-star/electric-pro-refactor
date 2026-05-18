/*
 * Electric PRO Refactor
 * V70 Hide Old Broken Mass Management
 *
 * Старый блок "Массовое управление V21" больше не используем.
 * Он даёт пустые категории/подкатегории и подвисания.
 */

(function () {
  "use strict";

  const VERSION = "V70_HIDE_OLD_MASS_MANAGEMENT";
  const STYLE_ID = "ep-db-v70-style";

  function text(el) {
    return String((el && el.textContent) || "").replace(/\s+/g, " ").trim();
  }

  function lower(el) {
    return text(el).toLowerCase();
  }

  function isVisible(el) {
    if (!el || !el.getBoundingClientRect) return false;

    const st = window.getComputedStyle(el);
    if (st.display === "none" || st.visibility === "hidden") return false;

    const r = el.getBoundingClientRect();

    return r.width > 8 && r.height > 8;
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .ep-db-v70-old-hidden {
        display: none !important;
      }

      .ep-db-v70-open-new {
        width: 100%;
        border: 0;
        border-radius: 18px;
        padding: 14px 16px;
        margin: 12px 0;
        background: linear-gradient(135deg, #059669, #2563eb);
        color: #fff;
        font-size: 15px;
        font-weight: 900;
        box-shadow: 0 8px 24px rgba(37,99,235,.22);
      }

      .ep-db-v70-note {
        margin: 10px 0;
        padding: 10px 12px;
        border-radius: 14px;
        background: rgba(16,185,129,.12);
        color: #065f46;
        font-size: 12px;
        font-weight: 800;
      }
    `;

    document.head.appendChild(style);
  }

  function findOldMassBlocks() {
    return Array.from(document.querySelectorAll("section, article, aside, main, div"))
      .filter(isVisible)
      .filter((el) => {
        const t = lower(el);

        return (
          t.includes("массовое управление v21") ||
          (
            t.includes("массовое управление") &&
            t.includes("галочки") &&
            t.includes("категория") &&
            t.includes("подкатегория") &&
            t.includes("переместить")
          )
        );
      })
      .sort((a, b) => {
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        return (ar.width * ar.height) - (br.width * br.height);
      });
  }

  function findDbBlock() {
    return Array.from(document.querySelectorAll("section, article, aside, main, div"))
      .filter(isVisible)
      .filter((el) => {
        const t = lower(el);

        return (
          t.includes("база сервера") &&
          t.includes("материалы") &&
          t.includes("работы")
        );
      })
      .sort((a, b) => {
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        return (ar.width * ar.height) - (br.width * br.height);
      })[0] || null;
  }

  function openNewDb() {
    if (window.EP_DB_V68 && typeof window.EP_DB_V68.open === "function") {
      window.EP_DB_V68.open();
      return;
    }

    alert("Новая база V68 ещё не загрузилась. Обнови страницу.");
  }

  function mountNewButton(afterEl) {
    if (!afterEl || !afterEl.parentElement) return;

    let wrap = document.getElementById("ep-db-v70-new-entry");

    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "ep-db-v70-new-entry";
      wrap.innerHTML = `
        <button type="button" class="ep-db-v70-open-new">
          ✅ Открыть новую базу V68/V69
        </button>
        <div class="ep-db-v70-note">
          Старое массовое управление V21 отключено, потому что оно давало пустые категории и зависания.
        </div>
      `;

      wrap.querySelector("button").addEventListener("click", openNewDb);
    }

    if (!wrap.parentElement) {
      afterEl.parentElement.insertBefore(wrap, afterEl);
    }
  }

  function run() {
    ensureStyle();

    const oldBlocks = findOldMassBlocks();

    oldBlocks.forEach((block, index) => {
      if (index === 0) {
        mountNewButton(block);
      }

      block.classList.add("ep-db-v70-old-hidden");
      block.setAttribute("data-ep-v70-hidden", "1");
    });

    // Если старый блок уже не найден, всё равно покажем кнопку новой базы внутри блока БД.
    if (!oldBlocks.length) {
      const db = findDbBlock();

      if (db && !document.getElementById("ep-db-v70-new-entry")) {
        const wrap = document.createElement("div");
        wrap.id = "ep-db-v70-new-entry";
        wrap.innerHTML = `
          <button type="button" class="ep-db-v70-open-new">
            ✅ Открыть новую базу V68/V69
          </button>
        `;

        wrap.querySelector("button").addEventListener("click", openNewDb);
        db.insertBefore(wrap, db.firstChild ? db.firstChild.nextSibling : null);
      }
    }
  }

  function boot() {
    run();

    let ticks = 0;

    const timer = setInterval(() => {
      run();
      ticks += 1;
      if (ticks > 30) clearInterval(timer);
    }, 400);

    const observer = new MutationObserver(run);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"]
    });

    document.addEventListener("click", () => {
      setTimeout(run, 80);
      setTimeout(run, 250);
    }, true);

    console.log("04-database-v70-hide-old-mass.js", VERSION, "loaded");
  }

  window.EP_DB_V70 = {
    version: VERSION,
    run,
    openNewDb
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
