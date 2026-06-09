window.EP = window.EP || {};

EP.AppShell = {
  render() {
    const app = document.querySelector("#app");
    app.innerHTML = `
      <div class="app-bg"></div>
      <div class="live-lines"></div>

      <div class="app-shell">
        <header class="topbar glass">
          <button class="icon-btn burger-btn ep-clickable" id="burgerBtn" type="button" aria-label="Открыть меню">
            <span></span><span></span><span></span>
          </button>
          <div class="topbar-title">
            <strong>Electric Pro</strong>
            <span>V29.2 Clean</span>
          </div>
          <button class="status-btn ep-clickable" id="firebaseStatusBtn" type="button" aria-label="Статус">
            <span class="status-dot status-ok"></span>
          </button>
        </header>

        <div class="menu-overlay" id="menuOverlay"></div>
        <aside class="side-menu glass" id="sideMenu">
          <div class="side-head">
            <div class="avatar">⚡</div>
            <div>
              <strong>Electric Pro</strong>
              <span>Чистая сборка V29</span>
            </div>
          </div>
          <nav class="side-nav">
            <button class="ep-clickable" type="button" data-route="main">🏠 Главная</button>
            <button class="ep-clickable" type="button" data-route="database">🗂️ База данных</button>
            <button class="ep-clickable" type="button" data-route="materials">📦 Материалы</button>
            <button class="ep-clickable" type="button" data-route="work">🧰 Работа</button>
            <button class="ep-clickable" type="button" data-route="shield">🛡️ Конфигуратор щита</button>
            <button class="ep-clickable" type="button" data-route="scheme">📐 Однолинейная схема</button>
            <button class="ep-clickable" type="button" data-route="admin">👑 Админка</button>
            <button class="ep-clickable" type="button" data-route="settings">🎨 Настройки визуала</button>
            <button class="ep-clickable" type="button" data-route="subscription">💳 Подписка</button>
          </nav>
          <button class="btn btn-ghost btn-wide ep-clickable" id="hardReloadBtn" type="button">Обновить без кэша</button>
        </aside>

        <main class="page-container" id="pageContent"></main>
      </div>
    `;

    document.querySelector("#burgerBtn")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.openDrawer();
    });

    document.querySelector("#menuOverlay")?.addEventListener("click", (event) => {
      event.preventDefault();
      this.closeDrawer();
    });

    document.querySelector("#firebaseStatusBtn")?.addEventListener("click", () => EP.Router.go("admin"));
    document.querySelector("#hardReloadBtn")?.addEventListener("click", () => {
      location.href = location.pathname + "?fresh=" + Date.now() + location.hash;
    });
  },

  openDrawer() {
    EP.state.drawerOpen = true;
    document.querySelector("#sideMenu")?.classList.add("open");
    document.querySelector("#menuOverlay")?.classList.add("open");
  },

  closeDrawer() {
    EP.state.drawerOpen = false;
    document.querySelector("#sideMenu")?.classList.remove("open");
    document.querySelector("#menuOverlay")?.classList.remove("open");
  },

  isDrawerOpen() {
    return Boolean(EP.state.drawerOpen);
  }
};
