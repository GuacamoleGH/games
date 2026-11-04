// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Definición de tipos y modelos de datos para el juego Asteroids.
 * @spec REQ-53, REQ-54
 */

export type GameStatus = 'READY' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';

export type AsteroidsDifficulty = 'easy' | 'normal' | 'hard' | 'extreme';

export type AsteroidSize = 'large' | 'medium' | 'small';

export interface Ship {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  radius: number;
  isThrusting: boolean;
  invulnerableTimerMs: number;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  lifeMs: number;
}

export interface Asteroid {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: AsteroidSize;
  radius: number;
  rotation: number;
  rotSpeed: number;
  points: number[];
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface AsteroidsConfig {
  readonly virtualWidth: number;
  readonly virtualHeight: number;
  readonly initialLives: number;
  readonly rotationSpeed: number;
  readonly thrustAccel: number;
  readonly friction: number;
  readonly bulletSpeed: number;
  readonly bulletLifeMs: number;
}

export interface AsteroidsSnapshot {
  readonly status: GameStatus;
  readonly score: number;
  readonly highScore: number;
  readonly lives: number;
  readonly wave: number;
  readonly difficulty: AsteroidsDifficulty;
  readonly ship: {
    readonly x: number;
    readonly y: number;
    readonly rotation: number;
    readonly radius: number;
    readonly isThrusting: boolean;
    readonly isInvulnerable: boolean;
  };
  readonly bullets: readonly Bullet[];
  readonly asteroids: readonly Asteroid[];
  readonly particles: readonly Particle[];
}
