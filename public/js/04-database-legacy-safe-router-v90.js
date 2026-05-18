(function(){
  "use strict";

  const VERSION = "V90_LEGACY_SAFE_ROUTER";

  function openNewDatabase(){
    location.href = "database-v90.html?v=v90-safe-clean";
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
    if(!el || !el.getBoundingClientRect) return false;
    const st = getComputedStyle(el);
    if(st.display === "none" || st.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    return r.width > 4 && r.height > 4;
  }

  function isOldDatabaseText(t){
    t = String(t || "").toLowerCase();
    return (
      t.includes("база данных (редактор)") ||
      t.includes("массовое управление v21") ||
      t.includes("v17 активна") ||
      t.includes("v21 активна") ||
      t.includes("чистая база / полный сброс") ||
      t.includes("полный сброс баз данных")
    );
  }

  function removeOldVisibleUi(){
    Array.from(document.querySelectorAll("div,section,article,aside"))
      .filter(visible)
      .filter((el)=>isOldDatabaseText(low(el)))
      .forEach((el)=>{
        let root = el;
        let cur = el;

        for(let i=0; i<8 && cur; i++){
          const st = getComputedStyle(cur);
          if(
            st.position === "fixed" ||
            String(cur.className || "").toLowerCase().includes("modal") ||
            cur.getAttribute("role") === "dialog"
          ){
            root = cur;
            break;
          }
          cur = cur.parentElement;
        }

        if(root && root !== document.body && root !== document.documentElement){
          root.remove();
        }
      });

    Array.from(document.querySelectorAll("div,span,button"))
      .filter(visible)
      .forEach((el)=>{
        const t = low(el);
        if(t.includes("v17 активна") || t.includes("v21 активна")){
          el.remove();
        }
      });
  }

  function patchOldFunctions(){
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

    names.forEach((name)=>{
      try{
        window[name] = openNewDatabase;
      }catch(e){}
    });
  }

  function routeClicks(){
    document.addEventListener("click", function(e){
      const target = e.target && e.target.closest ? e.target.closest("button,a,div") : null;
      if(!target) return;

      const t = low(target);

      if(
        t === "база данных" ||
        t.includes("открыть новую базу") ||
        t.includes("база данных (редактор)") ||
        t.includes("массовое управление v21") ||
        t.includes("полный сброс баз данных")
      ){
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        openNewDatabase();
      }
    }, true);
  }

  function boot(){
    patchOldFunctions();
    routeClicks();
    removeOldVisibleUi();

    let ticks = 0;
    const timer = setInterval(()=>{
      patchOldFunctions();
      removeOldVisibleUi();
      ticks++;
      if(ticks > 30) clearInterval(timer);
    }, 300);

    console.log("04-database-legacy-safe-router-v90.js", VERSION, "loaded");
  }

  window.EP_DB_LEGACY_SAFE_ROUTER_V90 = {
    version: VERSION,
    openNewDatabase,
    patchOldFunctions,
    removeOldVisibleUi
  };

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", boot);
  }else{
    boot();
  }
})();
