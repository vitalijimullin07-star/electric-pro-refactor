/* Electric Pro V29 — подсказка по долгому удержанию (~2с) на кнопках-иконках:
   держишь ~2 сек -> всплывает пузырь с aria-label/title кнопки; отпускаешь —
   как обычно срабатывает click (ничего не блокируем, только показываем текст
   поверх). Один общий делегированный слушатель на весь app — работает на
   любой [aria-label]/[title] кнопке без правок конкретных экранов. */
(() => {
  "use strict";
  const HOLD_MS = 2000;
  const MOVE_TOL = 10; // px — уход пальца дальше отменяет подсказку

  let timer = null;
  let bubble = null;
  let start = null;
  let target = null;

  function labelOf(el) {
    return (el.getAttribute("aria-label") || el.getAttribute("title") || "").trim();
  }
  function findTarget(el) {
    return (el && el.closest) ? el.closest("[aria-label],[title]") : null;
  }

  function showBubble(el, text) {
    hideBubble();
    bubble = document.createElement("div");
    bubble.className = "ep-longtip";
    bubble.textContent = text;
    document.body.appendChild(bubble);
    const r = el.getBoundingClientRect();
    const bw = bubble.offsetWidth, bh = bubble.offsetHeight;
    let x = r.left + r.width / 2 - bw / 2;
    let y = r.top - bh - 10;
    if (y < 4) y = r.bottom + 10; // не влезает сверху — показываем снизу
    x = Math.max(4, Math.min(x, window.innerWidth - bw - 4));
    bubble.style.left = x + "px";
    bubble.style.top = y + "px";
    try { if (navigator.vibrate) navigator.vibrate(10); } catch (e) {}
  }
  function hideBubble() {
    if (bubble) { try { bubble.remove(); } catch (e) {} bubble = null; }
  }
  function cancel() {
    if (timer) { clearTimeout(timer); timer = null; }
    hideBubble();
    target = null; start = null;
  }

  document.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const el = findTarget(e.target);
    if (!el) return;
    const text = labelOf(el);
    if (!text) return;
    cancel();
    target = el; start = { x: e.clientX, y: e.clientY };
    timer = setTimeout(() => { if (target) showBubble(target, text); timer = null; }, HOLD_MS);
  }, true);

  document.addEventListener("pointermove", (e) => {
    if (!target || !start) return;
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > MOVE_TOL) cancel();
  }, true);

  // отпустил — подсказка прячется, клик кнопки идёт своим чередом дальше как обычно
  document.addEventListener("pointerup", cancel, true);
  document.addEventListener("pointercancel", cancel, true);
  document.addEventListener("scroll", cancel, true);
})();
