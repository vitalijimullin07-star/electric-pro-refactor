/*
 * Electric PRO Refactor
 * Module: 06-single-line-scheme.js
 * V32: отдельный редактор однолинейной схемы.
 *
 * Основа перенесена из standalone HTML "схема.html":
 * - SVG-символы аппаратов;
 * - дерево schemeTree;
 * - отрисовка;
 * - выбор аппарата;
 * - редактирование;
 * - добавление дочернего аппарата;
 * - удаление узла.
 *
 * Модуль безопасный:
 * - не трогает 00-core.js;
 * - открывается отдельной кнопкой "📐 Схема";
 * - хранит схему в localStorage.
 */

(function () {
  "use strict";

  const VERSION = "V32_SINGLE_LINE_SCHEME";
  const STORAGE_KEY = "electric_pro_single_line_scheme_v1";
  const MODAL_ID = "ep-single-line-modal";
  const LAUNCHER_ID = "ep-single-line-launcher";
  const STYLE_ID = "ep-single-line-style";

  console.log("06-single-line-scheme.js", VERSION, "loaded");

  const defaults = {
    mcb: { label: "Новая линия", rating: "16A", prefix: "QF" },
    rcd: { label: "Групповое УЗО", rating: "40A/30mA", prefix: "QD" },
    rcbo: { label: "Дифавтомат", rating: "16A/30mA", prefix: "QFD" },
    switch: { label: "Рубильник", rating: "40A", prefix: "QS" },
    relay: { label: "Реле напр.", rating: "63A", prefix: "KV" },
    meter: { label: "Счётчик", rating: "60A", prefix: "PI" },
    spd: { label: "УЗИП", rating: "T2", prefix: "FV" },
    contactor: { label: "Контактор", rating: "25A", prefix: "KM" }
  };

  const defaultTree = {
    id: "QS1",
    type: "switch",
    label: "Вводной рубильник",
    rating: "63A",
    isCrossModule: false,
    children: [
      {
        id: "KV1",
        type: "relay",
        label: "Реле напряжения",
        rating: "63A",
        isCrossModule: true,
        children: [
          {
            id: "QD1",
            type: "rcd",
            label: "УЗО С/У",
            rating: "40A/30mA",
            isCrossModule: false,
            children: [
              {
                id: "QF1",
                type: "mcb",
                label: "Бойлер",
                rating: "16A",
                isCrossModule: false,
                children: []
              }
            ]
          },
          {
            id: "QFD1",
            type: "rcbo",
            label: "Стиральная машина",
            rating: "16A/30mA",
            isCrossModule: false,
            children: []
          }
        ]
      }
    ]
  };

  const state = {
    tree: null,
    selectedNodeId: null,
    leafCount: 0,
    maxDrawY: 0,
    els: null
  };

  const SPACING_X = 140;
  const SPACING_Y = 220;
  const START_Y = 100;
  const TEXT_OFFSET_X = 30;
  const svgNS = "http://www.w3.org/2000/svg";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadTree() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.warn("Single line scheme: cannot read localStorage", err);
    }
    return clone(defaultTree);
  }

  function saveTree() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tree));
    } catch (err) {
      console.warn("Single line scheme: cannot save localStorage", err);
    }
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${MODAL_ID} {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: #f0f2f5;
        display: flex;
        flex-direction: column;
        font-family: Arial, sans-serif;
      }

      #${MODAL_ID} * {
        box-sizing: border-box;
      }

      .ep-sl-topbar {
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 12px;
        background: #111827;
        color: white;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
      }

      .ep-sl-title {
        font-size: 15px;
        font-weight: 700;
        line-height: 1.2;
      }

      .ep-sl-title small {
        display: block;
        font-size: 11px;
        color: rgba(255,255,255,0.7);
        font-weight: 400;
      }

      .ep-sl-top-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .ep-sl-btn {
        border: 0;
        border-radius: 8px;
        padding: 9px 10px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        background: #e5e7eb;
        color: #111827;
      }

      .ep-sl-btn-primary {
        background: #2563eb;
        color: white;
      }

      .ep-sl-btn-danger {
        background: #dc2626;
        color: white;
      }

      .ep-sl-btn-green {
        background: #16a34a;
        color: white;
      }

      .ep-sl-layout {
        display: flex;
        width: 100%;
        flex: 1;
        min-height: 0;
        flex-direction: column;
        overflow: hidden;
      }

      .ep-sl-canvas-container {
        flex: 1;
        background: white;
        padding: 10px;
        overflow: auto;
        position: relative;
        box-shadow: inset 0 0 10px rgba(0,0,0,0.05);
      }

      .ep-sl-diagram {
        display: block;
        background: #fff;
        margin: 0 auto;
      }

      .ep-sl-control-panel {
        width: 100%;
        max-width: none;
        background: #fff;
        border-top: 1px solid #ddd;
        display: flex;
        flex-direction: column;
        padding: 12px 15px;
        overflow-y: auto;
        z-index: 10;
        box-shadow: 0 -4px 15px rgba(0,0,0,0.08);
        max-height: 48dvh;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }

      @media (min-width: 992px) {
        .ep-sl-layout {
          flex-direction: row;
        }

        .ep-sl-control-panel {
          width: 320px;
          border-top: none;
          border-left: 1px solid #ddd;
          box-shadow: none;
          max-height: none;
          border-radius: 0;
        }
      }

      .ep-sl-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .ep-sl-panel-header h2 {
        font-size: 16px;
        margin: 0;
        color: #333;
      }

      .ep-sl-close-select {
        background: none;
        border: none;
        font-size: 26px;
        color: #999;
        cursor: pointer;
        padding: 0 5px;
        line-height: 1;
        margin-top: -4px;
        display: none;
      }

      .ep-sl-editor-form {
        display: none;
        flex-direction: column;
        gap: 8px;
        margin-top: 10px;
      }

      .ep-sl-actions-form {
        margin-top: 12px;
        display: none;
        flex-direction: column;
        gap: 8px;
      }

      .ep-sl-form-group {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .ep-sl-form-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 2px;
      }

      .ep-sl-control-panel label {
        font-size: 12px;
        color: #666;
        font-weight: bold;
      }

      .ep-sl-control-panel input[type="text"],
      .ep-sl-control-panel select {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 13px;
        width: 100%;
      }

      .ep-sl-control-panel input[type="checkbox"] {
        width: 16px;
        height: 16px;
        cursor: pointer;
        margin: 0;
      }

      .ep-sl-no-selection {
        color: #888;
        font-style: italic;
        text-align: center;
        margin: 10px 0;
        font-size: 13px;
      }

      .ep-sl-device-id {
        font-size: 14px;
        font-weight: bold;
        text-anchor: start;
        fill: #111;
        pointer-events: none;
      }

      .ep-sl-device-label {
        font-size: 12px;
        text-anchor: start;
        fill: #444;
        pointer-events: none;
      }

      .ep-sl-device-rating {
        font-size: 13px;
        text-anchor: start;
        fill: #0056b3;
        font-weight: bold;
        pointer-events: none;
      }

      .ep-sl-device-group {
        cursor: pointer;
        outline: none;
      }

      .ep-sl-symbol-draw {
        stroke: black;
        stroke-width: 2;
        fill: none;
      }

      .ep-sl-device-group.selected .ep-sl-symbol-draw {
        stroke: #007bff;
        stroke-width: 3;
        filter: drop-shadow(0 0 5px rgba(0, 123, 255, 0.4));
      }

      .ep-sl-device-group.selected .ep-sl-hitbox {
        fill: rgba(0, 123, 255, 0.05);
        stroke: #007bff;
        stroke-dasharray: 4;
      }

      .ep-sl-text-backdrop {
        fill: white;
        pointer-events: none;
      }

      #${LAUNCHER_ID} {
        position: fixed;
        right: 14px;
        bottom: 82px;
        z-index: 9998;
        border: none;
        border-radius: 999px;
        background: #111827;
        color: white;
        box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        padding: 11px 14px;
        font-size: 13px;
        font-weight: 800;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }

  function symbolsMarkup() {
    return `
      <defs>
        <symbol id="ep-sl-sym-mcb" viewBox="0 0 40 100">
          <line x1="20" y1="0" x2="20" y2="30" class="ep-sl-symbol-draw"/>
          <line x1="20" y1="30" x2="10" y2="50" class="ep-sl-symbol-draw"/>
          <circle cx="20" cy="55" r="2" fill="black"/>
          <line x1="20" y1="55" x2="20" y2="100" class="ep-sl-symbol-draw"/>
          <rect x="15" y="65" width="10" height="15" class="ep-sl-symbol-draw" stroke-width="1.5"/>
          <line x1="15" y1="65" x2="25" y2="80" class="ep-sl-symbol-draw" stroke-width="1.5"/>
        </symbol>

        <symbol id="ep-sl-sym-rcd" viewBox="0 0 40 100">
          <line x1="20" y1="0" x2="20" y2="30" class="ep-sl-symbol-draw"/>
          <line x1="20" y1="30" x2="10" y2="50" class="ep-sl-symbol-draw"/>
          <circle cx="20" cy="55" r="2" fill="black"/>
          <line x1="20" y1="55" x2="20" y2="100" class="ep-sl-symbol-draw"/>
          <ellipse cx="20" cy="75" rx="10" ry="15" class="ep-sl-symbol-draw" stroke-width="1.5"/>
        </symbol>

        <symbol id="ep-sl-sym-rcbo" viewBox="0 0 40 100">
          <line x1="20" y1="0" x2="20" y2="30" class="ep-sl-symbol-draw"/>
          <line x1="20" y1="30" x2="10" y2="50" class="ep-sl-symbol-draw"/>
          <circle cx="20" cy="55" r="2" fill="black"/>
          <line x1="20" y1="55" x2="20" y2="100" class="ep-sl-symbol-draw"/>
          <rect x="15" y="62" width="10" height="10" class="ep-sl-symbol-draw" stroke-width="1.5"/>
          <line x1="15" y1="62" x2="25" y2="72" class="ep-sl-symbol-draw" stroke-width="1.5"/>
          <ellipse cx="20" cy="85" rx="8" ry="12" class="ep-sl-symbol-draw" stroke-width="1.5"/>
        </symbol>

        <symbol id="ep-sl-sym-switch" viewBox="0 0 40 100">
          <line x1="20" y1="0" x2="20" y2="30" class="ep-sl-symbol-draw"/>
          <line x1="20" y1="30" x2="10" y2="50" class="ep-sl-symbol-draw"/>
          <circle cx="20" cy="55" r="2" fill="black"/>
          <line x1="20" y1="55" x2="20" y2="100" class="ep-sl-symbol-draw"/>
          <line x1="3" y1="50" x2="17" y2="50" class="ep-sl-symbol-draw"/>
        </symbol>

        <symbol id="ep-sl-sym-relay" viewBox="0 0 40 100">
          <line x1="20" y1="0" x2="20" y2="25" class="ep-sl-symbol-draw"/>
          <rect x="5" y="25" width="30" height="50" class="ep-sl-symbol-draw" stroke-width="1.5"/>
          <text x="20" y="55" font-size="14" text-anchor="middle" font-weight="bold" pointer-events="none">U</text>
          <line x1="20" y1="75" x2="20" y2="100" class="ep-sl-symbol-draw"/>
        </symbol>

        <symbol id="ep-sl-sym-meter" viewBox="0 0 40 100">
          <line x1="20" y1="0" x2="20" y2="20" class="ep-sl-symbol-draw"/>
          <rect x="5" y="20" width="30" height="60" class="ep-sl-symbol-draw" stroke-width="1.5"/>
          <text x="20" y="55" font-size="10" text-anchor="middle" font-weight="bold" pointer-events="none">kWh</text>
          <line x1="20" y1="80" x2="20" y2="100" class="ep-sl-symbol-draw"/>
        </symbol>

        <symbol id="ep-sl-sym-spd" viewBox="0 0 40 100">
          <line x1="20" y1="0" x2="20" y2="30" class="ep-sl-symbol-draw"/>
          <rect x="10" y="30" width="20" height="40" class="ep-sl-symbol-draw" stroke-width="1.5"/>
          <line x1="10" y1="70" x2="30" y2="30" class="ep-sl-symbol-draw"/>
          <line x1="20" y1="70" x2="20" y2="100" class="ep-sl-symbol-draw"/>
        </symbol>

        <symbol id="ep-sl-sym-contactor" viewBox="0 0 40 100">
          <line x1="20" y1="0" x2="20" y2="30" class="ep-sl-symbol-draw"/>
          <line x1="20" y1="30" x2="10" y2="50" class="ep-sl-symbol-draw"/>
          <circle cx="20" cy="55" r="2" fill="black"/>
          <line x1="20" y1="55" x2="20" y2="100" class="ep-sl-symbol-draw"/>
          <rect x="15" y="70" width="10" height="15" class="ep-sl-symbol-draw" stroke-width="1.5"/>
          <line x1="15" y1="70" x2="25" y2="85" class="ep-sl-symbol-draw"/>
        </symbol>
      </defs>
    `;
  }

  function layoutMarkup() {
    return `
      <div class="ep-sl-topbar">
        <div class="ep-sl-title">
          Однолинейная схема
          <small>Electric PRO Refactor · ${VERSION}</small>
        </div>
        <div class="ep-sl-top-actions">
          <button type="button" class="ep-sl-btn" data-action="json">JSON</button>
          <button type="button" class="ep-sl-btn ep-sl-btn-danger" data-action="close">Закрыть</button>
        </div>
      </div>

      <div class="ep-sl-layout">
        <div class="ep-sl-canvas-container">
          <svg class="ep-sl-diagram" xmlns="http://www.w3.org/2000/svg">
            ${symbolsMarkup()}
            <g id="ep-sl-scheme-root"></g>
          </svg>
        </div>

        <aside class="ep-sl-control-panel">
          <div class="ep-sl-panel-header">
            <h2>Редактор</h2>
            <button type="button" class="ep-sl-close-select">&times;</button>
          </div>

          <div class="ep-sl-no-selection">Кликните на аппарат для настройки</div>

          <form class="ep-sl-editor-form">
            <div class="ep-sl-form-group">
              <label>Тип аппарата:</label>
              <select data-field="type">
                <option value="switch">Рубильник (ВН)</option>
                <option value="mcb">Автомат (MCB)</option>
                <option value="rcd">УЗО (ВДТ)</option>
                <option value="rcbo">Дифавтомат (АВДТ)</option>
                <option value="relay">Реле напряжения</option>
                <option value="meter">Счётчик</option>
                <option value="spd">УЗИП</option>
                <option value="contactor">Контактор</option>
              </select>
            </div>

            <div style="display:flex; gap:8px;">
              <div class="ep-sl-form-group" style="flex:1;">
                <label>ID:</label>
                <input type="text" data-field="id" placeholder="QF2">
              </div>
              <div class="ep-sl-form-group" style="flex:2;">
                <label>Номинал:</label>
                <input type="text" data-field="rating" placeholder="16A">
              </div>
            </div>

            <div class="ep-sl-form-group">
              <label>Название группы:</label>
              <input type="text" data-field="label" placeholder="Свет Зал">
            </div>

            <div class="ep-sl-form-row">
              <input type="checkbox" data-field="cross" id="ep-sl-cross">
              <label for="ep-sl-cross" style="cursor:pointer; color:#333;">Кросс-модуль под аппаратом</label>
            </div>

            <button type="submit" class="ep-sl-btn ep-sl-btn-primary" style="margin-top:2px;">Сохранить изменения</button>
          </form>

          <div class="ep-sl-actions-form">
            <div style="border-top:1px solid #eee; padding-top:10px;">
              <label style="margin-bottom:6px; display:block;">Добавить вниз:</label>
              <div style="display:flex; gap:8px;">
                <select data-field="addType" style="flex:1.2;">
                  <option value="mcb">Автомат</option>
                  <option value="rcd">УЗО</option>
                  <option value="rcbo">Дифавтомат</option>
                  <option value="switch">Рубильник</option>
                  <option value="relay">Реле</option>
                  <option value="meter">Счётчик</option>
                  <option value="spd">УЗИП</option>
                  <option value="contactor">Контактор</option>
                </select>
                <button type="button" class="ep-sl-btn ep-sl-btn-green" data-action="add">+ Добавить</button>
              </div>
            </div>

            <button type="button" class="ep-sl-btn ep-sl-btn-danger" data-action="delete" style="margin-top:8px;">Удалить весь узел</button>
          </div>
        </aside>
      </div>
    `;
  }

  function open(tree) {
    ensureStyles();

    const exists = document.getElementById(MODAL_ID);
    if (exists) {
      exists.style.display = "flex";
      return;
    }

    state.tree = tree ? clone(tree) : loadTree();
    state.selectedNodeId = null;

    const modal = document.createElement("div");
    modal.id = MODAL_ID;
    modal.innerHTML = layoutMarkup();
    document.body.appendChild(modal);

    bindElements(modal);
    bindEvents();
    render();
  }

  function close() {
    const modal = document.getElementById(MODAL_ID);
    if (modal) modal.remove();
    state.els = null;
    state.selectedNodeId = null;
  }

  function bindElements(modal) {
    state.els = {
      modal,
      svg: modal.querySelector(".ep-sl-diagram"),
      root: modal.querySelector("#ep-sl-scheme-root"),
      msg: modal.querySelector(".ep-sl-no-selection"),
      editorForm: modal.querySelector(".ep-sl-editor-form"),
      actionsForm: modal.querySelector(".ep-sl-actions-form"),
      closeSelect: modal.querySelector(".ep-sl-close-select"),
      type: modal.querySelector('[data-field="type"]'),
      id: modal.querySelector('[data-field="id"]'),
      label: modal.querySelector('[data-field="label"]'),
      rating: modal.querySelector('[data-field="rating"]'),
      cross: modal.querySelector('[data-field="cross"]'),
      addType: modal.querySelector('[data-field="addType"]'),
      addBtn: modal.querySelector('[data-action="add"]'),
      deleteBtn: modal.querySelector('[data-action="delete"]'),
      closeBtn: modal.querySelector('[data-action="close"]'),
      jsonBtn: modal.querySelector('[data-action="json"]')
    };
  }

  function bindEvents() {
    const e = state.els;

    e.closeBtn.addEventListener("click", close);
    e.closeSelect.addEventListener("click", () => selectNode(null));

    e.svg.addEventListener("click", (event) => {
      let group = event.target;
      while (group && group !== e.svg) {
        if (group.classList && group.classList.contains("ep-sl-device-group")) break;
        group = group.parentNode;
      }

      if (group && group !== e.svg) {
        selectNode(group.getAttribute("data-id"));
      } else {
        selectNode(null);
      }
    });

    e.editorForm.addEventListener("submit", (event) => {
      event.preventDefault();
      saveSelectedNode();
    });

    e.addBtn.addEventListener("click", addChildToSelected);
    e.deleteBtn.addEventListener("click", deleteSelectedNode);
    e.jsonBtn.addEventListener("click", copyJson);
  }

  function drawLine(x1, y1, x2, y2, color = "black", width = 2, dash = "") {
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", width);
    if (dash) line.setAttribute("stroke-dasharray", dash);
    state.els.root.appendChild(line);
  }

  function drawTerminalCircle(x, y) {
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", "3.5");
    circle.setAttribute("fill", "black");
    state.els.root.appendChild(circle);
  }

  function drawDevice(node) {
    const group = document.createElementNS(svgNS, "g");
    group.setAttribute("transform", `translate(${node.x}, ${node.y})`);
    group.setAttribute("class", "ep-sl-device-group");
    group.setAttribute("data-id", node.id);

    const hitbox = document.createElementNS(svgNS, "rect");
    hitbox.setAttribute("x", -30);
    hitbox.setAttribute("y", -20);
    hitbox.setAttribute("width", 180);
    hitbox.setAttribute("height", 160);
    hitbox.setAttribute("fill", "transparent");
    hitbox.setAttribute("class", "ep-sl-hitbox");
    group.appendChild(hitbox);

    const use = document.createElementNS(svgNS, "use");
    use.setAttribute("href", `#ep-sl-sym-${node.type}`);
    use.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#ep-sl-sym-${node.type}`);
    use.setAttribute("x", -20);
    use.setAttribute("y", 0);
    use.setAttribute("width", 40);
    use.setAttribute("height", 100);
    group.appendChild(use);

    const textId = document.createElementNS(svgNS, "text");
    textId.setAttribute("x", TEXT_OFFSET_X);
    textId.setAttribute("y", 20);
    textId.setAttribute("class", "ep-sl-device-id");
    textId.textContent = node.id;
    group.appendChild(textId);

    const hasChildren = node.children && node.children.length > 0;

    if (hasChildren || node.isCrossModule) {
      const textLabel = document.createElementNS(svgNS, "text");
      textLabel.setAttribute("x", TEXT_OFFSET_X);
      textLabel.setAttribute("y", 45);
      textLabel.setAttribute("class", "ep-sl-device-label");
      textLabel.textContent = node.label;
      group.appendChild(textLabel);

      const textRating = document.createElementNS(svgNS, "text");
      textRating.setAttribute("x", TEXT_OFFSET_X);
      textRating.setAttribute("y", 65);
      textRating.setAttribute("class", "ep-sl-device-rating");
      textRating.textContent = node.rating;
      group.appendChild(textRating);
    } else {
      const labelGroup = document.createElementNS(svgNS, "g");
      labelGroup.setAttribute("transform", "translate(0, 115)");

      const backdrop = document.createElementNS(svgNS, "rect");
      backdrop.setAttribute("x", TEXT_OFFSET_X - 5);
      backdrop.setAttribute("y", -10);
      backdrop.setAttribute("width", 150);
      backdrop.setAttribute("height", 35);
      backdrop.setAttribute("class", "ep-sl-text-backdrop");
      labelGroup.appendChild(backdrop);

      const textLabel = document.createElementNS(svgNS, "text");
      textLabel.setAttribute("x", TEXT_OFFSET_X);
      textLabel.setAttribute("y", 5);
      textLabel.setAttribute("class", "ep-sl-device-label");
      textLabel.textContent = node.label;
      labelGroup.appendChild(textLabel);

      const textRating = document.createElementNS(svgNS, "text");
      textRating.setAttribute("x", TEXT_OFFSET_X);
      textRating.setAttribute("y", 23);
      textRating.setAttribute("class", "ep-sl-device-rating");
      textRating.textContent = node.rating;
      labelGroup.appendChild(textRating);

      group.appendChild(labelGroup);
    }

    state.els.root.appendChild(group);
  }

  function calculatePositions(node, depth = 0) {
    node.y = START_Y + depth * SPACING_Y;
    if (node.y > state.maxDrawY) state.maxDrawY = node.y;

    if (!node.children || node.children.length === 0) {
      node.x = state.leafCount * SPACING_X;
      state.leafCount++;
    } else {
      node.children.forEach((child) => calculatePositions(child, depth + 1));
      const firstChildX = node.children[0].x;
      const lastChildX = node.children[node.children.length - 1].x;
      node.x = (firstChildX + lastChildX) / 2;
    }
  }

  function shiftTree(node, offsetX) {
    node.x += offsetX;
    if (node.children) node.children.forEach((child) => shiftTree(child, offsetX));
  }

  function drawTree(node) {
    drawDevice(node);

    if (node.id === state.tree.id) {
      const totalWidth = Math.max(1, state.leafCount - 1) * SPACING_X;
      const busStartX = node.x - 50;
      const busEndX = node.x + totalWidth + 50;

      drawLine(busStartX, 30, busEndX, 30, "#28a745", 3, "6 4");
      drawLine(node.x, 30, node.x, node.y, "#28a745", 2);

      drawLine(busStartX, 50, busEndX, 50, "#007bff", 3);
      drawLine(node.x - 10, 50, node.x - 10, node.y, "#007bff", 2);
    }

    if (node.children && node.children.length > 0) {
      let busbarY = node.y + 115;
      let lineStartY = node.y + 100;

      if (node.isCrossModule) {
        const cx = node.x - 20;
        const cy = node.y + 110;

        const rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("x", cx);
        rect.setAttribute("y", cy);
        rect.setAttribute("width", 40);
        rect.setAttribute("height", 45);
        rect.setAttribute("fill", "#f8f9fa");
        rect.setAttribute("stroke", "#adb5bd");
        rect.setAttribute("rx", 4);
        state.els.root.appendChild(rect);

        drawLine(cx + 8, cy + 8, cx + 8, cy + 37, "#dc3545", 2);
        drawLine(cx + 16, cy + 8, cx + 16, cy + 37, "#dc3545", 2);
        drawLine(cx + 24, cy + 8, cx + 24, cy + 37, "#dc3545", 2);
        drawLine(cx + 32, cy + 8, cx + 32, cy + 37, "#007bff", 2);

        busbarY = cy + 65;
        lineStartY = cy + 45;
        drawLine(node.x, node.y + 100, node.x, cy);
      }

      drawLine(node.x, lineStartY, node.x, busbarY);

      if (node.children.length > 1) {
        const firstX = node.children[0].x;
        const lastX = node.children[node.children.length - 1].x;
        drawLine(firstX, busbarY, lastX, busbarY, "black", 3);
      }

      node.children.forEach((child) => {
        drawLine(child.x, busbarY, child.x, child.y);
        drawTree(child);
      });
    } else {
      const tailY = node.y + 140;
      drawLine(node.x, node.y + 100, node.x, tailY);
      drawTerminalCircle(node.x, tailY);
    }
  }

  function render() {
    if (!state.els || !state.tree) return;

    state.els.root.innerHTML = "";
    state.leafCount = 0;
    state.maxDrawY = 0;

    calculatePositions(state.tree);
    shiftTree(state.tree, 120);

    state.els.svg.setAttribute("width", Math.max(500, state.leafCount * SPACING_X + 160));
    state.els.svg.setAttribute("height", state.maxDrawY + 300);

    drawTree(state.tree);
    reapplySelection();
  }

  function findNodeById(root, id) {
    if (!root) return null;
    if (root.id === id) return root;

    if (root.children) {
      for (const child of root.children) {
        const found = findNodeById(child, id);
        if (found) return found;
      }
    }

    return null;
  }

  function findGroupById(id) {
    if (!state.els) return null;
    const groups = state.els.modal.querySelectorAll(".ep-sl-device-group");
    for (const group of groups) {
      if (group.getAttribute("data-id") === id) return group;
    }
    return null;
  }

  function selectNode(id) {
    state.selectedNodeId = id;

    state.els.modal.querySelectorAll(".ep-sl-device-group.selected").forEach((el) => {
      el.classList.remove("selected");
    });

    if (id) {
      const group = findGroupById(id);
      if (group) group.classList.add("selected");

      const node = findNodeById(state.tree, id);
      if (node) {
        state.els.type.value = node.type || "mcb";
        state.els.id.value = node.id || "";
        state.els.label.value = node.label || "";
        state.els.rating.value = node.rating || "";
        state.els.cross.checked = !!node.isCrossModule;

        state.els.actionsForm.style.display = "flex";
        state.els.msg.style.display = "none";
        state.els.editorForm.style.display = "flex";
        state.els.closeSelect.style.display = "block";
      }
    } else {
      state.els.msg.style.display = "block";
      state.els.editorForm.style.display = "none";
      state.els.actionsForm.style.display = "none";
      state.els.closeSelect.style.display = "none";
    }
  }

  function reapplySelection() {
    if (!state.selectedNodeId) return;
    const group = findGroupById(state.selectedNodeId);
    if (group) group.classList.add("selected");
  }

  function saveSelectedNode() {
    if (!state.selectedNodeId) return;

    const node = findNodeById(state.tree, state.selectedNodeId);
    if (!node) return;

    const oldId = node.id;

    node.type = state.els.type.value;
    node.id = state.els.id.value.trim() || oldId;
    node.label = state.els.label.value.trim() || defaults[node.type]?.label || "Линия";
    node.rating = state.els.rating.value.trim() || defaults[node.type]?.rating || "";
    node.isCrossModule = !!state.els.cross.checked;

    state.selectedNodeId = node.id;

    saveTree();
    render();
  }

  function getNextNodeId(type) {
    const prefix = defaults[type]?.prefix || "QF";
    let count = 0;

    function countNodes(node) {
      if (String(node.id || "").startsWith(prefix)) count++;
      if (node.children) node.children.forEach(countNodes);
    }

    countNodes(state.tree);
    return prefix + (count + 1);
  }

  function addChildToSelected() {
    if (!state.selectedNodeId) return;

    const parentNode = findNodeById(state.tree, state.selectedNodeId);
    if (!parentNode) return;

    if (!parentNode.children) parentNode.children = [];

    const type = state.els.addType.value;
    const def = defaults[type] || defaults.mcb;
    const newId = getNextNodeId(type);

    parentNode.children.push({
      id: newId,
      type,
      label: def.label,
      rating: def.rating,
      isCrossModule: false,
      children: []
    });

    saveTree();
    render();
    selectNode(newId);
  }

  function removeNode(parent, id) {
    if (!parent || !parent.children) return false;

    for (let i = 0; i < parent.children.length; i++) {
      if (parent.children[i].id === id) {
        parent.children.splice(i, 1);
        return true;
      }

      if (removeNode(parent.children[i], id)) return true;
    }

    return false;
  }

  function deleteSelectedNode() {
    if (!state.selectedNodeId) return;

    if (state.selectedNodeId === state.tree.id) {
      alert("Вводной аппарат удалить нельзя");
      return;
    }

    if (!confirm("Точно удалить аппарат и все его отходящие линии?")) return;

    removeNode(state.tree, state.selectedNodeId);
    state.selectedNodeId = null;

    saveTree();
    render();
    selectNode(null);
  }

  function copyJson() {
    const text = JSON.stringify(state.tree, null, 2);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => alert("JSON схемы скопирован"))
        .catch(() => prompt("JSON схемы:", text));
    } else {
      prompt("JSON схемы:", text);
    }
  }

  function setTree(tree) {
    state.tree = clone(tree || defaultTree);
    saveTree();
    if (state.els) render();
  }

  function getTree() {
    return clone(state.tree || loadTree());
  }

  function resetTree() {
    state.tree = clone(defaultTree);
    state.selectedNodeId = null;
    saveTree();
    if (state.els) {
      render();
      selectNode(null);
    }
  }

  function treeFromLines(lines) {
    const safeLines = Array.isArray(lines) ? lines : [];

    return {
      id: "QS1",
      type: "switch",
      label: "Вводной рубильник",
      rating: "63A",
      isCrossModule: false,
      children: [
        {
          id: "QD1",
          type: "rcd",
          label: "Групповая защита",
          rating: "40A/30mA",
          isCrossModule: true,
          children: safeLines.map((line, index) => ({
            id: line.id || `QF${index + 1}`,
            type: line.type || "mcb",
            label: line.label || line.name || `Линия ${index + 1}`,
            rating: line.rating || "16A",
            isCrossModule: false,
            children: []
          }))
        }
      ]
    };
  }

  function mountLauncher() {
    ensureStyles();

    if (document.getElementById(LAUNCHER_ID)) return;

    const button = document.createElement("button");
    button.id = LAUNCHER_ID;
    button.type = "button";
    button.textContent = "📐 Схема";
    button.addEventListener("click", () => open());

    document.body.appendChild(button);
  }

  window.EP_SINGLE_LINE_SCHEME = {
    version: VERSION,
    open,
    close,
    render,
    getTree,
    setTree,
    resetTree,
    treeFromLines,
    defaults
  };

  window.openSingleLineScheme = open;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountLauncher);
  } else {
    mountLauncher();
  }
})();


/* V50_SCHEME_BUTTON_START */
(function(){
  "use strict";

  const STYLE_ID = "ep-scheme-button-v50-style";
  const BUTTON_ID = "ep-scheme-shield-btn-v50";
  const ROW_ID = "ep-scheme-shield-row-v50";
  const OLD_LAUNCHER_ID = "ep-single-line-launcher";
  const OLD_HOST_1 = "ep-scheme-inside-shield";
  const OLD_HOST_2 = "ep-sl-shield-host";

  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${OLD_LAUNCHER_ID},
      #${OLD_HOST_1},
      #${OLD_HOST_2}{
        display:none!important;
      }

      #${ROW_ID}{
        margin:10px 0 12px;
        display:flex;
        align-items:center;
        justify-content:center;
      }

      #${BUTTON_ID}{
        width:100%;
        border:none;
        border-radius:16px;
        padding:13px 16px;
        background:linear-gradient(135deg,#4f46e5,#2563eb,#0891b2);
        color:#fff;
        font-size:15px;
        font-weight:900;
        letter-spacing:.2px;
        box-shadow:0 10px 24px rgba(37,99,235,.28);
        cursor:pointer;
        display:flex;
        align-items:center;
        justify-content:center;
        gap:8px;
      }

      #${BUTTON_ID}:active{
        transform:scale(.985);
      }

      #${BUTTON_ID} small{
        opacity:.86;
        font-size:12px;
        font-weight:700;
      }
    `;

    document.head.appendChild(style);
  }

  function removeBadOldBlocks(){
    document.querySelectorAll("#" + OLD_LAUNCHER_ID + ", #" + OLD_HOST_1 + ", #" + OLD_HOST_2).forEach(el => {
      el.remove();
    });
  }

  function text(el){
    return String(el && el.textContent || "").toLowerCase();
  }

  function findShieldPanel(){
    const directSelectors = [
      "#shield-configurator",
      "#shieldConfig",
      "#shield-panel",
      "#shieldPanel",
      "#cascade-panel",
      "#configurator",
      ".shield-configurator",
      ".shield-panel",
      ".cascade-panel"
    ];

    for(const selector of directSelectors){
      const el = document.querySelector(selector);
      if(el) return el;
    }

    const candidates = Array.from(document.querySelectorAll("section, aside, main, article, div"))
      .filter(el => {
        const t = text(el);
        if(!t) return false;
        if(el.closest("#ep-single-line-modal")) return false;

        return (
          t.includes("сборка щита") ||
          t.includes("ручная сборка") ||
          t.includes("настройки автоматики") ||
          t.includes("марка щита") ||
          t.includes("тип защиты") ||
          t.includes("сгенерировать щит")
        );
      })
      .map(el => {
        const t = text(el).slice(0,5000);
        let score = 0;

        if(t.includes("сборка щита")) score += 30;
        if(t.includes("ручная сборка")) score += 20;
        if(t.includes("настройки автоматики")) score += 15;
        if(t.includes("сгенерировать щит")) score += 15;
        if(t.includes("марка щита")) score += 10;
        if(t.includes("тип защиты")) score += 10;
        if(t.includes("узо")) score += 3;
        if(t.includes("диф")) score += 3;
        if(t.includes("автомат")) score += 2;

        const r = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
        if(r && r.width > 280 && r.height > 250) score += 8;

        return {el, score};
      })
      .filter(x => x.score > 0)
      .sort((a,b) => b.score - a.score);

    return candidates.length ? candidates[0].el : null;
  }

  function createButtonRow(){
    let row = document.getElementById(ROW_ID);
    if(row) return row;

    row = document.createElement("div");
    row.id = ROW_ID;
    row.innerHTML = `
      <button type="button" id="${BUTTON_ID}">
        <span>📐 Схема щита</span>
        <small>открыть</small>
      </button>
    `;

    return row;
  }

  function openScheme(){
    const api = window.EP_SINGLE_LINE_SCHEME;

    if(api && typeof api.open === "function"){
      api.open();
      return;
    }

    if(typeof window.openSingleLineScheme === "function"){
      window.openSingleLineScheme();
      return;
    }

    alert("Модуль схемы ещё не загрузился");
  }

  function mountButton(){
    ensureStyle();
    removeBadOldBlocks();

    const panel = findShieldPanel();
    if(!panel) return false;

    const row = createButtonRow();

    if(!panel.contains(row)){
      const buttons = Array.from(panel.querySelectorAll("button"));
      const manualBtn = buttons.find(btn => text(btn).includes("ручная сборка"));
      const settingsBlock = Array.from(panel.querySelectorAll("div,section")).find(el => text(el).includes("настройки автоматики"));

      if(manualBtn && manualBtn.parentElement){
        manualBtn.parentElement.insertAdjacentElement("afterend", row);
      } else if(settingsBlock && settingsBlock.parentElement){
        settingsBlock.parentElement.insertBefore(row, settingsBlock);
      } else {
        panel.insertBefore(row, panel.firstChild ? panel.firstChild.nextSibling : null);
      }
    }

    const btn = document.getElementById(BUTTON_ID);
    if(btn && !btn.dataset.bound){
      btn.dataset.bound = "1";
      btn.addEventListener("click", openScheme);
    }

    return true;
  }

  function boot(){
    ensureStyle();
    removeBadOldBlocks();
    mountButton();

    const obs = new MutationObserver(() => {
      removeBadOldBlocks();
      mountButton();
    });

    obs.observe(document.body,{
      childList:true,
      subtree:true,
      attributes:true,
      attributeFilter:["class","style"]
    });
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  console.log("V50: beautiful scheme button in shield configurator loaded");
})();
/* V50_SCHEME_BUTTON_END */

