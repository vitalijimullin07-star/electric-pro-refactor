window.EP = window.EP || {};

EP.routes = {
  main: "pages/main.html",
  login: "pages/login.html",
  admin: "pages/admin.html",
  settings: "pages/settings.html",
  subscription: "pages/subscription.html",
  database: "pages/database.html",
  materials: "pages/materials.html",
  work: "pages/work.html",
  shield: "pages/shield.html",
  scheme: "pages/scheme.html"
};

EP.Router = {
  async go(route, options = {}) {
    route = EP.routes[route] ? route : "main";

    if (!options.replace && EP.state.currentRoute && EP.state.currentRoute !== route) {
      EP.state.history.push(EP.state.currentRoute);
    }

    EP.state.currentRoute = route;
    location.hash = "#/" + route;

    const target = document.querySelector("#page-content");
    if (!target) return;

    try {
      const res = await fetch(EP.routes[route] + "?v=29", { cache: "no-store" });
      target.innerHTML = await res.text();
      window.dispatchEvent(new CustomEvent("ep:route-loaded", { detail: { route } }));
    } catch (err) {
      target.innerHTML = `<div class="card"><h2>Ошибка загрузки</h2><p>${route}</p></div>`;
      console.error(err);
    }
  },

  back() {
    if (EP.AppShell?.isDrawerOpen()) {
      EP.AppShell.closeDrawer();
      return;
    }

    const prev = EP.state.history.pop();
    if (prev) {
      this.go(prev, { replace: true });
      return;
    }

    if (EP.state.currentRoute !== "main") {
      this.go("main", { replace: true });
      return;
    }

    // На главной не выкидываем пользователя из сайта.
  },

  init() {
    window.addEventListener("popstate", (event) => {
      event.preventDefault();
      EP.Router.back();
    });

    document.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-route]");
      if (!btn) return;
      event.preventDefault();
      EP.Router.go(btn.dataset.route);
      EP.AppShell?.closeDrawer();
    });

    const route = (location.hash || "#/main").replace("#/", "") || "main";
    this.go(route, { replace: true });
  }
};

window.Router = {
  load: (route) => EP.Router.go(route),
  go: (route) => EP.Router.go(route),
  navigate: (route) => EP.Router.go(route),
  back: () => EP.Router.back()
};
