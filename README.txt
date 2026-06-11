Electric Pro V29 — ЧИСТАЯ версия (полная, без патчей)

ЧТО ЭТО:
Полное чистое приложение V29: рабочее ядро (главная, бургер-меню, авторизация,
настройки визуала) + модуль БД с ПРАВИЛЬНЫМИ путями Firestore (user_db/{uid} и
server_db/main) — БД общая для двух проектов на одном Firebase.
Никаких патчей/фиксов/бэкапов GPT, никакого firebase-db-sync, никакого мусора.

КАК ПОСТАВИТЬ (Termux):
  cd /sdcard/Download/ep && unzip -o /sdcard/Download/electric-pro-refactor-clean.zip && cd electric-pro-refactor-clean && chmod +x deploy_clean_v29.sh && bash deploy_clean_v29.sh

Скрипт НЕ патчит — он ПОЛНОСТЬЮ заменяет приложение на чистое:
 - заменяет: assets/ pages/ index.html version.json
 - НЕ трогает: config/firebase-config.js, firestore.rules, functions/, .git, firebase.json/.firebaserc
 - перед заменой делает бэкап всего репозитория в ~/ep_backup_<дата>.tgz
 - убирает мусор GPT (firebase-debug.log, _admin_backups, .ep_backups, admin-доки, tools/)
 - коммит + push

ПОСЛЕ: открой сайт с ?fresh=<число> — проверь бургер-меню и «База данных»
(на 2-м устройстве БД подтянется — общий Firebase).

ЧТО ДАЛЬШЕ (чистыми модулями, тоже целиком, без патчей):
 - админка ПО ПРАВИЛАМ (на Cloud Functions adminListUsers/adminSetUserAccess);
 - Материалы/Работа -> смета; конфигуратор щита; однолинейка; пул; смета.
Страницы этих разделов сейчас — заглушки (будут наполняться по очереди).
