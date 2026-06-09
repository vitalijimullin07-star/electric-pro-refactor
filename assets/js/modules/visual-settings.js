window.EP = window.EP || {};

EP.VisualSettings = {
  key: "ep.visual.v29.match",

  defaults: {
    mode: "night",
    palette: "green",
    background: "live",
    buttons: "round",
    animation: "premium",
    density: "normal"
  },

  palettes: {
    green: "Зелёный",
    blue: "Синий",
    purple: "Фиолетовый",
    orange: "Оранжевый",
    red: "Красный"
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
    const body = document.body;
    if (!body) return;

    body.dataset.visualMode = settings.mode === "day" ? "day" : "night";
    body.dataset.palette = settings.palette;
    body.dataset.bgStyle = settings.background;
    body.dataset.buttonShape = settings.buttons;
    body.dataset.animation = settings.animation;
    body.dataset.density = settings.density;
  },

  init() {
    this.apply();
    window.addEventListener("ep:route-loaded", (event) => {
      if (event.detail?.route === "settings") this.render();
    });
  },

  button(group, value, label, current) {
    const active = current === value ? "active" : "";
    return `<button class="visual-choice ${active} ep-clickable" type="button" data-visual-group="${group}" data-visual-value="${value}">${label}</button>`;
  },

  render() {
    const root = document.querySelector("#visualSettingsRoot");
    if (!root) return;
    const current = this.read();

    root.innerHTML = `
      <div class="visual-settings-panel">
        <div class="card">
          <h3>Визуал как в основном Electric Pro</h3>
          <p style="color:var(--muted);margin:6px 0 0">V29.2 повторяет старый стеклянный стиль: фон, карточки, бургер, кнопки, скругления и анимации.</p>
        </div>

        <div class="card">
          <div class="visual-group">
            <h3>Режим</h3>
            <div class="visual-choice-row">
              ${this.button("mode", "night", "Тёмный", current.mode)}
              ${this.button("mode", "day", "Светлый", current.mode)}
            </div>
          </div>
          <div class="visual-group">
            <h3>Акцент</h3>
            <div class="visual-choice-row">
              ${Object.entries(this.palettes).map(([value,label]) => this.button("palette", value, label, current.palette)).join("")}
            </div>
          </div>
          <div class="visual-group">
            <h3>Фон</h3>
            <div class="visual-choice-row">
              ${this.button("background", "live", "Живой", current.background)}
              ${this.button("background", "minimal", "Минимальный", current.background)}
              ${this.button("background", "neon", "Неон", current.background)}
            </div>
          </div>
          <div class="visual-group">
            <h3>Кнопки</h3>
            <div class="visual-choice-row">
              ${this.button("buttons", "round", "Скруглённые", current.buttons)}
              ${this.button("buttons", "pill", "Капсулы", current.buttons)}
              ${this.button("buttons", "square", "Строже", current.buttons)}
              ${this.button("buttons", "minimal", "Минимал", current.buttons)}
            </div>
          </div>
          <div class="visual-group">
            <h3>Анимация</h3>
            <div class="visual-choice-row">
              ${this.button("animation", "premium", "Премиум", current.animation)}
              ${this.button("animation", "soft", "Мягкая", current.animation)}
              ${this.button("animation", "fast", "Быстрая", current.animation)}
              ${this.button("animation", "minimal", "Минимум", current.animation)}
              ${this.button("animation", "off", "Выкл", current.animation)}
            </div>
          </div>
        </div>

        <div class="card visual-preview">
          <h3>Предпросмотр</h3>
          <div class="visual-preview-line"></div>
          <div class="visual-preview-line short"></div>
          <button class="btn btn-primary ep-clickable" type="button">Кнопка как в старом проекте</button>
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
