(function () {
  window.EP = window.EP || {};

  const KEY = "ep_visual_settings_clean_v5_3";
  const NEXT_KEY = "ep.visual.v29";

  const themes = [
    ["aurora", "Аврора", "#07111f", "#13213a", "#0f766e", "#22c55e", "#f8fafc", "#a7b0c0", "#0f172a"],
    ["graphite", "Графит", "#09090b", "#18181b", "#3f3f46", "#eab308", "#f8fafc", "#b4b4b8", "#18181b"],
    ["emerald", "Изумруд", "#052e2b", "#064e3b", "#022c22", "#34d399", "#ecfdf5", "#a7f3d0", "#052e2b"],
    ["sunset", "Закат", "#1f1020", "#431407", "#7c2d12", "#fb923c", "#fff7ed", "#fed7aa", "#1f1020"],
    ["ocean", "Океан", "#061526", "#0f2747", "#075985", "#38bdf8", "#f0f9ff", "#bae6fd", "#0f172a"],
    ["violet", "Фиолет", "#140b2d", "#2e1065", "#581c87", "#c084fc", "#faf5ff", "#ddd6fe", "#1e123d"],
    ["carbon", "Карбон", "#020617", "#111827", "#1e293b", "#94a3b8", "#f8fafc", "#cbd5e1", "#020617"],
    ["ice", "Лёд", "#0f172a", "#1e3a8a", "#0369a1", "#67e8f9", "#f0f9ff", "#bae6fd", "#0f172a"],
    ["rose", "Роза", "#2a0f1f", "#831843", "#9f1239", "#fb7185", "#fff1f2", "#fecdd3", "#2a0f1f"],
    ["mono", "Моно", "#111111", "#262626", "#404040", "#ffffff", "#ffffff", "#d4d4d4", "#171717"]
  ].map(([id, name, bgA, bgB, bgC, accent, text, muted, card]) => ({ id, name, bgA, bgB, bgC, accent, text, muted, card }));

  const base = {
    themeId: "aurora",
    mode: "night",
    profile: "night",
    accent: "#22c55e",
    buttonColor: "#22c55e",
    textColor: "#f8fafc",
    mutedColor: "#a7b0c0",
    backgroundColor: "#07111f",
    cardColor: "#0f172a",
    opacity: 0.72,
    buttonOpacity: 0.82,
    radius: 22,
    buttonRadius: 15,
    blur: 16,
    density: "normal",
    fontScale: 1,
    buttonShape: "soft",
    backgroundStyle: "glass",
    animationStyle: "soft",
    animationSpeed: 1,
    reduceMotion: false,
    electricPulse: false,
    soundEnabled: false,
    hapticEnabled: true,
    soundVolume: 0.28,
    soundStyle: "soft",
    advancedOpen: true
  };

  let settings = load();

  function load() {
    try {
      const fromOld = JSON.parse(localStorage.getItem(KEY) || "{}");
      const fromNew = JSON.parse(localStorage.getItem(NEXT_KEY) || "{}");
      const value = Object.assign({}, base, fromOld, fromNew);
      return normalizeValue(value);
    } catch (error) {
      return Object.assign({}, base);
    }
  }

  function normalizeValue(value) {
    const next = Object.assign({}, base, value || {});
    if (next.backgroundStyle === "static") next.backgroundStyle = "glass";
    if (next.backgroundStyle === "live") next.backgroundStyle = "glass";
    if (next.soundStyle === "electric") next.soundStyle = "electric-soft";
    if (next.soundStyle === "click") next.soundStyle = "short";
    return next;
  }

  function save() {
    settings = normalizeValue(settings);
    localStorage.setItem(KEY, JSON.stringify(settings));
    localStorage.setItem(NEXT_KEY, JSON.stringify(settings));
  }

  function autoMode() {
    const h = new Date().getHours();
    return h >= 7 && h < 20 ? "day" : "night";
  }

  function activeMode() {
    return settings.mode === "auto" ? autoMode() : settings.mode;
  }

  function rgb(hex) {
    const s = String(hex || "").replace("#", "");
    if (!/^[0-9a-f]{6}$/i.test(s)) return null;
    return {
      r: parseInt(s.slice(0, 2), 16),
      g: parseInt(s.slice(2, 4), 16),
      b: parseInt(s.slice(4, 6), 16)
    };
  }

  function dayOverride() {
    if (activeMode() !== "day") return {};
    return {
      textColor: "#0f172a",
      mutedColor: "#475569",
      cardColor: "#ffffff",
      backgroundColor: "#e7eef8",
      opacity: Math.max(Number(settings.opacity || 0), 0.68)
    };
  }

  function apply(value) {
    settings = normalizeValue(value || settings);
    const theme = themes.find((item) => item.id === settings.themeId) || themes[0];
    const day = dayOverride();
    const root = document.documentElement;
    const body = document.body;

    root.style.setProperty("--bg-a", day.backgroundColor || settings.backgroundColor || theme.bgA);
    root.style.setProperty("--bg-b", activeMode() === "day" ? "#cbdaf0" : theme.bgB);
    root.style.setProperty("--bg-c", activeMode() === "day" ? "#d9f4ef" : theme.bgC);
    root.style.setProperty("--accent", settings.accent || theme.accent);
    root.style.setProperty("--button-bg", settings.buttonColor || settings.accent || theme.accent);
    root.style.setProperty("--text", day.textColor || settings.textColor || theme.text);
    root.style.setProperty("--muted", day.mutedColor || settings.mutedColor || theme.muted);
    root.style.setProperty("--card-opacity", String(day.opacity || settings.opacity));
    root.style.setProperty("--button-opacity", String(settings.buttonOpacity));
    root.style.setProperty("--radius", `${Number(settings.radius || base.radius)}px`);
    root.style.setProperty("--button-radius", `${Number(settings.buttonRadius || base.buttonRadius)}px`);
    root.style.setProperty("--blur", `${Number(settings.blur || base.blur)}px`);
    root.style.setProperty("--font-scale", String(settings.fontScale || 1));
    root.style.setProperty("--anim-speed", String(settings.animationSpeed || 1));

    const cardRgb = rgb(day.cardColor || settings.cardColor || theme.card);
    if (cardRgb) root.style.setProperty("--card-bg-rgb", `${cardRgb.r}, ${cardRgb.g}, ${cardRgb.b}`);

    if (body) {
      body.dataset.density = settings.density;
      body.dataset.visualMode = activeMode();
      body.dataset.buttonShape = settings.buttonShape;
      body.dataset.animation = settings.animationStyle;
      body.dataset.reduceMotion = settings.reduceMotion ? "true" : "false";
      body.dataset.electricPulse = settings.electricPulse ? "true" : "false";
      body.dataset.bgStyle = settings.backgroundStyle;
      body.dataset.soundEnabled = settings.soundEnabled ? "true" : "false";
      body.dataset.hapticEnabled = settings.hapticEnabled ? "true" : "false";
    }

    window.SoundAPI?.setSettings?.({
      soundEnabled: settings.soundEnabled,
      hapticEnabled: settings.hapticEnabled,
      volume: settings.soundVolume,
      style: settings.soundStyle
    });
  }

  function themeButton(theme) {
    const active = settings.themeId === theme.id ? "active" : "";
    return `
      <button class="theme-btn ep-clickable ${active}" type="button" data-theme="${theme.id}" style="background:linear-gradient(135deg,${theme.bgA},${theme.bgB},${theme.bgC})">
        <strong>${theme.name}</strong>
        <small>${theme.id}</small>
      </button>
    `;
  }

  function modeButton(id, label) {
    const active = settings.mode === id ? "active" : "";
    return `<button class="${active}" type="button" data-visual-mode="${id}">${label}</button>`;
  }

  function profileButton(id, label) {
    const active = settings.profile === id ? "active" : "";
    return `<button class="${active}" type="button" data-profile="${id}">${label}</button>`;
  }

  function switchControl(id, key, label) {
    const checked = settings[key] ? "checked" : "";
    return `
      <label class="switch-row" for="${id}">
        <span>${label}</span>
        <input id="${id}" type="checkbox" data-visual-key="${key}" ${checked} />
        <i aria-hidden="true"></i>
      </label>
    `;
  }

  function colorControl(id, key, label) {
    return `<label>${label}<input id="${id}" type="color" data-visual-key="${key}" value="${settings[key] || base[key]}" /></label>`;
  }

  function rangeControl(id, key, label, min, max, step) {
    return `
      <label>${label}
        <input id="${id}" type="range" data-visual-key="${key}" min="${min}" max="${max}" step="${step}" value="${settings[key]}" />
        <small data-range-value="${key}">${settings[key]}</small>
      </label>
    `;
  }

  function selectControl(id, key, label, options) {
    const items = options.map(([value, text]) => `<option value="${value}" ${settings[key] === value ? "selected" : ""}>${text}</option>`).join("");
    return `<label>${label}<select id="${id}" data-visual-key="${key}">${items}</select></label>`;
  }

  function applyProfile(profile) {
    settings.profile = profile;

    if (profile === "object") {
      Object.assign(settings, {
        mode: "day",
        density: "large",
        fontScale: 1.06,
        animationStyle: "fast",
        animationSpeed: 0.75,
        buttonShape: "round",
        opacity: 0.78,
        backgroundStyle: "glass"
      });
    }

    if (profile === "night") {
      Object.assign(settings, {
        mode: "night",
        animationStyle: "soft",
        backgroundStyle: "glass",
        opacity: 0.72
      });
    }

    if (profile === "day") {
      Object.assign(settings, {
        mode: "day",
        opacity: 0.72,
        backgroundStyle: "light",
        textColor: "#0f172a",
        mutedColor: "#475569",
        cardColor: "#ffffff"
      });
    }

    if (profile === "battery") {
      Object.assign(settings, {
        animationStyle: "minimal",
        animationSpeed: 0.6,
        reduceMotion: true,
        backgroundStyle: "minimal",
        electricPulse: false,
        soundEnabled: false
      });
    }

    if (profile === "premium") {
      Object.assign(settings, {
        animationStyle: "premium",
        animationSpeed: 1.15,
        backgroundStyle: "glass",
        electricPulse: false,
        buttonShape: "soft",
        opacity: 0.74
      });
    }

    if (profile === "readable") {
      Object.assign(settings, {
        mode: "day",
        fontScale: 1.1,
        density: "large",
        buttonShape: "round",
        opacity: 0.86,
        textColor: "#020617",
        mutedColor: "#334155",
        backgroundStyle: "light"
      });
    }

    commit();
  }

  function commit() {
    save();
    apply();
    render();
    window.SoundAPI?.click?.();
  }

  function resetKeepTheme() {
    const themeId = settings.themeId;
    const mode = settings.mode;
    settings = Object.assign({}, base, { themeId, mode });
    const theme = themes.find((item) => item.id === themeId) || themes[0];
    Object.assign(settings, {
      accent: theme.accent,
      buttonColor: theme.accent,
      backgroundColor: theme.bgA,
      cardColor: theme.card,
      textColor: theme.text,
      mutedColor: theme.muted
    });
    commit();
  }

  function baseReset() {
    settings = Object.assign({}, base);
    commit();
  }

  function render() {
    const root = document.getElementById("visual-settings-root");
    if (!root) return;

    root.innerHTML = `
      <section class="page visual-settings-page">
        <div class="page-head">
          <h1>Настройки визуала</h1>
          <p>Перенесённый модуль из основного проекта: темы, режимы, профили, цвета, прозрачность, скругления, анимации, звук и отклик.</p>
        </div>

        <div class="card visual-card">
          <div class="visual-section">
            <p class="visual-section-title">Готовые темы</p>
            <div class="theme-grid">${themes.map(themeButton).join("")}</div>
          </div>

          <div class="visual-section">
            <p class="visual-section-title">Режим отображения</p>
            <div class="segmented-control">
              ${modeButton("night", "Ночь")}
              ${modeButton("day", "День")}
              ${modeButton("auto", "Авто")}
            </div>
          </div>

          <div class="visual-section">
            <p class="visual-section-title">Быстрые профили</p>
            <div class="quick-profile-grid">
              ${profileButton("night", "Ночной")}
              ${profileButton("object", "На объекте")}
              ${profileButton("day", "Дневной")}
              ${profileButton("battery", "Эконом")}
              ${profileButton("premium", "Премиум")}
              ${profileButton("readable", "Читабельно")}
            </div>
          </div>

          <button id="toggleAdvancedVisualBtn" class="btn btn-ghost btn-wide ep-clickable" type="button">
            ${settings.advancedOpen ? "Скрыть расширенную настройку" : "Расширенная настройка"}
          </button>

          <div id="advancedVisualPanel" class="advanced-visual-panel ${settings.advancedOpen ? "" : "hidden"}">
            <div class="visual-section">
              <p class="visual-section-title">Цвета</p>
              <div class="settings-grid grid-2">
                ${colorControl("accentColorInput", "accent", "Акцентный цвет")}
                ${colorControl("buttonColorInput", "buttonColor", "Цвет кнопок")}
                ${colorControl("textColorInput", "textColor", "Текст")}
                ${colorControl("mutedColorInput", "mutedColor", "Вторичный текст")}
                ${colorControl("backgroundColorInput", "backgroundColor", "Фон")}
                ${colorControl("cardColorInput", "cardColor", "Карточки")}
              </div>
            </div>

            <div class="visual-section">
              <p class="visual-section-title">Стекло и размеры</p>
              <div class="settings-grid grid-2">
                ${rangeControl("glassOpacityInput", "opacity", "Прозрачность карточек", 0.35, 0.95, 0.01)}
                ${rangeControl("buttonOpacityInput", "buttonOpacity", "Плотность кнопок", 0.35, 1, 0.01)}
                ${rangeControl("radiusInput", "radius", "Скругление карточек", 8, 34, 1)}
                ${rangeControl("buttonRadiusInput", "buttonRadius", "Скругление кнопок", 6, 30, 1)}
                ${rangeControl("blurInput", "blur", "Размытие стекла", 0, 28, 1)}
                ${rangeControl("fontScaleInput", "fontScale", "Масштаб шрифта", 0.9, 1.16, 0.01)}
              </div>
            </div>

            <div class="visual-section">
              <p class="visual-section-title">Поведение интерфейса</p>
              <div class="settings-grid grid-2">
                ${selectControl("densityInput", "density", "Плотность", [["compact", "Компактно"], ["normal", "Обычно"], ["large", "Крупнее"]])}
                ${selectControl("buttonShapeInput", "buttonShape", "Форма кнопок", [["soft", "Мягкая"], ["round", "Круглая"], ["pill", "Пилюля"], ["square", "Квадратнее"], ["minimal", "Минимальная"]])}
                ${selectControl("backgroundStyleInput", "backgroundStyle", "Стиль фона", [["glass", "Стекло"], ["gradient", "Градиент"], ["blueprint", "Чертёж"], ["dark", "Тёмный"], ["light", "Светлый"], ["solid", "Сплошной"], ["minimal", "Минимальный"], ["neon", "Неон"]])}
                ${selectControl("animationStyleInput", "animationStyle", "Анимация", [["soft", "Мягкая"], ["fast", "Быстрая"], ["spring", "Пружина"], ["premium", "Премиум"], ["minimal", "Минимальная"], ["off", "Без анимации"]])}
                ${rangeControl("animationSpeedInput", "animationSpeed", "Скорость анимации", 0.4, 1.6, 0.05)}
                ${selectControl("soundStyleInput", "soundStyle", "Звук", [["soft", "Мягкий"], ["short", "Короткий"], ["electric-soft", "Электро мягкий"], ["silent", "Тихий"]])}
                ${rangeControl("soundVolumeInput", "soundVolume", "Громкость", 0, 1, 0.01)}
              </div>
            </div>

            <div class="visual-section">
              <p class="visual-section-title">Отклик</p>
              <div class="settings-grid">
                ${switchControl("reduceMotionInput", "reduceMotion", "Уменьшить анимации")}
                ${switchControl("electricPulseInput", "electricPulse", "Электро-импульс на кнопках")}
                ${switchControl("soundEnabledInput", "soundEnabled", "Звуки интерфейса")}
                ${switchControl("hapticEnabledInput", "hapticEnabled", "Виброотклик")}
              </div>
            </div>

            <div class="modal-actions">
              <button id="testSoundBtn" class="btn btn-ghost ep-clickable" type="button">Проверить звук</button>
              <button id="resetVisualBtn" class="btn btn-ghost ep-clickable" type="button">Сбросить текущую тему</button>
              <button id="baseVisualBtn" class="btn btn-danger ep-clickable" type="button">Вернуть базовый визуал</button>
            </div>
          </div>
        </div>
      </section>
    `;

    bind(root);
  }

  function bind(root) {
    root.querySelectorAll("[data-theme]").forEach((button) => {
      button.addEventListener("click", () => {
        const theme = themes.find((item) => item.id === button.dataset.theme) || themes[0];
        settings = Object.assign({}, settings, {
          themeId: theme.id,
          accent: theme.accent,
          buttonColor: theme.accent,
          backgroundColor: theme.bgA,
          cardColor: theme.card,
          textColor: theme.text,
          mutedColor: theme.muted
        });
        commit();
      });
    });

    root.querySelectorAll("[data-visual-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        settings.mode = button.dataset.visualMode;
        commit();
      });
    });

    root.querySelectorAll("[data-profile]").forEach((button) => {
      button.addEventListener("click", () => applyProfile(button.dataset.profile));
    });

    root.querySelectorAll("[data-visual-key]").forEach((input) => {
      const handler = () => {
        let value = input.type === "checkbox" ? input.checked : input.value;
        if (input.type === "range") value = Number(value);
        settings[input.dataset.visualKey] = value;
        save();
        apply();
        const valueNode = root.querySelector(`[data-range-value="${input.dataset.visualKey}"]`);
        if (valueNode) valueNode.textContent = String(value);
      };
      input.addEventListener("input", handler);
      input.addEventListener("change", handler);
    });

    root.querySelector("#toggleAdvancedVisualBtn")?.addEventListener("click", () => {
      settings.advancedOpen = !settings.advancedOpen;
      commit();
    });

    root.querySelector("#testSoundBtn")?.addEventListener("click", async () => {
      await window.SoundAPI?.unlock?.();
      const wasEnabled = settings.soundEnabled;
      settings.soundEnabled = true;
      window.SoundAPI?.setSettings?.({ soundEnabled: true, hapticEnabled: settings.hapticEnabled, volume: settings.soundVolume, style: settings.soundStyle });
      window.SoundAPI?.test?.();
      setTimeout(() => {
        settings.soundEnabled = wasEnabled;
        apply();
      }, 500);
    });

    root.querySelector("#resetVisualBtn")?.addEventListener("click", resetKeepTheme);
    root.querySelector("#baseVisualBtn")?.addEventListener("click", baseReset);
  }

  function init() {
    apply();
    window.addEventListener("ep:route-loaded", (event) => {
      if (event.detail?.route === "settings") render();
      else apply();
    });
  }

  EP.VisualSettings = { init, apply, render, getSettings: () => Object.assign({}, settings) };
  window.VisualSettings = EP.VisualSettings;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
