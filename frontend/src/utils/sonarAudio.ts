// Synthesized Web Audio API Sonar Chirps & Acoustic Feedback
class SonarAudioService {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Authentic 2.4 kHz -> 4.8 kHz Subsea Frequency-Modulated Sonar Ping
  playSonarPing(pitchMultiplier: number = 1.0) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startFreq = 2400 * pitchMultiplier;
      const endFreq = 4800 * pitchMultiplier;
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.12);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Ignore audio failure
    }
  }

  // Soft Tactical UI Click / Reticle Lock
  playLockBeep() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.setValueAtTime(2400, now + 0.04);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch {
      // Ignore audio failure
    }
  }

  // Soft Target Selection Beep
  playTargetBeep() {
    this.playLockBeep();
  }

  // Low Rumble Depth Pulse
  playDepthPulse() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.31);
    } catch {
      // Ignore audio failure
    }
  }

  // Emergency Subsea Alarm Sound (Dual Tone High Priority Alert)
  playEmergencyAlertAlarm() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1320, now + 0.15);
      osc.frequency.setValueAtTime(880, now + 0.3);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.51);
    } catch {
      // Ignore audio failure
    }
  }

  // ── /ani story sound design ──────────────────────────────────────────
  private ambient: { gain: GainNode; filter: BiquadFilterNode; nodes: AudioScheduledSourceNode[] } | null = null;

  // Underwater drone: looping brown noise + a 46 Hz sub-sine through one lowpass.
  startAmbient() {
    const ctx = this.getContext();
    if (!ctx || this.ambient) return;
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      d[i] = last * 3.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const sub = ctx.createOscillator();
    sub.frequency.value = 46;
    const subGain = ctx.createGain();
    subGain.gain.value = 0.22;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1400;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    noise.connect(filter);
    sub.connect(subGain).connect(filter);
    filter.connect(gain).connect(ctx.destination);
    noise.start();
    sub.start();
    gain.gain.setTargetAtTime(0.16, ctx.currentTime, 0.4);
    this.ambient = { gain, filter, nodes: [noise, sub] };
  }

  // 0 = surface (bright, 1400 Hz) … 1 = seabed (muffled, 240 Hz)
  setAmbientDepth(depth: number) {
    if (!this.ambient || !this.ctx) return;
    this.ambient.filter.frequency.setTargetAtTime(1400 - 1160 * depth, this.ctx.currentTime, 0.25);
  }

  stopAmbient() {
    if (!this.ambient || !this.ctx) return;
    const a = this.ambient;
    this.ambient = null;
    a.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
    setTimeout(() => a.nodes.forEach((n) => n.stop()), 1500);
  }

  private noiseBurst(seconds: number, from: number, to: number, peak: number) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.2;
    const now = ctx.currentTime;
    bp.frequency.setValueAtTime(from, now);
    bp.frequency.exponentialRampToValueAtTime(to, now + seconds);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + seconds * 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
    src.connect(bp).connect(gain).connect(ctx.destination);
    src.start(now);
  }

  playWhoosh() {
    this.noiseBurst(0.9, 180, 2400, 0.12);
  }

  playTick() {
    this.noiseBurst(0.03, 5000, 7000, 0.05);
  }

  playThud() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.22);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.playLockBeep();
    }
    return this.isMuted;
  }
}

export const sonarAudio = new SonarAudioService();
