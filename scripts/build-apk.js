#!/usr/bin/env node
/* Electric Pro — сборка APK (TWA: приложение-обёртка над уже размещённой PWA).
   Код приложения при этом не меняется вообще: APK открывает наш же сайт в полноэкранном
   окне Chrome без адресной строки, поэтому обновления доезжают обычным деплоем, без
   пересборки APK. Пересобирать нужно только когда меняются имя/иконка/версия приложения.

   ПОЧЕМУ НЕ `bubblewrap build`: CLI задаёт интерактивные вопросы (регенерация проекта,
   версия, пароли) и в CI/автоматической среде проходит только с эмуляцией ввода. Здесь
   те же шаги выполняются напрямую через ядро @bubblewrap/core.

   Что нужно:
     JDK 17+ и Android SDK (build-tools + platform). Пути — в переменных JAVA_HOME и
     ANDROID_HOME, либо в ~/.bubblewrap/config.json.
     Ключ подписи: android/electric-pro.keystore (в git его НЕТ — это приватный ключ) и
     пароль в EP_KEYSTORE_PASSWORD. В CI ключ кладётся из секрета, см.
     .github/workflows/android-apk.yml.

   ВАЖНО ПРО КЛЮЧ: Android разрешает обновить установленное приложение только APK,
   подписанным ТЕМ ЖЕ ключом. Потеряешь keystore — обновления встанут, придётся
   переустанавливать приложение вручную и менять отпечаток в .well-known/assetlinks.json.

   Запуск:  EP_KEYSTORE_PASSWORD=... node scripts/build-apk.js
   Результат: android/electric-pro.apk
*/
"use strict";
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const DIR = path.join(ROOT, "android");

function coreDir() {
  // @bubblewrap/core лежит внутри глобально установленного CLI
  try { return path.dirname(require.resolve("@bubblewrap/core")); } catch (e) { /* ищем ниже */ }
  const g = execSync("npm root -g", { encoding: "utf8" }).trim();
  const nested = path.join(g, "@bubblewrap/cli/node_modules/@bubblewrap/core");
  if (fs.existsSync(nested)) return nested;
  const flat = path.join(g, "@bubblewrap/core");
  if (fs.existsSync(flat)) return flat;
  throw new Error("не найден @bubblewrap/core — поставь: npm i -g @bubblewrap/cli");
}

(async () => {
  const CORE = coreDir();
  const { TwaManifest, TwaGenerator, Config, JdkHelper, AndroidSdkTools, GradleWrapper, ConsoleLog } = require(CORE);

  const pw = process.env.EP_KEYSTORE_PASSWORD;
  if (!pw) throw new Error("не задан EP_KEYSTORE_PASSWORD (пароль от keystore)");
  const keystore = path.join(DIR, "electric-pro.keystore");
  if (!fs.existsSync(keystore)) throw new Error("нет ключа подписи: " + keystore);

  const jdk = process.env.JAVA_HOME;
  const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (!jdk || !sdk) throw new Error("нужны JAVA_HOME и ANDROID_HOME");

  // Bubblewrap ждёт СТАРУЮ раскладку SDK ($SDK/bin/sdkmanager), а современный
  // cmdline-tools живёт в $SDK/cmdline-tools/latest и без --sdk_root не понимает,
  // где корень. Подкладываем обёртку — иначе проверка пути падает «androidSdk isn't correct».
  const binDir = path.join(sdk, "bin");
  const realSdkManager = path.join(sdk, "cmdline-tools/latest/bin/sdkmanager");
  if (!fs.existsSync(path.join(binDir, "sdkmanager")) && fs.existsSync(realSdkManager)) {
    fs.mkdirSync(binDir, { recursive: true });
    fs.writeFileSync(path.join(binDir, "sdkmanager"),
      `#!/bin/sh\nexec ${realSdkManager} --sdk_root=${sdk} "$@"\n`, { mode: 0o755 });
  }

  const log = new ConsoleLog("apk");
  const config = new Config(jdk, sdk);
  const jdkHelper = new JdkHelper(process, config);
  const androidSdkTools = await AndroidSdkTools.create(process, config, jdkHelper, log);
  const gradle = new GradleWrapper(process, androidSdkTools, DIR);

  const manifest = await TwaManifest.fromFile(path.join(DIR, "twa-manifest.json"));
  console.log(`→ проект для ${manifest.host} (${manifest.packageId}), версия ${manifest.appVersionName}`);
  await new TwaGenerator().createTwaProject(DIR, manifest, log);

  console.log("→ gradle assembleRelease");
  await gradle.assembleRelease();

  const unsigned = path.join(DIR, "app/build/outputs/apk/release/app-release-unsigned.apk");
  const aligned = path.join(DIR, "app-release-unsigned-aligned.apk");
  const out = path.join(DIR, "electric-pro.apk");
  console.log("→ zipalign + подпись");
  await androidSdkTools.zipalign(unsigned, aligned, log);
  await androidSdkTools.apksigner(keystore, pw, manifest.signingKey.alias, pw, aligned, out, log);

  console.log(`ГОТОВО: ${path.relative(ROOT, out)} — ${(fs.statSync(out).size / 1048576).toFixed(2)} МБ`);
  console.log("Отпечаток ключа обязан совпадать с .well-known/assetlinks.json, иначе");
  console.log("приложение откроется с адресной строкой Chrome вместо полноэкранного вида.");
})().catch((e) => { console.error("ОШИБКА:", (e && e.message) || e); process.exit(1); });
