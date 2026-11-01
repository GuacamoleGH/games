// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Motor de lógica pura de Tetris (matriz 10x20, rotaciones, colisiones, líneas y ghost piece).
 * Desacoplado de cualquier API de renderizado o del DOM.
 * @spec REQ-22, REQ-23, REQ-24
 */

import {
  TETROMINO_DEFINITIONS,
  type TetrominoType,
  type Tetromino,
  type ActivePiece,
  type Matrix,
  type TetrisConfig,
  type TetrisSnapshot,
  type TetrisGameStatus
} from '../types.js';

export const DEFAULT_TETRIS_CONFIG: TetrisConfig = {
  cols: 10,
  rows: 20,
  initialSpeedMs: 700,
  minSpeedMs: 120
};

export class TetrisEngine {
  public onSoundEvent?: (event: 'lock' | 'line' | 'tetris' | 'game_over') => void;
  private readonly config: TetrisConfig;
  private board: (string | null)[][];
  private currentPiece: ActivePiece | null = null;
  private nextPiece: Tetromino;
  private score: number = 0;
  private lines: number = 0;
  private level: number = 1;
  private highScore: number = 0;
  private status: TetrisGameStatus = 'READY';

  constructor(customConfig?: Partial<TetrisConfig>, initialHighScore: number = 0) {
    this.config = {
      cols: customConfig?.cols ?? DEFAULT_TETRIS_CONFIG.cols,
      rows: customConfig?.rows ?? DEFAULT_TETRIS_CONFIG.rows,
      initialSpeedMs: customConfig?.initialSpeedMs ?? DEFAULT_TETRIS_CONFIG.initialSpeedMs,
      minSpeedMs: customConfig?.minSpeedMs ?? DEFAULT_TETRIS_CONFIG.minSpeedMs
    };
    this.highScore = Math.max(0, initialHighScore);
    this.board = this.createEmptyBoard();
    this.nextPiece = this.generateRandomPiece();
    this.reset();
  }

  /**
   * Reinicia la matriz de juego y contadores.
   * @spec REQ-22
   */
  public reset(): void {
    this.board = this.createEmptyBoard();
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.status = 'READY';
    this.nextPiece = this.generateRandomPiece();
    this.spawnPiece();
  }

  /**
   * Inicia el juego.
   * @spec REQ-22
   */
  public start(): void {
    if (this.status === 'GAME_OVER') {
      this.reset();
    }
    this.status = 'PLAYING';
  }

  /**
   * Pausa o reanuda la partida.
   * @spec REQ-22
   */
  public togglePause(): void {
    if (this.status === 'PLAYING') {
      this.status = 'PAUSED';
      return;
    }
    if (this.status === 'PAUSED') {
      this.status = 'PLAYING';
      return;
    }
  }

  /**
   * Desplaza la pieza activa una celda a la izquierda.
   * @spec REQ-22
   */
  public moveLeft(): boolean {
    if (this.status !== 'PLAYING' || !this.currentPiece) {
      return false;
    }
    const moved = this.tryMove(this.currentPiece.x - 1, this.currentPiece.y, this.currentPiece.matrix);
    return moved;
  }

  /**
   * Desplaza la pieza activa una celda a la derecha.
   * @spec REQ-22
   */
  public moveRight(): boolean {
    if (this.status !== 'PLAYING' || !this.currentPiece) {
      return false;
    }
    const moved = this.tryMove(this.currentPiece.x + 1, this.currentPiece.y, this.currentPiece.matrix);
    return moved;
  }

  /**
   * Desciende la pieza una celda (Soft Drop).
   * @spec REQ-22
   */
  public softDrop(): boolean {
    if (this.status !== 'PLAYING' || !this.currentPiece) {
      return false;
    }
    const moved = this.tryMove(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.matrix);
    if (!moved) {
      this.lockCurrentPiece();
    }
    return moved;
  }

  /**
   * Hace caer la pieza instantáneamente hasta su proyección más baja (Hard Drop).
   * @spec REQ-22, REQ-24
   */
  public hardDrop(): number {
    if (this.status !== 'PLAYING' || !this.currentPiece) {
      return 0;
    }
    const ghostY = this.computeGhostY();
    const droppedDistance = ghostY - this.currentPiece.y;
    this.currentPiece.y = ghostY;
    this.score += droppedDistance * 2;
    this.lockCurrentPiece();
    return droppedDistance;
  }

  /**
   * Rota la pieza activa en sentido horario con algoritmo de ajuste de pared (Wall Kick).
   * @spec REQ-22
   */
  public rotate(): boolean {
    if (this.status !== 'PLAYING' || !this.currentPiece) {
      return false;
    }

    const rotatedMatrix = this.rotateMatrixClockwise(this.currentPiece.matrix);

    // Pruebas de ajuste lateral (Wall Kick): centro, izquierda 1, derecha 1, izquierda 2, derecha 2
    const kickOffsets = [0, -1, 1, -2, 2];
    for (const offset of kickOffsets) {
      const testX = this.currentPiece.x + offset;
      if (!this.checkCollision(testX, this.currentPiece.y, rotatedMatrix)) {
        this.currentPiece.x = testX;
        this.currentPiece.matrix = rotatedMatrix;
        return true;
      }
    }

    return false;
  }

  /**
   * Ejecuta un paso o tick de caída periódica.
   * @spec REQ-22, REQ-23
   */
  public tick(): TetrisSnapshot {
    if (this.status === 'PLAYING') {
      this.softDrop();
    }
    const snapshot = this.getSnapshot();
    return snapshot;
  }

  /**
   * Retorna una instantánea inmutable del estado del juego.
   * @spec REQ-22, REQ-24
   */
  public getSnapshot(): TetrisSnapshot {
    const snapshot: TetrisSnapshot = {
      board: this.board.map((row) => [...row]),
      currentPiece: this.currentPiece ? { ...this.currentPiece, matrix: this.currentPiece.matrix.map((r) => [...r]) } : null,
      ghostY: this.computeGhostY(),
      nextPiece: this.nextPiece,
      score: this.score,
      lines: this.lines,
      level: this.level,
      highScore: this.highScore,
      status: this.status
    };
    return snapshot;
  }

  public getDropIntervalMs(): number {
    const speed = Math.max(
      this.config.minSpeedMs,
      this.config.initialSpeedMs - (this.level - 1) * 60
    );
    return speed;
  }

  public getStatus(): TetrisGameStatus {
    const s = this.status;
    return s;
  }

  /**
   * Métodos auxiliares para pruebas unitarias deterministas.
   * @spec REQ-22, REQ-23
   */
  public setBoardForTesting(board: (string | null)[][]): void {
    this.board = board.map((row) => [...row]);
  }

  public setCurrentPieceForTesting(piece: ActivePiece): void {
    this.currentPiece = {
      ...piece,
      matrix: piece.matrix.map((r) => [...r])
    };
  }

  public setScoreForTesting(score: number, lines: number, level: number): void {
    this.score = score;
    this.lines = lines;
    this.level = level;
  }

  private tryMove(targetX: number, targetY: number, matrix: Matrix): boolean {
    if (!this.currentPiece) {
      return false;
    }
    if (this.checkCollision(targetX, targetY, matrix)) {
      return false;
    }
    this.currentPiece.x = targetX;
    this.currentPiece.y = targetY;
    return true;
  }

  private checkCollision(x: number, y: number, matrix: Matrix): boolean {
    for (let r = 0; r < matrix.length; r += 1) {
      const row = matrix[r];
      if (!row) {
        continue;
      }
      for (let c = 0; c < row.length; c += 1) {
        if (row[c] !== 0) {
          const boardX = x + c;
          const boardY = y + r;

          // Colisión con límites de la cuadrícula
          if (boardX < 0 || boardX >= this.config.cols || boardY >= this.config.rows) {
            return true;
          }

          // Colisión con celdas ya ocupadas
          if (boardY >= 0) {
            const boardRow = this.board[boardY];
            if (boardRow && boardRow[boardX] !== null) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  private computeGhostY(): number {
    if (!this.currentPiece) {
      return 0;
    }
    let testY = this.currentPiece.y;
    while (!this.checkCollision(this.currentPiece.x, testY + 1, this.currentPiece.matrix)) {
      testY += 1;
    }
    return testY;
  }

  private lockCurrentPiece(): void {
    if (!this.currentPiece) {
      return;
    }

    const { matrix, x, y, color } = this.currentPiece;
    for (let r = 0; r < matrix.length; r += 1) {
      const row = matrix[r];
      if (!row) {
        continue;
      }
      for (let c = 0; c < row.length; c += 1) {
        if (row[c] !== 0) {
          const boardY = y + r;
          const boardX = x + c;
          if (boardY >= 0 && boardY < this.config.rows && boardX >= 0 && boardX < this.config.cols) {
            const boardRow = this.board[boardY];
            if (boardRow) {
              boardRow[boardX] = color;
            }
          }
        }
      }
    }

    this.clearCompletedLines();
    this.spawnPiece();
  }

  private clearCompletedLines(): void {
    let completedCount = 0;
    const newBoard: (string | null)[][] = [];

    for (let r = 0; r < this.config.rows; r += 1) {
      const row = this.board[r];
      if (row && row.every((cell) => cell !== null)) {
        completedCount += 1;
      } else if (row) {
        newBoard.push(row);
      }
    }

    if (completedCount > 0) {
      if (completedCount === 4) {
        this.onSoundEvent?.('tetris');
      } else {
        this.onSoundEvent?.('line');
      }

      // Rellenar filas vacías en la parte superior
      while (newBoard.length < this.config.rows) {
        newBoard.unshift(new Array<string | null>(this.config.cols).fill(null));
      }
      this.board = newBoard;

      // Cálculo de puntuación clásica (REQ-23)
      const basePoints = [0, 100, 300, 500, 800];
      const points = (basePoints[completedCount] ?? 100) * this.level;
      this.score += points;
      this.lines += completedCount;
      this.level = Math.floor(this.lines / 10) + 1;

      if (this.score > this.highScore) {
        this.highScore = this.score;
      }
    } else {
      this.onSoundEvent?.('lock');
    }
  }

  private spawnPiece(): void {
    const pieceDef = this.nextPiece;
    this.nextPiece = this.generateRandomPiece();

    const startX = Math.floor((this.config.cols - pieceDef.matrix[0]!.length) / 2);
    const startY = 0;

    // Verificar si hay colisión inmediata (Game Over) (REQ-22)
    if (this.checkCollision(startX, startY, pieceDef.matrix)) {
      this.status = 'GAME_OVER';
      this.currentPiece = null;
      this.onSoundEvent?.('game_over');
      return;
    }

    this.currentPiece = {
      type: pieceDef.type,
      color: pieceDef.color,
      matrix: pieceDef.matrix.map((r) => [...r]),
      x: startX,
      y: startY
    };
  }

  private generateRandomPiece(): Tetromino {
    const types: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    const randomIndex = Math.floor(Math.random() * types.length);
    const chosenType = types[randomIndex]!;
    const def = TETROMINO_DEFINITIONS[chosenType];
    return def;
  }

  private rotateMatrixClockwise(matrix: Matrix): Matrix {
    const size = matrix.length;
    const result: Matrix = Array.from({ length: size }, () => new Array<number>(size).fill(0));

    for (let r = 0; r < size; r += 1) {
      const sourceRow = matrix[r];
      if (!sourceRow) {
        continue;
      }
      for (let c = 0; c < size; c += 1) {
        const val = sourceRow[c];
        const destRow = result[c];
        if (destRow && val !== undefined) {
          destRow[size - 1 - r] = val;
        }
      }
    }

    return result;
  }

  private createEmptyBoard(): (string | null)[][] {
    const rows = Array.from({ length: this.config.rows }, () =>
      new Array<string | null>(this.config.cols).fill(null)
    );
    return rows;
  }
}
