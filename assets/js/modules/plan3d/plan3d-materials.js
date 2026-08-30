/* Electric Pro V29 — 3D-прогулка: материалы.
   По умолчанию все стены — светлая штукатурка (это и есть дефолт для мастера).
   Материал КОНКРЕТНОЙ стены берётся из той же модели, что и в 2D
   (EP.Plan.Geometry.wallMatOf -> «Бетон»/«Кирпич»/«Панель»/«Мягкий» и
   перегородочные), поэтому 3D не заводит своего справочника материалов —
   только сопоставляет уже существующие имена цвету/шероховатости. */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const P3 = (EP.Plan3D = EP.Plan3D || {});

  // цвет/шероховатость по имени материала стены из 2D-модели; всё, чего нет в
  // таблице (газоблок, ГКЛ, дерево и т.п.), рисуется штукатуркой — она дефолт
  const WALL = {
    "Бетон": { color: 0xd7d9dc, rough: 0.92 },
    "Кирпич": { color: 0xd8c4b4, rough: 0.95 },
    "Панель": { color: 0xdcdedf, rough: 0.9 },
    "Мягкий": { color: 0xe6e2d8, rough: 0.97 },
    "ГКЛ": { color: 0xeceff2, rough: 0.95 },
    "Газоблок": { color: 0xe2e6e4, rough: 0.96 },
    "Пеноблок": { color: 0xe2e6e4, rough: 0.96 },
    "ПГП": { color: 0xe8eaec, rough: 0.95 },
    "Дерево": { color: 0xc9a377, rough: 0.85 }
  };
  const PLASTER = { color: 0xe9eaec, rough: 0.94 };

  /* Процедурная «штукатурка»: мелкий шум на канвасе 256×256, ОДНА текстура на все
     стены (репит по мировым размерам). Без неё стены — идеально гладкие плоскости
     одного тона, и комната читается как коробка из CAD, а не как помещение: глазу
     не за что зацепиться, пропадает ощущение масштаба. Текстура генерируется в
     памяти (не файл) — офлайн-first, ничего не грузится. */
  function noiseTex(THREE) {
    const N = 256;
    const cv = document.createElement("canvas");
    cv.width = cv.height = N;
    const ctx = cv.getContext("2d");
    const img = ctx.createImageData(N, N);
    for (let i = 0; i < N * N; i++) {
      // контраст НАМЕРЕННО низкий: на первом прогоне шум 208..255 читался вблизи
      // как телевизионные помехи, а не как штукатурка
      const v = 236 + Math.round(Math.random() * 19);
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 4);
    t.anisotropy = 2;
    return t;
  }

  function make(THREE, p) {
    const cache = new Map();
    const tex = noiseTex(THREE);
    const std = (o) => new THREE.MeshStandardMaterial({ color: o.color, roughness: o.rough, metalness: 0, map: tex, bumpMap: tex, bumpScale: 0.05 });
    const wallOf = (name) => {
      const k = String(name || "");
      if (!cache.has(k)) cache.set(k, std(WALL[k] || PLASTER));
      return cache.get(k);
    };
    return {
      wallOf,
      // пол/потолок видны с обеих сторон: плоскость строится из полигона комнаты
      // и её нормаль после разворота смотрит вниз — DoubleSide избавляет от
      // «исчезающего пола», когда камера стоит ровно на нём
      floor: new THREE.MeshStandardMaterial({ color: 0xbfc4cb, roughness: 0.96, side: THREE.DoubleSide, map: tex }),
      ceil: new THREE.MeshStandardMaterial({ color: 0xf2f4f6, roughness: 0.98, side: THREE.DoubleSide }),
      shaft: new THREE.MeshStandardMaterial({ color: 0xa9b0ba, roughness: 0.9, map: tex }),
      tex,
      dispose() { cache.forEach((m) => m.dispose()); tex.dispose(); }
    };
  }

  P3.Materials = { make, WALL, PLASTER };
})();
