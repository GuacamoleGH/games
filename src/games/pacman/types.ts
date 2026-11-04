// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Definición de tipos y estructuras de datos para el juego Pac-Man.
 * @spec REQ-49, REQ-50
 */

export type PacmanDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'NONE';

export type GameStatus = 'READY' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';

export type GhostType = 'blinky' | 'pinky' | 'inky' | 'clyde';

export type GhostState = 'chase' | 'scatter' | 'frightened' | 'eaten';

export type PacmanDifficulty = 'easy' | 'normal' | 'hard';

export interface Position {
  x: number;
  y: number;
}

export interface Ghost {
  id: GhostType;
  x: number;
  y: number;
  dir: PacmanDirection;
  state: GhostState;
  color: string;
  targetX: number;
  targetY: number;
  releaseTimerMs: number;
}

export interface PacmanEntity {
  x: number;
  y: number;
  dir: PacmanDirection;
  nextDir: PacmanDirection;
  mouthAngle: number;
}

export interface PacmanConfig {
  readonly cols: number;
  readonly rows: number;
  readonly tileSize: number;
  readonly initialLives: number;
  readonly baseSpeed: number;
  readonly frightenedDurationMs: number;
}

export interface PacmanSnapshot {
  readonly status: GameStatus;
  readonly score: number;
  readonly highScore: number;
  readonly lives: number;
  readonly level: number;
  readonly difficulty: PacmanDifficulty;
  readonly pacman: {
    readonly x: number;
    readonly y: number;
    readonly dir: PacmanDirection;
    readonly mouthAngle: number;
  };
  readonly ghosts: readonly Ghost[];
  readonly pelletsRemaining: number;
  readonly frightenedTimerMs: number;
}
