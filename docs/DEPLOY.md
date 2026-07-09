# Деплой Electric Pro (Firebase)

Проект: `electric-489f7` · Регион функций: `europe-west1`

## Вариант 1 — вручную с компьютера

```bash
npm install -g firebase-tools
firebase login
cd electric-pro-refactor
npm install --prefix functions
firebase deploy --only hosting,firestore:rules,functions
```

Обязательно после первого деплоя задать секрет подписи доступа:

```bash
firebase functions:secrets:set ACCESS_SIGNING_SECRET
# или через переменную окружения функций в консоли Firebase
```

## Вариант 2 — автодеплой через GitHub Actions

Workflow: `.github/workflows/firebase-deploy.yml` — деплоит при каждом пуше в `main`.

Один раз настроить:
1. Firebase Console → Project Settings → Service accounts → **Generate new private key** (JSON).
2. GitHub → репозиторий → Settings → Secrets and variables → Actions → **New repository secret**:
   - имя: `FIREBASE_SERVICE_ACCOUNT`
   - значение: содержимое JSON-файла целиком.
3. Смёржить изменения в `main` — деплой запустится сам (или вручную: Actions → Deploy to Firebase → Run workflow).

## Что деплоится

| Часть | Источник | Куда |
|---|---|---|
| Hosting (веб-приложение) | корень репо (`index.html`, `assets/`, `pages/`, `config/`) | https://electric-489f7.web.app |
| Правила Firestore | `firestore.rules` | Firestore |
| Cloud Functions | `functions/` | europe-west1 |

## Проверка после деплоя

1. Открыть https://electric-489f7.web.app → вход Google работает.
2. Новый аккаунт → «Регистрация мастера» → в админке появляется заявка (pending).
3. Админ: «Открыть доступ» → у мастера автоматически появляется тест на 10 дней.
4. Консоль браузера без ошибок permission-denied.

## APK (на будущее)

Приложение готово к упаковке в WebView-обёртку (Capacitor/TWA):
- все пути относительные, SPA-роутинг на hash (`#/route`) — работает с `file://` и локальным сервером;
- вход Google: при недоступности popup автоматически используется redirect (`auth.js`);
- для Capacitor добавить `https://localhost` в Authorized domains в Firebase Auth;
- для TWA (Trusted Web Activity) достаточно опубликованного hosting-домена.
