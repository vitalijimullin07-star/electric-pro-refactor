// Electric PRO Refactor
// Главный файл запуска модульной версии.
// ВНИМАНИЕ: пока приложение в index.html работает через js/blocks/block-XX.js.
// Этот файл подготовлен для следующего этапа переключения.

console.log("Electric PRO Refactor app.js loaded");

window.EP_REFACTOR_MODULES = [
  "00-core.js",
  "01-visual.js",
  "02-shield-configurator.js",
  "03-socket-pool.js",
  "04-database.js",
  "05-ai-functions.js",
  "06-single-line-scheme.js",
  "07-settings.js",
  "08-admin.js",
  "09-accounting.js",
  "10-estimate-views.js",
  "11-pdf-files.js",
  "12-documents.js"
];

window.EP_REFACTOR_READY = true;
