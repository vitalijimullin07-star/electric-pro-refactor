# Electric Pro Refactor — карта проекта

## Структура

public/
 index.html
 css/main.css
 js/
    ├── 00-core.js
    ├── visual.js
    ├── customer.js
    ├── settings.js
    ├── database.js
    ├── estimate.js
    ├── socket-pool.js
    ├── shield-configurator.js
    ├── recalc-routes.js
    ├── pdf-preview.js
    ├── accounting.js
    ├── ai.js
    ├── auth.js
    ├── admin.js
    └── app.js

## Назначение файлов

index.html — основная HTML-страница приложения.

css/main.css — все основные стили.

js/00-core.js — базовые безопасные функции safeGet и safeSet.

js/visual.js — загрузчик, уведомления, модальные окна, меню.

js/customer.js — данные клиента и мастера.

js/settings.js — тема, коэффициенты, QR, логика расчётов, API ключ.

js/database.js — база материалов и работ, добавление позиций, изменение цен.

js/estimate.js — смета, таблица, замены, автоматы, автосохранение, очистка.

js/socket-pool.js — пул розеток, подрозетников, высоты, группы.

js/shield-configurator.js — конфигуратор щита, автоматы, УЗО, дифы, схема.

js/recalc-routes.js — перерасчёт трасс.

js/pdf-preview.js — предпросмотр и подготовка PDF.

js/accounting.js — бухгалтерия, график, акты, оплаты, история объектов.

js/ai.js — ИИ-проверка сметы, снабжение, ПУЭ, сравнение магазинов.

js/auth.js — Google-вход, PIN, выход, завершение авторизации.

js/admin.js — заявки, пользователи, черновики мастеров, админка.

js/app.js — главный запуск приложения.

## Текущее состояние

- Код разделён на отдельные JS-блоки.
- Белый экран исправлен.
- Debug overlay удалён.
- Проверка node --check проходит.
- Тестовый Firebase Hosting: electric-pro-test.

## Следующие этапы

1. Offline/cache для APK.
2. Service Worker.
3. Manifest.
4. Проверка запуска без интернета.
5. Потом Firebase Functions и серверная защита.
