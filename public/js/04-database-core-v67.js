/*
 * Electric PRO Refactor
 * V67 Database Core
 *
 * Единое ядро логики базы.
 * Пока не ломает UI и не перерисовывает базу.
 */

(function () {
  "use strict";

  const VERSION = "V67_DATABASE_CORE";

  const STORAGE = {
    scope: "ep_active_db_scope_v67",
    myMat: "ep_db_my_materials_v67",
    myWork: "ep_db_my_works_v67",
    serverMat: "ep_db_server_materials_cache_v67",
    serverWork: "ep_db_server_works_cache_v67",
    proposals: "ep_db_proposals_v67"
  };

  const UNITS = ["ед", "ед.", "м.п", "м.п.", "м", "м.", "упк", "шт", "шт."];

  function clone(value) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (e) {
      return value;
    }
  }

  function arr(value) {
    return Array.isArray(value) ? value : [];
  }

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  function normalizeScope(scope) {
    scope = String(scope || "").toLowerCase();

    if (
      scope === "my" ||
      scope === "mine" ||
      scope === "user" ||
      scope === "local" ||
      scope === "моя" ||
      scope === "личная"
    ) {
      return "my";
    }

    return "server";
  }

  function normalizeDbType(type) {
    type = String(type || "").toLowerCase();

    if (
      type === "work" ||
      type === "works" ||
      type === "работы" ||
      type === "работа"
    ) {
      return "work";
    }

    return "mat";
  }

  function normalizeUnit(unit) {
    unit = String(unit || "").trim();

    if (!unit) return "ед";

    const found = UNITS.find((u) => u.toLowerCase() === unit.toLowerCase());

    return found || unit;
  }

  function getCurrentUser() {
    return (
      window.fbUser ||
      window.currentUser ||
      window.user ||
      null
    );
  }

  function getUid() {
    const user = getCurrentUser();
    return String((user && (user.uid || user.id)) || "local-master");
  }

  function getEmail() {
    const user = getCurrentUser();
    return String((user && user.email) || "").toLowerCase();
  }

  function isAdmin() {
    if (window.isAdmin === true) return true;
    if (window.adminServerMode === true) return true;
    if (window.EP_IS_ADMIN === true) return true;

    const email = getEmail();

    if (email === "vits0007@gmail.com") return true;

    return false;
  }

  function getRole() {
    return isAdmin() ? "admin" : "master";
  }

  function getScope() {
    if (typeof window.epGetDbScope === "function") {
      const s = normalizeScope(window.epGetDbScope());
      return s === "global" ? "server" : s;
    }

    const raw =
      window.EP_DB_SCOPE ||
      window.epDbScope ||
      localStorage.getItem(STORAGE.scope) ||
      localStorage.getItem("ep_active_db_scope_v60") ||
      localStorage.getItem("ep_db_scope") ||
      "server";

    const s = normalizeScope(raw);

    return s === "global" ? "server" : s;
  }

  function setScope(scope) {
    const normalized = normalizeScope(scope);

    localStorage.setItem(STORAGE.scope, normalized);
    localStorage.setItem("ep_active_db_scope_v60", normalized === "server" ? "global" : "my");
    localStorage.setItem("ep_db_scope", normalized === "server" ? "global" : "my");

    window.EP_DB_SCOPE = normalized === "server" ? "global" : "my";
    window.epDbScope = window.EP_DB_SCOPE;

    if (typeof window.EP_DATABASE_SCOPE_GUARD?.applyScope === "function") {
      window.EP_DATABASE_SCOPE_GUARD.applyScope(window.EP_DB_SCOPE);
    }

    if (typeof window.EP_DB_SCOPE_TOAST?.show === "function") {
      window.EP_DB_SCOPE_TOAST.show(window.EP_DB_SCOPE, true);
    }

    return normalized;
  }

  function ensureStores() {
    window.EP_GLOBAL_MAT = arr(window.EP_GLOBAL_MAT && window.EP_GLOBAL_MAT.length ? window.EP_GLOBAL_MAT : window.matDB);
    window.EP_GLOBAL_WORK = arr(window.EP_GLOBAL_WORK && window.EP_GLOBAL_WORK.length ? window.EP_GLOBAL_WORK : window.workDB);

    window.EP_MY_MAT = arr(window.EP_MY_MAT && window.EP_MY_MAT.length ? window.EP_MY_MAT : window.userMatDB);
    window.EP_MY_WORK = arr(window.EP_MY_WORK && window.EP_MY_WORK.length ? window.EP_MY_WORK : window.userWorkDB);

    const myMat = loadJson(STORAGE.myMat, null);
    const myWork = loadJson(STORAGE.myWork, null);

    if (Array.isArray(myMat)) window.EP_MY_MAT = myMat;
    if (Array.isArray(myWork)) window.EP_MY_WORK = myWork;

    window.userMatDB = window.EP_MY_MAT;
    window.userWorkDB = window.EP_MY_WORK;

    return {
      server: {
        mat: window.EP_GLOBAL_MAT,
        work: window.EP_GLOBAL_WORK
      },
      my: {
        mat: window.EP_MY_MAT,
        work: window.EP_MY_WORK
      }
    };
  }

  function saveMyStores() {
    saveJson(STORAGE.myMat, arr(window.EP_MY_MAT));
    saveJson(STORAGE.myWork, arr(window.EP_MY_WORK));
  }

  function getActiveStore(type) {
    ensureStores();

    type = normalizeDbType(type);

    const scope = getScope();

    if (scope === "my") {
      return type === "work" ? window.EP_MY_WORK : window.EP_MY_MAT;
    }

    return type === "work" ? window.EP_GLOBAL_WORK : window.EP_GLOBAL_MAT;
  }

  function applyActiveStoreToLegacy() {
    ensureStores();

    const scope = getScope();

    if (scope === "my") {
      window.matDB = window.EP_MY_MAT;
      window.workDB = window.EP_MY_WORK;
      window.userMatDB = window.EP_MY_MAT;
      window.userWorkDB = window.EP_MY_WORK;
    } else {
      window.matDB = window.EP_GLOBAL_MAT;
      window.workDB = window.EP_GLOBAL_WORK;
    }
  }

  function canEdit(scope) {
    scope = normalizeScope(scope || getScope());

    if (scope === "my") return true;

    return isAdmin();
  }

  function canMassManage(scope) {
    scope = normalizeScope(scope || getScope());

    if (scope === "my") return true;

    return isAdmin();
  }

  function canAddDirect(scope) {
    scope = normalizeScope(scope || getScope());

    if (scope === "my") return true;

    return isAdmin();
  }

  function allowedEditFields(scope) {
    if (!canEdit(scope)) return [];

    return ["price", "unit"];
  }

  function normalizeItem(item, type) {
    item = item && typeof item === "object" ? clone(item) : {};

    if (!item.id) {
      item.id = "ep_" + Date.now() + "_" + Math.random().toString(16).slice(2);
    }

    item.dbType = normalizeDbType(type || item.dbType || item.type);
    item.ownerUid = item.ownerUid || (getScope() === "my" ? getUid() : "server");
    item.updatedAt = Date.now();

    if (item.unit) item.unit = normalizeUnit(item.unit);

    return item;
  }

  function addItem(type, item, opts) {
    opts = opts || {};
    type = normalizeDbType(type);

    const scope = normalizeScope(opts.scope || getScope());

    if (!canAddDirect(scope)) {
      throw new Error("MASTER_CANNOT_ADD_TO_SERVER_DIRECTLY");
    }

    const target = scope === "my"
      ? (type === "work" ? window.EP_MY_WORK : window.EP_MY_MAT)
      : (type === "work" ? window.EP_GLOBAL_WORK : window.EP_GLOBAL_MAT);

    const normalized = normalizeItem(item, type);

    target.push(normalized);

    if (scope === "my") saveMyStores();

    applyActiveStoreToLegacy();

    return normalized;
  }

  function updateItem(type, id, patch, opts) {
    opts = opts || {};
    type = normalizeDbType(type);

    const scope = normalizeScope(opts.scope || getScope());

    if (!canEdit(scope)) {
      throw new Error("NO_PERMISSION_TO_EDIT_THIS_DB");
    }

    const allowed = allowedEditFields(scope);
    const cleanPatch = {};

    allowed.forEach((field) => {
      if (field in patch) cleanPatch[field] = patch[field];
    });

    if ("unit" in cleanPatch) {
      cleanPatch.unit = normalizeUnit(cleanPatch.unit);
    }

    const store = scope === "my"
      ? (type === "work" ? window.EP_MY_WORK : window.EP_MY_MAT)
      : (type === "work" ? window.EP_GLOBAL_WORK : window.EP_GLOBAL_MAT);

    const item = arr(store).find((x) => String(x.id) === String(id));

    if (!item) return null;

    Object.assign(item, cleanPatch, {
      updatedAt: Date.now()
    });

    if (scope === "my") saveMyStores();

    applyActiveStoreToLegacy();

    return item;
  }

  function createServerProposal(type, item, opts) {
    opts = opts || {};
    type = normalizeDbType(type);

    const proposals = loadJson(STORAGE.proposals, []);

    const proposal = {
      id: "proposal_" + Date.now() + "_" + Math.random().toString(16).slice(2),
      type,
      item: normalizeItem(item, type),
      mode: opts.withPrice === false ? "without_price" : "with_price",
      status: "pending",
      fromUid: getUid(),
      fromEmail: getEmail(),
      createdAt: Date.now()
    };

    proposals.push(proposal);
    saveJson(STORAGE.proposals, proposals);

    return proposal;
  }

  function getProposals() {
    return loadJson(STORAGE.proposals, []);
  }

  function clearMyDatabase() {
    window.EP_MY_MAT = [];
    window.EP_MY_WORK = [];
    window.userMatDB = window.EP_MY_MAT;
    window.userWorkDB = window.EP_MY_WORK;

    saveMyStores();

    if (getScope() === "my") {
      applyActiveStoreToLegacy();
    }

    return true;
  }

  function syncLegacyEverywhere() {
    ensureStores();
    applyActiveStoreToLegacy();
  }

  function boot() {
    syncLegacyEverywhere();

    const timer = setInterval(syncLegacyEverywhere, 1000);
    setTimeout(() => clearInterval(timer), 12000);

    console.log("04-database-core-v67.js", VERSION, "loaded", {
      role: getRole(),
      scope: getScope()
    });
  }

  window.EP_DB = {
    version: VERSION,

    getRole,
    isAdmin,
    getUid,
    getEmail,

    getScope,
    setScope,

    ensureStores,
    getActiveStore,
    applyActiveStoreToLegacy,

    canEdit,
    canMassManage,
    canAddDirect,
    allowedEditFields,

    addItem,
    updateItem,

    createServerProposal,
    getProposals,

    clearMyDatabase,
    normalizeUnit,
    normalizeDbType
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
