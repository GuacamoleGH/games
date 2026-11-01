// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Tipos y modelos para el motor y vista del juego Snake.
 * @spec REQ-07, REQ-08
 */

export interface Point {
  readonly x: number;
  readonly y: number;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameStatus = 'READY' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface SnakeConfig {
  readonly gridSize: number;
  readonly initialSpeedMs: number;
  readonly minSpeedMs: number;
  readonly speedDecrementMs: number;
}

export interface SnakeSnapshot {
  readonly snake: readonly Point[];
  readonly food: Point;
  readonly direction: Direction;
  readonly status: GameStatus;
  readonly score: number;
  readonly highScore: number;
  readonly gridSize: number;
}
