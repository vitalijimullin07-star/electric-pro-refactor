/* Экранная клавиатура: --kb (высота клавиатуры) + body[data-kb="1"].

   Зачем: на Android/iOS при фокусе в поле браузер по умолчанию НЕ уменьшает layout-вьюпорт
   (interactive-widget=resizes-visual) — уменьшается только ВИЗУАЛЬНЫЙ вьюпорт. Из-за этого
   всё, что позиционировано position:fixed/absolute «от низа» (модалки, шторки плана),
   остаётся на прежнем месте и оказывается ПОД клавиатурой. А код, который САМ мерит высоту
   через visualViewport (syncPlanBoxHeight в plan-mount.js), наоборот, видел резко
   уменьшившуюся высоту и схлопывал холст — шторка «забиралась слишком высоко». Ровно эти
   две жалобы: «окно слишком высоко забирается, или наоборот перекрываются клавиатурой».

   Как: одна точка правды — CSS-переменная --kb на <html> (высота клавиатуры в px) и
   body[data-kb="1"] как признак «клавиатура открыта». Оверлеи/шторки просто получают
   padding-bottom/bottom = var(--kb) (см. base.css/plan.css), никакой JS-позиционирования
   в каждом модуле. Работает и там, где браузер САМ уменьшает layout-вьюпорт
   (resizes-content, часть WebView): тогда innerHeight уже уменьшен, kb вычисляется ≈0 и
   двойной компенсации не будет — состояние самосогласованное.

   offsetTop учитывается: браузер при фокусе может СДВИНУТЬ визуальный вьюпорт вверх
   (проскроллить к полю), тогда невидимая снизу часть = innerHeight - (height + offsetTop). */
(function () {
  const vv = window.visualViewport;
  if (!vv) return;                       // очень старый браузер — просто ничего не делаем
  const MIN_KB = 90;                     // меньше — это адресная строка/тулбар, не клавиатура
  let cur = -1;

  function apply() {
    const hidden = Math.max(0, Math.round(window.innerHeight - (vv.height + vv.offsetTop)));
    const kb = hidden >= MIN_KB ? hidden : 0;
    if (kb === cur) return;
    cur = kb;
    document.documentElement.style.setProperty("--kb", kb + "px");
    if (kb) document.body.setAttribute("data-kb", "1");
    else document.body.removeAttribute("data-kb");
    // модулям, которые сами мерят вьюпорт (план), даём знать — им нужно не «схлопнуться»
    try { window.dispatchEvent(new CustomEvent("ep:keyboard", { detail: { kb } })); } catch (e) {}
  }

  vv.addEventListener("resize", apply);
  vv.addEventListener("scroll", apply);
  window.addEventListener("orientationchange", () => setTimeout(apply, 250));
  document.addEventListener("focusin", () => setTimeout(apply, 120));   // клавиатура открывается не мгновенно
  document.addEventListener("focusout", () => setTimeout(apply, 120));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();

  window.EP = window.EP || {};
  EP.Keyboard = { height: () => Math.max(0, cur), isOpen: () => cur > 0 };
})();
