# CHANGELOG V28.38 Safe Perf Cleanup

## Изменённые файлы

- `index.html`
  - Добавлены `window.EP_VERSION`, `window.EP_DEBUG`, `window.EP_BOOT_FLAGS`.
  - Обновлены cache-bust версии только у затронутых файлов.

- `assets/js/router.js`
  - Переписан в читаемый формат без изменения списка страниц.
  - Добавлена нормализация алиасов: `home`, `dashboard`, `start` → `main`.
  - Добавлены события: `ep:route-loading`, `ep:route-loaded`, `ep:route-error`.
  - Добавлены совместимые методы `Router.navigate` и `Router.go`.

- `assets/js/app-shell.js`
  - Переходы `[data-route]` переведены на делегированный обработчик.
  - Динамически загруженные страницы теперь могут иметь `data-route` без inline `onclick`.
  - Добавлены события открытия/закрытия меню и диагностики.

- `pages/main.html`
  - Убраны `onclick="Router.load(...)"` с главных плиток.
  - Плитки переведены на `data-route`.

- `assets/js/module-version-badges-v21-2.js`
  - Бейджи версий больше не сканируют DOM в production.
  - Работают только при `window.EP_DEBUG === true` или `localStorage.EP_DEBUG === 'true'`.

- `assets/js/v24-3-2-menu-diagnostics-fix.js`
  - Убран постоянный MutationObserver.
  - Добавлен короткий observer только после route/menu/diagnostics events.

- `assets/js/ui-fixes-v12.js`
  - Убран постоянный MutationObserver по всему body.
  - UI-fixes запускаются только для `admin` и `subscription`.

- `assets/js/admin-v15.js`
  - Observer ограничен route=`admin` и коротким временем.

- `assets/js/admin-v26-7-subscription-panel-restore.js`
  - Observer ограничен route=`admin` и коротким временем.

- `version.json`
  - Версия обновлена до `V28.38-safe-perf-cleanup`.

## Не изменялось

- База данных и все database-файлы.
- Конфигуратор щита и все shield-файлы.
- Firestore Rules.
- Cloud Functions.
- Пул розеток.
- Смета/документы/склад/бухгалтерия как бизнес-логика.

## Техническая проверка

- `node --check`: 49 JS-файлов, 0 ошибок.
- Проверка хэшей критичных database/shield-файлов: 0 изменённых.
- `onclick="Router.load(...)"` вне backups: не найдено.
