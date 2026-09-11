# Electric Pro — установка как приложение и сборка APK

Приложение — **устанавливаемое PWA** (`manifest.webmanifest` + иконка + service worker
`sw.js` для оффлайна) и **APK** поверх него. APK собран как TWA: он открывает наш же сайт
в полноэкранном окне Chrome без адресной строки.

> **Главное следствие TWA:** обновления приложения доезжают ОБЫЧНЫМ ДЕПЛОЕМ — пересобирать
> и переустанавливать APK для них не нужно. Пересборка нужна, только когда меняется имя,
> иконка или версия самого приложения.

## 1. Без APK — установка прямо из браузера

**Android (Chrome):** открыть сайт → меню ⋮ → «Установить приложение».
**iPhone (Safari):** «Поделиться» → «На экран Домой». Для iOS это единственный путь —
APK там не бывает.

## 2. Установка APK

Файл ставится напрямую: открыть `.apk` на телефоне → разрешить установку из этого
источника (Android спросит один раз) → «Установить». Google Play для этого не нужен.

Параметры собранного приложения:

| | |
|---|---|
| Пакет | `app.web.electric_489f7.twa` |
| Сайт | `https://electric-489f7.web.app` |
| Минимум Android | 5.0 (API 21) |
| Размер | ~1 МБ (весь интерфейс тянется с сайта и кэшируется service worker'ом) |

## 3. Пересборка APK

### Через GitHub Actions (обычный путь)

Actions → **Build Android APK** → Run workflow. Можно задать версию (`versionName`) и
код версии (`versionCode` — целое, обязано расти с каждой сборкой, иначе Android не
поставит обновление поверх). Готовый файл — в артефактах сборки.

Нужны секреты репозитория (Settings → Secrets and variables → Actions):

- `EP_KEYSTORE_BASE64` — ключ подписи, закодированный `base64 -w0 electric-pro.keystore`
- `EP_KEYSTORE_PASSWORD` — пароль от него

### Локально

```bash
npm i -g @bubblewrap/cli
export JAVA_HOME=/path/to/jdk17  ANDROID_HOME=/path/to/android-sdk
export EP_KEYSTORE_PASSWORD='пароль'
cp /где/хранится/electric-pro.keystore android/
node scripts/build-apk.js          # → android/electric-pro.apk
```

Нужен JDK 17+ и Android SDK (`build-tools;34.0.0`, `platforms;android-34`).

Скрипт намеренно не использует `bubblewrap build`: CLI задаёт интерактивные вопросы и в
автоматической среде не проходит — те же шаги выполняются напрямую через
`@bubblewrap/core`. Заодно он подкладывает обёртку `$ANDROID_HOME/bin/sdkmanager`:
Bubblewrap ждёт старую раскладку SDK, а современный `cmdline-tools` без `--sdk_root`
не понимает, где корень, и проверка падает с «androidSdk isn't correct».

## 4. Ключ подписи — что важно знать

Ключ (`android/electric-pro.keystore`) **в репозиторий не попадает** — это приватный
ключ, он в `.gitignore`. Хранится у владельца и в секретах GitHub.

- Android ставит обновление поверх установленного приложения, **только если подпись
  совпадает**. Потеряешь ключ — обновления встанут: придётся удалять приложение с
  телефонов и ставить заново, уже с новым ключом.
- Отпечаток ключа прописан в `.well-known/assetlinks.json` — это файл, которым сайт
  подтверждает, что APK «свой». Если подпись и файл разойдутся, приложение откроется
  **с адресной строкой Chrome** вместо полноэкранного вида. Больше ничего не сломается,
  но выглядеть будет как браузер. Сборка в CI сверяет это сама и падает при расхождении.
- Сменил ключ → обнови отпечаток в `assetlinks.json` и задеплой сайт.

Посмотреть отпечаток:

```bash
keytool -list -v -keystore android/electric-pro.keystore -alias electricpro | grep SHA256
```

## 5. Проверка, что привязка домена работает

```bash
curl -s https://electric-489f7.web.app/.well-known/assetlinks.json
```

Должен вернуться JSON (не HTML). Если пришёл HTML — файл не задеплоился: в `firebase.json`
в `hosting.ignore` не должно быть шаблона `**/.*`, он выкидывает всю папку `.well-known`
(именно так и было до первой сборки APK).

На телефоне: приложение открывается **без адресной строки** сверху — значит привязка
принята. Chrome кэширует проверку, так что после правки `assetlinks.json` переустанови
приложение.

## 6. Google Play (если понадобится)

Для магазина нужен аккаунт разработчика ($25 разово) и загрузка `.aab`, а не `.apk`:

```bash
cd android && ./gradlew bundleRelease     # → app/build/outputs/bundle/release/*.aab
```

Play подписывает приложение своим ключом (Play App Signing), и в `assetlinks.json` тогда
идёт **отпечаток из консоли Play**, а не наш — иначе TWA в установленном из магазина
приложении покажет адресную строку.

## Что уже сделано в репозитории

- `manifest.webmanifest` — имя, иконки, `display: standalone`, тема.
- `sw.js` — оффлайн-кэш оболочки, network-first для навигации и `/index.html`,
  stale-while-revalidate для статики. Firebase и gstatic не кэшируются.
- `assets/js/core/pwa.js` — регистрация service worker и автообновление вкладок.
- `android/twa-manifest.json` — конфигурация APK (имя, цвета, пакет, версия).
- `scripts/build-apk.js` — неинтерактивная сборка.
- `.github/workflows/android-apk.yml` — сборка по кнопке с проверкой подписи.
- `.well-known/assetlinks.json` — привязка домена к APK.

---

# Нативная сборка (Capacitor) — код внутри APK

Второй вариант APK, рядом с TWA. Разница принципиальная:

| | TWA (`android/`) | Нативная (`android-native/`) |
|---|---|---|
| Где код | на сайте | **внутри APK** |
| Обновление | обычный деплой, APK не трогаем | пересобрать и переустановить APK |
| Первый запуск без интернета | белый экран | **работает** |
| Версия у тестера | всегда то, что на проде | **зафиксированная** |
| Пакет | `app.web.electric_489f7.twa` | `com.electricpro.app` |
| Имя на телефоне | Electric Pro | Electric Pro тест |
| Минимум Android | 5.0 | 7.0 |
| Размер | ~1 МБ | ~5,8 МБ |

Пакеты разные, поэтому **обе версии ставятся на телефон одновременно** и не мешают друг
другу. Для тестирования это и нужно: тестер щёлкает по зафиксированной сборке, а прод
живёт своей жизнью.

## Сборка

GitHub → Actions → **Build Native APK** → Run workflow. Либо локально:

```bash
npm i
export JAVA_HOME=/path/to/jdk21  ANDROID_HOME=/path/to/android-sdk
export EP_KEYSTORE_PATH=$PWD/android/electric-pro.keystore
export EP_KEYSTORE_PASSWORD='пароль'
node scripts/build-www.js && npx cap copy android
cd android-native && ./gradlew assembleRelease
```

`scripts/build-www.js` собирает папку `www/`: копирует только само приложение (без docs,
test, functions), выключает service worker и **скачивает Firebase SDK локально** — иначе
приложение при первом запуске без интернета не поднимет даже чтение своих же локальных
проектов. Флаг `window.EP_NATIVE` кладётся ОТДЕЛЬНЫМ файлом, а не инлайном: CSP приложения
(`script-src 'self'`) встроенные скрипты не выполняет.

## Вход через Google — нужен один шаг в Firebase

Google **специально запрещает** вход через встроенный WebView (ошибка
`disallowed_useragent`), чтобы приложение не могло подсмотреть чужой пароль. Поэтому в
нативной сборке работает не popup, а системное окно выбора аккаунта — и его надо
зарегистрировать в Firebase. Без этого приложение запустится и покажет интерфейс, но на
кнопке входа честно скажет, что вход для этой сборки не настроен.

Что сделать (можно с телефона, ПК не нужен):

1. **console.firebase.google.com** → проект `electric-489f7` → шестерёнка → **Настройки
   проекта** → внизу **Мои приложения** → **Добавить приложение** → значок Android.
2. Имя пакета: `com.electricpro.app`
3. Сертификат SHA-1 (отпечаток нашего ключа подписи):
   `C9:53:02:E5:37:9F:EA:D7:57:F9:7A:0A:D5:B5:D4:88:A0:69:E1:C6`
4. Скачать `google-services.json`, открыть его как текст и скопировать содержимое.
5. GitHub → Settings → Secrets and variables → Actions → New repository secret:
   имя `EP_GOOGLE_SERVICES_JSON`, значение — скопированное содержимое файла.
6. Actions → Build Native APK → Run workflow.

Проверить SHA-1 самому:

```bash
keytool -list -v -keystore android/electric-pro.keystore -alias electricpro | grep SHA1
```

Если вход выдаёт ошибку с кодом 10 (`DEVELOPER_ERROR`) — значит package или отпечаток в
Firebase не совпадают с тем, чем подписан APK. Других подробностей Google Play Services
не сообщают, так что сверять надо именно эти два значения.

## Что НЕ переносится в нативную сборку

- **Push-уведомления** пока настроены для веба (VAPID + service worker). В нативной
  сборке service worker выключен, поэтому пуш там не работает — для него нужен нативный
  FCM-плагин. В TWA-версии пуш работает как раньше.
- Автообновление кода: в нативной сборке его нет по определению — новая версия приезжает
  только новым APK.
