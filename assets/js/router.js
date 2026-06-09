(function () {
  const FILE = "assets/js/router.js";
  const routes = {
    main: "pages/main.html",
    customer: "pages/customer.html",
    ai: "pages/ai.html",
    database: "pages/database.html",
    shield: "pages/shield.html",
    pool: "pages/pool.html",
    scheme: "pages/scheme.html",
    estimate: "pages/estimate.html",
    documents: "pages/documents.html",
    accounting: "pages/accounting.html",
    warehouse: "pages/warehouse.html",
    drafts: "pages/drafts.html",
    settings: "pages/settings.html",
    guide: "pages/guide.html",
    admin: "pages/admin.html",
    subscription: "pages/subscription.html"
  };

  const aliases = {
    home: "main",
    dashboard: "main",
    start: "main",
    visual: "settings"
  };

  let currentRoute = "main";
  const stack = [];

  function normalizeRoute(route) {
    const key = String(route || "main").trim();
    const normalized = aliases[key] || key;
    return routes[normalized] ? normalized : "main";
  }

  function emit(name, detail = {}) {
    try {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    } catch (e) {}
  }

  async function load(route, opt = {}) {
    route = normalizeRoute(route);
    const path = routes[route] || routes.main;
    const box = document.getElementById("pageContainer");

    emit("ep:route-loading", { route, path });

    try {
      const response = await fetch(path + "?v=" + Date.now(), { cache: "no-store" });
      if (!response.ok) throw new Error("Не удалось загрузить страницу: " + path);

      const html = await response.text();
      if (currentRoute !== route && !opt.replace) stack.push(currentRoute);

      currentRoute = route;
      if (box) box.innerHTML = html;
      document.body.dataset.route = route;

      if (route === "admin") setTimeout(() => window.AdminAPI?.bindPage?.(), 50);
      if (route === "subscription") setTimeout(() => window.SubscriptionPage?.bindPage?.(), 50);
      if (route === "shield") setTimeout(() => window.ShieldConfiguratorV28?.bindPage?.(), 50);
      if (route === "scheme") setTimeout(() => window.ManualSchemeV28?.bindPage?.(), 50);

      window.AppShell?.closeMenu?.();
      emit("ep:route-loaded", { route, path });
      window.SoundAPI?.click?.();
    } catch (error) {
      window.Diagnostics?.error?.({
        file: FILE,
        module: "Router",
        functionName: "load(route)",
        place: path,
        code: "router-load-error",
        message: error.message
      });
      emit("ep:route-error", { route, path, message: error.message });
      if (box) {
        box.innerHTML = `<section class="page"><div class="page-head"><h1>Страница не загрузилась</h1><p>Открой диагностику и скопируй ошибку.</p></div><div class="card">Файл: ${path}</div></section>`;
      }
    }
  }

  function back() {
    if (window.AppShell?.closeTopOverlay?.()) return;
    if (currentRoute !== "main") return load(stack.pop() || "main", { replace: true });
    if (confirm("Выйти из приложения?")) window.close();
  }

  window.Router = {
    routes,
    load,
    navigate: load,
    go: load,
    back,
    current: () => currentRoute,
    normalizeRoute
  };
})();
