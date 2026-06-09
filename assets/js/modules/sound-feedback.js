window.EP = window.EP || {};

EP.SoundFeedback = {
  key: "ep_visual_settings_clean_v5_3",
  audioContext: null,
  unlocked: false,
  lastClickAt: 0,

  settings() {
    const fallback = { sound: true, vibration: true, motion: "normal" };
    try {
      return Object.assign(fallback, JSON.parse(localStorage.getItem(this.key) || "{}"));
    } catch (error) {
      return fallback;
    }
  },

  isSoundEnabled() {
    const value = this.settings();
    return value.sound !== false && value.sound !== "off" && value.sound !== 0;
  },

  isVibrationEnabled() {
    const value = this.settings();
    return value.vibration !== false && value.vibration !== "off" && value.vibration !== 0;
  },

  ensureContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!this.audioContext) {
      this.audioContext = new AudioContextClass();
    }

    if (this.audioContext.state === "suspended") {
      this.audioContext.resume().catch(() => {});
    }

    return this.audioContext;
  },

  unlock() {
    if (this.unlocked) return;
    const context = this.ensureContext();
    if (!context) return;

    try {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 440;
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.01);
      this.unlocked = true;
    } catch (error) {
      console.warn("Sound unlock skipped", error);
    }
  },

  play(type = "tap") {
    if (!this.isSoundEnabled()) return;

    const now = Date.now();
    if (now - this.lastClickAt < 45) return;
    this.lastClickAt = now;

    const context = this.ensureContext();
    if (!context) return;

    const presets = {
      tap: { frequency: 620, duration: 0.045, volume: 0.035 },
      nav: { frequency: 520, duration: 0.055, volume: 0.040 },
      back: { frequency: 390, duration: 0.055, volume: 0.035 },
      success: { frequency: 740, duration: 0.075, volume: 0.045 },
      error: { frequency: 180, duration: 0.09, volume: 0.045 }
    };

    const sound = presets[type] || presets.tap;

    try {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime;
      const end = start + sound.duration;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(sound.frequency, start);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(60, sound.frequency * 0.82), end);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(sound.volume, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(end + 0.01);
    } catch (error) {
      console.warn("Sound play skipped", error);
    }
  },

  vibrate(ms = 10) {
    if (!this.isVibrationEnabled()) return;
    if (navigator.vibrate) navigator.vibrate(ms);
  },

  bindGlobalFeedback() {
    document.addEventListener("pointerdown", () => this.unlock(), { once: true, passive: true });

    document.addEventListener("click", (event) => {
      const target = event.target.closest("button, [data-route], .tile, .nav-link, .ep-choice");
      if (!target) return;

      if (target.matches("[data-route], .nav-link, .tile")) {
        this.play("nav");
        this.vibrate(9);
        return;
      }

      if (target.id === "app-back" || target.classList.contains("back-button")) {
        this.play("back");
        this.vibrate(7);
        return;
      }

      this.play("tap");
      this.vibrate(6);
    }, true);

    window.addEventListener("ep:route-loaded", () => {
      this.play("success");
    });
  },

  init() {
    this.bindGlobalFeedback();
    window.EPSound = {
      play: (type) => this.play(type),
      unlock: () => this.unlock(),
      enabled: () => this.isSoundEnabled()
    };
  }
};

EP.SoundFeedback.init();
