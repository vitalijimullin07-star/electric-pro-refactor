/* Electric Pro V29 — стартовое предупреждение о тестовой версии.
   Показывается ОДИН раз (согласие запоминается в localStorage). «Не согласен» —
   блокирующий экран (веб не может закрыть вкладку принудительно, поэтому доступ
   к приложению перекрывается оверлеем, пока пользователь не согласится).
   Ничего не роняет: если localStorage недоступен — просто показываем модаль каждый раз. */
(function () {
  "use strict";
  window.EP = window.EP || {};
  var KEY = "ep_test_consent";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function consented() { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; } }
  function remember() { try { localStorage.setItem(KEY, "1"); } catch (e) {} }

  var WARNING = [
    "Это тестовая версия приложения Electric Pro.",
    "ЗАПРЕЩАЕТСЯ вводить любые реальные данные:"
  ];
  var LIST = [
    "ФИО клиентов", "Адреса объектов", "Телефоны", "Паспортные данные",
    "Фотографии с узнаваемыми людьми или номерами", "Любую другую конфиденциальную информацию"
  ];
  var TAIL = [
    "Все введённые данные могут быть в любой момент удалены.",
    "Приложение находится в стадии разработки."
  ];

  function overlay() {
    var w = document.createElement("div");
    w.id = "ep-consent-modal";
    w.className = "ep-consent-overlay";
    return w;
  }

  function showWarning() {
    if (document.getElementById("ep-consent-modal")) return;
    var w = overlay();
    w.innerHTML =
      '<div class="ep-consent-card" role="dialog" aria-modal="true" aria-labelledby="ep-consent-title">' +
      '<h2 id="ep-consent-title" class="ep-consent-title">⚠️ Критическое предупреждение</h2>' +
      WARNING.map(function (p) { return '<p class="ep-consent-p">' + esc(p) + "</p>"; }).join("") +
      "<ul class=\"ep-consent-list\">" + LIST.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" +
      TAIL.map(function (p) { return '<p class="ep-consent-p">' + esc(p) + "</p>"; }).join("") +
      '<p class="ep-consent-p ep-consent-agree">Нажимая «Согласен», вы подтверждаете, что ознакомились с предупреждением и не будете вводить реальные персональные данные.</p>' +
      '<div class="ep-consent-btns">' +
      '<button type="button" class="btn btn-primary ep-clickable" data-consent-yes>Согласен</button>' +
      '<button type="button" class="btn btn-ghost ep-clickable" data-consent-no>Не согласен</button>' +
      "</div></div>";
    document.body.appendChild(w);
    w.querySelector("[data-consent-yes]").addEventListener("click", function () { remember(); w.remove(); });
    w.querySelector("[data-consent-no]").addEventListener("click", function () { showBlocked(w); });
  }

  function showBlocked(w) {
    w.innerHTML =
      '<div class="ep-consent-card">' +
      '<h2 class="ep-consent-title">Доступ закрыт</h2>' +
      '<p class="ep-consent-p">Вы не приняли предупреждение о тестовой версии. Работа в приложении невозможна без согласия.</p>' +
      '<div class="ep-consent-btns"><button type="button" class="btn btn-primary ep-clickable" data-consent-review>Пересмотреть</button></div>' +
      "</div>";
    w.querySelector("[data-consent-review]").addEventListener("click", function () { w.remove(); showWarning(); });
    try { window.close(); } catch (e) {} // сработает только если вкладку открыл скрипт; иначе оверлей блокирует
  }

  function init() { if (!consented()) showWarning(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  EP.Consent = { show: showWarning, reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} } };
})();
