# Electric Pro V29 — правила работы для Claude

PWA для электриков (RU). Vanilla JS (ES2020), IIFE-модули в `window.EP.*`, БЕЗ сборки,
БЕЗ TypeScript/React — не переписывать. Firebase Hosting/Auth/Firestore. Деплой:
push в `main` → GitHub Actions (`firebase-deploy.yml`) → синтакс-чек + `node test/run.js`
(гейт) → Firebase. APK-путь: PWA + TWA/Capacitor (см. docs/APK.md).

## Процесс (выработан с пользователем)
- Общение по-русски. НИКОГДА не использовать AskUserQuestion-попапы —
  варианты давать текстом нумерованным списком, пользователь отвечает цифрами.
- Пользователь шлёт замечания пакетами (5-7) со скриншотами. Цикл:
  реализовать → `node test/run.js` → поднять версии → коммит → PR → **squash-merge** → деплой сам.
- Кэш-бастинг: у каждого изменённого ассета поднять `?v=NNNN` в `index.html` (единый номер на пакет).
- После squash-merge ветка расходится с main. Паттерн:
  `git fetch origin main && git reset --hard origin/main && git cherry-pick <commit> && git push --force-with-lease`.
  ВСЕГДА коммитить до reset --hard. Ветка: `claude/full-audit-security-visualization-1fbjfm`.
- Тесты: `node test/run.js` (48 шт., без зависимостей; харнесс test/harness.js — vm-sandbox,
  cross-realm `instanceof` не работает — проверять утиными типами; DOM-атрибуты в
  fakeNode НЕ хранятся — UI-only правки в plan-unfold.js (клики/карточки) тестами
  не покрываются, только синтаксис-чек).
- Не планировать напоминания/wakeup'ы — пользователь просил без них.

## Модуль «Проект квартиры» (assets/js/modules/plan/)
Одна модель — много видов; все размеры в СМ. plan-core (модель/undo/облако),
plan-geometry (чистая математика: митра-кольца offsetRing/roomBand/insetContour,
polyWalk, wallThOf/wallMatOf — толщина/материал НА СТЕНУ через room.wallTh/wallMat[i]),
plan-canvas (viewBox-зум/пан, dragHandler с veto: return false из "start" = пан),
plan-render (штриховка паттернами userSpaceOnUse, маски проёмов, ГОСТ-символы
settings.symbolStyle), plan-rooms (режимы, тяга углов/стен, ввод длины цифрами),
plan-unfold (развёртка: fullscreen, карточка точки по двойному тапу, тяга на месте
через transform — НЕ пересобирать SVG в pointermove!), plan-routes (трассировка v4:
контур с отступом settings.routeOffset, перпендикулярные проходки Ø20 sleeveD,
макс. 2 кабеля), plan-calc (точный счёт по трассам: штробы по материалу стены,
ёмкость из EP.PoolEngine.DEFAULTS.capacity, ниша щита × модули), plan-scheme
(однолинейка через ShieldSchemeSVG, подбор корпуса), plan-export (печатный лист,
легенда ГОСТ), plan-rules (ПУЭ-проверки).

Ключевые инварианты:
- elemDrawPoint: отступ точки от стены = th/2+8 см, ЕДИНАЯ точка маркера и трассы.
- Трассы НЕ идут по стене и не пересекают её, кроме перпендикулярных проходок.
- Перф: во время drag НИКОГДА не звать полный drawStrip/renderScene на каждое
  движение — только transform/атрибуты + rAF (renderSceneSoon), полный рендер на отпускании.
- Мёртвая зона тапа 7 px (иначе двойной тап не работает).
- backfillProject() в plan-core.js — ЕДИНАЯ точка бэкофилла настроек/проёмов,
  вызывается и из openProject, и из importJSON (не дублировать логику).
- Автоперестройка трасс: core().onChange слушает AUTOREBUILD_ON (elem-move/
  room-reshape/wall-th/wall-mat/beam-move/beam-w) в plan-routes.js и тихо
  зовёт build({silent:true}), если p.routes уже не пуст — новые хендлеры
  геометрии НЕ обязаны сами дёргать Routes.build(), это сделает подписка.
- Коннекторы (ВАГО/ГМЛ/СИЗ): pin-count распайки = ТОЧНОЕ число сходящихся
  кабелей (inCnt+outCnt по графу трасс) — точнее, чем в pool-engine.
- wallAt: у ОБЩЕЙ стены двух комнат centerline совпадает — раньше побеждала
  всегда первая комната. Теперь через wallFrame.nrm сравниваем, В СТОРОНУ
  какой комнаты физически смещён тап (side>-0.5 = "внутри"), иначе вторая
  комната необратимо недостижима для простановки точек на своей стене.
- roomNear (plan-routes.js) — фолбэк для щита/точки НЕ строго внутри полигона
  комнаты (round-off у самой стены): G.roomAt → иначе комната ближайшей стены
  через G.wallAt. Без него buildPath получал ra/rb=null и падал на кривой
  ortho()-фолбэк вместо контура/перпендикулярной проходки.

## Бэклог (подтверждён пользователем)
Аудит-патч 1-5 — СДЕЛАН (см. коммит «Аудит-патч 1-5»).
Крупное (пользователь выбирает цифрами): 1 PDF-альбом (титул/планы по слоям/
развёртки/ведомость), 2 экспорт DXF (AutoCAD), 3 ручное редактирование трасс,
4 цены ₽ прямо в Расчёте, 5 фотофиксация точек, 6 обход проёмов при полу,
7 баланс фаз 3ф, 8 шаблоны комнат. UX-хвосты: редактор точки поверх развёртки,
ГОСТ-мини-значки в рамке постов.
