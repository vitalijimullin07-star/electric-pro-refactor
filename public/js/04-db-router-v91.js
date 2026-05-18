(function(){
  "use strict";

  const VERSION = "V91_OLD_DATABASE_LINKS_DETACHED";

  function openDatabase(){
    location.href = "database-v91.html?v=v91-clean-db-start";
  }

  function text(el){
    return String((el && (el.innerText || el.textContent)) || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function low(el){
    return text(el).toLowerCase();
  }

  function visible(el){
    if (!el || !el.getBoundingClientRect) return false;
    const st = getComputedStyle(el);
    if (st.display === "none" || st.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    return r.width > 4 && r.height > 4;
  }

  function patchOldFunctions(){
    const oldNames = [
      "renderDbEditors",
      "openDatabaseEditor",
      "showDatabaseEditor",
      "openDbEditor",
      "showDbEditor",
      "renderDatabaseEditor",
      "openMatCatalog",
      "openWorkCatalog",
      "epSetDbScope",
      "epReloadActiveDbV7",
      "epSaveActiveDbV7"
    ];

    oldNames.forEach((name) => {
      try {
        window[name] = openDatabase;
      } catch(e) {}
    });
  }

  function isOldDbText(t){
    t = String(t || "").toLowerCase();

    return (
      t.includes("база данных (редактор)") ||
      t.includes("массовое управление v21") ||
      t.includes("v17 активна") ||
      t.includes("v21 активна") ||
      t.includes("чистая база / полный сброс") ||
      t.includes("полный сброс баз данных") ||
      t.includes("авто-разгруппир") ||
      t.includes("экспорт выбранн") ||
      t.includes("добавить в мою базу")
    );
  }

  function removeOldDbUi(){
    Array.from(document.querySelectorAll("div,section,article,aside"))
      .filter(visible)
      .filter((el) => isOldDbText(low(el)))
      .forEach((el) => {
        let root = el;
        let cur = el;

        for (let i = 0; i < 10 && cur; i++) {
          const st = getComputedStyle(cur);
          const cls = String(cur.className || "").toLowerCase();

          if (
            st.position === "fixed" ||
            cls.includes("modal") ||
            cls.includes("dialog") ||
            cur.getAttribute("role") === "dialog"
          ) {
            root = cur;
            break;
          }

          cur = cur.parentElement;
        }

        if (root && root !== document.body && root !== document.documentElement) {
          root.remove();
        }
      });

    Array.from(document.querySelectorAll("div,span,button"))
      .filter(visible)
      .forEach((el) => {
        const t = low(el);
        if (t.includes("v17 активна") || t.includes("v21 активна")) {
          el.remove();
        }
      });
  }

  function isDatabaseEntryClick(t){
    t = String(t || "").toLowerCase();

    return (
      t === "база данных" ||
      t.includes("база данных") ||
      t.includes("открыть новую базу") ||
      t.includes("база сервера") ||
      t.includes("моя база") ||
      t.includes("материалы") && t.length < 40 ||
      t.includes("работы") && t.length < 40
    );
  }

  function routeClicks(){
    document.addEventListener("click", function(e){
      const target = e.target && e.target.closest ? e.target.closest("button,a") : null;
      if (!target) return;

      const t = low(target);

      if (!isDatabaseEntryClick(t)) return;

      const oldOnclick = String(target.getAttribute("onclick") || "");
      const clearlyDb =
        oldOnclick.includes("openMatCatalog") ||
        oldOnclick.includes("openWorkCatalog") ||
        t.includes("база") ||
        t === "материалы" ||
        t === "работы" ||
        t.startsWith("+ материалы") ||
        t.startsWith("+ работа");

      if (!clearlyDb) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      openDatabase();
    }, true);
  }

  function boot(){
    patchOldFunctions();
    routeClicks();
    removeOldDbUi();

    let ticks = 0;
    const timer = setInterval(() => {
      patchOldFunctions();
      removeOldDbUi();
      ticks++;
      if (ticks > 20) clearInterval(timer);
    }, 300);

    console.log("04-db-router-v91.js", VERSION, "loaded");
  }

  window.EP_DB_ROUTER_V91 = {
    version: VERSION,
    openDatabase,
    patchOldFunctions,
    removeOldDbUi
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
