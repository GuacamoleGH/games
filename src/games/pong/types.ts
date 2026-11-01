// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Tipos y modelos para el motor de física y renderizado del juego Pong.
 * @spec REQ-14, REQ-15
 */

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  dy: number;
}

export interface Ball {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  speed: number;
}

export type PongGameStatus = 'READY' | 'PLAYING' | 'PAUSED' | 'ROUND_OVER' | 'GAME_OVER';

export interface PongConfig {
  courtWidth: number;
  courtHeight: number;
  paddleWidth: number;
  paddleHeight: number;
  paddleSpeed: number;
  ballRadius: number;
  initialBallSpeed: number;
  maxBallSpeed: number;
  speedIncrement: number;
  winningScore: number;
  aiSpeed: number;
}

export interface PongSnapshot {
  playerPaddle: Paddle;
  aiPaddle: Paddle;
  ball: Ball;
  playerScore: number;
  aiScore: number;
  status: PongGameStatus;
  winner: 'PLAYER' | 'AI' | null;
  courtWidth: number;
  courtHeight: number;
}
