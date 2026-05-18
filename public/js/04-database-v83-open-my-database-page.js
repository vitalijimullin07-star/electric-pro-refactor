/*
 * Electric PRO Refactor
 * V83 Open My Database Page
 *
 * Не ломает старую базу.
 * Просто отправляет кнопку "Открыть новую базу" на отдельную страницу my-database.html.
 */

(function () {
  "use strict";

  const VERSION = "V83_OPEN_MY_DATABASE_PAGE";

  function text(el) {
    return String((el && el.textContent) || "").replace(/\s+/g, " ").trim();
  }

  function shouldOpenMyDb(btn) {
    const t = text(btn).toLowerCase();

    return (
      t.includes("открыть новую базу") ||
      t.includes("новая база") ||
      t.includes("v68/v69") ||
      t.includes("v79")
    );
  }

  function openMyDb() {
    window.location.href = "my-database.html?v=v83-my-database-page";
  }

  document.addEventListener("click", function (e) {
    const btn = e.target && e.target.closest ? e.target.closest("button,a") : null;
    if (!btn) return;

    if (shouldOpenMyDb(btn)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      openMyDb();
    }
  }, true);

  window.openMyDatabaseV83 = openMyDb;

  console.log("04-database-v83-open-my-database-page.js", VERSION, "loaded");
})();
