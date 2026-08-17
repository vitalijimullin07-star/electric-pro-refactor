/* ============================================================
   Electric Pro V29 — файл сметы (общий формат для ПРЕДВАРИТЕЛЬНОЙ и ОСНОВНОЙ)
   Один конверт, один разборщик, одно скачивание/чтение файла — чтобы смета,
   выгруженная из предварительной, без переделок грузилась в основную и наоборот.
   Формат:
     { type:"ep-estimate", v:1, exportedAt, name, object, client,
       items:[ { type:"work"|"material", name, unit, qty, price, base, source } ] }
   Разбор НАМЕРЕННО терпимый — файл могут собрать руками или выгрузить из другой
   программы: понимается и голый массив позиций, тип пишется как "work"/"работа",
   количество и с точкой, и с запятой; позиции без названия отбрасываются.
   ============================================================ */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const TYPE = "ep-estimate";

  function num(v) {
    const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
    return isFinite(n) ? n : 0;
  }
  // «Работа»/«work»/«раб…» → work, всё остальное → material
  function typeOf(v) {
    const s = String(v == null ? "" : v).trim().toLowerCase();
    return (s === "work" || s.indexOf("раб") === 0) ? "work" : "material";
  }
  function envelope(items, meta) {
    const m = meta || {};
    return {
      type: TYPE, v: 1,
      exportedAt: new Date().toISOString(),
      name: String(m.name || ""),
      object: String(m.object || ""),
      client: String(m.client || ""),
      items: (Array.isArray(items) ? items : []).map((x) => ({
        type: (x && x.type) === "work" ? "work" : "material",
        name: String((x && x.name) || ""), unit: String((x && x.unit) || ""),
        qty: num(x && x.qty), price: num(x && x.price),
        base: (x && x.base) || "", source: (x && x.source) || ""
      })).filter((x) => x.name)
    };
  }
  function parse(text) {
    let data = text;
    if (typeof text === "string") { try { data = JSON.parse(text); } catch (e) { return null; } }
    if (!data) return null;
    const raw = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : null);
    if (!raw) return null;
    const items = raw.map((it) => ({
      type: typeOf(it && it.type),
      name: String((it && it.name) || "").trim(),
      unit: String((it && it.unit) || "шт"),
      qty: num(it && it.qty != null ? it.qty : 1) || 1,
      price: num(it && it.price),
      base: (it && it.base) || ""
    })).filter((x) => x.name);
    if (!items.length) return null;
    const meta = Array.isArray(data) ? {} : data;
    return {
      items: items,
      name: String(meta.name || ""), object: String(meta.object || ""), client: String(meta.client || ""),
      works: items.filter((x) => x.type === "work").length,
      materials: items.filter((x) => x.type === "material").length
    };
  }
  function stamp() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  // сохранение файла: Blob + <a download> (в PWA работает и на телефоне)
  function download(name, text) {
    try {
      const blob = new Blob([text], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click();
      setTimeout(() => { try { URL.revokeObjectURL(url); a.remove(); } catch (e) {} }, 1500);
      return true;
    } catch (e) { return false; }
  }
  // чтение файла: скрытый input создаём ЛЕНИВО и переиспользуем; value="" обязателен —
  // иначе повторный выбор ТОГО ЖЕ файла не даёт события change
  function pickFile(cb) {
    let inp = document.getElementById("ep-est-file");
    if (!inp) {
      inp = document.createElement("input");
      inp.type = "file"; inp.accept = ".json,application/json"; inp.id = "ep-est-file";
      inp.style.display = "none";
      document.body.appendChild(inp);
    }
    inp.value = "";
    inp.onchange = () => {
      const f = inp.files && inp.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => cb(String(r.result || ""), f.name);
      r.onerror = () => cb(null, f.name);
      r.readAsText(f);
    };
    inp.click();
  }

  window.EP.EstimateFile = { TYPE, num, typeOf, envelope, parse, stamp, download, pickFile };
})();
