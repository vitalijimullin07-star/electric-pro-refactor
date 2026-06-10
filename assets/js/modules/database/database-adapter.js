/* ============================================================
   Electric Pro V29 — Database / Adapter

   V29.24:
   - localStorage epdb26_my / epdb26_server остаётся быстрым кэшем;
   - Firestore-синхронизация подключается через EP.FirebaseDbSync;
   - публичный контракт loadBase/saveBase остаётся синхронным,
     чтобы не ломать database-core/database-ui.
   ============================================================ */
(() => {
  "use strict";
  window.EP = window.EP || {};
  EP.Database = EP.Database || {};
  const S = EP.Database.Storage;

  function keyOf(base) {
    return base === "server" ? S.KEYS.server : S.KEYS.my;
  }

  function loadBase(base) {
    const arr = S.readJson(keyOf(base), []);
    return Array.isArray(arr) ? arr : [];
  }

  function saveBase(base, items) {
    const safeItems = Array.isArray(items) ? items : [];
    const ok = S.writeJson(keyOf(base), safeItems);

    // Фоновая синхронизация. Ошибки не ломают UI: локальный кэш уже сохранён.
    try {
      if (ok && window.EP?.FirebaseDbSync?.afterLocalSave) {
        window.EP.FirebaseDbSync.afterLocalSave(base === "server" ? "server" : "my", safeItems);
      }
    } catch (error) {
      console.warn("[EP.Database.Adapter] Firebase sync enqueue failed", error);
    }

    return ok;
  }

  function sourceOf(base) {
    if (window.EP?.FirebaseDbSync) return "firebase-cache";
    return "local";
  }

  EP.Database.Adapter = { loadBase, saveBase, sourceOf };
})();
