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

  it('todos los juegos deben tener estado "coming-soon" y etiqueta "Próximamente" (@spec REQ-04, REQ-05)', () => {
    for (const game of GAMES_DATA) {
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
