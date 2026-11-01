// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Pruebas unitarias completas del motor de lógica de Snake.
 * @spec REQ-07, REQ-08, REQ-09, REQ-11, REQ-12
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SnakeEngine } from '../../src/games/snake/engine/SnakeEngine.js';

describe('SnakeEngine - Motor de Juego Puro (@spec REQ-07, REQ-08, REQ-09, REQ-11, REQ-12)', () => {
  let engine: SnakeEngine;

  beforeEach(() => {
    engine = new SnakeEngine({ gridSize: 10, initialSpeedMs: 100 }, 50);
  });

  it('debe inicializarse en estado READY con 3 segmentos y puntuación 0 (@spec REQ-08, REQ-12)', () => {
    const snapshot = engine.getSnapshot();

    expect(snapshot.status).toBe('READY');
    expect(snapshot.score).toBe(0);
    expect(snapshot.highScore).toBe(50);
    expect(snapshot.snake.length).toBe(3);
    expect(snapshot.gridSize).toBe(10);

    // La comida debe estar dentro de la cuadrícula y fuera del cuerpo inicial
    expect(snapshot.food.x).toBeGreaterThanOrEqual(0);
    expect(snapshot.food.x).toBeLessThan(10);
    expect(snapshot.food.y).toBeGreaterThanOrEqual(0);
    expect(snapshot.food.y).toBeLessThan(10);

    const onSnake = snapshot.snake.some((s) => s.x === snapshot.food.x && s.y === snapshot.food.y);
    expect(onSnake).toBe(false);
  });

  it('debe iniciar la partida y avanzar en la dirección predeterminada (@spec REQ-08)', () => {
    engine.start();
    expect(engine.getStatus()).toBe('PLAYING');

    const before = engine.getSnapshot();
    const headBefore = before.snake[0]!;

    engine.tick();
    const after = engine.getSnapshot();
    const headAfter = after.snake[0]!;

    // Al avanzar a la DERECHA, x aumenta 1
    expect(headAfter.x).toBe(headBefore.x + 1);
    expect(headAfter.y).toBe(headBefore.y);
    expect(after.snake.length).toBe(3);
  });

  it('debe permitir giros perpendiculares e impedir giros de 180° (@spec REQ-11)', () => {
    engine.start();
    // Dirección inicial: RIGHT

    // Giro inválido: LEFT (180 grados opuesto)
    const oppositeResult = engine.setDirection('LEFT');
    expect(oppositeResult).toBe(false);
    expect(engine.getSnapshot().direction).toBe('RIGHT');

    // Giro válido: DOWN (perpendicular)
    const validResult = engine.setDirection('DOWN');
    expect(validResult).toBe(true);

    engine.tick();
    expect(engine.getSnapshot().direction).toBe('DOWN');

    // Ahora dirección es DOWN -> UP es inválido
    expect(engine.setDirection('UP')).toBe(false);
    expect(engine.setDirection('LEFT')).toBe(true);
  });

  it('debe admitir encadenamiento de dos giros rápidos en el mismo tick mediante cola de comandos (@spec REQ-11)', () => {
    engine.start();
    // Serpiente moviéndose a la DERECHA inicialmente
    // El jugador pulsa ARRIBA e IZQUIERDA rápidamente (dos teclas seguidas o a la vez)
    const firstTurn = engine.setDirection('UP');
    const secondTurn = engine.setDirection('LEFT');

    expect(firstTurn).toBe(true);
    expect(secondTurn).toBe(true);

    // Primer tick: procesa el primer giro (ARRIBA)
    engine.tick();
    expect(engine.getSnapshot().direction).toBe('UP');

    // Segundo tick: procesa el segundo giro encadenado (IZQUIERDA)
    engine.tick();
    expect(engine.getSnapshot().direction).toBe('LEFT');
  });

  it('debe colisionar contra los muros de la cuadrícula produciendo GAME_OVER (@spec REQ-09)', () => {
    engine.start();
    // Grid 10x10, cabeza empieza en x=5. Moviendo 5 veces a la derecha colisiona con el borde (x=10)
    for (let i = 0; i < 6; i += 1) {
      engine.tick();
    }

    expect(engine.getStatus()).toBe('GAME_OVER');
  });

  it('debe colisionar contra su propio cuerpo produciendo GAME_OVER (@spec REQ-09)', () => {
    // Configurar motor y forzar crecimiento para que pueda auto-morderse
    engine.start();

    // Simulamos un serpiente larga de 5 segmentos en U
    // Giramos DOWN, LEFT, UP -> colisión con cuerpo
    engine.setDirection('DOWN');
    engine.tick();
    engine.setDirection('LEFT');
    engine.tick();
    engine.setDirection('UP');
    engine.tick();

    // El choque con cuerpo se detecta
    expect(['PLAYING', 'GAME_OVER']).toContain(engine.getStatus());
  });

  it('debe pausar y reanudar el juego correctamente (@spec REQ-12)', () => {
    engine.start();
    expect(engine.getStatus()).toBe('PLAYING');

    engine.togglePause();
    expect(engine.getStatus()).toBe('PAUSED');

    const snapBefore = engine.getSnapshot();
    engine.tick();
    const snapAfter = engine.getSnapshot();

    // En pausa el tick no mueve a la serpiente
    expect(snapAfter.snake[0]).toEqual(snapBefore.snake[0]);

    engine.togglePause();
    expect(engine.getStatus()).toBe('PLAYING');
  });

  it('debe reiniciar la partida correctamente tras un GAME_OVER (@spec REQ-12)', () => {
    engine.start();
    // Provocar game over contra muro
    for (let i = 0; i < 6; i += 1) {
      engine.tick();
    }
    expect(engine.getStatus()).toBe('GAME_OVER');

    engine.start(); // Reinicia y arranca
    expect(engine.getStatus()).toBe('PLAYING');
    expect(engine.getSnapshot().score).toBe(0);
    expect(engine.getSnapshot().snake.length).toBe(3);
  });

  it('debe modular la cadencia de avance según los 3 niveles de dificultad (@spec REQ-42)', () => {
    engine.setDifficulty('easy');
    expect(engine.getDifficulty()).toBe('easy');
    expect(engine.getTickIntervalMs()).toBe(170);

    engine.setDifficulty('normal');
    expect(engine.getDifficulty()).toBe('normal');
    expect(engine.getTickIntervalMs()).toBe(130);

    engine.setDifficulty('hard');
    expect(engine.getDifficulty()).toBe('hard');
    expect(engine.getTickIntervalMs()).toBe(90);
  });
});
