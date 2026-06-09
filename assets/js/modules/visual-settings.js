window.EP = window.EP || {};

EP.VisualSettings = {
  key: "ep.visual.v29",

  defaults: {
    theme: "dark",
    palette: "green",
    radius: "soft",
    motion: "normal"
  },

  read() {
    try {
      return Object.assign({}, this.defaults, JSON.parse(localStorage.getItem(this.key) || "{}"));
    } catch (error) {
      return Object.assign({}, this.defaults);
    }
  },

  save(next) {
    const value = Object.assign({}, this.read(), next || {});
    localStorage.setItem(this.key, JSON.stringify(value));
    this.apply(value);
    this.render();
  },

  apply(value) {
    const settings = value || this.read();
    const root = document.documentElement;

    root.dataset.epTheme = settings.theme;
    root.dataset.epPalette = settings.palette;
    root.dataset.epRadius = settings.radius;
    root.dataset.epMotion = settings.motion;
  },

  init() {
    this.apply();

    window.addEventListener("ep:route-loaded", (event) => {
      if (event.detail && event.detail.route === "settings") {
        this.render();
      }
    });
  },

  optionButton(group, value, label, current) {
    const active = current === value ? "active" : "";
    return `<button class="ep-choice ${active}" type="button" data-visual-group="${group}" data-visual-value="${value}">${label}</button>`;
  },

  render() {
    const root = document.querySelector("#visual-settings-root");
    if (!root) return;

    const current = this.read();

    root.innerHTML = `
      <div class="ep-settings-grid">
        <div class="card">
          <h2>Настройки визуала</h2>
          <p class="ep-setting-note">Чистый модуль V29.1. Настройки сохраняются в localStorage и применяются ко всей оболочке.</p>
        </div>

        <div class="card">
          <div class="ep-setting-row">
            <div class="ep-setting-title">Тема</div>
            <div class="ep-choice-row">
              ${this.optionButton("theme", "dark", "Тёмная", current.theme)}
              ${this.optionButton("theme", "light", "Светлая", current.theme)}
            </div>
          </div>

          <div class="ep-setting-row">
            <div class="ep-setting-title">Акцент</div>
            <div class="ep-choice-row">
              ${this.optionButton("palette", "green", "Зелёный", current.palette)}
              ${this.optionButton("palette", "blue", "Синий", current.palette)}
              ${this.optionButton("palette", "purple", "Фиолетовый", current.palette)}
              ${this.optionButton("palette", "orange", "Оранжевый", current.palette)}
              ${this.optionButton("palette", "red", "Красный", current.palette)}
            </div>
          </div>

          <div class="ep-setting-row">
            <div class="ep-setting-title">Скругления</div>
            <div class="ep-choice-row">
              ${this.optionButton("radius", "compact", "Компактно", current.radius)}
              ${this.optionButton("radius", "soft", "Мягко", current.radius)}
              ${this.optionButton("radius", "round", "Круглее", current.radius)}
            </div>
          </div>

          <div class="ep-setting-row">
            <div class="ep-setting-title">Анимации</div>
            <div class="ep-choice-row">
              ${this.optionButton("motion", "normal", "Обычные", current.motion)}
              ${this.optionButton("motion", "fast", "Быстрые", current.motion)}
              ${this.optionButton("motion", "off", "Выключить", current.motion)}
            </div>
          </div>
        </div>

        <div class="ep-preview-card">
          <h3>Предпросмотр</h3>
          <p>Так будут выглядеть карточки, кнопки и основная оболочка.</p>
          <button class="tile" type="button">Пример кнопки</button>
        </div>
      </div>
    `;

    root.querySelectorAll("[data-visual-group]").forEach((button) => {
      button.addEventListener("click", () => {
        this.save({ [button.dataset.visualGroup]: button.dataset.visualValue });
      });
    });
  }
};
