// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Motor de lógica pura de Snake (cuadrícula, colisiones, comida, puntuación).
 * Desacoplado de cualquier API de renderizado o del DOM.
 * @spec REQ-08, REQ-09, REQ-11, REQ-12
 */

import type { Point, Direction, GameStatus, SnakeConfig, SnakeSnapshot } from '../types.js';

export const DEFAULT_SNAKE_CONFIG: SnakeConfig = {
  gridSize: 20,
  initialSpeedMs: 140,
  minSpeedMs: 70,
  speedDecrementMs: 5
};

export class SnakeEngine {
  private readonly config: SnakeConfig;
  private snake: Point[] = [];
  private food: Point = { x: 5, y: 5 };
  private currentDirection: Direction = 'RIGHT';
  private nextDirection: Direction = 'RIGHT';
  private lastProcessedDirection: Direction = 'RIGHT';
  private status: GameStatus = 'READY';
  private score: number = 0;
  private highScore: number = 0;
  private tickIntervalMs: number;

  constructor(customConfig?: Partial<SnakeConfig>, initialHighScore: number = 0) {
    this.config = {
      gridSize: customConfig?.gridSize ?? DEFAULT_SNAKE_CONFIG.gridSize,
      initialSpeedMs: customConfig?.initialSpeedMs ?? DEFAULT_SNAKE_CONFIG.initialSpeedMs,
      minSpeedMs: customConfig?.minSpeedMs ?? DEFAULT_SNAKE_CONFIG.minSpeedMs,
      speedDecrementMs: customConfig?.speedDecrementMs ?? DEFAULT_SNAKE_CONFIG.speedDecrementMs
    };
    this.highScore = Math.max(0, initialHighScore);
    this.tickIntervalMs = this.config.initialSpeedMs;
    this.reset();
  }

  /**
   * Reinicia la partida al estado inicial listo para comenzar.
   * @spec REQ-08, REQ-12
   */
  public reset(): void {
    const midY = Math.floor(this.config.gridSize / 2);
    const midX = Math.floor(this.config.gridSize / 2);

    this.snake = [
      { x: midX, y: midY },
      { x: midX - 1, y: midY },
      { x: midX - 2, y: midY }
    ];
    this.currentDirection = 'RIGHT';
    this.nextDirection = 'RIGHT';
    this.lastProcessedDirection = 'RIGHT';
    this.status = 'READY';
    this.score = 0;
    this.tickIntervalMs = this.config.initialSpeedMs;
    this.spawnFood();
  }

  /**
   * Inicia el juego.
   * @spec REQ-12
   */
  public start(): void {
    if (this.status === 'GAME_OVER') {
      this.reset();
    }
    this.status = 'PLAYING';
  }

  /**
   * Pausa o reanuda la partida.
   * @spec REQ-12
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
   * Intenta cambiar la dirección de movimiento evitando giros ilegales de 180°.
   * @spec REQ-11
   * @param dir Nueva dirección solicitada.
   * @returns true si el cambio es válido, false si es un giro opuesto ilegal.
   */
  public setDirection(dir: Direction): boolean {
    if (this.isOppositeDirection(dir, this.lastProcessedDirection)) {
      return false;
    }
    this.nextDirection = dir;
    return true;
  }

  /**
   * Ejecuta un paso o tick de simulación lógica.
   * @spec REQ-08, REQ-09, REQ-12
   * @returns Instantánea inmutable del estado tras el tick.
   */
  public tick(): SnakeSnapshot {
    if (this.status !== 'PLAYING') {
      return this.getSnapshot();
    }

    this.currentDirection = this.nextDirection;
    this.lastProcessedDirection = this.currentDirection;

    const head = this.snake[0];
    if (!head) {
      this.status = 'GAME_OVER';
      return this.getSnapshot();
    }

    const nextHead = this.computeNextPosition(head, this.currentDirection);

    // Detección de colisión contra muros (REQ-09)
    if (this.isOutOfBounds(nextHead)) {
      this.status = 'GAME_OVER';
      return this.getSnapshot();
    }

    // Detección de autocolisión contra el cuerpo (REQ-09)
    if (this.isSnakeBody(nextHead)) {
      this.status = 'GAME_OVER';
      return this.getSnapshot();
    }

    // Comprobar si come la comida
    const eatsFood = nextHead.x === this.food.x && nextHead.y === this.food.y;

    this.snake.unshift(nextHead);

    if (eatsFood) {
      this.score += 10;
      if (this.score > this.highScore) {
        this.highScore = this.score;
      }
      this.updateSpeed();
      this.spawnFood();
    } else {
      this.snake.pop();
    }

    const snapshot = this.getSnapshot();
    return snapshot;
  }

  /**
   * Retorna una instantánea inmutable del estado del juego.
   * @spec REQ-08, REQ-12
   */
  public getSnapshot(): SnakeSnapshot {
    const snapshot: SnakeSnapshot = {
      snake: [...this.snake],
      food: { ...this.food },
      direction: this.currentDirection,
      status: this.status,
      score: this.score,
      highScore: this.highScore,
      gridSize: this.config.gridSize
    };
    return snapshot;
  }

  public getTickIntervalMs(): number {
    const interval = this.tickIntervalMs;
    return interval;
  }

  public getStatus(): GameStatus {
    const s = this.status;
    return s;
  }

  private computeNextPosition(from: Point, dir: Direction): Point {
    let nextX = from.x;
    let nextY = from.y;

    if (dir === 'UP') {
      nextY -= 1;
    } else if (dir === 'DOWN') {
      nextY += 1;
    } else if (dir === 'LEFT') {
      nextX -= 1;
    } else if (dir === 'RIGHT') {
      nextX += 1;
    }

    const point: Point = { x: nextX, y: nextY };
    return point;
  }

  private isOutOfBounds(p: Point): boolean {
    const out = p.x < 0 || p.x >= this.config.gridSize || p.y < 0 || p.y >= this.config.gridSize;
    return out;
  }

  private isSnakeBody(p: Point): boolean {
    const hit = this.snake.some((seg) => seg.x === p.x && seg.y === p.y);
    return hit;
  }

  private isOppositeDirection(a: Direction, b: Direction): boolean {
    const opposite =
      (a === 'UP' && b === 'DOWN') ||
      (a === 'DOWN' && b === 'UP') ||
      (a === 'LEFT' && b === 'RIGHT') ||
      (a === 'RIGHT' && b === 'LEFT');
    return opposite;
  }

  private spawnFood(): void {
    const availableCells: Point[] = [];
    for (let x = 0; x < this.config.gridSize; x += 1) {
      for (let y = 0; y < this.config.gridSize; y += 1) {
        if (!this.snake.some((s) => s.x === x && s.y === y)) {
          availableCells.push({ x, y });
        }
      }
    }

    if (availableCells.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableCells.length);
    const chosen = availableCells[randomIndex];
    if (chosen) {
      this.food = chosen;
    }
  }

  private updateSpeed(): void {
    const decrement = Math.floor(this.score / 30) * this.config.speedDecrementMs;
    const newSpeed = Math.max(this.config.minSpeedMs, this.config.initialSpeedMs - decrement);
    this.tickIntervalMs = newSpeed;
  }
}
