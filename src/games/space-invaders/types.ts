// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Tipos y modelos de datos para el módulo Space Invaders.
 * @spec REQ-43, REQ-44, REQ-45
 */

export type InvaderType = 'squid' | 'crab' | 'octopus';

export type SpaceInvadersDifficulty = 'easy' | 'normal' | 'hard' | 'extreme';

export type SpaceInvadersGameStatus = 'READY' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAME_OVER';

export interface PlayerCannon {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export interface Invader {
  readonly id: string;
  readonly row: number;
  readonly col: number;
  x: number;
  y: number;
  readonly width: number;
  readonly height: number;
  readonly type: InvaderType;
  readonly points: number;
  isAlive: boolean;
  animFrame: number;
}

export interface Bullet {
  readonly id: string;
  x: number;
  y: number;
  readonly width: number;
  readonly height: number;
  vy: number;
  readonly fromPlayer: boolean;
}

export interface BunkerCell {
  x: number;
  y: number;
  width: number;
  height: number;
  health: number; // 3 = Intacto, 2 = Dañado, 1 = Crítico, 0 = Destruido
}

export interface Bunker {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly cells: BunkerCell[];
}

export interface Ufo {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  points: number;
  isActive: boolean;
}

export interface SpaceInvadersConfig {
  readonly virtualWidth: number;
  readonly virtualHeight: number;
  playerWidth: number;
  playerHeight: number;
  playerSpeed: number;
  playerBulletSpeed: number;
  invaderBulletSpeed: number;
  readonly bulletWidth: number;
  readonly bulletHeight: number;
  readonly invaderRows: number;
  readonly invaderCols: number;
  readonly invaderWidth: number;
  readonly invaderHeight: number;
  readonly invaderPaddingX: number;
  readonly invaderPaddingY: number;
  invaderOffsetTop: number;
  readonly bunkerCount: number;
  readonly initialLives: number;
  baseMarchIntervalMs: number;
}

export interface SpaceInvadersSnapshot {
  readonly player: PlayerCannon;
  readonly invaders: readonly Invader[];
  readonly bullets: readonly Bullet[];
  readonly bunkers: readonly Bunker[];
  readonly ufo: Ufo;
  readonly score: number;
  readonly lives: number;
  readonly highScore: number;
  readonly wave: number;
  readonly status: SpaceInvadersGameStatus;
  readonly difficulty: SpaceInvadersDifficulty;
  readonly remainingInvaders: number;
  readonly totalInvaders: number;
}
