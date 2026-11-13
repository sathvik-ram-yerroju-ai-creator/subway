// Procedural Web Audio API sound engine for Zero-G Surfer
// Zero external files, zero latency, guaranteed to work offline and in any browser

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmTimer = null;
    this.engineOsc = null;
    this.engineGain = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized && this.ctx) {
      this.resume();
      return;
    }
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.ctx = new AudioContext();
      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio not supported", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted) {
      this.stopBGM();
      this.stopEngine();
    }
  }

  // 1. Jump / Lane Switch: Quick pitch-slide up synth blip
  playLaneSwitch() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    this.resume();

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Pitch-slide up from 280Hz to 740Hz
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(740, t + 0.11);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.13);
    } catch (e) {}
  }

  // Alias for backward compatibility
  playThrust() {
    this.playLaneSwitch();
  }

  // 2. Coin / Crystal Pickup: High-pitched double chime
  playCoin(combo = 1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    this.resume();

    try {
      const t = this.ctx.currentTime;
      // High-pitched bright harmonics (B5 and E6)
      const baseFreq = Math.min(987 * (1 + (combo % 6) * 0.1), 1800);
      const notes = [baseFreq, baseFreq * 1.334, baseFreq * 2];

      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = i === 1 ? 'triangle' : 'sine';
        const startT = t + i * 0.045;
        osc.frequency.setValueAtTime(freq, startT);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.15, startT + 0.2);

        gain.gain.setValueAtTime(0.18 / (i + 1), startT);
        gain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startT);
        osc.stop(startT + 0.29);
      });
    } catch (e) {}
  }

  // Alias for backward compatibility
  playCrystal(combo = 1) {
    this.playCoin(combo);
  }

  // 3. Crash / Game Over: Low-frequency explosion bass drop
  playCrash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    this.resume();

    try {
      const t = this.ctx.currentTime;

      // Bass drop sub-oscillator
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(24, t + 0.65);

      oscGain.gain.setValueAtTime(0.55, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.71);

      // Noise burst for explosion crunch
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.55);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, t);
      filter.frequency.exponentialRampToValueAtTime(80, t + 0.5);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.45, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(t);
      noise.stop(t + 0.56);
    } catch (e) {}
  }

  // 4. Start / Click: Futuristic sci-fi button beep
  playButtonClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    this.resume();

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.setValueAtTime(1320, t + 0.03);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch (e) {}
  }

  // Shield Power-Up activation chime
  playShieldUp() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    this.resume();

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(1480, t + 0.35);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.43);
    } catch (e) {}
  }

  // Shield deflection sound (powerful energy absorption shockwave)
  playShieldDeflect() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    this.resume();

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(700, t);
      filter.frequency.exponentialRampToValueAtTime(120, t + 0.35);

      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(75, t + 0.35);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.39);
    } catch (e) {}
  }

  // Start continuous engine hum
  startEngine() {
    if (this.isMuted || !this.ctx || this.engineOsc) return;
    this.resume();

    try {
      const t = this.ctx.currentTime;
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(75, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, t);

      this.engineGain.gain.setValueAtTime(0.04, t);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start(t);
    } catch (e) {}
  }

  updateEnginePitch(speedRatio = 1) {
    if (!this.engineOsc || !this.ctx) return;
    try {
      const targetFreq = 70 + speedRatio * 85;
      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    } catch (e) {}
  }

  stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch (e) {}
      this.engineOsc = null;
      this.engineGain = null;
    }
  }

  // Cyberpunk synthwave procedural background music loop
  startBGM() {
    if (this.isMuted || !this.ctx || this.bgmTimer) return;
    this.resume();

    const notes = [
      110, 110, 130.81, 110, 146.83, 110, 164.81, 130.81,
      98, 98, 110, 98, 130.81, 98, 146.83, 110
    ];
    const leadNotes = [
      440, 0, 523.25, 587.33, 659.25, 0, 587.33, 523.25,
      392, 0, 440, 523.25, 440, 0, 329.63, 392
    ];

    let step = 0;
    const tempo = 128;
    const stepDuration = (60 / tempo) / 4;

    const playNextBeat = () => {
      if (this.isMuted || !this.ctx) return;
      try {
        const t = this.ctx.currentTime;

        // Bass note
        const bassFreq = notes[step % notes.length];
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        const bassFilter = this.ctx.createBiquadFilter();

        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bassFreq * 0.5, t);

        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(320, t);
        bassFilter.frequency.exponentialRampToValueAtTime(100, t + stepDuration * 0.9);

        bassGain.gain.setValueAtTime(0.07, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 0.95);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(this.ctx.destination);

        bassOsc.start(t);
        bassOsc.stop(t + stepDuration);

        // Cyber Lead note
        const leadFreq = leadNotes[step % leadNotes.length];
        if (leadFreq > 0) {
          const leadOsc = this.ctx.createOscillator();
          const leadGain = this.ctx.createGain();
          leadOsc.type = 'sine';
          leadOsc.frequency.setValueAtTime(leadFreq, t);

          leadGain.gain.setValueAtTime(0.035, t);
          leadGain.gain.exponentialRampToValueAtTime(0.0001, t + stepDuration * 1.8);

          leadOsc.connect(leadGain);
          leadGain.connect(this.ctx.destination);

          leadOsc.start(t);
          leadOsc.stop(t + stepDuration * 2);
        }

        // Cyber hi-hat / kick
        if (step % 4 === 0) {
          const kickOsc = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();
          kickOsc.frequency.setValueAtTime(140, t);
          kickOsc.frequency.exponentialRampToValueAtTime(35, t + 0.08);

          kickGain.gain.setValueAtTime(0.11, t);
          kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

          kickOsc.connect(kickGain);
          kickGain.connect(this.ctx.destination);

          kickOsc.start(t);
          kickOsc.stop(t + 0.1);
        }

        step++;
      } catch (e) {}
    };

    this.bgmTimer = setInterval(playNextBeat, stepDuration * 1000);
  }

  stopBGM() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  stopAll() {
    this.stopBGM();
    this.stopEngine();
  }
}

export const sound = new SoundEngine();
