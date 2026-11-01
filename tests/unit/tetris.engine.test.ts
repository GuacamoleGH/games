// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Pruebas unitarias para el motor de Tetris (TetrisEngine).
 * @spec REQ-21, REQ-22, REQ-23, REQ-24
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TetrisEngine } from '../../src/games/tetris/engine/TetrisEngine.js';
import { TETROMINO_DEFINITIONS } from '../../src/games/tetris/types.js';

describe('TetrisEngine - Lógica pura de Tetris', () => {
  let engine: TetrisEngine;

  beforeEach(() => {
    engine = new TetrisEngine(undefined, 500);
  });

  it('debe inicializarse con matriz 10x20, estado READY y récord previo (@spec REQ-22)', () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.board.length).toBe(20);
    expect(snapshot.board[0]?.length).toBe(10);
    expect(snapshot.score).toBe(0);
    expect(snapshot.lines).toBe(0);
    expect(snapshot.level).toBe(1);
    expect(snapshot.highScore).toBe(500);
    expect(snapshot.status).toBe('READY');
    expect(snapshot.currentPiece).not.toBeNull();
    expect(snapshot.nextPiece).toBeDefined();
  });

  it('debe cambiar de estado a PLAYING al iniciar la partida (@spec REQ-22)', () => {
    engine.start();
    expect(engine.getStatus()).toBe('PLAYING');
  });

  it('debe permitir pausar y reanudar la partida (@spec REQ-22)', () => {
    engine.start();
    engine.togglePause();
    expect(engine.getStatus()).toBe('PAUSED');
    engine.togglePause();
    expect(engine.getStatus()).toBe('PLAYING');
  });

  it('debe permitir desplazar la pieza horizontalmente sin salirse de los límites (@spec REQ-22)', () => {
    engine.start();
    const initialSnapshot = engine.getSnapshot();
    const initialX = initialSnapshot.currentPiece!.x;

    // Mover a la izquierda
    const movedLeft = engine.moveLeft();
    expect(movedLeft).toBe(true);
    expect(engine.getSnapshot().currentPiece!.x).toBe(initialX - 1);

    // Mover reiteradamente a la izquierda hasta topar con el muro
    for (let i = 0; i < 10; i += 1) {
      engine.moveLeft();
    }
    const leftLimitX = engine.getSnapshot().currentPiece!.x;
    expect(leftLimitX).toBeLessThanOrEqual(0);
    // Un intento más no debe salirse de la cuadrícula
    const outOfBoundsMove = engine.moveLeft();
    expect(outOfBoundsMove).toBe(false);
  });

  it('debe calcular correctamente la proyección de caída (Ghost Piece) (@spec REQ-24)', () => {
    engine.start();
    const snapshot = engine.getSnapshot();
    expect(snapshot.ghostY).toBeGreaterThanOrEqual(snapshot.currentPiece!.y);
    expect(snapshot.ghostY).toBeLessThan(20);
  });

  it('debe ejecutar Hard Drop cayendo instantáneamente hasta la base y fijándose (@spec REQ-22, REQ-24)', () => {
    engine.start();
    const beforeDrop = engine.getSnapshot();
    const distance = engine.hardDrop();

    expect(distance).toBeGreaterThan(0);
    const afterDrop = engine.getSnapshot();
    // La puntuación aumenta por hard drop
    expect(afterDrop.score).toBeGreaterThan(beforeDrop.score);
    // Se genera una nueva pieza activa
    expect(afterDrop.currentPiece).not.toBeNull();
  });

  it('debe rotar la pieza y aplicar ajuste de pared (Wall Kick) si está en el borde (@spec REQ-22)', () => {
    engine.start();
    // Forzar una pieza tipo I pegada al borde derecho
    const iDef = TETROMINO_DEFINITIONS['I'];
    engine.setCurrentPieceForTesting({
      type: 'I',
      color: iDef.color,
      matrix: iDef.matrix.map((r) => [...r]),
      x: 8,
      y: 5
    });

    const rotated = engine.rotate();
    expect(rotated).toBe(true);
    const snap = engine.getSnapshot();
    // Debe haber ajustado X para no colisionar con la pared derecha
    expect(snap.currentPiece!.x).toBeLessThanOrEqual(7);
  });

  it('debe detectar y limpiar una línea horizontal completa sumando puntuación (@spec REQ-23)', () => {
    engine.start();
    // Configurar tablero con la fila inferior (19) casi completa, dejando solo col 0 vacía
    const emptyBoard = Array.from({ length: 20 }, () => new Array<string | null>(10).fill(null));
    for (let c = 1; c < 10; c += 1) {
      emptyBoard[19]![c] = '#00f59b';
    }
    engine.setBoardForTesting(emptyBoard);

    // Colocar pieza O de 2x2 en (0, 18) para completar la fila 19
    const oDef = TETROMINO_DEFINITIONS['O'];
    engine.setCurrentPieceForTesting({
      type: 'O',
      color: oDef.color,
      matrix: oDef.matrix.map((r) => [...r]),
      x: 0,
      y: 18
    });

    // Bajar la pieza hasta fijarla
    engine.softDrop(); // Llega a colisión y se bloquea

    const snap = engine.getSnapshot();
    expect(snap.lines).toBe(1);
    expect(snap.score).toBe(100); // 100 * nivel 1
  });

  it('debe otorgar 800 puntos por un Tetris (4 líneas simultáneas) (@spec REQ-23)', () => {
    engine.start();
    // Configurar 4 filas inferiores con 9 celdas ocupadas (col 0 vacía)
    const board = Array.from({ length: 20 }, () => new Array<string | null>(10).fill(null));
    for (let r = 16; r < 20; r += 1) {
      for (let c = 1; c < 10; c += 1) {
        board[r]![c] = '#00f59b';
      }
    }
    engine.setBoardForTesting(board);

    // Usar pieza I rotada verticalmente en x = 0
    const iMatrix = [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0]
    ];
    engine.setCurrentPieceForTesting({
      type: 'I',
      color: '#00f59b',
      matrix: iMatrix,
      x: -2,
      y: 16
    });

    engine.softDrop();

    const snap = engine.getSnapshot();
    expect(snap.lines).toBe(4);
    expect(snap.score).toBe(800);
  });

  it('debe aumentar de nivel cada 10 líneas limpiadas y acelerar la velocidad (@spec REQ-23)', () => {
    engine.start();
    engine.setScoreForTesting(900, 9, 1);
    const speedLevel1 = engine.getDropIntervalMs();

    // Simular que se limpia 1 línea más
    const board = Array.from({ length: 20 }, () => new Array<string | null>(10).fill(null));
    for (let c = 1; c < 10; c += 1) {
      board[19]![c] = '#00f59b';
    }
    engine.setBoardForTesting(board);
    const oDef = TETROMINO_DEFINITIONS['O'];
    engine.setCurrentPieceForTesting({
      type: 'O',
      color: oDef.color,
      matrix: oDef.matrix.map((r) => [...r]),
      x: 0,
      y: 18
    });

    engine.softDrop();

    const snap = engine.getSnapshot();
    expect(snap.lines).toBe(10);
    expect(snap.level).toBe(2);
    expect(engine.getDropIntervalMs()).toBeLessThan(speedLevel1);
  });

  it('debe activar GAME_OVER si la nueva pieza colisiona al aparecer (@spec REQ-22)', () => {
    engine.start();
    // Llenar el tablero hasta arriba en el centro
    const fullBoard = Array.from({ length: 20 }, () => new Array<string | null>(10).fill(null));
    for (let r = 0; r < 5; r += 1) {
      for (let c = 3; c < 7; c += 1) {
        fullBoard[r]![c] = '#ff0055';
      }
    }
    engine.setBoardForTesting(fullBoard);

    // Fijar una pieza para forzar el spawn de la siguiente pieza en zona ocupada
    engine.setCurrentPieceForTesting({
      type: 'O',
      color: '#ff0055',
      matrix: [[1, 1], [1, 1]],
      x: 0,
      y: 18
    });
    engine.softDrop();

    expect(engine.getStatus()).toBe('GAME_OVER');
  });
});
