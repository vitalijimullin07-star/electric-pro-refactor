window.EP = window.EP || {};

EP.AppShell = {
  render() {
    const app = document.querySelector("#app");
    app.innerHTML = `
      <div class="app">
        <header class="topbar">
          <button class="back-button" id="app-back" type="button">←</button>
          <button class="menu-button" id="app-menu" type="button">☰</button>
          <strong>Electric Pro</strong>
          <span style="margin-left:auto;font-size:12px;opacity:.7">V29.1</span>
        </header>

        <div class="drawer-backdrop" id="drawer-backdrop"></div>
        <aside class="drawer" id="drawer">
          <h2>Меню</h2>
          <button class="nav-link" data-route="main">Главная</button>
          <button class="nav-link" data-route="database">База данных</button>
          <button class="nav-link" data-route="materials">Материалы</button>
          <button class="nav-link" data-route="work">Работа</button>
          <button class="nav-link" data-route="shield">Щит</button>
          <button class="nav-link" data-route="scheme">Однолинейка</button>
          <button class="nav-link" data-route="admin">Админка</button>
          <button class="nav-link" data-route="settings">Настройки</button>
          <button class="nav-link" data-route="subscription">Подписка</button>
        </aside>

        <main class="page" id="page-content"></main>
      </div>
    `;

    document.querySelector("#app-menu").addEventListener("click", () => this.openDrawer());
    document.querySelector("#app-back").addEventListener("click", () => EP.Router.back());
    document.querySelector("#drawer-backdrop").addEventListener("click", () => this.closeDrawer());
  },

  openDrawer() {
    EP.state.drawerOpen = true;
    document.querySelector("#drawer")?.classList.add("open");
    document.querySelector("#drawer-backdrop")?.classList.add("open");
  },

  closeDrawer() {
    EP.state.drawerOpen = false;
    document.querySelector("#drawer")?.classList.remove("open");
    document.querySelector("#drawer-backdrop")?.classList.remove("open");
  },

  isDrawerOpen() {
    return Boolean(EP.state.drawerOpen);
  }
};
