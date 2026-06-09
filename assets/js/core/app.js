document.addEventListener("DOMContentLoaded", () => {
  EP.AppShell.render();
  EP.Auth.init();
  EP.VisualSettings?.init();
  EP.Router.init();
});
