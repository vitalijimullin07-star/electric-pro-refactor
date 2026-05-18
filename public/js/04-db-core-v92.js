(function(){
  "use strict";

  const VERSION = "V92_CLEAN_DB_CORE";
  const STATE_KEY = "EP_DB_STATE_V92";
  const RESET_FLAG = "EP_DB_OLD_KEYS_REMOVED_V92";

  function emptyState(){
    return {
      version: VERSION,
      activeScope: "my",
      role: "master",
      server: { materials: [], works: [] },
      my: { materials: [], works: [] },
      proposals: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  function readState(){
    try {
      return JSON.parse(localStorage.getItem(STATE_KEY)) || emptyState();
    } catch(e) {
      return emptyState();
    }
  }

  function saveState(state){
    state.updatedAt = Date.now();
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    window.EP_DB_STATE_V92 = state;
    return state;
  }

  function clearOldDbKeysOnce(){
    try {
      if (localStorage.getItem(RESET_FLAG) === VERSION) return;

      const deleteWords = [
        "ep_db", "ep_my_db", "ep_server_db",
        "ep_server_material", "ep_server_work",
        "db_proposal", "global_db", "user_db",
        "matdb", "workdb", "usermatdb", "userworkdb",
        "ep_my_mat", "ep_my_work", "ep_global_mat", "ep_global_work",
        "materials_v", "works_v", "database_v", "db_material", "db_work"
      ];

      const excludeWords = [
        "estimate", "smeta", "customer", "client",
        "settings", "profile", "auth", "firebase", "token",
        "theme", "color", "visual", "shield", "pdf",
        "document", "accounting"
      ];

      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
      }

      let removed = 0;

      keys.forEach((key) => {
        const k = String(key || "").toLowerCase();
        if (excludeWords.some((x) => k.includes(x))) return;
        if (deleteWords.some((x) => k.includes(x))) {
          localStorage.removeItem(key);
          removed++;
        }
      });

      localStorage.setItem(STATE_KEY, JSON.stringify(emptyState()));
      localStorage.setItem(RESET_FLAG, VERSION);
      localStorage.setItem("EP_DB_CLEAN_START_V92_AT", String(Date.now()));

      console.log("V92 old DB keys removed:", removed);
    } catch(e) {
      console.warn("V92 clear old db keys error:", e);
    }
  }

  function applyGlobals(){
    const state = readState();

    window.EP_DB_STATE_V92 = state;

    window.matDB = [];
    window.workDB = [];
    window.userMatDB = [];
    window.userWorkDB = [];
    window.EP_MY_MAT = [];
    window.EP_MY_WORK = [];
    window.EP_GLOBAL_MAT = [];
    window.EP_GLOBAL_WORK = [];

    window.EP_DB = {
      version: VERSION,
      getState: readState,
      saveState: function(next){
        const current = readState();
        const merged = Object.assign({}, current, next || {});
        return saveState(merged);
      },
      getScope: function(){
        return readState().activeScope || "my";
      },
      setScope: function(scope){
        const state = readState();
        state.activeScope = scope === "server" ? "server" : "my";
        saveState(state);
        return state.activeScope;
      },
      getActiveStore: function(type){
        const state = readState();
        const scope = state.activeScope === "server" ? "server" : "my";
        const kind = String(type || "").toLowerCase().includes("work") ? "works" : "materials";
        return state[scope][kind] || [];
      }
    };
  }

  function openDatabase(){
    location.href = "database-v92.html?v=v92-main-restored";
  }

  function boot(){
    clearOldDbKeysOnce();

    if (!localStorage.getItem(STATE_KEY)) {
      saveState(emptyState());
    }

    applyGlobals();

    window.EP_DB_OPEN_V92 = openDatabase;

    console.log("04-db-core-v92.js", VERSION, "loaded");
  }

  window.EP_DB_CORE_V92 = {
    version: VERSION,
    emptyState,
    readState,
    saveState,
    openDatabase,
    applyGlobals,
    clearOldDbKeysOnce
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
