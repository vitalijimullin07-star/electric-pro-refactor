/* Electric Pro V29 — ЭКСПОРТ DXF (AutoCAD).
   Зачем: PDF показывает готовый лист, но дизайнер/проектировщик работает В CAD — ему нужно
   наложить электрику на свой чертёж, померить, подвинуть. DXF это даёт: слои, реальные
   координаты, отдельные объекты.

   ФОРМАТ — ASCII DXF R12 (AC1009), СОЗНАТЕЛЬНО САМЫЙ СТАРЫЙ. Его читает всё: AutoCAD,
   nanoCAD, BricsCAD, LibreCAD, Компас, онлайн-вьюеры. Более новые версии (R2000+) дают
   LWPOLYLINE и TrueColor, но требуют секций CLASSES/OBJECTS со словарями и сквозными
   handle'ами — руками это пишется с большим риском выдать файл, который откроется не везде.
   Плата за R12: цвета только из палитры ACI (индексы), полилинии старого формата
   POLYLINE/VERTEX/SEQEND и текст в однобайтовой кодировке (см. CP1251 ниже).

   КОДИРОВКА: R12 хранит текст в ANSI-кодировке, объявленной в $DWGCODEPAGE. Имена комнат
   и подписи у нас русские, поэтому файл отдаётся БАЙТАМИ в CP1251 (toCp1251), а не UTF-8:
   UTF-8 в R12 читатели покажут кракозябрами. Имена СЛОЁВ при этом принципиально латинские
   (EP-WALLS, EP-QF-QF1) — так их ждёт любой CAD-человек, и заодно не зависит от кодировки.

   ЕДИНИЦЫ: чертёж в CAD почти всегда в миллиметрах, модель плана — в САНТИМЕТРАХ, поэтому
   по умолчанию ×10. Ось Y в CAD растёт ВВЕРХ, в модели плана — ВНИЗ, поэтому Y отражается
   (и углы поворота меняют знак — иначе символы легли бы зеркально).

   ЧТО НЕ ДЕЛАЕМ И ПОЧЕМУ:
   · размеры выгружаются ЛИНИЯМИ и ТЕКСТОМ, а не объектами DIMENSION — настоящий размер в
     DXF тянет за собой таблицу DIMSTYLE и блок отрисовки; такие «размеры» всё равно не
     пересчитывались бы при растягивании, потому что геометрию тянет пользователь в CAD;
   · магистраль (⇉) не выгружается вообще — это аид редактора, а не кабель (то же решение,
     что уже принято для печатного листа);
   · выгружается АКТИВНЫЙ ЭТАЖ (как и «Общий план» в PDF) — этажи в DXF принято держать
     отдельными файлами, а не слоями одного. */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const RD = () => EP.Plan.Render;
  const EL = () => EP.Plan.Elements;
  const rooms = () => EP.Plan.Rooms;

  const T = {
    title: "⤓ Экспорт DXF (AutoCAD)",
    hint: "Слои, реальные координаты, отдельные объекты — чтобы дизайнер наложил электрику на свой чертёж в CAD.",
    units: "Единицы:", mm: "мм (обычно в CAD)", cm: "см (как в проекте)",
    what: "Что выгружается",
    go: "⤓ Скачать DXF",
    note: "Выгружается активный этаж. Размеры идут линиями с текстом (не объектами AutoCAD), магистраль ⇉ не выгружается — это подсказка редактора, а не кабель.",
    done: (n) => `Готово: объектов ${n}`,
    empty: "На этаже нечего выгружать — нарисуй хотя бы одну комнату."
  };

  /* ---------- палитра ACI ----------
     Полная палитра AutoCAD — 255 индексов; десятки 10..250 это ровно колесо насыщенных
     оттенков, поэтому берём их и «серую лесенку» 250..255 плюс базовые 1..9. Цвет слоя
     проекта подбирается БЛИЖАЙШИМ по RGB — точное попадание тут не нужно, нужна
     узнаваемость (жёлтый свет, красная сила, синяя слаботочка). */
  const ACI = [
    [1, 255, 0, 0], [2, 255, 255, 0], [3, 0, 255, 0], [4, 0, 255, 255], [5, 0, 0, 255],
    [6, 255, 0, 255], [7, 255, 255, 255], [8, 128, 128, 128], [9, 192, 192, 192],
    [20, 255, 63, 0], [30, 255, 127, 0], [40, 255, 191, 0], [60, 191, 255, 0], [70, 127, 255, 0],
    [80, 63, 255, 0], [100, 0, 255, 63], [110, 0, 255, 127], [120, 0, 255, 191],
    [140, 0, 191, 255], [150, 0, 127, 255], [160, 0, 63, 255], [180, 63, 0, 255],
    [190, 127, 0, 255], [200, 191, 0, 255], [220, 255, 0, 191], [230, 255, 0, 127],
    [240, 255, 0, 63], [250, 51, 51, 51], [251, 91, 91, 91], [252, 132, 132, 132],
    [253, 173, 173, 173], [254, 214, 214, 214]
  ];
  function hexRgb(hex) {
    const s = String(hex || "").replace("#", "");
    if (s.length === 3) return [parseInt(s[0] + s[0], 16), parseInt(s[1] + s[1], 16), parseInt(s[2] + s[2], 16)];
    if (s.length !== 6) return null;
    return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  }
  function aci(hex, def) {
    const c = hexRgb(hex);
    if (!c) return def == null ? 7 : def;
    let best = ACI[0], bd = Infinity;
    for (let i = 0; i < ACI.length; i++) {
      const e = ACI[i], d = (e[1] - c[0]) ** 2 + (e[2] - c[1]) ** 2 + (e[3] - c[2]) ** 2;
      if (d < bd) { bd = d; best = e; }
    }
    return best[0];
  }

  /* ---------- имена слоёв: только латиница ----------
     R12 разрешает в имени слоя буквы/цифры/$-_ и не любит пробелы; плюс кириллица в имени
     слоя завязалась бы на кодировку файла. Линия QF может называться «24В1» или «Int1» —
     транслитерируем, чтобы имя слоя осталось узнаваемым (EP-QF-24V1), а не превратилось в
     безликое EP-QF-3. */
  const TR = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y",
    к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
    х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya"
  };
  function layerName(s) {
    const out = String(s || "").toLowerCase().split("").map((ch) => (TR[ch] != null ? TR[ch] : ch)).join("");
    return (out.toUpperCase().replace(/[^A-Z0-9$_-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "X").slice(0, 30);
  }

  /* ---------- CP1251 ----------
     Кириллица в CP1251 лежит непрерывно: А-я = 0xC0..0xFF, отдельно ё (0xB8) и Ё (0xA8).
     Всё, чего в кодировке нет (эмодзи, «×», «·»), заменяем на близкий ASCII, а не на «?» —
     иначе в чертеже вместо «4×3 м» будет «4?3 м». */
  const CP_FIX = { "×": "x", "·": "-", "—": "-", "–": "-", "«": '"', "»": '"', "№": "N", "²": "2", "”": '"', "“": '"' };
  function toCp1251(str) {
    const s = String(str);
    const out = [];
    for (let i = 0; i < s.length; i++) {
      let ch = s[i];
      if (CP_FIX[ch]) ch = CP_FIX[ch];
      for (let j = 0; j < ch.length; j++) {
        const c = ch.charCodeAt(j);
        if (c < 128) { out.push(c); continue; }
        if (c === 0x401) { out.push(0xa8); continue; }        // Ё
        if (c === 0x451) { out.push(0xb8); continue; }        // ё
        if (c >= 0x410 && c <= 0x44f) { out.push(c - 0x410 + 0xc0); continue; }
        out.push(0x3f);                                        // всё прочее — «?»
      }
    }
    return new Uint8Array(out);
  }

  /* ---------- сборка файла ---------- */
  function W() {
    const buf = [];
    const api = {
      /* group code + значение. Числа пишем с ФИКСИРОВАННОЙ точкой (экспоненциальная запись
         вроде «1e-7» ломает часть читателей), НО коды 60-79 / 90-99 / 170-179 по спецификации
         ЦЕЛЫЕ — «$INSUNITS 4.0» или «62 1.0» строгий парсер имеет право отвергнуть. */
      g: (code, val) => {
        buf.push(String(code));
        const c = Number(code);
        const isInt = (c >= 60 && c <= 79) || (c >= 90 && c <= 99) || (c >= 170 && c <= 179);
        buf.push(typeof val === "number" ? (isInt ? String(Math.round(val)) : num(val)) : String(val == null ? "" : val));
        return api;
      },
      text: () => buf.join("\n") + "\n",
      count: 0
    };
    return api;
  }
  const num = (v) => {
    const n = Number(v);
    if (!isFinite(n)) return "0.0";
    const s = n.toFixed(4).replace(/0+$/, "").replace(/\.$/, ".0");
    return s === "-0.0" ? "0.0" : s;
  };

  function Doc(opts) {
    const w = W();
    const layers = new Map();     // name -> aci
    const blocks = [];            // {name, ents:[fn]}
    const ents = [];              // отложенные записи сущностей (пишем после таблиц)
    let n = 0;
    const bb = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    const K = opts.k, FY = -1;    // Y в CAD растёт вверх — отражаем
    const X = (cm) => cm * K;
    const Y = (cm) => cm * K * FY;
    const grow = (cm, cy) => {
      const x = X(cm), y = Y(cy);
      if (x < bb.x0) bb.x0 = x; if (x > bb.x1) bb.x1 = x;
      if (y < bb.y0) bb.y0 = y; if (y > bb.y1) bb.y1 = y;
    };
    const d = {
      X, Y, k: K,
      layer(name, color) { if (!layers.has(name)) layers.set(name, color == null ? 7 : color); return name; },
      // все примитивы принимают координаты В САНТИМЕТРАХ модели плана — перевод в единицы
      // файла и отражение Y живут ровно здесь, чтобы вызывающий об этом не думал
      line(lay, a, b) {
        grow(a.x, a.y); grow(b.x, b.y); n++;
        ents.push((o) => o.g(0, "LINE").g(8, lay).g(10, X(a.x)).g(20, Y(a.y)).g(30, 0).g(11, X(b.x)).g(21, Y(b.y)).g(31, 0));
      },
      poly(lay, pts, closed) {
        if (!pts || pts.length < 2) return;
        pts.forEach((p) => grow(p.x, p.y)); n++;
        ents.push((o) => {
          o.g(0, "POLYLINE").g(8, lay).g(66, 1).g(70, closed ? 1 : 0).g(10, 0).g(20, 0).g(30, 0);
          pts.forEach((p) => o.g(0, "VERTEX").g(8, lay).g(10, X(p.x)).g(20, Y(p.y)).g(30, 0));
          o.g(0, "SEQEND").g(8, lay);
        });
      },
      circle(lay, c, r) {
        grow(c.x - r, c.y - r); grow(c.x + r, c.y + r); n++;
        ents.push((o) => o.g(0, "CIRCLE").g(8, lay).g(10, X(c.x)).g(20, Y(c.y)).g(30, 0).g(40, Math.abs(r * K)));
      },
      // углы дуги — в градусах ПРОТИВ часовой в системе CAD; из-за отражения Y дуга,
      // заданная в координатах плана, идёт в другую сторону, поэтому концы меняются местами
      arc(lay, c, r, a0, a1) {
        grow(c.x - r, c.y - r); grow(c.x + r, c.y + r); n++;
        ents.push((o) => o.g(0, "ARC").g(8, lay).g(10, X(c.x)).g(20, Y(c.y)).g(30, 0).g(40, Math.abs(r * K)).g(50, -a1).g(51, -a0));
      },
      text(lay, p, h, s, rot, align) {
        if (s == null || s === "") return;
        grow(p.x, p.y); n++;
        ents.push((o) => {
          o.g(0, "TEXT").g(8, lay).g(10, X(p.x)).g(20, Y(p.y)).g(30, 0).g(40, Math.abs(h * K)).g(1, s).g(50, -(rot || 0)).g(7, "STANDARD");
          if (align === "c") o.g(72, 1).g(11, X(p.x)).g(21, Y(p.y)).g(31, 0);
        });
      },
      insert(lay, block, p, rot, color) {
        grow(p.x, p.y); n++;
        ents.push((o) => {
          o.g(0, "INSERT").g(8, lay);
          if (color != null) o.g(62, color);
          o.g(2, block).g(10, X(p.x)).g(20, Y(p.y)).g(30, 0).g(50, -(rot || 0));
        });
      },
      block(name, fn) { if (!blocks.some((b) => b.name === name)) blocks.push({ name, fn }); return name; },
      get n() { return n; },
      build() {
        // HEADER
        w.g(0, "SECTION").g(2, "HEADER");
        w.g(9, "$ACADVER").g(1, "AC1009");
        w.g(9, "$DWGCODEPAGE").g(3, "ANSI_1251");
        w.g(9, "$INSUNITS").g(70, opts.units === "cm" ? 5 : 4);   // 4 = мм, 5 = см
        const ok = isFinite(bb.x0);
        w.g(9, "$EXTMIN").g(10, ok ? bb.x0 : 0).g(20, ok ? bb.y0 : 0).g(30, 0);
        w.g(9, "$EXTMAX").g(10, ok ? bb.x1 : 0).g(20, ok ? bb.y1 : 0).g(30, 0);
        w.g(0, "ENDSEC");
        // TABLES: LTYPE (нужен хотя бы CONTINUOUS), LAYER, STYLE (без него не рисуется TEXT)
        w.g(0, "SECTION").g(2, "TABLES");
        w.g(0, "TABLE").g(2, "LTYPE").g(70, 2);
        w.g(0, "LTYPE").g(2, "CONTINUOUS").g(70, 0).g(3, "Solid line").g(72, 65).g(73, 0).g(40, 0);
        w.g(0, "LTYPE").g(2, "DASHED").g(70, 0).g(3, "- - - - - -").g(72, 65).g(73, 2).g(40, 15).g(49, 10).g(49, -5);
        w.g(0, "ENDTAB");
        w.g(0, "TABLE").g(2, "LAYER").g(70, layers.size + 1);
        w.g(0, "LAYER").g(2, "0").g(70, 0).g(62, 7).g(6, "CONTINUOUS");
        layers.forEach((col, name) => {
          const dash = /-(ROUTE|SWLINK)/.test(name) || opts.dashed.has(name);
          w.g(0, "LAYER").g(2, name).g(70, 0).g(62, col).g(6, dash ? "DASHED" : "CONTINUOUS");
        });
        w.g(0, "ENDTAB");
        w.g(0, "TABLE").g(2, "STYLE").g(70, 1);
        w.g(0, "STYLE").g(2, "STANDARD").g(70, 0).g(40, 0).g(41, 1).g(50, 0).g(71, 0).g(42, 2.5).g(3, "txt").g(4, "");
        w.g(0, "ENDTAB");
        w.g(0, "ENDSEC");
        // BLOCKS: *MODEL_SPACE/*PAPER_SPACE кладём для строгих читателей — без них часть
        // старых парсеров ругается на отсутствие пространства модели
        w.g(0, "SECTION").g(2, "BLOCKS");
        ["*MODEL_SPACE", "*PAPER_SPACE"].forEach((nm) => {
          w.g(0, "BLOCK").g(8, "0").g(2, nm).g(70, 0).g(10, 0).g(20, 0).g(30, 0).g(3, nm).g(1, "");
          w.g(0, "ENDBLK").g(8, "0");
        });
        blocks.forEach((b) => {
          w.g(0, "BLOCK").g(8, "0").g(2, b.name).g(70, 0).g(10, 0).g(20, 0).g(30, 0).g(3, b.name).g(1, "");
          b.fn(w);
          w.g(0, "ENDBLK").g(8, "0");
        });
        w.g(0, "ENDSEC");
        w.g(0, "SECTION").g(2, "ENTITIES");
        ents.forEach((fn) => fn(w));
        w.g(0, "ENDSEC");
        w.g(0, "EOF");
        return w.text();
      }
    };
    return d;
  }

  /* ---------- блоки приборов ----------
     Геометрия «лица» берётся из EP.Plan.Render.deviceFace — ТОГО ЖЕ единственного
     источника, по которому прибор рисуется на плане в режиме «1:1», в развёртке и в PDF.
     Символ в DXF физически не может разойтись с печатным листом. Примитивы приходят в
     МИЛЛИМЕТРАХ относительно центра, у нас всё в сантиметрах — делим на 10. */
  function pathPts(dstr) {
    // только «M x y L x y ... Z» — единственная форма, которую выдаёт deviceFace (гнездо
    // RJ45). Любая кривая/относительная команда — возвращаем null и примитив пропускаем,
    // чтобы не выдумывать геометрию, которой нет.
    const t = String(dstr || "").trim().split(/[\s,]+/);
    const pts = [];
    let i = 0;
    while (i < t.length) {
      const c = t[i];
      if (c === "M" || c === "L") {
        const x = Number(t[i + 1]), y = Number(t[i + 2]);
        if (!isFinite(x) || !isFinite(y)) return null;
        pts.push({ x, y }); i += 3;
      } else if (c === "Z" || c === "z") { i += 1; }
      else return null;
    }
    return pts.length >= 3 ? pts : null;
  }
  // posts — состав блока: [{type, keys}...]. У одиночной точки это один пост. Смешанный
  // блок (розетка+розетка+интернет) получает СВОЙ блок с разными «лицами» по постам, а не
  // N копий первого поста — иначе на чертеже интернет выглядел бы розеткой.
  function blockFor(doc, posts) {
    const R = RD();
    const key = posts.map((q) => q.type + (q.type === "switch" ? "" + Math.max(1, Math.min(3, q.keys || 1)) : "")).join("_");
    const name = "EP_" + layerName(key).replace(/-/g, "_");
    return doc.block(name, (o) => {
      const cnt = Math.max(1, posts.length);
      const fw = (R && R.frameWcm ? R.frameWcm(cnt) : 8.4 * cnt);
      const fh = (R && R.frameHcm ? R.frameHcm() : 8.4);
      const X = doc.X, Y = doc.Y;
      const rect = (x, y, w2, h2) => {
        o.g(0, "POLYLINE").g(8, "0").g(66, 1).g(70, 1).g(10, 0).g(20, 0).g(30, 0);
        [[x, y], [x + w2, y], [x + w2, y + h2], [x, y + h2]].forEach((p) => o.g(0, "VERTEX").g(8, "0").g(10, X(p[0])).g(20, Y(p[1])).g(30, 0));
        o.g(0, "SEQEND").g(8, "0");
      };
      rect(-fw / 2, -fh / 2, fw, fh);                             // рамка в реальном габарите
      const step = fw / cnt;
      posts.forEach((q, i) => {
        const cx = -fw / 2 + step * (i + 0.5);
        const prim = (R && R.deviceFace) ? (R.deviceFace(q.type, q.keys) || []) : [];
        const face = prim.filter((x) => x.cls !== "post");         // сам «post» = наша рамка
        if (!face.length) {
          // у прибора нет «лица» (кондиционер, камера, бра) — буква-глиф, как в «Простом» стиле
          const t = (EL() && EL().TYPES[q.type]) || null;
          o.g(0, "TEXT").g(8, "0").g(10, X(cx)).g(20, 0).g(30, 0).g(40, Math.abs(4 * doc.k))
            .g(1, t ? t.glyph : "?").g(50, 0).g(7, "STANDARD").g(72, 1).g(11, X(cx)).g(21, 0).g(31, 0);
          return;
        }
        face.forEach((s) => {
          if (s.t === "circle") { o.g(0, "CIRCLE").g(8, "0").g(10, X(cx + s.cx / 10)).g(20, Y(s.cy / 10)).g(30, 0).g(40, Math.abs(s.r / 10 * doc.k)); }
          else if (s.t === "rect") rect(cx + s.x / 10, s.y / 10, s.w / 10, s.h / 10);
          else if (s.t === "line") { o.g(0, "LINE").g(8, "0").g(10, X(cx + s.x1 / 10)).g(20, Y(s.y1 / 10)).g(30, 0).g(11, X(cx + s.x2 / 10)).g(21, Y(s.y2 / 10)).g(31, 0); }
          else if (s.t === "text") { o.g(0, "TEXT").g(8, "0").g(10, X(cx + s.x / 10)).g(20, Y(s.y / 10)).g(30, 0).g(40, Math.abs(s.s / 10 * doc.k)).g(1, s.txt).g(50, 0).g(7, "STANDARD").g(72, 1).g(11, X(cx + s.x / 10)).g(21, Y(s.y / 10)).g(31, 0); }
          else if (s.t === "path") {
            const pp = pathPts(s.d);
            if (!pp) return;
            o.g(0, "POLYLINE").g(8, "0").g(66, 1).g(70, 1).g(10, 0).g(20, 0).g(30, 0);
            pp.forEach((pnt) => o.g(0, "VERTEX").g(8, "0").g(10, X(cx + pnt.x / 10)).g(20, Y(pnt.y / 10)).g(30, 0));
            o.g(0, "SEQEND").g(8, "0");
          }
        });
      });
    });
  }

  /* ---------- геометрия стен: рёбра, разрезанные проёмами ----------
     Стена рисуется ДВУМЯ рёбрами (внутренним и наружным) плюс «щёки» проёмов. Митра-кольца
     G.roomBand дают углы, но точки разреза считаем по ОСИ стены со смещением на th/2 —
     угловая точка кольца лежит на той же прямой (митра это пересечение двух смещённых
     прямых), поэтому точки коллинеарны и разрез точен. */
  function cutSegment(a, b, spans) {
    // spans: [[t0,t1]...] в долях 0..1 вдоль a→b; возвращаем оставшиеся куски
    const keep = [];
    const list = spans.slice().sort((u, v) => u[0] - v[0]);
    let t = 0;
    list.forEach((s) => {
      const s0 = Math.max(0, Math.min(1, s[0])), s1 = Math.max(0, Math.min(1, s[1]));
      if (s1 <= t) return;
      if (s0 > t) keep.push([t, s0]);
      t = Math.max(t, s1);
    });
    if (t < 1) keep.push([t, 1]);
    const at = (u) => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });
    return keep.filter((s) => s[1] - s[0] > 1e-6).map((s) => [at(s[0]), at(s[1])]);
  }

  function wallKey(w) {
    const r = (v) => Math.round(v);
    const p = [r(w.a.x), r(w.a.y)], q = [r(w.b.x), r(w.b.y)];
    return (p[0] < q[0] || (p[0] === q[0] && p[1] <= q[1])) ? p.join(",") + "|" + q.join(",") : q.join(",") + "|" + p.join(",");
  }

  /* ---------- главное: сборка чертежа ---------- */
  function build(project, opts) {
    opts = opts || {};
    const g = G();
    const p = g.floorScoped(project);
    const units = opts.units === "cm" ? "cm" : "mm";
    const doc = Doc({ k: units === "cm" ? 1 : 10, units, dashed: new Set(["EP-SWLINK"]) });
    const on = (id) => opts.parts ? opts.parts.has(id) : true;
    const layColor = (id, def) => {
      const l = (p.layers || []).find((x) => x.id === id);
      return aci(l && l.color, def);
    };

    const L_WALL = doc.layer("EP-WALLS", 7);
    const L_OPEN = doc.layer("EP-OPENINGS", 30);
    const L_ROOM = doc.layer("EP-ROOMS", 9);
    const L_TEXT = doc.layer("EP-TEXT", 7);
    const L_LBL = doc.layer("EP-LABELS", 9);

    /* --- стены комнат --- */
    if (on("walls")) {
      const seen = new Set();
      (p.rooms || []).forEach((room) => {
        const band = g.roomBand(p, room);
        const walls = g.walls(room);
        walls.forEach((w, i) => {
          const key = wallKey(w);
          if (seen.has(key)) return;                   // общая стена двух комнат — одна линия
          seen.add(key);
          const th = g.wallThOf(p, w);
          const fr = g.wallFrame(p, w);
          if (!fr || !w.len) return;
          const half = th / 2;
          const inA = band ? band.inner[i] : { x: w.a.x + fr.nrm.x * half, y: w.a.y + fr.nrm.y * half };
          const inB = band ? band.inner[(i + 1) % walls.length] : { x: w.b.x + fr.nrm.x * half, y: w.b.y + fr.nrm.y * half };
          const ouA = band && band.outer ? band.outer[i] : { x: w.a.x - fr.nrm.x * half, y: w.a.y - fr.nrm.y * half };
          const ouB = band && band.outer ? band.outer[(i + 1) % walls.length] : { x: w.b.x - fr.nrm.x * half, y: w.b.y - fr.nrm.y * half };
          /* Точки разреза считаем ОТ ОСИ стены и сносим на ±th/2 по нормали, а параметр
             вдоль ребра получаем ПРОЕКЦИЕЙ. Наивное «доля offset/len одинаковая на оси и
             на ребре» НЕВЕРНО: митра укорачивает внутреннее ребро и удлиняет наружное
             (у стены 0..400 внутреннее идёт 5..395, наружное −5..405), и одна и та же
             доля даёт РАЗНЫЕ точки — «щёки» проёма выходили косыми, а сам проём смещённым
             (поймано разбором координат готового DXF через ezdxf, на глаз не видно). */
          const dir = { x: (w.b.x - w.a.x) / w.len, y: (w.b.y - w.a.y) / w.len };
          const edge = (s, sign) => ({ x: w.a.x + dir.x * s + fr.nrm.x * half * sign, y: w.a.y + dir.y * s + fr.nrm.y * half * sign });
          const tOn = (A, B, P) => {
            const dx = B.x - A.x, dy = B.y - A.y, d2 = dx * dx + dy * dy;
            return d2 ? ((P.x - A.x) * dx + (P.y - A.y) * dy) / d2 : 0;
          };
          const spans = g.wallOpeningSpans(p, w);
          const spIn = spans.map((o) => [tOn(inA, inB, edge(o.offset, 1)), tOn(inA, inB, edge(o.offset + o.width, 1))]);
          const spOu = spans.map((o) => [tOn(ouA, ouB, edge(o.offset, -1)), tOn(ouA, ouB, edge(o.offset + o.width, -1))]);
          cutSegment(inA, inB, spIn).forEach((s) => doc.line(L_WALL, s[0], s[1]));
          cutSegment(ouA, ouB, spOu).forEach((s) => doc.line(L_WALL, s[0], s[1]));
          // «щёки» проёма — перемычки строго ПОПЕРЁК стены на его кромках
          spans.forEach((o) => [o.offset, o.offset + o.width].forEach((s) => doc.line(L_WALL, edge(s, 1), edge(s, -1))));
        });
        // контур помещения по чистовой поверхности — по нему в CAD считают площади отделки
        if (band && band.inner) doc.poly(L_ROOM, band.inner, true);
      });
      /* Символы проёмов рисуем ОТДЕЛЬНЫМ проходом по p.openings и от ВЛАДЕЮЩЕЙ стены —
         ровно теми же op.flip (сторона открывания) и op.hinge (на какой кромке петли),
         что и plan-render.js на экране. Внутри цикла по стенам это было бы неверно: у
         общей стены двух комнат проём привязан к ОДНОЙ из них, а на соседней он лишь
         спроецирован (wallOpeningSpans), и знак flip относительно её направления другой —
         дверь открывалась бы не в ту сторону. */
      if (on("openings")) {
        (p.openings || []).forEach((op) => {
          const w = g.wallById(p, op.wallId);
          if (!w || !w.len) return;
          const a = g.pointAtOffset(w, op.offset), b = g.pointAtOffset(w, op.offset + op.width);
          const dx = (w.b.x - w.a.x) / w.len, dy = (w.b.y - w.a.y) / w.len;
          const nx = -dy * (op.flip || 1), ny = dx * (op.flip || 1);
          const kind = op.kind || (op.type === "window" ? "window" : "door");
          const deg = (x, y) => Math.atan2(y, x) * 180 / Math.PI;
          // дуга ВСЕГДА короткая (90°): наивное min/max по углам ломается на переходе через
          // ±180° и выдавало бы дугу на 270° вместо 90°
          const swing = (h, far, width) => {
            const leaf = { x: h.x + nx * width, y: h.y + ny * width };
            doc.line(L_OPEN, h, leaf);
            const aF = deg(far.x - h.x, far.y - h.y), aL = deg(nx, ny);
            const d = ((aL - aF + 540) % 360) - 180;
            if (d >= 0) doc.arc(L_OPEN, h, width, aF, aL); else doc.arc(L_OPEN, h, width, aL, aF);
          };
          const win = (pa, pb) => {
            const th = g.wallThOf(p, w) / 2;
            [1, 0, -1].forEach((s) => doc.line(L_OPEN, { x: pa.x + nx * th * s, y: pa.y + ny * th * s }, { x: pb.x + nx * th * s, y: pb.y + ny * th * s }));
          };
          if (kind === "door") swing(op.hinge === "a" ? a : b, op.hinge === "a" ? b : a, op.width);
          else if (kind === "sliding") doc.line(L_OPEN, a, b);
          else if (kind === "balcony") {
            const dW = Math.min(80, op.width * 0.5);
            const h = op.hinge === "a" ? a : b;
            const far = { x: h.x + dx * (op.hinge === "a" ? dW : -dW), y: h.y + dy * (op.hinge === "a" ? dW : -dW) };
            win(op.hinge === "a" ? far : a, op.hinge === "a" ? b : far);
            swing(h, far, dW);
          } else if (kind !== "opening") win(a, b);   // «проём» — только вырез, символа нет
        });
      }
      // перегородки/перемычки (p.beams) — прямоугольник по ширине балки
      (p.beams || []).forEach((b) => {
        const len = g.dist(b.a, b.b);
        if (!len) return;
        const half = (b.width || 10) / 2;
        const nx = -(b.b.y - b.a.y) / len * half, ny = (b.b.x - b.a.x) / len * half;
        doc.poly(L_WALL, [
          { x: b.a.x + nx, y: b.a.y + ny }, { x: b.b.x + nx, y: b.b.y + ny },
          { x: b.b.x - nx, y: b.b.y - ny }, { x: b.a.x - nx, y: b.a.y - ny }
        ], true);
      });
      // внутренние препятствия (вентшахта / мини-комната)
      (p.voids || []).forEach((v) => {
        doc.poly(L_WALL, [
          { x: v.a.x, y: v.a.y }, { x: v.b.x, y: v.a.y }, { x: v.b.x, y: v.b.y }, { x: v.a.x, y: v.b.y }
        ], true);
      });
    }

    /* --- подписи помещений --- */
    if (on("text")) {
      (p.rooms || []).forEach((room) => {
        const c = g.centroid(room.points);
        if (!c) return;
        const area = g.roomNetArea ? g.roomNetArea(p, room) : g.area(room.points);
        doc.text(L_TEXT, c, 18, String(room.name || "Комната"), 0, "c");
        doc.text(L_TEXT, { x: c.x, y: c.y + 24 }, 14, g.fmtArea(area), 0, "c");
      });
    }

    /* --- приборы --- */
    if (on("devices")) {
      const types = EL() ? EL().TYPES : {};
      (p.elements || []).forEach((el) => {
        const t = types[el.type];
        if (!t) return;
        const pt = g.elemDrawPoint(p, el);
        if (!pt) return;
        const layId = el.layer || t.layer || "power";
        const lay = doc.layer("EP-" + layerName(layId), layColor(layId, 7));
        const posts = el.type === "block"
          ? (el.items || []).map((it) => ({ type: it.type || "socket", keys: it.keys }))
          : [{ type: el.type, keys: el.keys }];
        if (!posts.length) posts.push({ type: "socket" });
        const rot = pt.wall ? (g.wallFrame(p, pt.wall, el.beamSide) || {}).angle || 0 : 0;
        doc.insert(lay, blockFor(doc, posts), pt, rot);
        // подпись высоты — СВОИМ слоем (не вместе с именами комнат): её гасят первой, когда
        // накладывают электрику на дизайнерский план. Отступ считаем от габарита рамки,
        // иначе текст ложится прямо на символ (видно на рендере готового DXF)
        if (on("text") && el.height != null && el.wallId) {
          const R = RD();
          const dy = (R && R.frameHcm ? R.frameHcm() : 8.4) / 2 + 4;
          doc.text(L_LBL, { x: pt.x, y: pt.y + dy }, 5, "h=" + Math.round(el.height), 0, "c");
        }
      });
      // щиты
      const LP = doc.layer("EP-PANEL", 1);
      (p.panels || []).forEach((pn) => {
        const w2 = 12, h2 = 8;
        doc.poly(LP, [
          { x: pn.x - w2, y: pn.y - h2 }, { x: pn.x + w2, y: pn.y - h2 },
          { x: pn.x + w2, y: pn.y + h2 }, { x: pn.x - w2, y: pn.y + h2 }
        ], true);
        if (on("text")) doc.text(L_LBL, { x: pn.x, y: pn.y - h2 - 4 }, 8, String(pn.name || "Щит"), 0, "c");
      });
      // светодиодная лента
      (p.ledStrips || []).forEach((s) => {
        const w = g.wallById(p, s.wallId);
        if (!w || !w.len) return;
        const at = (off) => ({ x: w.a.x + (w.b.x - w.a.x) * (off / w.len), y: w.a.y + (w.b.y - w.a.y) * (off / w.len) });
        doc.line(doc.layer("EP-LIGHT", layColor("light", 2)), at(s.offsetA), at(s.offsetB));
      });
    }

    /* --- трассы: СВОЙ слой на каждую линию QF, чтобы их можно было гасить по одной --- */
    if (on("routes")) {
      const byId = {};
      (p.circuits || []).forEach((c) => { byId[c.id] = c; });
      const LSL = doc.layer("EP-SLEEVES", 8);
      (p.routes || []).forEach((rt) => {
        const c = byId[rt.circuitId];
        const nm = c ? layerName(c.name || "QF") : "NONE";
        const lay = doc.layer("EP-QF-" + nm, aci(c && c.color, 8));
        doc.poly(lay, rt.points || [], false);
        (rt.throughWalls || []).forEach((cr) => {
          doc.circle(LSL, cr, (p.settings && p.settings.sleeveD ? p.settings.sleeveD : 20) / 20);
        });
      });
    }

    /* --- размеры: линии + текст (не объекты DIMENSION, см. шапку файла) --- */
    if (on("dims")) {
      const LD = doc.layer("EP-DIMS", layColor("dims", 9));
      const off = (p.settings && p.settings.dimOffset != null) ? p.settings.dimOffset : 5;
      (p.rooms || []).forEach((room) => {
        g.walls(room).forEach((w) => {
          // ТЕ ЖЕ станции, что рисует план (G.wallChainStations) — цепочка в DXF и на
          // экране не могут разойтись, это один расчёт
          const st = g.wallChainStations ? g.wallChainStations(p, w) : null;
          if (!st || !st.segs || !st.segs.length) return;
          const th = g.wallThOf(p, w), fr = g.wallFrame(p, w);
          if (!fr) return;
          const d = th / 2 + off;
          const at = (s) => ({ x: w.a.x + (w.b.x - w.a.x) * (s / w.len) + fr.nrm.x * d, y: w.a.y + (w.b.y - w.a.y) * (s / w.len) + fr.nrm.y * d });
          st.segs.forEach((sg) => {
            const a = at(sg.aOff), b = at(sg.bOff);
            const len = Math.round(sg.dist);
            if (len < 2) return;
            doc.line(LD, a, b);
            doc.line(LD, { x: a.x - fr.nrm.x * 3, y: a.y - fr.nrm.y * 3 }, { x: a.x + fr.nrm.x * 3, y: a.y + fr.nrm.y * 3 });
            doc.line(LD, { x: b.x - fr.nrm.x * 3, y: b.y - fr.nrm.y * 3 }, { x: b.x + fr.nrm.x * 3, y: b.y + fr.nrm.y * 3 });
            doc.text(LD, { x: (a.x + b.x) / 2 + fr.nrm.x * 4, y: (a.y + b.y) / 2 + fr.nrm.y * 4 }, 9, String(len), fr.angle, "c");
          });
        });
      });
      // свои размеры (p.dims) — тем же слоем, с выносными линиями к точкам замера
      (p.dims || []).forEach((dm) => {
        const gm = g.dimGeom ? g.dimGeom(dm) : null;
        if (!gm) return;
        doc.line(LD, gm.A, gm.B);
        doc.line(LD, dm.a, gm.A);
        doc.line(LD, dm.b, gm.B);
        doc.text(LD, gm.mid, 10, g.fmtLen(gm.len), 0, "c");
      });
    }

    /* --- мебель и техника --- */
    if (on("furn")) {
      const LF = doc.layer("EP-FURN", layColor("furn", 9));
      (p.appliances || []).forEach((a) => {
        const w2 = (a.w || 60) / 2, d2 = (a.d || 60) / 2;
        const rad = ((a.rot || 0) * Math.PI) / 180, cs = Math.cos(rad), sn = Math.sin(rad);
        const pts = [[-w2, -d2], [w2, -d2], [w2, d2], [-w2, d2]].map((q) => ({ x: a.x + q[0] * cs - q[1] * sn, y: a.y + q[0] * sn + q[1] * cs }));
        doc.poly(LF, pts, true);
        if (on("text")) doc.text(LF, { x: a.x, y: a.y }, 9, String(a.name || ""), -(a.rot || 0), "c");
      });
    }

    /* --- заметки --- */
    if (on("text")) {
      const LN = doc.layer("EP-NOTES", 2);
      (p.notes || []).forEach((nt) => {
        String(nt.text || "").split("\n").forEach((ln, i) => doc.text(LN, { x: nt.x, y: nt.y + i * 12 }, 10, ln, 0));
        if (nt.ax != null && nt.ay != null) doc.line(LN, { x: nt.x, y: nt.y }, { x: nt.ax, y: nt.ay });
      });
    }

    return { text: doc.build(), count: doc.n };
  }

  /* ---------- скачивание ---------- */
  /* Имя файла — ЛАТИНИЦЕЙ (транслит той же таблицей, что и имена слоёв). Файл уезжает в
     CAD, часто на Windows и через почту, а кириллица в имени там регулярно бьётся — плюс
     часть браузеров теряет расширение у не-ASCII имени, и вместо «.dxf» получается файл
     «download», который ничем не открывается (проверено: то же самое видно в headless
     Chromium). Расширение обязано остаться. */
  function fileName(p) {
    const raw = String((p && p.name) || "").toLowerCase();
    const tr = raw.split("").map((ch) => (TR[ch] != null ? TR[ch] : ch)).join("");
    const safe = tr.replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
    return "ep-plan-" + (safe || "proekt") + ".dxf";
  }
  function download(project, opts) {
    const r = build(project, opts);
    // байты в CP1251 (см. шапку): UTF-8 в R12 читатели покажут кракозябрами
    const blob = new Blob([toCp1251(r.text)], { type: "application/dxf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = fileName(project);
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return r.count;
  }

  /* ---------- UI ---------- */
  const PARTS = [
    ["walls", "Стены, перегородки, проёмы"],
    ["openings", "Символы дверей и окон"],
    ["devices", "Приборы, щиты, лента"],
    ["routes", "Трассы (свой слой на линию QF)"],
    ["dims", "Размеры"],
    ["furn", "Мебель и техника"],
    ["text", "Подписи и заметки"]
  ];
  const UK = "ep_plan_dxf_v1";
  let units = "mm", parts = null;
  function loadCfg() {
    if (parts) return;
    parts = new Set(PARTS.map((x) => x[0]));
    try {
      const v = JSON.parse(localStorage.getItem(UK) || "null");
      if (v && v.units === "cm") units = "cm";
      // пустой/битый список трактуем как «всё» — иначе кнопка молча отдавала бы пустой
      // файл, и починить это из интерфейса было бы нечем (тот же принцип, что у разделов PDF)
      if (v && Array.isArray(v.parts) && v.parts.length) parts = new Set(v.parts);
    } catch (e) {}
  }
  function saveCfg() {
    try { localStorage.setItem(UK, JSON.stringify({ units, parts: [...parts] })); } catch (e) {}
  }
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function sheet() {
    loadCfg();
    const chip = (u, label) => `<button type="button" class="ep-plan-chip ep-clickable${units === u ? " on" : ""}" data-pdx-u="${u}">${esc(label)}</button>`;
    // та же строка-переключатель, что у разделов PDF (.ep-plan-secrow) — не заводим второй
    // вид списка ради того же самого; <button>, а не <input type=checkbox>: base.css
    // растягивает любой input на width:100%
    const row = ([id, label]) => `<button type="button" class="ep-plan-secrow ep-clickable ${parts.has(id) ? "on" : ""}" data-pdx-p="${id}">
        <i>${parts.has(id) ? "✓" : ""}</i><span>${esc(label)}</span></button>`;
    rooms().openSheet(`<div class="ep-plan-srow"><b>${T.title}</b><span class="ep-plan-flex"></span>
        <button type="button" class="ep-plan-mini ep-clickable" data-sheet-fs aria-label="Во весь экран">⛶</button>
        <button type="button" class="ep-plan-mini ep-clickable" data-pdx-close>✕</button></div>
      <div class="ep-plan-modehint">${T.hint}</div>
      <div class="ep-plan-srow">${T.units}${chip("mm", T.mm)}${chip("cm", T.cm)}</div>
      <div class="ep-plan-modehint">${T.what}</div>
      <div class="ep-plan-secs">${PARTS.map(row).join("")}</div>
      <div class="ep-plan-modehint">${T.note}</div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pdx-go ${parts.size ? "" : "disabled"}>${T.go}</button>
      </div>`);
  }

  document.addEventListener("click", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    const t = e.target;
    const u = t.closest("[data-pdx-u]");
    if (u) { loadCfg(); units = u.getAttribute("data-pdx-u"); saveCfg(); sheet(); return; }
    const pr = t.closest("[data-pdx-p]");
    if (pr) {
      loadCfg();
      const id = pr.getAttribute("data-pdx-p");
      if (parts.has(id)) parts.delete(id); else parts.add(id);
      saveCfg(); sheet(); return;
    }
    if (t.closest("[data-pdx-close]")) { rooms().closeSheet(); return; }
    if (t.closest("[data-pdx-go]")) {
      loadCfg();
      const p = core() && core().project;
      if (!p || !(G().floorScoped(p).rooms || []).length) { rooms().toast(T.empty); return; }
      const n = download(p, { units, parts });
      rooms().closeSheet();
      rooms().toast(T.done(n));
      return;
    }
  });

  EP.Plan = EP.Plan || {};
  EP.Plan.Dxf = { build, download, sheet, toCp1251, aci, layerName, pathPts, cutSegment, fileName, PARTS, T };
})();
