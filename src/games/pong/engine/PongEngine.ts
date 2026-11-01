// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Motor de física pura y cinemática 2D de Pong (palas, bola, IA, rebotes y tanteo).
 * Desacoplado de cualquier API de renderizado o del DOM.
 * @spec REQ-15, REQ-16, REQ-17
 */

import type { Paddle, Ball, PongConfig, PongSnapshot, PongGameStatus } from '../types.js';

export type PongDifficulty = 'easy' | 'normal' | 'hard';

export const DEFAULT_PONG_CONFIG: PongConfig = {
  courtWidth: 800,
  courtHeight: 500,
  paddleWidth: 16,
  paddleHeight: 90,
  paddleSpeed: 420,
  ballRadius: 8,
  initialBallSpeed: 380,
  maxBallSpeed: 650,
  speedIncrement: 20,
  winningScore: 5,
  aiSpeed: 320
};

export class PongEngine {
  public onSoundEvent?: (event: 'bounce' | 'paddle' | 'score') => void;
  private readonly config: PongConfig;
  private playerPaddle: Paddle;
  private aiPaddle: Paddle;
  private ball: Ball;
  private playerScore: number = 0;
  private aiScore: number = 0;
  private status: PongGameStatus = 'READY';
  private winner: 'PLAYER' | 'AI' | null = null;
  private serveDirection: number = 1;
  private difficulty: PongDifficulty = 'normal';

  constructor(customConfig?: Partial<PongConfig>, initialDifficulty: PongDifficulty = 'normal') {
    this.config = {
      courtWidth: customConfig?.courtWidth ?? DEFAULT_PONG_CONFIG.courtWidth,
      courtHeight: customConfig?.courtHeight ?? DEFAULT_PONG_CONFIG.courtHeight,
      paddleWidth: customConfig?.paddleWidth ?? DEFAULT_PONG_CONFIG.paddleWidth,
      paddleHeight: customConfig?.paddleHeight ?? DEFAULT_PONG_CONFIG.paddleHeight,
      paddleSpeed: customConfig?.paddleSpeed ?? DEFAULT_PONG_CONFIG.paddleSpeed,
      ballRadius: customConfig?.ballRadius ?? DEFAULT_PONG_CONFIG.ballRadius,
      initialBallSpeed: customConfig?.initialBallSpeed ?? DEFAULT_PONG_CONFIG.initialBallSpeed,
      maxBallSpeed: customConfig?.maxBallSpeed ?? DEFAULT_PONG_CONFIG.maxBallSpeed,
      speedIncrement: customConfig?.speedIncrement ?? DEFAULT_PONG_CONFIG.speedIncrement,
      winningScore: customConfig?.winningScore ?? DEFAULT_PONG_CONFIG.winningScore,
      aiSpeed: customConfig?.aiSpeed ?? DEFAULT_PONG_CONFIG.aiSpeed
    };

    const initialPaddleY = (this.config.courtHeight - this.config.paddleHeight) / 2;

    this.playerPaddle = {
      x: 30,
      y: initialPaddleY,
      width: this.config.paddleWidth,
      height: this.config.paddleHeight,
      dy: 0
    };

    this.aiPaddle = {
      x: this.config.courtWidth - 30 - this.config.paddleWidth,
      y: initialPaddleY,
      width: this.config.paddleWidth,
      height: this.config.paddleHeight,
      dy: 0
    };

    this.ball = {
      x: this.config.courtWidth / 2,
      y: this.config.courtHeight / 2,
      radius: this.config.ballRadius,
      vx: 0,
      vy: 0,
      speed: this.config.initialBallSpeed
    };

    this.setDifficulty(initialDifficulty);
    this.reset();
  }

  /**
   * Modifica la dificultad del juego modulando la velocidad de la bola y agilidad de la IA.
   * @spec REQ-42
   */
  public setDifficulty(diff: PongDifficulty): void {
    this.difficulty = diff;
    if (diff === 'easy') {
      this.config.initialBallSpeed = 260;
      this.config.aiSpeed = 220;
      this.config.maxBallSpeed = 450;
    } else if (diff === 'hard') {
      this.config.initialBallSpeed = 500;
      this.config.aiSpeed = 440;
      this.config.maxBallSpeed = 800;
    } else {
      this.config.initialBallSpeed = 380;
      this.config.aiSpeed = 320;
      this.config.maxBallSpeed = 650;
    }
  }

  /**
   * Retorna la dificultad actual.
   * @spec REQ-42
   */
  public getDifficulty(): PongDifficulty {
    const d = this.difficulty;
    return d;
  }

  /**
   * Retorna la configuración inmutable del motor.
   * @spec REQ-15, REQ-42
   */
  public getConfig(): Readonly<PongConfig> {
    const cfg = { ...this.config };
    return cfg;
  }

  /**
   * Reinicia la partida al estado inicial con puntuaciones en 0.
   * @spec REQ-17
   */
  public reset(): void {
    this.playerScore = 0;
    this.aiScore = 0;
    this.status = 'READY';
    this.winner = null;
    this.serveDirection = Math.random() > 0.5 ? 1 : -1;

    const initialPaddleY = (this.config.courtHeight - this.config.paddleHeight) / 2;
    this.playerPaddle.y = initialPaddleY;
    this.playerPaddle.dy = 0;
    this.aiPaddle.y = initialPaddleY;
    this.aiPaddle.dy = 0;

    this.resetBall();
  }

  /**
   * Inicia el juego o reanuda tras un tanto.
   * @spec REQ-17
   */
  public start(): void {
    if (this.status === 'GAME_OVER') {
      this.reset();
    }
    this.status = 'PLAYING';
    if (this.ball.vx === 0 && this.ball.vy === 0) {
      this.launchBall(this.serveDirection);
    }
  }

  /**
   * Pausa o reanuda la partida.
   * @spec REQ-17
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
   * Establece la dirección de movimiento vertical del jugador por teclado.
   * @spec REQ-19
   * @param dy -1 (arriba), 1 (abajo) o 0 (quieto).
   */
  public setPlayerMove(dy: number): void {
    this.playerPaddle.dy = Math.max(-1, Math.min(1, dy));
  }

  /**
   * Posiciona directamente la pala del jugador mediante ratón o toque.
   * @spec REQ-19
   * @param targetY Posición Y central deseada para la pala.
   */
  public setPlayerCenterY(targetY: number): void {
    const newY = targetY - this.playerPaddle.height / 2;
    this.playerPaddle.y = Math.max(0, Math.min(this.config.courtHeight - this.playerPaddle.height, newY));
  }

  /**
   * Configura directamente la bola para pruebas deterministas.
   * @spec REQ-15
   */
  public setBallForTesting(x: number, y: number, vx: number, vy: number): void {
    this.ball.x = x;
    this.ball.y = y;
    this.ball.vx = vx;
    this.ball.vy = vy;
    this.ball.speed = Math.sqrt(vx * vx + vy * vy);
  }

  /**
   * Ejecuta un paso temporal continuo de simulación física.
   * @spec REQ-15, REQ-16, REQ-17
   * @param dt Delta time en segundos.
   * @returns Instantánea inmutable del estado del juego.
   */
  public tick(dt: number): PongSnapshot {
    if (this.status !== 'PLAYING') {
      return this.getSnapshot();
    }

    const safeDt = Math.min(dt, 0.05);

    // 1. Mover pala del jugador (por teclado si dy != 0)
    if (this.playerPaddle.dy !== 0) {
      this.playerPaddle.y += this.playerPaddle.dy * this.config.paddleSpeed * safeDt;
      this.playerPaddle.y = Math.max(0, Math.min(this.config.courtHeight - this.playerPaddle.height, this.playerPaddle.y));
    }

    // 2. IA del rival (REQ-16)
    this.updateAI(safeDt);

    // 3. Mover bola (REQ-15)
    this.ball.x += this.ball.vx * safeDt;
    this.ball.y += this.ball.vy * safeDt;

    // 4. Rebote especular en límites superior e inferior (REQ-15)
    if (this.ball.y - this.ball.radius <= 0) {
      this.ball.y = this.ball.radius;
      this.ball.vy = Math.abs(this.ball.vy);
      this.onSoundEvent?.('bounce');
    } else if (this.ball.y + this.ball.radius >= this.config.courtHeight) {
      this.ball.y = this.config.courtHeight - this.ball.radius;
      this.ball.vy = -Math.abs(this.ball.vy);
      this.onSoundEvent?.('bounce');
    }

    // 5. Rebote con pala del jugador (Izquierda) (REQ-15)
    this.checkPaddleCollision(this.playerPaddle, true);

    // 6. Rebote con pala del rival IA (Derecha) (REQ-15)
    this.checkPaddleCollision(this.aiPaddle, false);

    // 7. Detección de tantos y fin de partida (REQ-17)
    this.checkGoals();

    const snapshot = this.getSnapshot();
    return snapshot;
  }

  /**
   * Retorna una instantánea inmutable del estado del juego.
   */
  public getSnapshot(): PongSnapshot {
    const snapshot: PongSnapshot = {
      playerPaddle: { ...this.playerPaddle },
      aiPaddle: { ...this.aiPaddle },
      ball: { ...this.ball },
      playerScore: this.playerScore,
      aiScore: this.aiScore,
      status: this.status,
      winner: this.winner,
      courtWidth: this.config.courtWidth,
      courtHeight: this.config.courtHeight
    };
    return snapshot;
  }

  public getStatus(): PongGameStatus {
    const s = this.status;
    return s;
  }

  private updateAI(dt: number): void {
    const aiCenter = this.aiPaddle.y + this.aiPaddle.height / 2;

    // La IA reacciona principalmente cuando la bola viaja hacia su campo
    if (this.ball.vx > 0) {
      const diff = this.ball.y - aiCenter;
      // Zona muerta para evitar oscilación nerviosa
      if (Math.abs(diff) > 12) {
        const dir = diff > 0 ? 1 : -1;
        this.aiPaddle.y += dir * this.config.aiSpeed * dt;
      }
    } else {
      // Regreso pausado al centro de la pista cuando la bola se aleja
      const courtCenter = this.config.courtHeight / 2;
      const diff = courtCenter - aiCenter;
      if (Math.abs(diff) > 20) {
        const dir = diff > 0 ? 1 : -1;
        this.aiPaddle.y += dir * (this.config.aiSpeed * 0.4) * dt;
      }
    }

    this.aiPaddle.y = Math.max(0, Math.min(this.config.courtHeight - this.aiPaddle.height, this.aiPaddle.y));
  }

  private checkPaddleCollision(paddle: Paddle, isPlayer: boolean): void {
    const ballLeft = this.ball.x - this.ball.radius;
    const ballRight = this.ball.x + this.ball.radius;
    const ballTop = this.ball.y - this.ball.radius;
    const ballBottom = this.ball.y + this.ball.radius;

    const paddleLeft = paddle.x;
    const paddleRight = paddle.x + paddle.width;
    const paddleTop = paddle.y;
    const paddleBottom = paddle.y + paddle.height;

    const overlapsX = ballRight >= paddleLeft && ballLeft <= paddleRight;
    const overlapsY = ballBottom >= paddleTop && ballTop <= paddleBottom;

    if (!overlapsX || !overlapsY) {
      return;
    }

    // Comprobar dirección para evitar doble impacto si la bola está saliendo
    if (isPlayer && this.ball.vx >= 0) {
      return;
    }
    if (!isPlayer && this.ball.vx <= 0) {
      return;
    }

    // Reposicionamiento de seguridad para prevenir efecto túnel
    if (isPlayer) {
      this.ball.x = paddleRight + this.ball.radius;
    } else {
      this.ball.x = paddleLeft - this.ball.radius;
    }
    this.onSoundEvent?.('paddle');

    // Calcular ángulo dinámico de rebote (-60° a +60°) según punto de impacto en la pala
    const paddleCenterY = paddle.y + paddle.height / 2;
    const normalizedImpact = (this.ball.y - paddleCenterY) / (paddle.height / 2);
    const clampedImpact = Math.max(-1, Math.min(1, normalizedImpact));
    const bounceAngle = clampedImpact * (Math.PI / 3);

    // Incrementar velocidad de bola progresivamente por intercambio de rally
    this.ball.speed = Math.min(this.config.maxBallSpeed, this.ball.speed + this.config.speedIncrement);

    const dirX = isPlayer ? 1 : -1;
    this.ball.vx = dirX * this.ball.speed * Math.cos(bounceAngle);
    this.ball.vy = this.ball.speed * Math.sin(bounceAngle);
  }

  private checkGoals(): void {
    // Tanto del Rival (bola rebasa al jugador)
    if (this.ball.x + this.ball.radius < 0) {
      this.aiScore += 1;
      this.onSoundEvent?.('score');
      if (this.aiScore >= this.config.winningScore) {
        this.status = 'GAME_OVER';
        this.winner = 'AI';
      } else {
        this.serveDirection = 1; // Saque hacia el jugador
        this.resetBall();
        this.launchBall(this.serveDirection);
      }
      return;
    }

    // Tanto del Jugador (bola rebasa al rival)
    if (this.ball.x - this.ball.radius > this.config.courtWidth) {
      this.playerScore += 1;
      this.onSoundEvent?.('score');
      if (this.playerScore >= this.config.winningScore) {
        this.status = 'GAME_OVER';
        this.winner = 'PLAYER';
      } else {
        this.serveDirection = -1; // Saque hacia el rival
        this.resetBall();
        this.launchBall(this.serveDirection);
      }
      return;
    }
  }

  private resetBall(): void {
    this.ball.x = this.config.courtWidth / 2;
    this.ball.y = this.config.courtHeight / 2;
    this.ball.speed = this.config.initialBallSpeed;
    this.ball.vx = 0;
    this.ball.vy = 0;
  }

  private launchBall(direction: number): void {
    // Ángulo aleatorio leve entre -25° y +25°
    const angle = (Math.random() * 0.8 - 0.4);
    this.ball.speed = this.config.initialBallSpeed;
    this.ball.vx = direction * this.ball.speed * Math.cos(angle);
    this.ball.vy = this.ball.speed * Math.sin(angle);
  }
}
