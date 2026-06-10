Electric Pro V29.32 Admin + Master Registration Clean

Что делает:
- чистая админка без старых admin-subscription/admin-console хвостов;
- стабильный запуск через SPA router: window ep:route-loaded + #/admin + #admin;
- управление пользователями;
- правильная активация мастера:
  approved: true
  isApproved: true
  status: "approved"
  accessStatus: "approved"
- регистрация нового мастера создаёт:
  users/{uid}
  user_subscriptions/{uid}
  ai_accounts/{uid}
- подписка сохраняется в user_subscriptions/{uid} и совместимые поля users/{uid};
- ИИ-баланс сохраняется в ai_accounts/{uid}, API-ключи не читаются и не показываются;
- БД Claude не изменяется.

Что удаляется из основной структуры после бэкапа:
- assets/js/modules/admin-subscription.js
- assets/css/admin-subscription.css
- assets/css/admin-console.css
- assets/css/admin-boundaries.css
- assets/js/modules/existing-firebase-access.js
- старая assets/js/modules/admin/
- старые README/CHANGELOG/CHECKLIST админки V29.29/V29.30/V29.31

Что НЕ трогается:
- БД Claude
- assets/js/modules/database/
- epdb26_my
- epdb26_server
- Материалы
- Работа
- Щит
- Ручная однолинейка
- Firestore Rules
- Cloud Functions

Установка:
mkdir -p /sdcard/Download/ep && cd /sdcard/Download/ep && unzip -o /sdcard/Download/electric-pro-v29-admin-registration-clean-v29-32-installer.zip && cd electric-pro-v29-stage-admin-registration-clean && chmod +x install_termux_refactor.sh && bash install_termux_refactor.sh

Коммит:
cd /sdcard/Download/ep/electric-pro-refactor-clean && git status && git add -A && git commit -m "V29.32 Admin Master Registration Clean" && git push

Проверка:
https://vitalijimullin07-star.github.io/electric-pro-refactor/?fresh=2932#/admin
