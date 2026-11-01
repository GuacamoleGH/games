// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Pruebas unitarias para el motor de Tres en Raya (TicTacToeEngine) y su IA Minimax.
 * @spec REQ-35, REQ-36, REQ-37, REQ-38
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TicTacToeEngine } from '../../src/games/tic-tac-toe/engine/TicTacToeEngine.js';

describe('TicTacToeEngine - Lógica Pura y Minimax (@spec REQ-35, REQ-36, REQ-37, REQ-38)', () => {
  let engine: TicTacToeEngine;

  beforeEach(() => {
    engine = new TicTacToeEngine('unbeatable', { playerWins: 2, aiWins: 1, draws: 1 });
  });

  it('debe inicializarse con tablero vacío de 9 celdas y turno del jugador X (@spec REQ-35, REQ-36)', () => {
    const snap = engine.getSnapshot();
    expect(snap.board.length).toBe(9);
    expect(snap.board.every((c) => c === null)).toBe(true);
    expect(snap.currentTurn).toBe('X');
    expect(snap.status).toBe('PLAYING');
    expect(snap.result).toBeNull();
    expect(snap.winningLine).toBeNull();
    expect(snap.scores.playerWins).toBe(2);
    expect(snap.scores.aiWins).toBe(1);
    expect(snap.scores.draws).toBe(1);
  });

  it('debe registrar un movimiento válido y alternar turnos (@spec REQ-36)', () => {
    const valid = engine.makeMove(4); // Centro
    expect(valid).toBe(true);
    const snap = engine.getSnapshot();
    expect(snap.board[4]).toBe('X');
    expect(snap.currentTurn).toBe('O');

    // Intentar mover en la misma casilla ocupada debe fallar
    const invalid = engine.makeMove(4);
    expect(invalid).toBe(false);
  });

  it('debe detectar una victoria horizontal para el jugador X (@spec REQ-36, REQ-38)', () => {
    // Configurar tablero con fila superior casi completa
    engine.setBoardForTesting([
      'X', 'X', null,
      'O', 'O', null,
      null, null, null
    ]);
    engine.setCurrentTurnForTesting('X');

    const moved = engine.makeMove(2); // Completa fila 0
    expect(moved).toBe(true);

    const snap = engine.getSnapshot();
    expect(snap.status).toBe('FINISHED');
    expect(snap.result).toBe('X_WINS');
    expect(snap.winningLine?.direction).toBe('horizontal-0');
    expect(snap.winningLine?.line).toEqual([0, 1, 2]);
    expect(snap.scores.playerWins).toBe(3);
  });

  it('debe detectar una victoria vertical para la IA O (@spec REQ-36, REQ-38)', () => {
    engine.setBoardForTesting([
      'X', 'O', null,
      'X', 'O', null,
      null, null, null
    ]);
    engine.setCurrentTurnForTesting('O');

    const moved = engine.makeMove(7); // Completa col 1: [1, 4, 7]
    expect(moved).toBe(true);

    const snap = engine.getSnapshot();
    expect(snap.status).toBe('FINISHED');
    expect(snap.result).toBe('O_WINS');
    expect(snap.winningLine?.direction).toBe('vertical-1');
    expect(snap.scores.aiWins).toBe(2);
  });

  it('debe detectar una victoria diagonal (@spec REQ-36)', () => {
    engine.setBoardForTesting([
      'X', null, null,
      null, 'X', null,
      'O', 'O', null
    ]);
    engine.setCurrentTurnForTesting('X');

    const moved = engine.makeMove(8); // Completa diagonal principal: [0, 4, 8]
    expect(moved).toBe(true);

    const snap = engine.getSnapshot();
    expect(snap.status).toBe('FINISHED');
    expect(snap.result).toBe('X_WINS');
    expect(snap.winningLine?.direction).toBe('diagonal-main');
  });

  it('debe detectar un empate (tablas) cuando el tablero se llena sin ganador (@spec REQ-36, REQ-38)', () => {
    engine.setBoardForTesting([
      'X', 'O', 'X',
      'X', 'O', 'O',
      'O', 'X', null
    ]);
    engine.setCurrentTurnForTesting('X');

    const moved = engine.makeMove(8);
    expect(moved).toBe(true);

    const snap = engine.getSnapshot();
    expect(snap.status).toBe('FINISHED');
    expect(snap.result).toBe('DRAW');
    expect(snap.winningLine).toBeNull();
    expect(snap.scores.draws).toBe(2);
  });

  it('la IA imbatible con Minimax debe bloquear una victoria inminente del jugador (@spec REQ-37)', () => {
    // El jugador X tiene celdas 0 y 1, si marca 2 gana. La IA O debe bloquear jugando en 2.
    engine.setBoardForTesting([
      'X', 'X', null,
      null, 'O', null,
      null, null, null
    ]);
    engine.setCurrentTurnForTesting('O');

    const chosen = engine.makeAiMove();
    expect(chosen).toBe(2);
    expect(engine.getSnapshot().board[2]).toBe('O');
  });

  it('la IA imbatible con Minimax debe priorizar su propia victoria sobre cualquier otra jugada (@spec REQ-37)', () => {
    // La IA O tiene celdas 3 y 4, con celda 5 vacía. O debe ganar directamente en 5.
    engine.setBoardForTesting([
      'X', 'X', null,
      'O', 'O', null,
      null, null, null
    ]);
    engine.setCurrentTurnForTesting('O');

    const chosen = engine.makeAiMove();
    expect(chosen).toBe(5);
    expect(engine.getSnapshot().result).toBe('O_WINS');
  });

  it('la IA en dificultad fácil debe ser capaz de realizar jugadas válidas (@spec REQ-37)', () => {
    engine.setDifficulty('easy');
    engine.makeMove(0); // Jugador mueve en 0
    const aiMove = engine.makeAiMove(); // IA responde
    expect(aiMove).not.toBeNull();
    expect(aiMove).not.toBe(0);
    expect(engine.getSnapshot().board[aiMove!]).toBe('O');
  });

  it('debe reiniciar el tablero manteniendo el historial de tanteo (@spec REQ-36, REQ-38)', () => {
    engine.makeMove(0);
    engine.reset();
    const snap = engine.getSnapshot();
    expect(snap.board.every((c) => c === null)).toBe(true);
    expect(snap.currentTurn).toBe('X');
    expect(snap.scores.playerWins).toBe(2);
  });
});
