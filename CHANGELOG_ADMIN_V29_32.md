# V29.32 Admin + Master Registration Clean

- Удалена старая admin-subscription/admin-console зона после бэкапа.
- Исправлен запуск админки через реальное событие роутера window ep:route-loaded.
- Добавлена поддержка #/admin и #admin.
- Обновлён auth.js: регистрация мастера создаёт users/{uid}, user_subscriptions/{uid}, ai_accounts/{uid}.
- Добавлена совместимость активации мастера со старой логикой входа: approved/isApproved/status/accessStatus.
- Подписка и ИИ-баланс пишутся в отдельные Firestore-документы и совместимые поля users/{uid}.
- БД Claude и database-модули не изменяются.
