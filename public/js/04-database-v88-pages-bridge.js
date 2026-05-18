(function () {
  "use strict";

  const VERSION = "V88_PAGES_BRIDGE";

  function arr(v){ return Array.isArray(v) ? v : []; }

  function writeJson(key,value){
    try{ localStorage.setItem(key, JSON.stringify(value)); }catch(e){}
  }

  function readJson(key,fallback){
    try{
      const raw=localStorage.getItem(key);
      if(!raw) return fallback;
      return JSON.parse(raw) ?? fallback;
    }catch(e){return fallback}
  }

  function text(el){
    return String((el && (el.innerText || el.textContent)) || "").replace(/\s+/g," ").trim();
  }

  function low(el){ return text(el).toLowerCase(); }

  function visible(el){
    if(!el || !el.getBoundingClientRect) return false;
    const st = getComputedStyle(el);
    if(st.display === "none" || st.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    return r.width > 4 && r.height > 4;
  }

  function normalizeItem(x,type){
    x = x && typeof x === "object" ? {...x} : {};
    const name = String(x.name || x.title || x.label || x["Наименование"] || "").trim();
    const price = Number(String(x.price ?? x.cost ?? x.amount ?? x["Цена"] ?? 0).replace(",", ".")) || 0;
    const unit = String(x.unit || x.measure || x.uom || x["Ед"] || "шт").trim() || "шт";
    const category = String(x.category || x.cat || x.group || x.section || "Другое").trim() || "Другое";
    const subcategory = String(x.subcategory || x.subcat || x.sub || x.kind || x.folder || "Без подкатегории").trim() || "Без подкатегории";
    if(!x.id) x.id = "srv_" + type + "_" + Date.now() + "_" + Math.random().toString(16).slice(2);
    return {...x,id:String(x.id),dbType:type,name,price,unit,category,subcategory};
  }

  function getServerMaterials(){
    const a = arr(window.EP_GLOBAL_MAT);
    if(a.length) return a;
    return arr(window.matDB);
  }

  function getServerWorks(){
    const a = arr(window.EP_GLOBAL_WORK);
    if(a.length) return a;
    return arr(window.workDB);
  }

  function syncServerToStorage(){
    const mats = getServerMaterials().map((x)=>normalizeItem(x,"material")).filter((x)=>x.name);
    const works = getServerWorks().map((x)=>normalizeItem(x,"work")).filter((x)=>x.name);

    if(mats.length){
      writeJson("ep_server_db_materials_v88", mats);
      writeJson("ep_server_materials_v88", mats);
    }

    if(works.length){
      writeJson("ep_server_db_works_v88", works);
      writeJson("ep_server_works_v88", works);
    }

    return {materials:mats.length, works:works.length};
  }

  function syncMyToLegacy(){
    const mats = arr(readJson("ep_my_db_materials_v83", []));
    const works = arr(readJson("ep_my_db_works_v83", []));

    writeJson("ep_db_my_materials_v67", mats);
    writeJson("ep_db_my_works_v67", works);
    writeJson("userMatDB", mats);
    writeJson("userWorkDB", works);
    writeJson("EP_MY_MAT", mats);
    writeJson("EP_MY_WORK", works);

    window.EP_MY_MAT = mats;
    window.EP_MY_WORK = works;
    window.userMatDB = mats;
    window.userWorkDB = works;

    try{
      const scope = window.EP_DB && window.EP_DB.getScope ? window.EP_DB.getScope() : "";
      if(scope === "my"){
        window.matDB = mats;
        window.workDB = works;
      }
    }catch(e){}
  }

  function openServerPage(){
    try{
      if(window.EP_DB && window.EP_DB.setScope) window.EP_DB.setScope("server");
      else if(window.epSetDbScope) window.epSetDbScope("global");
    }catch(e){}

    setTimeout(()=>{
      syncServerToStorage();
      location.href = "server-database.html?v=v88-server-database-page";
    }, 350);
  }

  function openMyPage(){
    syncMyToLegacy();
    location.href = "my-database.html?v=v88-my-database-page";
  }

  function addPanel(){
    if(document.getElementById("ep-v88-db-pages-panel")) return;

    const buttons = Array.from(document.querySelectorAll("button")).filter(visible);
    const serverBtn = buttons.find((b)=>low(b).includes("база сервера"));
    const myBtn = buttons.find((b)=>low(b).includes("моя база"));
    const anchor = serverBtn || myBtn;
    if(!anchor || !anchor.parentElement) return;

    const panel = document.createElement("div");
    panel.id = "ep-v88-db-pages-panel";
    panel.style.cssText = "margin:10px 0;padding:10px;border-radius:16px;background:#ecfdf5;border:1px solid rgba(16,185,129,.25);display:grid;gap:8px;";
    panel.innerHTML = `
      <button type="button" data-v88="server" style="border:0;border-radius:14px;padding:13px;background:#059669;color:#fff;font-weight:900;">🌍 Открыть базу сервера V88</button>
      <button type="button" data-v88="my" style="border:0;border-radius:14px;padding:13px;background:#2563eb;color:#fff;font-weight:900;">📁 Открыть мою базу</button>
      <div style="font-size:12px;font-weight:800;color:#065f46;">Новая логика: сервер = витрина, моя база = редактор.</div>
    `;

    panel.querySelector('[data-v88="server"]').onclick = openServerPage;
    panel.querySelector('[data-v88="my"]').onclick = openMyPage;

    anchor.parentElement.insertAdjacentElement("afterend", panel);
  }

  function tryReturnToDatabase(){
    if(sessionStorage.getItem("ep_return_to_database_v88") !== "1") return;
    sessionStorage.removeItem("ep_return_to_database_v88");

    let tries = 0;
    const timer = setInterval(()=>{
      tries++;
      const target = Array.from(document.querySelectorAll("button,a,div"))
        .filter(visible)
        .find((el)=>low(el).includes("база данных"));

      if(target){
        target.click();
        clearInterval(timer);
        return;
      }

      if(tries > 20) clearInterval(timer);
    },300);
  }

  function boot(){
    syncMyToLegacy();

    let ticks = 0;
    const timer = setInterval(()=>{
      syncServerToStorage();
      addPanel();
      ticks++;
      if(ticks > 20) clearInterval(timer);
    },500);

    document.addEventListener("click", ()=>{
      setTimeout(syncServerToStorage,200);
      setTimeout(syncMyToLegacy,250);
      setTimeout(addPanel,300);
    }, true);

    tryReturnToDatabase();

    console.log("04-database-v88-pages-bridge.js", VERSION, "loaded");
  }

  window.EP_DB_V88 = {
    version: VERSION,
    syncServerToStorage,
    syncMyToLegacy,
    openServerPage,
    openMyPage
  };

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
