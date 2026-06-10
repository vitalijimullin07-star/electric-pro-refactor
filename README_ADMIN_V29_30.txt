Electric Pro V29.30 Admin Clean

Назначение:
Админка под ключ для зоны Инны:
- пользователи
- подписки
- ИИ-баланс
- безопасность
- admin_logs
- error_logs
- каркас документов/смет/черновиков/бухгалтерии
- раздел БД Claude только как информационная защищённая зона

Не изменяет:
- БД Claude
- материалы
- работы
- щит
- ручную однолинейную схему
- epdb26_my
- epdb26_server
- Firestore Rules
- Cloud Functions
- старый electric-pro

Firestore collections:
- users
- user_subscriptions
- ai_accounts
- subscription_plans
- admin_logs
- security_events
- error_logs

Установка:
mkdir -p /sdcard/Download/ep && cd /sdcard/Download/ep && unzip -o /sdcard/Download/electric-pro-v29-admin-clean-v29-30-installer.zip && cd electric-pro-v29-stage-admin-clean && chmod +x install_termux_refactor.sh && bash install_termux_refactor.sh

Проверка:
https://vitalijimullin07-star.github.io/electric-pro-refactor/?fresh=2930#admin
