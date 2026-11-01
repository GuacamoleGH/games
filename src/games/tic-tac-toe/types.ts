// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Tipos, modelos y definiciones para el juego Tres en Raya (Tic-Tac-Toe).
 * @spec REQ-35, REQ-36, REQ-37
 */

export type Player = 'X' | 'O';

export type CellValue = Player | null;

export type Board = CellValue[];

export type AIDifficulty = 'easy' | 'normal' | 'unbeatable';

export type GameResult = 'X_WINS' | 'O_WINS' | 'DRAW' | null;

export type TicTacToeGameStatus = 'READY' | 'PLAYING' | 'FINISHED';

export interface WinningLine {
  readonly line: [number, number, number];
  readonly direction: 'horizontal-0' | 'horizontal-1' | 'horizontal-2' | 'vertical-0' | 'vertical-1' | 'vertical-2' | 'diagonal-main' | 'diagonal-anti';
}

export interface ScoreBoard {
  playerWins: number;
  aiWins: number;
  draws: number;
}

export interface TicTacToeSnapshot {
  readonly board: readonly CellValue[];
  readonly currentTurn: Player;
  readonly status: TicTacToeGameStatus;
  readonly result: GameResult;
  readonly winningLine: WinningLine | null;
  readonly difficulty: AIDifficulty;
  readonly scores: ScoreBoard;
  readonly isAiThinking: boolean;
}
