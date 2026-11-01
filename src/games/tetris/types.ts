// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Tipos, matrices y modelos para el motor de Tetris.
 * @spec REQ-21, REQ-22
 */

export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export type Matrix = number[][];

export interface Tetromino {
  readonly type: TetrominoType;
  readonly color: string;
  readonly matrix: Matrix;
}

export interface ActivePiece {
  type: TetrominoType;
  color: string;
  matrix: Matrix;
  x: number;
  y: number;
}

export type TetrisGameStatus = 'READY' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface TetrisConfig {
  readonly cols: number;
  readonly rows: number;
  readonly initialSpeedMs: number;
  readonly minSpeedMs: number;
}

export interface TetrisSnapshot {
  readonly board: (string | null)[][];
  readonly currentPiece: ActivePiece | null;
  readonly ghostY: number;
  readonly nextPiece: Tetromino;
  readonly score: number;
  readonly lines: number;
  readonly level: number;
  readonly highScore: number;
  readonly status: TetrisGameStatus;
}

export const TETROMINO_DEFINITIONS: Record<TetrominoType, Tetromino> = {
  I: {
    type: 'I',
    color: '#00f5d4', // Cyan neón
    matrix: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]
  },
  O: {
    type: 'O',
    color: '#ffd166', // Amarillo arcade
    matrix: [
      [1, 1],
      [1, 1]
    ]
  },
  T: {
    type: 'T',
    color: '#b5179e', // Púrpura neón
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ]
  },
  S: {
    type: 'S',
    color: '#00f59b', // Verde aguacate GuacamoleGH
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ]
  },
  Z: {
    type: 'Z',
    color: '#ef476f', // Rojo coral neón
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ]
  },
  J: {
    type: 'J',
    color: '#118ab2', // Azul profundo
    matrix: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ]
  },
  L: {
    type: 'L',
    color: '#f77f00', // Naranja eléctrico
    matrix: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ]
  }
};
