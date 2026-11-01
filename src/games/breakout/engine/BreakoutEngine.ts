// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Motor de física pura y lógica para Breakout (destructor de bloques).
 * Desacoplado del DOM y de APIs de renderizado.
 * @spec REQ-29, REQ-30, REQ-31, REQ-32
 */

import type {
  Brick,
  Paddle,
  Ball,
  BreakoutConfig,
  BreakoutSnapshot,
  BreakoutGameStatus
} from '../types.js';

export const DEFAULT_BREAKOUT_CONFIG: BreakoutConfig = {
  virtualWidth: 800,
  virtualHeight: 600,
  paddleWidth: 110,
  paddleHeight: 14,
  paddleSpeed: 9,
  ballRadius: 7,
  initialBallSpeed: 6,
  maxBallSpeed: 12,
  initialLives: 3,
  brickRows: 5,
  brickCols: 10,
  brickPadding: 8,
  brickOffsetTop: 65,
  brickOffsetLeft: 35,
  brickHeight: 22
};

const ROW_COLORS = [
  { color: '#ff0055', points: 50 }, // Fila 0 (rojo neón)
  { color: '#ff9f1c', points: 40 }, // Fila 1 (ámbar)
  { color: '#ffe600', points: 30 }, // Fila 2 (amarillo)
  { color: '#00d9c4', points: 20 }, // Fila 3 (turquesa)
  { color: '#00f59b', points: 10 }  // Fila 4 (verde aguacate)
];

export class BreakoutEngine {
  private readonly config: BreakoutConfig;
  private paddle!: Paddle;
  private ball!: Ball;
  private bricks: Brick[] = [];
  private score: number = 0;
  private lives: number = 3;
  private highScore: number = 0;
  private status: BreakoutGameStatus = 'READY';

  constructor(customConfig?: Partial<BreakoutConfig>, initialHighScore: number = 0) {
    this.config = {
      virtualWidth: customConfig?.virtualWidth ?? DEFAULT_BREAKOUT_CONFIG.virtualWidth,
      virtualHeight: customConfig?.virtualHeight ?? DEFAULT_BREAKOUT_CONFIG.virtualHeight,
      paddleWidth: customConfig?.paddleWidth ?? DEFAULT_BREAKOUT_CONFIG.paddleWidth,
      paddleHeight: customConfig?.paddleHeight ?? DEFAULT_BREAKOUT_CONFIG.paddleHeight,
      paddleSpeed: customConfig?.paddleSpeed ?? DEFAULT_BREAKOUT_CONFIG.paddleSpeed,
      ballRadius: customConfig?.ballRadius ?? DEFAULT_BREAKOUT_CONFIG.ballRadius,
      initialBallSpeed: customConfig?.initialBallSpeed ?? DEFAULT_BREAKOUT_CONFIG.initialBallSpeed,
      maxBallSpeed: customConfig?.maxBallSpeed ?? DEFAULT_BREAKOUT_CONFIG.maxBallSpeed,
      initialLives: customConfig?.initialLives ?? DEFAULT_BREAKOUT_CONFIG.initialLives,
      brickRows: customConfig?.brickRows ?? DEFAULT_BREAKOUT_CONFIG.brickRows,
      brickCols: customConfig?.brickCols ?? DEFAULT_BREAKOUT_CONFIG.brickCols,
      brickPadding: customConfig?.brickPadding ?? DEFAULT_BREAKOUT_CONFIG.brickPadding,
      brickOffsetTop: customConfig?.brickOffsetTop ?? DEFAULT_BREAKOUT_CONFIG.brickOffsetTop,
      brickOffsetLeft: customConfig?.brickOffsetLeft ?? DEFAULT_BREAKOUT_CONFIG.brickOffsetLeft,
      brickHeight: customConfig?.brickHeight ?? DEFAULT_BREAKOUT_CONFIG.brickHeight
    };
    this.highScore = Math.max(0, initialHighScore);
    this.reset();
  }

  /**
   * Reinicia la partida con ladrillos completos y vidas iniciales.
   * @spec REQ-29, REQ-32
   */
  public reset(): void {
    this.score = 0;
    this.lives = this.config.initialLives;
    this.status = 'READY';
    this.initPaddle();
    this.initBall();
    this.initBricks();
  }

  /**
   * Inicia el juego pasando a estado PLAYING.
   * @spec REQ-29
   */
  public start(): void {
    if (this.status === 'GAME_OVER' || this.status === 'VICTORY') {
      this.reset();
    }
    this.status = 'PLAYING';
  }

  /**
   * Pausa o reanuda la partida.
   * @spec REQ-29
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
   * Posiciona la paleta horizontalmente centrada en una coordenada X dada (ej. ratón o táctil).
   * @spec REQ-29, REQ-33
   */
  public setPaddlePosition(centerX: number): void {
    const halfWidth = this.paddle.width / 2;
    let newX = centerX - halfWidth;
    newX = Math.max(0, Math.min(this.config.virtualWidth - this.paddle.width, newX));
    this.paddle.x = newX;

    if (this.status === 'READY') {
      this.ball.x = this.paddle.x + halfWidth;
    }
  }

  /**
   * Mueve la paleta hacia la izquierda según su velocidad.
   * @spec REQ-29, REQ-33
   */
  public movePaddleLeft(): void {
    this.paddle.x = Math.max(0, this.paddle.x - this.paddle.speed);
    if (this.status === 'READY') {
      this.ball.x = this.paddle.x + this.paddle.width / 2;
    }
  }

  /**
   * Mueve la paleta hacia la derecha según su velocidad.
   * @spec REQ-29, REQ-33
   */
  public movePaddleRight(): void {
    this.paddle.x = Math.min(
      this.config.virtualWidth - this.paddle.width,
      this.paddle.x + this.paddle.speed
    );
    if (this.status === 'READY') {
      this.ball.x = this.paddle.x + this.paddle.width / 2;
    }
  }

  /**
   * Avanza la física de la partida un paso temporal.
   * @spec REQ-29, REQ-30, REQ-31, REQ-32
   */
  public tick(): BreakoutSnapshot {
    if (this.status !== 'PLAYING') {
      const snap = this.getSnapshot();
      return snap;
    }

    // Actualizar posición de la bola
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;

    // Colisión con paredes laterales
    this.handleWallCollisions();

    // Colisión con la paleta inferior
    this.handlePaddleCollision();

    // Colisión con los ladrillos
    this.handleBrickCollisions();

    // Comprobar caída al vacío inferior
    this.handleBottomFall();

    const snapshot = this.getSnapshot();
    return snapshot;
  }

  /**
   * Retorna una instantánea inmutable del estado del juego.
   * @spec REQ-29, REQ-32
   */
  public getSnapshot(): BreakoutSnapshot {
    const remainingBricks = this.bricks.filter((b) => b.hitsLeft > 0).length;
    const snapshot: BreakoutSnapshot = {
      paddle: { ...this.paddle },
      ball: { ...this.ball },
      bricks: this.bricks.map((b) => ({ ...b })),
      score: this.score,
      lives: this.lives,
      highScore: this.highScore,
      status: this.status,
      totalBricks: this.bricks.length,
      remainingBricks
    };
    return snapshot;
  }

  public getStatus(): BreakoutGameStatus {
    const s = this.status;
    return s;
  }

  /**
   * Métodos auxiliares para tests unitarios deterministas.
   * @spec REQ-29, REQ-30, REQ-31, REQ-32
   */
  public setBallForTesting(x: number, y: number, vx: number, vy: number, speed?: number): void {
    this.ball.x = x;
    this.ball.y = y;
    this.ball.vx = vx;
    this.ball.vy = vy;
    if (speed !== undefined) {
      this.ball.speed = speed;
    }
  }

  public setPaddleForTesting(x: number, y: number): void {
    this.paddle.x = x;
    this.paddle.y = y;
  }

  public setBricksForTesting(bricks: Brick[]): void {
    this.bricks = bricks.map((b) => ({ ...b }));
  }

  public setLivesForTesting(lives: number): void {
    this.lives = lives;
  }

  public setScoreForTesting(score: number): void {
    this.score = score;
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  private initPaddle(): void {
    const x = (this.config.virtualWidth - this.config.paddleWidth) / 2;
    const y = this.config.virtualHeight - 45;
    this.paddle = {
      x,
      y,
      width: this.config.paddleWidth,
      height: this.config.paddleHeight,
      speed: this.config.paddleSpeed
    };
  }

  private initBall(): void {
    const speed = this.config.initialBallSpeed;
    const angle = -Math.PI / 4; // 45 grados hacia arriba y a la derecha
    this.ball = {
      x: this.paddle.x + this.paddle.width / 2,
      y: this.paddle.y - this.config.ballRadius - 2,
      radius: this.config.ballRadius,
      vx: speed * Math.cos(angle),
      vy: speed * Math.sin(angle),
      speed
    };
  }

  private initBricks(): void {
    this.bricks = [];
    const availableWidth = this.config.virtualWidth - this.config.brickOffsetLeft * 2;
    const totalPadding = this.config.brickPadding * (this.config.brickCols - 1);
    const brickWidth = Math.floor((availableWidth - totalPadding) / this.config.brickCols);

    for (let r = 0; r < this.config.brickRows; r += 1) {
      const rowCfg = ROW_COLORS[r % ROW_COLORS.length]!;
      for (let c = 0; c < this.config.brickCols; c += 1) {
        const x = this.config.brickOffsetLeft + c * (brickWidth + this.config.brickPadding);
        const y = this.config.brickOffsetTop + r * (this.config.brickHeight + this.config.brickPadding);

        this.bricks.push({
          id: `brick_${r}_${c}`,
          x,
          y,
          width: brickWidth,
          height: this.config.brickHeight,
          color: rowCfg.color,
          points: rowCfg.points,
          hitsLeft: 1
        });
      }
    }
  }

  private handleWallCollisions(): void {
    const { radius } = this.ball;

    // Pared izquierda
    if (this.ball.x - radius <= 0) {
      this.ball.x = radius;
      this.ball.vx = Math.abs(this.ball.vx);
    }

    // Pared derecha
    if (this.ball.x + radius >= this.config.virtualWidth) {
      this.ball.x = this.config.virtualWidth - radius;
      this.ball.vx = -Math.abs(this.ball.vx);
    }

    // Techo
    if (this.ball.y - radius <= 0) {
      this.ball.y = radius;
      this.ball.vy = Math.abs(this.ball.vy);
    }
  }

  private handlePaddleCollision(): void {
    if (this.ball.vy <= 0) {
      return;
    }

    const { x: bx, y: by, radius: br } = this.ball;
    const { x: px, y: py, width: pw, height: ph } = this.paddle;

    // Comprobar solapamiento AABB con la paleta
    const overlaps =
      bx + br >= px &&
      bx - br <= px + pw &&
      by + br >= py &&
      by - br <= py + ph;

    if (!overlaps) {
      return;
    }

    // Rebote angular dinámico (REQ-30)
    const paddleCenter = px + pw / 2;
    const relativeIntersect = (bx - paddleCenter) / (pw / 2);
    const clampedIntersect = Math.max(-1, Math.min(1, relativeIntersect));

    // Ángulo de rebote máximo: 60 grados (PI / 3)
    const maxBounceAngle = Math.PI / 3;
    const bounceAngle = clampedIntersect * maxBounceAngle;

    // Aumentar velocidad gradualmente tras cada golpe
    this.ball.speed = Math.min(this.config.maxBallSpeed, this.ball.speed + 0.15);
    this.ball.vx = this.ball.speed * Math.sin(bounceAngle);
    this.ball.vy = -this.ball.speed * Math.cos(bounceAngle);

    // Reposicionar bola justo encima de la pala
    this.ball.y = py - br;
  }

  private handleBrickCollisions(): void {
    const { radius } = this.ball;

    for (const brick of this.bricks) {
      if (brick.hitsLeft <= 0) {
        continue;
      }

      // Encontrar el punto más cercano en el rectángulo del ladrillo a la bola
      const closestX = Math.max(brick.x, Math.min(this.ball.x, brick.x + brick.width));
      const closestY = Math.max(brick.y, Math.min(this.ball.y, brick.y + brick.height));

      const distX = this.ball.x - closestX;
      const distY = this.ball.y - closestY;
      const distSq = distX * distX + distY * distY;

      if (distSq < radius * radius) {
        // Colisión confirmada
        brick.hitsLeft -= 1;
        this.score += brick.points;

        if (this.score > this.highScore) {
          this.highScore = this.score;
        }

        // Determinar eje de reflexión (REQ-31)
        const overlapX = (radius + brick.width / 2) - Math.abs(this.ball.x - (brick.x + brick.width / 2));
        const overlapY = (radius + brick.height / 2) - Math.abs(this.ball.y - (brick.y + brick.height / 2));

        if (overlapX < overlapY) {
          // Rebote horizontal
          this.ball.vx = -this.ball.vx;
          if (this.ball.x > brick.x + brick.width / 2) {
            this.ball.x = brick.x + brick.width + radius;
          } else {
            this.ball.x = brick.x - radius;
          }
        } else {
          // Rebote vertical
          this.ball.vy = -this.ball.vy;
          if (this.ball.y > brick.y + brick.height / 2) {
            this.ball.y = brick.y + brick.height + radius;
          } else {
            this.ball.y = brick.y - radius;
          }
        }

        // Aceleración de la bola por impacto con ladrillo
        this.ball.speed = Math.min(this.config.maxBallSpeed, this.ball.speed + 0.05);

        // Comprobar condición de victoria (REQ-32)
        const remaining = this.bricks.some((b) => b.hitsLeft > 0);
        if (!remaining) {
          this.status = 'VICTORY';
        }

        // Romper solo un ladrillo por frame para evitar colisiones múltiples fantasma
        break;
      }
    }
  }

  private handleBottomFall(): void {
    if (this.ball.y - this.ball.radius >= this.config.virtualHeight) {
      this.lives -= 1;
      if (this.lives <= 0) {
        this.lives = 0;
        this.status = 'GAME_OVER';
      } else {
        // Reposicionar bola y paleta para la siguiente vida
        this.initPaddle();
        this.initBall();
        this.status = 'READY';
      }
    }
  }
}
