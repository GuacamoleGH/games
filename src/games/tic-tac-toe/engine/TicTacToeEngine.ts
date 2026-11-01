// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Motor de lógica pura y autómata Minimax para Tres en Raya (Tic-Tac-Toe).
 * Desacoplado del DOM y de APIs de renderizado.
 * @spec REQ-36, REQ-37, REQ-38
 */

import type {
  Board,
  CellValue,
  Player,
  AIDifficulty,
  GameResult,
  TicTacToeGameStatus,
  WinningLine,
  ScoreBoard,
  TicTacToeSnapshot
} from '../types.js';

export const WINNING_COMBINATIONS: readonly { line: [number, number, number]; direction: WinningLine['direction'] }[] = [
  { line: [0, 1, 2], direction: 'horizontal-0' },
  { line: [3, 4, 5], direction: 'horizontal-1' },
  { line: [6, 7, 8], direction: 'horizontal-2' },
  { line: [0, 3, 6], direction: 'vertical-0' },
  { line: [1, 4, 7], direction: 'vertical-1' },
  { line: [2, 5, 8], direction: 'vertical-2' },
  { line: [0, 4, 8], direction: 'diagonal-main' },
  { line: [2, 4, 6], direction: 'diagonal-anti' }
];

export class TicTacToeEngine {
  private board: Board;
  private currentTurn: Player = 'X';
  private status: TicTacToeGameStatus = 'READY';
  private result: GameResult = null;
  private winningLine: WinningLine | null = null;
  private difficulty: AIDifficulty = 'normal';
  private scores: ScoreBoard;
  private isAiThinking: boolean = false;

  constructor(initialDifficulty: AIDifficulty = 'normal', initialScores?: Partial<ScoreBoard>) {
    this.board = Array<CellValue>(9).fill(null);
    this.difficulty = initialDifficulty;
    this.scores = {
      playerWins: initialScores?.playerWins ?? 0,
      aiWins: initialScores?.aiWins ?? 0,
      draws: initialScores?.draws ?? 0
    };
    this.reset();
  }

  /**
   * Reinicia el tablero para una nueva ronda.
   * @spec REQ-36
   */
  public reset(): void {
    this.board = Array<CellValue>(9).fill(null);
    this.currentTurn = 'X';
    this.status = 'PLAYING';
    this.result = null;
    this.winningLine = null;
    this.isAiThinking = false;
  }

  /**
   * Configura la dificultad de la IA.
   * @spec REQ-37
   */
  public setDifficulty(difficulty: AIDifficulty): void {
    this.difficulty = difficulty;
  }

  /**
   * Ejecuta el movimiento de un jugador en la casilla dada.
   * @spec REQ-36, REQ-38
   * @param index Índice de celda (0 a 8).
   * @returns true si el movimiento fue válido y aplicado.
   */
  public makeMove(index: number): boolean {
    if (this.status !== 'PLAYING') {
      return false;
    }
    if (index < 0 || index >= 9 || this.board[index] !== null) {
      return false;
    }

    this.board[index] = this.currentTurn;

    const win = this.checkWin(this.board, this.currentTurn);
    if (win) {
      this.status = 'FINISHED';
      this.result = this.currentTurn === 'X' ? 'X_WINS' : 'O_WINS';
      this.winningLine = win;
      if (this.result === 'X_WINS') {
        this.scores.playerWins += 1;
      } else {
        this.scores.aiWins += 1;
      }
      return true;
    }

    if (this.isBoardFull(this.board)) {
      this.status = 'FINISHED';
      this.result = 'DRAW';
      this.scores.draws += 1;
      return true;
    }

    // Alternar turno
    this.currentTurn = this.currentTurn === 'X' ? 'O' : 'X';
    return true;
  }

  /**
   * Ejecuta el movimiento automático de la IA rival ('O').
   * @spec REQ-37, REQ-38
   * @returns Índice elegido por la IA, o null si no se pudo jugar.
   */
  public makeAiMove(): number | null {
    if (this.status !== 'PLAYING' || this.currentTurn !== 'O') {
      return null;
    }

    let chosenIndex: number;

    if (this.difficulty === 'easy') {
      chosenIndex = this.getEasyMove();
    } else if (this.difficulty === 'normal') {
      chosenIndex = this.getNormalMove();
    } else {
      chosenIndex = this.getBestMoveMinimax();
    }

    if (chosenIndex < 0 || chosenIndex >= 9 || this.board[chosenIndex] !== null) {
      return null;
    }

    this.makeMove(chosenIndex);
    return chosenIndex;
  }

  public setAiThinking(thinking: boolean): void {
    this.isAiThinking = thinking;
  }

  public getSnapshot(): TicTacToeSnapshot {
    const snap: TicTacToeSnapshot = {
      board: [...this.board],
      currentTurn: this.currentTurn,
      status: this.status,
      result: this.result,
      winningLine: this.winningLine ? { ...this.winningLine } : null,
      difficulty: this.difficulty,
      scores: { ...this.scores },
      isAiThinking: this.isAiThinking
    };
    return snap;
  }

  public getStatus(): TicTacToeGameStatus {
    const s = this.status;
    return s;
  }

  /**
   * Métodos auxiliares para tests unitarios deterministas.
   * @spec REQ-36, REQ-37, REQ-38
   */
  public setBoardForTesting(board: Board): void {
    this.board = [...board];
  }

  public setCurrentTurnForTesting(turn: Player): void {
    this.currentTurn = turn;
  }

  public setScoresForTesting(scores: ScoreBoard): void {
    this.scores = { ...scores };
  }

  private checkWin(board: Board, player: Player): WinningLine | null {
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo.line;
      if (board[a] === player && board[b] === player && board[c] === player) {
        const win: WinningLine = {
          line: combo.line,
          direction: combo.direction
        };
        return win;
      }
    }
    return null;
  }

  private isBoardFull(board: Board): boolean {
    const full = board.every((cell) => cell !== null);
    return full;
  }

  private getEmptyCellIndices(board: Board): number[] {
    const indices: number[] = [];
    for (let i = 0; i < board.length; i += 1) {
      if (board[i] === null) {
        indices.push(i);
      }
    }
    return indices;
  }

  private getNormalMove(): number {
    const emptyCells = this.getEmptyCellIndices(this.board);
    if (emptyCells.length === 0) {
      return -1;
    }

    // 1) Si la IA puede ganar en este turno, toma la victoria
    for (const idx of emptyCells) {
      this.board[idx] = 'O';
      const win = this.checkWin(this.board, 'O');
      this.board[idx] = null;
      if (win) {
        return idx;
      }
    }

    // 2) Si el rival está a punto de ganar, bloquear el 80% de las veces
    for (const idx of emptyCells) {
      this.board[idx] = 'X';
      const playerWin = this.checkWin(this.board, 'X');
      this.board[idx] = null;
      if (playerWin && Math.random() < 0.8) {
        return idx;
      }
    }

    // 3) 50% de probabilidad de jugada óptima minimax, 50% aleatoria
    if (Math.random() < 0.5) {
      return this.getBestMoveMinimax();
    }

    const randomIdx = Math.floor(Math.random() * emptyCells.length);
    const chosen = emptyCells[randomIdx]!;
    return chosen;
  }

  private getEasyMove(): number {
    const emptyCells = this.getEmptyCellIndices(this.board);
    if (emptyCells.length === 0) {
      return -1;
    }

    // 1) Si la IA puede ganar en este turno, toma la victoria
    for (const idx of emptyCells) {
      this.board[idx] = 'O';
      const win = this.checkWin(this.board, 'O');
      this.board[idx] = null;
      if (win) {
        return idx;
      }
    }

    // 2) 50% de probabilidad de elegir un movimiento al azar
    const isRandom = Math.random() < 0.5;
    if (isRandom) {
      const randomIdx = Math.floor(Math.random() * emptyCells.length);
      const chosen = emptyCells[randomIdx]!;
      return chosen;
    }

    // 3) En el resto de casos, bloquear al jugador si está a punto de ganar
    for (const idx of emptyCells) {
      this.board[idx] = 'X';
      const playerWin = this.checkWin(this.board, 'X');
      this.board[idx] = null;
      if (playerWin) {
        return idx;
      }
    }

    const fallbackIdx = Math.floor(Math.random() * emptyCells.length);
    const chosenFallback = emptyCells[fallbackIdx]!;
    return chosenFallback;
  }

  /**
   * Calcula el movimiento óptimo invencible para la IA usando el algoritmo Minimax.
   * @spec REQ-37
   */
  public getBestMoveMinimax(): number {
    const emptyCells = this.getEmptyCellIndices(this.board);
    if (emptyCells.length === 0) {
      return -1;
    }

    // Si el tablero está vacío al inicio, el centro o una esquina es óptimo
    if (emptyCells.length === 9) {
      return 4; // Centro
    }

    let bestScore = -Infinity;
    let bestMove = emptyCells[0]!;

    for (const index of emptyCells) {
      this.board[index] = 'O';
      const score = this.minimax(this.board, 0, false);
      this.board[index] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = index;
      }
    }

    return bestMove;
  }

  private minimax(board: Board, depth: number, isMaximizing: boolean): number {
    const oWin = this.checkWin(board, 'O');
    if (oWin) {
      return 10 - depth;
    }

    const xWin = this.checkWin(board, 'X');
    if (xWin) {
      return depth - 10;
    }

    if (this.isBoardFull(board)) {
      return 0;
    }

    const emptyCells = this.getEmptyCellIndices(board);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const idx of emptyCells) {
        board[idx] = 'O';
        const evaluation = this.minimax(board, depth + 1, false);
        board[idx] = null;
        maxEval = Math.max(maxEval, evaluation);
      }
      return maxEval;
    }

    let minEval = Infinity;
    for (const idx of emptyCells) {
      board[idx] = 'X';
      const evaluation = this.minimax(board, depth + 1, true);
      board[idx] = null;
      minEval = Math.min(minEval, evaluation);
    }
    return minEval;
  }
}
