// @vitest-environment happy-dom
// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Pruebas unitarias para el subsistema de efectos de sonido sintetizados (Web Audio API).
 * @spec REQ-41
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SoundManager, soundManager, type SoundEffect } from '../../src/common/audio/SoundEffects.js';

const mockStore = new Map<string, string>();
const fakeStorage = {
  getItem: (k: string) => mockStore.get(k) ?? null,
  setItem: (k: string, v: string) => { mockStore.set(k, String(v)); },
  removeItem: (k: string) => { mockStore.delete(k); },
  clear: () => { mockStore.clear(); },
  get length() { return mockStore.size; },
  key: () => null
};

describe('SoundManager - Sistema de Sonido Arcade Web Audio API (@spec REQ-41)', () => {
  beforeEach(() => {
    mockStore.clear();
    try {
      Object.defineProperty(globalThis, 'localStorage', { value: fakeStorage, configurable: true, writable: true });
    } catch {}
    if (typeof window !== 'undefined') {
      try {
        Object.defineProperty(window, 'localStorage', { value: fakeStorage, configurable: true, writable: true });
      } catch {}
    }
  });

  it('debe obtener la instancia singleton de SoundManager (@spec REQ-41)', () => {
    const inst1 = SoundManager.getInstance();
    const inst2 = SoundManager.getInstance();
    expect(inst1).toBe(inst2);
    expect(soundManager).toBe(inst1);
  });

  it('debe alternar el estado de silenciado y persistir en localStorage (@spec REQ-41)', () => {
    const initialMuted = soundManager.isMuted();
    const newMuted = soundManager.toggleMute();
    expect(newMuted).toBe(!initialMuted);
    expect(soundManager.isMuted()).toBe(newMuted);

    const storedValue = fakeStorage.getItem('guacamolegh_sound_muted');
    expect(storedValue).toBe(newMuted ? 'true' : 'false');

    // Restaurar estado
    const restored = soundManager.toggleMute();
    expect(restored).toBe(initialMuted);
  });

  it('no debe fallar en entornos headless sin soporte nativo de AudioContext (@spec REQ-41)', () => {
    expect(() => {
      soundManager.initContext();
    }).not.toThrow();

    const effects: SoundEffect[] = [
      'eat',
      'die',
      'bounce',
      'paddle',
      'line',
      'tetris',
      'laser',
      'win',
      'lose',
      'click',
      'step'
    ];

    effects.forEach((effect) => {
      expect(() => {
        soundManager.play(effect);
      }).not.toThrow();
    });
  });

  it('debe sintetizar nodos de audio cuando AudioContext está disponible (@spec REQ-41)', () => {
    const mockGainNode = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
      },
      connect: vi.fn()
    };

    const mockOscillatorNode = {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn()
    };

    const mockAudioContext = {
      state: 'suspended',
      currentTime: 10,
      destination: {},
      createGain: vi.fn().mockReturnValue(mockGainNode),
      createOscillator: vi.fn().mockReturnValue(mockOscillatorNode),
      resume: vi.fn().mockResolvedValue(undefined)
    };

    // Asegurar que no esté silenciado
    if (soundManager.isMuted()) {
      soundManager.toggleMute();
    }

    const originalAudioContext = window.AudioContext;
    (window as unknown as { AudioContext: unknown }).AudioContext = vi.fn().mockReturnValue(mockAudioContext);

    try {
      soundManager.initContext();
      soundManager.play('eat');
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(mockOscillatorNode.start).toHaveBeenCalled();
    } finally {
      (window as unknown as { AudioContext: unknown }).AudioContext = originalAudioContext;
    }
  });

  it('no debe emitir sonido si el audio está silenciado (@spec REQ-41)', () => {
    if (!soundManager.isMuted()) {
      soundManager.toggleMute();
    }
    expect(soundManager.isMuted()).toBe(true);

    const mockAudioContext = {
      currentTime: 0,
      createGain: vi.fn(),
      createOscillator: vi.fn()
    };
    const originalAudioContext = window.AudioContext;
    (window as unknown as { AudioContext: unknown }).AudioContext = vi.fn().mockReturnValue(mockAudioContext);

    try {
      soundManager.play('bounce');
      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    } finally {
      (window as unknown as { AudioContext: unknown }).AudioContext = originalAudioContext;
      // Restaurar silencio
      soundManager.toggleMute();
    }
  });
});
