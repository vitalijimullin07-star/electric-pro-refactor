/*
 * Electric PRO Refactor
 * Module: 06-single-line-scheme.js
 * V51: схема щита как дерево, по логике standalone HTML "схема.html".
 */

(function () {
  "use strict";

  const VERSION = "V51_TREE_SCHEME_FROM_HTML";
  const STYLE_ID = "ep-tree-scheme-style-v51";
  const BUTTON_ID = "ep-scheme-shield-btn-v51";
  const BUTTON_ROW_ID = "ep-scheme-shield-row-v51";
  const MODAL_ID = "ep-tree-scheme-modal-v51";
  const STORAGE_KEY = "electric_pro_tree_scheme_v51";

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

  let schemeTree = {
    id: "QS1",
    type: "switch",
    label: "Вводной рубильник",
    rating: "63A",
    isCrossModule: false,
    children: [
      {
        id: "KV1",
        type: "relay",
        label: "Реле напр.",
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
            label: "Стиральная маш.",
            rating: "16A/30mA",
            isCrossModule: false,
            children: []
          }
        ]
      }
    ]
  };

  const SPACING_X = 140;
  const SPACING_Y = 220;
  const START_Y = 100;
  const TEXT_OFFSET_X = 30;
  const svgNS = "http://www.w3.org/2000/svg";

  let svg = null;
  let schemeRoot = null;
  let leafCount = 0;
  let selectedNodeId = null;
  let maxDrawY = 0;

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function loadTree() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id) return parsed;
      }
    } catch (e) {}
    return clone(schemeTree);
  }

  function saveTree() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schemeTree));
    } catch (e) {}
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #ep-single-line-launcher,
      #ep-scheme-inside-shield,
      #ep-sl-shield-host,
      #ep-scheme-shield-row-v50 {
        display: none !important;
      }

      #${BUTTON_ROW_ID} {
        margin: 10px 0 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #${BUTTON_ID} {
        width: 100%;
        border: none;
        border-radius: 16px;
        padding: 13px 16px;
        background: linear-gradient(135deg, #4f46e5, #2563eb, #0891b2);
        color: #fff;
        font-size: 15px;
        font-weight: 900;
        letter-spacing: .2px;
        box-shadow: 0 10px 24px rgba(37,99,235,.28);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      #${BUTTON_ID}:active {
        transform: scale(.985);
      }

      #${BUTTON_ID} small {
        opacity: .86;
        font-size: 12px;
        font-weight: 700;
      }

      #${MODAL_ID} {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: #f0f2f5;
        display: none;
        flex-direction: column;
        font-family: Arial, sans-serif;
      }

      #${MODAL_ID} * {
        box-sizing: border-box;
      }

      .ep-tree-topbar {
        height: 54px;
        min-height: 54px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 12px;
        background: #111827;
        color: white;
        box-shadow: 0 2px 12px rgba(0,0,0,.18);
      }

      .ep-tree-title {
        font-size: 15px;
        font-weight: 900;
        line-height: 1.2;
      }

      .ep-tree-title small {
        display: block;
        font-size: 11px;
        opacity: .7;
        font-weight: 500;
      }

      .ep-tree-top-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .ep-tree-btn {
        padding: 10px 11px;
        border: none;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 900;
        cursor: pointer;
        background: #e5e7eb;
        color: #111827;
      }

      .ep-tree-btn-primary {
        background: #2563eb;
        color: white;
      }

      .ep-tree-btn-danger {
        background: #dc2626;
        color: white;
      }

      .ep-tree-main-layout {
        display: flex;
        width: 100%;
        flex: 1;
        flex-direction: column;
        overflow: hidden;
      }

      @media (min-width: 992px) {
        .ep-tree-main-layout {
          flex-direction: row;
        }
      }

      .ep-tree-canvas-container {
        flex: 1;
        background: white;
        padding: 10px;
        box-shadow: inset 0 0 10px rgba(0,0,0,.05);
        overflow: auto;
        position: relative;
      }

      .ep-tree-diagram {
        display: block;
        background: #fff;
        margin: 0 auto;
      }

      .ep-tree-control-panel {
        width: 100%;
        max-width: none;
        background: #fff;
        border-top: 1px solid #ddd;
        display: flex;
        flex-direction: column;
        padding: 12px 15px;
        overflow-y: auto;
        z-index: 10;
        box-shadow: 0 -4px 15px rgba(0,0,0,.08);
        max-height: 48dvh;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }

      @media (min-width: 992px) {
        .ep-tree-control-panel {
          width: 320px;
          border-top: none;
          border-left: 1px solid #ddd;
          box-shadow: none;
          max-height: none;
          border-radius: 0;
        }
      }

      .ep-tree-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .ep-tree-panel-header h2 {
        font-size: 16px;
        margin: 0;
        color: #333;
      }

      .ep-tree-close-btn {
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

      .ep-tree-editor-form {
        display: none;
        flex-direction: column;
        gap: 8px;
        margin-top: 10px;
      }

      .ep-tree-actions-form {
        margin-top: 12px;
        display: none;
        flex-direction: column;
        gap: 8px;
      }

      .ep-tree-form-group {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .ep-tree-form-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 2px;
      }

      .ep-tree-control-panel label {
        font-size: 12px;
        color: #666;
        font-weight: bold;
      }

      .ep-tree-control-panel input[type="text"],
      .ep-tree-control-panel select {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 13px;
        width: 100%;
      }

      .ep-tree-control-panel input[type="checkbox"] {
        width: 16px;
        height: 16px;
        cursor: pointer;
        margin: 0;
      }

      .ep-tree-no-selection {
        color: #888;
        font-style: italic;
        text-align: center;
        margin: 10px 0;
        font-size: 13px;
      }

      .ep-tree-device-id {
        font-size: 14px;
        font-weight: bold;
        text-anchor: start;
        fill: #111;
        pointer-events: none;
      }

      .ep-tree-device-label {
        font-size: 12px;
        text-anchor: start;
        fill: #444;
        pointer-events: none;
      }

      .ep-tree-device-rating {
        font-size: 13px;
        text-anchor: start;
        fill: #0056b3;
        font-weight: bold;
        pointer-events: none;
      }

      .ep-tree-device-group {
        cursor: pointer;
        outline: none;
      }

      .ep-tree-symbol-draw {
        stroke: black;
        stroke-width: 2;
        fill: none;
      }

      .ep-tree-device-group.selected .ep-tree-symbol-draw {
        stroke: #007bff;
        stroke-width: 3;
        filter: drop-shadow(0 0 5px rgba(0,123,255,.4));
      }

      .ep-tree-device-group.selected .ep-tree-hitbox {
        fill: rgba(0,123,255,.05);
        stroke: #007bff;
        stroke-dasharray: 4;
      }

      .ep-tree-text-backdrop {
        fill: white;
        pointer-events: none;
      }
    `;

    document.head.appendChild(style);
  }

  function symbolsMarkup() {
    return `
      <defs>
        <symbol id="ep-tree-sym-mcb" viewBox="0 0 40 100">
          <line x1="20" y1="0" x2="20" y2="30" class="ep-tree-symbol-draw"/>
          <line x1="20" y1="30" x2="10" y2="50" class="ep-tree-symbol-draw"/>
          <circle cx="20" cy="55" r="2" fill="black"/>
          <line x1="20" y1="55" x2="20" y2="100" class="ep-tree-symbol-draw"/>
          <rect x="15" y="65" width="10" height="15" class="ep-tree-symbol-draw" stroke-width="1.5"/>
          <line x1="15" y1="65" x2="25" y2="80" class="ep-tree-symbol-draw" stroke-width="1.5"/>
        </symbol>

        <symbol id="ep-tree-sym-rcd" viewBox="0 0 40 100">
          <line x1="20" y1="0" x2="20" y2="30" class="ep-tree-symbol-draw"/>
          <line x1="20" y1="30" x2="10" y2="50" class="ep-tree-symbol-draw"/>
          <circle cx="20" cy="55" r="2" fill="black"/>
          <line x1="20" y1="55" x2="20" y2="100" class="ep-tree-symbol-draw"/>
          <ellipse cx="20" cy="75" rx="10" ry="15" class="ep-tree-symbol-draw" stroke-width="1.5"/>
        </symbol>

        <symbol id="ep-tree-sym-rcbo" viewBox="0 0 40 100">
          <line x1="20" y1="0" x2="20" y2="30" class="ep-tree-symbol-draw"/>
          <line x1="20" y1="30" x2="10" y2="50" class="ep-tree-symbol-draw"/>
          <circle cx="20" cy="55" r="2" fill="black"/>
          <line x1="20" y1="55" x2="20" y2="100" class="ep-tree-symbol-draw"/>
          <rect x="15" y="62" width="10" height="10" class="ep-tree-symbol-draw" stroke-width="1.5"/>
          <line x1="15" y1="62" x2="25" y2="72" class="ep-tree-symbol-draw" stroke-width="1.5"/>
          <ellipse cx="20" cy="85" rx="8" ry="12" class="ep-tree-symbol-draw" stroke-width="1.5"/>
        </symbol>

        <symbol id="ep-tree-sym-switch" viewBox="0 0 40 100">
          <line x1="20" y1="0" x2="20" y2="30" class="ep-tree-symbol-draw"/>
          <line x1="20" y1="30" x2="10" y2="50" class="ep-tree-symbol-draw"/>
          <circle cx="20" cy="55" r="2" fill="black"/>
          <line x1="20" y1="55" x2="20" y2="100" class="ep-tree-symbol-draw"/>
          <line x1="3" y1="50" x2="17" y2="50" class="ep-tree-symbol-draw"/>
        </symbol>

        <symbol id="ep-tree-sym-relay" viewBox="0 0 40 100">
          <line x1="20" y1="0" x2="20" y2="25" class="ep-tree-symbol-draw"/>
          <rect x="5" y="25" width="30" height="50" class="ep-tree-symbol-draw" stroke-width="1.5"/>
          <text x="20" y="55" font-size="14" text-anchor="middle" font-weight="bold" pointer-events="none">U</text>
          <line x1="20" y1="75" x2="20" y2="100" class="ep-tree-symbol-draw"/>
        </symbol>

        <symbol id="ep-tree-sym-meter" viewBox="0 0 40 100">
          <line x1="20" y1="0" x2="20" y2="20" class="ep-tree-symbol-draw"/>
          <rect x="5" y="20" width="30" height="60" class="ep-tree-symbol-draw" stroke-width="1.5"/>
          <text x="20" y="55" font-size="10" text-anchor="middle" font-weight="bold" pointer-events="none">kWh</text>
          <line x1="20" y1="80" x2="20" y2="100" class="ep-tree-symbol-draw"/>
        </symbol>

        <symbol id="ep-tree-sym-spd" viewBox="0 0 40 100">
          <line x1="20" y1="0" x2="20" y2="30" class="ep-tree-symbol-draw"/>
          <rect x="10" y="30" width="20" height="40" class="ep-tree-symbol-draw" stroke-width="1.5"/>
          <line x1="10" y1="70" x2="30" y2="30" class="ep-tree-symbol-draw"/>
          <line x1="20" y1="70" x2="20" y2="100" class="ep-tree-symbol-draw"/>
        </symbol>

        <symbol id="ep-tree-sym-contactor" viewBox="0 0 40 100">
          <line x1="20" y1="0" x2="20" y2="30" class="ep-tree-symbol-draw"/>
          <line x1="20" y1="30" x2="10" y2="50" class="ep-tree-symbol-draw"/>
          <circle cx="20" cy="55" r="2" fill="black"/>
          <line x1="20" y1="55" x2="20" y2="100" class="ep-tree-symbol-draw"/>
          <rect x="15" y="70" width="10" height="15" class="ep-tree-symbol-draw" stroke-width="1.5"/>
          <line x1="15" y1="70" x2="25" y2="85" class="ep-tree-symbol-draw"/>
        </symbol>
      </defs>
    `;
  }

  function modalMarkup() {
    return `
      <div class="ep-tree-topbar">
        <div class="ep-tree-title">
          📐 Однолинейная схема щита
          <small>Древовидная логика из твоего HTML · ${VERSION}</small>
        </div>
        <div class="ep-tree-top-actions">
          <button type="button" class="ep-tree-btn" data-action="reset">Сброс</button>
          <button type="button" class="ep-tree-btn ep-tree-btn-danger" data-action="close">Закрыть</button>
        </div>
      </div>

      <div class="ep-tree-main-layout">
        <div class="ep-tree-canvas-container">
          <svg class="ep-tree-diagram" xmlns="http://www.w3.org/2000/svg">
            ${symbolsMarkup()}
            <g id="ep-tree-scheme-root"></g>
          </svg>
        </div>

        <aside class="ep-tree-control-panel">
          <div class="ep-tree-panel-header">
            <h2>Редактор</h2>
            <button type="button" class="ep-tree-close-btn">&times;</button>
          </div>

          <div class="ep-tree-no-selection">Кликните на аппарат для настройки</div>

          <form class="ep-tree-editor-form">
            <div class="ep-tree-form-group">
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
              <div class="ep-tree-form-group" style="flex:1;">
                <label>ID:</label>
                <input type="text" data-field="id" placeholder="QF2">
              </div>
              <div class="ep-tree-form-group" style="flex:2;">
                <label>Номинал:</label>
                <input type="text" data-field="rating" placeholder="16A">
              </div>
            </div>

            <div class="ep-tree-form-group">
              <label>Название группы:</label>
              <input type="text" data-field="label" placeholder="Свет Зал">
            </div>

            <div class="ep-tree-form-row">
              <input type="checkbox" data-field="cross" id="ep-tree-cross">
              <label for="ep-tree-cross" style="cursor:pointer; color:#333;">Кросс-модуль под аппаратом</label>
            </div>

            <button type="submit" class="ep-tree-btn ep-tree-btn-primary" style="margin-top:2px;">Сохранить изменения</button>
          </form>

          <div class="ep-tree-actions-form">
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
                <button type="button" class="ep-tree-btn ep-tree-btn-primary" data-action="add">+ Добавить</button>
              </div>
            </div>

            <button type="button" class="ep-tree-btn ep-tree-btn-danger" data-action="delete" style="margin-top:8px;">Удалить весь узел</button>
          </div>
        </aside>
      </div>
    `;
  }

  let els = {};

  function open() {
    ensureStyle();

    schemeTree = loadTree();

    let modal = document.getElementById(MODAL_ID);
    if (!modal) {
      modal = document.createElement("div");
      modal.id = MODAL_ID;
      modal.innerHTML = modalMarkup();
      document.body.appendChild(modal);
      bindModal(modal);
    }

    modal.style.display = "flex";
    render();
  }

  function close() {
    const modal = document.getElementById(MODAL_ID);
    if (modal) modal.style.display = "none";
  }

  function bindModal(modal) {
    svg = modal.querySelector(".ep-tree-diagram");
    schemeRoot = modal.querySelector("#ep-tree-scheme-root");

    els = {
      modal,
      msg: modal.querySelector(".ep-tree-no-selection"),
      editorForm: modal.querySelector(".ep-tree-editor-form"),
      actionsForm: modal.querySelector(".ep-tree-actions-form"),
      closePanel: modal.querySelector(".ep-tree-close-btn"),
      type: modal.querySelector('[data-field="type"]'),
      id: modal.querySelector('[data-field="id"]'),
      label: modal.querySelector('[data-field="label"]'),
      rating: modal.querySelector('[data-field="rating"]'),
      cross: modal.querySelector('[data-field="cross"]'),
      addType: modal.querySelector('[data-field="addType"]')
    };

    modal.querySelector('[data-action="close"]').addEventListener("click", close);
    modal.querySelector('[data-action="reset"]').addEventListener("click", () => {
      if (!confirm("Сбросить схему к примеру?")) return;
      localStorage.removeItem(STORAGE_KEY);
      schemeTree = clone({
        id: "QS1",
        type: "switch",
        label: "Вводной рубильник",
        rating: "63A",
        isCrossModule: false,
        children: [
          {
            id: "KV1",
            type: "relay",
            label: "Реле напр.",
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
                label: "Стиральная маш.",
                rating: "16A/30mA",
                isCrossModule: false,
                children: []
              }
            ]
          }
        ]
      });
      saveTree();
      render();
      selectNode(null);
    });

    els.closePanel.addEventListener("click", () => selectNode(null));

    svg.addEventListener("click", (e) => {
      let group = e.target;
      while (group && group !== svg) {
        if (group.classList && group.classList.contains("ep-tree-device-group")) break;
        group = group.parentNode;
      }

      if (group && group !== svg) {
        selectNode(group.getAttribute("data-id"));
      } else {
        selectNode(null);
      }
    });

    els.editorForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!selectedNodeId) return;

      const node = findNodeById(schemeTree, selectedNodeId);
      if (!node) return;

      node.type = els.type.value;
      node.id = els.id.value.trim() || node.id;
      node.label = els.label.value.trim() || defaults[node.type].label;
      node.rating = els.rating.value.trim() || defaults[node.type].rating;
      node.isCrossModule = els.cross.checked;

      selectedNodeId = node.id;
      saveTree();
      render();
    });

    modal.querySelector('[data-action="add"]').addEventListener("click", () => {
      if (!selectedNodeId) return;

      const parentNode = findNodeById(schemeTree, selectedNodeId);
      if (!parentNode) return;

      if (!parentNode.children) parentNode.children = [];

      const type = els.addType.value;
      const newId = getNextNodeId(type);
      const def = defaults[type];

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
    });

    modal.querySelector('[data-action="delete"]').addEventListener("click", () => {
      if (!selectedNodeId || selectedNodeId === schemeTree.id) return;

      if (!confirm("Точно удалить аппарат и все его отходящие линии?")) return;

      removeNode(schemeTree, selectedNodeId);
      selectedNodeId = null;
      saveTree();
      render();
      selectNode(null);
    });
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
    schemeRoot.appendChild(line);
  }

  function drawTerminalCircle(x, y) {
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", "3.5");
    circle.setAttribute("fill", "black");
    schemeRoot.appendChild(circle);
  }

  function drawDevice(node) {
    const group = document.createElementNS(svgNS, "g");
    group.setAttribute("transform", `translate(${node.x}, ${node.y})`);
    group.setAttribute("class", "ep-tree-device-group");
    group.setAttribute("data-id", node.id);

    const hitbox = document.createElementNS(svgNS, "rect");
    hitbox.setAttribute("x", -30);
    hitbox.setAttribute("y", -20);
    hitbox.setAttribute("width", 180);
    hitbox.setAttribute("height", 160);
    hitbox.setAttribute("fill", "transparent");
    hitbox.setAttribute("class", "ep-tree-hitbox");
    group.appendChild(hitbox);

    const use = document.createElementNS(svgNS, "use");
    use.setAttribute("href", `#ep-tree-sym-${node.type}`);
    use.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#ep-tree-sym-${node.type}`);
    use.setAttribute("x", -20);
    use.setAttribute("y", 0);
    use.setAttribute("width", 40);
    use.setAttribute("height", 100);
    group.appendChild(use);

    const textId = document.createElementNS(svgNS, "text");
    textId.setAttribute("x", TEXT_OFFSET_X);
    textId.setAttribute("y", 20);
    textId.setAttribute("class", "ep-tree-device-id");
    textId.textContent = node.id;
    group.appendChild(textId);

    const hasChildren = node.children && node.children.length > 0;

    if (hasChildren || node.isCrossModule) {
      const textLabel = document.createElementNS(svgNS, "text");
      textLabel.setAttribute("x", TEXT_OFFSET_X);
      textLabel.setAttribute("y", 45);
      textLabel.setAttribute("class", "ep-tree-device-label");
      textLabel.textContent = node.label;
      group.appendChild(textLabel);

      const textRating = document.createElementNS(svgNS, "text");
      textRating.setAttribute("x", TEXT_OFFSET_X);
      textRating.setAttribute("y", 65);
      textRating.setAttribute("class", "ep-tree-device-rating");
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
      backdrop.setAttribute("class", "ep-tree-text-backdrop");
      labelGroup.appendChild(backdrop);

      const textLabel = document.createElementNS(svgNS, "text");
      textLabel.setAttribute("x", TEXT_OFFSET_X);
      textLabel.setAttribute("y", 5);
      textLabel.setAttribute("class", "ep-tree-device-label");
      textLabel.textContent = node.label;
      labelGroup.appendChild(textLabel);

      const textRating = document.createElementNS(svgNS, "text");
      textRating.setAttribute("x", TEXT_OFFSET_X);
      textRating.setAttribute("y", 23);
      textRating.setAttribute("class", "ep-tree-device-rating");
      textRating.textContent = node.rating;
      labelGroup.appendChild(textRating);

      group.appendChild(labelGroup);
    }

    schemeRoot.appendChild(group);
  }

  function calculatePositions(node, depth = 0) {
    node.y = START_Y + depth * SPACING_Y;

    if (node.y > maxDrawY) maxDrawY = node.y;

    if (!node.children || node.children.length === 0) {
      node.x = leafCount * SPACING_X;
      leafCount++;
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

    if (node.id === schemeTree.id) {
      const totalWidth = Math.max(1, leafCount - 1) * SPACING_X;
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
        schemeRoot.appendChild(rect);

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
    if (!svg || !schemeRoot) return;

    schemeRoot.innerHTML = "";
    leafCount = 0;
    maxDrawY = 0;

    calculatePositions(schemeTree);
    shiftTree(schemeTree, 120);

    svg.setAttribute("width", Math.max(500, leafCount * SPACING_X + 160));
    svg.setAttribute("height", maxDrawY + 300);

    drawTree(schemeTree);
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

  function selectNode(id) {
    selectedNodeId = id;

    document.querySelectorAll(".ep-tree-device-group.selected").forEach((el) => {
      el.classList.remove("selected");
    });

    if (id) {
      const group = document.querySelector(`.ep-tree-device-group[data-id="${id}"]`);
      if (group) group.classList.add("selected");

      const node = findNodeById(schemeTree, id);
      if (node) {
        els.type.value = node.type || "mcb";
        els.id.value = node.id || "";
        els.label.value = node.label || "";
        els.rating.value = node.rating || "";
        els.cross.checked = !!node.isCrossModule;

        els.actionsForm.style.display = "flex";
        els.msg.style.display = "none";
        els.editorForm.style.display = "flex";
        els.closePanel.style.display = "block";
      }
    } else {
      els.msg.style.display = "block";
      els.editorForm.style.display = "none";
      els.actionsForm.style.display = "none";
      els.closePanel.style.display = "none";
    }
  }

  function reapplySelection() {
    if (!selectedNodeId) return;
    const group = document.querySelector(`.ep-tree-device-group[data-id="${selectedNodeId}"]`);
    if (group) group.classList.add("selected");
  }

  function getNextNodeId(type) {
    const prefix = defaults[type].prefix || "QF";
    let count = 0;

    function countNodes(node) {
      if (String(node.id || "").startsWith(prefix)) count++;
      if (node.children) node.children.forEach(countNodes);
    }

    countNodes(schemeTree);
    return prefix + (count + 1);
  }

  function removeNode(parent, id) {
    if (!parent.children) return false;

    for (let i = 0; i < parent.children.length; i++) {
      if (parent.children[i].id === id) {
        parent.children.splice(i, 1);
        return true;
      }

      if (removeNode(parent.children[i], id)) return true;
    }

    return false;
  }

  function text(el) {
    return String((el && el.textContent) || "").toLowerCase();
  }

  function findShieldPanel() {
    const direct = [
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

    for (const selector of direct) {
      const el = document.querySelector(selector);
      if (el) return el;
    }

    const candidates = Array.from(document.querySelectorAll("section, aside, main, article, div"))
      .filter((el) => {
        if (el.closest("#" + MODAL_ID)) return false;
        const t = text(el);
        return (
          t.includes("сборка щита") ||
          t.includes("ручная сборка") ||
          t.includes("настройки автоматики") ||
          t.includes("сгенерировать щит") ||
          t.includes("марка щита") ||
          t.includes("тип защиты")
        );
      })
      .map((el) => {
        const t = text(el).slice(0, 5000);
        let score = 0;

        if (t.includes("сборка щита")) score += 30;
        if (t.includes("ручная сборка")) score += 20;
        if (t.includes("настройки автоматики")) score += 15;
        if (t.includes("сгенерировать щит")) score += 15;
        if (t.includes("марка щита")) score += 10;
        if (t.includes("тип защиты")) score += 10;
        if (t.includes("узо")) score += 3;
        if (t.includes("диф")) score += 3;
        if (t.includes("автомат")) score += 2;

        return { el, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    return candidates.length ? candidates[0].el : null;
  }

  function createButtonRow() {
    let row = document.getElementById(BUTTON_ROW_ID);
    if (row) return row;

    row = document.createElement("div");
    row.id = BUTTON_ROW_ID;
    row.innerHTML = `
      <button type="button" id="${BUTTON_ID}">
        <span>📐 Схема щита</span>
        <small>дерево</small>
      </button>
    `;

    return row;
  }

  function mountButton() {
    ensureStyle();

    document.querySelectorAll("#ep-single-line-launcher, #ep-scheme-inside-shield, #ep-sl-shield-host, #ep-scheme-shield-row-v50").forEach((el) => {
      el.remove();
    });

    const panel = findShieldPanel();
    if (!panel) return false;

    const row = createButtonRow();

    if (!panel.contains(row)) {
      const buttons = Array.from(panel.querySelectorAll("button"));
      const manualBtn = buttons.find((btn) => text(btn).includes("ручная сборка"));

      if (manualBtn && manualBtn.parentElement) {
        manualBtn.parentElement.insertAdjacentElement("afterend", row);
      } else {
        panel.insertBefore(row, panel.firstChild ? panel.firstChild.nextSibling : null);
      }
    }

    const btn = document.getElementById(BUTTON_ID);
    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = "1";
      btn.addEventListener("click", open);
    }

    return true;
  }

  window.EP_SINGLE_LINE_SCHEME = {
    version: VERSION,
    open,
    close,
    render,
    getTree: () => clone(schemeTree),
    setTree: (tree) => {
      if (tree && tree.id) {
        schemeTree = clone(tree);
        saveTree();
        render();
      }
    }
  };

  window.openSingleLineScheme = open;

  function boot() {
    ensureStyle();
    mountButton();

    const observer = new MutationObserver(() => {
      mountButton();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"]
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  console.log("06-single-line-scheme.js", VERSION, "loaded");
})();
