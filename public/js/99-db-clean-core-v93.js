(function(){
  "use strict";

  const VERSION = "V93_HOME_RESTORED_DB_DETACHED";
  const STATE_KEY = "EP_DB_STATE_V93";
  const RESET_FLAG = "EP_OLD_DB_KEYS_REMOVED_V93";

  function emptyState(){
    return {
      version: "V93_CLEAN_DB_STATE",
      activeScope: "my",
      role: "master",
      server: { materials: [], works: [] },
      my: { materials: [], works: [] },
      proposals: [],
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
    window.EP_DB_STATE_V93 = state;
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
      for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));

      keys.forEach((key) => {
        const k = String(key || "").toLowerCase();
        if (excludeWords.some((x) => k.includes(x))) return;
        if (deleteWords.some((x) => k.includes(x))) localStorage.removeItem(key);
      });

      localStorage.setItem(STATE_KEY, JSON.stringify(emptyState()));
      localStorage.setItem(RESET_FLAG, VERSION);
    } catch(e) {
      console.warn("V93 clear old db keys error:", e);
    }
  }

  function applyEmptyDbGlobals(){
    const state = readState();

    window.EP_DB_STATE_V93 = state;

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

  function openCleanDatabase(){
    location.href = "database-clean-v93.html?v=v93-home-restored-db-detached";
  }

  function patchOldDbFunctions(){
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
      try { window[name] = openCleanDatabase; } catch(e) {}
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

  function routeOnlyOldDbEntries(){
    document.addEventListener("click", function(e){
      const target = e.target && e.target.closest ? e.target.closest("button,a") : null;
      if (!target) return;

      const t = low(target);
      const oldOnclick = String(target.getAttribute("onclick") || "");

      const isOldDbEntry =
        oldOnclick.includes("openMatCatalog") ||
        oldOnclick.includes("openWorkCatalog") ||
        oldOnclick.includes("renderDbEditors") ||
        t === "база данных" ||
        t.includes("база данных") ||
        t.includes("открыть новую базу");

      if (!isOldDbEntry) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      openCleanDatabase();
    }, true);
  }

  function boot(){
    clearOldDbKeysOnce();

    if (!localStorage.getItem(STATE_KEY)) {
      saveState(emptyState());
    }

    applyEmptyDbGlobals();
    patchOldDbFunctions();
    routeOnlyOldDbEntries();
    removeOldDbBadges();

    let ticks = 0;
    const timer = setInterval(() => {
      patchOldDbFunctions();
      removeOldDbBadges();
      ticks++;
      if (ticks > 20) clearInterval(timer);
    }, 300);

    console.log("99-db-clean-core-v93.js", VERSION, "loaded");
  }

  window.EP_DB_CLEAN_CORE_V93 = {
    version: VERSION,
    openCleanDatabase,
    readState,
    saveState,
    patchOldDbFunctions
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
