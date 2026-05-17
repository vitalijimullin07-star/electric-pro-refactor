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
