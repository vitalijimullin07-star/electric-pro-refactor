/* Electric Pro V29 — автоматический подъём версии кэш-бастинга (?v=NNNN) перед
   деплоем. Раньше версию поднимали руками в каждом пакете (см. CLAUDE.md,
   «Кэш-бастинг: у каждого изменённого ассета поднять ?v=NNNN... единый номер на
   пакет») — ручной процесс, легко забыть один файл (так и было: index.html/
   router.js/sw.js расходились по разным номерам несколько раз за сессию, что и
   привело к отдельному пакету «глобальный сброс кэша»). Скрипт убирает эту рутину
   целиком: запускается в CI (firebase-deploy.yml) на КАЖДЫЙ деплой, БЕЗ учёта того,
   что именно изменилось — сам факт пуша в main уже означает, что что-то изменилось,
   значит кэш-бастинг нужен всегда.

   Версия — unix-время в секундах (Date.now()/1000, всегда целое, всегда растёт,
   не требует хранить счётчик в репозитории — при каждом отдельном деплое время
   гарантированно другое). Формат ОБЯЗАН оставаться ЧИСТО ЧИСЛОВЫМ — pwa.js
   (versionFingerprint) сравнивает отпечаток версий регэкспом /[?&]v=(\d+)/g для
   автообновления уже открытых у пользователей вкладок; нечисловой формат сломал
   бы этот механизм молча.

   Правит файлы ПРЯМО В CHECKOUT РАННЕРА CI (не коммитит обратно в git — история
   репозитория остаётся такой, как её оставил разработчик; кэш-бастинг — свойство
   ДЕПЛОЙНУТОГО артефакта, не исходников). Для локального прогона (например, чтобы
   проверить, что скрипт работает, до пуша) правки останутся в рабочем дереве —
   их можно просто не коммитить (git checkout -- index.html assets/js/core/router.js
   sw.js), либо явно исключить каталог из проверки. */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const version = String(Math.floor(Date.now() / 1000));

// countMatcher — считает, СКОЛЬКО мест реально поменяется (для лога и для проверки
// "точно ли скрипт что-то нашёл" — молчаливый 0 обычно значит, что формат файла
// разошёлся со скриптом после рефакторинга, и на это стоит явно упасть в CI).
function bump(relPath, countMatcher, replacer) {
  const full = path.join(ROOT, relPath);
  const before = fs.readFileSync(full, "utf8");
  const n = (before.match(countMatcher) || []).length;
  if (n === 0) { console.log(`  ${relPath}: 0 совпадений`); return 0; }
  fs.writeFileSync(full, replacer(before), "utf8");
  console.log(`  ${relPath}: обновлено ${n}`);
  return n;
}

console.log(`Кэш-бастинг: новая версия ?v=${version}`);
let total = 0;
total += bump("index.html", /\?v=\d+/g, (s) => s.replace(/\?v=\d+/g, `?v=${version}`));
total += bump("assets/js/core/router.js", /\?v=\d+/g, (s) => s.replace(/\?v=\d+/g, `?v=${version}`));
total += bump("sw.js", /const CACHE = "ep-v29-shell-[^"]+";/, (s) => s.replace(/const CACHE = "ep-v29-shell-[^"]+";/, `const CACHE = "ep-v29-shell-${version}";`));

if (total === 0) {
  console.error("Кэш-бастинг: НИ ОДНОЙ ссылки не обновлено — вероятно, разошёлся формат файлов. Проверьте руками.");
  process.exit(1);
}
console.log(`Готово: версия ?v=${version} применена (index.html/router.js — ?v=, sw.js — имя кэша).`);
