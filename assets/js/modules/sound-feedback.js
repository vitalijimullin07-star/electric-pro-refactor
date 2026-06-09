(function () {
  "use strict";

  window.EP = window.EP || {};

  const STORAGE_KEYS = [
    "ep_visual_settings_clean_v5_3",
    "ep.visual.v29",
    "ep_visual_settings",
    "electric_pro_visual_settings"
  ];

  function parseStorage(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const value = JSON.parse(raw);
      return value && typeof value === "object" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function readVisualSettings() {
    let merged = {};
    STORAGE_KEYS.forEach((key) => {
      const value = parseStorage(key);
      if (value) merged = Object.assign(merged, value);
    });
    return merged;
  }

  function boolFromSettings(settings, names, defaultValue) {
    for (const name of names) {
      if (Object.prototype.hasOwnProperty.call(settings, name)) {
        const value = settings[name];
        if (value === true || value === "true" || value === "on" || value === "enabled" || value === 1 || value === "1") return true;
        if (value === false || value === "false" || value === "off" || value === "disabled" || value === 0 || value === "0") return false;
      }
    }
    return defaultValue;
  }

  function numberFromSettings(settings, names, defaultValue) {
    for (const name of names) {
      if (Object.prototype.hasOwnProperty.call(settings, name)) {
        const value = Number(settings[name]);
        if (Number.isFinite(value)) return value;
      }
    }
    return defaultValue;
  }

  function textFromSettings(settings, names, defaultValue) {
    for (const name of names) {
      if (Object.prototype.hasOwnProperty.call(settings, name) && settings[name] !== undefined && settings[name] !== null) {
        return String(settings[name]);
      }
    }
    return defaultValue;
  }

  const SoundFeedback = {
    context: null,
    unlocked: false,
    lastPlayAt: 0,
    settingsOverride: null,

    readSettings() {
      const stored = Object.assign({}, readVisualSettings(), this.settingsOverride || {});
      return {
        soundEnabled: boolFromSettings(stored, ["soundEnabled", "soundsEnabled", "sound", "uiSound", "soundOn"], true),
        hapticEnabled: boolFromSettings(stored, ["hapticEnabled", "vibrationEnabled", "vibrateEnabled", "haptic", "vibration", "vibro", "vibroEnabled"], true),
        soundVolume: Math.max(0, Math.min(1, numberFromSettings(stored, ["soundVolume", "volume", "uiSoundVolume"], 0.38))),
        soundStyle: textFromSettings(stored, ["soundStyle", "clickSound", "uiSoundStyle"], "soft"),
        hapticMs: Math.max(1, Math.min(120, numberFromSettings(stored, ["hapticMs", "vibrationMs", "vibrateMs"], 18)))
      };
    },

    ensureContext() {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      if (!this.context) this.context = new AudioContextClass();
      return this.context;
    },

    unlock() {
      const ctx = this.ensureContext();
      if (!ctx) return Promise.resolve(false);
      const done = () => {
        this.unlocked = ctx.state === "running" || ctx.state === "suspended";
        return true;
      };
      if (ctx.state === "suspended" && typeof ctx.resume === "function") {
        return ctx.resume().then(done).catch(() => false);
      }
      return Promise.resolve(done());
    },

    tone(kind) {
      const settings = this.readSettings();
      if (!settings.soundEnabled) return;

      const now = performance.now();
      if (now - this.lastPlayAt < 55 && kind !== "test") return;
      this.lastPlayAt = now;

      const ctx = this.ensureContext();
      if (!ctx) return;

      if (ctx.state === "suspended" && typeof ctx.resume === "function") {
        ctx.resume().catch(() => null);
      }

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      const style = settings.soundStyle;
      const base = kind === "success" ? 760 : kind === "nav" ? 540 : kind === "test" ? 660 : 430;
      const frequency = style === "bright" ? base + 220 : style === "deep" ? base - 130 : base;
      const duration = kind === "test" ? 0.18 : 0.055;
      const volume = settings.soundVolume;
      const start = ctx.currentTime;

      oscillator.type = style === "deep" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      if (kind === "test") oscillator.frequency.exponentialRampToValueAtTime(Math.max(80, frequency * 1.28), start + duration);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.02);
    },

    vibrate(pattern) {
      const settings = this.readSettings();
      if (!settings.hapticEnabled) return false;
      if (!navigator.vibrate) return false;
      try {
        const value = pattern || settings.hapticMs || 18;
        return navigator.vibrate(value);
      } catch (error) {
        return false;
      }
    },

    click() {
      this.unlock();
      this.tone("click");
      this.vibrate();
    },

    nav() {
      this.unlock();
      this.tone("nav");
      this.vibrate(24);
    },

    success() {
      this.unlock();
      this.tone("success");
      this.vibrate([14, 20, 14]);
    },

    test() {
      this.unlock().then(() => {
        this.tone("test");
        this.vibrate([25, 35, 25]);
      });
    },

    setSettings(next) {
      this.settingsOverride = Object.assign({}, this.settingsOverride || {}, next || {});
      return this.readSettings();
    },

    shouldHandleTarget(target) {
      if (!target || !target.closest) return false;
      return Boolean(target.closest([
        "button",
        "[role='button']",
        "[data-route]",
        "[data-visual-group]",
        ".tile",
        ".nav-link",
        ".ep-choice",
        ".menu-button",
        ".back-button"
      ].join(",")));
    },

    isTestTarget(target) {
      const node = target && target.closest ? target.closest("button,[role='button'],[data-sound-test],[data-feedback-test]") : null;
      if (!node) return false;
      if (node.hasAttribute("data-sound-test") || node.hasAttribute("data-feedback-test")) return true;
      const text = (node.textContent || "").toLowerCase();
      return text.includes("проверить звук") || text.includes("тест звук") || text.includes("звук") && text.includes("провер");
    },

    bind() {
      const unlockOnce = () => {
        this.unlock();
        window.removeEventListener("pointerdown", unlockOnce, true);
        window.removeEventListener("touchstart", unlockOnce, true);
      };

      window.addEventListener("pointerdown", unlockOnce, true);
      window.addEventListener("touchstart", unlockOnce, true);

      document.addEventListener("pointerdown", (event) => {
        if (!this.shouldHandleTarget(event.target)) return;
        if (this.isTestTarget(event.target)) {
          this.test();
          return;
        }
        this.click();
      }, true);

      document.addEventListener("click", (event) => {
        if (this.isTestTarget(event.target)) {
          event.preventDefault();
          this.test();
        }
      }, true);

      window.addEventListener("ep:route-loaded", () => {
        this.success();
      });

      window.addEventListener("storage", () => {
        this.readSettings();
      });
    },

    init() {
      this.bind();
      window.SoundAPI = {
        unlock: () => this.unlock(),
        setSettings: (next) => this.setSettings(next),
        click: () => this.click(),
        nav: () => this.nav(),
        success: () => this.success(),
        test: () => this.test(),
        vibrate: (pattern) => this.vibrate(pattern),
        getSettings: () => this.readSettings()
      };
      window.EP.SoundFeedback = this;
    }
  };

  SoundFeedback.init();
})();
