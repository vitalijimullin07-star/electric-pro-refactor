/* Electric PRO V23 stable runtime: original block order */
window.EP_REFACTOR_RUNTIME_VERSION='V23_BODY_END_RUNTIME';
console.log('Electric PRO V23 runtime loaded at body end');



/* =========================================================
 * SOURCE: legacy/extracted-js-blocks/block-01.js
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 1
 * Original HTML lines: 9-16
 */

window.onerror = function(message, source, lineno, colno, error) {
            console.error("Критическая ошибка:", message, lineno);
            let loader = document.getElementById('global-loader');
            if(loader) loader.classList.remove('show');
            return true; 
        };


/* =========================================================
 * SOURCE: legacy/extracted-js-blocks/block-02.js
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
        apiKey: "AIzaSyDf_83fOauQddXE0lu0Jsu0toK1BaJ7TY8",
        authDomain: "electric-pro-test.firebaseapp.com",
        projectId: "electric-pro-test",
        storageBucket: "electric-pro-test.firebasestorage.app",
        messagingSenderId: "629482912356",
        appId: "1:629482912356:web:7f386c27ce618fddc2fd71"
    });
    db = firebase.firestore();
    auth = firebase.auth();
    db.settings({ cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED });
    db.enablePersistence().catch(err => console.warn("Offline cache failed", err));
} catch(e) { console.error("Firebase error", e); }

// === GOOGLE AUTH ===


/* V40 FIXED: moved function handleGoogleAuth to 01-visual.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js, auth.js */
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



/* V40 FIXED: moved function checkLocalPinUser to 01-visual.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, auth.js */
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



/* V40 FIXED: moved function showLoader to 01-visual.js, 11-pdf-files.js, 12-documents.js, visual.js */


/* V40 FIXED: moved function hideLoader to 01-visual.js, 11-pdf-files.js, 12-documents.js, visual.js */


/* V40 FIXED: moved function showToast to 01-visual.js, 11-pdf-files.js, 12-documents.js, visual.js */


/* V40 FIXED: moved function loginWithPin to 01-visual.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, auth.js */


/* V40 FIXED: moved function confirmLogout to 01-visual.js, 07-settings.js, auth.js */


/* V40 FIXED: moved function finishLoginSetup to 01-visual.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, auth.js */


/* V40 FIXED: moved function openModal to 01-visual.js, 04-database.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, visual.js */


/* V40 FIXED: moved function closeModal to 01-visual.js, 11-pdf-files.js, 12-documents.js, visual.js */


/* V40 FIXED: moved function toggleMenu to 01-visual.js, 11-pdf-files.js, 12-documents.js, visual.js */


/* V40 FIXED: moved function changeTheme to 01-visual.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, settings.js */


/* V40 FIXED: moved function updateMasterBadge to 01-visual.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, customer.js */


/* V40 FIXED: moved function updateCoeffs to 01-visual.js, 05-ai-functions.js, 11-pdf-files.js, 12-documents.js, settings.js */


/* V40 FIXED: moved function saveApiKey to 01-visual.js, 04-database.js, 05-ai-functions.js, 07-settings.js, settings.js */


/* V40 FIXED: moved function saveQRs to 01-visual.js, 05-ai-functions.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, settings.js */


/* V40 FIXED: moved function fPrice to 08-accounting.js, estimate.js */
// === ЗАМЕНА МАТЕРИАЛА / РАБОТЫ ПО КЛИКУ ===
let swapTargetIdx = -1;


/* V40 FIXED: moved function openSwapModal to 01-visual.js, 04-database.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, estimate.js */


/* V40 FIXED: moved function applySwap to 01-visual.js, 04-database.js, 05-ai-functions.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, estimate.js */


/* V40 FIXED: moved function renderMainTable to 01-visual.js, 02-shield-configurator.js, 05-ai-functions.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, estimate.js */


/* V40 FIXED: moved function syncDraft to 04-database.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js, estimate.js */


/* V40 FIXED: moved function clearCurrentEstimate to 01-visual.js, 05-ai-functions.js, 10-estimate-views.js, estimate.js */


/* V40 FIXED: moved function openMatCatalog to 01-visual.js, 04-database.js, 11-pdf-files.js, 12-documents.js, database.js */


/* V40 FIXED: moved function openWorkCatalog to 01-visual.js, 04-database.js, 07-settings.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, database.js */


/* V40 FIXED: moved function toggleCat to 11-pdf-files.js, 12-documents.js, database.js */


/* V40 FIXED: moved function promptAdd to 01-visual.js, 04-database.js, 05-ai-functions.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, database.js */


/* V40 FIXED: moved function confirmQtyAdd to 01-visual.js, 02-shield-configurator.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, database.js */


/* V40 FIXED: moved function addAuto to 01-visual.js, 02-shield-configurator.js, 05-ai-functions.js, 10-estimate-views.js, estimate.js */


/* V40 FIXED: moved function setPodr to 03-socket-pool.js, 11-pdf-files.js, 12-documents.js, socket-pool.js */


/* V40 FIXED: moved function setH to 03-socket-pool.js, 11-pdf-files.js, 12-documents.js, socket-pool.js */


/* V40 FIXED: moved function setP to 03-socket-pool.js, 11-pdf-files.js, 12-documents.js, socket-pool.js */


/* V40 FIXED: moved function modM to 01-visual.js, 03-socket-pool.js, socket-pool.js */


/* V40 FIXED: moved function upUI to 02-shield-configurator.js, 11-pdf-files.js, 12-documents.js, socket-pool.js */


/* V40 FIXED: moved function addGrp to 01-visual.js, 03-socket-pool.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, socket-pool.js */


/* V40 FIXED: moved function popPool to 03-socket-pool.js, socket-pool.js */


/* V40 FIXED: moved function rfPool to 02-shield-configurator.js, 03-socket-pool.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, socket-pool.js */


/* V40 FIXED: moved function applyPoolToEstimate to 01-visual.js, 03-socket-pool.js, 04-database.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, socket-pool.js */


/* V40 FIXED: moved function modV to 02-shield-configurator.js, 11-pdf-files.js, 12-documents.js, shield-configurator.js */


/* V40 FIXED: moved function populateShieldExtras to 02-shield-configurator.js, 04-database.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, shield-configurator.js */


/* V40 FIXED: moved function addExtraToShieldConfig to 01-visual.js, 02-shield-configurator.js, 04-database.js, 07-settings.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, shield-configurator.js */


/* V40 FIXED: moved function renderShieldExtras to 01-visual.js, 02-shield-configurator.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, shield-configurator.js */


/* V40 FIXED: moved function epAllDbItems to 04-database.js, 07-settings.js, 10-estimate-views.js */
function epNormText(v) {
    return String(v || '').toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, ' ').trim();
}



/* V40 FIXED: moved function epFindDbItem to 04-database.js, 10-estimate-views.js */


/* V40 FIXED: moved function epV15BrandRu to 02-shield-configurator.js */


/* V40 FIXED: moved function epV15BrandCode to 02-shield-configurator.js */


/* V40 FIXED: moved function epV15CleanForName to 02-shield-configurator.js */


/* V40 FIXED: moved function epV15DetectModel to 02-shield-configurator.js, 05-ai-functions.js */


/* V40 FIXED: moved function epV15DetectNominal to 02-shield-configurator.js */


/* V40 FIXED: moved function epV15DetectPoles to 02-shield-configurator.js */


/* V40 FIXED: moved function epV15AmpFromNominal to 02-shield-configurator.js */


/* V40 FIXED: moved function epV15FormatAutoName to 02-shield-configurator.js, 05-ai-functions.js, 12-documents.js */


/* V40 FIXED: moved function epV15DetectLeakage to 02-shield-configurator.js */


/* V40 FIXED: moved function epV15FormatRcdName to 02-shield-configurator.js, 05-ai-functions.js, 12-documents.js */


/* V40 FIXED: moved function epV15DisplayMaterialName to 02-shield-configurator.js, 12-documents.js */


/* V40 FIXED: moved function epV15MergeAssignments to 02-shield-configurator.js, 04-database.js, 05-ai-functions.js, 10-estimate-views.js */


/* V40 FIXED: moved function epMat to 02-shield-configurator.js, 04-database.js, 05-ai-functions.js, 08-accounting.js, 10-estimate-views.js */


/* V40 FIXED: moved function epWork to 02-shield-configurator.js, 04-database.js, 05-ai-functions.js, 08-accounting.js, 10-estimate-views.js */


/* V40 FIXED: moved function epGetCheck to 11-pdf-files.js, 12-documents.js */


/* V40 FIXED: moved function epGetVal to 11-pdf-files.js, 12-documents.js */


/* V40 FIXED: moved function epAutoPrice to 02-shield-configurator.js, 08-accounting.js */


/* V40 FIXED: moved function epDifPrice to 02-shield-configurator.js, 08-accounting.js */


/* V40 FIXED: moved function generateCascadePanel to 01-visual.js, 02-shield-configurator.js, 03-socket-pool.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 12-documents.js, shield-configurator.js */
{curve}; УЗО/ДИФ тип ${rcdType}; влажные зоны 10мА`, q: 1, p: 0, type: 'work', tag: 'shield_info' },
        { n: `ℹ️ Гребёнки: 1P ${comb1P}×25см; 2P ${comb2P}×25см; N-шинок ${twoPoleProtectionCount}; PE-шина ${appLogic.shieldPeBusContacts || 26} контактов`, q: 1, p: 0, type: 'work', tag: 'shield_info' }
    ];
    warnings.forEach(x => info.push({ n: `⚠️ ${x}`, q: 1, p: 0, type: 'work', tag: 'shield_info' }));
    addAuto(m.concat(w).concat(info), 'shield');
    currentShieldExtras = [];
    closeModal('configModal');
    showToast('✅ Щит сгенерирован V15');
}




/* V40 FIXED: moved function runAiCheck to 01-visual.js, 02-shield-configurator.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, ai.js */


/* V40 FIXED: moved function aiSupply to 01-visual.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, ai.js */


/* V40 FIXED: moved function aiPueHelper to 01-visual.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, ai.js */


/* V40 FIXED: moved function compareShopsAI to 01-visual.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, ai.js */


/* V40 FIXED: moved function getPDFHeader to 11-pdf-files.js, pdf-preview.js */


/* V40 FIXED: moved function categorizeEstimateItem to 03-socket-pool.js, 10-estimate-views.js, pdf-preview.js */


/* V40 FIXED: moved function showPreview to 01-visual.js, 02-shield-configurator.js, 03-socket-pool.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, pdf-preview.js */


/* V40 FIXED: moved function refreshPreview to 10-estimate-views.js, 11-pdf-files.js, pdf-preview.js */


/* V40 FIXED: moved function printAct to 04-database.js, 07-settings.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, accounting.js */


/* V40 FIXED: moved function deleteAct to 01-visual.js, 04-database.js, 05-ai-functions.js, 12-documents.js, accounting.js */


/* V40 FIXED: moved function togglePay to 04-database.js, 08-accounting.js, 11-pdf-files.js, 12-documents.js, accounting.js */


/* V40 FIXED: moved function updatePayPrepay to 04-database.js, 08-accounting.js, accounting.js */


/* V40 FIXED: moved function saveCust to 01-visual.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, customer.js */


/* V40 FIXED: moved function saveLogic to 01-visual.js, 02-shield-configurator.js, 08-accounting.js, 11-pdf-files.js, 12-documents.js, settings.js */


/* V40 FIXED: moved function renderLogicUI to 01-visual.js, 02-shield-configurator.js, 08-accounting.js, 11-pdf-files.js, 12-documents.js, settings.js */


/* V40 FIXED: moved function openRecalcModal to 01-visual.js, 11-pdf-files.js, 12-documents.js, recalc-routes.js */


/* V40 FIXED: moved function updateRecalcUI to 11-pdf-files.js, 12-documents.js, recalc-routes.js */


/* V40 FIXED: moved function doRecalculate to 01-visual.js, 02-shield-configurator.js, 03-socket-pool.js, 04-database.js, 05-ai-functions.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, recalc-routes.js */


/* V40 FIXED: moved function renderChart to 01-visual.js, 03-socket-pool.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, accounting.js */


/* V40 FIXED: moved function updateBuhUI to 04-database.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, accounting.js */


/* V40 FIXED: moved function saveHist to 01-visual.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, accounting.js */


/* V40 FIXED: moved function updateHistList to 04-database.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, accounting.js */


/* V40 FIXED: moved function openObjCard to 01-visual.js, 03-socket-pool.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, accounting.js */


/* V40 FIXED: moved function closeObjCardAndReturn to 01-visual.js, accounting.js */


/* V40 FIXED: moved function addExtraWork to 01-visual.js, 04-database.js, 05-ai-functions.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, accounting.js */


/* V40 FIXED: moved function loadCustHistoryOptions to 07-settings.js, 11-pdf-files.js, 12-documents.js, accounting.js */


/* V40 FIXED: moved function switchDbTab to 01-visual.js, 03-socket-pool.js, 04-database.js, 11-pdf-files.js, 12-documents.js, database.js */


/* V40 FIXED: moved function renderDbEditors to 01-visual.js, 03-socket-pool.js, 04-database.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, database.js */


/* V40 FIXED: moved function addDbItem to 01-visual.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, database.js */


/* V40 FIXED: moved function requestPriceChange to 01-visual.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, database.js */


/* V40 FIXED: moved function listenForApprovals to 02-shield-configurator.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, admin.js */


/* V40 FIXED: moved function approveUser to 01-visual.js, 05-ai-functions.js, 07-settings.js, admin.js */


/* V40 FIXED: moved function loadMasterDrafts to 04-database.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, admin.js */


/* V40 FIXED: moved function openAdminDraftView to 01-visual.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, admin.js */


/* V40 FIXED: moved function renderAdminUsers to 01-visual.js, 02-shield-configurator.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, admin.js */


/* V40 FIXED: moved function adminAddUser to 01-visual.js, 05-ai-functions.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, admin.js */


/* V40 FIXED: moved function deleteUser to 01-visual.js, 04-database.js, 05-ai-functions.js, 07-settings.js, admin.js */
/* =========================================================
 * SOURCE: legacy/extracted-js-blocks/block-03.js
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 3
 * Original HTML lines: 2095-3541
 */

(function () {
    // === STATE ===
    window.EP_AI_CONFIG = {
        provider: safeGet('ep_ai_provider_v1', 'gemini') || 'gemini',
        geminiKey: '',
        openaiKey: '',
        openaiModel: safeGet('ep_openai_model_v1', 'gpt-4o-mini') || 'gpt-4o-mini'
    };

    window.EP_DB_REVIEW = { type: 'mat', items: [], source: '' };

    function epCleanText(v) {
        return (v || '').toString().replace(/\s+/g, ' ').trim();
    }

    

/* V40 FIXED: moved function epMoney to 08-accounting.js */
function epEscape(s) {
        return String(s ?? '').replace(/[&<>"']/g, function (m) {
            return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m];
        });
    }

    

/* V40 FIXED: moved function epNormProvider to 01-visual.js, 05-ai-functions.js, 10-estimate-views.js */


/* V40 FIXED: moved function epCurrentProvider to 05-ai-functions.js, 10-estimate-views.js */


/* V40 FIXED: moved function epCurrentKey to 01-visual.js, 05-ai-functions.js, 07-settings.js */


/* V40 FIXED: moved function epSetAiProvider to 01-visual.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js */
window.epSetAiProvider = epSetAiProvider;

    

/* V40 FIXED: moved function epRefreshProviderUI to 01-visual.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js */
window.epRefreshProviderUI = epRefreshProviderUI;

    

/* V40 FIXED: moved function epInsertMainProviderSwitch to 01-visual.js, 03-socket-pool.js, 05-ai-functions.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js */


/* V40 FIXED: moved function epMakeAiMenuGroup to 01-visual.js, 03-socket-pool.js, 05-ai-functions.js, 11-pdf-files.js, 12-documents.js */


/* V40 FIXED: moved function epAddBetaLabels to 02-shield-configurator.js, 03-socket-pool.js, 11-pdf-files.js, 12-documents.js */
// === SETTINGS / API SYNC ===
    

/* V40 FIXED: moved function epPatchSettingsUI to 01-visual.js, 02-shield-configurator.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js */
window.epClearLocalAiKeys = function () {
        safeSet('gemini_key_v31', '');
        safeSet('ep_openai_key_v1', '');
        safeSet('ep_gemini_key_v1', '');
        if (typeof GEMINI_API_KEY !== 'undefined') GEMINI_API_KEY = '';
        if (document.getElementById('api-key-input')) document.getElementById('api-key-input').value = '';
        if (document.getElementById('ep-gemini-key-input')) document.getElementById('ep-gemini-key-input').value = '';
        if (document.getElementById('ep-openai-key-input')) document.getElementById('ep-openai-key-input').value = '';
        showToast('Старые локальные ключи очищены');
    };

    

/* V40 FIXED: moved function epTestProviderKey to 01-visual.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js */
window.epSaveAiConfig = async function (withTest) {
        if (!appUser || appUser.role !== 'admin') {
            showToast('Только админ меняет API');
            return;
        }

        const provider = epCurrentProvider();
        const geminiKey = epCleanText(document.getElementById('ep-gemini-key-input')?.value || window.EP_AI_CONFIG.geminiKey || '');
        const openaiKey = epCleanText(document.getElementById('ep-openai-key-input')?.value || window.EP_AI_CONFIG.openaiKey || '');
        const model = epCleanText(document.getElementById('ep-openai-model-input')?.value || 'gpt-4o-mini');

        const keyToTest = provider === 'openai' ? openaiKey : geminiKey;

        try {
            if (withTest) {
                showLoader('Проверяю API...', '🤖');
                await epTestProviderKey(provider, keyToTest, model);
            }

            window.EP_AI_CONFIG = { provider: provider, geminiKey: geminiKey, openaiKey: openaiKey, openaiModel: model };
            safeSet('ep_ai_provider_v1', provider);
            safeSet('ep_gemini_key_v1', geminiKey);
            safeSet('ep_openai_key_v1', openaiKey);
            safeSet('ep_openai_model_v1', model);

            if (geminiKey && typeof GEMINI_API_KEY !== 'undefined') GEMINI_API_KEY = geminiKey;

            if (db) {
                await db.collection('settings').doc('ai_config').set({
                    provider: provider,
                    geminiKey: geminiKey,
                    openaiKey: openaiKey,
                    openaiModel: model,
                    updatedAt: new Date().toISOString(),
                    updatedBy: appUser.uid || null
                }, { merge: true });

                await db.collection('settings').doc('global_api').set({
                    provider: provider,
                    geminiKey: geminiKey,
                    openaiKey: openaiKey,
                    openaiModel: model,
                    updatedAt: new Date().toISOString()
                }, { merge: true });

                try {
                    const usersSnap = await db.collection('users').get();
                    const batch = db.batch();
                    usersSnap.forEach(function (doc) {
                        batch.set(doc.ref, {
                            aiProvider: provider,
                            geminiKey: geminiKey,
                            openaiKey: openaiKey,
                            openaiModel: model
                        }, { merge: true });
                    });
                    await batch.commit();
                } catch (e) {
                    console.warn('Не удалось разослать по users:', e);
                }
            }

            hideLoader();
            epRefreshProviderUI();
            showToast('✅ API проверен и отправлен мастерам');
        } catch (e) {
            hideLoader();
            showToast('❌ ' + (e.message || 'Ошибка API'));
        }
    };

    window.saveApiKey = async function (val) {
        if (!appUser || appUser.role !== 'admin') {
            showToast('API вводит только админ');
            return;
        }
        epPatchSettingsUI();
        const input = document.getElementById('ep-gemini-key-input');
        if (input) input.value = val || '';
        window.EP_AI_CONFIG.provider = 'gemini';
        epSetAiProvider('gemini', false);
        await epSaveAiConfig(true);
    };

    

/* V40 FIXED: moved function epLoadAiConfigFromServer to 01-visual.js, 02-shield-configurator.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js */
// === AI PROVIDER CALLS ===
    

/* V40 FIXED: moved function epCallGemini to 05-ai-functions.js, 07-settings.js, 10-estimate-views.js */


/* V40 FIXED: moved function epExtractOpenAiText to 01-visual.js, 05-ai-functions.js, 10-estimate-views.js, 12-documents.js */


/* V40 FIXED: moved function epCallOpenAI to 01-visual.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js */


/* V40 FIXED: moved function epAskAI to 01-visual.js, 05-ai-functions.js, 10-estimate-views.js */
window.epAskAI = epAskAI;

    function epStripCode(t) {
        return (t || '').replace(/```json/gi, '').replace(/```html/gi, '').replace(/```javascript/gi, '').replace(/```js/gi, '').replace(/```[a-z]*/gi, '').replace(/```/g, '').trim();
    }

    function epTryJsonParseLoose(t) {
        if (!t) return null;
        let s = epStripCode(String(t));
        s = s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
        s = s.replace(/,\s*([}\]])/g, '$1');
        try { return JSON.parse(s); } catch(e) {}
        const arr = s.match(/\[[\s\S]*\]/);
        if (arr) {
            try { return JSON.parse(arr[0].replace(/,\s*([}\]])/g, '$1')); } catch(e) {}
        }
        const obj = s.match(/\{[\s\S]*\}/);
        if (obj) {
            try { return JSON.parse(obj[0].replace(/,\s*([}\]])/g, '$1')); } catch(e) {}
        }
        return null;
    }

    

/* V40 FIXED: moved function epParseLooseTableText to 01-visual.js, 04-database.js, 05-ai-functions.js, 08-accounting.js, 10-estimate-views.js */
function epExtractJsonObjectsLoose(t) {
        const s = epStripCode(String(t || '')).replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
        const out = [];
        let depth = 0, start = -1, inStr = null, esc = false;

        for (let i = 0; i < s.length; i++) {
            const ch = s[i];
            if (inStr) {
                if (esc) esc = false;
                else if (ch === '\\') esc = true;
                else if (ch === inStr) inStr = null;
                continue;
            }
            if (ch === '"' || ch === "'") { inStr = ch; continue; }
            if (ch === '{') {
                if (depth === 0) start = i;
                depth++;
            } else if (ch === '}') {
                depth--;
                if (depth === 0 && start >= 0) {
                    const piece = s.slice(start, i + 1).replace(/,\s*([}\]])/g, '$1');
                    try { out.push(JSON.parse(piece)); } catch(e) {}
                    start = -1;
                }
            }
        }
        return out;
    }

    

/* V40 FIXED: moved function epParseJsonArray to 04-database.js, 05-ai-functions.js, 10-estimate-views.js */
// Override AI functions
    window.runAiCheck = async function () {
        showLoader('ИИ анализирует...', '🤖');
        try {
            const estNames = currentEstimate.map(i => i.n).join(', ');
            const promptText = 'Я электрик. Смета: ' + estNames + '. Найди логические ошибки: крепеж, рамки, УЗО, автоматы, коробки, расходники. Верни ТОЛЬКО JSON массив: [{"reason":"объяснение","suggestedName":"название"}]. Если всё идеально, верни [].';
            const txt = await epAskAI(promptText, { maxTokens: 2500 });
            const suggestions = epParseJsonArray(txt);
            hideLoader();

            if (!suggestions.length) return showToast('✨ Всё идеально! Смета полная.');

            document.getElementById('ai-modal-title').innerText = '✨ ИИ-Аналитика';
            document.getElementById('ai-suggestions').innerHTML = suggestions.map(function (s) {
                return `<div style="background:var(--bg); padding:12px; border-radius:10px; margin-bottom:10px; border-left:4px solid var(--ai);">
                    <div style="font-weight:800;">${epEscape(s.reason || '')}</div>
                    <div style="font-size:12px; color:var(--gray); margin-top:5px;">Совет: ${epEscape(s.suggestedName || '')}</div>
                </div>`;
            }).join('');
            openModal('aiModal');
        } catch (e) {
            hideLoader();
            showToast('❌ ' + (e.message || 'Сбой ИИ'));
        }
    };

    window.aiSupply = async function () {
        showLoader('ИИ формирует закупку...', '🤖');
        try {
            const mats = currentEstimate.filter(i => i.type === 'mat').map(i => `${i.n} - ${i.q} ${i.u || ''}`).join(', ');
            const txt = await epAskAI('Смета материалов: ' + mats + '. Раздели на категории для закупки. Верни чистый HTML: <h3>, <ul>, <li>, <b>.', { maxTokens: 2500 });
            hideLoader();
            document.getElementById('ai-modal-title').innerText = '📦 ИИ-Снабженец';
            document.getElementById('ai-suggestions').innerHTML = `<div style="font-size:13px; line-height:1.5;">${epStripCode(txt)}</div>`;
            openModal('aiModal');
        } catch(e) { hideLoader(); showToast('❌ ' + (e.message || 'Сбой ИИ')); }
    };

    window.aiPueHelper = async function () {
        showLoader('ИИ думает...', '🤖');
        try {
            const txt = await epAskAI('Смета: ' + currentEstimate.map(i => i.n).join(', ') + '. Какие нормы ПУЭ и практические замечания нужны? Кратко в HTML.', { maxTokens: 2500 });
            hideLoader();
            document.getElementById('ai-modal-title').innerText = '📚 ПУЭ Справка';
            document.getElementById('ai-suggestions').innerHTML = `<div style="font-size:13px; line-height:1.5;">${epStripCode(txt)}</div>`;
            openModal('aiModal');
        } catch(e) { hideLoader(); showToast('❌ ' + (e.message || 'Сбой ИИ')); }
    };

    window.compareShopsAI = async function () {
        showLoader('Сравнение цен...', '🤖');
        try {
            let shops = document.getElementById('ai-shops')?.value || 'Лемана ПРО, Петрович, ВсеИнструменты';
            const txt = await epAskAI('Материалы: ' + currentEstimate.filter(i=>i.type==='mat').map(i=>i.n).join(', ') + '. Создай HTML таблицу с максимальными розничными ценами ГОСТ в магазинах: ' + shops + '. Верни только HTML.', { maxTokens: 3000 });
            hideLoader();
            document.getElementById('ai-modal-title').innerText = '🛒 Макс. Цены ГОСТ';
            document.getElementById('ai-suggestions').innerHTML = `<div style="overflow-x:auto;">${epStripCode(txt)}</div>`;
            openModal('aiModal');
        } catch(e) { hideLoader(); showToast('❌ ' + (e.message || 'Сбой ИИ')); }
    };

    // === DATABASE IMPORT / EXPORT / SERVER ===
    

/* V40 FIXED: moved function epDbTypeLabel to 04-database.js */


/* V40 FIXED: moved function epCurrentDb to 04-database.js */


/* V40 FIXED: moved function epSetCurrentDb to 04-database.js */


/* V40 FIXED: moved function epInferCategory to 02-shield-configurator.js, 03-socket-pool.js, 04-database.js */


/* V40 FIXED: moved function epInferSubcategory to 02-shield-configurator.js, 03-socket-pool.js, 04-database.js, 08-accounting.js */


/* V40 FIXED: moved function epNormalizeItems to 04-database.js, 05-ai-functions.js, 08-accounting.js, 10-estimate-views.js */


/* V40 FIXED: moved function epSaveUserDb to 04-database.js, 05-ai-functions.js, 07-settings.js */


/* V40 FIXED: moved function epSaveGlobalDb to 04-database.js, 05-ai-functions.js, 07-settings.js */


/* V40 FIXED: moved function epLoadUserDbAfterLogin to 04-database.js, 05-ai-functions.js, 07-settings.js, 11-pdf-files.js, 12-documents.js */


/* V40 FIXED: moved function epInsertDbTools to 01-visual.js, 04-database.js, 05-ai-functions.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js */
window.epTriggerDbFileImport = function (type) {
        window.EP_DB_REVIEW.type = type;
        const input = document.getElementById('ep-db-file-input');
        input.value = '';
        input.onchange = function (e) {
            const file = e.target.files && e.target.files[0];
            if (file) epReadDbFile(file, type);
        };
        input.click();
    };

    window.epOpenTextImport = function (type) {
        window.EP_DB_REVIEW.type = type;
        document.getElementById('ep-text-import-title').innerText = 'Импорт ' + epDbTypeLabel(type) + ' из текста';
        document.getElementById('ep-text-import-value').value = '';
        openModal('ep-text-import-modal');
    };

    window.epRunTextImport = async function () {
        const text = document.getElementById('ep-text-import-value').value;
        closeModal('ep-text-import-modal');
        await epAiNormalizeDbText(text, window.EP_DB_REVIEW.type, 'текст');
    };

    

/* V40 FIXED: moved function epReadFileAsText to 11-pdf-files.js */


/* V40 FIXED: moved function epReadFileAsDataURL to 11-pdf-files.js */


/* V40 FIXED: moved function epReadFileAsArrayBuffer to 11-pdf-files.js */
function epIsEmptyCell(v) {
        return v === null || v === undefined || String(v).trim() === '';
    }

    function epCleanCell(v) {
        return epCleanText(String(v === null || v === undefined ? '' : v).replace(/\u00a0/g, ' '));
    }

    function epIsUnitCell(v) {
        const s = epCleanCell(v).toLowerCase().replace(/\./g, '');
        return /^(шт|штук|м|мп|м\/п|м2|м²|м3|м³|упак|уп|компл|комплект|час|точка|линия|кг|л)$/i.test(s);
    }

    function epNormalizeUnit(v) {
        const s = epCleanCell(v).toLowerCase().replace(/\./g, '');
        if (!s) return 'шт';
        if (s === 'мп' || s === 'м/п') return 'м';
        if (s === 'штук') return 'шт';
        if (s === 'комплект') return 'компл';
        return s;
    }

    function epIsNumberLikeCell(v) {
        if (typeof v === 'number') return true;
        const s = epCleanCell(v);
        if (!s) return false;
        return /^\d+[\d\s]*([,.]\d+)?$/.test(s);
    }

    function epLooksLikeCodeOrNumber(v) {
        const s = epCleanCell(v);
        if (!s) return true;
        if (/^№$/i.test(s)) return true;
        if (/^\d+[.)]?$/.test(s)) return true;
        if (/^\d+(\.\d+)+$/.test(s)) return true;
        if (/^[A-ZА-Я0-9\-_.\/]{2,18}$/i.test(s) && !/[а-яё]{4,}/i.test(s)) return true;
        return false;
    }

    function epTitleCaseRu(s) {
        s = epCleanCell(s).replace(/:+$/, '').trim();
        if (!s) return '';
        return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    }

    

/* V40 FIXED: moved function epExtractItemsFromSheetRows to 04-database.js, 08-accounting.js, 10-estimate-views.js, 12-documents.js */


/* V40 FIXED: moved function epReadDbFile to 01-visual.js, 04-database.js, 05-ai-functions.js, 10-estimate-views.js, 11-pdf-files.js */


/* V40 FIXED: moved function epAiNormalizeImage to 01-visual.js, 02-shield-configurator.js, 03-socket-pool.js, 04-database.js, 05-ai-functions.js, 08-accounting.js, 10-estimate-views.js */


/* V40 FIXED: moved function epAiNormalizeDbText to 01-visual.js, 04-database.js, 05-ai-functions.js, 10-estimate-views.js */
window.epReviewCheckAll = function (checked) {
        document.querySelectorAll('#ep-db-ai-review-list input[type="checkbox"]').forEach(function (cb) {
            cb.checked = !!checked;
        });
    };

    

/* V40 FIXED: moved function epShowDbReview to 01-visual.js, 02-shield-configurator.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js */


/* V40 FIXED: moved function epGetReviewedSelected to 04-database.js, 05-ai-functions.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js */


/* V40 FIXED: moved function epSameItem to 10-estimate-views.js */


/* V40 FIXED: moved function epSendDbProposal to 04-database.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js, 12-documents.js */
window.epApplyReviewedDbItems = async function (mode) {
        const type = window.EP_DB_REVIEW.type;
        const items = epGetReviewedSelected();
        if (!items.length) return showToast('Нет выбранных позиций');

        let arr = epCurrentDb(type).slice();

        items.forEach(function (it) {
            const idx = arr.findIndex(x => epSameItem(x, it));
            if (mode === 'replace' && idx >= 0) {
                arr[idx] = Object.assign({}, arr[idx], it, { id: arr[idx].id || it.id });
            } else if (idx < 0) {
                arr.push(it);
            } else if (mode === 'add') {
                arr.push(Object.assign({}, it, { id: it.id + '_' + Math.random().toString(36).slice(2, 6) }));
            }
        });

        epSetCurrentDb(type, arr);

        if (appUser && appUser.role === 'admin') {
            try { await epSaveGlobalDb(); } catch(e) { console.warn(e); }
        }

        await epSaveUserDb();
        await epSendDbProposal(type, items, mode);

        renderDbEditors();
        closeModal('ep-db-ai-review-modal');
        showToast('✅ База обновлена' + (appUser && appUser.role !== 'admin' ? ' и отправлена админу' : ''));
    };

    

/* V40 FIXED: moved function epDownloadJson to 11-pdf-files.js, 12-documents.js */
window.epExportMyDb = function () {
        epDownloadJson('electric-pro-my-db.json', {
            owner: appUser ? { uid: appUser.uid, name: appUser.name || appUser.email || '' } : null,
            matDB: matDB,
            workDB: workDB,
            exportedAt: new Date().toISOString()
        });
    };

    window.epExportGlobalDb = async function () {
        let data = { matDB: matDB, workDB: workDB };
        try {
            if (db) {
                const doc = await db.collection('settings').doc('global_db').get();
                if (doc.exists) data = doc.data();
            }
        } catch(e){}
        epDownloadJson('electric-pro-global-db.json', Object.assign({}, data, { exportedAt: new Date().toISOString() }));
    };

    // Override renderDbEditors with delete buttons
    const epOldRenderDbEditors = window.renderDbEditors;
    window.renderDbEditors = function () {
        let catsM = [...new Set(matDB.map(m=>m.c || 'Разное'))];
        let catsW = [...new Set(workDB.map(w=>w.c || 'Разное'))];

        const catsEl = document.getElementById('db-cats');
        if (catsEl) catsEl.innerHTML = [...new Set([...catsM, ...catsW])].map(c=>`<option value="${epEscape(c)}">`).join('');

        let htmlMat = '';
        let mGroups = {}; matDB.forEach(m => { mGroups[m.c||'Разное'] = mGroups[m.c||'Разное'] || []; mGroups[m.c||'Разное'].push(m); });
        Object.keys(mGroups).forEach((c, idx) => {
            let sid = 'db_m_'+idx;
            htmlMat += `<div class="cat-header" onclick="toggleCat('${sid}')">${epEscape(c)}</div><div class="cat-body" id="${sid}">`;
            mGroups[c].forEach(m => {
                htmlMat += `<div class="emp-row">
                    <div style="flex:1;"><b>${epEscape(m.n)}</b><br><span style="color:var(--gray);font-size:10px;">${epEscape(m.sc || 'Разное')} • ${Number(m.p)||0} ₽ / ${epEscape(m.u || 'шт')}</span></div>
                    <div class="ep-row-actions">
                        <input type="number" value="${Number(m.p)||0}" onchange="requestPriceChange('mat', '${epEscape(m.id)}', this.value)" style="width:70px;margin:0;padding:4px;text-align:center;">
                        <button class="btn-danger" onclick="epDeleteDbItem('mat','${epEscape(m.id)}')" title="Удалить">🗑</button>
                    </div>
                </div>`;
            });
            htmlMat += `</div>`;
        });
        const em = document.getElementById('editor-mat-list');
        if (em) em.innerHTML = htmlMat;

        let htmlWork = '';
        let wGroups = {}; workDB.forEach(w => { wGroups[w.c||'Разное'] = wGroups[w.c||'Разное'] || []; wGroups[w.c||'Разное'].push(w); });
        Object.keys(wGroups).forEach((c, idx) => {
            let sid = 'db_w_'+idx;
            htmlWork += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${epEscape(c)}</div><div class="cat-body" id="${sid}">`;
            wGroups[c].forEach(w => {
                htmlWork += `<div class="emp-row">
                    <div style="flex:1;"><b>${epEscape(w.n)}</b><br><span style="color:var(--gray);font-size:10px;">${epEscape(w.sc || 'Разное')} • ${Number(w.p)||0} ₽ / ${epEscape(w.u || 'шт')}</span></div>
                    <div class="ep-row-actions">
                        <input type="number" value="${Number(w.p)||0}" onchange="requestPriceChange('work', '${epEscape(w.id)}', this.value)" style="width:70px;margin:0;padding:4px;text-align:center;">
                        <button class="btn-danger" onclick="epDeleteDbItem('work','${epEscape(w.id)}')" title="Удалить">🗑</button>
                    </div>
                </div>`;
            });
            htmlWork += `</div>`;
        });
        const ew = document.getElementById('editor-work-list');
        if (ew) ew.innerHTML = htmlWork;
    };

    window.epDeleteDbItem = async function (type, id) {
        const isAdmin = appUser && appUser.role === 'admin';
        let mode = 'mine';

        if (isAdmin) {
            mode = await new Promise(function (resolve) {
                const all = confirm('Админ: нажмите OK = удалить у всех. Отмена = удалить только у меня.');
                resolve(all ? 'all' : 'mine');
            });
        } else {
            const ok = confirm('Удалить позицию только у себя?');
            if (!ok) return;
        }

        let arr = epCurrentDb(type).filter(x => x.id !== id);
        epSetCurrentDb(type, arr);

        await epSaveUserDb();

        if (isAdmin && mode === 'all') {
            try { await epSaveGlobalDb(); } catch(e) { console.warn(e); }
        }

        renderDbEditors();
        showToast(isAdmin && mode === 'all' ? 'Удалено у всех' : 'Удалено у меня');
    };

    window.addDbItem = async function () {
        let cat = document.getElementById('db-new-cat').value.trim() || 'Разное';
        let name = document.getElementById('db-new-name').value.trim();
        let price = Number(document.getElementById('db-new-price').value) || 0;
        let unit = document.getElementById('db-new-unit').value.trim() || 'шт';
        let isMat = document.getElementById('editor-mat-list').style.display !== 'none';

        if(!name) return showToast('Введите название!');

        const type = isMat ? 'mat' : 'work';
        let newItem = { id: (isMat?'m':'w') + Date.now(), c: cat, n: name, p: price, u: unit };
        let arr = epCurrentDb(type).slice();
        arr.push(newItem);
        epSetCurrentDb(type, arr);

        if (appUser && appUser.role === 'admin') {
            try { await epSaveGlobalDb(); } catch(e) {}
        } else {
            await epSendDbProposal(type, [newItem], 'manual_add');
        }

        await epSaveUserDb();
        renderDbEditors();
        document.getElementById('db-new-name').value = '';
        document.getElementById('db-new-price').value = '';
        showToast(appUser && appUser.role === 'admin' ? '✅ Позиция добавлена в базу сервера' : '✅ Добавлено у вас и отправлено админу');
    };

    window.requestPriceChange = async function (type, id, newPrice) {
        newPrice = Number(newPrice) || 0;
        let arr = epCurrentDb(type);
        let item = arr.find(x => x.id === id);
        if (!item) return;
        item.p = newPrice;

        if (appUser && appUser.role === 'admin') {
            try { await epSaveGlobalDb(); } catch(e){}
            showToast('✅ Цена изменена в базе сервера');
        } else {
            await epSaveUserDb();
            await epSendDbProposal(type, [item], 'price_change');
            showToast('✅ Цена изменена у вас и отправлена админу');
        }
    };

    // Admin proposals
    

/* V40 FIXED: moved function epInsertAdminProposalBox to 02-shield-configurator.js, 04-database.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js */


/* V40 FIXED: moved function epListenDbProposals to 04-database.js, 07-settings.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js */
window.epAdminResolveDbProposal = async function (id, mode) {
        if (!db || !appUser || appUser.role !== 'admin') return;
        showLoader('Обработка заявки...', '🌍');
        try {
            const ref = db.collection('db_proposals').doc(id);
            const doc = await ref.get();
            if (!doc.exists) throw new Error('Заявка не найдена');
            const d = doc.data();

            if (mode !== 'reject') {
                const type = d.type || 'mat';
                let items = (d.items || []).map(function (x) {
                    return Object.assign({}, x, mode === 'names' ? { p: 0 } : {});
                });
                let arr = epCurrentDb(type).slice();
                items.forEach(function (it) {
                    const idx = arr.findIndex(x => epSameItem(x, it));
                    if (idx >= 0) arr[idx] = Object.assign({}, arr[idx], it, { id: arr[idx].id || it.id });
                    else arr.push(it);
                });
                epSetCurrentDb(type, arr);
                await epSaveGlobalDb();
                renderDbEditors();
            }

            await ref.set({
                status: mode === 'reject' ? 'rejected' : 'approved',
                decision: mode,
                decidedAt: new Date().toISOString(),
                decidedBy: appUser.uid || ''
            }, { merge: true });

            hideLoader();
            showToast(mode === 'reject' ? 'Заявка отклонена' : '✅ Добавлено в базу сервера');
        } catch(e) {
            hideLoader();
            showToast('❌ ' + (e.message || 'Ошибка'));
        }
    };

    // Patch lifecycle
    const epOldFinishLoginSetup = window.finishLoginSetup;
    window.finishLoginSetup = async function () {
        if (typeof epOldFinishLoginSetup === 'function') epOldFinishLoginSetup();
        epPatchSettingsUI();
        epInsertMainProviderSwitch();
        epInsertDbTools();
        epMakeAiMenuGroup();
        epAddBetaLabels();
        await epLoadAiConfigFromServer();
        await epLoadUserDbAfterLogin();
        epListenDbProposals();
    };

    

/* V40 FIXED: moved function epInitialApply to 04-database.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js */
document.addEventListener('DOMContentLoaded', function () {
        epInitialApply();
        setTimeout(epInitialApply, 400);
        setTimeout(epInitialApply, 1200);
    });

    document.addEventListener('click', function () {
        setTimeout(function () {
            epMakeAiMenuGroup();
            epAddBetaLabels();
            epInsertDbTools();
            epRefreshProviderUI();
        }, 120);
    });
})();


/* =========================================================
 * SOURCE: legacy/extracted-js-blocks/block-04.js
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 4
 * Original HTML lines: 3576-3867
 */

(function() {
    const EP_FULL_WORKS=[{"id":"w44","c":"Алмазная резка","g":"Штроба 25х30","n":"Бетон","p":550,"u":"м.п."},{"id":"w45","c":"Алмазная резка","g":"Штроба 25х30","n":"Кирпич","p":400,"u":"м.п."},{"id":"w46","c":"Алмазная резка","g":"Штроба 25х30","n":"Панелька","p":700,"u":"м.п."},{"id":"w47","c":"Алмазная резка","g":"Штроба 25х30","n":"Мягкий мат.","p":400,"u":"м.п."},{"id":"w48","c":"Алмазная резка","g":"Штроба 50х50","n":"Бетон","p":1500,"u":"м.п."},{"id":"w49","c":"Алмазная резка","g":"Штроба 50х50","n":"Кирпич","p":1300,"u":"м.п."},{"id":"w50","c":"Алмазная резка","g":"Штроба 50х50","n":"Панелька","p":1900,"u":"м.п."},{"id":"w51","c":"Алмазная резка","g":"Штроба 50х50","n":"Мягкий мат.","p":900,"u":"м.п."},{"id":"w52","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Бетон","p":2200,"u":"м.п."},{"id":"w53","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Кирпич","p":1550,"u":"м.п."},{"id":"w54","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Панелька","p":2500,"u":"м.п."},{"id":"w55","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Мягкий мат.","p":1400,"u":"м.п."},{"id":"w56","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Бетон","p":600,"u":"шт"},{"id":"w57","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Кирпич","p":500,"u":"шт"},{"id":"w58","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Панелька","p":650,"u":"шт"},{"id":"w59","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Мягкий мат.","p":400,"u":"шт"},{"id":"w60","c":"Черновая электрика","g":"Вклейка подрозетников","n":"Все типы","p":100,"u":"шт"},{"id":"w61","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Бетон","p":400,"u":"мод."},{"id":"w62","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Кирпич","p":300,"u":"мод."},{"id":"w63","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Панелька","p":500,"u":"мод."},{"id":"w64","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Мягкий мат.","p":250,"u":"мод."},{"id":"w65","c":"Монтаж","g":"Прокладка кабеля","n":"Без гофры (Потолок)","p":120,"u":"м.п."},{"id":"w66","c":"Монтаж","g":"Прокладка кабеля","n":"В гофре (Пол)","p":150,"u":"м.п."},{"id":"w67","c":"Монтаж","g":"Распаячная коробка","n":"Сборка распред. коробки / коммутация","p":800,"u":"шт"},{"id":"w68","c":"Чистовая установка","g":"Механизмы","n":"Установка розетки 220В","p":500,"u":"шт"},{"id":"w69","c":"Чистовая установка","g":"Механизмы","n":"Установка выключателя","p":550,"u":"шт"},{"id":"w70","c":"Чистовая установка","g":"Механизмы","n":"Установка терморегулятора","p":900,"u":"шт"},{"id":"w71","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Бетон","p":650,"u":"шт"},{"id":"w72","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Кирпич","p":550,"u":"шт"},{"id":"w73","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Панелька","p":750,"u":"шт"},{"id":"w74","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Мягкий мат.","p":450,"u":"шт"},{"id":"w75","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Бетон","p":800,"u":"шт"},{"id":"w76","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Кирпич","p":700,"u":"шт"},{"id":"w77","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Панелька","p":850,"u":"шт"},{"id":"w78","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Мягкий мат.","p":500,"u":"шт"},{"id":"w79","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Бетон","p":6000,"u":"шт"},{"id":"w80","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Кирпич","p":4500,"u":"шт"},{"id":"w81","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Панелька","p":7000,"u":"шт"},{"id":"w82","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Мягкий мат.","p":4000,"u":"шт"},{"id":"w83","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Бетон","p":2500,"u":"шт"},{"id":"w84","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Кирпич","p":2000,"u":"шт"},{"id":"w85","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Панелька","p":3000,"u":"шт"},{"id":"w86","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Мягкий мат.","p":1900,"u":"шт"},{"id":"w87","c":"Щитовое","g":"Монтаж","n":"Сборка щита","p":500,"u":"мод."},{"id":"w89","c":"Щитовое","g":"Монтаж","n":"Установка БП в щит","p":900,"u":"ед"},{"id":"w91","c":"Монтаж","g":"Спецоборудование","n":"Подключение нагревателя","p":4000,"u":"ед"},{"id":"w92","c":"Монтаж","g":"Спецоборудование","n":"Система КУП","p":5000,"u":"ед"},{"id":"s_r1","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле времени","p":1250,"u":"шт"},{"id":"s_r2","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле освещения (в щите)","p":1250,"u":"шт"},{"id":"s_r3","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле температуры/жидкости","p":1700,"u":"шт"},{"id":"s_r4","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле контроля фаз","p":1450,"u":"шт"},{"id":"s_r5","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле напряжения","p":1150,"u":"шт"},{"id":"s_r6","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле управления нагрузкой","p":2050,"u":"шт"},{"id":"s_m1","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 220-240В на DIN","p":1000,"u":"шт"},{"id":"s_m2","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 220-240В на монтажную панель","p":1250,"u":"шт"},{"id":"s_m3","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 380-400В на DIN","p":1700,"u":"шт"},{"id":"s_m4","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 380-400В на монтажную панель","p":2200,"u":"шт"},{"id":"s_m5","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика под трансформаторы тока","p":2400,"u":"шт"},{"id":"s_m6","c":"Щитовое","g":"Счетчики","n":"Установка трансформатора тока (без подкл)","p":720,"u":"шт"},{"id":"s_p1","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на бетон","p":680,"u":"шт"},{"id":"s_p2","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на кирпич","p":600,"u":"шт"},{"id":"s_p3","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на ГКЛ","p":530,"u":"шт"},{"id":"s_p4","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на дерево","p":450,"u":"шт"},{"id":"s_p5","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка накладной силовой розетки 380В","p":1000,"u":"шт"},{"id":"s_p6","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка встраиваемой силовой розетки 380В","p":530,"u":"шт"},{"id":"s_p7","c":"Чистовая установка","g":"Механизмы","n":"Установка встраиваемой розетки/выкл в подрозетник","p":300,"u":"шт"},{"id":"s_p8","c":"Чистовая установка","g":"Механизмы","n":"Установка блока розеток/выкл","p":1200,"u":"шт"},{"id":"s_d1","c":"Черновая электрика","g":"Электроточки","n":"Установка накладного подрозетника","p":300,"u":"шт"},{"id":"s_d2","c":"Черновая электрика","g":"Электроточки","n":"Установка подрозетника","p":180,"u":"шт"},{"id":"s_d3","c":"Черновая электрика","g":"Электроточки","n":"Установка накладной распаечной коробки","p":450,"u":"шт"},{"id":"s_d4","c":"Черновая электрика","g":"Электроточки","n":"Установка встраиваемой распаечной коробки","p":300,"u":"шт"},{"id":"s_d5","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка термостата","p":380,"u":"шт"},{"id":"s_d6","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка встраиваемого датчика движения","p":330,"u":"шт"},{"id":"s_d7","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка звонка","p":680,"u":"шт"},{"id":"s_d8","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка кнопки звонка","p":450,"u":"шт"},{"id":"s_d9","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка ТВ краба","p":480,"u":"шт"},{"id":"s_sh1","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 2 модуля","p":180,"u":"шт"},{"id":"s_sh2","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 4-8 модулей","p":290,"u":"шт"},{"id":"s_sh3","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 12-24 модуля","p":330,"u":"шт"},{"id":"s_sh4","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 36-60 модулей","p":560,"u":"шт"},{"id":"s_sh5","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 72-96 модулей","p":780,"u":"шт"},{"id":"s_l1","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на кухне под шкафами","p":270,"u":"м.п."},{"id":"s_l2","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в натяжной потолок","p":390,"u":"м.п."},{"id":"s_l3","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на гипсокартон","p":300,"u":"м.п."},{"id":"s_l4","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в потолочный плинтус","p":350,"u":"м.п."},{"id":"s_l5","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в алюминиевый профиль","p":230,"u":"м.п."},{"id":"s_l6","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на карниз","p":350,"u":"м.п."},{"id":"s_l7","c":"Освещение","g":"LED Лента","n":"Установка светодиодной ленты в светильник","p":180,"u":"м.п."},{"id":"s_l8","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на улице","p":380,"u":"м.п."},{"id":"s_l9","c":"Освещение","g":"Алюм. профиль","n":"Установка накладного алюм. профиля на скотч","p":110,"u":"м.п."},{"id":"s_l10","c":"Освещение","g":"Алюм. профиль","n":"Установка накладного алюм. профиля со сверлением","p":290,"u":"м.п."},{"id":"s_l11","c":"Освещение","g":"Алюм. профиль","n":"Установка врезного алюм. профиля в готовый паз","p":120,"u":"м.п."},{"id":"s_l12","c":"Освещение","g":"Алюм. профиль","n":"Установка врезного алюм. профиля с подготовкой паза","p":390,"u":"м.п."},{"id":"s_c1","c":"Освещение","g":"Люстры и Светильники","n":"Сборка простой люстры","p":630,"u":"шт"},{"id":"s_c2","c":"Освещение","g":"Люстры и Светильники","n":"Сборка сложной люстры","p":870,"u":"шт"},{"id":"s_c3","c":"Освещение","g":"Люстры и Светильники","n":"Установка крюка под люстру","p":230,"u":"шт"},{"id":"s_c4","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры на готовый крюк","p":740,"u":"шт"},{"id":"s_c5","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры с креплением к потолку (простая)","p":1200,"u":"шт"},{"id":"s_c6","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры с креплением к потолку (сложная/ДУ)","p":2250,"u":"шт"},{"id":"s_c7","c":"Освещение","g":"Люстры и Светильники","n":"Установка тяжелой люстры с креплением на крюк","p":1950,"u":"шт"},{"id":"s_c8","c":"Освещение","g":"Люстры и Светильники","n":"Установка тяжелой люстры с креплением к потолку","p":3600,"u":"шт"},{"id":"s_c9","c":"Освещение","g":"Люстры и Светильники","n":"Установка настенного светильника, бра","p":450,"u":"шт"},{"id":"s_c10","c":"Освещение","g":"Люстры и Светильники","n":"Установка точечного светильника","p":750,"u":"шт"},{"id":"s_c11","c":"Освещение","g":"Люстры и Светильники","n":"Установка светодиодного светильника","p":680,"u":"шт"},{"id":"s_c12","c":"Освещение","g":"Люстры и Светильники","n":"Установка светильника Армстронг","p":380,"u":"шт"},{"id":"s_c13","c":"Освещение","g":"Люстры и Светильники","n":"Установка люминесцентного светильника","p":410,"u":"шт"},{"id":"s_c14","c":"Освещение","g":"Люстры и Светильники","n":"Установка трекового светильника","p":140,"u":"шт"},{"id":"s_c15","c":"Освещение","g":"Люстры и Светильники","n":"Монтаж шинопровода","p":450,"u":"м.п."},{"id":"s_c16","c":"Освещение","g":"Уличное освещение","n":"Установка уличного светильника на фасаде","p":830,"u":"шт"},{"id":"s_c17","c":"Освещение","g":"Уличное освещение","n":"Установка садово-паркового светильника","p":1350,"u":"шт"},{"id":"s_c18","c":"Освещение","g":"Люстры и Светильники","n":"Установка светильника Выход","p":480,"u":"шт"},{"id":"s_c19","c":"Освещение","g":"Уличное освещение","n":"Установка антивандального светильника","p":660,"u":"шт"},{"id":"s_dem1","c":"Демонтаж","g":"Освещение","n":"Демонтаж люстры","p":240,"u":"шт"},{"id":"s_dem2","c":"Демонтаж","g":"Освещение","n":"Демонтаж светильника","p":210,"u":"шт"},{"id":"s_dem3","c":"Демонтаж","g":"Электроточки","n":"Демонтаж розетки","p":200,"u":"шт"},{"id":"s_dem4","c":"Демонтаж","g":"Электроточки","n":"Демонтаж выключателя","p":200,"u":"шт"},{"id":"s_dem5","c":"Демонтаж","g":"Электроточки","n":"Демонтаж распаечной коробки","p":200,"u":"шт"},{"id":"s_dem6","c":"Демонтаж","g":"Электроточки","n":"Демонтаж дверного звонка","p":200,"u":"шт"},{"id":"s_dem7","c":"Демонтаж","g":"Щитовое","n":"Демонтаж реле времени","p":230,"u":"шт"},{"id":"s_dem8","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка до 8 модулей","p":110,"u":"шт"},{"id":"s_dem9","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка 12-36 модулей","p":260,"u":"шт"},{"id":"s_dem10","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка 48-96 модулей","p":470,"u":"шт"},{"id":"s_dem11","c":"Демонтаж","g":"Щитовое","n":"Демонтаж автомата","p":150,"u":"шт"},{"id":"s_dem12","c":"Демонтаж","g":"Щитовое","n":"Демонтаж УЗО","p":150,"u":"шт"},{"id":"s_dem13","c":"Демонтаж","g":"Щитовое","n":"Демонтаж дифавтомата","p":150,"u":"шт"},{"id":"s_dem14","c":"Демонтаж","g":"Щитовое","n":"Демонтаж рубильника","p":150,"u":"шт"},{"id":"s_dem15","c":"Демонтаж","g":"Щитовое","n":"Демонтаж магнитного пускателя","p":140,"u":"шт"}];
    let epGlobalDbType = 'mat';
    let epGlobalDbCache = { matDB: [], workDB: [] };
    window.EP_DB_PROPOSALS_CACHE_V2 = window.EP_DB_PROPOSALS_CACHE_V2 || {};

    function epEsc(v) { return String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
    function epId(v) { return String(v ?? '').replace(/[^a-zA-Z0-9_:-]/g, '_'); }
    

/* V40 FIXED: moved function epArr to 04-database.js */


/* V40 FIXED: moved function epSetArr to 04-database.js */
function epClean(v) { return String(v ?? '').trim().toLowerCase(); }
    function epSame(a,b) {
        if (a && b && a.id && b.id && String(a.id) === String(b.id)) return true;
        return epClean(a && a.c) === epClean(b && b.c)
            && epClean((a && (a.g || a.sc)) || '') === epClean((b && (b.g || b.sc)) || '')
            && epClean(a && a.n) === epClean(b && b.n);
    }
    

/* V40 FIXED: moved function epMaterialFromName to 04-database.js */


/* V40 FIXED: moved function epOpFromName to 03-socket-pool.js */


/* V40 FIXED: moved function epNormalizeWorkItem to 03-socket-pool.js, 04-database.js, 10-estimate-views.js */
function epDisplayWorkName(it) {
        const g = it.g || it.sc || '';
        const n = it.n || '';
        if (g && n && !String(n).toLowerCase().includes(String(g).toLowerCase())) return g + ' — ' + n;
        return n || g || 'Позиция';
    }
    

/* V40 FIXED: moved function epEstimateCopy to 10-estimate-views.js */


/* V40 FIXED: moved function epMergeFullWorksInto to 04-database.js, 10-estimate-views.js */


/* V40 FIXED: moved function epNormalizeAllWorkDb to 04-database.js */


/* V40 FIXED: moved function epGroupCatalog to 04-database.js */


/* V40 FIXED: moved function epRenderGroupedList to 01-visual.js, 02-shield-configurator.js, 03-socket-pool.js, 04-database.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js */
window.epToggleSubCat = function(id, ev) { if (ev) ev.stopPropagation(); const el = document.getElementById(id); if (el) el.classList.toggle('active'); };
    window.epPromptGroupedAdd = function(id, type) {
        const item = epArr(type).map(x => type === 'work' ? epNormalizeWorkItem(x) : x).find(x => String(x.id) === String(id));
        if (!item) return;
        window.pendingAdd = { item: epEstimateCopy(item, type), type: type };
        const nameEl = document.getElementById('qty-prompt-name'); if (nameEl) nameEl.innerText = type === 'work' ? epDisplayWorkName(item) : item.n;
        const qtyEl = document.getElementById('qty-input'); if (qtyEl) qtyEl.value = 1;
        openModal('qtyPromptModal');
    };
    const oldPromptAddFull = window.promptAdd;
    window.promptAdd = function(id, type) { if (type === 'work') return window.epPromptGroupedAdd(id, type); if (typeof oldPromptAddFull === 'function') return oldPromptAddFull(id, type); return window.epPromptGroupedAdd(id, type); };
    window.openWorkCatalog = function() { epNormalizeAllWorkDb(); const el = document.getElementById('work-cat-list'); if (el) el.innerHTML = epRenderGroupedList(workDB || [], 'work', { prefix:'wcat_full', mode:'catalog' }); openModal('workModal'); };
    const oldOpenMatCatalogFull = window.openMatCatalog;
    window.openMatCatalog = function() {
        const hasNested = (matDB || []).some(x => x.sc || x.g);
        if (!hasNested && typeof oldOpenMatCatalogFull === 'function') return oldOpenMatCatalogFull();
        const el = document.getElementById('mat-cat-list'); if (el) el.innerHTML = epRenderGroupedList(matDB || [], 'mat', { prefix:'mcat_full', mode:'catalog' }); openModal('matCatModal');
    };
    window.renderDbEditors = function() {
        epNormalizeAllWorkDb();
        const catsM = [...new Set((matDB || []).map(m => m.c || 'Разное'))];
        const catsW = [...new Set((workDB || []).map(w => w.c || 'Разное'))];
        const catsEl = document.getElementById('db-cats'); if (catsEl) catsEl.innerHTML = [...new Set([...catsM, ...catsW])].map(c => `<option value="${epEsc(c)}">`).join('');
        const em = document.getElementById('editor-mat-list'); const ew = document.getElementById('editor-work-list');
        if (em) em.innerHTML = epRenderGroupedList(matDB || [], 'mat', { prefix:'db_m_full', mode:'editor' });
        if (ew) ew.innerHTML = epRenderGroupedList(workDB || [], 'work', { prefix:'db_w_full', mode:'editor' });
    };

    

/* V40 FIXED: moved function epGetGlobalDb to 04-database.js, 05-ai-functions.js, 07-settings.js, 11-pdf-files.js, 12-documents.js */
window.epOpenGlobalDbModal = async function() { if (typeof showLoader === 'function') showLoader('Загрузка базы сервера...', '🌍'); await epGetGlobalDb(); if (typeof hideLoader === 'function') hideLoader(); epGlobalDbType='mat'; epRenderGlobalDbModal(); openModal('globalDbModal'); };
    window.epSwitchGlobalDbTab = function(type) { epGlobalDbType = type; epRenderGlobalDbModal(); };
    window.epGlobalSelectAll = function(flag) { document.querySelectorAll('#ep-global-db-list .ep-global-check').forEach(ch => ch.checked = !!flag); };
    

/* V40 FIXED: moved function epRenderGlobalDbModal to 01-visual.js, 04-database.js, 11-pdf-files.js, 12-documents.js */
window.epAddSelectedGlobalToMyDb = async function() {
        const checks = Array.from(document.querySelectorAll('#ep-global-db-list .ep-global-check:checked'));
        if (!checks.length) return showToast('Выберите позиции');
        const type = epGlobalDbType;
        const src = type === 'work' ? epGlobalDbCache.workDB : epGlobalDbCache.matDB;
        let target = epArr(type).slice(); let added=0;
        checks.forEach(function(ch) { const it = src.find(x => String(x.id) === String(ch.dataset.id)); if (it && !target.some(x => epSame(x,it))) { target.push(Object.assign({}, it)); added++; } });
        epSetArr(type, target); if (type === 'work') epNormalizeAllWorkDb();
        try { if (typeof epSaveUserDb === 'function') await epSaveUserDb(); else safeSet(type === 'work' ? 'user_db_work_v31' : 'user_db_mat_v31', JSON.stringify(target)); } catch(e){}
        if (typeof renderDbEditors === 'function') renderDbEditors();
        showToast('✅ Добавлено выбранных: ' + added);
    };
    

/* V40 FIXED: moved function epInsertGlobalDbButton to 01-visual.js, 04-database.js, 05-ai-functions.js, 11-pdf-files.js, 12-documents.js */
const oldOpenModalFull = window.openModal;
    window.openModal = function(id) {
        if (typeof oldOpenModalFull === 'function') oldOpenModalFull(id);
        if (id === 'settModal') setTimeout(function() { epInsertGlobalDbButton(); epNormalizeAllWorkDb(); if (typeof renderDbEditors === 'function') renderDbEditors(); epStartProposalV2(); }, 80);
    };

    // Заявки в базу сервера: открыть массив и принимать/отклонять отдельные позиции.
    

/* V40 FIXED: moved function epEnsureProposalBox to 02-shield-configurator.js, 04-database.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js */


/* V40 FIXED: moved function epProposalItemName to 10-estimate-views.js */


/* V40 FIXED: moved function epRenderProposalList to 01-visual.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js */
window.epOpenProposalDetail = function(id) {
        const d = window.EP_DB_PROPOSALS_CACHE_V2[id]; if (!d) return showToast('Заявка не найдена');
        const items = Array.isArray(d.items) ? d.items : [];
        const decisions = d.itemDecisions || {};
        const title = document.getElementById('ep-proposal-title'); if (title) title.innerText = '🌍 Заявка: ' + (d.masterName || d.uid || 'Мастер');
        const body = document.getElementById('ep-proposal-body'); if (!body) return;
        body.innerHTML = `<div style="font-size:12px;color:var(--gray);margin-bottom:8px;">${d.type === 'work' ? 'Работы' : 'Материалы'} • ${items.length} позиций. Можно принять или отклонить каждую отдельно.</div><div class="ep-proposal-top-actions"><button class="btn-info" onclick="epProposalSelectAll(true)">✅ Все</button><button class="btn-vendor" onclick="epProposalSelectAll(false)">⬜ Снять</button><button class="btn-danger" onclick="epResolveProposalItems('${id}','reject')">❌ Отклонить выбранные</button></div><div class="ep-proposal-top-actions"><button class="btn-success" onclick="epResolveProposalItems('${id}','full')">✅ Добавить выбранные</button><button class="btn-primary" onclick="epResolveProposalItems('${id}','names')">🏷 Без суммы</button><button class="btn-vendor" onclick="closeModal('epProposalModal')">Закрыть</button></div>` +
        items.map(function(x,i) {
            const dec = decisions[String(i)];
            const done = !!dec;
            const status = done ? (dec.mode === 'reject' ? 'Отклонено' : (dec.mode === 'names' ? 'Добавлено без суммы' : 'Добавлено полностью')) : 'На рассмотрении';
            return `<div class="ep-proposal-row ${done?'done':''}"><label style="display:flex;gap:8px;align-items:flex-start;"><input type="checkbox" class="ep-proposal-check" data-index="${i}" ${done?'disabled':''} style="width:22px;height:22px;accent-color:var(--primary);"><div style="flex:1;"><div class="ep-db-item-title">${epEsc(epProposalItemName(x))}</div><div class="ep-db-item-meta">${epEsc(x.c || 'Разное')} • ${epEsc(x.g || x.sc || 'Разное')} • ${Number(x.p)||0} ₽ / ${epEsc(x.u || 'шт')} • <b>${status}</b></div></div></label>${done?'':`<div class="ep-proposal-actions"><button class="btn-success" onclick="epResolveProposalOne('${id}',${i},'full')">Добавить</button><button class="btn-primary" onclick="epResolveProposalOne('${id}',${i},'names')">Без суммы</button><button class="btn-danger" onclick="epResolveProposalOne('${id}',${i},'reject')">Отклонить</button></div>`}</div>`;
        }).join('');
        openModal('epProposalModal');
    };
    window.epProposalSelectAll = function(flag) { document.querySelectorAll('#ep-proposal-body .ep-proposal-check:not(:disabled)').forEach(ch => ch.checked = !!flag); };
    window.epResolveProposalOne = function(id, idx, mode) { epResolveProposalItems(id, mode, [idx]); };
    window.epResolveProposalItems = async function(id, mode, forcedIndexes) {
        if (!db || !appUser || appUser.role !== 'admin') return showToast('Только админ');
        const d = window.EP_DB_PROPOSALS_CACHE_V2[id]; if (!d) return showToast('Заявка не найдена');
        const items = Array.isArray(d.items) ? d.items : [];
        let indexes = Array.isArray(forcedIndexes) ? forcedIndexes : Array.from(document.querySelectorAll('#ep-proposal-body .ep-proposal-check:checked')).map(ch => Number(ch.dataset.index));
        indexes = indexes.filter(i => i >= 0 && i < items.length && !(d.itemDecisions || {})[String(i)]);
        if (!indexes.length) return showToast('Выберите необработанные позиции');
        if (typeof showLoader === 'function') showLoader('Обработка позиций...', '🌍');
        try {
            const ref = db.collection('db_proposals').doc(id);
            const fresh = await ref.get(); if (!fresh.exists) throw new Error('Заявка не найдена');
            const fd = fresh.data() || d;
            const decisions = Object.assign({}, fd.itemDecisions || {});
            const type = fd.type || 'mat';
            if (mode !== 'reject') {
                let globalMat = matDB || [], globalWork = workDB || [];
                try { const gdoc = await db.collection('settings').doc('global_db').get(); if (gdoc.exists) { const gd = gdoc.data() || {}; if (Array.isArray(gd.matDB)) globalMat = gd.matDB; if (Array.isArray(gd.workDB)) globalWork = gd.workDB; } } catch(e){}
                let arr = (type === 'work' ? globalWork : globalMat).slice();
                indexes.forEach(function(i) {
                    let it = Object.assign({}, items[i], mode === 'names' ? { p:0 } : {});
                    if (type === 'work') it = epNormalizeWorkItem(it);
                    const pos = arr.findIndex(x => epSame(type === 'work' ? epNormalizeWorkItem(x) : x, it));
                    if (pos >= 0) arr[pos] = Object.assign({}, arr[pos], it, { id: arr[pos].id || it.id });
                    else arr.push(it);
                });
                if (type === 'work') { globalWork = epMergeFullWorksInto(arr); workDB = epMergeFullWorksInto(workDB || []); } else { globalMat = arr; }
                await db.collection('settings').doc('global_db').set({ matDB: globalMat, workDB: globalWork, updatedAt: new Date().toISOString() }, { merge:true });
            }
            indexes.forEach(i => decisions[String(i)] = { mode: mode, decidedAt: new Date().toISOString(), decidedBy: appUser.uid || '' });
            const allDone = items.every((_,i) => !!decisions[String(i)]);
            const status = allDone ? 'processed' : 'pending';
            await ref.set({ itemDecisions: decisions, status: status, updatedAt: new Date().toISOString(), decidedBy: appUser.uid || '' }, { merge:true });
            if (typeof hideLoader === 'function') hideLoader();
            showToast(mode === 'reject' ? 'Позиции отклонены' : '✅ Позиции добавлены');
            const nd = Object.assign({}, fd, { itemDecisions: decisions, status: status });
            if (status === 'pending') window.EP_DB_PROPOSALS_CACHE_V2[id] = nd; else delete window.EP_DB_PROPOSALS_CACHE_V2[id];
            epRenderProposalList(); if (status === 'pending') window.epOpenProposalDetail(id); else closeModal('epProposalModal');
            if (typeof renderDbEditors === 'function') renderDbEditors();
        } catch(e) { if (typeof hideLoader === 'function') hideLoader(); showToast('❌ ' + (e.message || 'Ошибка')); }
    };
    

/* V40 FIXED: moved function epStartProposalV2 to 01-visual.js, 04-database.js, 07-settings.js, 11-pdf-files.js, 12-documents.js */


/* V40 FIXED: moved function epInitFullWorksPatch to 01-visual.js, 04-database.js */
const oldFinishSetupFull = window.finishLoginSetup;
    if (typeof oldFinishSetupFull === 'function') { window.finishLoginSetup = async function() { await oldFinishSetupFull.apply(this, arguments); setTimeout(epInitFullWorksPatch, 250); }; }
    document.addEventListener('DOMContentLoaded', function() { setTimeout(epInitFullWorksPatch, 350); setTimeout(epInitFullWorksPatch, 1300); });
    document.addEventListener('click', function() { setTimeout(function() { epInsertGlobalDbButton(); epStartProposalV2(); }, 120); });
})();


/* =========================================================
 * SOURCE: legacy/extracted-js-blocks/block-05.js
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 5
 * Original HTML lines: 3871-4181
 */

(function(){
  

/* V40 FIXED: moved function qs to 11-pdf-files.js, 12-documents.js */
function safeText(v){ return String(v || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function norm(v){ return String(v || '').toLowerCase().replace(/ё/g,'е').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function uniq(arr){ return Array.from(new Set(arr.filter(Boolean))); }
  function getVal(id, def){ var el=qs(id); return el ? el.value : def; }
  function getCheck(id){ var el=qs(id); return !!(el && el.checked); }
  function toNum(v, def){ var n=Number(v); return Number.isFinite(n) ? n : (def || 0); }

  

/* V40 FIXED: moved function getCfgCount to 02-shield-configurator.js */


/* V40 FIXED: moved function epMoveShieldSettingsIntoDetails to 01-visual.js, 02-shield-configurator.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js */


/* V40 FIXED: moved function epMatGroupName to 02-shield-configurator.js, 08-accounting.js, 10-estimate-views.js, 12-documents.js */


/* V40 FIXED: moved function epNormalizeMaterialsDb to 02-shield-configurator.js, 03-socket-pool.js, 04-database.js, 07-settings.js */
) : (it.g || it.sc || 'Разное');
      if(!data[c]) data[c] = {};
      if(!data[c][g]) data[c][g] = [];
      data[c][g].push(it);
    });
    return data;
  }

  

/* V40 FIXED: moved function epRenderGrouped to 01-visual.js, 02-shield-configurator.js, 03-socket-pool.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js */
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

  

/* V40 FIXED: moved function epPatchDbRenderers to 01-visual.js, 02-shield-configurator.js, 03-socket-pool.js, 04-database.js */


/* V40 FIXED: moved function epAllDbItems to 04-database.js, 07-settings.js, 10-estimate-views.js */


/* V40 FIXED: moved function epFindItem to 10-estimate-views.js */


/* V40 FIXED: moved function epMat to 02-shield-configurator.js, 04-database.js, 05-ai-functions.js, 08-accounting.js, 10-estimate-views.js */


/* V40 FIXED: moved function epWork to 02-shield-configurator.js, 04-database.js, 05-ai-functions.js, 08-accounting.js, 10-estimate-views.js */
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

      

/* V40 FIXED: moved function addLine to 01-visual.js, 01-visual.js, 02-shield-configurator.js, 02-shield-configurator.js, 03-socket-pool.js, 03-socket-pool.js, 03-socket-pool.js, 04-database.js, 04-database.js, 05-ai-functions.js, 05-ai-functions.js, 07-settings.js, 07-settings.js, 08-accounting.js, 08-accounting.js, 10-estimate-views.js, 10-estimate-views.js, 12-documents.js, 12-documents.js */


/* V40 FIXED: moved function addRoom to 01-visual.js, 01-visual.js, 02-shield-configurator.js, 02-shield-configurator.js, 03-socket-pool.js, 03-socket-pool.js, 04-database.js, 04-database.js, 05-ai-functions.js, 05-ai-functions.js, 07-settings.js, 07-settings.js, 08-accounting.js, 08-accounting.js, 10-estimate-views.js, 10-estimate-views.js, 12-documents.js, 12-documents.js */
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
      

/* V40 FIXED: moved function addProtection to 01-visual.js, 01-visual.js, 02-shield-configurator.js, 02-shield-configurator.js, 02-shield-configurator.js, 03-socket-pool.js, 03-socket-pool.js, 03-socket-pool.js, 04-database.js, 04-database.js, 05-ai-functions.js, 05-ai-functions.js, 07-settings.js, 07-settings.js, 08-accounting.js, 08-accounting.js, 10-estimate-views.js, 10-estimate-views.js, 12-documents.js, 12-documents.js */
if(protectionType === 'main_dif_auto') protectionDevices.push({group:'main', kind:'Главный ДИФ', leakage:30, rcdType:rcdType, modules:2});
      else if(protectionType === 'mixed') presentGroups.forEach(function(g){ addProtection(g, g === 'wet' ? 'ДИФ' : 'УЗО'); });
      else presentGroups.forEach(function(g){ addProtection(g, protectionType === 'dif_auto' ? 'ДИФ' : 'УЗО'); });

      

/* V40 FIXED: moved function autoPrice to 02-shield-configurator.js, 04-database.js, 08-accounting.js */


/* V40 FIXED: moved function difPrice to 02-shield-configurator.js, 08-accounting.js */
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

  

/* V40 FIXED: moved function epPatchGenerateButton to 02-shield-configurator.js, 11-pdf-files.js, 12-documents.js */


/* V40 FIXED: moved function boot to 01-visual.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js, 12-documents.js */
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  setTimeout(boot, 500);
  setTimeout(boot, 1500);
})();


/* =========================================================
 * SOURCE: legacy/extracted-js-blocks/block-06.js
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 6
 * Original HTML lines: 4187-4391
 */

(function(){
  const BRAND_LIST = ['ABB','IEK','ИЭК','EKF','Schneider','Schneider Electric','Legrand','Hager','Dekraft','CHINT','Tekfor','TDM'];

  

/* V40 FIXED: moved function qs to 11-pdf-files.js, 12-documents.js */


/* V40 FIXED: moved function toast to 01-visual.js */
function safe(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
  function norm(s){ return String(s||'').toLowerCase().replace(/с/g,'c').replace(/а/g,'a').replace(/в/g,'b').replace(/х/g,'x').replace(/ё/g,'е').replace(/[×]/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  

/* V40 FIXED: moved function dbArr to 04-database.js */


/* V40 FIXED: moved function setDbArr to 04-database.js */
function detectBrand(s){ const raw = String(s||''); const n = norm(raw); for(const b of BRAND_LIST){ if(n.includes(norm(b))) return b === 'ИЭК' ? 'IEK' : b; } return ''; }
  function detectNominal(s){ const n = norm(s).replace(/\s+/g,''); const m = n.match(/([abcd])([0-9]{1,3})/i); return m ? (m[1].toUpperCase()+m[2]) : ''; }
  

/* V40 FIXED: moved function getGroup to 04-database.js */
function setGroup(it,g){ it.g = it.g || g; it.sc = it.sc || g; }

  

/* V40 FIXED: moved function normalizeMaterialDb to 02-shield-configurator.js, 03-socket-pool.js, 04-database.js, 08-accounting.js, 12-documents.js */


/* V40 FIXED: moved function renderGrouped to 01-visual.js, 03-socket-pool.js, 04-database.js, 07-settings.js, 10-estimate-views.js */


/* V40 FIXED: moved function renderItem to 01-visual.js, 02-shield-configurator.js, 04-database.js, 07-settings.js, 10-estimate-views.js */
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
  

/* V40 FIXED: moved function lookupKey to 02-shield-configurator.js */


/* V40 FIXED: moved function reqName to 02-shield-configurator.js */


/* V40 FIXED: moved function smartFindMat to 02-shield-configurator.js, 04-database.js, 05-ai-functions.js, 10-estimate-views.js */
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

  

/* V40 FIXED: moved function canonicalName to 02-shield-configurator.js */


/* V40 FIXED: moved function mergeEstimate to 05-ai-functions.js, 10-estimate-views.js */
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

  

/* V40 FIXED: moved function boot to 01-visual.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js, 12-documents.js */
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  setTimeout(boot,500); setTimeout(boot,1500);
})();


/* =========================================================
 * SOURCE: legacy/extracted-js-blocks/block-07.js
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 7
 * Original HTML lines: 4395-4865
 */

/* === SURGICAL FIX 2026-05-13: shield details, no generic DIF, DB fallback, niche category === */
(function(){
  

/* V40 FIXED: moved function qs to 11-pdf-files.js, 12-documents.js */
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

  

/* V40 FIXED: moved function arrByType to 04-database.js */


/* V40 FIXED: moved function setArrByType to 04-database.js */
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
  

/* V40 FIXED: moved function detectRcdType to 02-shield-configurator.js */


/* V40 FIXED: moved function normalizeDbItem to 02-shield-configurator.js, 04-database.js, 08-accounting.js, 10-estimate-views.js, 12-documents.js */


/* V40 FIXED: moved function normalizeDbs to 04-database.js, 10-estimate-views.js */


/* V40 FIXED: moved function renderGroupedFixed to 01-visual.js, 02-shield-configurator.js, 04-database.js, 07-settings.js, 10-estimate-views.js */
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

  

/* V40 FIXED: moved function reqDisplayName to 02-shield-configurator.js */


/* V40 FIXED: moved function strictFindMaterial to 02-shield-configurator.js, 04-database.js */
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

  

/* V40 FIXED: moved function cleanCanonicalName to 02-shield-configurator.js */


/* V40 FIXED: moved function lineFromRaw to 02-shield-configurator.js */


/* V40 FIXED: moved function mergeEstimateFixed to 05-ai-functions.js, 10-estimate-views.js */
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

  

/* V40 FIXED: moved function shieldRowsForDetails to 02-shield-configurator.js, 05-ai-functions.js, 10-estimate-views.js */


/* V40 FIXED: moved function detailNote to 02-shield-configurator.js, 05-ai-functions.js, 10-estimate-views.js */
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
 * SOURCE: legacy/extracted-js-blocks/block-08.js
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 8
 * Original HTML lines: 4873-5226
 */

/* === SURGICAL FIX 2026-05-13: global add/upsert + smart swap filter === */
(function(){
  

/* V40 FIXED: moved function qs to 11-pdf-files.js, 12-documents.js */


/* V40 FIXED: moved function toast to 01-visual.js */
function safe(s){
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
      .replace(/а/g,'a')
      .replace(/в/g,'b')
      .replace(/[^a-zа-я0-9]+/g,' ')
      .trim();
  }

  

/* V40 FIXED: moved function localArr to 04-database.js */


/* V40 FIXED: moved function setLocalArr to 04-database.js */


/* V40 FIXED: moved function getGroup to 04-database.js */


/* V40 FIXED: moved function itemKey to 10-estimate-views.js */
function sigKey(type, it){
    return 'sig:' + type + '|' + norm([it && it.c, getGroup(it), it && it.n, it && it.u].filter(Boolean).join('|'));
  }
  function deletedSet(type){
    try{
      var k = type === 'work' ? 'ep_deleted_work_ids_local_v1' : 'ep_deleted_mat_ids_local_v1';
      return new Set(JSON.parse(localStorage.getItem(k) || '[]'));
    }catch(e){ return new Set(); }
  }
  

/* V40 FIXED: moved function saveLocalDb to 04-database.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js */
window.EP_GLOBAL_DB_VISIBLE_CACHE = window.EP_GLOBAL_DB_VISIBLE_CACHE || { matDB: [], workDB: [], loadedAt: 0 };
  window.EP_GLOBAL_DB_TAB_FIXED = window.EP_GLOBAL_DB_TAB_FIXED || 'mat';

  

/* V40 FIXED: moved function loadGlobalDb to 04-database.js, 05-ai-functions.js, 07-settings.js, 11-pdf-files.js, 12-documents.js */


/* V40 FIXED: moved function mergedArr to 04-database.js, 10-estimate-views.js */


/* V40 FIXED: moved function groupHtml to 02-shield-configurator.js, 03-socket-pool.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js */
window.epToggleSmartSub = function(id,e){ if(e) e.stopPropagation(); var el = qs(id); if(el) el.classList.toggle('active'); };

  window.epOpenGlobalDbModal = async function(){
    if(typeof showLoader === 'function') showLoader('Загрузка базы сервера...', '🌍');
    await loadGlobalDb(true);
    if(typeof hideLoader === 'function') hideLoader();
    window.EP_GLOBAL_DB_TAB_FIXED = 'mat';
    renderGlobalModalFixed();
    if(typeof openModal === 'function') openModal('globalDbModal');
  };
  window.epSwitchGlobalDbTab = function(type){
    window.EP_GLOBAL_DB_TAB_FIXED = type === 'work' ? 'work' : 'mat';
    renderGlobalModalFixed();
  };
  window.epGlobalSelectAll = function(flag){
    document.querySelectorAll('#ep-global-db-list .ep-global-check').forEach(function(ch){ ch.checked = !!flag; });
  };
  

/* V40 FIXED: moved function renderGlobalModalFixed to 01-visual.js, 04-database.js, 12-documents.js */
window.epAddSelectedGlobalToMyDb = async function(){
    var type = window.EP_GLOBAL_DB_TAB_FIXED || 'mat';
    var checks = Array.from(document.querySelectorAll('#ep-global-db-list .ep-global-check:checked'));
    if(!checks.length) return toast('Выберите позиции');

    var cache = await loadGlobalDb(false);
    var src = (type === 'work' ? (cache.workDB || []) : (cache.matDB || []));
    var bySig = new Map(src.map(function(it){ return [sigKey(type,it), it]; }));
    var local = localArr(type).slice();

    var added = 0, updated = 0;
    checks.forEach(function(ch){
      var it = bySig.get(ch.dataset.key);
      if(!it) return;
      var copy = Object.assign({}, it, {__src: undefined});
      var sKey = sigKey(type, copy);
      var idx = local.findIndex(function(x){ return sigKey(type,x) === sKey || (x.id && copy.id && String(x.id) === String(copy.id)); });
      if(idx >= 0){
        local[idx] = Object.assign({}, local[idx], copy, { id: local[idx].id || copy.id });
        updated++;
      } else {
        local.push(copy);
        added++;
      }
    });

    setLocalArr(type, local);
    saveLocalDb();

    await loadGlobalDb(true);
    if(typeof renderDbEditors === 'function') renderDbEditors();
    if(type === 'mat' && qs('mat-cat-list')) qs('mat-cat-list').innerHTML = groupHtml(mergedArr('mat'), 'mat', 'cat_mat_after_global', 'catalog');
    if(type === 'work' && qs('work-cat-list')) qs('work-cat-list').innerHTML = groupHtml(mergedArr('work'), 'work', 'cat_work_after_global', 'catalog');

    toast('✅ В мою базу: добавлено ' + added + ', обновлено ' + updated);
  };

  window.openMatCatalog = async function(){
    var el = qs('mat-cat-list');
    if(el) el.innerHTML = '<div style="padding:15px;color:var(--gray);font-weight:700;">Загружаю мою и базу сервера...</div>';
    if(typeof openModal === 'function') openModal('matCatModal');
    await loadGlobalDb(true);
    if(el) el.innerHTML = groupHtml(mergedArr('mat'), 'mat', 'cat_mat_smart', 'catalog');
  };
  window.openWorkCatalog = async function(){
    var el = qs('work-cat-list');
    if(el) el.innerHTML = '<div style="padding:15px;color:var(--gray);font-weight:700;">Загружаю мою и базу сервера...</div>';
    if(typeof openModal === 'function') openModal('workModal');
    await loadGlobalDb(true);
    if(el) el.innerHTML = groupHtml(mergedArr('work'), 'work', 'cat_work_smart', 'catalog');
  };

  var oldPromptAddSmart = window.promptAdd;
  window.promptAdd = function(keyOrId, type){
    var arr = mergedArr(type);
    var item = arr.find(function(x){ return sigKey(type,x) === keyOrId || itemKey(type,x) === keyOrId || String(x.id||'') === String(keyOrId); });
    if(!item && typeof oldPromptAddSmart === 'function') return oldPromptAddSmart(keyOrId, type);
    if(!item) return toast('Позиция не найдена');
    pendingAdd = { item:item, type:type };
    var name = qs('qty-prompt-name'), qty = qs('qty-input');
    if(name) name.innerText = item.n || 'Позиция';
    if(qty) qty.value = 1;
    if(typeof openModal === 'function') openModal('qtyPromptModal');
  };

  

/* V40 FIXED: moved function classify to 02-shield-configurator.js, 03-socket-pool.js, 04-database.js, 07-settings.js, 12-documents.js */


/* V40 FIXED: moved function sameSwapClass to 02-shield-configurator.js */
function swapLabel(it){
    var src = it.__src === 'global' ? '🌍' : '👤';
    return src + ' ' + (it.n || 'Позиция') + ' (' + (Number(it.p)||0) + ' ₽)';
  }

  window.EP_SWAP_CANDIDATES_SMART = [];
  window.openSwapModal = async function(idx){
    swapTargetIdx = idx;
    var current = currentEstimate[idx];
    if(!current) return;
    var type = current.type === 'work' ? 'work' : 'mat';

    var sel = qs('swap-select');
    if(sel) sel.innerHTML = '<option>Загрузка вариантов...</option>';
    if(typeof openModal === 'function') openModal('swapModal');

    await loadGlobalDb(true);
    var pool = mergedArr(type);
    var candidates = pool.filter(function(x){ return sameSwapClass(current, x); });

    if(!candidates.length) {
      var cg = norm([current.c || '', (current.dbMeta && current.dbMeta.category) || '', (current.dbMeta && current.dbMeta.subcategory) || ''].join(' '));
      candidates = pool.filter(function(x){ return norm([x.c || '', getGroup(x)].join(' ')).indexOf(cg) >= 0; });
    }

    window.EP_SWAP_CANDIDATES_SMART = candidates;
    if(!sel) return;
    if(!candidates.length) {
      sel.innerHTML = '<option value="">Нет подходящих вариантов</option>';
      return;
    }
    sel.innerHTML = candidates.map(function(x, i){
      return '<option value="'+i+'" '+(x.n === current.n ? 'selected' : '')+'>'+safe(swapLabel(x))+'</option>';
    }).join('');
  };

  window.applySwap = function(){
    if(swapTargetIdx < 0) return;
    var sel = qs('swap-select');
    if(!sel || sel.value === '') return toast('Нет выбранной позиции');
    var item = window.EP_SWAP_CANDIDATES_SMART[Number(sel.value)];
    if(!item) return toast('Позиция не найдена');

    currentEstimate[swapTargetIdx].n = item.n;
    currentEstimate[swapTargetIdx].p = Number(item.p) || 0;
    currentEstimate[swapTargetIdx].u = item.u || currentEstimate[swapTargetIdx].u || 'шт';
    currentEstimate[swapTargetIdx].sourceId = item.id || null;
    currentEstimate[swapTargetIdx].dbMeta = Object.assign({}, currentEstimate[swapTargetIdx].dbMeta || {}, {
      category: item.c || '',
      subcategory: getGroup(item),
      kind: item.kind || ''
    });

    if(typeof renderMainTable === 'function') renderMainTable();
    if(typeof closeModal === 'function') closeModal('swapModal');
    toast('✅ Заменено');
  };
})();


/* =========================================================
 * SOURCE: legacy/extracted-js-blocks/block-09.js
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 9
 * Original HTML lines: 5229-5656
 */

/* === HARD FIX 2026-05-13: global add real local copy + import refresh + smart replacement === */
(function(){
  

/* V40 FIXED: moved function qs to 11-pdf-files.js, 12-documents.js */


/* V40 FIXED: moved function msg to 01-visual.js */


/* V40 FIXED: moved function esc to 01-visual.js, 02-shield-configurator.js, 03-socket-pool.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js */
