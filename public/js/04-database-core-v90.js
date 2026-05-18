(function(){
  "use strict";

  const VERSION = "V90_DATABASE_CORE_EMPTY_SAFE";
  const STATE_KEY = "EP_DB_STATE_V90";
  const RESET_FLAG = "EP_DB_NUCLEAR_RESET_V90_DONE_SAFE";

  function emptyState(){
    return {
      version: "V90_EMPTY_CORE",
      activeScope: "my",
      role: "master",
      server: { materials: [], works: [] },
      my: { materials: [], works: [] },
      proposals: [],
      updatedAt: Date.now()
    };
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

  function clearOldDatabaseKeysOnce(){
    try{
      if(localStorage.getItem(RESET_FLAG) === VERSION) return;

      const deleteWords = [
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

      const excludeWords = [
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

      const keys = [];
      for(let i = 0; i < localStorage.length; i++){
        keys.push(localStorage.key(i));
      }

      keys.forEach((key)=>{
        const k = String(key || "").toLowerCase();
        if(excludeWords.some((x)=>k.includes(x))) return;
        if(deleteWords.some((x)=>k.includes(x))){
          localStorage.removeItem(key);
        }
      });

      saveState(emptyState());
      localStorage.setItem(RESET_FLAG, VERSION);
      localStorage.setItem("EP_DB_FULL_RESET_V90_AT", String(Date.now()));
    }catch(e){
      console.warn("V90 clear old database keys error:", e);
    }
  }

  function applyGlobals(){
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

    window.EP_DB.getState = readState;

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
    location.href = "database-v90.html?v=v90-safe-clean";
  }

  function boot(){
    clearOldDatabaseKeysOnce();

    if(!localStorage.getItem(STATE_KEY)){
      saveState(emptyState());
    }

    applyGlobals();

    console.log("04-database-core-v90.js", VERSION, "loaded");
  }

  window.EP_DB_V90 = {
    version: VERSION,
    getState: readState,
    saveState,
    openNewDatabase,
    applyGlobals,
    clearOldDatabaseKeysOnce
  };

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", boot);
  }else{
    boot();
  }
})();
