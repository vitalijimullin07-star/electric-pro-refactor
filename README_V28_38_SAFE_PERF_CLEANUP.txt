Electric Pro — V28.38 Safe Perf Cleanup
Дата: 2026-06-09

Цель:
Безопасно ускорить запуск и навести порядок вокруг ядра приложения без вмешательства в БД и конфигуратор щита.

Строго не трогалось:
- assets/js/database-*
- assets/js/database-api.js
- modules/database/*
- modules/shield/*

Что изменено:
- Добавлен production/debug-флаг: window.EP_DEBUG = false.
- Роутер стал отправлять события ep:route-loading / ep:route-loaded / ep:route-error.
- Router получил совместимость со старыми вызовами Router.navigate(...) и Router.go(...).
- Переходы по плиткам главного экрана переведены с inline onclick на data-route.
- Декоративные бейджи версий отключены в обычном production-режиме.
- Постоянные DOM-наблюдатели диагностики/UI/admin ограничены короткими окнами после открытия нужных разделов.
- AccessGate теперь может перехватывать плитки главного экрана через data-route.

Как включить debug-бейджи версий:
В консоли браузера:
localStorage.setItem('EP_DEBUG', 'true')
location.reload()

Как выключить обратно:
localStorage.removeItem('EP_DEBUG')
location.reload()

Проверка перед использованием:
Смотри CHECKLIST_V28_38.md.

Важно:
Баг БД target is not defined не исправлялся намеренно, потому что БД оставлена под правки Claude.
