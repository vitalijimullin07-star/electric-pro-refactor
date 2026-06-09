(function () {
  const FILE = "assets/js/app-shell.js";
  const overlays = [];
  let routeDelegationBound = false;

  function emit(name, detail = {}) {
    try {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    } catch (e) {}
  }

  function pushOverlay(name) {
    if (!overlays.includes(name)) overlays.push(name);
  }

  function removeOverlay(name) {
    const index = overlays.lastIndexOf(name);
    if (index >= 0) overlays.splice(index, 1);
  }

  function closeTopOverlay() {
    const top = overlays.pop();
    if (!top) return false;
    if (top === "menu") closeMenu(true);
    if (top === "diagnostics") closeDiagnostics(true);
    if (top === "visual") window.VisualSettings?.close?.();
    return true;
  }

  function openMenu() {
    document.getElementById("sideMenu")?.classList.add("open");
    document.getElementById("menuOverlay")?.classList.add("open");
    pushOverlay("menu");
    emit("ep:menu-open");
    window.SoundAPI?.click?.();
  }

  function closeMenu(skip = false) {
    document.getElementById("sideMenu")?.classList.remove("open");
    document.getElementById("menuOverlay")?.classList.remove("open");
    if (!skip) removeOverlay("menu");
    emit("ep:menu-close");
  }

  function openDiagnostics() {
    document.getElementById("diagnosticsModal")?.classList.remove("hidden");
    window.Diagnostics?.render?.();
    pushOverlay("diagnostics");
    emit("ep:diagnostics-open");
    window.SoundAPI?.click?.();
  }

  function closeDiagnostics(skip = false) {
    document.getElementById("diagnosticsModal")?.classList.add("hidden");
    if (!skip) removeOverlay("diagnostics");
    emit("ep:diagnostics-close");
  }

  async function hardReload() {
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
      localStorage.setItem("ep_force_reload_at", String(Date.now()));
      location.href = location.pathname + "?fresh=" + Date.now();
    } catch (e) {
      location.reload();
    }
  }

  function bindRouteDelegation() {
    if (routeDelegationBound) return;
    routeDelegationBound = true;

    document.addEventListener("click", function (event) {
      const routeEl = event.target.closest?.("[data-route]");
      if (!routeEl) return;
      if (event.defaultPrevented) return;

      const route = routeEl.dataset.route;
      if (!route) return;

      event.preventDefault();

      if (route === "visual") {
        closeMenu();
        window.VisualSettings?.open?.();
        return;
      }

      window.Router?.load?.(route);
    }, false);
  }

  function bind() {
    document.getElementById("burgerBtn")?.addEventListener("click", openMenu);
    document.getElementById("menuOverlay")?.addEventListener("click", () => closeMenu());
    document.getElementById("loginDiagnosticsBtn")?.addEventListener("click", openDiagnostics);

    bindRouteDelegation();

    document.addEventListener("click", event => {
      if (event.target.closest?.(".ep-clickable")) window.SoundAPI?.click?.();
    }, { capture: true });

    document.getElementById("firebaseStatusBtn")?.addEventListener("click", openDiagnostics);
    document.getElementById("closeDiagnosticsBtn")?.addEventListener("click", () => closeDiagnostics());
    document.getElementById("closeVisualBtn")?.addEventListener("click", () => window.VisualSettings?.close?.());

    document.getElementById("copyDiagnosticsBtn")?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.Diagnostics?.text?.() || "");
        alert("Диагностика скопирована");
      } catch (error) {
        window.Diagnostics?.error?.({
          file: FILE,
          module: "AppShell",
          functionName: "copyDiagnostics",
          place: "navigator.clipboard",
          code: "copy-error",
          message: error.message
        });
      }
    });

    document.getElementById("clearDiagnosticsBtn")?.addEventListener("click", () => window.Diagnostics?.clear?.());
    document.getElementById("hardReloadBtn")?.addEventListener("click", hardReload);
    document.getElementById("testSoundBtn")?.addEventListener("click", async () => { await window.SoundAPI?.unlock?.(); });
    document.getElementById("logoutBtn")?.addEventListener("click", () => window.Auth?.logout?.());

    window.addEventListener("popstate", () => window.Router?.back?.());
    history.replaceState({ app: "electric-pro" }, "", location.href);
    history.pushState({ app: "electric-pro-start" }, "", location.href);
  }

  async function checkVersion() {
    try {
      const response = await fetch("version.json?v=" + Date.now(), { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      const key = "ep_app_version_clean_v4";
      const oldVersion = localStorage.getItem(key);
      if (oldVersion && data.version && oldVersion !== data.version) {
        localStorage.setItem(key, data.version);
        setTimeout(() => location.href = location.pathname + "?fresh=" + Date.now(), 400);
        return;
      }
      if (data.version) localStorage.setItem(key, data.version);
    } catch (e) {}
  }

  function init() {
    bind();
    window.VisualSettings?.init?.();
    window.Auth?.init?.();
    window.Diagnostics?.startNewSession?.();
    window.Diagnostics?.wait?.({
      file: FILE,
      module: "AppShell",
      functionName: "init()",
      place: "app-start",
      code: "app-start",
      message: "Приложение запущено",
      firebaseText: "проверка"
    });
    setTimeout(checkVersion, 1000);
  }

  window.AppShell = {
    init,
    openMenu,
    closeMenu,
    openDiagnostics,
    closeDiagnostics,
    pushOverlay,
    removeOverlay,
    closeTopOverlay,
    hardReload
  };

  window.addEventListener("DOMContentLoaded", init);
})();

/* === Toggle click fix V5.1 === */
(function () {
  function bindSwitchRows() {
    document.querySelectorAll(".switch-row").forEach(row => {
      if (row.dataset.switchFixed === "true") return;
      row.dataset.switchFixed = "true";

      row.addEventListener("click", event => {
        const input = row.querySelector('input[type="checkbox"]');
        if (!input) return;

        if (event.target !== input) {
          event.preventDefault();
          input.checked = !input.checked;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    setTimeout(bindSwitchRows, 500);
  });

  const oldOpen = window.VisualSettings?.open;
  if (oldOpen) {
    window.VisualSettings.open = function () {
      oldOpen.apply(this, arguments);
      setTimeout(bindSwitchRows, 100);
    };
  }

  window.EP_BIND_SWITCH_ROWS = bindSwitchRows;
})();

/* === Final Fix V5.2: reliable switches and sound test === */
(function () {
  function forceSwitchState(input) {
    if (!input) return;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  document.addEventListener("click", function (event) {
    const testSound = event.target.closest("#testSoundBtn");
    if (testSound) {
      event.preventDefault();
      event.stopPropagation();
      window.SoundAPI?.test?.();
      return;
    }

    const row = event.target.closest(".switch-row");
    if (!row) return;

    const input = row.querySelector('input[type="checkbox"]');
    if (!input) return;

    if (event.target !== input) {
      event.preventDefault();
      event.stopPropagation();
      input.checked = !input.checked;
      forceSwitchState(input);
      window.SoundAPI?.click?.();
    }
  }, true);

  document.addEventListener("change", function (event) {
    const input = event.target;
    if (!input || !input.matches || !input.matches(".switch-row input[type='checkbox']")) return;
    forceSwitchState(input);
  }, true);
})();

/* === Final Fix V5.3: sound button only, switches handled by VisualSettings === */
(function () {
  document.addEventListener("click", function (event) {
    const btn = event.target.closest("#testSoundBtn");
    if (!btn) return;
    event.preventDefault();
    event.stopPropagation();
    window.SoundAPI?.test?.();
  }, true);
})();

/* === Sound after reload fix === */
(function () {
  async function wakeSoundAfterReload() {
    if (!window.SoundAPI?.isEnabled?.()) return;
    if (window.SoundAPI?.isUnlocked?.()) return;
    await window.SoundAPI.unlock();
  }

  ["pointerdown", "touchstart", "click"].forEach(eventName => {
    document.addEventListener(eventName, wakeSoundAfterReload, {
      capture: true,
      passive: true
    });
  });
})();

/* === Admin button visibility V7 === */
(function () {
  function updateAdminButton() {
    const btn = document.getElementById("adminPanelBtn");
    if (!btn) return;

    const isAdmin = window.AdminAPI?.isAdmin?.() === true;
    btn.classList.toggle("hidden", !isAdmin);
  }

  window.EP_UPDATE_ADMIN_BUTTON = updateAdminButton;

  window.addEventListener("DOMContentLoaded", () => {
    setTimeout(updateAdminButton, 1200);
    setTimeout(updateAdminButton, 2500);
  });

  document.addEventListener("click", () => {
    setTimeout(updateAdminButton, 100);
  });
})();
