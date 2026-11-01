// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Pruebas unitarias para el motor cinemático y reglas de Space Invaders.
 * @spec REQ-43, REQ-44, REQ-45
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SpaceInvadersEngine } from '../../src/games/space-invaders/engine/SpaceInvadersEngine.js';
import type { Invader, Bullet, Bunker } from '../../src/games/space-invaders/types.js';

describe('SpaceInvadersEngine - Motor de Cinemática y Reglas (@spec REQ-43, REQ-44, REQ-45)', () => {
  let engine: SpaceInvadersEngine;

  beforeEach(() => {
    engine = new SpaceInvadersEngine(undefined, 500);
  });

  it('debe inicializar el estado del juego con 55 invasores (5x11), 4 búnkeres, 3 vidas y status READY (@spec REQ-43, REQ-44)', () => {
    const snap = engine.getSnapshot();
    expect(snap.status).toBe('READY');
    expect(snap.lives).toBe(3);
    expect(snap.score).toBe(0);
    expect(snap.highScore).toBe(500);
    expect(snap.wave).toBe(1);
    expect(snap.totalInvaders).toBe(55);
    expect(snap.remainingInvaders).toBe(55);
    expect(snap.bunkers.length).toBe(4);
    expect(snap.bullets.length).toBe(0);
    expect(snap.player.x).toBeGreaterThan(0);
    expect(snap.player.y).toBe(600 - 48);
  });

  it('debe permitir arrancar la partida y mover el cañón horizontalmente dentro de los límites (@spec REQ-44)', () => {
    engine.start();
    expect(engine.getStatus()).toBe('PLAYING');

    const initialX = engine.getSnapshot().player.x;
    engine.moveLeft();
    expect(engine.getSnapshot().player.x).toBeLessThan(initialX);

    engine.moveRight();
    expect(engine.getSnapshot().player.x).toBe(initialX);

    // Movimiento forzado a los bordes
    for (let i = 0; i < 200; i += 1) {
      engine.moveLeft();
    }
    expect(engine.getSnapshot().player.x).toBe(12);

    for (let i = 0; i < 200; i += 1) {
      engine.moveRight();
    }
    const maxBound = 800 - engine.getSnapshot().player.width - 12;
    expect(engine.getSnapshot().player.x).toBe(maxBound);
  });

  it('debe disparar proyectiles del cañón y avanzar hacia arriba (@spec REQ-44)', () => {
    engine.start();
    const fired = engine.fire();
    expect(fired).toBe(true);
    expect(engine.getSnapshot().bullets.length).toBe(1);

    const initialBulletY = engine.getSnapshot().bullets[0]!.y;
    engine.tick(0.016);
    expect(engine.getSnapshot().bullets[0]!.y).toBeLessThan(initialBulletY);

    // Segundo disparo consecutivo bloqueado (cadencia máxima 1 proyectil en normal)
    const secondFired = engine.fire();
    expect(secondFired).toBe(false);
  });

  it('debe aplicar cooldown de recarga al cañón defensor evitando disparos continuos tipo ametralladora (@spec REQ-44)', () => {
    engine.start();
    expect(engine.fire()).toBe(true);

    // Limpiar proyectil simulando que impactó de inmediato
    engine.setBulletsForTesting([]);

    // Intentar disparar inmediatamente en el mismo instante debe fallar por cooldown activo
    expect(engine.fire()).toBe(false);

    // Tras transcurrir el cooldown (250ms = 16 ticks de 16ms), debe permitir disparar de nuevo
    for (let i = 0; i < 17; i += 1) {
      engine.tick(0.016);
    }
    expect(engine.fire()).toBe(true);
  });

  it('debe detectar impacto de proyectil sobre invasor, sumar puntos y destruirlo (@spec REQ-44)', () => {
    engine.start();

    // Invasor de prueba a tiro
    const targetInvader: Invader = {
      id: 'invader_target',
      row: 0,
      col: 5,
      x: 400,
      y: 200,
      width: 32,
      height: 22,
      type: 'squid',
      points: 30,
      isAlive: true,
      animFrame: 0
    };
    engine.setInvadersForTesting([targetInvader]);

    // Proyectil que impactará en el siguiente tick
    const bullet: Bullet = {
      id: 'bullet_hit',
      x: 410,
      y: 205,
      width: 3,
      height: 12,
      vy: -9,
      fromPlayer: true
    };
    engine.setBulletsForTesting([bullet]);

    engine.tick(0.016);

    const snap = engine.getSnapshot();
    expect(snap.score).toBe(30);
    expect(snap.remainingInvaders).toBe(0);
    expect(snap.bullets.length).toBe(0);
  });

  it('debe mover la flota horizontalmente y descender al alcanzar un borde lateral (@spec REQ-44)', () => {
    engine.start();

    // Colocar un invasor vivo junto al borde derecho
    const rightmostInvader: Invader = {
      id: 'invader_edge',
      row: 0,
      col: 10,
      x: 780, // Muy cerca del límite (800 - 14)
      y: 100,
      width: 32,
      height: 22,
      type: 'crab',
      points: 20,
      isAlive: true,
      animFrame: 0
    };
    engine.setInvadersForTesting([rightmostInvader]);

    const initialY = rightmostInvader.y;
    engine.forceMarchForTesting();

    const snap = engine.getSnapshot();
    expect(snap.invaders[0]!.y).toBeGreaterThan(initialY); // Descendió un escalón
  });

  it('los proyectiles deben dañar y degradar los bloques de los búnkeres (@spec REQ-44)', () => {
    engine.start();

    const mockBunker: Bunker = {
      id: 'bunker_test',
      x: 300,
      y: 400,
      width: 64,
      height: 44,
      cells: [
        { x: 300, y: 400, width: 16, height: 14, health: 3 }
      ]
    };
    engine.setBunkersForTesting([mockBunker]);

    // Bala enemiga descendente impactando la celda
    const bullet: Bullet = {
      id: 'bullet_bunker',
      x: 305,
      y: 395,
      width: 3,
      height: 12,
      vy: 5,
      fromPlayer: false
    };
    engine.setBulletsForTesting([bullet]);

    engine.tick(0.016);

    const snap = engine.getSnapshot();
    expect(snap.bunkers[0]!.cells[0]!.health).toBe(2); // Salud degradada de 3 a 2
    expect(snap.bullets.length).toBe(0); // Bala absorbida
  });

  it('las balas alienígenas deben colisionar y restar vidas al jugador (@spec REQ-44)', () => {
    engine.start();
    engine.setPlayerForTesting(400, 552);

    const enemyBullet: Bullet = {
      id: 'e_bullet_test',
      x: 410,
      y: 550,
      width: 3,
      height: 12,
      vy: 5,
      fromPlayer: false
    };
    engine.setBulletsForTesting([enemyBullet]);

    engine.tick(0.016);

    const snap = engine.getSnapshot();
    expect(snap.lives).toBe(2);
    expect(snap.bullets.length).toBe(0);
  });

  it('debe declarar GAME_OVER inmediato si la invasión alcanza la posición del cañón en tierra (@spec REQ-44)', () => {
    engine.start();
    engine.setPlayerForTesting(400, 552);

    const landedInvader: Invader = {
      id: 'invader_landed',
      row: 4,
      col: 5,
      x: 400,
      y: 555, // Invasor tocó el suelo defensivo
      width: 32,
      height: 22,
      type: 'octopus',
      points: 10,
      isAlive: true,
      animFrame: 0
    };
    engine.setInvadersForTesting([landedInvader]);

    engine.tick(0.016);

    const snap = engine.getSnapshot();
    expect(snap.status).toBe('GAME_OVER');
    expect(snap.lives).toBe(0);
  });

  it('debe declarar VICTORY al destruir todos los invasores y permitir pasar a la siguiente oleada (@spec REQ-44)', () => {
    engine.start();
    const singleInvader: Invader = {
      id: 'last_invader',
      row: 0,
      col: 0,
      x: 400,
      y: 100,
      width: 32,
      height: 22,
      type: 'squid',
      points: 30,
      isAlive: true,
      animFrame: 0
    };
    engine.setInvadersForTesting([singleInvader]);

    const bullet: Bullet = {
      id: 'finishing_bullet',
      x: 410,
      y: 105,
      width: 3,
      height: 12,
      vy: -9,
      fromPlayer: true
    };
    engine.setBulletsForTesting([bullet]);

    engine.tick(0.016);
    expect(engine.getStatus()).toBe('VICTORY');

    // Avanzar de oleada
    engine.nextWave();
    expect(engine.getStatus()).toBe('PLAYING');
    expect(engine.getSnapshot().wave).toBe(2);
    expect(engine.getSnapshot().remainingInvaders).toBe(55);
  });

  it('debe destruir la nave nodriza misteriosa (UFO) otorgando puntos de bonificación (@spec REQ-44)', () => {
    engine.start();
    engine.setUfoForTesting({
      x: 300,
      y: 38,
      width: 48,
      height: 20,
      speed: 3.5,
      points: 300,
      isActive: true
    });

    const bullet: Bullet = {
      id: 'ufo_bullet',
      x: 320,
      y: 42,
      width: 3,
      height: 12,
      vy: -9,
      fromPlayer: true
    };
    engine.setBulletsForTesting([bullet]);

    engine.tick(0.016);

    const snap = engine.getSnapshot();
    expect(snap.score).toBe(300);
    expect(snap.ufo.isActive).toBe(false);
  });

  it('debe modular velocidades y cadencias según los 4 niveles de dificultad (@spec REQ-45)', () => {
    engine.setDifficulty('easy');
    expect(engine.getDifficulty()).toBe('easy');
    expect(engine.getConfig().playerSpeed).toBe(7.5);
    expect(engine.getConfig().invaderBulletSpeed).toBe(3.5);
    expect(engine.getConfig().baseMarchIntervalMs).toBe(850);

    engine.setDifficulty('normal');
    expect(engine.getDifficulty()).toBe('normal');
    expect(engine.getConfig().playerSpeed).toBe(8.0);
    expect(engine.getConfig().invaderBulletSpeed).toBe(4.5);
    expect(engine.getConfig().baseMarchIntervalMs).toBe(680);

    engine.setDifficulty('hard');
    expect(engine.getDifficulty()).toBe('hard');
    expect(engine.getConfig().playerSpeed).toBe(8.5);
    expect(engine.getConfig().invaderBulletSpeed).toBe(6.0);
    expect(engine.getConfig().baseMarchIntervalMs).toBe(500);

    engine.setDifficulty('extreme');
    expect(engine.getDifficulty()).toBe('extreme');
    expect(engine.getConfig().playerSpeed).toBe(10.0);
    expect(engine.getConfig().invaderBulletSpeed).toBe(8.5);
    expect(engine.getConfig().baseMarchIntervalMs).toBe(300);
  });

  it('debe pausar y reanudar la partida correctamente (@spec REQ-44)', () => {
    engine.start();
    expect(engine.getStatus()).toBe('PLAYING');

    engine.togglePause();
    expect(engine.getStatus()).toBe('PAUSED');

    engine.togglePause();
    expect(engine.getStatus()).toBe('PLAYING');
  });
});
