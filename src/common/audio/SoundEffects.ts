// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Subsistema de efectos de sonido sintetizados en tiempo real mediante Web Audio API.
 * Desacoplado de archivos externos, con cero latencia y ultra-ligero.
 * @spec REQ-41
 */

export type SoundEffect =
  | 'eat'
  | 'die'
  | 'bounce'
  | 'paddle'
  | 'line'
  | 'tetris'
  | 'laser'
  | 'win'
  | 'lose'
  | 'click'
  | 'step';

const MUTE_STORAGE_KEY = 'guacamolegh_sound_muted';

export class SoundManager {
  private static instance: SoundManager | null = null;
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private masterGain: GainNode | null = null;

  private constructor() {
    this.muted = this.loadMutePreference();
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    const inst = SoundManager.instance;
    return inst;
  }

  /**
   * Indica si el sonido está silenciado.
   * @spec REQ-41
   */
  public isMuted(): boolean {
    const m = this.muted;
    return m;
  }

  /**
   * Alterna entre silenciado y activo, persistiendo la preferencia.
   * @spec REQ-41
   */
  public toggleMute(): boolean {
    this.muted = !this.muted;
    this.saveMutePreference(this.muted);
    if (!this.muted) {
      this.initContext();
      this.play('click');
    }
    const currentMuted = this.muted;
    return currentMuted;
  }

  /**
   * Inicializa o reanuda el AudioContext ante una interacción del usuario.
   * @spec REQ-41
   */
  public initContext(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);
        }
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {
          // Ignorar fallos de autoreproducción
        });
      }
    } catch {
      // Ignorar fallos en navegadores sin soporte
    }
  }

  /**
   * Reproduce un efecto de sonido arcade sintetizado.
   * @spec REQ-41
   */
  public play(effect: SoundEffect): void {
    if (this.muted) {
      return;
    }

    this.initContext();
    if (!this.ctx || !this.masterGain) {
      return;
    }

    try {
      const now = this.ctx.currentTime;

      if (effect === 'eat') {
        this.playEatSound(now);
      } else if (effect === 'die') {
        this.playDieSound(now);
      } else if (effect === 'bounce') {
        this.playTone(now, 480, 0.05, 'triangle', 0.15);
      } else if (effect === 'paddle') {
        this.playTone(now, 260, 0.08, 'square', 0.2);
      } else if (effect === 'line') {
        this.playLineClearSound(now);
      } else if (effect === 'tetris') {
        this.playTetrisSound(now);
      } else if (effect === 'laser') {
        this.playLaserSound(now);
      } else if (effect === 'win') {
        this.playWinSound(now);
      } else if (effect === 'lose') {
        this.playLoseSound(now);
      } else if (effect === 'click') {
        this.playTone(now, 720, 0.03, 'sine', 0.1);
      } else if (effect === 'step') {
        this.playTone(now, 160, 0.02, 'sine', 0.06);
      }
    } catch {
      // Silenciar cualquier excepción de audio
    }
  }

  private playTone(
    startTime: number,
    freq: number,
    duration: number,
    type: OscillatorType,
    volume: number = 0.2
  ): void {
    if (!this.ctx || !this.masterGain) {
      return;
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private playEatSound(startTime: number): void {
    if (!this.ctx || !this.masterGain) {
      return;
    }
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(320, startTime);
    osc.frequency.exponentialRampToValueAtTime(640, startTime + 0.1);

    gain.gain.setValueAtTime(0.18, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + 0.12);
  }

  private playDieSound(startTime: number): void {
    if (!this.ctx || !this.masterGain) {
      return;
    }
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, startTime);
    osc.frequency.exponentialRampToValueAtTime(50, startTime + 0.35);

    gain.gain.setValueAtTime(0.25, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + 0.35);
  }

  private playLineClearSound(startTime: number): void {
    if (!this.ctx || !this.masterGain) {
      return;
    }
    const notes = [440, 554.37, 659.25];
    notes.forEach((freq, idx) => {
      this.playTone(startTime + idx * 0.05, freq, 0.08, 'triangle', 0.2);
    });
  }

  private playTetrisSound(startTime: number): void {
    if (!this.ctx || !this.masterGain) {
      return;
    }
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      this.playTone(startTime + idx * 0.06, freq, 0.15, 'square', 0.18);
    });
  }

  private playLaserSound(startTime: number): void {
    if (!this.ctx || !this.masterGain) {
      return;
    }
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, startTime);
    osc.frequency.exponentialRampToValueAtTime(180, startTime + 0.12);

    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + 0.12);
  }

  private playWinSound(startTime: number): void {
    if (!this.ctx || !this.masterGain) {
      return;
    }
    const melody = [
      { f: 523.25, d: 0.1 },
      { f: 659.25, d: 0.1 },
      { f: 783.99, d: 0.1 },
      { f: 1046.5, d: 0.3 }
    ];
    let offset = 0;
    melody.forEach((note) => {
      this.playTone(startTime + offset, note.f, note.d, 'triangle', 0.22);
      offset += note.d + 0.02;
    });
  }

  private playLoseSound(startTime: number): void {
    if (!this.ctx || !this.masterGain) {
      return;
    }
    const notes = [440, 415.3, 392, 349.23];
    let offset = 0;
    notes.forEach((freq) => {
      this.playTone(startTime + offset, freq, 0.12, 'sawtooth', 0.2);
      offset += 0.12;
    });
  }

  private loadMutePreference(): boolean {
    let isMutedPref = false;
    try {
      const saved = localStorage.getItem(MUTE_STORAGE_KEY);
      isMutedPref = saved === 'true';
    } catch {
      isMutedPref = false;
    }
    return isMutedPref;
  }

  private saveMutePreference(muted: boolean): void {
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, muted ? 'true' : 'false');
    } catch {
      // Ignorar fallos de cuota o modo incógnito
    }
  }
}

export const soundManager = SoundManager.getInstance();
