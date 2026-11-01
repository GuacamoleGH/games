// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Pruebas unitarias para el motor físico puro de Breakout (BreakoutEngine).
 * @spec REQ-28, REQ-29, REQ-30, REQ-31, REQ-32, REQ-42
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BreakoutEngine } from '../../src/games/breakout/engine/BreakoutEngine.js';

describe('BreakoutEngine - Cinemática y Lógica Pura (@spec REQ-28, REQ-29, REQ-30, REQ-31, REQ-32, REQ-42)', () => {
  let engine: BreakoutEngine;

  beforeEach(() => {
    engine = new BreakoutEngine(undefined, 250);
  });

  it('debe inicializar el estado del juego con 70 ladrillos (7 filas x 10 columnas), 3 vidas y estatus READY (@spec REQ-28, REQ-29, REQ-32)', () => {
    const snap = engine.getSnapshot();
    expect(snap.status).toBe('READY');
    expect(snap.lives).toBe(3);
    expect(snap.score).toBe(0);
    expect(snap.highScore).toBe(250);
    expect(snap.totalBricks).toBe(70);
    expect(snap.remainingBricks).toBe(70);
    expect(snap.paddle.width).toBe(110);
    expect(snap.paddle.x).toBeGreaterThan(0);
    expect(snap.ball.radius).toBe(7);
  });

  it('debe iniciar la partida y permitir pausar / reanudar (@spec REQ-29)', () => {
    engine.start();
    expect(engine.getStatus()).toBe('PLAYING');

    engine.togglePause();
    expect(engine.getStatus()).toBe('PAUSED');

    engine.togglePause();
    expect(engine.getStatus()).toBe('PLAYING');
  });

  it('debe mover y limitar la paleta dentro de los límites del tablero (0 a 800) (@spec REQ-29, REQ-33)', () => {
    engine.start();

    // Mover reiteradamente a la izquierda
    for (let i = 0; i < 100; i += 1) {
      engine.movePaddleLeft();
    }
    expect(engine.getSnapshot().paddle.x).toBe(0);

    // Mover reiteradamente a la derecha
    for (let i = 0; i < 150; i += 1) {
      engine.movePaddleRight();
    }
    const maxX = 800 - 110;
    expect(engine.getSnapshot().paddle.x).toBe(maxX);

    // Posicionar mediante coordenada absoluta (ratón)
    engine.setPaddlePosition(400);
    expect(engine.getSnapshot().paddle.x).toBe(400 - 55);
  });

  it('debe rebotar en las paredes laterales y techo sin salirse del área (@spec REQ-29)', () => {
    engine.start();

    // Simular choque contra pared izquierda
    engine.setBallForTesting(5, 200, -6, -4);
    engine.tick();
    const snapLeft = engine.getSnapshot();
    expect(snapLeft.ball.vx).toBeGreaterThan(0);
    expect(snapLeft.ball.x).toBeGreaterThanOrEqual(7);

    // Simular choque contra techo
    engine.setBallForTesting(200, 5, 4, -6);
    engine.tick();
    const snapTop = engine.getSnapshot();
    expect(snapTop.ball.vy).toBeGreaterThan(0);
    expect(snapTop.ball.y).toBeGreaterThanOrEqual(7);
  });

  it('debe rebotar con ángulo dinámico al golpear la paleta según el punto de impacto (@spec REQ-30)', () => {
    engine.start();
    const paddleSnap = engine.getSnapshot().paddle;

    // Impacto en el extremo derecho de la paleta
    const rightEdgeX = paddleSnap.x + paddleSnap.width * 0.9;
    engine.setBallForTesting(rightEdgeX, paddleSnap.y - 6, 0, 6, 6);
    engine.tick();

    const snapBounceRight = engine.getSnapshot();
    // Debe rebotar hacia arriba (vy < 0) y hacia la derecha (vx > 0)
    expect(snapBounceRight.ball.vy).toBeLessThan(0);
    expect(snapBounceRight.ball.vx).toBeGreaterThan(0);
    // Velocidad debe acelerarse ligeramente
    expect(snapBounceRight.ball.speed).toBeGreaterThan(6);

    // Impacto en el centro exacto de la paleta
    const centerX = paddleSnap.x + paddleSnap.width / 2;
    engine.setBallForTesting(centerX, paddleSnap.y - 6, 0, 6, 6);
    engine.tick();

    const snapBounceCenter = engine.getSnapshot();
    expect(snapBounceCenter.ball.vy).toBeLessThan(0);
    expect(Math.abs(snapBounceCenter.ball.vx)).toBeLessThan(0.5);
  });

  it('debe detectar colisión con un ladrillo, destruirlo e incrementar puntuación (@spec REQ-31)', () => {
    engine.start();
    const initialBricks = engine.getSnapshot().bricks;
    const targetBrick = initialBricks[0]!;

    // Posicionar bola justo debajo del ladrillo subiendo verticalmente
    engine.setBallForTesting(
      targetBrick.x + targetBrick.width / 2,
      targetBrick.y + targetBrick.height + 6,
      0,
      -5
    );

    engine.tick();

    const snap = engine.getSnapshot();
    expect(snap.score).toBe(targetBrick.points);
    expect(snap.remainingBricks).toBe(initialBricks.length - 1);
    // Debe haber invertido vy al rebotar contra el ladrillo
    expect(snap.ball.vy).toBeGreaterThan(0);
  });

  it('debe restar una vida al caer por debajo del fondo y reiniciar saque (@spec REQ-32)', () => {
    engine.start();
    // Colocar bola cayendo al vacío (y > 600)
    engine.setBallForTesting(400, 605, 0, 6);
    engine.tick();

    const snap = engine.getSnapshot();
    expect(snap.lives).toBe(2);
    expect(snap.status).toBe('READY');
  });

  it('debe cambiar a GAME_OVER cuando se agotan las 3 vidas (@spec REQ-32)', () => {
    engine.start();
    engine.setLivesForTesting(1);

    // Colocar bola cayendo al vacío en su última vida
    engine.setBallForTesting(400, 605, 0, 6);
    engine.tick();

    const snap = engine.getSnapshot();
    expect(snap.lives).toBe(0);
    expect(snap.status).toBe('GAME_OVER');
  });

  it('debe declarar VICTORY al destruir todos los ladrillos (@spec REQ-32)', () => {
    engine.start();
    // Configurar tablero de prueba con un único ladrillo restante
    const singleBrick = {
      id: 'brick_last',
      x: 350,
      y: 200,
      width: 70,
      height: 20,
      color: '#00f59b',
      points: 10,
      hitsLeft: 1
    };
    engine.setBricksForTesting([singleBrick]);

    // Posicionar bola para impactar ese ladrillo
    engine.setBallForTesting(360, 222, 0, -5);
    engine.tick();

    const snap = engine.getSnapshot();
    expect(snap.status).toBe('VICTORY');
    expect(snap.remainingBricks).toBe(0);
  });

  it('debe modular la velocidad de la bola y de la paleta según los 4 niveles de dificultad (@spec REQ-42)', () => {
    engine.setDifficulty('easy');
    expect(engine.getDifficulty()).toBe('easy');
    expect(engine.getConfig().initialBallSpeed).toBe(5.0);
    expect(engine.getConfig().paddleSpeed).toBe(9.5);
    expect(engine.getConfig().maxBallSpeed).toBe(9.0);

    engine.setDifficulty('normal');
    expect(engine.getDifficulty()).toBe('normal');
    expect(engine.getConfig().initialBallSpeed).toBe(7.0);
    expect(engine.getConfig().paddleSpeed).toBe(12.0);
    expect(engine.getConfig().maxBallSpeed).toBe(13.0);

    engine.setDifficulty('hard');
    expect(engine.getDifficulty()).toBe('hard');
    expect(engine.getConfig().initialBallSpeed).toBe(9.5);
    expect(engine.getConfig().paddleSpeed).toBe(15.0);
    expect(engine.getConfig().maxBallSpeed).toBe(17.0);

    engine.setDifficulty('extreme');
    expect(engine.getDifficulty()).toBe('extreme');
    expect(engine.getConfig().initialBallSpeed).toBe(13.0);
    expect(engine.getConfig().paddleSpeed).toBe(20.0);
    expect(engine.getConfig().maxBallSpeed).toBe(22.0);
  });

  it('debe reescalar en caliente la velocidad de la bola en curso al cambiar dificultad en Breakout (@spec REQ-42)', () => {
    engine.start();
    engine.setBallForTesting(400, 300, 7.0, 0); // Bola viajando a 7.0 px/tick

    // Cambiar a extrema en pleno vuelo
    engine.setDifficulty('extreme');
    expect(engine.getSnapshot().ball.vx).toBeCloseTo(13.0, 1);
    expect(engine.getSnapshot().ball.speed).toBe(13.0);

    // Cambiar a fácil
    engine.setDifficulty('easy');
    expect(engine.getSnapshot().ball.vx).toBeCloseTo(5.0, 1);
    expect(engine.getSnapshot().ball.speed).toBe(5.0);
  });
});
