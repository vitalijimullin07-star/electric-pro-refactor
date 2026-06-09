(function () {
  window.EP = window.EP || {};

  const OLD_KEY = "ep_visual_settings_clean_v5_3";
  const NEW_KEY = "ep.visual.v29";

  const base = {
    soundEnabled: false,
    hapticEnabled: true,
    volume: 0.35,
    style: "soft"
  };

  let runtime = readSettings();
  let audioContext = null;
  let masterGain = null;
  let unlocked = false;
  let lastAt = 0;

  function readJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "{}");
    } catch (error) {
      return {};
    }
  }

  function normalize(value) {
    const input = value || {};
    return {
      soundEnabled: Boolean(input.soundEnabled),
      hapticEnabled: input.hapticEnabled !== false,
      volume: Math.max(0, Math.min(1, Number(input.volume ?? input.soundVolume ?? base.volume))),
      style: String(input.style || input.soundStyle || base.style)
    };
  }

  function readSettings() {
    return normalize(Object.assign({}, base, readJson(OLD_KEY), readJson(NEW_KEY), runtime || {}));
  }

  function setSettings(next) {
    runtime = normalize(Object.assign({}, readSettings(), next || {}));
    if (masterGain && audioContext) {
      masterGain.gain.setTargetAtTime(outputVolume(), audioContext.currentTime, 0.015);
    }
    return runtime;
  }

  function outputVolume(multiplier = 1) {
    const value = readSettings();
    const baseVolume = value.volume <= 0 ? 0 : Math.max(0.055, value.volume * 0.28);
    return Math.min(0.22, baseVolume * multiplier);
  }

  function ensureAudio() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioContext) {
      audioContext = new AudioContextClass();
      masterGain = audioContext.createGain();
      masterGain.gain.value = outputVolume();
      masterGain.connect(audioContext.destination);
    }

    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }

    return audioContext;
  }

  async function unlock() {
    const context = ensureAudio();
    if (!context) return false;

    try {
      if (context.state === "suspended") await context.resume();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.0001, now);

      oscillator.connect(gain);
      gain.connect(masterGain || context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.012);
      unlocked = true;
      return true;
    } catch (error) {
      console.warn("Device feedback unlock skipped", error);
      return false;
    }
  }

  function preset(type) {
    const value = readSettings();
    const style = value.style;

    if (style === "silent") return null;

    const table = {
      tap: { f1: 620, f2: 760, d: 0.07, wave: "sine", vib: 10 },
      click: { f1: 620, f2: 760, d: 0.07, wave: "sine", vib: 10 },
      nav: { f1: 560, f2: 780, d: 0.085, wave: "triangle", vib: 14 },
      back: { f1: 420, f2: 320, d: 0.075, wave: "triangle", vib: 12 },
      success: { f1: 660, f2: 940, d: 0.10, wave: "sine", vib: 18 },
      error: { f1: 190, f2: 150, d: 0.13, wave: "sawtooth", vib: [25, 25, 25] },
      test: { f1: 720, f2: 980, d: 0.16, wave: "triangle", vib: [35, 30, 35], loud: 1.45 }
    };

    const result = table[type] || table.tap;
    if (style === "short") result.d = Math.min(result.d, 0.055);
    if (style === "electric-soft") {
      result.wave = "square";
      result.d = Math.max(result.d, 0.09);
    }
    return result;
  }

  function vibrate(pattern) {
    const value = readSettings();
    if (!value.hapticEnabled) return false;
    if (!navigator.vibrate) return false;

    try {
      navigator.vibrate(pattern || 12);
      return true;
    } catch (error) {
      return false;
    }
  }

  function play(type = "tap", options = {}) {
    const value = readSettings();
    const force = Boolean(options.force);
    if (!force && !value.soundEnabled) return false;

    const nowMs = Date.now();
    if (!force && nowMs - lastAt < 40) return false;
    lastAt = nowMs;

    const data = preset(type);
    if (!data) return false;

    const context = ensureAudio();
    if (!context) return false;

    try {
      const now = context.currentTime;
      const duration = data.d;
      const end = now + duration;
      const gain = context.createGain();
      const oscA = context.createOscillator();
      const oscB = context.createOscillator();

      oscA.type = data.wave;
      oscB.type = "sine";
      oscA.frequency.setValueAtTime(data.f1, now);
      oscA.frequency.exponentialRampToValueAtTime(Math.max(80, data.f2), end);
      oscB.frequency.setValueAtTime(data.f2 * 1.5, now);
      oscB.frequency.exponentialRampToValueAtTime(Math.max(80, data.f1 * 1.2), end);

      const peak = outputVolume(data.loud || 1);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);

      oscA.connect(gain);
      oscB.connect(gain);
      gain.connect(masterGain || context.destination);
      oscA.start(now);
      oscB.start(now);
      oscA.stop(end + 0.015);
      oscB.stop(end + 0.015);
      return true;
    } catch (error) {
      console.warn("Device feedback sound skipped", error);
      return false;
    }
  }

  function feedback(type = "tap", options = {}) {
    const data = preset(type);
    const played = play(type, options);
    if (options.force || readSettings().hapticEnabled) vibrate(data?.vib || 12);
    return played;
  }

  function bind() {
    document.addEventListener("pointerdown", () => {
      unlock();
    }, { once: true, passive: true, capture: true });

    document.addEventListener("click", (event) => {
      const target = event.target.closest("button, [data-route], .tile, .nav-link, .ep-clickable, .theme-btn");
      if (!target) return;

      if (target.id === "app-back" || target.classList.contains("back-button")) {
        feedback("back");
        return;
      }

      if (target.matches("[data-route], .nav-link, .tile")) {
        feedback("nav");
        return;
      }

      feedback("tap");
    }, true);

    window.addEventListener("ep:route-loaded", () => feedback("success"));
    window.addEventListener("storage", () => setSettings(readSettings()));
  }

  const api = {
    unlock,
    setSettings,
    click: () => feedback("tap"),
    tap: () => feedback("tap"),
    nav: () => feedback("nav"),
    back: () => feedback("back"),
    success: () => feedback("success"),
    error: () => feedback("error", { force: true }),
    test: async () => {
      await unlock();
      setSettings({ soundEnabled: true, hapticEnabled: true, volume: Math.max(readSettings().volume, 0.55) });
      feedback("test", { force: true });
      return true;
    },
    vibrate: (pattern) => vibrate(pattern || 24),
    enabled: () => readSettings().soundEnabled,
    state: () => ({ unlocked, audioState: audioContext?.state || "none", settings: readSettings() })
  };

  window.SoundAPI = api;
  window.EPSound = api;
  EP.SoundFeedback = api;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind, { once: true });
  } else {
    bind();
  }
})();
