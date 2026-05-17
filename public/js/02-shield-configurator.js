/*
 * Electric PRO Refactor
 * Module: 02-shield-configurator.js
 * Generated from public/js/blocks/block-XX.js
 * ВНИМАНИЕ: на этом этапе код только разложен по модулям.
 * Подключение в index.html будем делать отдельным шагом после проверки.
 */



/* =========================================================
 * SOURCE: block-02.js
 * AUTO TARGET: 02-shield-configurator.js
 * SCORE: 390
 * HITS: shield, щит, cfg, automatic, автомат, УЗО, ДИФ, C16, C10, C6, C25, C32, C40, generateCascadePanel, контактор, rcd, dif, breaker, греб, шина, ПуГВ, НШВИ
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 2
 * Original HTML lines: 558-2063
 */

// === БЕЗОПАСНАЯ ОБОЛОЧКА И СИНХРОНИЗАЦИЯ ===
function safeGet(key, def) { try { return localStorage.getItem(key) || def; } catch(e) { return def; } }
function safeSet(key, val) { try { localStorage.setItem(key, val); } catch(e) {} }

window.addEventListener('offline', () => { showToast("📵 Нет интернета. Работаем локально."); });
window.addEventListener('online', () => { showToast("🌐 Связь восстановлена. Синхронизация..."); syncDraft(); });

let db, auth;
let GEMINI_API_KEY = safeGet('gemini_key_v31', "");
let appUser = null; 
let cust = {name:"", phone:"", addr:"", ceil:270};
try { let c = JSON.parse(safeGet('cust_v31', '{}')); if(c && c.name) cust = c; } catch(e){}

let hDB = []; 
try { hDB = JSON.parse(safeGet('h_v31', '[]')); } catch(e) { hDB = []; }
let currentEstimate = []; 
try { currentEstimate = JSON.parse(safeGet('est_v31', '[]')); } catch(e) { currentEstimate = []; }

let matDB = [], workDB = []; 
let pool = []; 
let coeffs = {mat:0, work:0};
try { let c = JSON.parse(safeGet('coeffs_v31', '{"mat":0,"work":0}')); coeffs = c; } catch(e){}

let appLogic = { 
    cabRes: 1.1, gofraRes: 1.05, basesPerM: 3, clipsPerM: 3, packSize: 100, mixPerBox: 0.3, crownLife: 80,
    priceSoc: 500, priceShield: 500, priceDrill: 600, priceShtroba: 550, priceCabCeil: 120,
    socketsPerJb: 3, connPerSocJb: 3, connPerSwJb: 3, connPerPassJb: 4,
    shieldInstallPrice: 2500,
    shieldInputConnectPrice: 1500,
    shieldTestLinePrice: 150,
    shieldMarkLinePrice: 100,
    shieldSchemePrice: 4000,
    shieldNichePerModule: 400,
    shieldInputGroovePrice: 1500,
    shieldPeBusContacts: 26,
    shieldPugvSize: 6,
    shieldNshviPackSize: 100
};
try { let logic = JSON.parse(safeGet('appLogic_v31', '{}')); appLogic = Object.assign(appLogic, logic); } catch(e){}

let priceOverrides = {};
let cfg = {kits: 1, baths: 1, toilets: 1, rms: 1, bals: 0, acs: 0, fls: 0 };
var st_soc = 1, st_sw = 0, st_pass = 0, st_cross = 0, st_tv = 0, st_tpol = 0, st_q = 1, st_h = 30, st_p = 1, st_podr = 'std';
let globalRecalcCab = 0, globalRecalcSht = 0; let pendingAdd = null; let currentCardId = null;
let currentShieldExtras = [];
let currentPreviewMode = '';
let adminDraftsCache = [];
let buhChartInstance = null;

// === БАЗА ДАННЫХ ===
const FULL_MAT_INIT=[{"id":"m1","c":"Кабель","n":"Кабель ВВГнг-LS 3х1.5 (Конкорд) круглый","p":57,"u":"м.п."},{"id":"m2","c":"Кабель","n":"Кабель ВВГнг-LS 3х2.5 (Конкорд) круглый","p":87,"u":"м.п."},{"id":"m3","c":"Кабель","n":"Кабель ВВГнг(п)-LS 3х1.5 (Конкорд) плоский","p":62,"u":"м.п."},{"id":"m4","c":"Кабель","n":"Кабель ВВГнг(п)-LS 3х2.5 (Конкорд) плоский","p":95,"u":"м.п."},{"id":"m5","c":"Кабель","n":"Кабель ВВГ-Пнг(А)-LS 3x4 (Лептон)","p":146,"u":"м.п."},{"id":"m6","c":"Кабель","n":"Кабель ВВГ-Пнг(А)-LS 3х6 (Лептон)","p":217,"u":"м.п."},{"id":"m7","c":"Кабель","n":"Провод ПуГВ (ПВ-3) 1х6 синий (ЦВЕТЛИТ)","p":85,"u":"м.п."},{"id":"m8","c":"Кабель","n":"Провод ПуГВ (ПВ-3) 1х6 белый (ЦВЕТЛИТ)","p":85,"u":"м.п."},{"id":"m9","c":"Слаботочка","n":"Кабель TV SAT-703 (Cavel)","p":75,"u":"м.п."},{"id":"m10","c":"Слаботочка","n":"Витая пара комп. экран. FTP4 CAT5E 24AWG Cu","p":32,"u":"м.п."},{"id":"m11","c":"Трубы","n":"Труба гофрированная ПВХ 20мм серая","p":8,"u":"м.п."},{"id":"m12","c":"Трубы","n":"Труба гофрированная ПНД 20мм черная","p":10,"u":"м.п."},{"id":"m13","c":"Трубы","n":"Гофра ПВХ/ПНД с протяжкой","p":25,"u":"м.п."},{"id":"m14","c":"Расходники","n":"Подрозетник глубокий для бетона 68х64","p":12,"u":"шт"},{"id":"m15","c":"Расходники","n":"Подрозетник стандарт (ГКЛ)","p":20,"u":"шт"},{"id":"m16","c":"Расходники","n":"Подрозетник глубокий (ГКЛ)","p":35,"u":"шт"},{"id":"m17","c":"Расходники","n":"Коробка распределительная 100х100х40","p":120,"u":"шт"},{"id":"m18","c":"Расходники","n":"Площадка под стяжку для прямого монтажа","p":5,"u":"шт"},{"id":"m19","c":"Расходники","n":"Стяжки нейлоновые КСС 3*100 (100шт)","p":40,"u":"упак."},{"id":"m20","c":"Расходники","n":"Стяжки нейлоновые КСС 5*400 (100шт)","p":410,"u":"упак."},{"id":"m21","c":"Расходники","n":"Газовый баллон 80 мл 165 мм","p":550,"u":"шт"},{"id":"m22","c":"Расходники","n":"Гвозди для прямого монтажа 3х19 мм (1000 шт)","p":1905,"u":"упак."},{"id":"m23","c":"Расходники","n":"Лента монтажная (перфолента)","p":580,"u":"шт"},{"id":"m24","c":"Расходники","n":"Лента монтажная текстильная 20 мм (50м)","p":880,"u":"упак."},{"id":"m25","c":"Щитовое","n":"Наконечник НШВИ 6.0-12 (упак)","p":225,"u":"упак."},{"id":"m26","c":"Щитовое","n":"Наконечник НШВИ(2) 6.0-14 (упак)","p":365,"u":"упак."},{"id":"m27","c":"Расходники","n":"Гильза ГМЛ 4","p":12,"u":"шт"},{"id":"m28","c":"Расходники","n":"Гильза ГМЛ 6","p":18,"u":"шт"},{"id":"m29","c":"Расходники","n":"Термоусадка (м)","p":80,"u":"м"},{"id":"m30","c":"Автоматика","n":"Автомат 1P 10A (ABB SH201)","p":265,"u":"шт"},{"id":"m31","c":"Автоматика","n":"Автомат 1P 16A (ABB SH201)","p":265,"u":"шт"},{"id":"m32","c":"Автоматика","n":"Автомат 1P 40A (ABB SH201)","p":410,"u":"шт"},{"id":"m33","c":"Автоматика","n":"ДИФ Автомат DSH201 C32 AC30 (ABB)","p":3100,"u":"шт"},{"id":"m34","c":"Щитовое","n":"Клеммник винтовой N 5x16 (ABB)","p":345,"u":"шт"},{"id":"m35","c":"Щитовое","n":"Клеммник винтовой PE 11x16 (ABB)","p":770,"u":"шт"},{"id":"m36","c":"Щитовое","n":"Шкаф внутрь. на 36М UK636E3 (ABB)","p":6510,"u":"шт"},{"id":"m37","c":"Щитовое","n":"Шкаф мультимедийный UK620MV (ABB)","p":11025,"u":"шт"},{"id":"m38","c":"Автоматика","n":"Автомат 1P 10A (ИЭК ВА47-29)","p":172,"u":"шт"},{"id":"m39","c":"Автоматика","n":"Автомат 1P 16A (ИЭК ВА47-29)","p":150,"u":"шт"},{"id":"m40","c":"Автоматика","n":"Автомат 2P 40A (ИЭК ВА47-29)","p":380,"u":"шт"},{"id":"m41","c":"Автоматика","n":"УЗО 2P 40A 30мА (ИЭК ВД1-63)","p":1195,"u":"шт"},{"id":"m42","c":"Щитовое","n":"Шина N ноль на DIN-изол (ИЭК)","p":285,"u":"шт"},{"id":"m43","c":"Щитовое","n":"Корпус пластиковый ЩРВ-П-24 (TEKFOR)","p":2660,"u":"шт"},{"id":"m44","c":"Автоматика","n":"Реле напряжения УЗМ-50Ц","p":4500,"u":"шт"}];
const FULL_WORK_INIT=[{"id":"w44","c":"Алмазная резка","g":"Штроба 25х30","n":"Бетон","p":550,"u":"м.п."},{"id":"w45","c":"Алмазная резка","g":"Штроба 25х30","n":"Кирпич","p":400,"u":"м.п."},{"id":"w46","c":"Алмазная резка","g":"Штроба 25х30","n":"Панелька","p":700,"u":"м.п."},{"id":"w47","c":"Алмазная резка","g":"Штроба 25х30","n":"Мягкий мат.","p":400,"u":"м.п."},{"id":"w48","c":"Алмазная резка","g":"Штроба 50х50","n":"Бетон","p":1500,"u":"м.п."},{"id":"w49","c":"Алмазная резка","g":"Штроба 50х50","n":"Кирпич","p":1300,"u":"м.п."},{"id":"w50","c":"Алмазная резка","g":"Штроба 50х50","n":"Панелька","p":1900,"u":"м.п."},{"id":"w51","c":"Алмазная резка","g":"Штроба 50х50","n":"Мягкий мат.","p":900,"u":"м.п."},{"id":"w52","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Бетон","p":2200,"u":"м.п."},{"id":"w53","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Кирпич","p":1550,"u":"м.п."},{"id":"w54","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Панелька","p":2500,"u":"м.п."},{"id":"w55","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Мягкий мат.","p":1400,"u":"м.п."},{"id":"w56","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Бетон","p":600,"u":"шт"},{"id":"w57","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Кирпич","p":500,"u":"шт"},{"id":"w58","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Панелька","p":650,"u":"шт"},{"id":"w59","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Мягкий мат.","p":400,"u":"шт"},{"id":"w60","c":"Черновая электрика","g":"Вклейка подрозетников","n":"Все типы","p":100,"u":"шт"},{"id":"w61","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Бетон","p":400,"u":"мод."},{"id":"w62","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Кирпич","p":300,"u":"мод."},{"id":"w63","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Панелька","p":500,"u":"мод."},{"id":"w64","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Мягкий мат.","p":250,"u":"мод."},{"id":"w65","c":"Монтаж","g":"Прокладка кабеля","n":"Без гофры (Потолок)","p":120,"u":"м.п."},{"id":"w66","c":"Монтаж","g":"Прокладка кабеля","n":"В гофре (Пол)","p":150,"u":"м.п."},{"id":"w67","c":"Монтаж","g":"Распаячная коробка","n":"Сборка распред. коробки / коммутация","p":800,"u":"шт"},{"id":"w68","c":"Чистовая установка","g":"Механизмы","n":"Установка розетки 220В","p":500,"u":"шт"},{"id":"w69","c":"Чистовая установка","g":"Механизмы","n":"Установка выключателя","p":550,"u":"шт"},{"id":"w70","c":"Чистовая установка","g":"Механизмы","n":"Установка терморегулятора","p":900,"u":"шт"},{"id":"w71","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Бетон","p":650,"u":"шт"},{"id":"w72","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Кирпич","p":550,"u":"шт"},{"id":"w73","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Панелька","p":750,"u":"шт"},{"id":"w74","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Мягкий мат.","p":450,"u":"шт"},{"id":"w75","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Бетон","p":800,"u":"шт"},{"id":"w76","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Кирпич","p":700,"u":"шт"},{"id":"w77","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Панелька","p":850,"u":"шт"},{"id":"w78","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Мягкий мат.","p":500,"u":"шт"},{"id":"w79","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Бетон","p":6000,"u":"шт"},{"id":"w80","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Кирпич","p":4500,"u":"шт"},{"id":"w81","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Панелька","p":7000,"u":"шт"},{"id":"w82","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Мягкий мат.","p":4000,"u":"шт"},{"id":"w83","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Бетон","p":2500,"u":"шт"},{"id":"w84","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Кирпич","p":2000,"u":"шт"},{"id":"w85","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Панелька","p":3000,"u":"шт"},{"id":"w86","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Мягкий мат.","p":1900,"u":"шт"},{"id":"w87","c":"Щитовое","g":"Монтаж","n":"Сборка щита","p":500,"u":"мод."},{"id":"w89","c":"Щитовое","g":"Монтаж","n":"Установка БП в щит","p":900,"u":"ед"},{"id":"w91","c":"Монтаж","g":"Спецоборудование","n":"Подключение нагревателя","p":4000,"u":"ед"},{"id":"w92","c":"Монтаж","g":"Спецоборудование","n":"Система КУП","p":5000,"u":"ед"},{"id":"s_r1","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле времени","p":1250,"u":"шт"},{"id":"s_r2","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле освещения (в щите)","p":1250,"u":"шт"},{"id":"s_r3","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле температуры/жидкости","p":1700,"u":"шт"},{"id":"s_r4","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле контроля фаз","p":1450,"u":"шт"},{"id":"s_r5","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле напряжения","p":1150,"u":"шт"},{"id":"s_r6","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле управления нагрузкой","p":2050,"u":"шт"},{"id":"s_m1","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 220-240В на DIN","p":1000,"u":"шт"},{"id":"s_m2","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 220-240В на монтажную панель","p":1250,"u":"шт"},{"id":"s_m3","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 380-400В на DIN","p":1700,"u":"шт"},{"id":"s_m4","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 380-400В на монтажную панель","p":2200,"u":"шт"},{"id":"s_m5","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика под трансформаторы тока","p":2400,"u":"шт"},{"id":"s_m6","c":"Щитовое","g":"Счетчики","n":"Установка трансформатора тока (без подкл)","p":720,"u":"шт"},{"id":"s_p1","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на бетон","p":680,"u":"шт"},{"id":"s_p2","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на кирпич","p":600,"u":"шт"},{"id":"s_p3","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на ГКЛ","p":530,"u":"шт"},{"id":"s_p4","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на дерево","p":450,"u":"шт"},{"id":"s_p5","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка накладной силовой розетки 380В","p":1000,"u":"шт"},{"id":"s_p6","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка встраиваемой силовой розетки 380В","p":530,"u":"шт"},{"id":"s_p7","c":"Чистовая установка","g":"Механизмы","n":"Установка встраиваемой розетки/выкл в подрозетник","p":300,"u":"шт"},{"id":"s_p8","c":"Чистовая установка","g":"Механизмы","n":"Установка блока розеток/выкл","p":1200,"u":"шт"},{"id":"s_d1","c":"Черновая электрика","g":"Электроточки","n":"Установка накладного подрозетника","p":300,"u":"шт"},{"id":"s_d2","c":"Черновая электрика","g":"Электроточки","n":"Установка подрозетника","p":180,"u":"шт"},{"id":"s_d3","c":"Черновая электрика","g":"Электроточки","n":"Установка накладной распаечной коробки","p":450,"u":"шт"},{"id":"s_d4","c":"Черновая электрика","g":"Электроточки","n":"Установка встраиваемой распаечной коробки","p":300,"u":"шт"},{"id":"s_d5","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка термостата","p":380,"u":"шт"},{"id":"s_d6","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка встраиваемого датчика движения","p":330,"u":"шт"},{"id":"s_d7","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка звонка","p":680,"u":"шт"},{"id":"s_d8","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка кнопки звонка","p":450,"u":"шт"},{"id":"s_d9","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка ТВ краба","p":480,"u":"шт"},{"id":"s_sh1","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 2 модуля","p":180,"u":"шт"},{"id":"s_sh2","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 4-8 модулей","p":290,"u":"шт"},{"id":"s_sh3","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 12-24 модуля","p":330,"u":"шт"},{"id":"s_sh4","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 36-60 модулей","p":560,"u":"шт"},{"id":"s_sh5","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 72-96 модулей","p":780,"u":"шт"},{"id":"s_l1","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на кухне под шкафами","p":270,"u":"м.п."},{"id":"s_l2","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в натяжной потолок","p":390,"u":"м.п."},{"id":"s_l3","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на гипсокартон","p":300,"u":"м.п."},{"id":"s_l4","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в потолочный плинтус","p":350,"u":"м.п."},{"id":"s_l5","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в алюминиевый профиль","p":230,"u":"м.п."},{"id":"s_l6","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на карниз","p":350,"u":"м.п."},{"id":"s_l7","c":"Освещение","g":"LED Лента","n":"Установка светодиодной ленты в светильник","p":180,"u":"м.п."},{"id":"s_l8","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на улице","p":380,"u":"м.п."},{"id":"s_l9","c":"Освещение","g":"Алюм. профиль","n":"Установка накладного алюм. профиля на скотч","p":110,"u":"м.п."},{"id":"s_l10","c":"Освещение","g":"Алюм. профиль","n":"Установка накладного алюм. профиля со сверлением","p":290,"u":"м.п."},{"id":"s_l11","c":"Освещение","g":"Алюм. профиль","n":"Установка врезного алюм. профиля в готовый паз","p":120,"u":"м.п."},{"id":"s_l12","c":"Освещение","g":"Алюм. профиль","n":"Установка врезного алюм. профиля с подготовкой паза","p":390,"u":"м.п."},{"id":"s_c1","c":"Освещение","g":"Люстры и Светильники","n":"Сборка простой люстры","p":630,"u":"шт"},{"id":"s_c2","c":"Освещение","g":"Люстры и Светильники","n":"Сборка сложной люстры","p":870,"u":"шт"},{"id":"s_c3","c":"Освещение","g":"Люстры и Светильники","n":"Установка крюка под люстру","p":230,"u":"шт"},{"id":"s_c4","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры на готовый крюк","p":740,"u":"шт"},{"id":"s_c5","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры с креплением к потолку (простая)","p":1200,"u":"шт"},{"id":"s_c6","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры с креплением к потолку (сложная/ДУ)","p":2250,"u":"шт"},{"id":"s_c7","c":"Освещение","g":"Люстры и Светильники","n":"Установка тяжелой люстры с креплением на крюк","p":1950,"u":"шт"},{"id":"s_c8","c":"Освещение","g":"Люстры и Светильники","n":"Установка тяжелой люстры с креплением к потолку","p":3600,"u":"шт"},{"id":"s_c9","c":"Освещение","g":"Люстры и Светильники","n":"Установка настенного светильника, бра","p":450,"u":"шт"},{"id":"s_c10","c":"Освещение","g":"Люстры и Светильники","n":"Установка точечного светильника","p":750,"u":"шт"},{"id":"s_c11","c":"Освещение","g":"Люстры и Светильники","n":"Установка светодиодного светильника","p":680,"u":"шт"},{"id":"s_c12","c":"Освещение","g":"Люстры и Светильники","n":"Установка светильника Армстронг","p":380,"u":"шт"},{"id":"s_c13","c":"Освещение","g":"Люстры и Светильники","n":"Установка люминесцентного светильника","p":410,"u":"шт"},{"id":"s_c14","c":"Освещение","g":"Люстры и Светильники","n":"Установка трекового светильника","p":140,"u":"шт"},{"id":"s_c15","c":"Освещение","g":"Люстры и Светильники","n":"Монтаж шинопровода","p":450,"u":"м.п."},{"id":"s_c16","c":"Освещение","g":"Уличное освещение","n":"Установка уличного светильника на фасаде","p":830,"u":"шт"},{"id":"s_c17","c":"Освещение","g":"Уличное освещение","n":"Установка садово-паркового светильника","p":1350,"u":"шт"},{"id":"s_c18","c":"Освещение","g":"Люстры и Светильники","n":"Установка светильника Выход","p":480,"u":"шт"},{"id":"s_c19","c":"Освещение","g":"Уличное освещение","n":"Установка антивандального светильника","p":660,"u":"шт"},{"id":"s_dem1","c":"Демонтаж","g":"Освещение","n":"Демонтаж люстры","p":240,"u":"шт"},{"id":"s_dem2","c":"Демонтаж","g":"Освещение","n":"Демонтаж светильника","p":210,"u":"шт"},{"id":"s_dem3","c":"Демонтаж","g":"Электроточки","n":"Демонтаж розетки","p":200,"u":"шт"},{"id":"s_dem4","c":"Демонтаж","g":"Электроточки","n":"Демонтаж выключателя","p":200,"u":"шт"},{"id":"s_dem5","c":"Демонтаж","g":"Электроточки","n":"Демонтаж распаечной коробки","p":200,"u":"шт"},{"id":"s_dem6","c":"Демонтаж","g":"Электроточки","n":"Демонтаж дверного звонка","p":200,"u":"шт"},{"id":"s_dem7","c":"Демонтаж","g":"Щитовое","n":"Демонтаж реле времени","p":230,"u":"шт"},{"id":"s_dem8","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка до 8 модулей","p":110,"u":"шт"},{"id":"s_dem9","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка 12-36 модулей","p":260,"u":"шт"},{"id":"s_dem10","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка 48-96 модулей","p":470,"u":"шт"},{"id":"s_dem11","c":"Демонтаж","g":"Щитовое","n":"Демонтаж автомата","p":150,"u":"шт"},{"id":"s_dem12","c":"Демонтаж","g":"Щитовое","n":"Демонтаж УЗО","p":150,"u":"шт"},{"id":"s_dem13","c":"Демонтаж","g":"Щитовое","n":"Демонтаж дифавтомата","p":150,"u":"шт"},{"id":"s_dem14","c":"Демонтаж","g":"Щитовое","n":"Демонтаж рубильника","p":150,"u":"шт"},{"id":"s_dem15","c":"Демонтаж","g":"Щитовое","n":"Демонтаж магнитного пускателя","p":140,"u":"шт"}];

// === FIREBASE INIT ===
try {
    firebase.initializeApp({
        apiKey: "AIzaSyBr_LVhNKtiNb--Vh5WHhvFuR-r47N3iCw",
        authDomain: "electric-489f7.firebaseapp.com",
        projectId: "electric-489f7",
        storageBucket: "electric-489f7.firebasestorage.app",
        messagingSenderId: "674960586951",
        appId: "1:674960586951:web:522b0557e75bb97dea26e2"
    });
    db = firebase.firestore();
    auth = firebase.auth();
    db.settings({ cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED });
    db.enablePersistence().catch(err => console.warn("Offline cache failed", err));
} catch(e) { console.error("Firebase error", e); }

// === GOOGLE AUTH ===
async function handleGoogleAuth() {
    if(!auth) return alert("Ошибка: Firebase не загружен. Проверьте интернет-соединение.");
    showLoader("Подключение к Google...", "🔄");
    try { 
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await auth.signInWithPopup(provider); 
    } catch(e) { 
        hideLoader();
        if(e.code !== 'auth/popup-closed-by-user') alert("Сбой Google Auth: " + e.message); 
    }
}

document.getElementById('btn-google-login').addEventListener('click', handleGoogleAuth);
let regBtn = document.getElementById('btn-google-reg');
if (regBtn) regBtn.addEventListener('click', handleGoogleAuth);

if(auth) {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            showLoader("Загрузка профиля...", "🔒");
            try {
                const userRef = db.collection('users').doc(user.uid);
                const docSnap = await userRef.get();
                if (!docSnap.exists) {
                    await userRef.set({ name: user.displayName || "Мастер", email: user.email, role: 'master', isApproved: false, geminiKey: '', phone: '', pin: '' });
                    hideLoader(); document.getElementById('authModal').style.display='none'; document.getElementById('waitingModal').style.display='flex';
                } else {
                    appUser = docSnap.data(); appUser.uid = user.uid; hideLoader();
                    if (appUser.isApproved || appUser.role === 'admin') {
                        document.getElementById('authModal').style.display='none'; document.getElementById('waitingModal').style.display='none'; finishLoginSetup();
                    } else { document.getElementById('authModal').style.display='none'; document.getElementById('waitingModal').style.display='flex'; }
                }
            } catch(e) { hideLoader(); alert("Ошибка связи с БД: " + e.message); }
        } else {
            hideLoader(); checkLocalPinUser();
        }
    });
} else {
    hideLoader(); checkLocalPinUser();
}

function checkLocalPinUser() {
    let pinUser = safeGet('authUser_v31_pin', null);
    if (pinUser) { 
        try { appUser = JSON.parse(pinUser); finishLoginSetup(); } catch(e){ document.getElementById('authModal').style.display='flex'; } 
    } else { document.getElementById('authModal').style.display='flex'; }
}

window.customAlert = (title, text) => {
    return new Promise(resolve => {
        const overlay = document.getElementById('custom-modal-overlay');
        document.getElementById('cm-title').innerText = title;
        document.getElementById('cm-text').innerText = text;
        document.getElementById('cm-input').style.display = 'none';
        document.getElementById('cm-cancel').style.display = 'none';
        overlay.style.display = 'flex';
        document.getElementById('cm-ok').onclick = () => { overlay.style.display = 'none'; resolve(); };
    });
};

window.customConfirm = (title, text) => {
    return new Promise(resolve => {
        const overlay = document.getElementById('custom-modal-overlay');
        document.getElementById('cm-title').innerText = title;
        document.getElementById('cm-text').innerText = text;
        document.getElementById('cm-input').style.display = 'none';
        document.getElementById('cm-cancel').style.display = 'block';
        overlay.style.display = 'flex';
        document.getElementById('cm-ok').onclick = () => { overlay.style.display = 'none'; resolve(true); };
        document.getElementById('cm-cancel').onclick = () => { overlay.style.display = 'none'; resolve(false); };
    });
};

window.alert = (msg) => { window.customAlert("Уведомление", msg); };

function showLoader(text, icon = '☁️') { document.getElementById('loader-icon').innerText = icon; document.getElementById('loader-text').innerText = text; document.getElementById('global-loader').classList.add('show'); }
function hideLoader() { document.getElementById('global-loader').classList.remove('show'); }
function showToast(msg) { let t = document.getElementById('toast'); t.innerText = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); }

async function loginWithPin() {
    let phone = document.getElementById('auth-phone').value.trim();
    let pin = document.getElementById('auth-pin').value.trim();
    if(!phone || !pin) return showToast("Введите номер и PIN-код!");
    showLoader("Проверка...", "🔒");
    
    if(phone === '89776230182' && pin === 'vbvbvb987') {
        appUser = { phone: phone, name: "Виталий (Руководитель)", role: "admin", isApproved: true };
        safeSet('authUser_v31_pin', JSON.stringify(appUser));
        hideLoader(); finishLoginSetup();
        return;
    }
    
    try {
        if(!db) throw new Error("Нет связи с БД");
        const snap = await db.collection('users').where('phone', '==', phone).where('pin', '==', pin).get();
        if(snap.empty) { hideLoader(); return window.customAlert("Ошибка", "Неверный вход."); }
        appUser = snap.docs[0].data(); appUser.uid = snap.docs[0].id;
        
        if (appUser.isApproved === true || appUser.role === 'admin') {
            safeSet('authUser_v31_pin', JSON.stringify(appUser));
            hideLoader(); finishLoginSetup();
        } else {
            hideLoader(); document.getElementById('authModal').style.display='none'; document.getElementById('waitingModal').style.display='block';
        }
    } catch(err) { hideLoader(); window.customAlert("Ошибка базы", err.message); }
}

function confirmLogout() { 
    if(auth) auth.signOut(); 
    safeSet('authUser_v31_pin', ''); 
    window.location.reload(); 
}

async function finishLoginSetup() {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('waitingModal').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    
    if (appUser.geminiKey) { GEMINI_API_KEY = appUser.geminiKey; document.getElementById('api-key-input').value = GEMINI_API_KEY; }
    
    if(appUser.role === 'admin') { 
        document.getElementById('admin-panel').style.display = 'block'; 
        listenForApprovals(); 
        loadMasterDrafts(); 
        renderAdminUsers(); 
    }
    
    let savedTheme = safeGet('theme_v31', 'light'); changeTheme(savedTheme); document.getElementById('theme-select').value = savedTheme;
    document.getElementById('m-coeff').value = coeffs.mat; document.getElementById('w-coeff').value = coeffs.work;
    document.getElementById('qr-tg').value = safeGet('qr_tg_v31', ''); 
    document.getElementById('qr-wa').value = safeGet('qr_wa_v31', '');
    document.getElementById('qr-vk').value = safeGet('qr_vk_v31', '');
    document.getElementById('ai-shops').value = safeGet('ai_shops_v31', 'Лемана ПРО, ВсеИнструменты, Петрович');

    showLoader('Синхронизация...', '☁️');
    try {
        if(db) {
            const dbDoc = await db.collection('settings').doc('global_db').get();
            if(dbDoc.exists) { matDB = dbDoc.data().matDB || FULL_MAT_INIT; workDB = dbDoc.data().workDB || FULL_WORK_INIT; }
            else { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; }
            const logicDoc = await db.collection('settings').doc('global_logic').get();
            if(logicDoc.exists) appLogic = Object.assign(appLogic, logicDoc.data());
            
            const histSnap = await db.collection('history').get();
            hDB = histSnap.docs.map(doc => doc.data());
            const draftDoc = await db.collection('drafts').doc(appUser.uid).get();
            if(draftDoc.exists && currentEstimate.length === 0) { 
                currentEstimate = draftDoc.data().estimate || []; 
                let c = draftDoc.data().cust;
                if(c) { cust = c; safeSet('cust_v31', JSON.stringify(cust)); }
            }
        } else { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; }
    } catch(e) { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; console.error(e); }
    
    hideLoader(); updateMasterBadge(); renderMainTable(); updateHistList();
    if(!(cust && cust.name)) { setTimeout(() => { openModal('custModal'); }, 400); }
}

function openModal(id) { 
    if(id === 'custModal') loadCustHistoryOptions(); 
    if(id === 'logicModal') renderLogicUI(); 
    if(id === 'settModal') renderDbEditors(); 
    if(id === 'configModal') populateShieldExtras();
    if(id === 'buhModal') setTimeout(renderChart, 100);
    document.getElementById(id).style.display='flex'; 
}
function closeModal(id) { document.getElementById(id).style.display='none'; }
function toggleMenu() { document.getElementById('burger-menu').classList.toggle('open'); document.getElementById('burger-overlay').classList.toggle('open'); }
function changeTheme(theme) { document.documentElement.setAttribute('data-theme', theme); safeSet('theme_v31', theme); }
function updateMasterBadge() { document.getElementById('master-badge').innerHTML = `${appUser?.name || "Мастер"}<br>Объект: ${cust.name || 'Не выбран'}`; }

function updateCoeffs() {
    coeffs.mat = Number(document.getElementById('m-coeff').value);
    coeffs.work = Number(document.getElementById('w-coeff').value);
    safeSet('coeffs_v31', JSON.stringify(coeffs));
    renderMainTable();
}

async function saveApiKey(val) { 
    GEMINI_API_KEY = val.trim(); safeSet('gemini_key_v31', GEMINI_API_KEY);
    if(db && appUser && appUser.uid) { try { await db.collection('users').doc(appUser.uid).update({geminiKey: GEMINI_API_KEY}); }catch(e){} }
    showToast("🔑 Ключ сохранен!"); 
}
function saveQRs() { 
    safeSet('qr_tg_v31', document.getElementById('qr-tg').value); 
    safeSet('qr_wa_v31', document.getElementById('qr-wa').value); 
    safeSet('qr_vk_v31', document.getElementById('qr-vk').value);
    safeSet('ai_shops_v31', document.getElementById('ai-shops').value); 
    showToast("📱 Настройки сохранены"); 
}

function fPrice(it) { return Math.round((it.p || 0) * (1 + (it.type === 'mat'? coeffs.mat: coeffs.work) / 100)); }

// === ЗАМЕНА МАТЕРИАЛА / РАБОТЫ ПО КЛИКУ ===
let swapTargetIdx = -1;
function openSwapModal(idx) {
    swapTargetIdx = idx;
    let current = currentEstimate[idx];
    let sel = document.getElementById('swap-select');
    let isMat = current.type === 'mat';
    let dbToUse = isMat ? matDB : workDB;
    
    let opts = dbToUse.map(x => `<option value="${x.id}" ${x.n===current.n ? 'selected' : ''}>${x.n} (${x.p} ₽)</option>`).join('');
    sel.innerHTML = opts;
    openModal('swapModal');
}

function applySwap() {
    if(swapTargetIdx < 0) return;
    let selId = document.getElementById('swap-select').value;
    let current = currentEstimate[swapTargetIdx];
    let isMat = current.type === 'mat';
    let dbToUse = isMat ? matDB : workDB;
    let newItem = dbToUse.find(x => x.id === selId);
    
    if(newItem) {
        currentEstimate[swapTargetIdx].n = newItem.n;
        currentEstimate[swapTargetIdx].p = newItem.p;
        renderMainTable();
        closeModal('swapModal');
        showToast("Заменено!");
    }
}

function renderMainTable() {
    const tb = document.querySelector("#mainTable tbody"); tb.innerHTML = ""; let total = 0;
    currentEstimate.forEach((it, idx) => {
        let sum = fPrice(it) * it.q; total += sum;
        tb.innerHTML += `<tr>
            <td class="col-name editable-name" onclick="openSwapModal(${idx})" title="Нажмите для замены">${it.n}</td>
            <td class="col-qty"><input type="number" value="${it.q}" onchange="currentEstimate[${idx}].q=Number(this.value); renderMainTable();" style="width:50px; padding:6px; margin:0; text-align:center;"></td>
            <td class="col-sum">${sum} P</td>
            <td style="text-align:right;"><button onclick="currentEstimate.splice(${idx},1);renderMainTable();" class="btn-danger" style="padding:6px; border-radius:8px; width:auto; margin:0;">✕</button></td>
        </tr>`;
    });
    document.getElementById('tot-all').innerText = total.toLocaleString() + ' P'; syncDraft();
}

async function syncDraft() { try { safeSet('est_v31', JSON.stringify(currentEstimate)); if(db && appUser && appUser.uid) await db.collection('drafts').doc(appUser.uid).set({ estimate: currentEstimate, cust: cust, timestamp: new Date().toISOString() }); } catch(e){} }
async function clearCurrentEstimate() { let c = await window.customConfirm("Очистка", "Очистить смету?"); if(c){ currentEstimate=[]; renderMainTable(); } }

function openMatCatalog() { 
    let cats = {}; matDB.forEach(m => { let c = m.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(m); }); 
    let html = ""; let idx = 0;
    for(let c in cats) { 
        let sid = 'mcat_' + (idx++);
        html += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
        cats[c].forEach(m => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${m.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${m.p} P / ${m.u}</span></div><button class="mat-add-btn" onclick="promptAdd('${m.id}', 'mat')">+ Добавить</button></div>`; });
        html += `</div>`;
    } document.getElementById('mat-cat-list').innerHTML = html; openModal('matCatModal'); 
}

function openWorkCatalog() { 
    let cats = {}; workDB.forEach(w => { let c = w.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(w); });
    let html = ""; let idx = 0;
    for(let c in cats) { 
        let sid = 'wcat_' + (idx++);
        html += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
        cats[c].forEach(w => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${w.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${w.p} P / ${w.u}</span></div><button class="mat-add-btn" style="background:var(--orange);" onclick="promptAdd('${w.id}', 'work')">+ Добавить</button></div>`; });
        html += `</div>`;
    } document.getElementById('work-cat-list').innerHTML = html; openModal('workModal'); 
}

function toggleCat(id) { let el = document.getElementById(id); el.classList.toggle('active'); }

function promptAdd(id, type) { 
    let dbArr = (type==='mat'?matDB:workDB); let item = dbArr.find(x => String(x.id) === String(id)); 
    if(!item) return; pendingAdd = { item, type }; 
    document.getElementById('qty-prompt-name').innerText = item.n; 
    document.getElementById('qty-input').value = 1; 
    openModal('qtyPromptModal'); 
}
function confirmQtyAdd() { 
    let q = Number(document.getElementById('qty-input').value); 
    if(q > 0) { addAuto([{...pendingAdd.item, q: q, type: pendingAdd.type}], 'man_'+Date.now()); } 
    closeModal('qtyPromptModal'); showToast("Добавлено!");
}

function addAuto(items, tag) {
    currentEstimate = currentEstimate.filter(it => it.tag !== tag);
    const map = {};
    const out = [];
    (items || []).forEach(src => {
        if (!src) return;
        const it = Object.assign({}, src);
        it.tag = tag;
        const key = [it.tag || '', it.type || '', it.n || '', Number(it.p) || 0, it.u || 'шт'].join('|');
        let rec = map[key];
        if (!rec) {
            rec = Object.assign({}, it, { q: 0 });
            map[key] = rec;
            out.push(rec);
        }
        rec.q += Number(it.q) || 0;
        epV15MergeAssignments(rec, it);
    });
    currentEstimate = currentEstimate.concat(out);
    renderMainTable();
}

function setPodr(v, el) { st_podr = v; document.querySelectorAll('#podr-tiles .tile').forEach(t=>t.classList.remove('active')); el.classList.add('active'); }
function setH(v, el) { st_h = v; if(el){ document.querySelectorAll('#h-tiles .tile').forEach(t=>t.classList.remove('active')); el.classList.add('active'); } }
function setP(v) { st_p = v; document.querySelectorAll('#p-tiles .tile').forEach((t,i) => { if(i===v-1) t.classList.add('active'); else t.classList.remove('active'); }); }

function modM(t, v) { 
    let currentP = st_soc + st_sw + st_pass + st_cross + st_tv + st_tpol;
    if (v > 0 && currentP >= 6) return showToast("Максимум 6 постов в одной рамке!");
    if (v < 0 && window['st_'+t] <= 0) return;
    
    window['st_'+t] += v; 
    upUI(); 
}

function upUI() { 
    ['soc', 'sw', 'pass', 'cross', 'tv', 'tpol'].forEach(k => {
        let el = document.getElementById('v-'+k);
        if(el) el.innerText = window['st_'+k];
    });
    
    st_p = st_soc + st_sw + st_pass + st_cross + st_tv + st_tpol;
    let autoEl = document.getElementById('auto-posts');
    if(autoEl) autoEl.innerText = st_p || 1; 
    if(st_p === 0) st_p = 1; 
    
    let qEl = document.getElementById('v-q');
    if(qEl) qEl.innerText = st_q; 
}

function addGrp() { 
    let totalMechs = st_soc + st_sw + st_pass + st_cross + st_tv + st_tpol;
    if(totalMechs === 0) return showToast("Сначала добавьте механизмы!");
    
    pool.push({ p:st_p, h:st_h, q:st_q, soc:st_soc, sw:st_sw, pass:st_pass, cross:st_cross, tv:st_tv, tpol:st_tpol, route: document.getElementById('g-routing').value, podr: st_podr }); 
    rfPool(); 
}

function popPool() { pool.pop(); rfPool(); }
function rfPool() { 
    document.getElementById('pool-disp').innerHTML = pool.map((g,i) => `<div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid var(--border);"><b>${g.p}п на ${g.h}см (x${g.q}) [${g.podr}]</b> <button onclick="pool.splice(${i},1);rfPool();" style="width:auto; margin:0; background:none; color:red; font-size:16px;">✕</button></div>`).join(""); 
}

function applyPoolToEstimate() {
    if(!pool.length) return showToast("❌ Пул пуст!");
    let mode = document.getElementById('montage-mode').value;
    let connMode = document.getElementById('conn-mode') ? document.getElementById('conn-mode').value : 'gml';
    let wall = document.getElementById('g-wall').value;
    let useKk = document.getElementById('pool-cable-channel').checked;
    let useSurf = document.getElementById('pool-surface').checked;
    let ceilH = Number(cust.ceil) || 270;

    let res = { m_sh: 0, m_sh_50: 0, stdPodr: 0, deepPodr: 0, koposPodr: 0, mechs: { soc:0, sw:0, pass:0, cross:0, tv:0, tpol:0 }, frames: {1:0,2:0,3:0,4:0,5:0,6:0} };

    let swJbs = 0; let passJbs = 0; let totalSocDrops = 0;

    pool.forEach(g => {
        let isSw = (g.sw > 0 || g.cross > 0);
        let isPass = (g.pass > 0);
        let isSoc = (g.soc > 0 || g.tv > 0);
        
        let drop = (isSw || isPass) ? (ceilH - g.h)/100 : (g.route === 'ceiling' ? (ceilH - g.h)/100 : g.h/100);

        if(g.tpol > 0) { res.m_sh_50 += (g.h/100) * g.q; if(g.route === 'ceiling') res.m_sh += (drop - g.h/100) * g.q; } else { res.m_sh += drop * g.q; }
        
        // Логика распаек
        if(mode === 'classic') {
            if(isPass) passJbs += 1 * g.q;
            else if(isSw) swJbs += 1 * g.q;
            else if(isSoc && g.tpol === 0) totalSocDrops += 1 * g.q; 
        } else {
            if(isPass) passJbs += 1 * g.q;
            else if(isSw) swJbs += 1 * g.q;
            if(isSoc && !isPass && !isSw && g.tpol===0) totalSocDrops += 1 * g.q; 
        }

        let deepCount = 0;
        let stdCount = 0;
        
        if (mode === 'gyn') {
            deepCount = g.p * g.q; 
        } else {
            deepCount = (g.sw + g.pass + g.cross + g.tpol) * g.q; 
            stdCount = Math.max(0, (g.p * g.q) - deepCount);
        }
        
        if(g.podr === 'kopos') { res.koposPodr += g.p * g.q; } 
        else if(g.podr === 'deep') { res.deepPodr += g.p * g.q; } 
        else { res.deepPodr += deepCount; res.stdPodr += stdCount; } 
        
        res.mechs.soc += g.soc * g.q; res.mechs.sw += g.sw * g.q; res.mechs.pass += g.pass * g.q; res.mechs.cross += g.cross * g.q; res.mechs.tv += g.tv * g.q; res.mechs.tpol += g.tpol * g.q;
        if(g.p >= 1 && g.p <= 6) res.frames[g.p] += g.q;
    });

    let socJbs = 0;
    if(mode === 'classic') {
        let socsPerBox = appLogic.socketsPerJb || 3;
        socJbs = Math.ceil(totalSocDrops / socsPerBox);
    } else {
        socJbs = totalSocDrops;
    }

    let totalBoxes = swJbs + passJbs + socJbs;
    
    // Считаем коннекторы
    let mConnSoc = appLogic.connPerSocJb || 3;
    let mConnSw = appLogic.connPerSwJb || 3;
    let mConnPass = appLogic.connPerPassJb || 4;
    let totalConn = (socJbs * mConnSoc) + (swJbs * mConnSw) + (passJbs * mConnPass);

    let m = [], w = [];
    let prSoc = appLogic.priceSoc || 500; let prDrill = appLogic.priceDrill || 600; let prShtr = appLogic.priceShtroba || 550;

    if(!useSurf) {
        if(res.stdPodr > 0) m.push({ n: "Подрозетник стандарт (ГКЛ/Бетон)", q: res.stdPodr, p: 20, type: 'mat' });
        if(res.deepPodr > 0) m.push({ n: "Подрозетник глубокий 68х64", q: res.deepPodr, p: 12, type: 'mat' });
        if(res.koposPodr > 0) m.push({ n: "Подрозетник Короѕ 75мм", q: res.koposPodr, p: 95, type: 'mat' });
    }
    
    if(mode === 'classic' && totalBoxes > 0) {
        m.push({ n: "Коробка распределительная 100х100х40", q: totalBoxes, p: 120, type: 'mat' });
    }
    
    if(totalConn > 0) {
        if(connMode === 'gml') {
            m.push({ n: "Гильза ГМЛ 4/6", q: totalConn, p: 15, type: 'mat' });
            m.push({ n: "Термоусадка 12/4 (м)", q: Math.ceil(totalBoxes * 0.2), p: 80, type: 'mat' });
        } else if(connMode === 'wago') {
            m.push({ n: "Клемма WAGO", q: totalConn, p: 25, type: 'mat' });
        } else {
            m.push({ n: "Изолента / ТУТ (Пайка/СИЗ)", q: Math.ceil(totalBoxes * 0.2), p: 100, type: 'mat' });
        }
    }
    
    if(res.mechs.soc > 0) m.push({ n: "Розетка 220В (механизм)", q: res.mechs.soc, p: 250, type: 'mat' });
    if((res.mechs.sw+res.mechs.pass+res.mechs.cross) > 0) m.push({ n: "Выключатель (механизм)", q: res.mechs.sw+res.mechs.pass+res.mechs.cross, p: 280, type: 'mat' });
    if(res.mechs.tv > 0) m.push({ n: "Слаботочная розетка (механизм)", q: res.mechs.tv, p: 350, type: 'mat' });
    for(let i=1; i<=6; i++) { if(res.frames[i] > 0) m.push({ n: `Рамка ${i} пост(а)`, q: res.frames[i], p: i*50, type: 'mat' }); }

    if(totalBoxes > 0) {
        if(mode === 'classic') {
            let connPrice = connMode === 'gml' ? 800 : (connMode === 'solder' ? 900 : 600);
            w.push({ n: `Сборка распред. коробки (${connMode === 'gml' ? 'ГМЛ' : (connMode === 'solder' ? 'Пайка' : 'WAGO')})`, q: totalBoxes, p: connPrice, type: 'work' });
        } else {
            let connPrice = connMode === 'gml' ? 600 : (connMode === 'solder' ? 700 : 450);
            w.push({ n: `Коммутация в подрозетнике (${connMode === 'gml' ? 'ГМЛ' : (connMode === 'solder' ? 'Пайка' : 'WAGO')})`, q: totalBoxes, p: connPrice, type: 'work' });
        }
    }
    
    if(useKk) {
        if(res.m_sh > 0) w.push({ n: `Монтаж кабель-канала`, q: Math.ceil(res.m_sh), p: 150, type: 'work' });
        if(res.m_sh_50 > 0) w.push({ n: `Монтаж кабель-канала (широкий)`, q: Math.ceil(res.m_sh_50), p: 200, type: 'work' });
    } else {
        if(res.m_sh > 0) w.push({ n: `Штроба 25х30 (${wall})`, q: Math.ceil(res.m_sh), p: prShtr, type: 'work' });
        if(res.m_sh_50 > 0) w.push({ n: `Штроба 50х50 (${wall})`, q: Math.ceil(res.m_sh_50), p: prShtr*1.8, type: 'work' });
    }

    if(useSurf) {
        let sumMechs = res.mechs.soc + res.mechs.sw + res.mechs.pass + res.mechs.cross + res.mechs.tv + res.mechs.tpol;
        if(sumMechs > 0) w.push({ n: `Установка накладного механизма`, q: sumMechs, p: prSoc, type: 'work' });
    } else {
        if(res.stdPodr > 0) w.push({ n: `Высверливание подрозетников (45мм)`, q: res.stdPodr, p: prDrill, type: 'work' });
        if(res.deepPodr > 0) w.push({ n: `Высверливание подрозетников (64мм)`, q: res.deepPodr, p: prDrill+100, type: 'work' });
        let totalPodr = res.stdPodr + res.deepPodr + res.koposPodr;
        if(totalPodr > 0) w.push({ n: `Вклейка подрозетников`, q: totalPodr, p: 100, type: 'work' });
        
        if(res.mechs.soc>0) w.push({n: `Установка розетки 220B`, q:res.mechs.soc, p:prSoc, type:'work'});
        if(res.mechs.sw>0 || res.mechs.pass>0 || res.mechs.cross>0) w.push({n: `Установка выключателя`, q:res.mechs.sw+res.mechs.pass+res.mechs.cross, p:prSoc, type:'work'});
        if(res.mechs.tv>0) w.push({n: `Установка слаботочной розетки`, q:res.mechs.tv, p:prSoc, type:'work'});
        if(res.mechs.tpol>0) w.push({n: `Установка терморегулятора`, q:res.mechs.tpol, p:prSoc+400, type:'work'});
    }

    addAuto(m.concat(w), 'rough'); pool=[]; rfPool(); closeModal('roughModal'); showToast("✅ Пул добавлен!");
}

function modV(id, val) { cfg[id] = Math.max(0, (cfg[id] || 0) + val); const el = document.getElementById('v-'+id); if(el) el.innerText = cfg[id]; }

function populateShieldExtras() {
    let sel = document.getElementById('cfg-extra-db');
    if(!sel) return;
    let html = '<option value="">-- Выбрать из базы --</option>';
    matDB.forEach(m => {
        if(m.c === 'Автоматика' || m.c === 'Щитовое') {
            html += `<option value="${m.id}">${m.n} (${m.p} ₽)</option>`;
        }
    });
    sel.innerHTML = html;
}

function addExtraToShieldConfig() {
    let sel = document.getElementById('cfg-extra-db');
    let q = Number(document.getElementById('cfg-extra-q').value) || 1;
    if(!sel.value) return showToast("Выберите аппарат!");
    let item = matDB.find(m => m.id === sel.value);
    if(item) {
        currentShieldExtras.push({...item, q: q});
        renderShieldExtras();
    }
}

function renderShieldExtras() {
    document.getElementById('shield-extras-list').innerHTML = currentShieldExtras.map((ex, i) =>
        `<div style="display:flex; justify-content:space-between; font-size:11px; border-bottom:1px dashed rgba(0,0,0,0.1); padding:4px;"><span>${ex.n} <b style="color:var(--primary);">(x${ex.q})</b></span><span style="color:red; font-size:16px; font-weight:bold; cursor:pointer;" onclick="currentShieldExtras.splice(${i},1); renderShieldExtras();">✕</span></div>`
    ).join('');
}
function epAllDbItems(type) {
    const local = type === 'work' ? (workDB || []) : (matDB || []);
    const user = type === 'work' ? (userWorkDB || []) : (userMatDB || []);
    return local.concat(user).filter(Boolean);
}

function epNormText(v) {
    return String(v || '').toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, ' ').trim();
}

function epFindDbItem(type, words) {
    const arr = epAllDbItems(type);
    const searchWords = (words || []).map(epNormText).filter(Boolean);
    if (!searchWords.length) return null;
    let best = null;
    let bestScore = -1;
    arr.forEach(item => {
        const blob = epNormText([item.c, item.g, item.sc, item.n, item.brand, item.kind, item.nominal, item.curve, item.wallType, item.modules].join(' '));
        let score = 0;
        searchWords.forEach(w => { if (blob.includes(w)) score++; });
        if (score > bestScore) { best = item; bestScore = score; }
    });
    return bestScore >= Math.max(1, Math.ceil(searchWords.length * 0.55)) ? best : null;
}


function epV15BrandRu(v) {
    const s = String(v || '').toUpperCase();
    if (s.includes('IEK') || s.includes('ИЭК')) return 'ИЭК';
    if (s.includes('ABB')) return 'ABB';
    if (s.includes('SCHNEIDER') || s.includes('ШНАЙДЕР')) return 'Schneider';
    if (s.includes('LEGRAND') || s.includes('ЛЕГРАН')) return 'Legrand';
    if (s.includes('EKF')) return 'EKF';
    if (s.includes('DEKRAFT')) return 'DEKraft';
    return String(v || '').trim() || 'ИЭК';
}
function epV15BrandCode(v) {
    const s = String(v || '').toUpperCase();
    if (s.includes('ИЭК')) return 'IEK';
    if (s.includes('IEK')) return 'IEK';
    if (s.includes('ABB')) return 'ABB';
    if (s.includes('SCHNEIDER')) return 'Schneider';
    if (s.includes('LEGRAND')) return 'Legrand';
    if (s.includes('EKF')) return 'EKF';
    return String(v || '').trim();
}
function epV15CleanForName(s) { return String(s || '').replace(/\s+/g,' ').trim(); }
function epV15DetectModel(s, kind) {
    s = String(s || '');
    const patterns = [
        /ВА\s*47\s*[-–—]?\s*29/iu,
        /ВД\s*1\s*[-–—]?\s*63/iu,
        /АВДТ\s*32/iu,
        /АД\s*12/iu,
        /Easy\s*9/iu,
        /Acti\s*9/iu,
        /SH\s*20\d/iu,
        /S\s*20\d/iu,
        /DX\s*3/iu,
        /TX\s*3/iu
    ];
    for (const p of patterns) { const m = s.match(p); if (m) return epV15CleanForName(m[0]).replace(/\s*[-–—]\s*/g,'-'); }
    const k = String(kind || '').toLowerCase();
    if (k.includes('dif') || /диф/i.test(s)) return epV15BrandCode(s).toUpperCase()==='IEK' ? 'АВДТ32' : '';
    if (k.includes('uzo') || k.includes('узо') || /узо|диф/i.test(s)) return epV15BrandCode(s).toUpperCase()==='IEK' ? 'ВД1-63' : '';
    if (/автомат|breaker|ВА47|IEK|ИЭК/i.test(s)) return epV15BrandCode(s).toUpperCase()==='IEK' ? 'ВА47-29' : '';
    return '';
}
function epV15DetectNominal(src, meta) {
    const raw = [meta && meta.nominal, meta && meta.rawLabel, src].join(' ');
    let m = String(raw || '').match(/\b([ABCDАВСД])\s*([0-9]{1,3})\b/iu);
    if (m) {
        const c = String(m[1]).toUpperCase().replace('А','A').replace('В','B').replace('С','C').replace('Д','D');
        return c + m[2];
    }
    // Не путать модель ВА47-29 с номиналом A47.
    return '';
}
function epV15DetectPoles(src, meta) {
    if (meta && meta.poles) return meta.poles;
    const s = String(src || '');
    let m = s.match(/\b(1P\+N|1P|2P|3P|4P|1Р\+N|1Р|2Р|3Р|4Р)\b/iu);
    if (m) return String(m[1]).replace(/Р/g,'P').toUpperCase();
    return '';
}
function epV15AmpFromNominal(n) { const m=String(n||'').match(/(\d{1,3})/); return m?Number(m[1]):0; }
function epV15FormatAutoName(found, label, meta) {
    meta = meta || {};
    const src = [label, found && found.n, meta.rawLabel].join(' ');
    const brand = epV15BrandRu(meta.brand || epV15BrandCode(src));
    let nominal = epV15DetectNominal(src, meta);
    if (!nominal && /A472|А472/i.test(src)) nominal = 'C40';
    let poles = epV15DetectPoles(src, meta) || '1P';
    const model = epV15DetectModel(src, 'automatic') || (epV15BrandCode(brand).toUpperCase()==='IEK' ? 'ВА47-29' : '');
    if (/вводн/i.test(src) && !nominal) return epV15CleanForName(['Вводной автомат', poles === '1P' ? '2P' : poles, brand, model].filter(Boolean).join(' '));
    return epV15CleanForName([nominal || 'Автомат', poles, brand, model].filter(Boolean).join(' '));
}
function epV15DetectLeakage(src, meta) {
    if (meta && meta.leakage) return Number(meta.leakage);
    const m = String(src || '').match(/(10|30|100|300)\s*м\s*а/iu);
    return m ? Number(m[1]) : 0;
}
function epV15FormatRcdName(found, label, meta) {
    meta = meta || {};
    const src = [label, found && found.n, meta.rawLabel].join(' ');
    const kraw = String(meta.kind || label || '').toLowerCase();
    const kind = kraw.includes('dif') || /диф/i.test(src) ? 'ДИФ' : 'УЗО';
    const brand = epV15BrandRu(meta.brand || epV15BrandCode(src));
    const poles = epV15DetectPoles(src, meta) || (kind === 'ДИФ' ? '1P+N' : '2P');
    const amp = Number(meta.amp || meta.current || 40) || 40;
    const leakage = epV15DetectLeakage(src, meta) || 30;
    const typ = meta.rcdType || (String(src).match(/тип\s*([AАBВCС]+)/iu)||[])[1] || 'A';
    const model = epV15DetectModel(src, kind) || (epV15BrandCode(brand).toUpperCase()==='IEK' ? (kind==='ДИФ'?'АВДТ32':'ВД1-63') : '');
    return epV15CleanForName([kind, poles, amp + 'A', leakage + 'мА', 'тип ' + String(typ).toUpperCase().replace('А','A').replace('В','B').replace('С','C'), brand, model].filter(Boolean).join(' '));
}
function epV15DisplayMaterialName(found, label, meta) {
    meta = meta || {};
    const k = String(meta.kind || '').toLowerCase();
    const src = [label, found && found.n].join(' ');
    if (k.includes('automatic') || k.includes('breaker') || /\bавтомат\b|A472|А472/i.test(src)) return epV15FormatAutoName(found, label, meta);
    if (k.includes('узо') || k.includes('uzo') || k.includes('dif') || /узо|диф/i.test(src)) return epV15FormatRcdName(found, label, meta);
    if (found && found.n) return epV15CleanForName(found.n);
    return epV15CleanForName(label || 'Позиция');
}
function epV15MergeAssignments(dst, src) {
    const vals = [];
    [src && src.epAssignment, src && src.dbMeta && src.dbMeta.assignment].forEach(v => { if(v) vals.push(v); });
    if (Array.isArray(src && src.epAssignments)) vals.push(...src.epAssignments);
    if (Array.isArray(src && src.epMergedDetails)) vals.push(...src.epMergedDetails);
    if (!dst.epAssignments) dst.epAssignments = [];
    if (!dst.epMergedDetails) dst.epMergedDetails = [];
    vals.map(v => String(v || '').trim()).filter(Boolean).forEach(v => {
        if (v && !/^(позиция щита|назначение не указано)$/i.test(v) && !dst.epAssignments.includes(v)) dst.epAssignments.push(v);
        if (v && !/^(позиция щита|назначение не указано)$/i.test(v) && !dst.epMergedDetails.includes(v)) dst.epMergedDetails.push(v);
    });
}

function epMat(label, q, fallbackPrice, words, meta) {
    const m = meta || {};
    const found = epFindDbItem('mat', words || [label]);
    const name = epV15DisplayMaterialName(found, label, Object.assign({}, m, { rawLabel: label, brand: m.brand || epGetVal('cfg-brand-auto', 'IEK') }));
    const out = {
        n: found ? name : `⚠️ ${name} [${m.category || 'Материалы'}${m.subcategory ? ' → ' + m.subcategory : ''}] — добавить в БД`,
        q: q,
        p: found ? (Number(found.p) || Number(fallbackPrice) || 0) : (Number(fallbackPrice) || 0),
        u: (found && found.u) || m.unit || 'шт',
        type: 'mat',
        sourceId: found && found.id ? found.id : null,
        needDb: !found,
        dbMeta: Object.assign({}, m, { rawLabel: label, brand: m.brand || epGetVal('cfg-brand-auto', 'IEK'), foundName: found && found.n ? found.n : '' }),
        epRawLabel: label
    };
    if (m.assignment) { out.epAssignment = m.assignment; out.epAssignments = [m.assignment]; out.epMergedDetails = [m.assignment]; }
    return out;
}

function epWork(label, q, price, words, meta) {
    const m = meta || {};
    const found = epFindDbItem('work', words || [label]);
    let name = label;
    if (found && found.n) {
        const bad = (/установка\s+бп\s+в\s+щит/i.test(found.n) && /установка\s+щит/i.test(label)) ||
                    (/^\s*(бетон|кирпич|панелька|мягкий)/i.test(found.n) && /штроб|ниша/i.test(label));
        name = bad ? label : found.n;
    }
    if (/штроб/i.test(label) && /100\s*[×xх]\s*50/i.test(label)) name = label.replace(/ВВОДНАЯ\s*/i, '').replace(/\s+/g,' ').trim();
    const out = {
        n: name,
        q: q,
        p: found ? (Number(found.p) || Number(price) || 0) : (Number(price) || 0),
        u: (found && found.u) || m.unit || 'шт',
        type: 'work',
        sourceId: found && found.id ? found.id : null,
        logicPrice: !found,
        dbMeta: Object.assign({}, m, { rawLabel: label, foundName: found && found.n ? found.n : '' }),
        epRawLabel: label
    };
    if (m.category) out.c = m.category;
    if (m.subcategory) { out.g = m.subcategory; out.sc = m.subcategory; out.subcategory = m.subcategory; }
    if (m.assignment) { out.epAssignment = m.assignment; out.epAssignments = [m.assignment]; out.epMergedDetails = [m.assignment]; }
    return out;
}

function epGetCheck(id) { const el = document.getElementById(id); return !!(el && el.checked); }
function epGetVal(id, def) { const el = document.getElementById(id); return el ? el.value : def; }
function epAutoPrice(brand) { return brand === 'ABB' ? 350 : 155; }
function epDifPrice(brand) { return brand === 'ABB' ? 4500 : 3600; }

function generateCascadePanel() {
    const bBox = epGetVal('cfg-brand-box', 'Tekfor');
    const bAuto = epGetVal('cfg-brand-auto', 'IEK');
    const sWall = epGetVal('cfg-shield-wall', 'Бетон');
    const ph = parseInt(epGetVal('cfg-phase', '1')) || 1;
    const curve = epGetVal('cfg-auto-curve', 'C');
    const rcdType = epGetVal('cfg-rcd-type', 'A');
    const protectionType = epGetVal('cfg-protection-type', 'uzo_auto');
    const isMaster = epGetCheck('cfg-master');
    const heavySeparate = epGetCheck('cfg-heavy-separate');

    let m = [], w = [], lines = [], protectionDevices = [], warnings = [];
    function addLine(name, nominal, group, opts) {
        const o = opts || {};
        lines.push({ name, nominal, group, curve: o.curve || curve, nonSwitchable: !!o.nonSwitchable, wet: group === 'wet' || !!o.wet });
    }
    function addRoom(label, count, wetPower) {
        for (let i = 1; i <= count; i++) {
            const n = count > 1 ? `${label} ${i}` : label;
            addLine(`${n} розетки`, 'C16', wetPower ? 'wet' : 'power', { wet: wetPower });
            addLine(`${n} свет`, 'C10', 'light');
        }
    }
    addRoom('Кухня', cfg.kits || 0, false);
    addRoom('Ванная', cfg.baths || 0, true);
    addRoom('Туалет', cfg.toilets || 0, true);
    addRoom('Комната', cfg.rms || 0, false);
    addRoom('Балкон', cfg.bals || 0, false);
    if (epGetCheck('c-apron')) addLine('Фартук кухни', 'C16', 'power');
    if (epGetCheck('c-dish')) addLine('Посудомойка', 'C10', 'power');
    if (epGetCheck('c-washer')) addLine('Стиралка/сушилка', 'C10', 'wet', { wet: true });
    if (epGetCheck('c-towel')) addLine('Полотенцесушитель', 'C10', 'wet', { wet: true });
    for (let i = 1; i <= (cfg.acs || 0); i++) addLine(`Кондиционер ${i}`, 'C10', 'climate');
    for (let i = 1; i <= (cfg.fls || 0); i++) addLine(`Тёплый пол ${i}`, 'C10', 'climate');
    if (epGetCheck('c-fridge')) addLine('Холодильник, неотключаемая группа', 'C10', 'alwaysOn', { nonSwitchable: true });
    if (epGetCheck('c-neptun')) addLine('Нептун, неотключаемая группа', 'C10', 'alwaysOn', { nonSwitchable: true });
    if (epGetCheck('c-router')) addLine('Роутер, неотключаемая группа', 'C6', 'alwaysOn', { nonSwitchable: true });
    const hobPower = epGetVal('c-hob-power', 'none');
    if (hobPower === '6') addLine('Плита до 6 кВт', 'C25', heavySeparate ? 'heavy' : 'power');
    if (hobPower === '10') addLine('Плита до 10 кВт', 'C32', heavySeparate ? 'heavy' : 'power');
    const boilerPower = epGetVal('c-boiler-power', 'none');
    if (boilerPower === '6') addLine('Бойлер до 6 кВт', 'C25', 'wet', { wet: true });
    if (boilerPower === '10') addLine('Бойлер до 10 кВт', 'C32', 'wet', { wet: true });

    const groupNames = { power: 'Силовые линии', climate: 'Климат', wet: 'Влажные зоны', light: 'Освещение', heavy: 'Большая техника', alwaysOn: 'Неотключаемые группы' };
    const presentGroups = Array.from(new Set(lines.map(l => l.group))).filter(Boolean);
    function groupAssignment(group, leakage) {
        const ls = lines.filter(l => l.group === group).map(l => l.name);
        const head = group === 'wet' ? 'Влажные зоны / защита 10 мА' : (groupNames[group] || group);
        return ls.length ? `${head}: ${ls.join(', ')}` : head;
    }
    function addProtection(group, mode) {
        const leakage = group === 'wet' ? 10 : 30;
        const kind = mode || (protectionType === 'dif_auto' ? 'ДИФ' : 'УЗО');
        protectionDevices.push({ group, kind, leakage, rcdType, modules: 2, assignment: groupAssignment(group, leakage) });
        if (group === 'wet' && leakage !== 10) warnings.push('Влажные зоны должны быть 10 мА');
    }
    if (protectionType === 'main_dif_auto') protectionDevices.push({ group: 'main', kind: 'Главный ДИФ', leakage: 30, rcdType, modules: 2, assignment: 'Вводная групповая защита всего щита' });
    else if (protectionType === 'mixed') presentGroups.forEach(g => addProtection(g, g === 'wet' ? 'ДИФ' : 'УЗО'));
    else presentGroups.forEach(g => addProtection(g, protectionType === 'dif_auto' ? 'ДИФ' : 'УЗО'));

    function mat(label, q, price, words, meta, assignment) {
        meta = Object.assign({}, meta || {}, { brand: bAuto });
        if (assignment) meta.assignment = assignment;
        const it = epMat(label, q, price, words, meta);
        if (assignment) { it.epAssignment = assignment; it.epAssignments = [assignment]; it.epMergedDetails = [assignment]; }
        return it;
    }
    function work(label, q, price, words, meta, assignment) {
        meta = Object.assign({}, meta || {});
        if (assignment) meta.assignment = assignment;
        const it = epWork(label, q, price, words, meta);
        if (assignment) { it.epAssignment = assignment; it.epAssignments = [assignment]; it.epMergedDetails = [assignment]; }
        return it;
    }

    m.push(mat(`Вводной автомат ${ph}ф ${bAuto}`, 1, bAuto === 'ABB' ? 3500 : 1800, ['автомат', 'вводной', bAuto, ph + 'ф'], { category: 'Автоматика', subcategory: 'Автоматы', kind: 'input_breaker', unit: 'шт', poles: ph === 3 ? '4P' : '2P' }, 'Вводной аппарат щита'));
    protectionDevices.forEach(pd => {
        const label = pd.kind === 'Главный ДИФ' ? `Главный ДИФ ${bAuto} ${pd.leakage}мА тип ${pd.rcdType}` : `${pd.kind} ${groupNames[pd.group] || pd.group} ${pd.leakage}мА тип ${pd.rcdType} ${bAuto}`;
        m.push(mat(label, 1, epDifPrice(bAuto), [pd.kind, bAuto, pd.leakage + 'мА', pd.rcdType, groupNames[pd.group] || pd.group], { category: 'Автоматика', subcategory: pd.kind === 'ДИФ' || pd.kind === 'Главный ДИФ' ? 'ДИФы' : 'УЗО', kind: pd.kind === 'ДИФ' || pd.kind === 'Главный ДИФ' ? 'dif' : 'uzo', leakage: pd.leakage, rcdType: pd.rcdType, amp: 40, poles: pd.kind === 'ДИФ' ? '1P+N' : '2P', modules: 2 }, pd.assignment));
    });
    lines.forEach(line => {
        const label = `Автомат ${line.nominal} тип ${line.curve} ${bAuto} — ${line.name}`;
        m.push(mat(label, 1, epAutoPrice(bAuto), ['автомат', bAuto, line.nominal, line.curve], { category: 'Автоматика', subcategory: 'Автоматы', kind: 'automatic', nominal: line.nominal, curve: line.curve, modules: 1, poles: '1P' }, line.name));
    });
    if (epGetCheck('cfg-uzm')) {
        const q = ph === 3 ? 3 : 1;
        m.push(mat(`Реле напряжения ${bAuto}`, q, 4500, ['реле напряжения', 'узм', bAuto], { category: 'Автоматика', subcategory: 'УЗМ / реле напряжения', kind: 'voltage_relay', modules: ph === 3 ? 6 : 2 }, 'Защита от перенапряжения'));
    }
    if (isMaster) {
        const lightLines = lines.filter(l => l.group === 'light').map(l => l.name).join(', ') || 'световые группы';
        m.push(mat(`Контактор C40 ${bAuto} — мастер-кнопка света`, 1, 2200, ['контактор', 'C40', bAuto], { category: 'Автоматика', subcategory: 'Контакторы', kind: 'contactor', modules: 2 }, 'Мастер-кнопка только на свет: ' + lightLines));
        m.push(mat(`Автомат C40 тип ${curve} ${bAuto} — байпас мастер-кнопки`, 1, bAuto === 'ABB' ? 600 : 380, ['автомат', 'C40', bAuto, curve], { category: 'Автоматика', subcategory: 'Автоматы', kind: 'automatic', nominal: 'C40', curve: curve, modules: 1, poles: '1P' }, 'Байпас мастер-кнопки света'));
    }
    currentShieldExtras.forEach(ex => m.push({ n: ex.n, q: ex.q, p: ex.p, u: ex.u || 'шт', type: 'mat', epAssignment: 'Дополнительный аппарат защиты', epAssignments: ['Дополнительный аппарат защиты'], epMergedDetails: ['Дополнительный аппарат защиты'] }));

    const onePoleCount = lines.length + (isMaster ? 1 : 0);
    const twoPoleProtectionCount = protectionDevices.length;
    const relayModules = epGetCheck('cfg-uzm') ? (ph === 3 ? 6 : 2) : 0;
    const masterModules = isMaster ? 3 : 0;
    const extraModules = currentShieldExtras.reduce((s, ex) => s + (Number(ex.modules || 1) * Number(ex.q || 1)), 0);
    const totalModules = Math.ceil(onePoleCount + twoPoleProtectionCount * 2 + relayModules + masterModules + extraModules + (ph === 3 ? 3 : 2));
    const boxSize = [6,12,24,36,48,60,72].find(s => s >= totalModules) || 72;
    if (totalModules > 72) warnings.push('Нужно больше 72 модулей — требуется второй щит или пересборка схемы');

    m.unshift(mat(`Щит ${sWall === 'Накладной' ? 'накладной' : 'встраиваемый'} ${bBox} ${boxSize}М`, 1, bBox === 'ABB' ? 6510 : 2660, ['щит', bBox, String(boxSize), sWall === 'Накладной' ? 'накладной' : 'встраиваемый'], { brand: bBox, category: 'Щитовое', subcategory: 'Корпуса', kind: 'shield_box', modules: boxSize, mountType: sWall === 'Накладной' ? 'surface' : 'built_in' }, 'Корпус щита'));
    const comb1P = Math.ceil(onePoleCount / 12), comb2P = Math.ceil(twoPoleProtectionCount / 6), rows = Math.ceil(boxSize / 12);
    const pugvSize = Number(appLogic.shieldPugvSize || 6), pugvMeters = Math.max(4, Math.ceil(totalModules * 0.4)), nshviPacks = Math.max(1, Math.ceil(boxSize / 48));
    if (comb1P > 0) m.push(mat('Гребёнка 1P 25см', comb1P, 250, ['гребенка', '1P', '25'], { category: 'Щитовое', subcategory: 'Гребёнки', kind: 'comb_bus_1p' }, 'Питание однополюсных автоматов'));
    if (comb2P > 0) m.push(mat('Гребёнка 2P 25см', comb2P, 450, ['гребенка', '2P', '25'], { category: 'Щитовое', subcategory: 'Гребёнки', kind: 'comb_bus_2p' }, 'Питание УЗО/ДИФ'));
    if (twoPoleProtectionCount > 0) m.push(mat('Нулевая шинка N на группу УЗО/ДИФ', twoPoleProtectionCount, 285, ['шина', 'N', 'ноль', 'DIN'], { category: 'Щитовое', subcategory: 'Шины N/PE', kind: 'neutral_bus' }, 'N-шинки по группам защиты'));
    m.push(mat(`PE-шина на ${appLogic.shieldPeBusContacts || 26} контактов`, 1, 770, ['PE', 'шина', '26'], { category: 'Щитовое', subcategory: 'Шины N/PE', kind: 'pe_bus' }, 'Защитное заземление PE'));
    m.push(mat('DIN-рейка / комплект DIN для щита', rows, 180, ['DIN', 'рейка'], { category: 'Щитовое', subcategory: 'DIN', kind: 'din_rail' }, 'Крепление аппаратов на DIN-рейке'));
    m.push(mat('Ограничитель на DIN-рейку', rows * 2, 35, ['ограничитель', 'DIN'], { category: 'Щитовое', subcategory: 'DIN', kind: 'din_stopper' }, 'Фиксация аппаратов на DIN-рейке'));
    m.push(mat(`Провод ПуГВ 1×${pugvSize}`, pugvMeters, 85, ['ПуГВ', '1x' + pugvSize, '1×' + pugvSize], { category: 'Щитовое', subcategory: 'Провода', kind: 'pugv', unit: 'м.п.' }, 'Внутренняя разводка щита'));
    m.push(mat(`НШВИ 1×${pugvSize}, упак. 100 шт`, nshviPacks, 225, ['НШВИ', '1x' + pugvSize, '1×' + pugvSize], { category: 'Щитовое', subcategory: 'Наконечники', kind: 'lug_pack' }, 'Опрессовка проводов щита'));
    m.push(mat('Маркировка линий / бирки', lines.length, 15, ['маркировка', 'бирки'], { category: 'Щитовое', subcategory: 'Маркировка', kind: 'marking_tag' }, 'Маркировка линий'));
    if (epGetCheck('cfg-cable-glands')) m.push(mat('Кабельные вводы / сальники', 1, 250, ['кабельный ввод', 'сальник'], { category: 'Щитовое', subcategory: 'Кабельные вводы', kind: 'cable_gland' }, 'Ввод кабелей в щит'));

    if (sWall !== 'Накладной') w.push(work(`Ниша щита ${boxSize}М (${sWall})`, boxSize, appLogic.shieldNichePerModule || 400, ['ниша', 'щит', sWall, String(boxSize)], { unit: 'мод.', category: 'Штробление и резка', subcategory: 'Ниши щита' }, 'Ниша под корпус щита'));
    if (sWall !== 'Накладной') w.push(work(`Штроба 100×50, под трассу кабелей (${sWall})`, 2, appLogic.shieldInputGroovePrice || 1500, ['штроба', '100x50', sWall, 'трасса', 'кабелей'], { unit: 'м.п.', category: 'Штробление и резка', subcategory: 'Штроба 100×50 под трассу кабелей' }, 'Штроба под ввод/трассу кабелей'));
    w.push(work('Сборка щита', totalModules, appLogic.priceShield || 500, ['сборка', 'щит'], { unit: 'мод.', category: 'Щитовое', subcategory: 'Сборка щита' }, 'Сборка модульного щита'));
    w.push(work('Установка щита', 1, appLogic.shieldInstallPrice || 2500, ['установка', 'щит'], { unit: 'шт', category: 'Щитовое', subcategory: 'Монтаж щита' }, 'Монтаж корпуса щита'));
    w.push(work('Подключение вводного кабеля', 1, appLogic.shieldInputConnectPrice || 1500, ['подключение', 'вводного', 'кабеля'], { unit: 'шт', category: 'Щитовое', subcategory: 'Монтаж щита' }, 'Подключение ввода'));
    w.push(work('Прозвонка / проверка линий', lines.length, appLogic.shieldTestLinePrice || 150, ['прозвонка', 'проверка', 'линий'], { unit: 'линия', category: 'Щитовое', subcategory: 'Проверка линий' }, 'Проверка каждой линии'));
    w.push(work('Маркировка линий', lines.length, appLogic.shieldMarkLinePrice || 100, ['маркировка', 'линий'], { unit: 'линия', category: 'Щитовое', subcategory: 'Маркировка линий' }, 'Маркировка каждой линии'));
    if (epGetCheck('cfg-scheme')) w.push(work('Составление однолинейной схемы щита', 1, appLogic.shieldSchemePrice || 4000, ['однолинейная', 'схема', 'щит'], { unit: 'шт', category: 'Щитовое', subcategory: 'Документация' }, 'Однолинейная схема'));
    const info = [
        { n: `ℹ️ Щит: занято ${totalModules} мод.; корпус ${boxSize}М; свободно ${Math.max(0, boxSize - totalModules)} мод.`, q: 1, p: 0, type: 'work', tag: 'shield_info' },
        { n: `ℹ️ Защита: ${protectionType}; автоматы тип ${curve}; УЗО/ДИФ тип ${rcdType}; влажные зоны 10мА`, q: 1, p: 0, type: 'work', tag: 'shield_info' },
        { n: `ℹ️ Гребёнки: 1P ${comb1P}×25см; 2P ${comb2P}×25см; N-шинок ${twoPoleProtectionCount}; PE-шина ${appLogic.shieldPeBusContacts || 26} контактов`, q: 1, p: 0, type: 'work', tag: 'shield_info' }
    ];
    warnings.forEach(x => info.push({ n: `⚠️ ${x}`, q: 1, p: 0, type: 'work', tag: 'shield_info' }));
    addAuto(m.concat(w).concat(info), 'shield');
    currentShieldExtras = [];
    closeModal('configModal');
    showToast('✅ Щит сгенерирован V15');
}


async function runAiCheck() { 
    if(!GEMINI_API_KEY) return showToast("❌ Нужен ключ ИИ в настройках");
    showLoader("ИИ анализирует...", "🤖");
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const estNames = currentEstimate.map(i => i.n).join(", ");
        const promptText = `Я электрик. Смета: ${estNames}. Найди логические ошибки (забыл крепеж, рамки, УЗО). Верни ТОЛЬКО JSON массив: [{"reason": "Объяснение", "suggestedName": "Название из стандартных материалов"}]. Если всё идеально, верни пустой массив [].`;
        const payload = { contents: [{ parts: [{text: promptText }] }] };
        const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await response.json(); hideLoader();
        if(data.error) throw new Error(data.error.message);
        let aiText = data.candidates[0].content.parts[0].text.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();
        const suggestions = JSON.parse(aiText);
        if (suggestions.length === 0) return showToast("✨ Всё идеально! Смета полная.");
        document.getElementById('ai-modal-title').innerText = "✨ ИИ-Аналитика";
        document.getElementById('ai-suggestions').innerHTML = suggestions.map(s => `<div style="background:var(--bg); padding: 12px; border-radius: 10px; margin-bottom:10px; border-left:4px solid var(--ai);"><div style="font-size: 12px; font-weight:bold; margin-bottom:8px;">${s.reason}</div><div style="display:flex; justify-content:space-between; align-items:center;"><span style="font-size:13px; color:var(--primary); font-weight:bold;">${s.suggestedName}</span><button onclick="addAuto([{n:'${s.suggestedName}', q:1, p:0, type:'mat'}], 'ai_add'); closeModal('aiModal');" style="background:var(--ai); padding:6px 12px; font-size:11px; color:white; border:none; border-radius:6px; width:auto; margin:0;">+ Добавить</button></div></div>`).join("");
        openModal('aiModal');
    } catch(e) { hideLoader(); showToast("❌ Сбой ИИ: Проверьте ключ"); }
}

async function aiSupply() {
    if(!GEMINI_API_KEY) return showToast("❌ Нужен ключ ИИ");
    showLoader("ИИ формирует закупку...", "🤖");
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const mats = currentEstimate.filter(i=>i.type==='mat').map(i=>`${i.n} - ${i.q}`).join(", ");
        const promptText = `Смета материалов: ${mats}. Раздели их на логичные категории для удобной закупки в магазине (Кабели, Автоматика, Черновые и т.д.). Выведи в чистом HTML формате (используй <h3>, <ul>, <li>, <b>).`;
        const payload = { contents: [{ parts: [{text: promptText }] }] };
        const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await response.json(); hideLoader();
        let aiText = data.candidates[0].content.parts[0].text.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();
        document.getElementById('ai-modal-title').innerText = "📦 ИИ-Снабженец";
        document.getElementById('ai-suggestions').innerHTML = `<div style="font-size:13px; line-height:1.5;">${aiText}</div>`;
        openModal('aiModal');
    } catch(e) { hideLoader(); showToast("❌ Сбой ИИ"); }
}

async function aiPueHelper() { 
    if(!GEMINI_API_KEY) return showToast("❌ Нужен ключ ИИ");
    showLoader("ИИ думает...", "🤖");
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const promptText = `Смета: ${currentEstimate.map(i=>i.n).join(", ")}. Какие нормы ПУЭ нужны? Напиши кратко в HTML (без markdown, используй теги <p>, <ul>, <b>).`;
        const payload = { contents: [{ parts: [{text: promptText }] }] };
        const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await response.json(); hideLoader();
        let aiText = data.candidates[0].content.parts[0].text.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();
        document.getElementById('ai-modal-title').innerText = "📚 ПУЭ Справка";
        document.getElementById('ai-suggestions').innerHTML = `<div style="font-size:13px; line-height:1.5;">${aiText}</div>`;
        openModal('aiModal');
    } catch(e) { hideLoader(); showToast("❌ Сбой ИИ"); }
}

async function compareShopsAI() {
    if(!GEMINI_API_KEY) return showToast("❌ Нужен ключ ИИ");
    showLoader("Сравнение цен...", "🤖");
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        let shops = document.getElementById('ai-shops').value || "Лемана ПРО, Петрович";
        const promptText = `Материалы: ${currentEstimate.filter(i=>i.type==='mat').map(i=>i.n).join(", ")}. Создай HTML таблицу (class="pdf-table") с МАКСИМАЛЬНЫМИ (самыми высокими) розничными ценами ГОСТ в магазинах: ${shops}. Верни только HTML.`;
        const payload = { contents: [{ parts: [{text: promptText }] }] };
        const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await response.json(); hideLoader();
        let aiText = data.candidates[0].content.parts[0].text.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();
        document.getElementById('ai-modal-title').innerText = "🛒 Макс. Цены ГОСТ";
        document.getElementById('ai-suggestions').innerHTML = `<div style="overflow-x:auto;">${aiText}</div>`;
        openModal('aiModal');
    } catch(e) { hideLoader(); showToast("❌ Сбой ИИ"); }
}

function getPDFHeader(title) { 
    return `<div class="pdf-header"><h1>${title}</h1><p>Заказчик: <b>${cust.name}</b> | Объект: ${cust.addr}</p></div>`; 
}

function categorizeEstimateItem(it) {
    if (it.type === 'mat') return 1;
    let n = it.n.toLowerCase();
    if (n.includes('штроб') || n.includes('высверл') || n.includes('алмаз') || n.includes('резк') || n.includes('отверст') || n.includes('ниши')) return 2;
    if (n.includes('установк') || n.includes('розетк') || n.includes('выключат') || n.includes('рамк') || n.includes('свет') || n.includes('люстр')) {
        if (!n.includes('подрозетн') && !n.includes('щит')) return 4;
    }
    return 3; 
}

function showPreview(mode, isActOverride = false, customTitle = null) { 
    currentPreviewMode = mode;
    let title = customTitle || (mode==='vendor' ? 'СПИСОК ПОСТАВЩИКУ' : (mode==='details' ? 'ДЕТАЛИЗАЦИЯ ЩИТА' : 'СМЕТА ОБЪЕКТA'));
    let html = getPDFHeader(title); 
    
    if (mode === 'client' || isActOverride) {
        document.getElementById('pdf-filters').style.display = 'block';
        
        let c1 = document.getElementById('pdf-cb-1').checked;
        let c2 = document.getElementById('pdf-cb-2').checked;
        let c3 = document.getElementById('pdf-cb-3').checked;
        let c4 = document.getElementById('pdf-cb-4').checked;

        let totalSum = 0;
        
        if (c1) {
            let items = currentEstimate.filter(i => categorizeEstimateItem(i) === 1);
            if(items.length > 0) {
                let grpSum = 0;
                html += '<h3 style="color:#10B981; font-size:14px; margin-bottom:10px;">1. МАТЕРИАЛЫ</h3><table class="pdf-table"><tr><th>Наименование</th><th style="text-align:center;">Кол-во</th><th style="text-align:right;">Сумма</th></tr>';
                items.forEach(it => { let s = fPrice(it)*it.q; grpSum += s; totalSum += s; html += `<tr><td>${it.n}</td><td style="text-align:center;">${it.q}</td><td style="text-align:right;">${s} Р</td></tr>`; });
                html += `<tr><td colspan="3" style="text-align:right; font-weight:bold; color:#10B981;">Итого материалы: ${grpSum} Р</td></tr></table>`;
            }
        }
        if (c2) {
            let items = currentEstimate.filter(i => categorizeEstimateItem(i) === 2);
            if(items.length > 0) {
                let grpSum = 0;
                html += '<h3 style="color:#F59E0B; font-size:14px; margin-bottom:10px; margin-top:20px;">2. ШТРОБЛЕНИЕ И РЕЗКА</h3><table class="pdf-table"><tr><th>Наименование</th><th style="text-align:center;">Кол-во</th><th style="text-align:right;">Сумма</th></tr>';
                items.forEach(it => { let s = fPrice(it)*it.q; grpSum += s; totalSum += s; html += `<tr><td>${it.n}</td><td style="text-align:center;">${it.q}</td><td style="text-align:right;">${s} Р</td></tr>`; });
                html += `<tr><td colspan="3" style="text-align:right; font-weight:bold; color:#F59E0B;">Итого штробление: ${grpSum} Р</td></tr></table>`;
            }
        }
        if (c3) {
            let items = currentEstimate.filter(i => categorizeEstimateItem(i) === 3);
            if(items.length > 0) {
                let grpSum = 0;
                html += '<h3 style="color:#64748B; font-size:14px; margin-bottom:10px; margin-top:20px;">3. ЧЕРНОВАЯ ЭЛЕКТРИКА</h3><table class="pdf-table"><tr><th>Наименование</th><th style="text-align:center;">Кол-во</th><th style="text-align:right;">Сумма</th></tr>';
                items.forEach(it => { let s = fPrice(it)*it.q; grpSum += s; totalSum += s; html += `<tr><td>${it.n}</td><td style="text-align:center;">${it.q}</td><td style="text-align:right;">${s} Р</td></tr>`; });
                html += `<tr><td colspan="3" style="text-align:right; font-weight:bold; color:#64748B;">Итого черновая: ${grpSum} Р</td></tr></table>`;
            }
        }
        if (c4) {
            let items = currentEstimate.filter(i => categorizeEstimateItem(i) === 4);
            if(items.length > 0) {
                let grpSum = 0;
                html += '<h3 style="color:#3B82F6; font-size:14px; margin-bottom:10px; margin-top:20px;">4. ЧИСТОВАЯ ЭЛЕКТРИКА</h3><table class="pdf-table"><tr><th>Наименование</th><th style="text-align:center;">Кол-во</th><th style="text-align:right;">Сумма</th></tr>';
                items.forEach(it => { let s = fPrice(it)*it.q; grpSum += s; totalSum += s; html += `<tr><td>${it.n}</td><td style="text-align:center;">${it.q}</td><td style="text-align:right;">${s} Р</td></tr>`; });
                html += `<tr><td colspan="3" style="text-align:right; font-weight:bold; color:#3B82F6;">Итого чистовая: ${grpSum} Р</td></tr></table>`;
            }
        }
        
        let extras = currentEstimate.filter(i => i.tag === 'extra');
        if(extras.length > 0) {
            let grpSum = 0;
            html += '<h3 style="color:#EF4444; font-size:14px; margin-bottom:10px; margin-top:20px;">ДОПОЛНИТЕЛЬНЫЕ РАБОТЫ</h3><table class="pdf-table"><tr><th>Наименование</th><th style="text-align:center;">Кол-во</th><th style="text-align:right;">Сумма</th></tr>';
            extras.forEach(it => { let s = fPrice(it)*it.q; grpSum += s; totalSum += s; html += `<tr><td>${it.n}</td><td style="text-align:center;">${it.q}</td><td style="text-align:right;">${s} Р</td></tr>`; });
            html += `<tr><td colspan="3" style="text-align:right; font-weight:bold; color:#EF4444;">Итого доп. работы: ${grpSum} Р</td></tr></table>`;
        }

        html += `<h2 style="text-align:right; margin-top:20px; color:var(--text); font-size:18px;">ИТОГО (ВЫБРАННОЕ): ${totalSum} Р</h2>`;

    } else {
        document.getElementById('pdf-filters').style.display = 'none';
        if(mode === 'details') {
            if (typeof epV15NormalizeCurrentEstimate === 'function') epV15NormalizeCurrentEstimate();
            let shieldItems = currentEstimate.filter(it => typeof epV15IsShieldDevice === 'function' ? epV15IsShieldDevice(it) : (it.n.includes('Автомат') || it.n.includes('ДИФ') || it.n.includes('УЗО') || it.n.includes('Реле')));
            html += '<table class="pdf-table"><tr><th>Что отвечает / линия</th><th>Аппарат</th><th>Назначение</th></tr>';
            if (!shieldItems.length) {
                html += '<tr><td colspan="3" style="text-align:center;color:var(--gray);font-weight:bold;">Щит ещё не сгенерирован</td></tr>';
            } else {
                shieldItems.forEach(it => {
                    let lines = typeof epV15GetAssignments === 'function' ? epV15GetAssignments(it) : [];
                    if (!lines.length) lines = ['назначение не указано — пересобери щит'];
                    let purpose = typeof epV15Purpose === 'function' ? epV15Purpose(it) : 'аппарат щита';
                    html += `<tr><td style="font-weight:bold; color:var(--primary);">${lines.map(x => String(x||'')).join('<br>')}</td><td>${it.n}${Number(it.q)>1 ? ' × '+Number(it.q) : ''}</td><td>${purpose}</td></tr>`;
                });
            }
            html += '</table>';
        } 
        else if(mode === 'vendor') {
            let matsFinishWords = ['розетк', 'выключател', 'рамк', 'светильник', 'терморег', 'механизм', 'люстр', 'бра', 'диммер'];
            let matsOnly = currentEstimate.filter(it => it.type === 'mat');
            let matsFinish = matsOnly.filter(it => matsFinishWords.some(w => it.n.toLowerCase().includes(w)));
            let matsRough = matsOnly.filter(it => !matsFinishWords.some(w => it.n.toLowerCase().includes(w)));
            html += '<h3 style="color:var(--primary); font-size:14px; margin-bottom:10px;">ЧЕРНОВЫЕ МАТЕРИАЛЫ</h3><table class="pdf-table"><tr><th>Наименование материала</th><th style="text-align:center;">Кол-во</th></tr>';
            matsRough.forEach(it => html += `<tr><td>${it.n}</td><td style="text-align:center; font-weight:bold;">${it.q}</td></tr>`); html += '</table>';
            if (matsFinish.length > 0) {
                html += '<h3 style="color:var(--success); font-size:14px; margin-bottom:10px; margin-top:20px;">ЧИСТОВАЯ ЭЛЕКТРИКА</h3><table class="pdf-table"><tr><th>Наименование</th><th style="text-align:center;">Кол-во</th></tr>';
                matsFinish.forEach(it => html += `<tr><td>${it.n}</td><td style="text-align:center; font-weight:bold;">${it.q}</td></tr>`); html += '</table>';
            }
        }
    }
    
    let tgLink = document.getElementById('qr-tg').value; 
    let waLink = document.getElementById('qr-wa').value;
    let vkLink = document.getElementById('qr-vk').value;
    
    if(mode === 'client' && (tgLink || waLink || vkLink)) {
        html += `<div class="pdf-footer" style="display:flex; justify-content:space-between; align-items:flex-end; border-top:2px solid #e2e8f0; padding-top:15px; margin-top:20px;"><div><p style="margin:0; font-weight:bold; color:var(--primary);">ИСПОЛНИТЕЛЬ:</p><p style="margin:5px 0;">ФИО: ${appUser?.name}</p></div><div class="qr-codes" style="display:flex; gap:15px;">`;
        if(waLink) html += `<div class="qr-box" style="text-align:center;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(waLink)}"><br>WhatsApp</div>`;
        if(tgLink) html += `<div class="qr-box" style="text-align:center;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(tgLink)}"><br>Telegram</div>`;
        if(vkLink) html += `<div class="qr-box" style="text-align:center;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(vkLink)}"><br>Сайт / VK</div>`;
        html += `</div></div>`;
    }
    
    document.getElementById('p-cont').innerHTML = html; 
    openModal('previewModal'); 
}

function refreshPreview() { showPreview(currentPreviewMode); }

function printAct() {
    if(!currentCardId) return;
    let obj = hDB.find(x => x.id === currentCardId);
    if(!obj) return;
    
    let tempEstimate = currentEstimate;
    let tempCust = cust;
    
    currentEstimate = obj.estimate || [];
    cust = { name: obj.name, addr: obj.addr, phone: obj.phone };
    
    showPreview('client', true, 'АКТ ВЫПОЛНЕННЫХ РАБОТ');
    
    currentEstimate = tempEstimate;
    cust = tempCust;
}

async function deleteAct() {
    if(!currentCardId) return;
    let conf = await window.customConfirm("Удаление", "Удалить этот акт навсегда?");
    if(conf) {
        hDB = hDB.filter(x => x.id !== currentCardId);
        safeSet('h_v31', JSON.stringify(hDB));
        updateHistList();
        renderChart();
        closeModal('objCardModal');
        showToast("Акт удален");
        if(db) {
            try { await db.collection('history').doc(String(currentCardId)).delete(); } catch(e){}
        }
    }
}

function togglePay(field) {
    let obj = hDB.find(x => x.id === currentCardId);
    if(obj) {
        if(!obj.payments) obj.payments = {};
        obj.payments[field] = document.getElementById('pay-' + field).checked;
        safeSet('h_v31', JSON.stringify(hDB));
        if(db) db.collection('history').doc(String(obj.id)).update({ payments: obj.payments }).catch(()=>{});
    }
}
function updatePayPrepay(val) {
    let obj = hDB.find(x => x.id === currentCardId);
    if(obj) {
        if(!obj.payments) obj.payments = {};
        obj.payments.prepay = Number(val) || 0;
        safeSet('h_v31', JSON.stringify(hDB));
        if(db) db.collection('history').doc(String(obj.id)).update({ payments: obj.payments }).catch(()=>{});
    }
}

function saveCust() { 
    cust.name = document.getElementById('c-name').value; 
    cust.addr = document.getElementById('c-addr').value;
    cust.ceil = document.getElementById('c-ceil').value;
    cust.phone = document.getElementById('c-phone').value;
    safeSet('cust_v31', JSON.stringify(cust)); 
    closeModal('custModal'); updateMasterBadge(); 
}
function saveLogic() { 
    appLogic.priceSoc = Number(document.getElementById('logic-price-soc').value) || 500;
    appLogic.priceShield = Number(document.getElementById('logic-price-shield').value) || 500;
    appLogic.priceDrill = Number(document.getElementById('logic-price-drill').value) || 600;
    appLogic.priceShtroba = Number(document.getElementById('logic-price-shtroba').value) || 550;
    appLogic.priceCabCeil = Number(document.getElementById('logic-price-cab-ceil').value) || 120;

    appLogic.shieldInstallPrice = Number(document.getElementById('logic-shield-install').value) || 2500;
    appLogic.shieldInputConnectPrice = Number(document.getElementById('logic-shield-input-connect').value) || 1500;
    appLogic.shieldTestLinePrice = Number(document.getElementById('logic-shield-test-line').value) || 150;
    appLogic.shieldMarkLinePrice = Number(document.getElementById('logic-shield-mark-line').value) || 100;
    appLogic.shieldSchemePrice = Number(document.getElementById('logic-shield-scheme').value) || 4000;
    appLogic.shieldNichePerModule = Number(document.getElementById('logic-shield-niche-module').value) || 400;
    appLogic.shieldInputGroovePrice = Number(document.getElementById('logic-shield-input-groove').value) || 1500;
    
    appLogic.socketsPerJb = Number(document.getElementById('logic-soc-jb').value) || 3;
    appLogic.connPerSocJb = Number(document.getElementById('logic-conn-soc').value) || 3;
    appLogic.connPerSwJb = Number(document.getElementById('logic-conn-sw').value) || 3;
    appLogic.connPerPassJb = Number(document.getElementById('logic-conn-pass').value) || 4;

    safeSet('appLogic_v31', JSON.stringify(appLogic));
    showToast('Логика сохранена!'); closeModal('logicModal'); 
}
function renderLogicUI() { 
    document.getElementById('logic-price-soc').value = appLogic.priceSoc || 500; 
    document.getElementById('logic-price-shield').value = appLogic.priceShield || 500; 
    document.getElementById('logic-price-drill').value = appLogic.priceDrill || 600; 
    document.getElementById('logic-price-shtroba').value = appLogic.priceShtroba || 550; 
    document.getElementById('logic-price-cab-ceil').value = appLogic.priceCabCeil || 120; 

    document.getElementById('logic-shield-install').value = appLogic.shieldInstallPrice || 2500;
    document.getElementById('logic-shield-input-connect').value = appLogic.shieldInputConnectPrice || 1500;
    document.getElementById('logic-shield-test-line').value = appLogic.shieldTestLinePrice || 150;
    document.getElementById('logic-shield-mark-line').value = appLogic.shieldMarkLinePrice || 100;
    document.getElementById('logic-shield-scheme').value = appLogic.shieldSchemePrice || 4000;
    document.getElementById('logic-shield-niche-module').value = appLogic.shieldNichePerModule || 400;
    document.getElementById('logic-shield-input-groove').value = appLogic.shieldInputGroovePrice || 1500;

    document.getElementById('logic-soc-jb').value = appLogic.socketsPerJb || 3; 
    document.getElementById('logic-conn-soc').value = appLogic.connPerSocJb || 3; 
    document.getElementById('logic-conn-sw').value = appLogic.connPerSwJb || 3; 
    document.getElementById('logic-conn-pass').value = appLogic.connPerPassJb || 4; 
}


function openRecalcModal() { 
    globalRecalcCab = 0; globalRecalcSht = 0;
    currentEstimate.forEach(it => { let nameLower = it.n.toLowerCase(); if (nameLower.includes('ввг') || nameLower.includes('bbг') || nameLower.includes('провод') || nameLower.includes('кабель')) globalRecalcCab += Number(it.q); if (nameLower.includes('штроб') && !nameLower.includes('вводная')) globalRecalcSht += Number(it.q); }); 
    document.getElementById('r-cab').innerText = globalRecalcCab + ' м'; document.getElementById('r-sht').innerText = globalRecalcSht + ' м'; document.getElementById('r-ceil-input').value = 0; updateRecalcUI(); openModal('recalcModal'); 
}
function updateRecalcUI() { 
    let ceilCab = Number(document.getElementById('r-ceil-input').value) || 0; let floorCab = Math.max(0, globalRecalcCab - ceilCab - globalRecalcSht);
    document.getElementById('r-res-sht').innerText = globalRecalcSht + ' м'; document.getElementById('r-res-ceil').innerText = ceilCab + ' м'; document.getElementById('r-res-floor').innerText = floorCab + ' м'; 
}
function doRecalculate() {
    let ceilCab = Number(document.getElementById('r-ceil-input').value) || 0; let floorCab = Math.max(0, globalRecalcCab - ceilCab - globalRecalcSht);
    const rmList = ["Гофра ПВХ", "Лента монтажная", "Площадка под стяжку", "Стяжки нейлоновые", "Стяжка нейлоновая", "Прокладка кабеля", "Клипса в штробу", "Газовый баллон", "Гвозди для прямого", "Смесь штукатурная", "Амортизация: Коронка алмазная"];
    currentEstimate = currentEstimate.filter(it => !rmList.some(rm => it.n.includes(rm))); let m=[], w=[];
    let calcFloorCab = Math.ceil(floorCab * 1.1); let calcCeilCab = Math.ceil(ceilCab * 1.1); let calcGofra = Math.ceil(calcFloorCab * 1.05);
    let boxesCount = 0; currentEstimate.forEach(it => { if(it.n.toLowerCase().includes('подрозетн') && it.type === 'work') boxesCount += Number(it.q); });
    let mixKg = Math.ceil(boxesCount * 0.3); if(mixKg > 0) m.push({ n: "Смесь штукатурная/алебастр (кг)", q: mixKg, p: 40, type: 'mat' });
    let crowns = Math.ceil(boxesCount / 80); if(crowns > 0) m.push({ n: "Амортизация: Коронка алмазная", q: crowns, p: 3500, type: 'mat' });

    if (calcFloorCab > 0) { 
        m.push({ n: "Гофра ПВХ/ПНД с протяжкой", q: calcGofra, p: 25, type: 'mat' }); m.push({ n: "Лента монтажная (перфолента)", q: Math.ceil(calcFloorCab * 0.0033), p: 580, type: 'mat' }); w.push({ n: "Прокладка кабеля в гофре (пол)", q: calcFloorCab, p: appLogic.priceCabCeil || 150, type: 'work' }); 
    }
    if (calcCeilCab > 0) {
        let totalBases = Math.ceil(calcCeilCab * 3); let basePacks = Math.ceil(totalBases / 100);
        if(basePacks > 0) { m.push({ n: `Площадка под стяжку (уп. 100шт)`, q: basePacks, p: 500, type: 'mat' }); m.push({ n: `Стяжка нейлоновая 400х5 (уп. 100шт)`, q: basePacks, p: 350, type: 'mat' }); }
        let nailPacks = Math.floor((totalBases + 700) / 1000); if(totalBases > 0 && nailPacks < 1) nailPacks = 1; m.push({ n: "Гвозди для прямого монтажа 3х19 мм (1000 шт)", q: nailPacks, p: 1905, type: 'mat' });
        let gas = Math.ceil(totalBases / 1100); if(totalBases > 0 && gas < 1) gas = 1; m.push({ n: "Газовый баллон 80 мл 165 мм", q: gas, p: 550, type: 'mat' }); w.push({ n: "Прокладка кабеля (без гофры)", q: calcCeilCab, p: appLogic.priceCabCeil || 120, type: 'work' });
    }
    if (globalRecalcSht > 0) { let clipsPacks = Math.ceil((globalRecalcSht * 3) / 100); if(clipsPacks > 0) m.push({ n: `Клипса в штробу (уп. 100шт)`, q: clipsPacks, p: 250, type: 'mat' }); }
    
    addAuto(m, 'recalc_m'); addAuto(w, 'recalc_w'); closeModal('recalcModal'); showToast("✅ Трассы пересчитаны!");
}

function renderChart() {
    let ctxEl = document.getElementById('buhChart');
    if(!ctxEl) return;
    const ctx = ctxEl.getContext('2d');
    if(buhChartInstance) buhChartInstance.destroy();

    let period = document.getElementById('chart-period').value;
    let type = document.getElementById('chart-type').value;

    let viewHDB = appUser.role === 'admin' ? hDB : hDB.filter(h => h.masterUid === appUser.uid);
    let grouped = {};

    viewHDB.forEach(h => {
        let dParts = h.date.split('.'); 
        if(dParts.length !== 3) return;
        let key = '';
        if(period === 'year') key = `${dParts[1]}.${dParts[2]}`; 
        else if(period === 'all') key = dParts[2]; 
        else key = `${dParts[0]}.${dParts[1]}`; 

        if(!grouped[key]) grouped[key] = 0;
        grouped[key] += h.total;
    });

    let sortedKeys = Object.keys(grouped).sort();
    let data = sortedKeys.map(k => grouped[k]);

    buhChartInstance = new Chart(ctx, {
        type: type,
        data: {
            labels: sortedKeys,
            datasets: [{ label: 'Доход (₽)', data: data, backgroundColor: '#4F46E5', borderColor: '#4F46E5', tension: 0.2 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function updateBuhUI() {
    let sumW = 0, sumM = 0, matBase = 0, workBase = 0;
    currentEstimate.forEach(it => { let price = fPrice(it); if(it.type==='work') { sumW += price * it.q; workBase += (it.p||0) * it.q; } else { sumM += price * it.q; matBase += (it.p||0) * it.q; } });
    let disc = Number(document.getElementById('b-discount').value) || 0, prep = Number(document.getElementById('b-prepay').value) || 0;
    document.getElementById('b-work').innerText = sumW + ' P'; document.getElementById('b-mat').innerText = sumM + ' P'; 
    document.getElementById('p-total').innerText = (workBase + (sumM - matBase)) + ' P'; 
    document.getElementById('b-final').innerText = (sumW + sumM - disc - prep) + ' P';
}

async function saveHist() {
    const finalTotal = parseInt(document.getElementById('b-final').innerText) || 0;
    let act = { id: Date.now(), name: cust.name, phone: cust.phone, addr: cust.addr, total: finalTotal, date: new Date().toLocaleDateString(), estimate: JSON.parse(JSON.stringify(currentEstimate)), masterName: appUser.name, masterUid: appUser.uid, payments: { mat: false, cut: false, rough: false, fine: false, extra: false, prepay: Number(document.getElementById('b-prepay').value) || 0 } };
    hDB.push(act); safeSet('h_v31', JSON.stringify(hDB)); updateHistList(); renderChart();
    try { if(db) { await db.collection('history').doc(String(act.id)).set(act); await db.collection('drafts').doc(appUser.uid).delete(); currentEstimate = []; renderMainTable(); } } catch(e){}
    showToast("✅ Объект сохранен в Облако!"); closeModal('buhModal');
}

function updateHistList() {
    let viewHDB = appUser.role === 'admin' ? hDB : hDB.filter(h => h.masterUid === appUser.uid);
    document.getElementById('h-stat').innerHTML = viewHDB.map((h, i) => `<div style="background:rgba(255,255,255,0.6); padding:10px; border-radius:10px; border:1px solid var(--border); margin-bottom:8px; cursor:pointer;" onclick="openObjCard(${h.id})"><div style="display:flex; justify-content:space-between; margin-bottom:6px;"><b style="color:var(--text); font-size:13px;">${h.name || 'Без имени'}</b><b style="color:var(--primary);">${h.total} P</b></div><div style="font-size:10px; color:var(--gray);">Дата: ${h.date} ${appUser.role === 'admin' ? `<br><span style="color:var(--orange);">Мастер: ${h.masterName}</span>` : ''}</div></div>`).join("");
}

function openObjCard(id) {
    closeModal('buhModal'); currentCardId = id; const obj = hDB.find(x => x.id === id); if(!obj) return; 
    
    document.getElementById('card-obj-name').innerHTML = `${obj.name || 'Без имени'}<br><span style="font-size:12px; color:var(--gray); font-weight:normal;">📞 ${obj.phone || 'Нет тел.'} | 📍 ${obj.addr || 'Нет адреса'}</span>`; 
    
    let sumMat = 0, sumCut = 0, sumRough = 0, sumFine = 0, sumExtra = 0;
    let htmlMat='', htmlCut='', htmlRough='', htmlFine='', htmlExtra='';
    
    if(obj.estimate) {
        obj.estimate.forEach(it => {
            let sum = fPrice(it) * it.q;
            let row = `<div class="act-item-row"><span>${it.n} <b style="color:var(--primary);">(x${it.q})</b></span><b>${sum} ₽</b></div>`;
            let cat = categorizeEstimateItem(it);

            if(it.tag === 'extra') { sumExtra += sum; htmlExtra += row; }
            else if(cat === 1) { sumMat += sum; htmlMat += row; }
            else if(cat === 2) { sumCut += sum; htmlCut += row; }
            else if(cat === 4) { sumFine += sum; htmlFine += row; }
            else { sumRough += sum; htmlRough += row; }
        });
    }

    let finalHtml = '';
    if(htmlMat) finalHtml += `<div class="act-group-title" style="background:#10B981;"><span>1. Материалы</span><span>${sumMat} ₽</span></div>${htmlMat}`;
    if(htmlCut) finalHtml += `<div class="act-group-title" style="background:#F59E0B;"><span>2. Штробление и резка</span><span>${sumCut} ₽</span></div>${htmlCut}`;
    if(htmlRough) finalHtml += `<div class="act-group-title" style="background:#64748B;"><span>3. Черновая электрика</span><span>${sumRough} ₽</span></div>${htmlRough}`;
    if(htmlFine) finalHtml += `<div class="act-group-title" style="background:#3B82F6;"><span>4. Чистовая электрика</span><span>${sumFine} ₽</span></div>${htmlFine}`;
    if(htmlExtra) finalHtml += `<div class="act-group-title" style="background:#EF4444;"><span>Дополнительные работы</span><span>${sumExtra} ₽</span></div>${htmlExtra}`;

    if(!finalHtml) finalHtml = "<p style='font-size:12px; color:gray;'>Нет данных по смете</p>";

    document.getElementById('card-acts-container').innerHTML = finalHtml;
    
    let pay = obj.payments || {};
    document.getElementById('pay-mat').checked = !!pay.mat;
    document.getElementById('pay-cut').checked = !!pay.cut;
    document.getElementById('pay-rough').checked = !!pay.rough;
    document.getElementById('pay-fine').checked = !!pay.fine;
    document.getElementById('pay-extra').checked = !!pay.extra;
    document.getElementById('pay-prepay').value = pay.prepay || 0;

    openModal('objCardModal'); 
}

function closeObjCardAndReturn() { closeModal('objCardModal'); openModal('buhModal'); }

async function addExtraWork() { 
    const n = document.getElementById('extra-work-name').value.trim(); const p = Number(document.getElementById('extra-work-price').value); 
    if(!n || !p) return showToast("❌ Введите название и стоимость"); const obj = hDB.find(x => x.id === currentCardId); 
    if(obj) { 
        if(!obj.estimate) obj.estimate = []; obj.estimate.push({ n: n, p: p, q: 1, type: 'work', tag: 'extra' }); obj.total += p; 
        safeSet('h_v31', JSON.stringify(hDB)); updateHistList(); renderChart(); openObjCard(currentCardId); document.getElementById('extra-work-name').value = ""; document.getElementById('extra-work-price').value = ""; showToast("✅ Доп. работа добавлена!"); 
        try { if(db) await db.collection('history').doc(String(obj.id)).update({ estimate: obj.estimate, total: obj.total }); } catch(e){} 
    } 
}

function loadCustHistoryOptions() {
    let sel = document.getElementById('c-history-select'); 
    if(!sel) return;
    let opts = '<option value="">📥 Загрузить (История)</option>'; 
    let uniqueCusts = []; hDB.forEach(h => { if(h.name && !uniqueCusts.find(c => c.name === h.name)) uniqueCusts.push(h); }); 
    uniqueCusts.forEach(h => { opts += `<option value="${h.id}">${h.name} (${h.date})</option>`; }); 
    sel.innerHTML = opts;
}

function switchDbTab(tab) { 
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); 
    document.getElementById(tab === 'mat' ? 'btnTabMat' : 'btnTabWork').classList.add('active'); 
    document.getElementById('editor-mat-list').style.display = tab === 'mat' ? 'block' : 'none'; 
    document.getElementById('editor-work-list').style.display = tab === 'work' ? 'block' : 'none'; 
}

function renderDbEditors() {
    let catsM = [...new Set(matDB.map(m=>m.c || 'Разное'))];
    let catsW = [...new Set(workDB.map(w=>w.c || 'Разное'))];
    document.getElementById('db-cats').innerHTML = [...new Set([...catsM, ...catsW])].map(c=>`<option value="${c}">`).join('');

    let htmlMat = '';
    let mGroups = {}; matDB.forEach(m => { mGroups[m.c||'Разное'] = mGroups[m.c||'Разное'] || []; mGroups[m.c||'Разное'].push(m); });
    Object.keys(mGroups).forEach((c, idx) => {
        let sid = 'db_m_'+idx;
        htmlMat += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
        mGroups[c].forEach(m => {
            htmlMat += `<div class="emp-row"><div><b>${m.n}</b><br><span style="color:var(--gray);font-size:10px;">${m.p} ₽ / ${m.u}</span></div> <input type="number" value="${m.p}" onchange="requestPriceChange('mat', '${m.id}', this.value)" style="width:60px;margin:0;padding:4px;text-align:center;"></div>`;
        });
        htmlMat += `</div>`;
    });
    document.getElementById('editor-mat-list').innerHTML = htmlMat;

    let htmlWork = '';
    let wGroups = {}; workDB.forEach(w => { wGroups[w.c||'Разное'] = wGroups[w.c||'Разное'] || []; wGroups[w.c||'Разное'].push(w); });
    Object.keys(wGroups).forEach((c, idx) => {
        let sid = 'db_w_'+idx;
        htmlWork += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
        wGroups[c].forEach(w => {
            htmlWork += `<div class="emp-row"><div><b>${w.n}</b><br><span style="color:var(--gray);font-size:10px;">${w.p} ₽ / ${w.u}</span></div> <input type="number" value="${w.p}" onchange="requestPriceChange('work', '${w.id}', this.value)" style="width:60px;margin:0;padding:4px;text-align:center;"></div>`;
        });
        htmlWork += `</div>`;
    });
    document.getElementById('editor-work-list').innerHTML = htmlWork;
}

async function addDbItem() {
    if(appUser.role !== 'admin') return showToast("Только админ может добавлять");
    let cat = document.getElementById('db-new-cat').value.trim() || 'Разное';
    let name = document.getElementById('db-new-name').value.trim();
    let price = Number(document.getElementById('db-new-price').value) || 0;
    let unit = document.getElementById('db-new-unit').value.trim() || 'шт';
    let isMat = document.getElementById('editor-mat-list').style.display !== 'none';
    
    if(!name) return showToast("Введите название!");
    
    let newItem = { id: (isMat?'m':'w') + Date.now(), c: cat, n: name, p: price, u: unit };
    if(isMat) matDB.push(newItem); else workDB.push(newItem);
    
    try { if(db) await db.collection('settings').doc('global_db').set({matDB: matDB, workDB: workDB}); } catch(e){}
    
    renderDbEditors();
    document.getElementById('db-new-name').value = ''; document.getElementById('db-new-price').value = '';
    showToast("✅ Позиция добавлена");
}

async function requestPriceChange(type, id, newPrice) { 
    newPrice = Number(newPrice); 
    if (appUser.role === 'admin') { 
        let dbArr = type === 'mat' ? matDB : workDB; let item = dbArr.find(x => x.id === id); 
        if (item) item.p = newPrice; priceOverrides[id] = newPrice; 
        try { if(db) { await db.collection('settings').doc('price_overrides').set({overrides: priceOverrides}); await db.collection('settings').doc('global_db').set({matDB: matDB, workDB: workDB}); } } catch(e){} 
        showToast("✅ Цена изменена"); 
    } else { showToast("Отправлено админу"); } 
}

function listenForApprovals() {
    if(!db) return;
    try {
        db.collection('users').where('isApproved', '==', false).onSnapshot(snap => {
            const container = document.getElementById('admin-approval-list'); container.innerHTML = '';
            if(snap.empty) { container.innerHTML = "<span style='font-size:11px; color:gray;'>Новых заявок нет</span>"; return; }
            snap.forEach(doc => { 
                const u = doc.data(); 
                container.innerHTML += `<div class="emp-row" style="flex-wrap: wrap; gap: 5px;"><span><b>${u.name}</b><br><span style="font-size:10px;">${u.phone || u.email}</span></span><button class="btn-success" onclick="approveUser('${doc.id}')" style="width:auto; margin:0; padding:6px 10px;">Одобрить</button></div>`; 
            });
        });
    } catch(e) { console.error("Listen approvals error", e); }
}

async function approveUser(uid) { try { await db.collection('users').doc(uid).update({ isApproved: true }); showToast("Одобрено!"); } catch(e){} }

async function loadMasterDrafts() {
    if(!db || appUser.role !== 'admin') return;
    try {
        const snap = await db.collection('drafts').get(); 
        const usersSnap = await db.collection('users').get();
        let users = usersSnap.docs.map(d => ({id: d.id, ...d.data()})); 
        adminDraftsCache = [];
        let draftsHtml = '';
        snap.forEach(doc => {
            let data = doc.data(); let master = users.find(u => u.id === doc.id); let mName = master ? master.name : 'Неизвестный мастер'; let total = 0;
            if(data.estimate) { data.estimate.forEach(it => { total += fPrice(it) * it.q; }); }
            data.masterName = mName; data.uid = doc.id; data.total = total;
            adminDraftsCache.push(data);
            draftsHtml += `<div class="emp-row" style="flex-direction:column; align-items:flex-start; cursor:pointer;" onclick="openAdminDraftView('${doc.id}')"><div style="width:100%; display:flex; justify-content:space-between;"><b>${mName}</b> <span style="color:var(--primary); font-weight:bold;">${total} Р</span></div><span style="font-size:10px; color:var(--gray);">Объект: ${data.cust ? data.cust.name : 'Не указан'} | Поз: ${data.estimate ? data.estimate.length : 0}</span></div>`;
        }); 
        document.getElementById('admin-drafts-list').innerHTML = draftsHtml || "<span style='font-size:11px; color:gray;'>Активных смет нет</span>";
    } catch(e) { console.error("Load drafts error", e); }
}

function openAdminDraftView(uid) {
    let draft = adminDraftsCache.find(d => d.uid === uid);
    if(!draft) return;
    let html = `<h3 style="margin-top:0; color:var(--primary);">${draft.masterName}</h3>`;
    html += `<p style="font-size:12px; color:var(--gray); margin-bottom:15px;">Объект: ${draft.cust?.name || 'Не указан'} (${draft.cust?.addr || 'Нет адреса'})</p>`;
    html += `<table class="pdf-table" style="width:100%;">`;
    (draft.estimate || []).forEach(it => {
        html += `<tr><td>${it.n}</td><td style="text-align:center;">x${it.q}</td><td style="text-align:right; font-weight:bold;">${fPrice(it) * it.q} ₽</td></tr>`;
    });
    html += `</table><h3 style="text-align:right; color:var(--primary);">Итого: ${draft.total} ₽</h3>`;
    document.getElementById('admin-draft-content').innerHTML = html;
    openModal('adminDraftModal');
}

async function renderAdminUsers() {
    if(appUser.role !== 'admin') return;
    try {
        if(db) {
            const snap = await db.collection('users').get();
            let html = snap.docs.map(doc => {
                let u = doc.data();
                return `<div class="emp-row" style="flex-wrap: wrap; gap: 5px;"><div><b>${u.name}</b><br><span style="font-size:10px; color:var(--gray);">${u.phone || u.email} (${u.role})</span></div> <button class="btn-danger" style="padding:6px 10px; width:auto; margin:0;" onclick="deleteUser('${doc.id}')">✕</button></div>`;
            }).join('');
            document.getElementById('admin-users-list').innerHTML = html || "<span style='font-size:11px; color:gray;'>Нет сотрудников</span>";
        }
    } catch(e) { console.error("Render users error", e); }
}

async function adminAddUser() {
    let p = document.getElementById('add-user-phone').value.trim();
    let pin = document.getElementById('add-user-pin').value.trim();
    let n = document.getElementById('add-user-name').value.trim();
    if(!p || !pin || !n) return showToast("Заполните все поля!");
    try {
        await db.collection('users').add({ phone: p, pin: pin, name: n, role: 'master', isApproved: true });
        showToast("Мастер добавлен!"); renderAdminUsers();
    } catch(e) { window.customAlert("Ошибка", e.message); }
}

async function deleteUser(uid) {
    let conf = await window.customConfirm("Удаление", "Удалить мастера из базы?");
    if(conf && db) { try { await db.collection('users').doc(uid).delete(); renderAdminUsers(); showToast("Удален"); } catch(e){} }
}


/* =========================================================
 * SOURCE: block-05.js
 * AUTO TARGET: 02-shield-configurator.js
 * SCORE: 228
 * HITS: shield, щит, cfg, automatic, автомат, УЗО, ДИФ, C16, C10, C6, C25, C32, C40, generateCascadePanel, контактор, rcd, dif, breaker, греб, шина, ПуГВ, НШВИ
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 5
 * Original HTML lines: 3871-4181
 */

(function(){
  function qs(id){ return document.getElementById(id); }
  function safeText(v){ return String(v || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function norm(v){ return String(v || '').toLowerCase().replace(/ё/g,'е').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function uniq(arr){ return Array.from(new Set(arr.filter(Boolean))); }
  function getVal(id, def){ var el=qs(id); return el ? el.value : def; }
  function getCheck(id){ var el=qs(id); return !!(el && el.checked); }
  function toNum(v, def){ var n=Number(v); return Number.isFinite(n) ? n : (def || 0); }

  function getCfgCount(key, id, def){
    try { if (window.cfg && Number.isFinite(Number(window.cfg[key]))) return Number(window.cfg[key]); } catch(e){}
    var el = qs(id || ('v-'+key));
    if (el) return toNum(el.textContent || el.value, def || 0);
    return def || 0;
  }

  function epMoveShieldSettingsIntoDetails(){
    var modal = qs('configModal');
    if (!modal || qs('ep-shield-settings-box')) return;
    var content = modal.querySelector('.modal-content');
    if (!content) return;
    var anchor = qs('cfg-brand-box');
    if (!anchor) return;

    var details = document.createElement('details');
    details.id = 'ep-shield-settings-box';
    details.className = 'ep-shield-settings-box';
    details.innerHTML = '<summary>⚙️ Настройки автоматики и щита</summary><div id="ep-shield-settings-inner"></div>';
    var firstRow = anchor.closest('div[style*="grid-template-columns"]') || anchor.parentElement;
    content.insertBefore(details, firstRow);
    var inner = qs('ep-shield-settings-inner');

    var ids = ['cfg-brand-box','cfg-brand-auto','cfg-phase','cfg-auto-curve','cfg-rcd-type','cfg-protection-type'];
    var moved = [];
    ids.forEach(function(id){
      var el = qs(id); if(!el) return;
      var row = el.closest('div[style*="grid-template-columns"]') || el.parentElement;
      if(row && moved.indexOf(row) === -1){ moved.push(row); inner.appendChild(row); }
    });

    var wall = qs('cfg-shield-wall');
    if (wall) {
      var wrap = document.createElement('div');
      wrap.style.marginBottom = '8px';
      var label = wall.previousElementSibling;
      if (label && String(label.tagName).toLowerCase() === 'label') wrap.appendChild(label);
      wrap.appendChild(wall);
      inner.appendChild(wrap);
    }
  }

  function epMatGroupName(item){
    var text = norm([item.c,item.g,item.sc,item.n,item.kind,item.brand,item.nominal].join(' '));
    var name = norm(item.n);
    var c = norm(item.c);

    if (text.includes('уздп') || text.includes('дугов')) return {c:'Автоматика', g:'УЗДП'};
    if (text.includes('узм') || text.includes('реле напряж')) return {c:'Автоматика', g:'УЗМ / реле напряжения'};
    if (text.includes('диф') || text.includes('дифф')) return {c:'Автоматика', g:'ДИФы'};
    if (text.includes('узо')) return {c:'Автоматика', g:'УЗО'};
    if (text.includes('автомат') || text.match(/\bc\s*(6|10|16|25|32|40)\b/)) return {c:'Автоматика', g:'Автоматы'};
    if (text.includes('реле времени')) return {c:'Автоматика', g:'Реле времени'};
    if (text.includes('контактор') || text.includes('пускател')) return {c:'Автоматика', g:'Контакторы'};
    if (text.includes('реле')) return {c:'Автоматика', g:'Прочие реле'};

    if (text.includes('щит') || text.includes('шкаф') || text.includes('корпус')) {
      if (text.includes('наклад')) return {c:'Щитовое', g:'Корпуса → Накладной'};
      if (text.includes('встра') || text.includes('внутр')) return {c:'Щитовое', g:'Корпуса → Встраиваемый'};
      return {c:'Щитовое', g:'Корпуса'};
    }
    if (text.includes('ншви') || text.includes('наконеч')) return {c:'Щитовое', g:'Расходка под сборку → Наконечники'};
    if (text.includes('пугв') || (text.includes('провод') && c !== 'кабель')) return {c:'Щитовое', g:'Расходка под сборку → Провода'};
    if (text.includes('шин') || text.includes('клемм')) return {c:'Щитовое', g:'Расходка под сборку → Шинки / клеммники'};
    if (text.includes('греб') || text.includes('comb')) return {c:'Щитовое', g:'Расходка под сборку → Гребёнки'};
    if (text.includes('din') || text.includes('рейк') || text.includes('огранич')) return {c:'Щитовое', g:'Расходка под сборку → DIN-рейки / ограничители'};
    if (text.includes('маркиров') || text.includes('бирк')) return {c:'Щитовое', g:'Расходка под сборку → Маркировка'};
    if (text.includes('сальник') || text.includes('кабельный ввод')) return {c:'Щитовое', g:'Расходка под сборку → Кабельные вводы'};

    return {c:item.c || 'Разное', g:item.g || item.sc || 'Разное'};
  }

  function epNormalizeMaterialsDb(){
    function fixArr(arr){
      if (!Array.isArray(arr)) return [];
      arr.forEach(function(it){
        if(!it || typeof it !== 'object') return;
        if(!it.id) it.id = 'm_' + Math.abs(norm([it.c,it.g,it.n,it.p].join('_')).split('').reduce(function(h,ch){return ((h<<5)-h+ch.charCodeAt(0))|0;},0));
        var grp = epMatGroupName(it);
        // Меняем только автоматику/щитовое, остальное не трогаем.
        if (grp.c === 'Автоматика' || grp.c === 'Щитовое') { it.c = grp.c; it.g = grp.g; it.sc = grp.g; }
      });
      return arr;
    }
    try { window.matDB = fixArr(window.matDB || []); } catch(e){}
    try { window.userMatDB = fixArr(window.userMatDB || []); } catch(e){}
  }

  function epGroupedData(arr, type){
    var data = {};
    (arr || []).forEach(function(it){
      if(!it) return;
      if(!it.id) it.id = (type === 'work' ? 'w_' : 'm_') + Math.abs(norm([it.c,it.g,it.n,it.p].join('_')).split('').reduce(function(h,ch){return ((h<<5)-h+ch.charCodeAt(0))|0;},0));
      var c = it.c || 'Разное';
      var g = type === 'mat' ? (it.g || it.sc || 'Разное') : (it.g || it.sc || 'Разное');
      if(!data[c]) data[c] = {};
      if(!data[c][g]) data[c][g] = [];
      data[c][g].push(it);
    });
    return data;
  }

  function epRenderGrouped(arr, type, mode, prefix){
    var data = epGroupedData(arr, type);
    var html = '', i = 0;
    Object.keys(data).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
      var cid = prefix + '_c_' + (i++);
      var catStyle = type === 'work' ? 'style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);"' : '';
      html += '<div class="cat-header" '+catStyle+' onclick="toggleCat(\''+cid+'\')">'+safeText(c)+' <span>▼</span></div><div class="cat-body" id="'+cid+'">';
      Object.keys(data[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
        var sid = prefix + '_s_' + (i++);
        html += '<div class="ep-db-sub-header" onclick="epToggleShieldDbSub(\''+sid+'\', event)">'+safeText(g)+' <small>открыть</small></div><div class="ep-db-sub-body" id="'+sid+'">';
        data[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){
          var id = safeText(it.id);
          var meta = safeText(g)+' • '+(Number(it.p)||0)+' ₽ / '+safeText(it.u || 'шт');
          if (mode === 'editor') {
            html += '<div class="emp-row"><div style="flex:1;"><div class="ep-db-item-title">'+safeText(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div><div class="ep-row-actions"><input type="number" value="'+(Number(it.p)||0)+'" onchange="requestPriceChange(\''+type+'\',\''+id+'\',this.value)" style="width:74px;margin:0;padding:5px;text-align:center;"><button class="btn-danger" onclick="epDeleteDbItem && epDeleteDbItem(\''+type+'\',\''+id+'\')" title="Удалить">🗑</button></div></div>';
          } else {
            var color = type === 'work' ? 'background:var(--orange);' : '';
            html += '<div class="mat-item"><div style="flex:1;"><div class="ep-db-item-title">'+safeText(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div><button class="mat-add-btn" style="'+color+' width:auto; margin:0;" onclick="epPromptShieldGroupedAdd(\''+id+'\',\''+type+'\')">+ Добавить</button></div>';
          }
        });
        html += '</div>';
      });
      html += '</div>';
    });
    return html || '<div style="color:var(--gray);font-size:12px;padding:10px;">Позиции не найдены</div>';
  }

  window.epToggleShieldDbSub = function(id, e){ if(e) e.stopPropagation(); var el=qs(id); if(el) el.classList.toggle('active'); };
  window.epPromptShieldGroupedAdd = function(id, type){
    var arr = type === 'work' ? (window.workDB || []) : (window.matDB || []);
    var item = arr.find(function(x){return String(x.id) === String(id);});
    if(!item) return;
    window.pendingAdd = { item:item, type:type };
    var n = qs('qty-prompt-name'); if(n) n.innerText = item.n || 'Позиция';
    var q = qs('qty-input'); if(q) q.value = 1;
    if (typeof openModal === 'function') openModal('qtyPromptModal');
  };

  function epPatchDbRenderers(){
    var oldMat = window.openMatCatalog;
    var oldWork = window.openWorkCatalog;
    var oldRender = window.renderDbEditors;
    window.openMatCatalog = function(){ epNormalizeMaterialsDb(); var el=qs('mat-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'catalog', 'mat_shield'); if(typeof openModal==='function') openModal('matCatModal'); else if(oldMat) oldMat(); };
    window.openWorkCatalog = function(){ var el=qs('work-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'catalog', 'work_shield'); if(typeof openModal==='function') openModal('workModal'); else if(oldWork) oldWork(); };
    window.renderDbEditors = function(){
      epNormalizeMaterialsDb();
      var catsEl = qs('db-cats');
      if (catsEl) catsEl.innerHTML = uniq([].concat((window.matDB||[]).map(function(x){return x.c;}),(window.workDB||[]).map(function(x){return x.c;}))).map(function(c){return '<option value="'+safeText(c)+'">';}).join('');
      var em=qs('editor-mat-list'); if(em) em.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'editor', 'db_mat_shield');
      var ew=qs('editor-work-list'); if(ew) ew.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'editor', 'db_work_shield');
    };
  }

  function epAllDbItems(type){
    var a = type === 'work' ? (window.workDB || []) : (window.matDB || []);
    var b = type === 'work' ? (window.userWorkDB || []) : (window.userMatDB || []);
    return [].concat(a || [], b || []).filter(Boolean);
  }
  function epFindItem(type, words){
    var ws = (words || []).map(norm).filter(Boolean);
    var best = null, bestScore = -1;
    epAllDbItems(type).forEach(function(it){
      var blob = norm([it.c,it.g,it.sc,it.n,it.brand,it.kind,it.nominal,it.curve,it.wallType,it.modules,it.mountType].join(' '));
      var score = 0;
      ws.forEach(function(w){ if(w && blob.includes(w)) score++; });
      if(score > bestScore){ bestScore = score; best = it; }
    });
    return bestScore >= Math.max(1, Math.ceil(ws.length * 0.55)) ? best : null;
  }
  function epMat(label, q, fallbackPrice, words, meta){
    epNormalizeMaterialsDb();
    var found = epFindItem('mat', words || [label]);
    if(found) return { n: found.n, q: q, p: Number(found.p) || 0, u: found.u || 'шт', type: 'mat', sourceId: found.id || null };
    meta = meta || {};
    var path = meta.category ? ' [' + meta.category + (meta.subcategory ? ' → ' + meta.subcategory : '') + ']' : '';
    return { n: '⚠️ ' + label + path + ' — добавить в БД', q: q, p: Number(fallbackPrice) || 0, u: meta.unit || 'шт', type: 'mat', needDb: true, dbMeta: meta };
  }
  function epWork(label, q, price, words, meta){
    var found = epFindItem('work', words || [label]);
    if(found) return { n: found.n, q: q, p: Number(found.p) || Number(price) || 0, u: found.u || (meta && meta.unit) || 'шт', type: 'work', sourceId: found.id || null };
    return { n: label, q: q, p: Number(price) || 0, u: (meta && meta.unit) || 'шт', type: 'work', logicPrice: true };
  }

  window.epGenerateShieldFixed = function(){
    try {
      if (typeof window.addAuto !== 'function') throw new Error('addAuto не найден');
      var bBox = getVal('cfg-brand-box','Tekfor');
      var bAuto = getVal('cfg-brand-auto','IEK');
      var sWall = getVal('cfg-shield-wall','Бетон');
      var ph = parseInt(getVal('cfg-phase','1'),10) || 1;
      var curve = getVal('cfg-auto-curve','C');
      var rcdType = getVal('cfg-rcd-type','A');
      var protectionType = getVal('cfg-protection-type','uzo_auto');
      var isMaster = getCheck('cfg-master');
      var heavySeparate = getCheck('cfg-heavy-separate');
      var appLogic = window.appLogic || {};

      var m = [], w = [], lines = [], protectionDevices = [], warnings = [];
      var groupNames = { power:'Силовые линии', climate:'Климат', wet:'Влажные зоны', light:'Освещение', heavy:'Большая техника', alwaysOn:'Неотключаемые группы', main:'Главная защита' };

      function addLine(name, nominal, group, opts){ opts=opts||{}; lines.push({name:name, nominal:nominal, group:group, curve:opts.curve || curve, nonSwitchable:!!opts.nonSwitchable, wet:group==='wet'||!!opts.wet}); }
      function addRoom(label, count, wetPower){ for(var i=1;i<=count;i++){ var n = count > 1 ? label + ' ' + i : label; addLine(n + ' розетки', 'C16', wetPower ? 'wet' : 'power', {wet:wetPower}); addLine(n + ' свет', 'C10', 'light'); } }
      addRoom('Кухня', getCfgCount('kits','v-kits',1), false);
      addRoom('Ванная', getCfgCount('baths','v-baths',1), true);
      addRoom('Туалет', getCfgCount('toilets','v-toilets',1), true);
      addRoom('Комната', getCfgCount('rms','v-rms',1), false);
      addRoom('Балкон', getCfgCount('bals','v-bals',0), false);
      if(getCheck('c-apron')) addLine('Фартук кухни','C16','power');
      if(getCheck('c-dish')) addLine('Посудомойка','C10','power');
      if(getCheck('c-washer')) addLine('Стиралка/сушилка','C10','wet',{wet:true});
      if(getCheck('c-towel')) addLine('Полотенцесушитель','C10','wet',{wet:true});
      for(var ac=1; ac<=getCfgCount('acs','v-acs',0); ac++) addLine('Кондиционер '+ac,'C10','climate');
      for(var fl=1; fl<=getCfgCount('fls','v-fls',0); fl++) addLine('Тёплый пол '+fl,'C10','climate');
      if(getCheck('c-fridge')) addLine('Холодильник, неотключаемая группа','C10','alwaysOn',{nonSwitchable:true});
      if(getCheck('c-neptun')) addLine('Нептун, неотключаемая группа','C10','alwaysOn',{nonSwitchable:true});
      if(getCheck('c-router')) addLine('Роутер, неотключаемая группа','C6','alwaysOn',{nonSwitchable:true});
      var hob = getVal('c-hob-power','none'); if(hob==='6') addLine('Плита до 6 кВт','C25',heavySeparate?'heavy':'power'); if(hob==='10') addLine('Плита до 10 кВт','C32',heavySeparate?'heavy':'power');
      var boiler = getVal('c-boiler-power','none'); if(boiler==='6') addLine('Бойлер до 6 кВт','C25','wet',{wet:true}); if(boiler==='10') addLine('Бойлер до 10 кВт','C32','wet',{wet:true});

      var presentGroups = uniq(lines.map(function(l){return l.group;}));
      function addProtection(group, kind){ var leakage = group === 'wet' ? 10 : 30; protectionDevices.push({group:group, kind:kind, leakage:leakage, rcdType:rcdType, modules:2}); }
      if(protectionType === 'main_dif_auto') protectionDevices.push({group:'main', kind:'Главный ДИФ', leakage:30, rcdType:rcdType, modules:2});
      else if(protectionType === 'mixed') presentGroups.forEach(function(g){ addProtection(g, g === 'wet' ? 'ДИФ' : 'УЗО'); });
      else presentGroups.forEach(function(g){ addProtection(g, protectionType === 'dif_auto' ? 'ДИФ' : 'УЗО'); });

      function autoPrice(){ return bAuto === 'ABB' ? 350 : 155; }
      function difPrice(){ return bAuto === 'ABB' ? 4500 : 3600; }
      m.push(epMat('Вводной автомат '+ph+'ф '+bAuto, 1, bAuto === 'ABB' ? 3500 : 1800, ['автомат','вводной',bAuto,ph+'ф'], {category:'Автоматика', subcategory:'Автоматы', kind:'input_breaker'}));
      protectionDevices.forEach(function(pd){ var label = pd.kind === 'Главный ДИФ' ? 'Главный ДИФ '+bAuto+' '+pd.leakage+'мА тип '+pd.rcdType : pd.kind+' '+(groupNames[pd.group]||pd.group)+' '+pd.leakage+'мА тип '+pd.rcdType+' '+bAuto; m.push(epMat(label,1,difPrice(),[pd.kind,bAuto,pd.leakage+'мА',pd.rcdType,groupNames[pd.group]||pd.group],{category:'Автоматика', subcategory: pd.kind === 'УЗО' ? 'УЗО' : 'ДИФы', kind:pd.kind, leakage:pd.leakage, rcdType:pd.rcdType, modules:2})); });
      lines.forEach(function(line){ var label = 'Автомат '+line.nominal+' тип '+line.curve+' '+bAuto+' — '+line.name; m.push(epMat(label,1,autoPrice(),['автомат',bAuto,line.nominal,line.curve],{category:'Автоматика', subcategory:'Автоматы', kind:'automatic', nominal:line.nominal, curve:line.curve, modules:1})); });
      var relayModules = 0;
      if(getCheck('cfg-uzm')) { var rq = ph === 3 ? 3 : 1; relayModules = ph === 3 ? 6 : 2; m.push(epMat('Реле напряжения '+bAuto, rq, 4500, ['реле напряжения','узм',bAuto], {category:'Автоматика', subcategory:'УЗМ / реле напряжения', kind:'voltage_relay', modules:relayModules})); }
      if(isMaster){ m.push(epMat('Контактор C40 '+bAuto+' — мастер-кнопка света',1,2200,['контактор','C40',bAuto],{category:'Автоматика', subcategory:'Контакторы', kind:'contactor', modules:2})); m.push(epMat('Автомат C40 тип '+curve+' '+bAuto+' — байпас мастер-кнопки',1,autoPrice(),['автомат','C40',bAuto,curve],{category:'Автоматика', subcategory:'Автоматы', kind:'bypass_breaker', modules:1})); }
      try { (window.currentShieldExtras||[]).forEach(function(ex){ m.push({n:ex.n, q:Number(ex.q)||1, p:Number(ex.p)||0, u:ex.u||'шт', type:'mat'}); }); } catch(e){}

      var onePoleCount = lines.length + (isMaster ? 1 : 0);
      var twoPoleCount = protectionDevices.length;
      var masterModules = isMaster ? 3 : 0;
      var extraModules = 0; try { extraModules = (window.currentShieldExtras||[]).reduce(function(s,ex){return s + (Number(ex.modules||1)*Number(ex.q||1));},0); } catch(e){}
      var totalModules = Math.ceil(onePoleCount + twoPoleCount*2 + relayModules + masterModules + extraModules + (ph===3 ? 3 : 2));
      var boxSize = [6,12,24,36,48,60,72].find(function(s){return s >= totalModules;}) || 72;
      if(totalModules > 72) warnings.push('Нужно больше 72 модулей — требуется второй щит или пересборка схемы');
      m.unshift(epMat('Щит '+(sWall==='Накладной'?'накладной':'встраиваемый')+' '+bBox+' '+boxSize+'М',1,bBox==='ABB'?6510:2660,['щит',bBox,String(boxSize),sWall==='Накладной'?'накладной':'встраиваемый'],{category:'Щитовое', subcategory: sWall==='Накладной'?'Корпуса → Накладной':'Корпуса → Встраиваемый', kind:'shield_box', modules:boxSize}));

      var comb1P = Math.ceil(onePoleCount/12);
      var comb2P = Math.ceil(twoPoleCount/6);
      var rows = Math.ceil(boxSize/12);
      var pugvSize = Number(appLogic.shieldPugvSize || 6);
      var pugvMeters = Math.max(4, Math.ceil(totalModules * 0.4));
      var nshviPacks = Math.max(1, Math.ceil(boxSize/48));
      if(comb1P>0) m.push(epMat('Гребёнка 1P 25см',comb1P,250,['гребенка','1P','25'],{category:'Щитовое', subcategory:'Расходка под сборку → Гребёнки'}));
      if(comb2P>0) m.push(epMat('Гребёнка 2P 25см',comb2P,450,['гребенка','2P','25'],{category:'Щитовое', subcategory:'Расходка под сборку → Гребёнки'}));
      if(twoPoleCount>0) m.push(epMat('Нулевая шинка N на группу УЗО/ДИФ',twoPoleCount,285,['шина','N','ноль','DIN'],{category:'Щитовое', subcategory:'Расходка под сборку → Шинки / клеммники'}));
      m.push(epMat('PE-шина на '+(appLogic.shieldPeBusContacts || 26)+' контактов',1,770,['PE','шина','26'],{category:'Щитовое', subcategory:'Расходка под сборку → Шинки / клеммники'}));
      m.push(epMat('DIN-рейка / комплект DIN для щита',rows,180,['DIN','рейка'],{category:'Щитовое', subcategory:'Расходка под сборку → DIN-рейки / ограничители'}));
      m.push(epMat('Ограничитель на DIN-рейку',rows*2,35,['ограничитель','DIN'],{category:'Щитовое', subcategory:'Расходка под сборку → DIN-рейки / ограничители'}));
      m.push(epMat('Провод ПуГВ 1×'+pugvSize,pugvMeters,85,['ПуГВ','1x'+pugvSize,'1×'+pugvSize],{category:'Щитовое', subcategory:'Расходка под сборку → Провода', unit:'м.п.'}));
      m.push(epMat('НШВИ 1×'+pugvSize+', упак. 100 шт',nshviPacks,225,['НШВИ','1x'+pugvSize,'1×'+pugvSize],{category:'Щитовое', subcategory:'Расходка под сборку → Наконечники'}));
      m.push(epMat('Маркировка линий / бирки',lines.length,15,['маркировка','бирки'],{category:'Щитовое', subcategory:'Расходка под сборку → Маркировка'}));
      if(getCheck('cfg-cable-glands')) m.push(epMat('Кабельные вводы / сальники',1,250,['кабельный ввод','сальник'],{category:'Щитовое', subcategory:'Расходка под сборку → Кабельные вводы'}));

      if(sWall !== 'Накладной') w.push(epWork('Ниша щита '+boxSize+'М ('+sWall+')', boxSize, appLogic.shieldNichePerModule || 400, ['ниша','щит',sWall,String(boxSize)], {unit:'мод.'}));
      if(sWall !== 'Накладной') w.push(epWork('Штроба ВВОДНАЯ 100×50 ('+sWall+')',2,appLogic.shieldInputGroovePrice || 1500,['штроба','вводная','100x50',sWall],{unit:'м.п.'}));
      w.push(epWork('Сборка щита',totalModules,appLogic.priceShield || 500,['сборка','щит'],{unit:'мод.'}));
      w.push(epWork('Установка щита',1,appLogic.shieldInstallPrice || 2500,['установка','щит'],{unit:'шт'}));
      w.push(epWork('Подключение вводного кабеля',1,appLogic.shieldInputConnectPrice || 1500,['подключение','вводного','кабеля'],{unit:'шт'}));
      w.push(epWork('Прозвонка / проверка линий',lines.length,appLogic.shieldTestLinePrice || 150,['прозвонка','проверка','линий'],{unit:'линия'}));
      w.push(epWork('Маркировка линий',lines.length,appLogic.shieldMarkLinePrice || 100,['маркировка','линий'],{unit:'линия'}));
      if(getCheck('cfg-scheme')) w.push(epWork('Составление однолинейной схемы щита',1,appLogic.shieldSchemePrice || 4000,['однолинейная','схема','щит'],{unit:'шт'}));
      var info = [
        {n:'ℹ️ Щит: занято '+totalModules+' мод.; корпус '+boxSize+'М; свободно '+Math.max(0, boxSize-totalModules)+' мод.', q:1, p:0, type:'work'},
        {n:'ℹ️ Защита: '+protectionType+'; автоматы тип '+curve+'; УЗО/ДИФ тип '+rcdType+'; влажные зоны 10мА', q:1, p:0, type:'work'},
        {n:'ℹ️ Гребёнки: 1P '+comb1P+'×25см; 2P '+comb2P+'×25см; N-шинок '+twoPoleCount+'; PE-шина '+(appLogic.shieldPeBusContacts || 26)+' контактов', q:1, p:0, type:'work'}
      ];
      warnings.forEach(function(x){ info.push({n:'⚠️ '+x,q:1,p:0,type:'work'}); });
      window.addAuto(m.concat(w).concat(info),'shield');
      try { window.currentShieldExtras = []; } catch(e){}
      if(typeof closeModal === 'function') closeModal('configModal');
      if(typeof showToast === 'function') showToast('✅ Щит сгенерирован');
    } catch(err) {
      console.error('Shield generate error', err);
      var box = qs('ep-shield-generate-error');
      if(!box){ box = document.createElement('div'); box.id = 'ep-shield-generate-error'; box.className='ep-shield-generate-error'; var btn = Array.from(document.querySelectorAll('button')).find(function(b){return (b.textContent||'').includes('Сгенерировать щит');}); if(btn && btn.parentElement) btn.parentElement.insertBefore(box, btn); }
      if(box) box.textContent = 'Ошибка генерации щита: ' + (err && err.message ? err.message : err);
      if(typeof showToast === 'function') showToast('❌ Ошибка генерации щита');
    }
  };

  function epPatchGenerateButton(){
    window.generateCascadePanel = window.epGenerateShieldFixed;
    Array.from(document.querySelectorAll('button')).forEach(function(btn){ if((btn.textContent||'').includes('Сгенерировать щит')) btn.onclick = window.epGenerateShieldFixed; });
  }

  function boot(){ epMoveShieldSettingsIntoDetails(); epPatchDbRenderers(); epNormalizeMaterialsDb(); epPatchGenerateButton(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  setTimeout(boot, 500);
  setTimeout(boot, 1500);
})();


/* =========================================================
 * SOURCE: block-06.js
 * AUTO TARGET: 02-shield-configurator.js
 * SCORE: 70
 * HITS: shield, щит, automatic, автомат, УЗО, ДИФ, контактор, rcd, dif, breaker, греб, шина, ПуГВ, НШВИ
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 6
 * Original HTML lines: 4187-4391
 */

(function(){
  const BRAND_LIST = ['ABB','IEK','ИЭК','EKF','Schneider','Schneider Electric','Legrand','Hager','Dekraft','CHINT','Tekfor','TDM'];

  function qs(id){ return document.getElementById(id); }
  function toast(t){ if(typeof showToast==='function') showToast(t); else console.log(t); }
  function safe(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
  function norm(s){ return String(s||'').toLowerCase().replace(/с/g,'c').replace(/а/g,'a').replace(/в/g,'b').replace(/х/g,'x').replace(/ё/g,'е').replace(/[×]/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function dbArr(type){
    try { return type === 'mat' ? matDB : workDB; } catch(e) { return type === 'mat' ? (window.matDB || []) : (window.workDB || []); }
  }
  function setDbArr(type, arr){
    try { if(type === 'mat') matDB = arr; else workDB = arr; } catch(e) { if(type === 'mat') window.matDB = arr; else window.workDB = arr; }
  }
  function detectBrand(s){ const raw = String(s||''); const n = norm(raw); for(const b of BRAND_LIST){ if(n.includes(norm(b))) return b === 'ИЭК' ? 'IEK' : b; } return ''; }
  function detectNominal(s){ const n = norm(s).replace(/\s+/g,''); const m = n.match(/([abcd])([0-9]{1,3})/i); return m ? (m[1].toUpperCase()+m[2]) : ''; }
  function getGroup(it){ return it.g || it.sc || it.subcategory || it.group || ''; }
  function setGroup(it,g){ it.g = it.g || g; it.sc = it.sc || g; }

  function normalizeMaterialDb(){
    const arr = dbArr('mat') || [];
    arr.forEach(function(it){
      if(!it || !it.n) return;
      const n = norm((it.c||'')+' '+(it.g||'')+' '+(it.sc||'')+' '+it.n);
      const raw = String(it.n||'');
      if(/(диф|дифавтомат|dif)/i.test(raw) || n.includes('диф')){ it.c='Автоматика'; setGroup(it,'ДИФы'); it.kind=it.kind||'dif'; }
      else if(/\bузо\b/i.test(raw) || n.includes(' uzo ') || n.includes(' узо ')){ it.c='Автоматика'; setGroup(it,'УЗО'); it.kind=it.kind||'uzo'; }
      else if(/уздп/i.test(raw) || n.includes('уздп') || n.includes('дугов')){ it.c='Автоматика'; setGroup(it,'УЗДП'); it.kind=it.kind||'uzdp'; }
      else if(/узм|реле напряж/i.test(raw) || n.includes('реле напряж')){ it.c='Автоматика'; setGroup(it,'УЗМ / реле напряжения'); it.kind=it.kind||'voltage_relay'; }
      else if(/реле времени/i.test(raw) || n.includes('реле времени')){ it.c='Автоматика'; setGroup(it,'Реле времени'); it.kind=it.kind||'time_relay'; }
      else if(/контактор/i.test(raw) || n.includes('контактор')){ it.c='Автоматика'; setGroup(it,'Контакторы'); it.kind=it.kind||'contactor'; }
      else if(/автомат|\b[abcdсавд]\s?\d{1,3}\b/i.test(raw) || /(^|\s)c\s?\d{1,3}(\s|$)/.test(n)){ it.c='Автоматика'; setGroup(it,'Автоматы'); it.kind=it.kind||'automatic'; }
      else if(/щит|корпус|бокс/i.test(raw) || n.includes('корпус')){ it.c='Щитовое'; setGroup(it, (/наклад/i.test(raw)||n.includes('наклад')) ? 'Корпуса → Накладной' : 'Корпуса → Встраиваемый'); it.kind=it.kind||'shield_box'; }
      else if(/ншви|наконеч/i.test(raw) || n.includes('наконеч')){ it.c='Щитовое'; setGroup(it,'Расходка под сборку → Наконечники'); it.kind=it.kind||'lug_pack'; }
      else if(/пугв|пугов|провод/i.test(raw) || n.includes('пугв')){ it.c=it.c||'Щитовое'; if(it.c==='Щитовое' || n.includes('пугв')) setGroup(it,'Расходка под сборку → Провода'); it.kind=it.kind||'pugv'; }
      else if(/шин|клемм/i.test(raw) || n.includes('шина') || n.includes('клемм')){ it.c='Щитовое'; setGroup(it,'Расходка под сборку → Шинки / клеммники'); it.kind=it.kind||'busbar'; }
      else if(/греб/i.test(raw) || n.includes('греб')){ it.c='Щитовое'; setGroup(it,'Расходка под сборку → Гребёнки'); it.kind=it.kind||'comb_bus'; }
      else if(/din|дин|рейк|огранич/i.test(raw) || n.includes('din')){ it.c='Щитовое'; setGroup(it,'Расходка под сборку → DIN-рейки / ограничители'); it.kind=it.kind||'din'; }
      else if(/маркир|бирк/i.test(raw) || n.includes('маркир')){ it.c='Щитовое'; setGroup(it,'Расходка под сборку → Маркировка'); it.kind=it.kind||'marking'; }
      else if(/сальник|кабельн.*ввод/i.test(raw) || n.includes('сальник')){ it.c='Щитовое'; setGroup(it,'Расходка под сборку → Кабельные вводы'); it.kind=it.kind||'cable_gland'; }
      if(!it.brand) it.brand = detectBrand(raw) || it.brand;
      if(!it.nominal) it.nominal = detectNominal(raw) || it.nominal;
    });
    setDbArr('mat', arr);
  }

  function renderGrouped(arr, type, prefix){
    arr = arr || [];
    const cats = {};
    arr.forEach(it => { const c = it.c || 'Разное'; (cats[c]||(cats[c]={direct:[], groups:{}})); const g=getGroup(it); if(g){ (cats[c].groups[g]||(cats[c].groups[g]=[])).push(it); } else cats[c].direct.push(it); });
    let html = ''; let ci = 0;
    Object.keys(cats).sort().forEach(function(c){
      const cid = prefix+'_cat_'+(ci++);
      const color = type==='work' ? 'color:var(--orange);background:rgba(245,158,11,.08);' : '';
      html += '<div class="cat-header" style="'+color+'" onclick="toggleCat(\''+cid+'\')">'+safe(c)+'</div><div class="cat-body" id="'+cid+'">';
      const cat = cats[c]; let gi = 0;
      Object.keys(cat.groups).sort().forEach(function(g){
        const gid = cid+'_g_'+(gi++);
        html += '<div class="ep-db-sub-header" onclick="epDbToggleSub(\''+gid+'\', event)"><span>'+safe(g)+'</span><small>открыть</small></div><div class="ep-db-sub-body" id="'+gid+'">';
        cat.groups[g].forEach(it => { html += renderItem(it,type); });
        html += '</div>';
      });
      cat.direct.forEach(it => { html += renderItem(it,type); });
      html += '</div>';
    });
    return html || '<div style="padding:15px;color:var(--gray);font-weight:700;">База пустая или ещё загружается</div>';
  }
  function renderItem(it,type){
    const id = String(it.id || '');
    const meta = [getGroup(it), it.brand, it.nominal, it.curve, it.rcdType, it.leakage].filter(Boolean).join(' • ');
    const btnColor = type==='work' ? 'background:var(--orange);' : '';
    return '<div class="mat-item"><div style="flex:1;"><div class="ep-db-item-title">'+safe(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+safe(meta)+' '+safe(Number(it.p)||0)+' ₽ / '+safe(it.u || 'шт')+'</div></div><button class="mat-add-btn" style="'+btnColor+'width:auto;margin:0;" onclick="promptAdd(\''+safe(id)+'\', \''+type+'\')">+ Добавить</button></div>';
  }
  window.epDbToggleSub = function(id,e){ if(e) e.stopPropagation(); const el=qs(id); if(el) el.classList.toggle('active'); };

  const oldOpenMat = window.openMatCatalog;
  const oldOpenWork = window.openWorkCatalog;
  const oldRenderDb = window.renderDbEditors;
  window.openMatCatalog = function(){ try{ normalizeMaterialDb(); const el=qs('mat-cat-list'); if(el){ el.innerHTML = renderGrouped(dbArr('mat'), 'mat', 'mat'); openModal('matCatModal'); return; } }catch(e){ console.error(e); } if(oldOpenMat) oldOpenMat(); };
  window.openWorkCatalog = function(){ try{ const el=qs('work-cat-list'); if(el){ el.innerHTML = renderGrouped(dbArr('work'), 'work', 'work'); openModal('workModal'); return; } }catch(e){ console.error(e); } if(oldOpenWork) oldOpenWork(); };
  window.renderDbEditors = function(){
    try{
      normalizeMaterialDb();
      const dc = qs('db-cats'); if(dc){ const all = [].concat(dbArr('mat')||[], dbArr('work')||[]); dc.innerHTML = Array.from(new Set(all.map(x => x.c || 'Разное'))).sort().map(c => '<option value="'+safe(c)+'">').join(''); }
      const em=qs('editor-mat-list'); if(em) em.innerHTML = renderGrouped(dbArr('mat'), 'mat', 'edmat');
      const ew=qs('editor-work-list'); if(ew) ew.innerHTML = renderGrouped(dbArr('work'), 'work', 'edwork');
    }catch(e){ console.error(e); if(oldRenderDb) oldRenderDb(); }
  };

  function savedChoices(){ try{return JSON.parse(localStorage.getItem('ep_db_default_choices_v1')||'{}');}catch(e){return{};} }
  function saveChoice(key,id){ const m=savedChoices(); m[key]=id; localStorage.setItem('ep_db_default_choices_v1', JSON.stringify(m)); }
  function lookupKey(type, meta, label){
    meta = meta || {};
    const parts = [type, meta.kind||'', meta.brand||detectBrand(label)||'', meta.nominal||detectNominal(label)||'', meta.curve||'', meta.poles||'', meta.leakage||'', meta.rcdType||'', meta.modules||''];
    return parts.map(x=>String(x||'').trim()).join('|');
  }
  function reqName(label, meta){
    meta = meta || {};
    const brand = meta.brand || detectBrand(label);
    const nominal = meta.nominal || detectNominal(label);
    const kind = String(meta.kind || '').toLowerCase();
    if(kind.includes('automatic') || kind.includes('breaker') || /^c\d+/i.test(nominal)) return 'Автомат '+(nominal||'')+(brand?' '+brand:'');
    if(kind.includes('dif') || /диф/i.test(label)) return 'ДИФ '+(meta.leakage?meta.leakage+'мА ':'')+(meta.rcdType||'')+(brand?' '+brand:'').trim();
    if(kind.includes('uzo') || /узо/i.test(label)) return 'УЗО '+(meta.leakage?meta.leakage+'мА ':'')+(meta.rcdType||'')+(brand?' '+brand:'').trim();
    return String(label||'Позиция').replace(/\s+—\s+.*$/,'').replace(/\s*\[[^\]]+\]\s*—\s*добавить в БД/i,'').trim();
  }
  function smartFindMat(label, words, meta){
    normalizeMaterialDb();
    const arr = dbArr('mat') || [];
    meta = meta || {};
    const key = lookupKey('mat', meta, label);
    const saved = savedChoices()[key];
    if(saved){ const found = arr.find(x => String(x.id)===String(saved)); if(found) return {item: found, key}; }
    const brand = meta.brand || detectBrand(label) || '';
    const nominal = meta.nominal || detectNominal(label) || '';
    const kind = String(meta.kind||'').toLowerCase();
    const searchWords = (words || []).concat([label, brand, nominal, kind]).filter(Boolean).map(norm).filter(Boolean);
    let best=null, bestScore=-999;
    arr.forEach(function(it){
      const blob = norm([it.c,it.g,it.sc,it.subcategory,it.kind,it.brand,it.nominal,it.curve,it.rcdType,it.leakage,it.n].filter(Boolean).join(' '));
      let score = 0;
      if(kind && blob.includes(norm(kind))) score += 4;
      if(kind.includes('automatic') && (blob.includes('автомат') || blob.includes('automatic'))) score += 5;
      if(kind.includes('dif') && blob.includes('диф')) score += 5;
      if(kind.includes('uzo') && blob.includes('узо')) score += 5;
      if(brand){ if(blob.includes(norm(brand))) score += 8; else score -= 20; }
      if(nominal){ if(blob.replace(/\s+/g,'').includes(norm(nominal).replace(/\s+/g,''))) score += 10; else if(kind.includes('automatic') || kind.includes('breaker')) score -= 30; }
      if(meta.curve && blob.includes(norm(meta.curve))) score += 2;
      if(meta.leakage && blob.includes(norm(meta.leakage+'ма'))) score += 4;
      searchWords.forEach(w => { if(w && blob.includes(w)) score += 1; });
      if(score > bestScore){ bestScore=score; best=it; }
    });
    if(best && bestScore >= 6) return {item:best, key};
    return {item:null, key};
  }

  const oldEpMat = window.epMat;
  window.epMat = function(label, q, fallbackPrice, words, meta){
    const r = smartFindMat(label, words, meta || {});
    if(r.item){ return { n: r.item.n, q:q, p:Number(r.item.p)||0, u:r.item.u||'шт', type:'mat', sourceId:r.item.id||null, epLookupKey:r.key }; }
    const clean = reqName(label, meta || {});
    const m = meta || {};
    const extra = m.category ? ' ['+m.category+(m.subcategory?' → '+m.subcategory:'')+']' : '';
    return { n:'⚠️ '+clean+extra+' — добавить в БД', q:q, p:Number(fallbackPrice)||0, u:m.unit||'шт', type:'mat', needDb:true, dbMeta:m, epLookupKey:r.key };
  };
  try { epMat = window.epMat; } catch(e) {}

  function canonicalName(it){
    let n = String(it.n || '').replace(/^⚠️\s*/,'').replace(/\s*\[[^\]]+\]\s*—\s*добавить в БД/i,'').trim();
    const brand = detectBrand(n);
    const nominal = detectNominal(n);
    if(/автомат/i.test(n) && nominal) return 'Автомат '+nominal+(brand?' '+brand:'');
    if(/диф/i.test(n)){ const leak=(n.match(/(10|30|100|300)\s*мА/i)||[])[1]; const typ=(n.match(/тип\s*([A-Za-zА-Яа-я]+)/i)||[])[1]; return ('ДИФ '+(leak?leak+'мА ':'')+(typ?typ+' ':'')+(brand||'')).trim(); }
    if(/узо/i.test(n)){ const leak=(n.match(/(10|30|100|300)\s*мА/i)||[])[1]; const typ=(n.match(/тип\s*([A-Za-zА-Яа-я]+)/i)||[])[1]; return ('УЗО '+(leak?leak+'мА ':'')+(typ?typ+' ':'')+(brand||'')).trim(); }
    return n.replace(/\s+—\s+.*$/,'').trim();
  }
  function mergeEstimate(){
    try{
      if(!Array.isArray(currentEstimate)) return;
      const map = new Map();
      currentEstimate.forEach(function(it){
        if(!it) return;
        const name = canonicalName(it);
        const key = [it.type||'', it.sourceId||'', name, Number(it.p)||0, it.u||'шт', it.tag||''].join('|');
        if(!map.has(key)) map.set(key, Object.assign({}, it, { n:name, q:Number(it.q)||0, epMergedDetails: [] }));
        else map.get(key).q += Number(it.q)||0;
        const rec = map.get(key); if(it.n && it.n !== name) rec.epMergedDetails.push(it.n);
      });
      currentEstimate = Array.from(map.values()).filter(x => Number(x.q) !== 0);
    }catch(e){ console.error('mergeEstimate', e); }
  }
  const oldRender = window.renderMainTable;
  window.renderMainTable = function(){ mergeEstimate(); if(oldRender) return oldRender(); };

  const oldApplySwap = window.applySwap;
  window.applySwap = function(){
    try{
      if(typeof swapTargetIdx !== 'undefined' && swapTargetIdx >= 0){
        const sel = qs('swap-select');
        const current = currentEstimate[swapTargetIdx];
        if(sel && current && current.epLookupKey) saveChoice(current.epLookupKey, sel.value);
      }
    }catch(e){ console.error(e); }
    if(oldApplySwap) oldApplySwap();
    mergeEstimate(); if(oldRender) oldRender();
    toast('Заменено и закреплено для следующих сборок');
  };

  const oldOpenSwap = window.openSwapModal;
  window.openSwapModal = function(idx){
    if(oldOpenSwap) oldOpenSwap(idx);
    try{
      const box = qs('swapModal')?.querySelector('.modal-content');
      if(box && !qs('ep-swap-note')){
        const div = document.createElement('div'); div.id='ep-swap-note'; div.className='ep-swap-note'; div.innerHTML='После замены выбор закрепится как вариант по умолчанию для следующих сборок щита.';
        const sel = qs('swap-select'); if(sel && sel.parentNode) sel.parentNode.insertBefore(div, sel.nextSibling);
      }
    }catch(e){}
  };

  function boot(){ try{ normalizeMaterialDb(); }catch(e){} }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  setTimeout(boot,500); setTimeout(boot,1500);
})();


/* =========================================================
 * SOURCE: block-07.js
 * AUTO TARGET: 02-shield-configurator.js
 * SCORE: 138
 * HITS: shield, щит, automatic, автомат, УЗО, ДИФ, контактор, rcd, dif, breaker, греб, шина, ПуГВ, НШВИ
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 7
 * Original HTML lines: 4395-4865
 */

/* === SURGICAL FIX 2026-05-13: shield details, no generic DIF, DB fallback, niche category === */
(function(){
  function qs(id){ return document.getElementById(id); }
  function safeHtml(s){
    return String(s == null ? '' : s).replace(/[&<>"]/g, function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m];
    });
  }
  function norm(s){
    return String(s || '')
      .toLowerCase()
      .replace(/ё/g,'е')
      .replace(/×/g,'x')
      .replace(/с/g,'c')
      .replace(/[^a-zа-я0-9]+/g,' ')
      .trim();
  }

  function arrByType(type){
    try{
      var arr = type === 'work' ? workDB : matDB;
      if(type === 'mat' && (!Array.isArray(arr) || !arr.length) && typeof FULL_MAT_INIT !== 'undefined') {
        matDB = (FULL_MAT_INIT || []).slice();
        arr = matDB;
      }
      if(type === 'work' && (!Array.isArray(arr) || !arr.length) && typeof FULL_WORK_INIT !== 'undefined') {
        workDB = (FULL_WORK_INIT || []).slice();
        arr = workDB;
      }
      return Array.isArray(arr) ? arr : [];
    }catch(e){
      return [];
    }
  }

  function setArrByType(type, arr){
    try{
      if(type === 'work') workDB = arr || [];
      else matDB = arr || [];
    }catch(e){}
  }

  function detectBrand(s){
    var raw = String(s || '');
    var brands = ['ABB','АBB','IEK','ИЭК','Schneider','Legrand','EKF','DEKraft','Tekfor','Hager','Lezard','TDM'];
    var low = norm(raw);
    for(var i=0;i<brands.length;i++){
      if(low.indexOf(norm(brands[i])) >= 0) return brands[i] === 'ИЭК' ? 'IEK' : (brands[i] === 'АBB' ? 'ABB' : brands[i]);
    }
    return '';
  }
  function detectNominal(s){
    var n = norm(s).replace(/\s+/g,'');
    var m = n.match(/([abcd])([0-9]{1,3})/i);
    return m ? (m[1].toUpperCase()+m[2]) : '';
  }
  function detectLeakage(s){
    var m = String(s||'').match(/(10|30|100|300)\s*м?а/i);
    return m ? Number(m[1]) : '';
  }
  function detectRcdType(s){
    var raw = String(s || '');
    var m = raw.match(/тип\s*(AC|A|B|АС|А|В)\b/i);
    if(m) {
      var t = m[1].toUpperCase();
      if(t === 'АС') return 'AC';
      if(t === 'А') return 'A';
      if(t === 'В') return 'B';
      return t;
    }
    return '';
  }

  function normalizeDbItem(it, type){
    if(!it) return it;
    if(!it.id) {
      it.id = (type === 'work' ? 'w_' : 'm_') + Date.now() + '_' + Math.random().toString(36).slice(2,8);
    }
    if(type === 'mat') {
      var raw = String([it.c,it.g,it.sc,it.subcategory,it.n].filter(Boolean).join(' '));
      var n = norm(raw);
      if(/диф|дифавтомат|dif/i.test(raw)){
        it.c = 'Автоматика'; it.g = it.g || it.sc || 'ДИФы'; it.sc = it.sc || it.g; it.kind = it.kind || 'dif';
      } else if(/узо/i.test(raw)) {
        it.c = 'Автоматика'; it.g = it.g || it.sc || 'УЗО'; it.sc = it.sc || it.g; it.kind = it.kind || 'uzo';
      } else if(/уздп|дугов/i.test(raw)) {
        it.c = 'Автоматика'; it.g = it.g || it.sc || 'УЗДП'; it.sc = it.sc || it.g; it.kind = it.kind || 'uzdp';
      } else if(/узм|реле напряж/i.test(raw)) {
        it.c = 'Автоматика'; it.g = it.g || it.sc || 'УЗМ / реле напряжения'; it.sc = it.sc || it.g; it.kind = it.kind || 'voltage_relay';
      } else if(/реле времени/i.test(raw)) {
        it.c = 'Автоматика'; it.g = it.g || it.sc || 'Реле времени'; it.sc = it.sc || it.g; it.kind = it.kind || 'time_relay';
      } else if(/контактор/i.test(raw)) {
        it.c = 'Автоматика'; it.g = it.g || it.sc || 'Контакторы'; it.sc = it.sc || it.g; it.kind = it.kind || 'contactor';
      } else if(/автомат|(^|\s)[abcdсавд]\s?\d{1,3}(\s|$)/i.test(raw)) {
        it.c = 'Автоматика'; it.g = it.g || it.sc || 'Автоматы'; it.sc = it.sc || it.g; it.kind = it.kind || 'automatic';
      } else if(/щит|корпус|бокс/i.test(raw)) {
        it.c = 'Щитовое';
        var g = /наклад/i.test(raw) ? 'Корпуса → Накладной' : 'Корпуса → Встраиваемый';
        it.g = it.g || it.sc || g; it.sc = it.sc || it.g; it.kind = it.kind || 'shield_box';
      } else if(/ншви|наконеч/i.test(raw)) {
        it.c = 'Щитовое'; it.g = it.g || it.sc || 'Расходка под сборку → Наконечники'; it.sc = it.sc || it.g; it.kind = it.kind || 'lug_pack';
      } else if(/пугв|провод/i.test(raw)) {
        it.c = it.c || 'Щитовое'; it.g = it.g || it.sc || 'Расходка под сборку → Провода'; it.sc = it.sc || it.g; it.kind = it.kind || 'pugv';
      } else if(/шин|клемм/i.test(raw)) {
        it.c = 'Щитовое'; it.g = it.g || it.sc || 'Расходка под сборку → Шинки / клеммники'; it.sc = it.sc || it.g; it.kind = it.kind || 'busbar';
      } else if(/греб/i.test(raw)) {
        it.c = 'Щитовое'; it.g = it.g || it.sc || 'Расходка под сборку → Гребёнки'; it.sc = it.sc || it.g; it.kind = it.kind || 'comb_bus';
      } else if(/din|дин|рейк|огранич/i.test(raw)) {
        it.c = 'Щитовое'; it.g = it.g || it.sc || 'Расходка под сборку → DIN-рейки / ограничители'; it.sc = it.sc || it.g; it.kind = it.kind || 'din';
      } else if(/маркир|бирк/i.test(raw)) {
        it.c = 'Щитовое'; it.g = it.g || it.sc || 'Расходка под сборку → Маркировка'; it.sc = it.sc || it.g; it.kind = it.kind || 'marking';
      }
      it.brand = it.brand || detectBrand(raw);
      it.nominal = it.nominal || detectNominal(raw);
      it.leakage = it.leakage || detectLeakage(raw);
      it.rcdType = it.rcdType || detectRcdType(raw);
    }
    if(type === 'work') {
      var wr = String([it.c,it.g,it.sc,it.subcategory,it.n].filter(Boolean).join(' '));
      if(/ниша.*щит|щит.*ниша|штроб|резк|алмаз|высверл|отверст/i.test(wr)) {
        it.c = it.c || 'Штробление и резка';
        if(/ниша.*щит|щит.*ниша/i.test(wr)) {
          it.c = 'Штробление и резка';
          it.g = it.g || it.sc || 'Ниши щита';
          it.sc = it.sc || it.g;
        }
      }
    }
    return it;
  }

  function normalizeDbs(){
    var mats = arrByType('mat').map(function(x){ return normalizeDbItem(x,'mat'); });
    var works = arrByType('work').map(function(x){ return normalizeDbItem(x,'work'); });
    setArrByType('mat', mats);
    setArrByType('work', works);
  }

  function renderGroupedFixed(arr, type, prefix){
    normalizeDbs();
    arr = type === 'work' ? arrByType('work') : arrByType('mat');
    var data = {};
    arr.forEach(function(it){
      if(!it) return;
      var c = it.c || 'Разное';
      var g = it.g || it.sc || it.subcategory || 'Разное';
      if(!data[c]) data[c] = {};
      if(!data[c][g]) data[c][g] = [];
      data[c][g].push(it);
    });
    var html = '', i = 0;
    Object.keys(data).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
      var cid = prefix + '_cat_' + (i++);
      var catStyle = type === 'work' ? 'style="color:var(--orange);background:rgba(245,158,11,.08);"' : '';
      html += '<div class="cat-header" '+catStyle+' onclick="toggleCat(\''+cid+'\')">'+safeHtml(c)+'</div><div class="cat-body" id="'+cid+'">';
      Object.keys(data[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
        var gid = prefix + '_grp_' + (i++);
        html += '<div class="ep-db-sub-header" onclick="epDbToggleSubFixed(\''+gid+'\', event)"><span>'+safeHtml(g)+'</span><small>открыть</small></div><div class="ep-db-sub-body" id="'+gid+'">';
        data[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){
          var id = safeHtml(String(it.id||''));
          var meta = [g, it.brand, it.nominal, it.leakage ? it.leakage+'мА' : '', it.rcdType].filter(Boolean).join(' • ');
          var color = type === 'work' ? 'background:var(--orange);' : '';
          html += '<div class="mat-item"><div style="flex:1;"><div class="ep-db-item-title">'+safeHtml(it.n||'Позиция')+'</div><div class="ep-db-item-meta">'+safeHtml(meta)+' '+(Number(it.p)||0)+' ₽ / '+safeHtml(it.u||'шт')+'</div></div><button class="mat-add-btn" style="'+color+' width:auto;margin:0;" onclick="promptAdd(\''+id+'\', \''+type+'\')">+ Добавить</button></div>';
        });
        html += '</div>';
      });
      html += '</div>';
    });
    return html || '<div style="padding:15px;color:var(--gray);font-weight:700;">База пустая или ещё загружается</div>';
  }

  window.epDbToggleSubFixed = function(id,e){
    if(e) e.stopPropagation();
    var el = qs(id);
    if(el) el.classList.toggle('active');
  };

  window.openMatCatalog = function(){
    normalizeDbs();
    var el = qs('mat-cat-list');
    if(el) el.innerHTML = renderGroupedFixed(arrByType('mat'), 'mat', 'mat_fixed');
    if(typeof openModal === 'function') openModal('matCatModal');
  };
  window.openWorkCatalog = function(){
    normalizeDbs();
    var el = qs('work-cat-list');
    if(el) el.innerHTML = renderGroupedFixed(arrByType('work'), 'work', 'work_fixed');
    if(typeof openModal === 'function') openModal('workModal');
  };
  window.renderDbEditors = function(){
    normalizeDbs();
    var cats = qs('db-cats');
    if(cats) {
      var all = arrByType('mat').concat(arrByType('work'));
      cats.innerHTML = Array.from(new Set(all.map(function(x){return x.c || 'Разное';}))).sort(function(a,b){return a.localeCompare(b,'ru');}).map(function(c){return '<option value="'+safeHtml(c)+'">';}).join('');
    }
    var em = qs('editor-mat-list');
    var ew = qs('editor-work-list');
    if(em) em.innerHTML = renderGroupedFixed(arrByType('mat'), 'mat', 'dbmat_fixed');
    if(ew) ew.innerHTML = renderGroupedFixed(arrByType('work'), 'work', 'dbwork_fixed');
  };

  function reqDisplayName(label, meta){
    meta = meta || {};
    var brand = meta.brand || detectBrand(label);
    var nominal = meta.nominal || detectNominal(label);
    var kind = String(meta.kind || '').toLowerCase();
    var leakage = meta.leakage || detectLeakage(label);
    var rcdType = meta.rcdType || detectRcdType(label);

    if(kind.indexOf('automatic') >= 0 || kind.indexOf('breaker') >= 0 || /^C\d+/i.test(nominal)) {
      return ('Автомат ' + (nominal || '') + (brand ? ' ' + brand : '')).trim();
    }
    if(kind.indexOf('dif') >= 0 || /диф/i.test(label)) {
      return ('ДИФ ' + (leakage ? leakage + 'мА ' : '') + (rcdType ? rcdType + ' ' : '') + (brand || '')).trim();
    }
    if(kind.indexOf('uzo') >= 0 || /узо/i.test(label)) {
      return ('УЗО ' + (leakage ? leakage + 'мА ' : '') + (rcdType ? rcdType + ' ' : '') + (brand || '')).trim();
    }
    return String(label || 'Позиция').replace(/\s+—\s+.*$/,'').trim();
  }

  function strictFindMaterial(label, meta){
    normalizeDbs();
    meta = meta || {};
    var arr = arrByType('mat');
    var brand = meta.brand || detectBrand(label) || '';
    var nominal = meta.nominal || detectNominal(label) || '';
    var kind = String(meta.kind || '').toLowerCase();
    var leakage = meta.leakage || detectLeakage(label);
    var rcdType = meta.rcdType || detectRcdType(label);
    var isBreaker = kind.indexOf('automatic') >= 0 || kind.indexOf('breaker') >= 0 || !!nominal;
    var isDif = kind.indexOf('dif') >= 0 || /диф/i.test(label);
    var isUzo = kind.indexOf('uzo') >= 0 || /узо/i.test(label);

    var best = null, bestScore = -999;
    arr.forEach(function(it){
      var blob = norm([it.c,it.g,it.sc,it.subcategory,it.kind,it.brand,it.nominal,it.leakage,it.rcdType,it.n].filter(Boolean).join(' '));
      var raw = String(it.n || '');
      var score = 0;

      if(isBreaker) {
        if(!(blob.indexOf('автомат') >= 0 || String(it.kind||'').toLowerCase().indexOf('automatic') >= 0 || String(it.kind||'').toLowerCase().indexOf('breaker') >= 0)) return;
        if(nominal && blob.replace(/\s+/g,'').indexOf(norm(nominal).replace(/\s+/g,'')) < 0) return;
        score += 20;
      }

      if(isDif) {
        if(blob.indexOf('диф') < 0 && String(it.kind||'').toLowerCase().indexOf('dif') < 0) return;
        if(leakage && blob.indexOf(norm(leakage + 'ма')) < 0 && String(it.leakage||'') !== String(leakage)) return;
        if(rcdType && blob.indexOf(norm(rcdType)) < 0 && String(it.rcdType||'').toUpperCase() !== String(rcdType).toUpperCase()) score -= 3;
        if(norm(raw) === 'диф' || norm(raw) === 'дифы') score -= 100;
        score += 20;
      }

      if(isUzo) {
        if(blob.indexOf('узо') < 0 && String(it.kind||'').toLowerCase().indexOf('uzo') < 0) return;
        if(leakage && blob.indexOf(norm(leakage + 'ма')) < 0 && String(it.leakage||'') !== String(leakage)) return;
        if(rcdType && blob.indexOf(norm(rcdType)) < 0 && String(it.rcdType||'').toUpperCase() !== String(rcdType).toUpperCase()) score -= 3;
        if(norm(raw) === 'узо') score -= 100;
        score += 20;
      }

      if(brand) {
        if(blob.indexOf(norm(brand)) >= 0) score += 15;
        else score -= 30;
      }

      if(!isBreaker && !isDif && !isUzo) {
        var words = norm(label).split(/\s+/).filter(Boolean);
        words.forEach(function(w){ if(blob.indexOf(w) >= 0) score += 1; });
      }

      if(score > bestScore) { bestScore = score; best = it; }
    });

    if(best && bestScore >= 10) return best;
    return null;
  }

  window.epMat = function(label, q, fallbackPrice, words, meta){
    meta = meta || {};
    var found = strictFindMaterial(label, meta);
    var display = reqDisplayName(label, meta);

    if(found) {
      var foundName = String(found.n || '').trim();
      var generic = /^(диф|узо|автомат)$/i.test(foundName);
      return {
        n: generic ? display : display,
        q: q,
        p: Number(found.p) || Number(fallbackPrice) || 0,
        u: found.u || meta.unit || 'шт',
        type: 'mat',
        sourceId: found.id || null,
        dbMeta: meta,
        epRawLabel: label
      };
    }

    var extra = meta.category ? ' [' + meta.category + (meta.subcategory ? ' → ' + meta.subcategory : '') + ']' : '';
    return {
      n: '⚠️ ' + display + extra + ' — добавить в БД',
      q: q,
      p: Number(fallbackPrice) || 0,
      u: meta.unit || 'шт',
      type: 'mat',
      needDb: true,
      dbMeta: meta,
      epRawLabel: label
    };
  };
  try { epMat = window.epMat; } catch(e) {}

  function cleanCanonicalName(it){
    var n = String((it && it.n) || '').replace(/^⚠️\s*/,'').replace(/\s*\[[^\]]+\]\s*—\s*добавить в БД/i,'').trim();
    var meta = (it && it.dbMeta) || {};
    if(meta && (meta.kind || meta.nominal || meta.leakage)) return reqDisplayName(n, meta);
    var brand = detectBrand(n);
    var nominal = detectNominal(n);
    if(/автомат/i.test(n) && nominal) return ('Автомат '+nominal+(brand?' '+brand:'')).trim();
    if(/диф/i.test(n)) return reqDisplayName(n, {kind:'dif', brand:brand, leakage:detectLeakage(n), rcdType:detectRcdType(n)});
    if(/узо/i.test(n)) return reqDisplayName(n, {kind:'uzo', brand:brand, leakage:detectLeakage(n), rcdType:detectRcdType(n)});
    return n.replace(/\s+—\s+.*$/,'').trim();
  }

  function lineFromRaw(raw, fallbackName){
    raw = String(raw || '');
    var after = raw.split('—').slice(1).join('—').trim();
    if(after) return after;
    var n = String(fallbackName || raw || '');
    if(/вводн/i.test(n)) return 'Вводная линия';
    if(/реле напряж/i.test(n)) return 'Защита от перенапряжения';
    if(/контактор/i.test(n)) return 'Мастер-кнопка света';
    if(/байпас/i.test(n)) return 'Байпас мастер-кнопки света';
    if(/греб/i.test(n)) return 'Питание модульной автоматики';
    if(/нулев/i.test(n) || /N на группу/i.test(n)) return 'Нулевые шинки по группам защиты';
    if(/PE-шина/i.test(n)) return 'Защитное заземление PE';
    return 'Позиция щита';
  }

  function mergeEstimateFixed(){
    try{
      if(!Array.isArray(currentEstimate)) return;
      var map = new Map();
      currentEstimate.forEach(function(it){
        if(!it) return;
        var originalName = String(it.n || '');
        if(/^ДИФ$/i.test(originalName.trim()) || /^УЗО$/i.test(originalName.trim())) return; // лишняя обобщённая позиция
        var name = cleanCanonicalName(it);
        var key = [it.type||'', it.sourceId||'', name, Number(it.p)||0, it.u||'шт', it.tag||''].join('|');
        if(!map.has(key)) {
          map.set(key, Object.assign({}, it, {
            n: name,
            q: Number(it.q)||0,
            epMergedDetails: [],
            epRawLabels: []
          }));
        } else {
          map.get(key).q += Number(it.q)||0;
        }
        var rec = map.get(key);
        var raw = it.epRawLabel || originalName;
        if(raw && rec.epRawLabels.indexOf(raw) < 0) rec.epRawLabels.push(raw);
        var line = lineFromRaw(raw, name);
        if(line && rec.epMergedDetails.indexOf(line) < 0) rec.epMergedDetails.push(line);
      });
      currentEstimate = Array.from(map.values()).filter(function(x){ return Number(x.q) !== 0; });
    }catch(e){ console.error('mergeEstimateFixed', e); }
  }

  var oldRenderMainTableFixed = window.renderMainTable;
  window.renderMainTable = function(){
    mergeEstimateFixed();
    if(typeof oldRenderMainTableFixed === 'function') oldRenderMainTableFixed();
  };

  window.categorizeEstimateItem = function(it){
    if(!it) return 3;
    if(it.type === 'mat') return 1;
    var n = String(it.n || '').toLowerCase();
    if(n.indexOf('штроб') >= 0 || n.indexOf('высверл') >= 0 || n.indexOf('алмаз') >= 0 || n.indexOf('резк') >= 0 || n.indexOf('отверст') >= 0 || n.indexOf('ниша') >= 0 || n.indexOf('ниши') >= 0) return 2;
    if(n.indexOf('установк') >= 0 || n.indexOf('розетк') >= 0 || n.indexOf('выключат') >= 0 || n.indexOf('рамк') >= 0 || n.indexOf('свет') >= 0 || n.indexOf('люстр') >= 0) {
      if(n.indexOf('подрозетн') < 0 && n.indexOf('щит') < 0) return 4;
    }
    return 3;
  };
  try { categorizeEstimateItem = window.categorizeEstimateItem; } catch(e) {}

  function shieldRowsForDetails(){
    var rows = [];
    (currentEstimate || []).forEach(function(it){
      var n = String((it && it.n) || '');
      if(!/(Автомат|ДИФ|УЗО|Реле|Контактор|Вводной)/i.test(n)) return;

      var details = Array.isArray(it.epMergedDetails) && it.epMergedDetails.length ? it.epMergedDetails.slice() : [lineFromRaw(it.epRawLabel || n, n)];

      if(/ДИФ|УЗО/i.test(n)) {
        if(/10\s*мА/i.test(n)) details = ['Влажные зоны / защита 10 мА'];
        else if(/30\s*мА/i.test(n) && /ДИФ|УЗО/i.test(n)) {
          if(/Климат/i.test(n)) details = ['Климат / кондиционеры / тёплые полы'];
          else if(/Освещ/i.test(n)) details = ['Освещение / группы мастер-кнопки'];
          else if(/Неотключ/i.test(n)) details = ['Неотключаемые группы / холодильник / Нептун / роутер'];
          else if(/Больш/i.test(n)) details = ['Большая техника / плита / бойлер'];
          else if(/Силов/i.test(n)) details = ['Силовые линии / розеточные группы'];
          else details = ['Группа защиты'];
        }
      }

      details.forEach(function(line){
        rows.push({
          line: line,
          app: n,
          note: detailNote(n, line)
        });
      });
    });
    return rows;
  }

  function detailNote(app, line){
    var n = String(app || '');
    if(/Вводной/i.test(n)) return 'ввод питания щита';
    if(/ДИФ|УЗО/i.test(n)) return /10\s*мА/i.test(n) ? 'защита влажных зон 10 мА' : 'групповая защита 30 мА';
    if(/Автомат/i.test(n)) return 'отдельный автомат линии';
    if(/Реле напряж/i.test(n)) return 'защита от перенапряжения';
    if(/Контактор/i.test(n)) return 'мастер-кнопка только на свет';
    return '';
  }

  var oldShowPreviewFixed = window.showPreview;
  window.showPreview = function(mode, isActOverride, customTitle){
    if(mode !== 'details') {
      return oldShowPreviewFixed.apply(this, arguments);
    }

    currentPreviewMode = mode;
    var title = customTitle || 'ДЕТАЛИЗАЦИЯ ЩИТА';
    var html = getPDFHeader(title);
    var filters = qs('pdf-filters');
    if(filters) filters.style.display = 'none';

    var rows = shieldRowsForDetails();

    html += '<table class="pdf-table"><tr><th>Что отвечает / линия</th><th>Аппарат</th><th>Назначение</th></tr>';
    if(!rows.length) {
      html += '<tr><td colspan="3" style="text-align:center;color:var(--gray);">Щит ещё не сгенерирован</td></tr>';
    } else {
      rows.forEach(function(r){
        html += '<tr><td style="font-weight:bold;color:var(--primary);">'+safeHtml(r.line)+'</td><td>'+safeHtml(r.app)+'</td><td>'+safeHtml(r.note)+'</td></tr>';
      });
    }
    html += '</table>';

    var p = qs('p-cont');
    if(p) p.innerHTML = html;
    if(typeof openModal === 'function') openModal('previewModal');
  };
  try { showPreview = window.showPreview; } catch(e) {}

  document.addEventListener('DOMContentLoaded', function(){
    try{ normalizeDbs(); }catch(e){}
    try{
      var em = qs('editor-mat-list'), ew = qs('editor-work-list');
      if(em && em.textContent && em.textContent.indexOf('Позиции не найдены') >= 0) em.innerHTML = renderGroupedFixed(arrByType('mat'), 'mat', 'dbmat_fixed_start');
      if(ew && ew.textContent && ew.textContent.indexOf('Позиции не найдены') >= 0) ew.innerHTML = renderGroupedFixed(arrByType('work'), 'work', 'dbwork_fixed_start');
    }catch(e){}
  });
})();


/* =========================================================
 * SOURCE: block-22.js
 * AUTO TARGET: 02-shield-configurator.js
 * SCORE: 81
 * HITS: shield, щит, cfg, automatic, автомат, УЗО, ДИФ, C16, C10, C6, C25, C32, C40, generateCascadePanel, контактор, dif, breaker
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 22
 * Original HTML lines: 9416-9505
 */

/* EP V15 verification and compatibility patch: direct shield details + DB bulk move */
(function(){
  function $(id){ return document.getElementById(id); }
  function norm(s){ return String(s||'').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').trim(); }
  function clean(s){ return String(s||'').replace(/\s+/g,' ').trim(); }
  window.epV15IsShieldDevice = function(it){
    var n=String((it&&it.n)||''); var k=String((it&&it.dbMeta&&it.dbMeta.kind)||'');
    return it && it.type==='mat' && (/\b[ABCDАВСД]\s*\d{1,3}\b|автомат|узо|диф|реле|контактор|вводной/i.test(n) || /automatic|breaker|uzo|dif|relay|contactor/i.test(k));
  };
  window.epV15Purpose = function(it){
    var n=String((it&&it.n)||''); var a=window.epV15GetAssignments?window.epV15GetAssignments(it):[];
    if(/вводн/i.test(n)) return 'вводной аппарат щита';
    if(/10\s*мА/i.test(n)) return 'защита влажных зон 10 мА';
    if(/УЗО|ДИФ/i.test(n)) return 'групповая защита линий';
    if(/Контактор/i.test(n)) return 'мастер-кнопка только на свет';
    if(/Реле напряж|УЗМ/i.test(n)) return 'защита от перенапряжения';
    if(/Автомат|\b[ABCDАВСД]\d/i.test(n)) return 'отдельный автомат линии';
    return a.length ? 'позиция щита' : 'назначение не указано';
  };
  window.epV15GetAssignments = function(it){
    var out=[];
    function add(v){ v=clean(v); if(v && !/^(позиция щита|общая|общая \/ вводная|назначение не указано)$/i.test(v) && out.indexOf(v)<0) out.push(v); }
    if(it){
      if(Array.isArray(it.epAssignments)) it.epAssignments.forEach(add);
      if(Array.isArray(it.epMergedDetails)) it.epMergedDetails.forEach(add);
      add(it.epAssignment);
      if(it.dbMeta) add(it.dbMeta.assignment);
    }
    if(!out.length && window.epV15InferAssignments) out = window.epV15InferAssignments(it);
    return out;
  };
  window.epV15BuildLinesFromConfig = function(){
    var lines=[]; function val(id){ var e=$(id); return e?e.value:''; } function chk(id){ var e=$(id); return !!(e&&e.checked); }
    function add(name,nom,group){ lines.push({name:name,nominal:nom,group:group}); }
    function room(label,count,wet){ count=Number(count)||0; for(var i=1;i<=count;i++){ var n=count>1?label+' '+i:label; add(n+' розетки','C16',wet?'wet':'power'); add(n+' свет','C10','light'); } }
    try{ room('Кухня',window.cfg&&cfg.kits,false); room('Ванная',window.cfg&&cfg.baths,true); room('Туалет',window.cfg&&cfg.toilets,true); room('Комната',window.cfg&&cfg.rms,false); room('Балкон',window.cfg&&cfg.bals,false); }catch(e){}
    if(chk('c-apron')) add('Фартук кухни','C16','power'); if(chk('c-dish')) add('Посудомойка','C10','power'); if(chk('c-washer')) add('Стиралка/сушилка','C10','wet'); if(chk('c-towel')) add('Полотенцесушитель','C10','wet');
    var acs=(window.cfg&&Number(cfg.acs))||0, fls=(window.cfg&&Number(cfg.fls))||0; for(var a=1;a<=acs;a++) add('Кондиционер '+a,'C10','climate'); for(var f=1;f<=fls;f++) add('Тёплый пол '+f,'C10','climate');
    if(chk('c-fridge')) add('Холодильник, неотключаемая группа','C10','alwaysOn'); if(chk('c-neptun')) add('Нептун, неотключаемая группа','C10','alwaysOn'); if(chk('c-router')) add('Роутер, неотключаемая группа','C6','alwaysOn');
    if(val('c-hob-power')==='6') add('Плита до 6 кВт','C25','heavy'); if(val('c-hob-power')==='10') add('Плита до 10 кВт','C32','heavy'); if(val('c-boiler-power')==='6') add('Бойлер до 6 кВт','C25','wet'); if(val('c-boiler-power')==='10') add('Бойлер до 10 кВт','C32','wet');
    return lines;
  };
  window.epV15InferAssignments=function(it){
    var n=String((it&&it.n)||''); var q=Number((it&&it.q)||1)||1; var lines=window.epV15BuildLinesFromConfig?window.epV15BuildLinesFromConfig():[];
    if(/вводн/i.test(n)) return ['Вводной аппарат щита'];
    if(/10\s*мА/i.test(n) && /УЗО|ДИФ/i.test(n)) return ['Влажные зоны / защита 10 мА: '+lines.filter(function(x){return x.group==='wet';}).map(function(x){return x.name;}).join(', ')].filter(function(x){return !/:\s*$/.test(x);});
    if(/30\s*мА/i.test(n) && /УЗО|ДИФ/i.test(n)) return ['Группа защиты: силовые/световые/климатические линии'];
    var m=n.match(/\b([ABCDАВСД])\s*(\d{1,3})\b/i); if(m){ var nom=String(m[1]).toUpperCase().replace('А','A').replace('В','B').replace('С','C').replace('Д','D')+m[2]; return lines.filter(function(x){return x.nominal===nom;}).slice(0,Math.max(q,1)).map(function(x){return x.name;}); }
    return [];
  };
  window.epV15NormalizeCurrentEstimate=function(){
    if(!Array.isArray(window.currentEstimate)) return;
    try{
      var map={}, out=[];
      window.currentEstimate.forEach(function(src){
        if(!src) return; var it=Object.assign({},src); var n=String(it.n||'');
        if(/Автомат\s+A\s*472|Автомат\s+A472/i.test(n)) it.n='C40 1P ИЭК ВА47-29';
        else if(/^Автомат\s+IEK$/i.test(n) || /^Автомат\s+ИЭК$/i.test(n)) it.n='Вводной автомат 2P ИЭК ВА47-29';
        else if(/^Автомат\s+C\s*16\s+IEK/i.test(n) || /^Автомат\s+C16\s+IEK/i.test(n)) it.n='C16 1P ИЭК ВА47-29';
        else if(/^Автомат\s+C\s*10\s+IEK/i.test(n) || /^Автомат\s+C10\s+IEK/i.test(n)) it.n='C10 1P ИЭК ВА47-29';
        else if(/^Автомат\s+C\s*6\s+IEK/i.test(n) || /^Автомат\s+C6\s+IEK/i.test(n)) it.n='C6 1P ИЭК ВА47-29';
        else if(/^УЗО\s+30\s*мА\s+IEK/i.test(n)) it.n='УЗО 2P 40A 30мА тип A ИЭК ВД1-63';
        else if(/^УЗО\s+10\s*мА\s+IEK/i.test(n) || /^УЗО\s+10\s*мА/i.test(n)) it.n='УЗО 2P 40A 10мА тип A ИЭК ВД1-63';
        var key=[it.tag||'',it.type||'',it.n||'',Number(it.p)||0,it.u||'шт'].join('|'); var rec=map[key];
        if(!rec){ rec=Object.assign({},it,{q:0,epAssignments:[],epMergedDetails:[]}); map[key]=rec; out.push(rec); }
        rec.q += Number(it.q)||0;
        if(typeof epV15MergeAssignments==='function') epV15MergeAssignments(rec,it);
      });
      window.currentEstimate=out; try{ currentEstimate=out; }catch(e){}
    }catch(e){ console.warn('V15 normalize failed',e); }
  };
  window.epV15SelectVisible=function(type,on){ var box=type==='work'?$('editor-work-list'):$('editor-mat-list'); if(!box) return; Array.prototype.forEach.call(box.querySelectorAll('.ep-v7-select'),function(ch){ ch.checked=!!on; }); };
  window.epV15MoveSelectedActive=async function(type){
    var cat=$('ep-v15-move-cat-'+type), sub=$('ep-v15-move-sub-'+type); var c=cat?cat.value.trim():'', g=sub?sub.value.trim():''; if(!c&&!g) return showToast('Укажи категорию или подкатегорию');
    var checks=Array.from(document.querySelectorAll('#settModal .ep-v7-select:checked')).filter(function(ch){return ch.dataset.type===type;}); if(!checks.length) return showToast('Выбери позиции галочками');
    var ids=new Set(checks.map(function(ch){return String(ch.dataset.id||'');})); var arr=(typeof active==='function'?active(type):[]).map(function(it){ if(ids.has(String(it.id||''))){ var x=Object.assign({},it); if(c) x.c=c; if(g){ x.g=g; x.sc=g; x.subcategory=g; } return x; } return it; });
    if(typeof scope==='function' && scope()==='global' && typeof setServer==='function') setServer(type,arr); else if(typeof setMy==='function') setMy(type,arr);
    showToast('📦 Перенесено: '+ids.size); if(typeof epSaveActiveDbV7==='function') await epSaveActiveDbV7(); else if(typeof renderDbEditors==='function') renderDbEditors();
  };
  var oldRender=window.renderMainTable;
  window.renderMainTable=function(){ try{ window.epV15NormalizeCurrentEstimate(); }catch(e){} return oldRender ? oldRender.apply(this,arguments) : undefined; };
  try{ renderMainTable=window.renderMainTable; }catch(e){}
  var oldGen=window.generateCascadePanel;
  // generateCascadePanel is already directly replaced in V15; keep a badge so user can verify version.
  function boot(){ try{ window.epV15NormalizeCurrentEstimate(); if(typeof oldRender==='function') oldRender(); }catch(e){} }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,100);}); else setTimeout(boot,100);
  setTimeout(function(){ try{ showToast('V15 загружена'); }catch(e){} },600);
})();


/* =========================================================
 * SOURCE: block-23.js
 * AUTO TARGET: 02-shield-configurator.js
 * SCORE: 218
 * HITS: shield, щит, cfg, automatic, автомат, УЗО, ДИФ, C16, C10, C6, C25, C32, C40, generateCascadePanel, контактор, rcd, dif, breaker, греб, шина, ПуГВ, НШВИ
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 23
 * Original HTML lines: 9508-9705
 */

/* EP V16 absolute final override: force shield generator + details after all old patches */
(function(){
  function $(id){return document.getElementById(id);}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});}
  function epV16GenerateCascadePanel() {
    const bBox = epGetVal('cfg-brand-box', 'Tekfor');
    const bAuto = epGetVal('cfg-brand-auto', 'IEK');
    const sWall = epGetVal('cfg-shield-wall', 'Бетон');
    const ph = parseInt(epGetVal('cfg-phase', '1')) || 1;
    const curve = epGetVal('cfg-auto-curve', 'C');
    const rcdType = epGetVal('cfg-rcd-type', 'A');
    const protectionType = epGetVal('cfg-protection-type', 'uzo_auto');
    const isMaster = epGetCheck('cfg-master');
    const heavySeparate = epGetCheck('cfg-heavy-separate');

    let m = [], w = [], lines = [], protectionDevices = [], warnings = [];
    function addLine(name, nominal, group, opts) {
        const o = opts || {};
        lines.push({ name, nominal, group, curve: o.curve || curve, nonSwitchable: !!o.nonSwitchable, wet: group === 'wet' || !!o.wet });
    }
    function addRoom(label, count, wetPower) {
        for (let i = 1; i <= count; i++) {
            const n = count > 1 ? `${label} ${i}` : label;
            addLine(`${n} розетки`, 'C16', wetPower ? 'wet' : 'power', { wet: wetPower });
            addLine(`${n} свет`, 'C10', 'light');
        }
    }
    addRoom('Кухня', cfg.kits || 0, false);
    addRoom('Ванная', cfg.baths || 0, true);
    addRoom('Туалет', cfg.toilets || 0, true);
    addRoom('Комната', cfg.rms || 0, false);
    addRoom('Балкон', cfg.bals || 0, false);
    if (epGetCheck('c-apron')) addLine('Фартук кухни', 'C16', 'power');
    if (epGetCheck('c-dish')) addLine('Посудомойка', 'C10', 'power');
    if (epGetCheck('c-washer')) addLine('Стиралка/сушилка', 'C10', 'wet', { wet: true });
    if (epGetCheck('c-towel')) addLine('Полотенцесушитель', 'C10', 'wet', { wet: true });
    for (let i = 1; i <= (cfg.acs || 0); i++) addLine(`Кондиционер ${i}`, 'C10', 'climate');
    for (let i = 1; i <= (cfg.fls || 0); i++) addLine(`Тёплый пол ${i}`, 'C10', 'climate');
    if (epGetCheck('c-fridge')) addLine('Холодильник, неотключаемая группа', 'C10', 'alwaysOn', { nonSwitchable: true });
    if (epGetCheck('c-neptun')) addLine('Нептун, неотключаемая группа', 'C10', 'alwaysOn', { nonSwitchable: true });
    if (epGetCheck('c-router')) addLine('Роутер, неотключаемая группа', 'C6', 'alwaysOn', { nonSwitchable: true });
    const hobPower = epGetVal('c-hob-power', 'none');
    if (hobPower === '6') addLine('Плита до 6 кВт', 'C25', heavySeparate ? 'heavy' : 'power');
    if (hobPower === '10') addLine('Плита до 10 кВт', 'C32', heavySeparate ? 'heavy' : 'power');
    const boilerPower = epGetVal('c-boiler-power', 'none');
    if (boilerPower === '6') addLine('Бойлер до 6 кВт', 'C25', 'wet', { wet: true });
    if (boilerPower === '10') addLine('Бойлер до 10 кВт', 'C32', 'wet', { wet: true });

    const groupNames = { power: 'Силовые линии', climate: 'Климат', wet: 'Влажные зоны', light: 'Освещение', heavy: 'Большая техника', alwaysOn: 'Неотключаемые группы' };
    const presentGroups = Array.from(new Set(lines.map(l => l.group))).filter(Boolean);
    function groupAssignment(group, leakage) {
        const ls = lines.filter(l => l.group === group).map(l => l.name);
        const head = group === 'wet' ? 'Влажные зоны / защита 10 мА' : (groupNames[group] || group);
        return ls.length ? `${head}: ${ls.join(', ')}` : head;
    }
    function addProtection(group, mode) {
        const leakage = group === 'wet' ? 10 : 30;
        const kind = mode || (protectionType === 'dif_auto' ? 'ДИФ' : 'УЗО');
        protectionDevices.push({ group, kind, leakage, rcdType, modules: 2, assignment: groupAssignment(group, leakage) });
        if (group === 'wet' && leakage !== 10) warnings.push('Влажные зоны должны быть 10 мА');
    }
    if (protectionType === 'main_dif_auto') protectionDevices.push({ group: 'main', kind: 'Главный ДИФ', leakage: 30, rcdType, modules: 2, assignment: 'Вводная групповая защита всего щита' });
    else if (protectionType === 'mixed') presentGroups.forEach(g => addProtection(g, g === 'wet' ? 'ДИФ' : 'УЗО'));
    else presentGroups.forEach(g => addProtection(g, protectionType === 'dif_auto' ? 'ДИФ' : 'УЗО'));

    function mat(label, q, price, words, meta, assignment) {
        meta = Object.assign({}, meta || {}, { brand: bAuto });
        if (assignment) meta.assignment = assignment;
        const it = epMat(label, q, price, words, meta);
        if (assignment) { it.epAssignment = assignment; it.epAssignments = [assignment]; it.epMergedDetails = [assignment]; }
        return it;
    }
    function work(label, q, price, words, meta, assignment) {
        meta = Object.assign({}, meta || {});
        if (assignment) meta.assignment = assignment;
        const it = epWork(label, q, price, words, meta);
        if (assignment) { it.epAssignment = assignment; it.epAssignments = [assignment]; it.epMergedDetails = [assignment]; }
        return it;
    }

    m.push(mat(`Вводной автомат ${ph}ф ${bAuto}`, 1, bAuto === 'ABB' ? 3500 : 1800, ['автомат', 'вводной', bAuto, ph + 'ф'], { category: 'Автоматика', subcategory: 'Автоматы', kind: 'input_breaker', unit: 'шт', poles: ph === 3 ? '4P' : '2P' }, 'Вводной аппарат щита'));
    protectionDevices.forEach(pd => {
        const label = pd.kind === 'Главный ДИФ' ? `Главный ДИФ ${bAuto} ${pd.leakage}мА тип ${pd.rcdType}` : `${pd.kind} ${groupNames[pd.group] || pd.group} ${pd.leakage}мА тип ${pd.rcdType} ${bAuto}`;
        m.push(mat(label, 1, epDifPrice(bAuto), [pd.kind, bAuto, pd.leakage + 'мА', pd.rcdType, groupNames[pd.group] || pd.group], { category: 'Автоматика', subcategory: pd.kind === 'ДИФ' || pd.kind === 'Главный ДИФ' ? 'ДИФы' : 'УЗО', kind: pd.kind === 'ДИФ' || pd.kind === 'Главный ДИФ' ? 'dif' : 'uzo', leakage: pd.leakage, rcdType: pd.rcdType, amp: 40, poles: pd.kind === 'ДИФ' ? '1P+N' : '2P', modules: 2 }, pd.assignment));
    });
    lines.forEach(line => {
        const label = `Автомат ${line.nominal} тип ${line.curve} ${bAuto} — ${line.name}`;
        m.push(mat(label, 1, epAutoPrice(bAuto), ['автомат', bAuto, line.nominal, line.curve], { category: 'Автоматика', subcategory: 'Автоматы', kind: 'automatic', nominal: line.nominal, curve: line.curve, modules: 1, poles: '1P' }, line.name));
    });
    if (epGetCheck('cfg-uzm')) {
        const q = ph === 3 ? 3 : 1;
        m.push(mat(`Реле напряжения ${bAuto}`, q, 4500, ['реле напряжения', 'узм', bAuto], { category: 'Автоматика', subcategory: 'УЗМ / реле напряжения', kind: 'voltage_relay', modules: ph === 3 ? 6 : 2 }, 'Защита от перенапряжения'));
    }
    if (isMaster) {
        const lightLines = lines.filter(l => l.group === 'light').map(l => l.name).join(', ') || 'световые группы';
        m.push(mat(`Контактор C40 ${bAuto} — мастер-кнопка света`, 1, 2200, ['контактор', 'C40', bAuto], { category: 'Автоматика', subcategory: 'Контакторы', kind: 'contactor', modules: 2 }, 'Мастер-кнопка только на свет: ' + lightLines));
        m.push(mat(`Автомат C40 тип ${curve} ${bAuto} — байпас мастер-кнопки`, 1, bAuto === 'ABB' ? 600 : 380, ['автомат', 'C40', bAuto, curve], { category: 'Автоматика', subcategory: 'Автоматы', kind: 'automatic', nominal: 'C40', curve: curve, modules: 1, poles: '1P' }, 'Байпас мастер-кнопки света'));
    }
    currentShieldExtras.forEach(ex => m.push({ n: ex.n, q: ex.q, p: ex.p, u: ex.u || 'шт', type: 'mat', epAssignment: 'Дополнительный аппарат защиты', epAssignments: ['Дополнительный аппарат защиты'], epMergedDetails: ['Дополнительный аппарат защиты'] }));

    const onePoleCount = lines.length + (isMaster ? 1 : 0);
    const twoPoleProtectionCount = protectionDevices.length;
    const relayModules = epGetCheck('cfg-uzm') ? (ph === 3 ? 6 : 2) : 0;
    const masterModules = isMaster ? 3 : 0;
    const extraModules = currentShieldExtras.reduce((s, ex) => s + (Number(ex.modules || 1) * Number(ex.q || 1)), 0);
    const totalModules = Math.ceil(onePoleCount + twoPoleProtectionCount * 2 + relayModules + masterModules + extraModules + (ph === 3 ? 3 : 2));
    const boxSize = [6,12,24,36,48,60,72].find(s => s >= totalModules) || 72;
    if (totalModules > 72) warnings.push('Нужно больше 72 модулей — требуется второй щит или пересборка схемы');

    m.unshift(mat(`Щит ${sWall === 'Накладной' ? 'накладной' : 'встраиваемый'} ${bBox} ${boxSize}М`, 1, bBox === 'ABB' ? 6510 : 2660, ['щит', bBox, String(boxSize), sWall === 'Накладной' ? 'накладной' : 'встраиваемый'], { brand: bBox, category: 'Щитовое', subcategory: 'Корпуса', kind: 'shield_box', modules: boxSize, mountType: sWall === 'Накладной' ? 'surface' : 'built_in' }, 'Корпус щита'));
    const comb1P = Math.ceil(onePoleCount / 12), comb2P = Math.ceil(twoPoleProtectionCount / 6), rows = Math.ceil(boxSize / 12);
    const pugvSize = Number(appLogic.shieldPugvSize || 6), pugvMeters = Math.max(4, Math.ceil(totalModules * 0.4)), nshviPacks = Math.max(1, Math.ceil(boxSize / 48));
    if (comb1P > 0) m.push(mat('Гребёнка 1P 25см', comb1P, 250, ['гребенка', '1P', '25'], { category: 'Щитовое', subcategory: 'Гребёнки', kind: 'comb_bus_1p' }, 'Питание однополюсных автоматов'));
    if (comb2P > 0) m.push(mat('Гребёнка 2P 25см', comb2P, 450, ['гребенка', '2P', '25'], { category: 'Щитовое', subcategory: 'Гребёнки', kind: 'comb_bus_2p' }, 'Питание УЗО/ДИФ'));
    if (twoPoleProtectionCount > 0) m.push(mat('Нулевая шинка N на группу УЗО/ДИФ', twoPoleProtectionCount, 285, ['шина', 'N', 'ноль', 'DIN'], { category: 'Щитовое', subcategory: 'Шины N/PE', kind: 'neutral_bus' }, 'N-шинки по группам защиты'));
    m.push(mat(`PE-шина на ${appLogic.shieldPeBusContacts || 26} контактов`, 1, 770, ['PE', 'шина', '26'], { category: 'Щитовое', subcategory: 'Шины N/PE', kind: 'pe_bus' }, 'Защитное заземление PE'));
    m.push(mat('DIN-рейка / комплект DIN для щита', rows, 180, ['DIN', 'рейка'], { category: 'Щитовое', subcategory: 'DIN', kind: 'din_rail' }, 'Крепление аппаратов на DIN-рейке'));
    m.push(mat('Ограничитель на DIN-рейку', rows * 2, 35, ['ограничитель', 'DIN'], { category: 'Щитовое', subcategory: 'DIN', kind: 'din_stopper' }, 'Фиксация аппаратов на DIN-рейке'));
    m.push(mat(`Провод ПуГВ 1×${pugvSize}`, pugvMeters, 85, ['ПуГВ', '1x' + pugvSize, '1×' + pugvSize], { category: 'Щитовое', subcategory: 'Провода', kind: 'pugv', unit: 'м.п.' }, 'Внутренняя разводка щита'));
    m.push(mat(`НШВИ 1×${pugvSize}, упак. 100 шт`, nshviPacks, 225, ['НШВИ', '1x' + pugvSize, '1×' + pugvSize], { category: 'Щитовое', subcategory: 'Наконечники', kind: 'lug_pack' }, 'Опрессовка проводов щита'));
    m.push(mat('Маркировка линий / бирки', lines.length, 15, ['маркировка', 'бирки'], { category: 'Щитовое', subcategory: 'Маркировка', kind: 'marking_tag' }, 'Маркировка линий'));
    if (epGetCheck('cfg-cable-glands')) m.push(mat('Кабельные вводы / сальники', 1, 250, ['кабельный ввод', 'сальник'], { category: 'Щитовое', subcategory: 'Кабельные вводы', kind: 'cable_gland' }, 'Ввод кабелей в щит'));

    if (sWall !== 'Накладной') w.push(work(`Ниша щита ${boxSize}М (${sWall})`, boxSize, appLogic.shieldNichePerModule || 400, ['ниша', 'щит', sWall, String(boxSize)], { unit: 'мод.', category: 'Штробление и резка', subcategory: 'Ниши щита' }, 'Ниша под корпус щита'));
    if (sWall !== 'Накладной') w.push(work(`Штроба 100×50, под трассу кабелей (${sWall})`, 2, appLogic.shieldInputGroovePrice || 1500, ['штроба', '100x50', sWall, 'трасса', 'кабелей'], { unit: 'м.п.', category: 'Штробление и резка', subcategory: 'Штроба 100×50 под трассу кабелей' }, 'Штроба под ввод/трассу кабелей'));
    w.push(work('Сборка щита', totalModules, appLogic.priceShield || 500, ['сборка', 'щит'], { unit: 'мод.', category: 'Щитовое', subcategory: 'Сборка щита' }, 'Сборка модульного щита'));
    w.push(work('Установка щита', 1, appLogic.shieldInstallPrice || 2500, ['установка', 'щит'], { unit: 'шт', category: 'Щитовое', subcategory: 'Монтаж щита' }, 'Монтаж корпуса щита'));
    w.push(work('Подключение вводного кабеля', 1, appLogic.shieldInputConnectPrice || 1500, ['подключение', 'вводного', 'кабеля'], { unit: 'шт', category: 'Щитовое', subcategory: 'Монтаж щита' }, 'Подключение ввода'));
    w.push(work('Прозвонка / проверка линий', lines.length, appLogic.shieldTestLinePrice || 150, ['прозвонка', 'проверка', 'линий'], { unit: 'линия', category: 'Щитовое', subcategory: 'Проверка линий' }, 'Проверка каждой линии'));
    w.push(work('Маркировка линий', lines.length, appLogic.shieldMarkLinePrice || 100, ['маркировка', 'линий'], { unit: 'линия', category: 'Щитовое', subcategory: 'Маркировка линий' }, 'Маркировка каждой линии'));
    if (epGetCheck('cfg-scheme')) w.push(work('Составление однолинейной схемы щита', 1, appLogic.shieldSchemePrice || 4000, ['однолинейная', 'схема', 'щит'], { unit: 'шт', category: 'Щитовое', subcategory: 'Документация' }, 'Однолинейная схема'));
    const info = [
        { n: `ℹ️ Щит: занято ${totalModules} мод.; корпус ${boxSize}М; свободно ${Math.max(0, boxSize - totalModules)} мод.`, q: 1, p: 0, type: 'work', tag: 'shield_info' },
        { n: `ℹ️ Защита: ${protectionType}; автоматы тип ${curve}; УЗО/ДИФ тип ${rcdType}; влажные зоны 10мА`, q: 1, p: 0, type: 'work', tag: 'shield_info' },
        { n: `ℹ️ Гребёнки: 1P ${comb1P}×25см; 2P ${comb2P}×25см; N-шинок ${twoPoleProtectionCount}; PE-шина ${appLogic.shieldPeBusContacts || 26} контактов`, q: 1, p: 0, type: 'work', tag: 'shield_info' }
    ];
    warnings.forEach(x => info.push({ n: `⚠️ ${x}`, q: 1, p: 0, type: 'work', tag: 'shield_info' }));
    addAuto(m.concat(w).concat(info), 'shield');
    currentShieldExtras = [];
    closeModal('configModal');
    showToast('✅ Щит сгенерирован V16');
}
  function isShieldDeviceV16(it){
    if(!it || it.type!=='mat') return false;
    var n=String(it.n||''), k=String(it.dbMeta&&it.dbMeta.kind||'');
    return /[ABCDАВСД]\s*\d{1,3}|автомат|узо|диф|реле|контактор|вводной/i.test(n) || /automatic|breaker|uzo|dif|relay|contactor/i.test(k);
  }
  function getAssignV16(it){
    if(window.epV15GetAssignments) return window.epV15GetAssignments(it);
    var out=[]; function add(v){v=String(v||'').trim(); if(v && !/позиция щита|общая \/ вводная|назначение не указано/i.test(v) && out.indexOf(v)<0) out.push(v);}
    if(it){ if(Array.isArray(it.epAssignments)) it.epAssignments.forEach(add); if(Array.isArray(it.epMergedDetails)) it.epMergedDetails.forEach(add); add(it.epAssignment); if(it.dbMeta) add(it.dbMeta.assignment); }
    return out;
  }
  function purposeV16(it){ return window.epV15Purpose ? window.epV15Purpose(it) : 'аппарат щита'; }
  function normalizeV16(){ if(window.epV15NormalizeCurrentEstimate) window.epV15NormalizeCurrentEstimate(); }
  function showDetailsV16(customTitle){
    normalizeV16();
    try{ currentPreviewMode='details'; }catch(e){}
    var html = (typeof getPDFHeader==='function') ? getPDFHeader(customTitle || 'ДЕТАЛИЗАЦИЯ ЩИТА') : '<h2>ДЕТАЛИЗАЦИЯ ЩИТА</h2>';
    var f=$('pdf-filters'); if(f) f.style.display='none';
    var items=(window.currentEstimate||[]).filter(isShieldDeviceV16);
    html += '<table class="pdf-table"><tr><th>Что отвечает / линия</th><th>Аппарат</th><th>Назначение</th></tr>';
    if(!items.length) html += '<tr><td colspan="3" style="text-align:center;color:var(--gray);font-weight:900;">Щит ещё не сгенерирован</td></tr>';
    else items.forEach(function(it){
      var lines=getAssignV16(it); if(!lines.length) lines=['назначение не указано — нажми «Сгенерировать щит» ещё раз'];
      html += '<tr><td style="font-weight:bold;color:var(--primary);">'+lines.map(esc).join('<br>')+'</td><td>'+esc(it.n)+(Number(it.q)>1?' × '+Number(it.q):'')+'</td><td>'+esc(purposeV16(it))+'</td></tr>';
    });
    html += '</table>';
    var p=$('p-cont'); if(p) p.innerHTML=html;
    if(typeof openModal==='function') openModal('previewModal');
  }
  var previousPreview = window.showPreview;
  window.showPreview=function(mode,isActOverride,customTitle){
    if(mode==='details') return showDetailsV16(customTitle);
    return previousPreview ? previousPreview.apply(this,arguments) : undefined;
  };
  try{ showPreview=window.showPreview; }catch(e){}
  window.epV16GenerateCascadePanel = epV16GenerateCascadePanel;
  window.generateCascadePanel = epV16GenerateCascadePanel;
  window.epGenerateShieldFixed = epV16GenerateCascadePanel;
  try{ generateCascadePanel = epV16GenerateCascadePanel; }catch(e){}
  function bindButtons(){
    try{ Array.prototype.forEach.call(document.querySelectorAll('button'),function(btn){ if((btn.textContent||'').indexOf('Сгенерировать щит')>=0) btn.onclick=epV16GenerateCascadePanel; }); }catch(e){}
  }
  document.addEventListener('click',function(ev){
    var t=ev.target&&ev.target.closest?ev.target.closest('button'):null; if(!t) return;
    if((t.textContent||'').indexOf('Сгенерировать щит')>=0){ ev.preventDefault(); ev.stopImmediatePropagation(); epV16GenerateCascadePanel(); }
  },true);
  var oldRender = window.renderMainTable;
  window.renderMainTable=function(){ try{normalizeV16();}catch(e){} return oldRender?oldRender.apply(this,arguments):undefined; };
  try{ renderMainTable=window.renderMainTable; }catch(e){}
  function boot(){ bindButtons(); try{normalizeV16(); if(typeof oldRender==='function') oldRender();}catch(e){} }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,150);}); else setTimeout(boot,150);
  setTimeout(boot,800); setInterval(bindButtons,2500);
  setTimeout(function(){ try{showToast('V16 загружена');}catch(e){} },700);
})();


/* =========================================================
 * SOURCE: block-24.js
 * AUTO TARGET: 02-shield-configurator.js
 * SCORE: 74
 * HITS: shield, щит, cfg, automatic, автомат, УЗО, ДИФ, C16, C10, C6, C25, C32, generateCascadePanel, контактор, rcd, dif, breaker
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 24
 * Original HTML lines: 9709-9836
 */

/* EP V17 visible force fix. Purpose: prove the new file is loaded and force shield details/names even if older handlers remain. */
(function(){
  var BUILD='V17 FORCE VISIBLE 2026-05-15';
  function $(id){ return document.getElementById(id); }
  function txt(v){ return String(v==null?'':v); }
  function clean(v){ return txt(v).replace(/\s+/g,' ').trim(); }
  function norm(v){ return clean(v).toLowerCase().replace(/ё/g,'е').replace(/[×х]/g,'x'); }
  function esc(s){ return txt(s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
  function toast(s){ try{ if(typeof showToast==='function') showToast(s); else console.log(s); }catch(e){ console.log(s); } }
  function addBadge(){
    if($('ep-v17-badge')) return;
    var d=document.createElement('div'); d.id='ep-v17-badge';
    d.style.cssText='position:fixed;left:8px;bottom:8px;z-index:2147483647;background:#111827;color:#fff;border:2px solid #22c55e;border-radius:999px;padding:6px 10px;font:900 11px system-ui;box-shadow:0 8px 24px rgba(0,0,0,.35);opacity:.92;';
    d.textContent='✅ V17 активна';
    document.body.appendChild(d);
  }
  function brandRu(v){ v=txt(v||'IEK').trim(); if(/^iek$/i.test(v)) return 'ИЭК'; return v; }
  function lineConfig(){
    var out=[]; function e(id){ return $(id); } function ch(id){ var x=e(id); return !!(x&&x.checked); }
    function add(n,nom,g){ out.push({name:n,nominal:nom,group:g}); }
    function room(label,count,wet){ count=Number(count)||0; for(var i=1;i<=count;i++){ var p=count>1?label+' '+i:label; add(p+' розетки','C16',wet?'wet':'power'); add(p+' свет','C10','light'); } }
    try{ room('Кухня',window.cfg&&cfg.kits,false); room('Ванная',window.cfg&&cfg.baths,true); room('Туалет',window.cfg&&cfg.toilets,true); room('Комната',window.cfg&&cfg.rms,false); room('Балкон',window.cfg&&cfg.bals,false); }catch(e){}
    if(ch('c-apron')) add('Фартук кухни','C16','power'); if(ch('c-dish')) add('Посудомойка','C10','power'); if(ch('c-washer')) add('Стиралка/сушилка','C10','wet'); if(ch('c-towel')) add('Полотенцесушитель','C10','wet');
    var acs=(window.cfg&&Number(cfg.acs))||0, fls=(window.cfg&&Number(cfg.fls))||0; for(var a=1;a<=acs;a++) add('Кондиционер '+a,'C10','climate'); for(var f=1;f<=fls;f++) add('Тёплый пол '+f,'C10','climate');
    if(ch('c-fridge')) add('Холодильник, неотключаемая группа','C10','alwaysOn'); if(ch('c-neptun')) add('Нептун, неотключаемая группа','C10','alwaysOn'); if(ch('c-router')) add('Роутер, неотключаемая группа','C6','alwaysOn');
    var hp=e('c-hob-power')?e('c-hob-power').value:'none'; if(hp==='6') add('Плита до 6 кВт','C25','heavy'); if(hp==='10') add('Плита до 10 кВт','C32','heavy');
    var bp=e('c-boiler-power')?e('c-boiler-power').value:'none'; if(bp==='6') add('Бойлер до 6 кВт','C25','wet'); if(bp==='10') add('Бойлер до 10 кВт','C32','wet');
    return out;
  }
  function nominalOf(it){
    var m=it&&it.dbMeta||{}; var raw=txt(m.nominal||m.rawLabel||it.epRawLabel||it.n);
    var x=raw.match(/\b([ABCDАВСД])\s*(\d{1,3})\b/i); if(!x) return '';
    var c=x[1].toUpperCase().replace('А','A').replace('В','B').replace('С','C').replace('Д','D'); return c+x[2];
  }
  function isDevice(it){
    var n=txt(it&&it.n), k=txt(it&&it.dbMeta&&it.dbMeta.kind), raw=txt(it&&it.epRawLabel);
    return !!(it&&it.type==='mat' && (/автомат|узо|диф|реле|контактор|вводной/i.test(n+' '+raw) || /automatic|breaker|uzo|dif|relay|contactor|input_breaker/i.test(k) || /\b[ABCDАВСД]\s*\d{1,3}\b/i.test(n+' '+raw)));
  }
  function assignmentsOf(it){
    var out=[]; function add(v){ v=clean(v); if(v && !/^(позиция щита|общая|общая \/ вводная|назначение не указано)/i.test(v) && out.indexOf(v)<0) out.push(v); }
    if(it){ if(Array.isArray(it.epAssignments)) it.epAssignments.forEach(add); if(Array.isArray(it.epMergedDetails)) it.epMergedDetails.forEach(add); add(it.epAssignment); if(it.dbMeta) add(it.dbMeta.assignment); }
    if(out.length) return out;
    var n=txt(it&&it.n), raw=txt(it&&it.epRawLabel), k=txt(it&&it.dbMeta&&it.dbMeta.kind), q=Math.max(1,Number(it&&it.q)||1), lines=lineConfig();
    if(/вводн|input_breaker/i.test(n+' '+raw+' '+k)) return ['Вводной аппарат щита'];
    if(/10\s*мА/i.test(n+' '+raw) && /узо|диф/i.test(n+' '+raw)) return ['Влажные зоны / защита 10 мА: '+lines.filter(function(x){return x.group==='wet';}).map(function(x){return x.name;}).join(', ')].filter(function(x){return !/:\s*$/.test(x);});
    if(/30\s*мА/i.test(n+' '+raw) && /узо|диф/i.test(n+' '+raw)) return ['Группа защиты 30 мА: силовые/освещение/климат/неотключаемые линии'];
    var nom=nominalOf(it); if(nom){ var list=lines.filter(function(x){return x.nominal===nom;}).slice(0,q).map(function(x){return x.name;}); if(list.length) return list; }
    return [];
  }
  function deviceName(it){
    var n=clean(it&&it.n), m=(it&&it.dbMeta)||{}, raw=clean(m.rawLabel||it.epRawLabel||n), b=brandRu(m.brand||(/IEK|ИЭК/i.test(n+' '+raw)?'IEK':''));
    var src=n+' '+raw+' '+txt(m.kind);
    if(/input_breaker|вводн/i.test(src)) return 'Вводной автомат '+(m.poles||'2P')+' '+(b||'ИЭК')+' ВА47-29';
    var nom=nominalOf(it); if(/automatic|автомат|\b[ABCDАВСД]\s*\d/i.test(src) && nom) return nom+' '+(m.poles||'1P')+' '+(b||'ИЭК')+' ВА47-29';
    if(/диф/i.test(src)) return 'ДИФ '+(m.poles||'1P+N')+' '+(m.amp||40)+'A '+(m.leakage||(/10\s*мА/i.test(src)?10:30))+'мА тип '+(m.rcdType||'A')+' '+(b||'ИЭК');
    if(/узо/i.test(src)) return 'УЗО '+(m.poles||'2P')+' '+(m.amp||40)+'A '+(m.leakage||(/10\s*мА/i.test(src)?10:30))+'мА тип '+(m.rcdType||'A')+' '+(b||'ИЭК')+' ВД1-63';
    return n;
  }
  function purposeOf(it){
    var s=txt(it&&it.n)+' '+txt(it&&it.epRawLabel)+' '+txt(it&&it.dbMeta&&it.dbMeta.kind);
    if(/вводн|input_breaker/i.test(s)) return 'вводной аппарат щита';
    if(/10\s*мА/i.test(s)) return 'защита влажных зон 10 мА';
    if(/узо|диф/i.test(s)) return 'групповая защита';
    if(/контактор/i.test(s)) return 'мастер-кнопка только на свет';
    if(/реле|узм/i.test(s)) return 'защитный аппарат';
    return 'отдельный автомат линии';
  }
  window.epV17Normalize=function(){
    try{
      var arr=Array.isArray(window.currentEstimate)?window.currentEstimate:[];
      arr.forEach(function(it){ if(isDevice(it)) it.n=deviceName(it); });
      try{ currentEstimate=arr; }catch(e){}
    }catch(e){ console.warn('V17 normalize error',e); }
  };
  window.epV17ShowDetails=function(){
    window.epV17Normalize();
    try{ currentPreviewMode='details'; }catch(e){}
    var html=(typeof getPDFHeader==='function')?getPDFHeader('ДЕТАЛИЗАЦИЯ ЩИТА'):'<div class="pdf-header"><h1>ДЕТАЛИЗАЦИЯ ЩИТА</h1></div>';
    var pf=$('pdf-filters'); if(pf) pf.style.display='none';
    html+='<div style="margin:8px 0 14px;padding:8px 10px;border-radius:12px;background:#ecfdf5;color:#047857;font-weight:900;font-size:12px;">Проверка: детализация сформирована блоком V17</div>';
    html+='<table class="pdf-table"><tr><th>Что отвечает / линия</th><th>Аппарат</th><th>Назначение</th></tr>';
    var items=(Array.isArray(window.currentEstimate)?window.currentEstimate:[]).filter(isDevice);
    if(!items.length) html+='<tr><td colspan="3" style="text-align:center;color:var(--gray);font-weight:900;">Щит ещё не сгенерирован</td></tr>';
    items.forEach(function(it){ var a=assignmentsOf(it); if(!a.length) a=['назначение не указано']; html+='<tr><td style="font-weight:900;color:var(--primary);">'+a.map(esc).join('<br>')+'</td><td>'+esc(deviceName(it))+(Number(it.q)>1?' × '+Number(it.q):'')+'</td><td>'+esc(purposeOf(it))+'</td></tr>'; });
    html+='</table>';
    var p=$('p-cont'); if(p) p.innerHTML=html;
    try{ if(typeof openModal==='function') openModal('previewModal'); }catch(e){ var m=$('previewModal'); if(m)m.style.display='flex'; }
  };
  var oldShow=window.showPreview;
  window.showPreview=function(mode){ if(mode==='details') return window.epV17ShowDetails(); return oldShow?oldShow.apply(this,arguments):undefined; };
  try{ showPreview=window.showPreview; }catch(e){}
  var oldRender=window.renderMainTable;
  window.renderMainTable=function(){ window.epV17Normalize(); return oldRender?oldRender.apply(this,arguments):undefined; };
  try{ renderMainTable=window.renderMainTable; }catch(e){}
  var oldGen=window.generateCascadePanel;
  window.generateCascadePanel=function(){ var r=oldGen?oldGen.apply(this,arguments):undefined; setTimeout(function(){ window.epV17Normalize(); try{ if(typeof renderMainTable==='function') renderMainTable(); }catch(e){} toast('✅ Щит сгенерирован V17'); },80); return r; };
  try{ generateCascadePanel=window.generateCascadePanel; }catch(e){}
  document.addEventListener('click',function(ev){
    var b=ev.target&&ev.target.closest?ev.target.closest('button'):null; if(!b) return; var t=clean(b.textContent);
    if(t.indexOf('Детализация')>=0){ ev.preventDefault(); ev.stopImmediatePropagation(); window.epV17ShowDetails(); }
  },true);
  function patchDbBulk(){
    var modal=$('settModal'); if(!modal || $('ep-v17-bulk-box')) return;
    var host=$('editor-mat-list') || $('editor-work-list'); if(!host) return;
    var box=document.createElement('div'); box.id='ep-v17-bulk-box'; box.style.cssText='margin:12px 0;padding:12px;border:2px dashed #8b5cf6;border-radius:16px;background:#faf5ff;';
    box.innerHTML='<b style="color:#5b21b6;display:block;margin-bottom:8px;">Массовое управление V17</b><div style="font-size:12px;color:#64748b;font-weight:800;margin-bottom:8px;">Выделение и перенос работают по галочкам в текущей открытой базе. Если галочек нет — значит открыт старый список, нажми Обновить / перезагрузить.</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><input id="ep-v17-move-cat" placeholder="Категория"><input id="ep-v17-move-sub" placeholder="Подкатегория"></div><button onclick="epV17BulkMove()" style="margin-top:8px;background:#8b5cf6;color:white;">📦 Переместить выбранные</button><button onclick="epV17BulkDelete()" style="margin-top:8px;background:#ef4444;color:white;">🗑 Удалить выбранные</button>';
    host.parentNode.insertBefore(box,host);
  }
  window.epV17BulkMove=async function(){
    var checks=Array.prototype.slice.call(document.querySelectorAll('#settModal .ep-v7-select:checked')); if(!checks.length) return toast('Выбери позиции галочками');
    var c=clean($('ep-v17-move-cat')&&$('ep-v17-move-cat').value), g=clean($('ep-v17-move-sub')&&$('ep-v17-move-sub').value); if(!c&&!g) return toast('Укажи категорию или подкатегорию');
    var ids={}; checks.forEach(function(ch){ ids[String(ch.dataset.id||'')]=true; });
    function move(arr){ return (arr||[]).map(function(it){ if(ids[String(it.id||'')]){ var x=Object.assign({},it); if(c)x.c=c; if(g){x.g=g;x.sc=g;x.subcategory=g;} return x;} return it;}); }
    try{ if(typeof active==='function' && typeof scope==='function'){ var type=checks[0].dataset.type||'mat'; var arr=move(active(type)); if(scope()==='global' && typeof setServer==='function') setServer(type,arr); else if(typeof setMy==='function') setMy(type,arr); if(typeof epSaveActiveDbV7==='function') await epSaveActiveDbV7(); if(typeof renderDbEditors==='function') renderDbEditors(); toast('📦 Перенесено: '+checks.length); } }catch(e){ toast('Ошибка перемещения: '+(e.message||e)); }
  };
  window.epV17BulkDelete=async function(){
    var checks=Array.prototype.slice.call(document.querySelectorAll('#settModal .ep-v7-select:checked')); if(!checks.length) return toast('Выбери позиции галочками');
    var ok=true; try{ if(typeof customConfirm==='function') ok=await customConfirm('Удаление','Удалить выбранные позиции: '+checks.length+'?'); else ok=confirm('Удалить выбранные позиции: '+checks.length+'?'); }catch(e){}
    if(!ok) return;
    var ids={}; checks.forEach(function(ch){ ids[String(ch.dataset.id||'')]=true; });
    try{ if(typeof active==='function' && typeof scope==='function'){ var type=checks[0].dataset.type||'mat'; var arr=(active(type)||[]).filter(function(it){return !ids[String(it.id||'')];}); if(scope()==='global' && typeof setServer==='function') setServer(type,arr); else if(typeof setMy==='function') setMy(type,arr); if(typeof epSaveActiveDbV7==='function') await epSaveActiveDbV7(); if(typeof renderDbEditors==='function') renderDbEditors(); toast('🗑 Удалено: '+checks.length); } }catch(e){ toast('Ошибка удаления: '+(e.message||e)); }
  };
  function boot(){ addBadge(); window.epV17Normalize(); try{ if(typeof renderMainTable==='function') renderMainTable(); }catch(e){} patchDbBulk(); setTimeout(patchDbBulk,700); toast(BUILD+' загружена'); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,250);}); else setTimeout(boot,250);
  setInterval(function(){ addBadge(); patchDbBulk(); },2000);
})();


/* =========================================================
 * SOURCE: block-26.js
 * AUTO TARGET: 02-shield-configurator.js
 * SCORE: 214
 * HITS: shield, щит, cfg, automatic, автомат, УЗО, ДИФ, C16, C10, C6, C25, C32, C40, epV19GenerateShield, epV18GenerateShield, контактор, rcd, dif, breaker, греб, шина, ПуГВ, НШВИ
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 26
 * Original HTML lines: 10092-10234
 */

/* EP V19: restore fixed shield math. Keeps V18 DB/bulk/status. Aggregates automatics by nominal and keeps per-line assignments. */
(function(){
  var BUILD='V19 SHIELD MATH RESTORE 2026-05-15';
  function $(id){ return document.getElementById(id); }
  function toast(msg){ try{ if(typeof showToast==='function') showToast(msg); else console.log(msg); }catch(e){ console.log(msg); } }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function money(v){ v=Number(v); return isFinite(v)?v:0; }
  function val(id,def){ var e=$(id); return e ? (e.value || def || '') : (def || ''); }
  function chk(id){ var e=$(id); return !!(e && e.checked); }
  function cfgN(k){ try{ return Math.max(0, Number((window.cfg&&window.cfg[k])||0)); }catch(e){ return 0; } }
  function appPrice(k,def){ try{ return Number(window.appLogic && window.appLogic[k]) || def; }catch(e){ return def; } }
  function brandRu(v){ var s=String(v||'').toUpperCase(); if(s.indexOf('IEK')>=0||s.indexOf('ИЭК')>=0) return 'ИЭК'; if(s.indexOf('ABB')>=0) return 'ABB'; if(s.indexOf('SCHNEIDER')>=0) return 'Schneider'; if(s.indexOf('LEGRAND')>=0) return 'Legrand'; if(s.indexOf('EKF')>=0) return 'EKF'; return String(v||'ИЭК'); }
  function curveNom(nom, curve){ var amp=String(nom||'').replace(/[^0-9]/g,'')||'16'; var c=String(curve||String(nom||'C').charAt(0)||'C').toUpperCase(); if(!/[ABCDАВСД]/.test(c)) c='C'; return c+amp; }
  function autoName(nom,brand,curve){ var cn=curveNom(nom,curve), br=brandRu(brand); if(br==='ABB') return cn+' 1P ABB SH201'; if(br==='Schneider') return cn+' 1P Schneider'; if(br==='Legrand') return cn+' 1P Legrand'; if(br==='EKF') return cn+' 1P EKF'; return cn+' 1P ИЭК ВА47-29'; }
  function autoPrice(nom,brand){
    var amp=Number(String(nom||'').replace(/[^0-9]/g,''))||16;
    try{
      var db=(window.matDB||[]).concat(window.userMatDB||[]);
      var br=brandRu(brand).toLowerCase(); var cn=curveNom(nom).toLowerCase();
      var hit=db.find(function(x){ var n=String((x&&x.n)||'').toLowerCase().replace(/ё/g,'е'); return /автомат|выключатель автоматический|ва47|sh201/.test(n) && n.indexOf(String(amp))>=0 && (br==='иэк' ? /иэк|iek/.test(n) : n.indexOf(br)>=0); });
      if(hit && Number(hit.p)>0) return Number(hit.p);
    }catch(e){}
    if(String(brand||'').toUpperCase()==='ABB') return amp>=25?600:265;
    return amp>=40?380:(amp<=10?172:150);
  }
  function rcdName(kind, leak, brand, rcdType){ var br=brandRu(brand); var k=kind==='ДИФ'||kind==='Главный ДИФ'?'ДИФ':'УЗО'; if(br==='ABB') return k+' 2P 40A '+leak+'мА тип '+(rcdType||'A')+' ABB'; return k+' 2P 40A '+leak+'мА тип '+(rcdType||'A')+' '+br+(br==='ИЭК'?' ВД1-63':''); }
  function rcdPrice(kind, leak, brand){
    try{
      var db=(window.matDB||[]).concat(window.userMatDB||[]); var k=(kind==='ДИФ'||kind==='Главный ДИФ')?'диф':'узо'; var br=brandRu(brand).toLowerCase();
      var hit=db.find(function(x){ var n=String((x&&x.n)||'').toLowerCase().replace(/ё/g,'е'); return n.indexOf(k)>=0 && n.indexOf(String(leak))>=0 && (br==='иэк' ? /иэк|iek/.test(n) : n.indexOf(br)>=0); });
      if(hit && Number(hit.p)>0) return Number(hit.p);
    }catch(e){}
    if(kind==='ДИФ'||kind==='Главный ДИФ') return leak===10?3600:3600;
    return leak===10?3600:1195;
  }
  function makeItem(n,q,p,type,meta,assignments){
    var arr=[]; if(Array.isArray(assignments)) arr=assignments.filter(Boolean); else if(assignments) arr=[assignments];
    var it=Object.assign({n:n,q:Number(q)||1,p:money(p),u:(meta&&meta.unit)||'шт',type:type||'mat',tag:'shield'},meta||{});
    if(arr.length){ it.epAssignment=arr[0]; it.epAssignments=arr.slice(); it.epMergedDetails=arr.slice(); it.assignment=arr[0]; if(!it.dbMeta) it.dbMeta={}; it.dbMeta.assignment=arr[0]; }
    return it;
  }
  function groupLines(lines){
    var m={};
    lines.forEach(function(l){ var key=curveNom(l.nominal,l.curve); if(!m[key]) m[key]={nominal:key, lines:[], groups:{}}; m[key].lines.push(l.name); m[key].groups[l.group]=true; });
    return Object.keys(m).map(function(k){ return m[k]; });
  }
  function buildLines(curve){
    var lines=[];
    function add(name,nom,group,opts){ opts=opts||{}; lines.push({name:name,nominal:nom,curve:curve,group:group,wet:group==='wet'||!!opts.wet,nonSwitchable:!!opts.nonSwitchable}); }
    function room(label,count,wet){ count=Number(count)||0; for(var i=1;i<=count;i++){ var n=count>1?label+' '+i:label; add(n+' розетки','C16',wet?'wet':'power',{wet:wet}); add(n+' свет','C10','light'); } }
    room('Кухня',cfgN('kits'),false); room('Ванная',cfgN('baths'),true); room('Туалет',cfgN('toilets'),true); room('Комната',cfgN('rms'),false); room('Балкон',cfgN('bals'),false);
    if(chk('c-apron')) add('Фартук кухни','C16','power');
    if(chk('c-dish')) add('Посудомойка','C10','power');
    if(chk('c-washer')) add('Стиралка/сушилка','C10','wet',{wet:true});
    if(chk('c-towel')) add('Полотенцесушитель','C10','wet',{wet:true});
    for(var a=1;a<=cfgN('acs');a++) add('Кондиционер '+a,'C10','climate');
    for(var f=1;f<=cfgN('fls');f++) add('Тёплый пол '+f,'C10','climate');
    if(chk('c-fridge')) add('Холодильник, неотключаемая группа','C10','alwaysOn',{nonSwitchable:true});
    if(chk('c-neptun')) add('Нептун, неотключаемая группа','C10','alwaysOn',{nonSwitchable:true});
    if(chk('c-router')) add('Роутер, неотключаемая группа','C6','alwaysOn',{nonSwitchable:true});
    var hp=val('c-hob-power','none'); if(hp==='6') add('Плита до 6 кВт','C25',chk('cfg-heavy-separate')?'heavy':'power'); if(hp==='10') add('Плита до 10 кВт','C32',chk('cfg-heavy-separate')?'heavy':'power');
    var bp=val('c-boiler-power','none'); if(bp==='6') add('Бойлер до 6 кВт','C25','wet',{wet:true}); if(bp==='10') add('Бойлер до 10 кВт','C32','wet',{wet:true});
    return lines;
  }
  function addShieldToEstimate(items){
    // Use original addAuto if possible, because it also syncs totals and storage. Items are already aggregated by V19.
    try{ if(typeof addAuto==='function'){ addAuto(items,'shield'); return; } }catch(e){}
    try{ window.currentEstimate=(Array.isArray(window.currentEstimate)?window.currentEstimate:[]).filter(function(it){return it.tag!=='shield'&&it.tag!=='shield_info';}).concat(items); currentEstimate=window.currentEstimate; if(typeof renderMainTable==='function') renderMainTable(); }catch(e){}
  }
  window.epV19GenerateShield=function(){
    var bBox=val('cfg-brand-box','Tekfor'), bAuto=val('cfg-brand-auto','IEK'), sWall=val('cfg-shield-wall','Бетон'), ph=Number(val('cfg-phase','1'))||1, curve=val('cfg-auto-curve','C'), rcdType=val('cfg-rcd-type','A'), protectionType=val('cfg-protection-type','uzo_auto'), isMaster=chk('cfg-master');
    var lines=buildLines(curve);
    if(!lines.length){ toast('Добавь хотя бы одно помещение или линию'); return; }
    var groupNames={power:'Силовые линии',climate:'Климат',wet:'Влажные зоны',light:'Освещение',heavy:'Большая техника',alwaysOn:'Неотключаемые'};
    var groups=Array.from(new Set(lines.map(function(l){return l.group;}))).filter(Boolean);
    function groupAssign(g){ var a=lines.filter(function(l){return l.group===g;}).map(function(l){return l.name;}); return (g==='wet'?'Влажные зоны / защита 10 мА':(groupNames[g]||g))+(a.length?': '+a.join(', '):''); }
    var protect=[];
    if(protectionType==='main_dif_auto') protect.push({group:'main',kind:'Главный ДИФ',leak:30,assign:['Вводная групповая защита всего щита']});
    else groups.forEach(function(g){ protect.push({group:g,kind:(protectionType==='dif_auto'||(protectionType==='mixed'&&g==='wet'))?'ДИФ':'УЗО',leak:g==='wet'?10:30,assign:[groupAssign(g)]}); });

    var onePole=lines.length+(isMaster?1:0), twoPole=protect.length, relayMods=chk('cfg-uzm')?(ph===3?6:2):0, masterMods=isMaster?3:0;
    var extraModules=0; try{ (window.currentShieldExtras||[]).forEach(function(ex){ extraModules += (Number(ex.modules||1)*Number(ex.q||1)); }); }catch(e){}
    var totalModules=Math.ceil(onePole+twoPole*2+relayMods+masterMods+extraModules+(ph===3?3:2));
    var boxSize=[6,12,24,36,48,60,72].find(function(s){return s>=totalModules;})||72;
    var items=[];
    items.push(makeItem('Щит '+(sWall==='Накладной'?'накладной':'встраиваемый')+' '+bBox+' '+boxSize+'М',1,bBox==='ABB'?6510:2660,'mat',{c:'Щитовое',g:'Корпуса',sc:sWall==='Накладной'?'Накладной':'Встраиваемый',kind:'shield_box',modules:boxSize},'Корпус щита'));
    items.push(makeItem('Вводной автомат '+(ph===3?'4P':'2P')+' '+brandRu(bAuto)+' ВА47-29',1,bAuto==='ABB'?3500:1800,'mat',{c:'Автоматика',g:'Автоматы',sc:'Автоматы',kind:'input_breaker'},'Вводной аппарат щита'));
    // Protection devices: aggregate equal UZO/DIF by name, but keep each group assignment.
    var pMap={};
    protect.forEach(function(pd){ var nm=rcdName(pd.kind,pd.leak,bAuto,rcdType); var key=nm+'|'+rcdPrice(pd.kind,pd.leak,bAuto); if(!pMap[key]) pMap[key]={n:nm,q:0,p:rcdPrice(pd.kind,pd.leak,bAuto),kind:pd.kind,leak:pd.leak,assign:[]}; pMap[key].q++; pMap[key].assign=pMap[key].assign.concat(pd.assign||[]); });
    Object.keys(pMap).forEach(function(k){ var p=pMap[k]; items.push(makeItem(p.n,p.q,p.p,'mat',{c:'Автоматика',g:(p.kind==='УЗО'?'УЗО':'ДИФы'),sc:(p.kind==='УЗО'?'УЗО':'ДИФы'),kind:(p.kind==='УЗО'?'uzo':'dif'),leakage:p.leak},p.assign)); });
    // Automatics: the important fixed logic. One row per nominal, quantity = number of real lines.
    groupLines(lines).forEach(function(g){ items.push(makeItem(autoName(g.nominal,bAuto,curve),g.lines.length,autoPrice(g.nominal,bAuto),'mat',{c:'Автоматика',g:'Автоматы',sc:'Автоматы',kind:'automatic',nominal:g.nominal,curve:curve},g.lines)); });
    if(chk('cfg-uzm')) items.push(makeItem('Реле напряжения '+brandRu(bAuto),ph===3?3:1,4500,'mat',{c:'Автоматика',g:'УЗМ / реле напряжения',sc:'УЗМ / реле напряжения'},'Защита от перенапряжения'));
    if(isMaster){ var light=lines.filter(function(l){return l.group==='light';}).map(function(l){return l.name;}); items.push(makeItem('Контактор C40 '+brandRu(bAuto)+' — мастер-кнопка света',1,2200,'mat',{c:'Автоматика',g:'Контакторы',sc:'Контакторы'},'Мастер-кнопка только на свет: '+(light.join(', ')||'световые группы'))); items.push(makeItem(autoName('C40',bAuto,curve),1,autoPrice('C40',bAuto),'mat',{c:'Автоматика',g:'Автоматы',sc:'Автоматы',kind:'automatic',nominal:'C40',curve:curve},'Байпас мастер-кнопки света')); }
    try{ (window.currentShieldExtras||[]).forEach(function(ex){ items.push(makeItem(ex.n,ex.q||1,ex.p||0,'mat',{c:'Автоматика',g:'Другие аппараты',sc:'Другие аппараты'},'Дополнительный аппарат защиты')); }); window.currentShieldExtras=[]; }catch(e){}
    var comb1P=Math.ceil(onePole/12), comb2P=Math.ceil(twoPole/6), rows=Math.ceil(boxSize/12), pugvSize=appPrice('shieldPugvSize',6), pugvMeters=Math.max(4,Math.ceil(totalModules*.4)), nshviPacks=Math.max(1,Math.ceil(boxSize/48));
    if(comb1P>0) items.push(makeItem('Гребёнка 1P 25см',comb1P,250,'mat',{c:'Щитовое',g:'Гребёнки',sc:'Гребёнки'},'Питание однополюсных автоматов: '+onePole+' шт.'));
    if(comb2P>0) items.push(makeItem('Гребёнка 2P 25см',comb2P,450,'mat',{c:'Щитовое',g:'Гребёнки',sc:'Гребёнки'},'Питание УЗО/ДИФ: '+twoPole+' шт.'));
    if(twoPole>0) items.push(makeItem('Шина N ноль на DIN-изол (ИЭК)',twoPole,285,'mat',{c:'Щитовое',g:'Шины N/PE',sc:'Шины N/PE'},'N-шинки по количеству УЗО/ДИФ'));
    items.push(makeItem('PE-шина на '+appPrice('shieldPeBusContacts',26)+' контактов',1,770,'mat',{c:'Щитовое',g:'Шины N/PE',sc:'Шины N/PE'},'Защитное заземление PE'));
    items.push(makeItem('DIN-рейка / комплект DIN для щита',rows,180,'mat',{c:'Щитовое',g:'DIN-рейки / ограничители',sc:'DIN-рейки / ограничители'},'Крепление аппаратов на DIN-рейке'));
    items.push(makeItem('Ограничитель на DIN-рейку',rows*2,35,'mat',{c:'Щитовое',g:'DIN-рейки / ограничители',sc:'DIN-рейки / ограничители'},'Фиксация аппаратов на DIN-рейке'));
    items.push(makeItem('Провод ПуГВ 1×'+pugvSize,pugvMeters,85,'mat',{c:'Щитовое',g:'Провода',sc:'Провода',unit:'м.п.'},'Внутренняя разводка щита'));
    items.push(makeItem('НШВИ 1×'+pugvSize+', упак. 100 шт',nshviPacks,225,'mat',{c:'Щитовое',g:'Наконечники',sc:'Наконечники'},'Опрессовка проводов щита'));
    items.push(makeItem('Маркировка линий / бирки',lines.length,15,'mat',{c:'Щитовое',g:'Маркировка',sc:'Маркировка'},'Маркировка линий: '+lines.map(function(l){return l.name;}).join(', ')));
    if(sWall!=='Накладной'){ items.push(makeItem('Ниша щита '+boxSize+'М ('+sWall+')',boxSize,appPrice('shieldNichePerModule',400),'work',{c:'Штробление и резка',g:'Ниши щита',sc:'Ниши щита',unit:'мод.'},'Ниша под корпус щита')); items.push(makeItem('Штроба 100×50, под трассу кабелей ('+sWall+')',2,appPrice('shieldInputGroovePrice',1500),'work',{c:'Штробление и резка',g:'Штроба 100×50 под трассу кабелей',sc:'Штроба 100×50 под трассу кабелей',unit:'м.п.'},'Штроба под ввод/трассу кабелей')); }
    items.push(makeItem('Сборка щита',totalModules,appPrice('priceShield',500),'work',{c:'Щитовое',g:'Сборка щита',sc:'Сборка щита',unit:'мод.'},'Сборка модульного щита'));
    items.push(makeItem('Установка щита',1,appPrice('shieldInstallPrice',2500),'work',{c:'Щитовое',g:'Монтаж щита',sc:'Монтаж щита'},'Монтаж корпуса щита'));
    items.push(makeItem('Подключение вводного кабеля',1,appPrice('shieldInputConnectPrice',1500),'work',{c:'Щитовое',g:'Монтаж щита',sc:'Монтаж щита'},'Подключение ввода'));
    items.push(makeItem('Прозвонка / проверка линий',lines.length,appPrice('shieldTestLinePrice',150),'work',{c:'Щитовое',g:'Проверка линий',sc:'Проверка линий',unit:'линия'},'Проверка каждой линии'));
    items.push(makeItem('Маркировка линий',lines.length,appPrice('shieldMarkLinePrice',100),'work',{c:'Щитовое',g:'Маркировка линий',sc:'Маркировка линий',unit:'линия'},'Маркировка каждой линии'));
    if(chk('cfg-scheme')) items.push(makeItem('Составление однолинейной схемы щита',1,appPrice('shieldSchemePrice',4000),'work',{c:'Щитовое',g:'Документация',sc:'Документация'},'Однолинейная схема'));
    items.push(makeItem('ℹ️ Щит: линий '+lines.length+'; занято '+totalModules+' мод.; корпус '+boxSize+'М; свободно '+Math.max(0,boxSize-totalModules)+' мод.',1,0,'work',{tag:'shield_info'},'Информация по щиту'));
    addShieldToEstimate(items);
    try{ if(typeof closeModal==='function') closeModal('configModal'); }catch(e){}
    try{ if(window.epV18SetStatus) window.epV18SetStatus('ok','V19 активна'); }catch(e){}
    toast('✅ Щит сгенерирован V19: автоматы сгруппированы по номиналу');
  };
  function getAssigns(it){ var out=[]; function add(v){ v=String(v||'').trim(); if(v && !/позиция щита|назначение не указано/i.test(v) && out.indexOf(v)<0) out.push(v); } if(!it) return out; if(Array.isArray(it.epAssignments)) it.epAssignments.forEach(add); if(Array.isArray(it.epMergedDetails)) it.epMergedDetails.forEach(add); add(it.epAssignment); if(it.dbMeta) add(it.dbMeta.assignment); return out; }
  function isDevice(it){ var n=String((it&&it.n)||''); return it && it.type==='mat' && /C\d{1,3}|[ABCDАВСД]\d{1,3}|автомат|узо|диф|реле|контактор|вводной/i.test(n); }
  window.epV19ShowDetails=function(){
    var arr=[]; try{ arr=Array.isArray(currentEstimate)?currentEstimate:(window.currentEstimate||[]); }catch(e){ arr=window.currentEstimate||[]; }
    var rows=arr.filter(function(it){ return (it.tag==='shield'||it.tag==='shield_info') && isDevice(it); });
    var html='<div class="pdf-header"><h1>ДЕТАЛИЗАЦИЯ ЩИТА</h1><p>Заказчик: <b>'+esc((window.cust&&cust.name)||'')+'</b> | Объект: '+esc((window.cust&&cust.addr)||'')+'</p></div>'+
      '<div style="margin:8px 0 14px;padding:8px 10px;border-radius:12px;background:#ecfdf5;color:#047857;font-weight:900;font-size:12px;">Проверка: детализация сформирована V19, автоматы сгруппированы по количеству линий</div>'+
      '<table class="pdf-table"><thead><tr><th>Что отвечает / линия</th><th>Аппарат</th><th>Назначение</th></tr></thead><tbody>';
    rows.forEach(function(it){ var as=getAssigns(it); var name=esc(it.n); var q=Number(it.q)||1; var left=as.length?as.map(esc).join('<br>'):'Позиция щита'; var purp=''; if(/узо|диф/i.test(it.n)) purp='групповая защита'+(q>1?' × '+q:''); else if(/контактор/i.test(it.n)) purp='мастер-кнопка света'; else if(/автомат|C\d|[ABCDАВСД]\d/i.test(it.n)) purp=(q>1?'отдельные автоматы линий: '+q+' шт.':'отдельный автомат линии'); else purp='аппарат щита'; html+='<tr><td style="font-weight:800;color:#5b54b7;">'+left+'</td><td>'+name+(q>1?' <b>× '+q+'</b>':'')+'</td><td>'+esc(purp)+'</td></tr>'; });
    html+='</tbody></table><button class="btn-vendor" style="margin-top:20px;" onclick="closeModal(\'previewModal\')">Закрыть</button>';
    var body=$('preview-body'); if(body) body.innerHTML=html; try{ openModal('previewModal'); }catch(e){}
  };
  // V18 click listener calls these names. Replace them in place so old capture listener starts using V19.
  window.epV18GenerateShield=window.epV19GenerateShield;
  window.epV18ShowDetails=window.epV19ShowDetails;
  var oldShowPreview=window.showPreview;
  window.showPreview=function(mode){ if(mode==='details') return window.epV19ShowDetails(); return oldShowPreview?oldShowPreview.apply(this,arguments):undefined; };
  try{ showPreview=window.showPreview; }catch(e){}
  function patchButtons(){ try{ Array.prototype.forEach.call(document.querySelectorAll('button'),function(b){ var t=b.textContent||''; if(t.indexOf('Сгенерировать щит')>=0) b.onclick=window.epV19GenerateShield; if(t.indexOf('Детализация')>=0) b.onclick=window.epV19ShowDetails; }); }catch(e){} }
  function boot(){ patchButtons(); try{ if(window.epV18SetStatus) window.epV18SetStatus('ok','V19 активна'); }catch(e){} toast(BUILD+' загружена'); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else setTimeout(boot,80);
})();


/* =========================================================
 * SOURCE: block-27.js
 * AUTO TARGET: 02-shield-configurator.js
 * SCORE: 222
 * HITS: shield, щит, cfg, automatic, автомат, УЗО, ДИФ, C16, C10, C6, C25, C32, C40, generateCascadePanel, epV20GenerateShield, epV19GenerateShield, epV18GenerateShield, контактор, rcd, dif, breaker, греб, шина, ПуГВ, НШВИ
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 27
 * Original HTML lines: 10237-10395
 */

/* EP V20: restore Vitaliy shield logic. Reads counters from DOM, not window.cfg. */
(function(){
  'use strict';
  var BUILD='V20 SHIELD LOGIC REAL COUNTERS 2026-05-15';
  function $(id){ return document.getElementById(id); }
  function text(v){ return String(v==null?'':v); }
  function clean(v){ return text(v).replace(/\s+/g,' ').trim(); }
  function esc(v){ return text(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function toast(msg){ try{ if(typeof showToast==='function') showToast(msg); else console.log(msg); }catch(e){ console.log(msg); } }
  function money(v){ var n=Number(text(v).replace(',','.').replace(/[^0-9.\-]/g,'')); return isFinite(n)?n:0; }
  function val(id,def){ var e=$(id); return e ? (e.value || def || '') : (def || ''); }
  function chk(id){ var e=$(id); return !!(e && e.checked); }
  function count(k,def){
    var e=$('v-'+k); var n=NaN;
    if(e) n=Number(clean(e.textContent));
    if(!isFinite(n)) { try{ n=Number(cfg && cfg[k]); }catch(_e){} }
    if(!isFinite(n)) n=Number(def)||0;
    return Math.max(0,n||0);
  }
  function appPrice(k,def){ try{ var n=Number(window.appLogic && appLogic[k]); return n||def; }catch(e){ return def; } }
  function brandRu(b){ var s=text(b||'IEK').toUpperCase(); if(s.indexOf('IEK')>=0||s.indexOf('ИЭК')>=0) return 'ИЭК'; if(s.indexOf('ABB')>=0) return 'ABB'; if(s.indexOf('SCHNEIDER')>=0) return 'Schneider'; if(s.indexOf('LEGRAND')>=0) return 'Legrand'; if(s.indexOf('EKF')>=0) return 'EKF'; return clean(b)||'ИЭК'; }
  function norm(v){ return clean(v).toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x'); }
  function activeMatDb(){
    var out=[];
    try{ if(Array.isArray(window.matDB)) out=out.concat(window.matDB); }catch(e){}
    try{ if(Array.isArray(window.EP_MY_MAT)) out=out.concat(window.EP_MY_MAT); }catch(e){}
    try{ if(Array.isArray(window.EP_GLOBAL_MAT)) out=out.concat(window.EP_GLOBAL_MAT); }catch(e){}
    try{ var c=JSON.parse(localStorage.getItem('ep_global_cache_force_v1')||'{}'); if(Array.isArray(c.matDB)) out=out.concat(c.matDB); }catch(e){}
    return out;
  }
  function curveNom(nom,curve){ var amp=text(nom).replace(/[^0-9]/g,'') || '16'; var c=text(curve || text(nom).charAt(0) || 'C').toUpperCase().charAt(0); if(!/[ABCDАВСД]/.test(c)) c='C'; return c+amp; }
  function dbFindAuto(nom,brand){
    var amp=text(nom).replace(/[^0-9]/g,''); var br=norm(brand||''); var cn=norm(curveNom(nom));
    return activeMatDb().find(function(it){ var n=norm(it && it.n); if(!n) return false; var isAuto=/автомат|выключатель автоматический|ва47|sh201|a9f|a472|а472/.test(n); var hasAmp=n.indexOf(amp)>=0 || n.indexOf(amp+'a')>=0 || n.indexOf(amp+' a')>=0; var hasCurve=n.indexOf(cn)>=0 || new RegExp('\\b'+amp+'\\s*a?\\b').test(n); var hasBrand=!br || n.indexOf(br)>=0 || (br==='iek' && n.indexOf('иэк')>=0) || (br==='иэк' && n.indexOf('iek')>=0); return isAuto && hasAmp && hasCurve && hasBrand; }) || null;
  }
  function dbFindRcd(kind,leak,brand){
    var k=norm(kind==='ДИФ'||kind==='Главный ДИФ'?'диф':'узо'), br=norm(brand||''), l=text(leak);
    return activeMatDb().find(function(it){ var n=norm(it && it.n); if(!n) return false; var okKind=n.indexOf(k)>=0; var okLeak=n.indexOf(l)>=0; var okBrand=!br || n.indexOf(br)>=0 || (br==='iek'&&n.indexOf('иэк')>=0) || (br==='иэк'&&n.indexOf('iek')>=0); return okKind && okLeak && okBrand; }) || null;
  }
  function modelFromDbName(n){ var m=text(n).match(/\(([^)]+)\)/); return m ? clean(m[1]).replace(/^IEK\s*/i,'ИЭК ') : ''; }
  function autoName(nom,brand,curve){ var cn=curveNom(nom,curve), br=brandRu(brand); var hit=dbFindAuto(cn,brand); var model=hit?modelFromDbName(hit.n):''; if(model) return cn+' 1P '+model; if(br==='ABB') return cn+' 1P ABB SH201'; if(br==='Schneider') return cn+' 1P Schneider'; if(br==='Legrand') return cn+' 1P Legrand'; if(br==='EKF') return cn+' 1P EKF'; return cn+' 1P ИЭК ВА47-29'; }
  function autoPrice(nom,brand){ var hit=dbFindAuto(nom,brand); if(hit && Number(hit.p)>0) return Number(hit.p); var amp=Number(text(nom).replace(/[^0-9]/g,''))||16; if(text(brand).toUpperCase().indexOf('ABB')>=0) return amp>=25?600:265; return amp>=40?380:(amp<=10?172:150); }
  function rcdName(kind,leak,brand,rcdType){ var k=(kind==='ДИФ'||kind==='Главный ДИФ')?kind:'УЗО'; var hit=dbFindRcd(k,leak,brand); var br=brandRu(brand); var model=hit?modelFromDbName(hit.n):''; if(model) return k+' 2P 40A '+leak+'мА тип '+(rcdType||'A')+' '+model; if(br==='ABB') return k+' 2P 40A '+leak+'мА тип '+(rcdType||'A')+' ABB'; return k+' 2P 40A '+leak+'мА тип '+(rcdType||'A')+' '+br+(br==='ИЭК'?' ВД1-63':''); }
  function rcdPrice(kind,leak,brand){ var hit=dbFindRcd(kind,leak,brand); if(hit && Number(hit.p)>0) return Number(hit.p); return (kind==='ДИФ'||kind==='Главный ДИФ') ? 3600 : (Number(leak)===10?3600:1195); }
  function item(n,q,p,type,meta,assigns){
    var a=[]; if(Array.isArray(assigns)) a=assigns.map(clean).filter(Boolean); else if(assigns) a=[clean(assigns)].filter(Boolean);
    var it=Object.assign({n:n,q:Number(q)||1,p:money(p),u:(meta&&meta.unit)||'шт',type:type||'mat',tag:'shield'},meta||{});
    if(a.length){ it.epAssignment=a[0]; it.epAssignments=a.slice(); it.epMergedDetails=a.slice(); it.assignment=a[0]; it.dbMeta=Object.assign({},it.dbMeta||{}, {assignment:a[0]}); }
    return it;
  }
  function addUniqueAssign(rec,arr){
    rec.epAssignments=rec.epAssignments||[]; rec.epMergedDetails=rec.epMergedDetails||[];
    (arr||[]).forEach(function(v){ v=clean(v); if(v && !/позиция щита|назначение не указано/i.test(v) && rec.epAssignments.indexOf(v)<0){ rec.epAssignments.push(v); rec.epMergedDetails.push(v); } });
    rec.epAssignment=rec.epAssignments[0]||rec.epAssignment||''; rec.dbMeta=Object.assign({},rec.dbMeta||{}, {assignment:rec.epAssignment});
  }
  function directAdd(items){
    var map={}, out=[];
    (items||[]).forEach(function(src){ if(!src||!src.n) return; var it=Object.assign({},src,{tag:src.tag||'shield'}); var k=[it.tag,it.type,it.n,it.p,it.u].join('|'); var rec=map[k]; if(!rec){ rec=Object.assign({},it,{q:0,epAssignments:[],epMergedDetails:[]}); map[k]=rec; out.push(rec); } rec.q += Number(it.q)||1; addUniqueAssign(rec,[].concat(it.epAssignments||[],it.epMergedDetails||[],it.epAssignment||[])); });
    try{ currentEstimate=(Array.isArray(currentEstimate)?currentEstimate:[]).filter(function(x){ return x && x.tag!=='shield' && x.tag!=='shield_info'; }).concat(out); window.currentEstimate=currentEstimate; }catch(e){ window.currentEstimate=(window.currentEstimate||[]).filter(function(x){ return x && x.tag!=='shield' && x.tag!=='shield_info'; }).concat(out); }
    try{ if(typeof renderMainTable==='function') renderMainTable(); else if(typeof renderMainDirect==='function') renderMainDirect(); }catch(e){}
    try{ if(typeof syncDraft==='function') syncDraft(); }catch(e){}
  }
  function buildLines(curve){
    var lines=[];
    function add(name,nom,group,opts){ opts=opts||{}; lines.push({name:name,nominal:curveNom(nom,curve),curve:curve,group:group,wet:group==='wet'||!!opts.wet,nonSwitchable:!!opts.nonSwitchable}); }
    function room(label,c,wet){ c=Number(c)||0; for(var i=1;i<=c;i++){ var n=c>1?label+' '+i:label; add(n+' розетки','C16',wet?'wet':'power',{wet:wet}); add(n+' свет','C10','light'); } }
    room('Кухня',count('kits',1),false);
    room('Ванная',count('baths',1),true);
    room('Туалет',count('toilets',1),true);
    room('Комната',count('rms',1),false);
    room('Балкон',count('bals',0),false);
    if(chk('c-apron')) add('Фартук кухни','C16','power');
    if(chk('c-dish')) add('Посудомойка','C10','power');
    if(chk('c-washer')) add('Стиралка/сушилка','C10','wet',{wet:true});
    if(chk('c-towel')) add('Полотенцесушитель','C10','wet',{wet:true});
    for(var a=1;a<=count('acs',0);a++) add('Кондиционер '+a,'C10','climate');
    for(var f=1;f<=count('fls',0);f++) add('Тёплый пол '+f,'C10','climate');
    if(chk('c-fridge')) add('Холодильник, неотключаемая группа','C10','alwaysOn',{nonSwitchable:true});
    if(chk('c-neptun')) add('Нептун, неотключаемая группа','C10','alwaysOn',{nonSwitchable:true});
    if(chk('c-router')) add('Роутер, неотключаемая группа','C6','alwaysOn',{nonSwitchable:true});
    var hob=val('c-hob-power','none'); if(hob==='6') add('Плита до 6 кВт','C25',chk('cfg-heavy-separate')?'heavy':'power'); if(hob==='10') add('Плита до 10 кВт','C32',chk('cfg-heavy-separate')?'heavy':'power');
    var boil=val('c-boiler-power','none'); if(boil==='6') add('Бойлер до 6 кВт','C25','wet',{wet:true}); if(boil==='10') add('Бойлер до 10 кВт','C32','wet',{wet:true});
    return lines;
  }
  function groupNominals(lines){ var m={}; lines.forEach(function(l){ var k=l.nominal; if(!m[k]) m[k]={nominal:k,assign:[]}; m[k].assign.push(l.name); }); return Object.keys(m).sort(function(a,b){ var na=Number(a.replace(/\D/g,'')), nb=Number(b.replace(/\D/g,'')); return nb-na; }).map(function(k){return m[k];}); }
  function presentGroups(lines){ var seen={},out=[]; lines.forEach(function(l){ if(!seen[l.group]){ seen[l.group]=1; out.push(l.group); } }); return out; }
  window.epV20GenerateShield=function(){
    var bBox=val('cfg-brand-box','Tekfor'), bAuto=val('cfg-brand-auto','IEK'), sWall=val('cfg-shield-wall','Бетон'), ph=Number(val('cfg-phase','1'))||1, curve=val('cfg-auto-curve','C'), rcdType=val('cfg-rcd-type','A'), protectionType=val('cfg-protection-type','uzo_auto'), isMaster=chk('cfg-master');
    var lines=buildLines(curve);
    if(!lines.length){ toast('Добавь хотя бы одно помещение или линию'); return; }
    var groupNames={power:'Силовые линии',climate:'Климат',wet:'Влажные зоны',light:'Освещение',heavy:'Большая техника',alwaysOn:'Неотключаемые'};
    function groupAssign(g){ var arr=lines.filter(function(l){return l.group===g;}).map(function(l){return l.name;}); return (g==='wet'?'Влажные зоны / защита 10 мА':(groupNames[g]||g))+(arr.length?': '+arr.join(', '):''); }
    var prot=[];
    if(protectionType==='main_dif_auto') prot.push({group:'main',kind:'Главный ДИФ',leak:30,assign:['Вводная групповая защита всего щита']});
    else presentGroups(lines).forEach(function(g){ prot.push({group:g,kind:(protectionType==='dif_auto'||(protectionType==='mixed'&&g==='wet'))?'ДИФ':'УЗО',leak:g==='wet'?10:30,assign:[groupAssign(g)]}); });
    var items=[];
    var onePole=lines.length+(isMaster?1:0), twoPole=prot.length, relayMods=chk('cfg-uzm')?(ph===3?6:2):0, masterMods=isMaster?3:0;
    var extraMods=0; try{ (window.currentShieldExtras||[]).forEach(function(ex){ extraMods += (Number(ex.modules||1)*Number(ex.q||1)); }); }catch(e){}
    var totalModules=Math.ceil(onePole+twoPole*2+relayMods+masterMods+extraMods+(ph===3?4:2));
    var boxSize=[6,12,24,36,48,60,72].find(function(s){return s>=totalModules;})||72;
    items.push(item('Щит '+(sWall==='Накладной'?'накладной':'встраиваемый')+' '+bBox+' '+boxSize+'М',1,bBox==='ABB'?6510:2660,'mat',{c:'Щитовое',g:'Корпуса',sc:sWall==='Накладной'?'Накладной':'Встраиваемый',kind:'shield_box',modules:boxSize},'Корпус щита'));
    items.push(item('Вводной автомат '+(ph===3?'4P':'2P')+' '+brandRu(bAuto)+' ВА47-29',1,bAuto==='ABB'?3500:1800,'mat',{c:'Автоматика',g:'Автоматы',sc:'Автоматы',kind:'input_breaker'},'Вводной аппарат щита'));
    var pMap={}; prot.forEach(function(p){ var nm=rcdName(p.kind,p.leak,bAuto,rcdType); var price=rcdPrice(p.kind,p.leak,bAuto); var key=nm+'|'+price; if(!pMap[key]) pMap[key]={n:nm,q:0,p:price,kind:p.kind,leak:p.leak,assign:[]}; pMap[key].q++; pMap[key].assign=pMap[key].assign.concat(p.assign||[]); });
    Object.keys(pMap).forEach(function(k){ var p=pMap[k]; items.push(item(p.n,p.q,p.p,'mat',{c:'Автоматика',g:p.kind==='УЗО'?'УЗО':'ДИФы',sc:p.kind==='УЗО'?'УЗО':'ДИФы',kind:p.kind==='УЗО'?'uzo':'dif',leakage:p.leak},p.assign)); });
    groupNominals(lines).forEach(function(g){ items.push(item(autoName(g.nominal,bAuto,curve),g.assign.length,autoPrice(g.nominal,bAuto),'mat',{c:'Автоматика',g:'Автоматы',sc:'Автоматы',kind:'automatic',nominal:g.nominal,curve:curve},g.assign)); });
    if(chk('cfg-uzm')) items.push(item('Реле напряжения '+brandRu(bAuto),ph===3?3:1,4500,'mat',{c:'Автоматика',g:'УЗМ / реле напряжения',sc:'УЗМ / реле напряжения'},'Защита от перенапряжения'));
    if(isMaster){ var light=lines.filter(function(l){return l.group==='light';}).map(function(l){return l.name;}); items.push(item('Контактор C40 '+brandRu(bAuto)+' — мастер-кнопка света',1,2200,'mat',{c:'Автоматика',g:'Контакторы',sc:'Контакторы'},'Мастер-кнопка только на свет: '+(light.join(', ')||'световые группы'))); items.push(item(autoName('C40',bAuto,curve),1,autoPrice('C40',bAuto),'mat',{c:'Автоматика',g:'Автоматы',sc:'Автоматы',kind:'automatic',nominal:'C40',curve:curve},'Байпас мастер-кнопки света')); }
    try{ (window.currentShieldExtras||[]).forEach(function(ex){ items.push(item(ex.n,ex.q||1,ex.p||0,'mat',{c:'Автоматика',g:'Другие аппараты',sc:'Другие аппараты'},'Дополнительный аппарат защиты')); }); window.currentShieldExtras=[]; }catch(e){}
    var comb1P=Math.ceil(onePole/12), comb2P=Math.ceil(twoPole/6), rows=Math.ceil(boxSize/12), pugvSize=appPrice('shieldPugvSize',6), pugvMeters=Math.max(4,Math.ceil(totalModules*0.4)), nshviPacks=Math.max(1,Math.ceil(boxSize/48));
    if(comb1P>0) items.push(item('Гребёнка 1P 25см',comb1P,250,'mat',{c:'Щитовое',g:'Гребёнки',sc:'Гребёнки'},'Питание однополюсных автоматов: '+onePole+' шт.'));
    if(comb2P>0) items.push(item('Гребёнка 2P 25см',comb2P,450,'mat',{c:'Щитовое',g:'Гребёнки',sc:'Гребёнки'},'Питание УЗО/ДИФ: '+twoPole+' шт.'));
    if(twoPole>0) items.push(item('Шина N ноль на DIN-изол (ИЭК)',twoPole,285,'mat',{c:'Щитовое',g:'Шины N/PE',sc:'Шины N/PE'},'N-шинки по количеству УЗО/ДИФ'));
    items.push(item('PE-шина на '+appPrice('shieldPeBusContacts',26)+' контактов',1,770,'mat',{c:'Щитовое',g:'Шины N/PE',sc:'Шины N/PE'},'Защитное заземление PE'));
    items.push(item('DIN-рейка / комплект DIN для щита',rows,180,'mat',{c:'Щитовое',g:'DIN-рейки / ограничители',sc:'DIN-рейки / ограничители'},'Крепление аппаратов на DIN-рейке'));
    items.push(item('Ограничитель на DIN-рейку',rows*2,35,'mat',{c:'Щитовое',g:'DIN-рейки / ограничители',sc:'DIN-рейки / ограничители'},'Фиксация аппаратов на DIN-рейке'));
    items.push(item('Провод ПуГВ 1×'+pugvSize,pugvMeters,85,'mat',{c:'Щитовое',g:'Провода',sc:'Провода',unit:'м.п.'},'Внутренняя разводка щита'));
    items.push(item('НШВИ 1×'+pugvSize+', упак. 100 шт',nshviPacks,225,'mat',{c:'Щитовое',g:'Наконечники',sc:'Наконечники'},'Опрессовка проводов щита'));
    items.push(item('Маркировка линий / бирки',lines.length,15,'mat',{c:'Щитовое',g:'Маркировка',sc:'Маркировка'},'Маркировка линий: '+lines.map(function(l){return l.name;}).join(', ')));
    if(chk('cfg-cable-glands')) items.push(item('Кабельные вводы / сальники',1,250,'mat',{c:'Щитовое',g:'Кабельные вводы',sc:'Кабельные вводы'},'Ввод кабелей в щит'));
    if(sWall!=='Накладной'){ items.push(item('Ниша щита '+boxSize+'М ('+sWall+')',boxSize,appPrice('shieldNichePerModule',400),'work',{c:'Штробление и резка',g:'Ниши щита',sc:'Ниши щита',unit:'мод.'},'Ниша под корпус щита')); items.push(item('Штроба 100×50, под трассу кабелей ('+sWall+')',2,appPrice('shieldInputGroovePrice',1500),'work',{c:'Штробление и резка',g:'Штроба 100×50 под трассу кабелей',sc:'Штроба 100×50 под трассу кабелей',unit:'м.п.'},'Штроба под ввод/трассу кабелей')); }
    items.push(item('Сборка щита',totalModules,appPrice('priceShield',500),'work',{c:'Щитовое',g:'Сборка щита',sc:'Сборка щита',unit:'мод.'},'Сборка модульного щита'));
    items.push(item('Установка щита',1,appPrice('shieldInstallPrice',2500),'work',{c:'Щитовое',g:'Монтаж щита',sc:'Монтаж щита'},'Монтаж корпуса щита'));
    items.push(item('Подключение вводного кабеля',1,appPrice('shieldInputConnectPrice',1500),'work',{c:'Щитовое',g:'Монтаж щита',sc:'Монтаж щита'},'Подключение ввода'));
    items.push(item('Прозвонка / проверка линий',lines.length,appPrice('shieldTestLinePrice',150),'work',{c:'Щитовое',g:'Проверка линий',sc:'Проверка линий',unit:'линия'},'Проверка каждой линии'));
    items.push(item('Маркировка линий',lines.length,appPrice('shieldMarkLinePrice',100),'work',{c:'Щитовое',g:'Маркировка линий',sc:'Маркировка линий',unit:'линия'},'Маркировка каждой линии'));
    if(chk('cfg-scheme')) items.push(item('Составление однолинейной схемы щита',1,appPrice('shieldSchemePrice',4000),'work',{c:'Щитовое',g:'Документация',sc:'Документация'},'Однолинейная схема'));
    items.push(item('ℹ️ Щит: линий '+lines.length+'; занято '+totalModules+' мод.; корпус '+boxSize+'М; свободно '+Math.max(0,boxSize-totalModules)+' мод.',1,0,'work',{tag:'shield_info'},'Информация по щиту'));
    directAdd(items);
    try{ if(typeof closeModal==='function') closeModal('configModal'); }catch(e){}
    try{ if(window.epV18SetStatus) window.epV18SetStatus('ok','V20 активна'); }catch(e){}
    toast('✅ Щит сгенерирован V20 по твоей логике: C16/C10 считаются от помещений и отдельных линий');
  };
  function getAssigns(it){ var out=[]; function add(v){ v=clean(v); if(v && !/позиция щита|назначение не указано/i.test(v) && out.indexOf(v)<0) out.push(v); } if(it){ (it.epAssignments||[]).forEach(add); (it.epMergedDetails||[]).forEach(add); add(it.epAssignment); if(it.dbMeta) add(it.dbMeta.assignment); } return out; }
  function isDevice(it){ var n=text(it&&it.n); return it && it.type==='mat' && /C\d{1,3}|[ABCDАВСД]\d{1,3}|автомат|узо|диф|реле|контактор|вводной/i.test(n); }
  window.epV20ShowDetails=function(){
    var arr=[]; try{ arr=Array.isArray(currentEstimate)?currentEstimate:(window.currentEstimate||[]); }catch(e){ arr=window.currentEstimate||[]; }
    var rows=arr.filter(function(it){ return (it.tag==='shield'||it.tag==='shield_info') && isDevice(it); });
    var html='<div class="pdf-header"><h1>ДЕТАЛИЗАЦИЯ ЩИТА</h1><p>Заказчик: <b>'+esc((window.cust&&cust.name)||'')+'</b> | Объект: '+esc((window.cust&&cust.addr)||'')+'</p></div>'+
      '<div style="margin:8px 0 14px;padding:8px 10px;border-radius:12px;background:#ecfdf5;color:#047857;font-weight:900;font-size:12px;">Проверка: детализация сформирована V20. Помещения читаются с экрана, не из window.cfg.</div>'+
      '<table class="pdf-table"><thead><tr><th>Что отвечает / линия</th><th>Аппарат</th><th>Назначение</th></tr></thead><tbody>';
    if(!rows.length) html+='<tr><td colspan="3" style="text-align:center;color:#64748b;font-weight:900;">Щит ещё не сгенерирован</td></tr>';
    rows.forEach(function(it){ var as=getAssigns(it); var q=Number(it.q)||1; var purp='аппарат щита'; if(/узо|диф/i.test(it.n)) purp='групповая защита'+(q>1?' × '+q:''); else if(/контактор/i.test(it.n)) purp='мастер-кнопка света'; else if(/вводн/i.test(it.n)) purp='вводной аппарат'; else if(/автомат|C\d|[ABCDАВСД]\d/i.test(it.n)) purp=q>1?'отдельные автоматы линий: '+q+' шт.':'отдельный автомат линии'; html+='<tr><td style="font-weight:800;color:#5b54b7;">'+(as.length?as.map(esc).join('<br>'):'Позиция щита')+'</td><td>'+esc(it.n)+(q>1?' <b>× '+q+'</b>':'')+'</td><td>'+esc(purp)+'</td></tr>'; });
    html+='</tbody></table><button class="btn-vendor" style="margin-top:20px;" onclick="closeModal(\'previewModal\')">Закрыть</button>';
    var body=$('preview-body')||$('p-cont'); if(body) body.innerHTML=html; try{ openModal('previewModal'); }catch(e){}
  };
  function patchButtons(){ try{ Array.prototype.forEach.call(document.querySelectorAll('button'),function(b){ var t=b.textContent||''; if(t.indexOf('Сгенерировать щит')>=0){ b.onclick=window.epV20GenerateShield; } if(t.indexOf('Детализация')>=0){ b.onclick=window.epV20ShowDetails; } }); }catch(e){} }
  window.epV18GenerateShield=window.epV20GenerateShield;
  window.epV19GenerateShield=window.epV20GenerateShield;
  window.epV18ShowDetails=window.epV20ShowDetails;
  window.epV19ShowDetails=window.epV20ShowDetails;
  var oldShowPreview=window.showPreview;
  window.showPreview=function(mode){ if(mode==='details') return window.epV20ShowDetails(); return oldShowPreview?oldShowPreview.apply(this,arguments):undefined; };
  try{ showPreview=window.showPreview; generateCascadePanel=window.epV20GenerateShield; window.generateCascadePanel=window.epV20GenerateShield; }catch(e){}
  function boot(){ patchButtons(); try{ if(window.epV18SetStatus) window.epV18SetStatus('ok','V20 активна'); }catch(e){} toast(BUILD+' загружена'); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ setTimeout(boot,120); }); else setTimeout(boot,120);
  setInterval(patchButtons,2500);
})();
