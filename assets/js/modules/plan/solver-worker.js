/* Electric Pro V29 — воркер автотрассировки (тяжёлый просчёт в фоне).

   ПРИНЦИП: воркер грузит ТЕ ЖЕ САМЫЕ файлы модуля (plan-core / plan-geometry /
   plan-routes), что и приложение — никакого второго экземпляра алгоритма, а значит
   и никакого расхождения результата между быстрым (главный поток) и тяжёлым (воркер)
   режимами. Тот же приём, что в тестовом харнессе (test/harness.js): модули писались
   под window/document, поэтому здесь стоят заглушки — сами вычисления в DOM не лезут.

   Что подменяется после импорта:
   · EP.Plan.Core.project — геттер на ПРИСЛАННЫЙ снимок проекта (в воркере нет ни
     localStorage, ни IndexedDB, ни Firebase — состояние ядра не поднимаем вообще);
   · commit/persist — no-op (undo-история и запись на диск живут в главном потоке);
   · model.newRoute — доштамповывает floorId (в воркере S.project ядра пуст, и
     curFloorId() вернул бы null, т.е. трассы «повисли» бы вне этажа);
   · EP.Plan.Rooms — заглушка (тосты/шторки/рендер — дело главного потока).

   Ответ: массив трасс + метрика качества (scoreRoutes). Главный поток сам решает,
   принимать ли результат (commit + persist + рендер). */
"use strict";
self.window = self;

const stubNode = () => ({
  style: {}, classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
  setAttribute() {}, getAttribute: () => null, removeAttribute() {}, appendChild() {}, removeChild() {},
  addEventListener() {}, removeEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 400 })
});
self.document = {
  addEventListener() {}, removeEventListener() {},
  querySelector: () => null, querySelectorAll: () => [],
  createElement: stubNode, createElementNS: stubNode,
  body: stubNode(), documentElement: stubNode()
};

// версия ассетов приходит в query воркера — импортируем модули РОВНО той же версии,
// что уже загружена в приложении (иначе воркер мог бы взять из кэша старый алгоритм)
const ver = (self.location.search || "").replace(/^\?/, "");
const q = ver ? "?" + ver : "";
importScripts("plan-core.js" + q, "plan-geometry.js" + q, "plan-routes.js" + q);

// ВАЖНО: НЕ объявлять здесь `const EP` — топ-левел lexical-объявление в воркере
// затеняет глобальное свойство self.EP, которое создают сами модули, и любой их
// внутренний доступ к бару `EP` падает с «EP is not defined» (поймано живым прогоном:
// plan-core.js:670 `EP.Plan = EP.Plan || {}`). Обращаемся через self.EP.
function prepare(project) {
  const C = self.EP.Plan.Core;
  Object.defineProperty(C, "project", { configurable: true, get: () => project });
  C.commit = () => {};
  C.persist = () => {};
  if (!C.__mkPatched) {
    const mk = C.model.newRoute;
    C.model.newRoute = function () {
      const r = mk.apply(null, arguments);
      if (!r.floorId) r.floorId = (C.project && C.project.activeFloorId) || null;
      return r;
    };
    C.__mkPatched = true;
  }
  self.EP.Plan.Rooms = Object.assign(self.EP.Plan.Rooms || {}, {
    toast() {}, openSheet() {}, closeSheet() {}, renderScene() {}, renderScaled() {},
    isActive: () => false, soloCircuitId: () => null, clearSolo() {},
    ensureVisibleAboveSheet() {}, canvasCmPerPx: () => 0.5, setDragHandler() {}
  });
}

self.onmessage = (e) => {
  const msg = (e && e.data) || {};
  if (msg.type !== "solve") return;
  const t0 = Date.now();
  try {
    prepare(msg.project);
    const RT = self.EP.Plan.Routes;
    RT.setLaneOrder(null);
    let out = null;
    if (msg.mode === "max" && RT.optimizeRoutingMax) {
      out = RT.optimizeRoutingMax({ budgetMs: msg.budgetMs || 3000, seed: msg.seed || 12345 });
    } else if (msg.mode === "precise") {
      out = RT.optimizeRouting({ budgetMs: msg.budgetMs || 900, seed: msg.seed || 12345 });
    } else {
      RT.build({ silent: true, noCommit: true });
      out = { score: RT.scoreRoutes(msg.project), iterations: 1 };
    }
    self.postMessage({
      type: "done", ok: true, mode: msg.mode,
      routes: msg.project.routes || [],
      score: out && out.score, iterations: (out && out.iterations) || 1,
      ms: Date.now() - t0
    });
  } catch (err) {
    self.postMessage({ type: "done", ok: false, error: String((err && err.message) || err) });
  }
};
