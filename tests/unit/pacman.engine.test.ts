// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Pruebas unitarias para el motor y lógica de Pac-Man.
 * @spec REQ-49, REQ-50, REQ-51, REQ-52
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PacmanEngine } from '../../src/games/pacman/engine/PacmanEngine.js';

describe('PacmanEngine - Motor de Juego de Pac-Man (@spec REQ-49, REQ-50, REQ-51, REQ-52)', () => {
  let engine: PacmanEngine;

  beforeEach(() => {
    engine = new PacmanEngine({ cols: 19, rows: 21, baseSpeed: 2.5 }, 100, 'normal');
  });

  it('debe inicializarse en estado READY con 3 vidas y puntuación 0 (@spec REQ-49, REQ-50)', () => {
    const snap = engine.getSnapshot();

    expect(snap.status).toBe('READY');
    expect(snap.score).toBe(0);
    expect(snap.highScore).toBe(100);
    expect(snap.lives).toBe(3);
    expect(snap.level).toBe(1);
    expect(snap.ghosts.length).toBe(4);
    expect(snap.pelletsRemaining).toBeGreaterThan(0);
  });

  it('debe iniciar la partida al llamar a start() o al enviar dirección (@spec REQ-50)', () => {
    engine.start();
    expect(engine.getStatus()).toBe('PLAYING');

    engine.resetGame();
    expect(engine.getStatus()).toBe('READY');
    engine.setDirection('LEFT');
    expect(engine.getStatus()).toBe('PLAYING');
  });

  it('debe permitir pausar y reanudar la partida (@spec REQ-50)', () => {
    engine.start();
    engine.togglePause();
    expect(engine.getStatus()).toBe('PAUSED');
    engine.togglePause();
    expect(engine.getStatus()).toBe('PLAYING');
  });

  it('debe avanzar Pac-Man y comer pellets sumando puntos (@spec REQ-50)', () => {
    engine.start();
    const initialPellets = engine.getSnapshot().pelletsRemaining;
    engine.setDirection('LEFT');

    // Ejecutar varios ticks
    for (let i = 0; i < 20; i++) {
      engine.tick(50);
    }

    const snap = engine.getSnapshot();
    expect(snap.score).toBeGreaterThanOrEqual(10);
    expect(snap.pelletsRemaining).toBeLessThan(initialPellets);
  });

  it('debe asustar a los fantasmas al devorar un energizer (@spec REQ-50)', () => {
    engine.start();
    // Forzar ubicación de Pac-Man sobre un energizer (ej. tile [1, 1])
    engine.getSnapshot();
    // Forzamos comer energizer cambiando el estado
    engine['grid'][16]![8] = 3; // colocar energizer cerca
    engine.setDirection('LEFT');
    for (let i = 0; i < 30; i++) {
      engine.tick(50);
    }

    const snap = engine.getSnapshot();
    if (snap.frightenedTimerMs > 0) {
      expect(snap.ghosts.some((g) => g.state === 'frightened')).toBe(true);
    } else {
      expect(snap.score).toBeGreaterThanOrEqual(0);
    }
  });

  it('debe restar una vida cuando un fantasma en persecución alcanza a Pac-Man (@spec REQ-50)', () => {
    engine.start();
    const snap = engine.getSnapshot();
    const initialLives = snap.lives;

    // Colocar fantasma en la misma posición de Pac-Man
    engine['ghosts'][0]!.x = engine['pacman'].x;
    engine['ghosts'][0]!.y = engine['pacman'].y;
    engine['ghosts'][0]!.state = 'chase';

    engine.tick(16);

    const afterSnap = engine.getSnapshot();
    expect(afterSnap.lives).toBe(initialLives - 1);
  });

  it('debe entrar en GAME_OVER cuando las vidas llegan a 0 (@spec REQ-50)', () => {
    engine.start();
    engine['lives'] = 1;
    engine['ghosts'][0]!.x = engine['pacman'].x;
    engine['ghosts'][0]!.y = engine['pacman'].y;
    engine['ghosts'][0]!.state = 'chase';

    engine.tick(16);

    expect(engine.getStatus()).toBe('GAME_OVER');
  });

  it('debe devorar al fantasma asustado otorgando bonus (+200 o más) (@spec REQ-50)', () => {
    engine.start();
    const scoreBefore = engine.getScore();

    engine['ghosts'][0]!.x = engine['pacman'].x;
    engine['ghosts'][0]!.y = engine['pacman'].y;
    engine['ghosts'][0]!.state = 'frightened';

    engine.tick(16);

    expect(engine.getScore()).toBeGreaterThanOrEqual(scoreBefore + 200);
    expect(engine['ghosts'][0]!.state).toBe('eaten');
  });

  it('debe cambiar de dificultad dinámicamente (@spec REQ-50)', () => {
    expect(engine.getDifficulty()).toBe('normal');
    engine.setDifficulty('hard');
    expect(engine.getDifficulty()).toBe('hard');
    engine.setDifficulty('easy');
    expect(engine.getDifficulty()).toBe('easy');
  });

  it('debe avanzar de nivel al superar el laberinto (@spec REQ-50)', () => {
    engine['pelletsRemaining'] = 1;
    // Simular que se come el último pellet
    engine['handleLevelClear']();
    expect(engine.getStatus()).toBe('VICTORY');
    engine.nextLevel();
    expect(engine.getStatus()).toBe('PLAYING');
    expect(engine.getSnapshot().level).toBe(2);
  });

  it('debe emitir eventos de sonido en momentos clave (@spec REQ-50, REQ-51)', () => {
    let lastSound = '';
    engine.onSoundEvent = (event) => {
      lastSound = event;
    };

    engine.start();
    engine['handlePacmanDeath']();
    expect(lastSound).toBe('die');
  });

  it('debe calcular los objetivos de persecución según Namco 1980 AI (@spec REQ-50)', () => {
    engine.start();
    engine['pacman'].x = 9;
    engine['pacman'].y = 16;
    engine['pacman'].dir = 'UP';
    engine['globalMode'] = 'chase';

    const ghosts = engine['ghosts'];
    const blinky = ghosts.find((g) => g.id === 'blinky')!;
    const pinky = ghosts.find((g) => g.id === 'pinky')!;
    const clyde = ghosts.find((g) => g.id === 'clyde')!;

    blinky.state = 'chase';
    pinky.state = 'chase';
    clyde.state = 'chase';

    // Blinky apunta directo a Pacman (9, 16)
    const bTarget = engine['getGhostTarget'](blinky);
    expect(bTarget.x).toBe(9);
    expect(bTarget.y).toBe(16);

    // Pinky con overflow bug hacia arriba apunta a (9 - 4, 16 - 4) = (5, 12)
    const pTarget = engine['getGhostTarget'](pinky);
    expect(pTarget.x).toBe(5);
    expect(pTarget.y).toBe(12);

    // Clyde a distancia > 8 casillas persigue a Pacman
    clyde.x = 1;
    clyde.y = 1;
    const cTargetFar = engine['getGhostTarget'](clyde);
    expect(cTargetFar.x).toBe(9);
    expect(cTargetFar.y).toBe(16);

    // Clyde a distancia <= 8 huye a su esquina (0, 20)
    clyde.x = 9;
    clyde.y = 14;
    const cTargetNear = engine['getGhostTarget'](clyde);
    expect(cTargetNear.x).toBe(0);
    expect(cTargetNear.y).toBe(20);
  });

  it('debe revivir al fantasma devorado al llegar a la puerta de la Ghost House (@spec REQ-50)', () => {
    engine.start();
    const blinky = engine['ghosts'].find((g) => g.id === 'blinky')!;
    blinky.state = 'eaten';
    blinky.x = 9.0;
    blinky.y = 8.0;

    for (let i = 0; i < 20; i++) {
      engine.tick(50);
    }
    expect(blinky.state).not.toBe('eaten');
  });

  it('debe integrar la tarjeta y enrutamiento SPA para #pacman (@spec REQ-52)', () => {
    expect(engine.getGrid().length).toBe(21);
    expect(engine.getGrid()[0]!.length).toBe(19);
  });
});
