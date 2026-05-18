/*
 * Electric PRO Refactor
 * V90 Database Core Empty
 */

(function(){
  "use strict";

  const VERSION = "V90_DATABASE_CORE_EMPTY";
  const STATE_KEY = "EP_DB_STATE_V90";
  const RESET_FLAG = "EP_DB_NUCLEAR_RESET_V90_DONE";

  const exactKeys = new Set([
    "matDB",
    "workDB",
    "userMatDB",
    "userWorkDB",
    "EP_MY_MAT",
    "EP_MY_WORK",
    "EP_GLOBAL_MAT",
    "EP_GLOBAL_WORK",
    "ep_db_my_materials_v67",
    "ep_db_my_works_v67",
    "ep_db_my_materials_v79",
    "ep_db_my_works_v79",
    "ep_my_db_materials_v83",
    "ep_my_db_works_v83",
    "ep_server_db_materials_v88",
    "ep_server_db_works_v88",
    "ep_server_materials_v88",
    "ep_server_works_v88",
    "ep_db_custom_categories_v72",
    "ep_my_db_categories_v83",
    "ep_db_proposals_v67",
    "ep_db_proposals_v89",
    "ep_active_db_scope_v60",
    "ep_active_db_scope_v67",
    "ep_db_scope"
  ]);

  const patterns = [
    "ep_db",
    "ep_my_db",
    "ep_server_db",
    "ep_server_material",
    "ep_server_work",
    "db_proposal",
    "global_db",
    "user_db",
    "matdb",
    "workdb",
    "usermatdb",
    "userworkdb",
    "ep_my_mat",
    "ep_my_work",
    "ep_global_mat",
    "ep_global_work",
    "materials_v",
    "works_v",
    "database_v",
    "db_material",
    "db_work"
  ];

  const exclude = [
    "estimate",
    "smeta",
    "customer",
    "client",
    "settings",
    "profile",
    "auth",
    "firebase",
    "token",
    "theme",
    "color",
    "visual",
    "shield",
    "pdf",
    "document",
    "accounting"
  ];

  function emptyState(){
    return {
      version: "V90_EMPTY_CORE",
      activeScope: "my",
      role: "master",
      server: { materials: [], works: [] },
      my: { materials: [], works: [] },
      proposals: [],
      resetAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  function shouldDeleteKey(key){
    const raw = String(key || "");
    const k = raw.toLowerCase();

    if(exactKeys.has(raw)) return true;
    if(exclude.some(x => k.includes(x))) return false;

    return patterns.some(x => k.includes(x));
  }

  function readState(){
    try{
      return JSON.parse(localStorage.getItem(STATE_KEY)) || emptyState();
    }catch(e){
      return emptyState();
    }
  }

  function saveState(state){
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    window.EP_DB_STATE = state;
    window.EP_DB_STATE_V90 = state;
    return state;
  }

  function hardResetOnce(){
    try{
      if(localStorage.getItem(RESET_FLAG) === VERSION) return;

      const keys = [];
      for(let i = 0; i < localStorage.length; i++){
        keys.push(localStorage.key(i));
      }

      let removed = 0;

      keys.forEach(key => {
        if(shouldDeleteKey(key)){
          localStorage.removeItem(key);
          removed++;
        }
      });

      saveState(emptyState());
      localStorage.setItem(RESET_FLAG, VERSION);
      localStorage.setItem("EP_DB_FULL_RESET_V90_AT", String(Date.now()));

      console.log("V90 database nuclear reset complete. Removed keys:", removed);
    }catch(e){
      console.warn("V90 reset error:", e);
    }
  }

  function applyEmptyGlobals(){
    const state = readState();

    window.EP_DB_STATE = state;
    window.EP_DB_STATE_V90 = state;

    window.matDB = [];
    window.workDB = [];
    window.userMatDB = [];
    window.userWorkDB = [];

    window.EP_MY_MAT = [];
    window.EP_MY_WORK = [];
    window.EP_GLOBAL_MAT = [];
    window.EP_GLOBAL_WORK = [];

    window.EP_DB = window.EP_DB || {};

    window.EP_DB.getState = function(){
      return readState();
    };

    window.EP_DB.saveState = function(next){
      const current = readState();
      const state = Object.assign(current, next || {});
      state.updatedAt = Date.now();
      return saveState(state);
    };

    window.EP_DB.getScope = function(){
      return readState().activeScope || "my";
    };

    window.EP_DB.setScope = function(scope){
      const state = readState();
      state.activeScope = scope === "server" ? "server" : "my";
      state.updatedAt = Date.now();
      saveState(state);
      return state.activeScope;
    };

    window.EP_DB.getActiveStore = function(type){
      const state = readState();
      const scope = state.activeScope === "server" ? "server" : "my";
      const kind = String(type || "").toLowerCase().includes("work") ? "works" : "materials";
      return state[scope][kind] || [];
    };
  }

  function openNewDatabase(){
    location.href = "database-v90.html?v=v90-empty-core";
  }

  function routeOldDatabaseClicks(){
    document.addEventListener("click", function(e){
      const target = e.target && e.target.closest ? e.target.closest("button,a,div") : null;
      if(!target) return;

      const t = String(target.innerText || target.textContent || "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

      if(t === "база данных" || t.includes("открыть новую базу") || t.includes("база сервера") || t.includes("моя база")){
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        openNewDatabase();
      }
    }, true);
  }

  function boot(){
    hardResetOnce();
    applyEmptyGlobals();
    routeOldDatabaseClicks();

    console.log("04-database-core-v90.js", VERSION, "loaded");
  }

  window.EP_DB_V90 = {
    version: VERSION,
    hardResetOnce,
    applyEmptyGlobals,
    openNewDatabase,
    getState: readState
  };

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", boot);
  }else{
    boot();
  }
})();
