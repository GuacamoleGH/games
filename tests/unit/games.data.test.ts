// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Pruebas unitarias de integridad de datos del catálogo de juegos.
 * @spec REQ-03, REQ-04, REQ-05
 */

import { describe, it, expect } from 'vitest';
import { GAMES_DATA, getGames } from '../../src/common/data/games.data.js';
import type { GameId } from '../../src/common/types/game.js';

describe('GAMES_DATA - Integridad del Catálogo (@spec REQ-03, REQ-04, REQ-05)', () => {
  it('debe contener exactamente los 5 juegos clásicos planificados', () => {
    const expectedIds: GameId[] = ['snake', 'pong', 'tetris', 'breakout', 'tic-tac-toe'];
    expect(GAMES_DATA.length).toBe(5);
    
    const actualIds = GAMES_DATA.map((g) => g.id);
    expect(actualIds).toEqual(expectedIds);
  });

  it('todos los juegos deben tener título, descripción e icono válidos', () => {
    for (const game of GAMES_DATA) {
      expect(game.title.trim().length).toBeGreaterThan(0);
      expect(game.description.trim().length).toBeGreaterThan(10);
      expect(game.iconSvg).toContain('<svg');
      expect(game.iconSvg).toContain('</svg>');
    }
  });

  it('Snake, Pong, Tetris y Breakout deben tener estado "available" y los demás "coming-soon" (@spec REQ-04, REQ-05, REQ-13, REQ-20, REQ-27, REQ-34)', () => {
    const snake = GAMES_DATA.find((g) => g.id === 'snake')!;
    expect(snake.status).toBe('available');
    expect(snake.statusLabel).toBe('Jugar');

    const pong = GAMES_DATA.find((g) => g.id === 'pong')!;
    expect(pong.status).toBe('available');
    expect(pong.statusLabel).toBe('Jugar');

    const tetris = GAMES_DATA.find((g) => g.id === 'tetris')!;
    expect(tetris.status).toBe('available');
    expect(tetris.statusLabel).toBe('Jugar');

    const breakout = GAMES_DATA.find((g) => g.id === 'breakout')!;
    expect(breakout.status).toBe('available');
    expect(breakout.statusLabel).toBe('Jugar');

    const futureGames = GAMES_DATA.filter(
      (g) => g.id !== 'snake' && g.id !== 'pong' && g.id !== 'tetris' && g.id !== 'breakout'
    );
    for (const game of futureGames) {
      expect(game.status).toBe('coming-soon');
      expect(game.statusLabel).toBe('Próximamente');
    }
  });

  it('getGames() debe retornar la lista de juegos completa', () => {
    const games = getGames();
    expect(games.length).toBe(5);
    expect(games).toBe(GAMES_DATA);
  });
});
