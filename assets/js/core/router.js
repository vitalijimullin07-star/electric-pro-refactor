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
  scheme: "pages/scheme.html",
  pool: "pages/pool.html",
  estimate: "pages/estimate.html"
};

EP.Router = {
  async go(route, options = {}) {
    route = EP.routes[route] ? route : "main";

    if (!options.replace && EP.state.currentRoute && EP.state.currentRoute !== route) {
      EP.state.history.push(EP.state.currentRoute);
    }

    EP.state.currentRoute = route;
    const hash = "#/" + route;
    if (location.hash !== hash) {
      history.pushState({ route }, "", hash);
    }

    document.querySelectorAll("#sideMenu [data-route]").forEach((button) => {
      button.classList.toggle("active", button.dataset.route === route);
    });

    const target = document.querySelector("#pageContent");
    if (!target) return;

    try {
      const response = await fetch(EP.routes[route] + "?v=292", { cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      target.innerHTML = await response.text();
      window.dispatchEvent(new CustomEvent("ep:route-loaded", { detail: { route } }));
    } catch (error) {
      target.innerHTML = `
        <section class="page">
          <div class="card">
            <h2>Ошибка загрузки</h2>
            <p>Маршрут: ${route}</p>
            <p style="color:var(--muted)">${error.message}</p>
          </div>
        </section>
      `;
      console.error(error);
    }
  },

  back() {
    if (EP.AppShell?.isDrawerOpen()) {
      EP.AppShell.closeDrawer();
      return;
    }

    const previous = EP.state.history.pop();
    if (previous) {
      this.go(previous, { replace: true });
      return;
    }

    if (EP.state.currentRoute !== "main") {
      this.go("main", { replace: true });
    }
  },

  init() {
    window.addEventListener("popstate", (event) => {
      event.preventDefault();
      EP.Router.back();
    });

    document.addEventListener("click", (event) => {
      const routeButton = event.target.closest?.("[data-route]");
      if (!routeButton) return;
      const route = routeButton.dataset.route;
      if (!route) return;
      event.preventDefault();
      EP.Router.go(route);
      if (routeButton.closest("#sideMenu")) EP.AppShell?.closeDrawer();
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
