/* Electric Pro V29 — тест-харнесс для модуля «Проект квартиры».
   Загружает plan-* модули (и ShieldSchemeSVG) в изолированный vm-контекст с лёгким
   DOM-шимом и in-memory localStorage. Без внешних зависимостей — только встроенный node.
   Возвращает { EP, sandbox, fakeCanvas }. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const PLAN_DIR = path.join(ROOT, "assets/js/modules/plan");
const PLAN_ORDER = [
  "plan-core", "plan-geometry", "plan-canvas", "plan-render", "plan-rooms",
  "plan-elements", "plan-unfold", "plan-routes", "plan-calc", "plan-rules",
  "plan-scheme", "plan-export"
];

const noop = () => {};

function fakeNode() {
  const n = {
    _html: "", setAttribute: noop, getAttribute: () => null, hasAttribute: () => false,
    appendChild: noop, removeChild: noop, insertBefore: noop, firstChild: null, style: {}, textContent: "",
    classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    setPointerCapture: noop, addEventListener: noop, removeEventListener: noop,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 400 }),
    closest: () => null, querySelector: () => null, querySelectorAll: () => []
  };
  Object.defineProperty(n, "innerHTML", { get() { return n._html; }, set(v) { n._html = v; } });
  return n;
}

function loadPlan() {
  const sandbox = {};
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.console = console;
  sandbox.setTimeout = () => 0;
  sandbox.clearTimeout = noop;
  sandbox.screen = { orientation: { lock: () => Promise.resolve(), unlock: noop } };
  sandbox.history = { pushState: noop };
  const store = {};
  sandbox.localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; }
  };
  sandbox.document = {
    addEventListener: noop, removeEventListener: noop,
    querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
    createElementNS: () => fakeNode(), createElement: () => fakeNode(),
    body: { appendChild: noop, removeChild: noop }, fullscreenElement: null
  };

  const ctx = vm.createContext(sandbox);
  // ShieldSchemeSVG нужен для однолинейки
  runFile(ctx, path.join(ROOT, "assets/js/modules/shield/shield-scheme-svg-v28.js"));
  PLAN_ORDER.forEach((n) => runFile(ctx, path.join(PLAN_DIR, n + ".js")));
  return { EP: sandbox.EP, sandbox, store };
}

function runFile(ctx, file) {
  const code = fs.readFileSync(file, "utf8");
  vm.runInContext(code, ctx, { filename: path.basename(file) });
}

// фейковый холст для Render.draw
function fakeCanvas() {
  const layer = () => fakeNode();
  return {
    svg: fakeNode(),
    layers: { underlay: layer(), rooms: layer(), routes: layer(), elements: layer(), overlay: layer(), grid: layer() },
    cmPerPx: () => 0.5
  };
}

module.exports = { loadPlan, fakeCanvas, fakeNode, PLAN_ORDER, PLAN_DIR, ROOT };
