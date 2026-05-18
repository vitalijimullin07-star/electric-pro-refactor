(function(){
  "use strict";

  const VERSION = "V92_OLD_DB_LINKS_ROUTER";

  function openDatabase(){
    location.href = "database-v92.html?v=v92-main-restored";
  }

  function patchOldFunctions(){
    [
      "renderDbEditors",
      "openDatabaseEditor",
      "showDatabaseEditor",
      "openDbEditor",
      "showDbEditor",
      "renderDatabaseEditor",
      "openMatCatalog",
      "openWorkCatalog",
      "epReloadActiveDbV7",
      "epSaveActiveDbV7"
    ].forEach((name) => {
      try { window[name] = openDatabase; } catch(e) {}
    });

    try {
      window.epSetDbScope = function(scope){
        if (window.EP_DB && window.EP_DB.setScope) {
          return window.EP_DB.setScope(scope === "global" ? "server" : scope);
        }
        return "my";
      };
    } catch(e) {}
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

  function removeOldDbBadges(){
    Array.from(document.querySelectorAll("div,span,button"))
      .filter(visible)
      .forEach((el) => {
        const t = low(el);
        if (
          t.includes("v17 активна") ||
          t.includes("v21 активна") ||
          t.includes("массовое управление v21")
        ) {
          el.remove();
        }
      });
  }

  function routeClicks(){
    document.addEventListener("click", function(e){
      const target = e.target && e.target.closest ? e.target.closest("button,a") : null;
      if (!target) return;

      const t = low(target);
      const oldOnclick = String(target.getAttribute("onclick") || "");

      const isOldDb =
        oldOnclick.includes("openMatCatalog") ||
        oldOnclick.includes("openWorkCatalog") ||
        oldOnclick.includes("renderDbEditors") ||
        t === "база данных" ||
        t.includes("база данных") ||
        t.includes("открыть новую базу");

      if (!isOldDb) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      openDatabase();
    }, true);
  }

  function boot(){
    patchOldFunctions();
    routeClicks();
    removeOldDbBadges();

    let ticks = 0;
    const timer = setInterval(() => {
      patchOldFunctions();
      removeOldDbBadges();
      ticks++;
      if (ticks > 20) clearInterval(timer);
    }, 300);

    console.log("04-db-router-v92.js", VERSION, "loaded");
  }

  window.EP_DB_ROUTER_V92 = {
    version: VERSION,
    openDatabase,
    patchOldFunctions,
    removeOldDbBadges
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
