/*
 * Electric PRO Refactor
 * V90 Legacy Database UI Purge
 *
 * Убирает старые окна базы V17/V21 и отправляет в новую database-v90.html.
 */

(function(){
  "use strict";

  const VERSION = "V90_LEGACY_DATABASE_UI_PURGE";

  function openNewDatabase(){
    location.href = "database-v90.html?v=v90-no-legacy-ui";
  }

  function txt(el){
    return String((el && (el.innerText || el.textContent)) || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function low(el){
    return txt(el).toLowerCase();
  }

  function visible(el){
    if(!el || !el.getBoundingClientRect) return false;
    const st = getComputedStyle(el);
    if(st.display === "none" || st.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    return r.width > 4 && r.height > 4;
  }

  function isLegacyText(t){
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
      t.includes("позиции не найдены")
    );
  }

  function findDialogRoot(el){
    let cur = el;
    let best = el;

    for(let i = 0; i < 10 && cur; i++){
      const st = getComputedStyle(cur);
      const t = low(cur);

      if(isLegacyText(t)){
        best = cur;
      }

      if(
        st.position === "fixed" ||
        cur.getAttribute("role") === "dialog" ||
        String(cur.className || "").toLowerCase().includes("modal") ||
        String(cur.className || "").toLowerCase().includes("dialog")
      ){
        return cur;
      }

      cur = cur.parentElement;
    }

    return best;
  }

  function removeLegacyUi(){
    const nodes = Array.from(document.querySelectorAll("div,section,article,aside"))
      .filter(visible)
      .filter(el => isLegacyText(low(el)));

    nodes.forEach(el => {
      const root = findDialogRoot(el);

      if(root && root !== document.body && root !== document.documentElement){
        root.remove();
      }
    });

    Array.from(document.querySelectorAll("button,div,span"))
      .filter(visible)
      .forEach(el => {
        const t = low(el);
        if(t === "v17 активна" || t === "v21 активна" || t.includes("v17 активна") || t.includes("v21 активна")){
          el.remove();
        }
      });
  }

  function patchGlobals(){
    const names = [
      "renderDbEditors",
      "openDatabaseEditor",
      "showDatabaseEditor",
      "openDbEditor",
      "showDbEditor",
      "renderDatabaseEditor",
      "openMatCatalog",
      "openWorkCatalog"
    ];

    names.forEach(name => {
      try {
        window[name] = openNewDatabase;
      } catch(e) {}
    });
  }

  function routeClicks(){
    document.addEventListener("click", function(e){
      const target = e.target && e.target.closest ? e.target.closest("button,a,div") : null;
      if(!target) return;

      const t = low(target);

      if(
        t === "база данных" ||
        t.includes("база данных (редактор)") ||
        t.includes("массовое управление v21") ||
        t.includes("полный сброс баз данных") ||
        t.includes("открыть новую базу") ||
        t.includes("моя база") ||
        t.includes("база сервера")
      ){
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        openNewDatabase();
      }
    }, true);
  }

  function boot(){
    patchGlobals();
    routeClicks();
    removeLegacyUi();

    let ticks = 0;
    const timer = setInterval(() => {
      patchGlobals();
      removeLegacyUi();
      ticks++;
      if(ticks > 30) clearInterval(timer);
    }, 300);

    console.log("04-database-legacy-purge-v90.js", VERSION, "loaded");
  }

  window.EP_DB_LEGACY_PURGE_V90 = {
    version: VERSION,
    openNewDatabase,
    removeLegacyUi,
    patchGlobals
  };

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", boot);
  }else{
    boot();
  }
})();
