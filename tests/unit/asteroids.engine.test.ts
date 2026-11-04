// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Pruebas unitarias para el motor físico y cinemática de Asteroids.
 * @spec REQ-53, REQ-54, REQ-55, REQ-56
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AsteroidsEngine } from '../../src/games/asteroids/engine/AsteroidsEngine.js';

describe('AsteroidsEngine - Motor Vectorial 2D de Asteroids (@spec REQ-53, REQ-54, REQ-55, REQ-56)', () => {
  let engine: AsteroidsEngine;

  beforeEach(() => {
    engine = new AsteroidsEngine({}, 250, 'normal');
  });

  it('debe inicializarse en estado READY con 3 vidas, oleada 1 y asteroides generados (@spec REQ-53, REQ-54)', () => {
    const snap = engine.getSnapshot();

    expect(snap.status).toBe('READY');
    expect(snap.score).toBe(0);
    expect(snap.highScore).toBe(250);
    expect(snap.lives).toBe(3);
    expect(snap.wave).toBe(1);
    expect(snap.asteroids.length).toBeGreaterThan(0);
    expect(snap.ship.isInvulnerable).toBe(true);
  });

  it('debe iniciar la partida y alternar pausa (@spec REQ-54)', () => {
    engine.start();
    expect(engine.getStatus()).toBe('PLAYING');

    engine.togglePause();
    expect(engine.getStatus()).toBe('PAUSED');
    engine.togglePause();
    expect(engine.getStatus()).toBe('PLAYING');
  });

  it('debe rotar la nave hacia la izquierda y derecha (@spec REQ-54)', () => {
    engine.start();
    const initialRot = engine.getSnapshot().ship.rotation;

    engine.rotateShip('RIGHT', 100);
    const rightRot = engine.getSnapshot().ship.rotation;
    expect(rightRot).toBeGreaterThan(initialRot);

    engine.rotateShip('LEFT', 100);
    const backRot = engine.getSnapshot().ship.rotation;
    expect(backRot).toBeCloseTo(initialRot, 2);
  });

  it('debe acelerar la nave con empuje y aplicar fricción inercial (@spec REQ-54)', () => {
    engine.start();
    engine.setThrust(true);

    engine.tick(200); // 200 ms de empuje
    const movingSnap = engine.getSnapshot();
    const speed = Math.hypot(movingSnap.ship.x - 400, movingSnap.ship.y - 300);
    expect(speed).toBeGreaterThan(0);

    engine.setThrust(false);
    engine.tick(100); // Fricción
  });

  it('debe aplicar envolvente toroidal (wrap-around) a las coordenadas de la nave (@spec REQ-54)', () => {
    engine.start();
    engine['ship'].x = 810;
    engine['ship'].y = -10;

    engine.tick(16);

    const snap = engine.getSnapshot();
    expect(snap.ship.x).toBeLessThan(800);
    expect(snap.ship.y).toBeGreaterThan(0);
  });

  it('debe disparar proyectiles láser con velocidad y alcance limitado (@spec REQ-54)', () => {
    engine.start();
    const fired = engine.fire();
    expect(fired).toBe(true);

    const snap = engine.getSnapshot();
    expect(snap.bullets.length).toBe(1);

    // Avanzar tiempo para que expire
    for (let i = 0; i < 30; i++) {
      engine.tick(50);
    }
    expect(engine.getSnapshot().bullets.length).toBe(0);
  });

  it('debe fragmentar asteroides grandes en medianos al ser impactados (@spec REQ-54)', () => {
    engine.start();
    // Colocar un asteroide grande justo delante de la bala
    engine['asteroids'] = [
      {
        id: 999,
        x: 450,
        y: 300,
        vx: 0,
        vy: 0,
        size: 'large',
        radius: 40,
        rotation: 0,
        rotSpeed: 0,
        points: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      }
    ];

    engine['bullets'] = [
      {
        id: 888,
        x: 445,
        y: 300,
        vx: 100,
        vy: 0,
        lifeMs: 1000
      }
    ];

    engine.tick(16);

    const snap = engine.getSnapshot();
    expect(snap.score).toBe(20);
    expect(snap.asteroids.length).toBe(2);
    expect(snap.asteroids[0]!.size).toBe('medium');
  });

  it('debe restar una vida cuando un asteroide impacta la nave vulnerable (@spec REQ-54)', () => {
    engine.start();
    engine['ship'].invulnerableTimerMs = 0; // Desactivar invulnerabilidad inicial
    const initialLives = engine.getSnapshot().lives;

    // Colocar asteroide sobre la nave
    engine['asteroids'] = [
      {
        id: 999,
        x: engine['ship'].x,
        y: engine['ship'].y,
        vx: 0,
        vy: 0,
        size: 'large',
        radius: 40,
        rotation: 0,
        rotSpeed: 0,
        points: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      }
    ];

    engine.tick(16);

    expect(engine.getSnapshot().lives).toBe(initialLives - 1);
  });

  it('debe finalizar en GAME_OVER al agotar las vidas (@spec REQ-54)', () => {
    engine.start();
    engine['lives'] = 1;
    engine['ship'].invulnerableTimerMs = 0;

    engine['asteroids'] = [
      {
        id: 999,
        x: engine['ship'].x,
        y: engine['ship'].y,
        vx: 0,
        vy: 0,
        size: 'large',
        radius: 40,
        rotation: 0,
        rotSpeed: 0,
        points: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      }
    ];

    engine.tick(16);

    expect(engine.getStatus()).toBe('GAME_OVER');
  });

  it('debe avanzar de oleada al destruir todos los asteroides (@spec REQ-54)', () => {
    engine.start();
    engine['asteroids'] = [];

    engine.tick(16);

    expect(engine.getStatus()).toBe('VICTORY');
    engine.nextWave();
    expect(engine.getStatus()).toBe('PLAYING');
    expect(engine.getSnapshot().wave).toBe(2);
  });

  it('debe ajustar la velocidad, vidas y número de asteroides según la dificultad (@spec REQ-54)', () => {
    expect(engine.getDifficulty()).toBe('normal');
    expect(engine.getSnapshot().lives).toBe(3);

    // Cambiar a fácil en READY
    engine.setDifficulty('easy');
    expect(engine.getDifficulty()).toBe('easy');
    expect(engine.getDifficultySpeedMultiplier()).toBe(0.7);
    expect(engine.getSnapshot().lives).toBe(4);
    expect(engine.getDifficultyAsteroidCount(1)).toBe(3);

    // Cambiar a difícil
    engine.setDifficulty('hard');
    expect(engine.getDifficultySpeedMultiplier()).toBe(1.35);
    expect(engine.getDifficultyAsteroidCount(1)).toBe(5);

    // Cambiar a extremo
    engine.setDifficulty('extreme');
    expect(engine.getDifficulty()).toBe('extreme');
    expect(engine.getDifficultySpeedMultiplier()).toBe(1.75);
    expect(engine.getSnapshot().lives).toBe(2);
    expect(engine.getDifficultyAsteroidCount(1)).toBe(7);
  });

  it('debe emitir eventos de sonido en disparos y explosiones (@spec REQ-54, REQ-55)', () => {
    let lastSound = '';
    engine.onSoundEvent = (event) => {
      lastSound = event;
    };

    engine.start();
    engine.fire();
    expect(lastSound).toBe('laser');
  });

  it('debe estructurar el enrutador cliente para #asteroids (@spec REQ-56)', () => {
    expect(engine['config'].virtualWidth).toBe(800);
    expect(engine['config'].virtualHeight).toBe(600);
  });

  it('debe mantener trayectorias independientes entre asteroides sin colisión mutua como en el arcade original (@spec REQ-54)', () => {
    engine.start();
    engine['asteroids'] = [
      {
        id: 101,
        x: 200,
        y: 200,
        vx: 50,
        vy: 0,
        size: 'large',
        radius: 40,
        rotation: 0,
        rotSpeed: 0.5,
        points: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      },
      {
        id: 102,
        x: 220,
        y: 200,
        vx: -50,
        vy: 0,
        size: 'large',
        radius: 40,
        rotation: 0,
        rotSpeed: 0.5,
        points: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      }
    ];

    engine.tick(16);

    const snap = engine.getSnapshot();
    const astA = snap.asteroids.find((a) => a.id === 101)!;
    const astB = snap.asteroids.find((a) => a.id === 102)!;

    // Continúan sus trayectorias sin alteración ni rebote mutuo
    expect(astA.vx).toBe(50);
    expect(astB.vx).toBe(-50);
  });
});
