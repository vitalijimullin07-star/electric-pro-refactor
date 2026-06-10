# V29.31 Admin Clean

- Собрана чистая модульная админка.
- Добавлены users/subscriptions/ai/security/logs modules.
- Добавлен admin.css.
- Добавлена pages/admin.html.
- Подключение в index.html выполняется через единый управляемый блок.
- БД Claude не изменяется.
- Rules/functions не деплоятся.

- Добавлен безопасный одноразовый bootstrap для SPA-роутера: админка стартует после динамической загрузки pages/admin.html.
- Добавлено ожидание Firebase до 9 секунд, чтобы не зависать на статусе «Загрузка...». 
