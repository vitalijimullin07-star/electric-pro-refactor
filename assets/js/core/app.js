document.addEventListener("DOMContentLoaded", () => {
  EP.AppShell.render();
  EP.VisualSettings?.init?.();
  EP.Auth.init();
  EP.Router.init();
});
