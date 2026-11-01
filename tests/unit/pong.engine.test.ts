// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Pruebas unitarias completas del motor físico y reglas de Pong.
 * @spec REQ-14, REQ-15, REQ-16, REQ-17, REQ-42
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PongEngine } from '../../src/games/pong/engine/PongEngine.js';

describe('PongEngine - Motor de Física y Tanteo (@spec REQ-14, REQ-15, REQ-16, REQ-17, REQ-42)', () => {
  let engine: PongEngine;

  beforeEach(() => {
    engine = new PongEngine({
      courtWidth: 800,
      courtHeight: 500,
      paddleWidth: 16,
      paddleHeight: 100,
      paddleSpeed: 400,
      ballRadius: 8,
      initialBallSpeed: 300,
      maxBallSpeed: 600,
      speedIncrement: 20,
      winningScore: 3,
      aiSpeed: 250
    });
  });

  it('debe inicializarse en estado READY con tanteo 0 - 0 y elementos centrados (@spec REQ-15, REQ-17)', () => {
    const snap = engine.getSnapshot();

    expect(snap.status).toBe('READY');
    expect(snap.playerScore).toBe(0);
    expect(snap.aiScore).toBe(0);
    expect(snap.winner).toBeNull();

    // Bola en el centro
    expect(snap.ball.x).toBe(400);
    expect(snap.ball.y).toBe(250);

    // Palas centradas verticalmente
    expect(snap.playerPaddle.y).toBe((500 - 100) / 2);
    expect(snap.aiPaddle.y).toBe((500 - 100) / 2);
  });

  it('debe iniciar la partida y asignar velocidad a la bola (@spec REQ-15)', () => {
    engine.start();
    expect(engine.getStatus()).toBe('PLAYING');

    const snap = engine.getSnapshot();
    expect(Math.abs(snap.ball.vx)).toBeGreaterThan(0);

    // Un tick de 0.016s (60fps) debe desplazar la bola
    engine.tick(0.016);
    const snapAfter = engine.getSnapshot();
    expect(snapAfter.ball.x).not.toBe(400);
  });

  it('debe mover la pala del jugador y respetar los límites de la pista (@spec REQ-15)', () => {
    engine.start();

    // Mover hacia arriba continuamente
    engine.setPlayerMove(-1);
    for (let i = 0; i < 60; i += 1) {
      engine.tick(0.016);
    }

    const snapTop = engine.getSnapshot();
    expect(snapTop.playerPaddle.y).toBe(0);

    // Mover hacia abajo continuamente
    engine.setPlayerMove(1);
    for (let i = 0; i < 120; i += 1) {
      engine.tick(0.016);
    }

    const snapBottom = engine.getSnapshot();
    expect(snapBottom.playerPaddle.y).toBe(500 - 100);
  });

  it('debe rebotar la bola en los bordes superior e inferior de la pista (@spec REQ-15)', () => {
    engine.start();

    // Situamos la bola tocando el borde superior con velocidad vertical negativa
    engine.setBallForTesting(400, 5, 100, -200);

    engine.tick(0.016);

    const afterBounce = engine.getSnapshot();
    // Tras el impacto en la pared superior, vy debe invertirse a positivo
    expect(afterBounce.ball.vy).toBeGreaterThan(0);
  });

  it('la IA del rival debe perseguir la posición vertical de la bola (@spec REQ-16)', () => {
    engine.start();

    // Situamos la bola en la parte inferior viajando hacia la IA (vx > 0)
    const aiBeforeY = engine.getSnapshot().aiPaddle.y;
    engine.setBallForTesting(600, 450, 300, 0);

    // Simular avances
    for (let i = 0; i < 20; i += 1) {
      engine.tick(0.016);
    }

    const aiAfterY = engine.getSnapshot().aiPaddle.y;
    // La pala de la IA debe haber descendido hacia la bola
    expect(aiAfterY).toBeGreaterThan(aiBeforeY);
  });

  it('debe detectar goles y otorgar victoria al alcanzar el tanteo ganador (@spec REQ-17)', () => {
    engine.start();

    // Forzar bola fuera del campo derecho -> Tanto del jugador
    engine.setBallForTesting(820, 250, 300, 0);
    engine.tick(0.016);
    expect(engine.getSnapshot().playerScore).toBe(1);

    // Segundo tanto
    engine.setBallForTesting(820, 250, 300, 0);
    engine.tick(0.016);
    expect(engine.getSnapshot().playerScore).toBe(2);

    // Tercer tanto (condición de victoria configurada en 3)
    engine.setBallForTesting(820, 250, 300, 0);
    engine.tick(0.016);

    const finalSnap = engine.getSnapshot();
    expect(finalSnap.playerScore).toBe(3);
    expect(finalSnap.status).toBe('GAME_OVER');
    expect(finalSnap.winner).toBe('PLAYER');
  });

  it('debe pausar y reanudar la simulación física correctamente (@spec REQ-17)', () => {
    engine.start();
    expect(engine.getStatus()).toBe('PLAYING');

    engine.togglePause();
    expect(engine.getStatus()).toBe('PAUSED');

    const snapBefore = engine.getSnapshot();
    engine.tick(0.016);
    const snapAfter = engine.getSnapshot();

    // En pausa nada debe desplazarse
    expect(snapAfter.ball.x).toBe(snapBefore.ball.x);
    expect(snapAfter.ball.y).toBe(snapBefore.ball.y);

    engine.togglePause();
    expect(engine.getStatus()).toBe('PLAYING');
  });

  it('debe modular la velocidad de la bola y agilidad de la IA según la dificultad (@spec REQ-42)', () => {
    engine.setDifficulty('easy');
    expect(engine.getDifficulty()).toBe('easy');
    expect(engine.getConfig().initialBallSpeed).toBe(260);
    expect(engine.getConfig().aiSpeed).toBe(200);

    engine.setDifficulty('normal');
    expect(engine.getDifficulty()).toBe('normal');
    expect(engine.getConfig().initialBallSpeed).toBe(400);
    expect(engine.getConfig().aiSpeed).toBe(340);

    engine.setDifficulty('hard');
    expect(engine.getDifficulty()).toBe('hard');
    expect(engine.getConfig().initialBallSpeed).toBe(600);
    expect(engine.getConfig().aiSpeed).toBe(520);

    engine.setDifficulty('extreme');
    expect(engine.getDifficulty()).toBe('extreme');
    expect(engine.getConfig().initialBallSpeed).toBe(850);
    expect(engine.getConfig().aiSpeed).toBe(750);
  });

  it('debe reescalar en caliente la velocidad de la bola en curso al cambiar dificultad en Pong (@spec REQ-42)', () => {
    engine.start();
    engine.setBallForTesting(400, 250, 400, 0); // Bola viajando a 400 px/s

    // Cambiar a dificultad extrema mientras la bola vuela
    engine.setDifficulty('extreme');
    expect(engine.getSnapshot().ball.vx).toBeCloseTo(850, 0);
    expect(engine.getSnapshot().ball.speed).toBe(850);

    // Cambiar a fácil
    engine.setDifficulty('easy');
    expect(engine.getSnapshot().ball.vx).toBeCloseTo(260, 0);
    expect(engine.getSnapshot().ball.speed).toBe(260);
  });
});
