// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Definición de tipos, modelos e interfaces para el juego Breakout.
 * @spec REQ-28, REQ-29, REQ-31
 */

export type BreakoutGameStatus = 'READY' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';

export interface Brick {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly color: string;
  readonly points: number;
  hitsLeft: number;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export interface Ball {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  speed: number;
}

export interface BreakoutConfig {
  readonly virtualWidth: number;
  readonly virtualHeight: number;
  readonly paddleWidth: number;
  readonly paddleHeight: number;
  paddleSpeed: number;
  readonly ballRadius: number;
  initialBallSpeed: number;
  maxBallSpeed: number;
  readonly initialLives: number;
  readonly brickRows: number;
  readonly brickCols: number;
  readonly brickPadding: number;
  readonly brickOffsetTop: number;
  readonly brickOffsetLeft: number;
  readonly brickHeight: number;
}

export interface BreakoutSnapshot {
  readonly paddle: Paddle;
  readonly ball: Ball;
  readonly bricks: readonly Brick[];
  readonly score: number;
  readonly lives: number;
  readonly highScore: number;
  readonly status: BreakoutGameStatus;
  readonly totalBricks: number;
  readonly remainingBricks: number;
}
