// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Tipos y modelos de datos para los juegos del catálogo GuacamoleGH Games.
 * @spec REQ-03, REQ-04, REQ-48, REQ-52, REQ-56, REQ-60
 */

export type GameId =
  | 'snake'
  | 'pong'
  | 'tetris'
  | 'breakout'
  | 'tic-tac-toe'
  | 'space-invaders'
  | 'pacman'
  | 'asteroids'
  | 'blackjack';

export type GameStatus = 'coming-soon' | 'available' | 'maintenance';

export type GameCategory = 'Arcade' | 'Puzzle' | 'Clásico' | 'Estrategia' | 'Cartas';

export interface GameMetadata {
  readonly id: GameId;
  readonly title: string;
  readonly description: string;
  readonly category: GameCategory;
  readonly status: GameStatus;
  readonly statusLabel: string;
  readonly iconSvg: string;
  readonly iconUrl?: string;
  readonly releasePhase: string;
}
