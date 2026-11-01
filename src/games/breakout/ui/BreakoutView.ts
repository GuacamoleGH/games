// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Vista y renderizado en Canvas HTML5 para Breakout (destructor de bloques).
 * @spec REQ-32, REQ-33, REQ-41, REQ-42
 */

import { BreakoutEngine, type BreakoutDifficulty } from '../engine/BreakoutEngine.js';
import type { BreakoutSnapshot } from '../types.js';
import { soundManager } from '../../../common/audio/SoundEffects.js';

const HIGH_SCORE_KEY = 'guacamolegh_breakout_highscore';
const DIFFICULTY_STORAGE_KEY = 'guacamolegh_breakout_diff';

export class BreakoutView {
  private container: HTMLElement;
  private engine: BreakoutEngine;
  private onBack: () => void;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  private scoreEl!: HTMLElement;
  private livesEl!: HTMLElement;
  private bricksEl!: HTMLElement;
  private highScoreEl!: HTMLElement;
  private overlayEl!: HTMLElement;
  private diffBtn!: HTMLButtonElement;

  private animationFrameId: number | null = null;
  private isDestroyed: boolean = false;
  private lastFrameTime: number = 0;
  private timeAccumulator: number = 0;
  private readonly TICK_DURATION_MS: number = 1000 / 60; // 16.666 ms (60 Hz fijo)

  private isKeyLeftPressed: boolean = false;
  private isKeyRightPressed: boolean = false;

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private boundMouseMove: (e: MouseEvent) => void;
  private boundCanvasClick: () => void;
  private boundTouchMove: (e: TouchEvent) => void;

  constructor(container: HTMLElement, onBack: () => void) {
    this.container = container;
    this.onBack = onBack;

    const savedHighScore = this.loadHighScore();
    const savedDiff = this.loadDifficulty();
    this.engine = new BreakoutEngine(undefined, savedHighScore, savedDiff);
    this.engine.onSoundEvent = (event) => {
      if (event === 'bounce' || event === 'brick') {
        soundManager.play('bounce');
      } else if (event === 'paddle') {
        soundManager.play('paddle');
      } else if (event === 'life_loss') {
        soundManager.play('die');
      } else if (event === 'game_over') {
        soundManager.play('lose');
      } else if (event === 'victory') {
        soundManager.play('win');
      }
    };

    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundCanvasClick = this.handleCanvasClick.bind(this);
    this.boundTouchMove = this.handleTouchMove.bind(this);
  }

  /**
   * Monta la interfaz del juego Breakout en el contenedor.
   * @spec REQ-33
   */
  public mount(): void {
    this.container.innerHTML = this.getTemplateHtml();

    this.canvas = this.container.querySelector('#breakout-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    this.scoreEl = this.container.querySelector('#breakout-score') as HTMLElement;
    this.livesEl = this.container.querySelector('#breakout-lives') as HTMLElement;
    this.bricksEl = this.container.querySelector('#breakout-bricks') as HTMLElement;
    this.highScoreEl = this.container.querySelector('#breakout-highscore') as HTMLElement;
    this.overlayEl = this.container.querySelector('#breakout-overlay') as HTMLElement;
    this.diffBtn = this.container.querySelector('#breakout-diff-btn') as HTMLButtonElement;

    this.bindEvents();
    this.updateDiffButtonLabel();
    this.updateHud(this.engine.getSnapshot());
    this.showReadyOverlay();

    // Iniciar bucle de animación
    this.startGameLoop();
  }

  /**
   * Desmonta y destruye la vista liberando recursos.
   * @spec REQ-28
   */
  public destroy(): void {
    this.isDestroyed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.boundMouseMove);
      this.canvas.removeEventListener('click', this.boundCanvasClick);
      this.canvas.removeEventListener('touchmove', this.boundTouchMove);
    }
    this.container.innerHTML = '';
  }

  private bindEvents(): void {
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    this.canvas.addEventListener('mousemove', this.boundMouseMove);
    this.canvas.addEventListener('click', this.boundCanvasClick);
    this.canvas.addEventListener('touchmove', this.boundTouchMove, { passive: false });

    // Botón volver al catálogo
    const backBtn = this.container.querySelector('#breakout-back-btn');
    backBtn?.addEventListener('click', () => {
      this.onBack();
    });

    // Botón de dificultad en HUD
    this.diffBtn?.addEventListener('click', () => {
      soundManager.play('click');
      const current = this.engine.getDifficulty();
      const next: BreakoutDifficulty = current === 'easy' ? 'normal' : current === 'normal' ? 'hard' : 'easy';
      this.engine.setDifficulty(next);
      this.saveDifficulty(next);
      this.updateDiffButtonLabel();
    });

    // Botón de pausa
    const pauseBtn = this.container.querySelector('#breakout-pause-btn');
    pauseBtn?.addEventListener('click', () => {
      this.togglePause();
    });

    // Controles táctiles virtuales
    const touchLeft = this.container.querySelector('#breakout-touch-left');
    const touchRight = this.container.querySelector('#breakout-touch-right');
    const touchLaunch = this.container.querySelector('#breakout-touch-launch');

    touchLeft?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.isKeyLeftPressed = true;
    });
    touchLeft?.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.isKeyLeftPressed = false;
    });

    touchRight?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.isKeyRightPressed = true;
    });
    touchRight?.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.isKeyRightPressed = false;
    });

    touchLaunch?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleActionClick();
    });
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      this.isKeyLeftPressed = true;
      e.preventDefault();
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      this.isKeyRightPressed = true;
      e.preventDefault();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      this.handleActionClick();
    } else if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      this.togglePause();
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      this.isKeyLeftPressed = false;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      this.isKeyRightPressed = false;
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const canvasMouseX = (e.clientX - rect.left) * scaleX;
    this.engine.setPaddlePosition(canvasMouseX);
  }

  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) {
      return;
    }
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const canvasTouchX = (touch.clientX - rect.left) * scaleX;
    this.engine.setPaddlePosition(canvasTouchX);
  }

  private handleCanvasClick(): void {
    if (this.engine.getStatus() === 'READY') {
      this.hideOverlay();
      this.engine.start();
    }
  }

  private handleActionClick(): void {
    soundManager.play('click');
    const status = this.engine.getStatus();
    if (status === 'READY') {
      this.hideOverlay();
      this.engine.start();
    } else if (status === 'GAME_OVER' || status === 'VICTORY') {
      this.hideOverlay();
      this.engine.start();
    } else if (status === 'PAUSED') {
      this.togglePause();
    }
  }

  private togglePause(): void {
    this.engine.togglePause();
    const status = this.engine.getStatus();
    if (status === 'PAUSED') {
      this.showPausedOverlay();
    } else if (status === 'PLAYING') {
      this.hideOverlay();
    }
  }

  private startGameLoop(): void {
    this.lastFrameTime = performance.now();
    this.timeAccumulator = 0;

    const loop = (currentTime: number): void => {
      if (this.isDestroyed) {
        return;
      }

      const elapsed = currentTime - this.lastFrameTime;
      this.lastFrameTime = currentTime;
      // Prevenir saltos temporales extremos si la pestaña pierde foco
      this.timeAccumulator += Math.min(elapsed, 100);

      while (this.timeAccumulator >= this.TICK_DURATION_MS) {
        // Procesar desplazamiento continuo por teclado
        if (this.isKeyLeftPressed) {
          this.engine.movePaddleLeft();
        }
        if (this.isKeyRightPressed) {
          this.engine.movePaddleRight();
        }

        this.engine.tick();
        this.timeAccumulator -= this.TICK_DURATION_MS;
      }

      const snapshot = this.engine.getSnapshot();
      this.render(snapshot);
      this.updateHud(snapshot);

      // Comprobar cambios de estado para superposiciones
      if (snapshot.status === 'GAME_OVER' && this.overlayEl.style.display !== 'flex') {
        this.showGameOverOverlay(snapshot.score);
        this.saveHighScore(snapshot.highScore);
      } else if (snapshot.status === 'VICTORY' && this.overlayEl.style.display !== 'flex') {
        this.showVictoryOverlay(snapshot.score);
        this.saveHighScore(snapshot.highScore);
      } else if (snapshot.status === 'READY' && this.overlayEl.style.display !== 'flex') {
        this.showLifeLostOverlay();
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  private render(snapshot: BreakoutSnapshot): void {
    const { ctx, canvas } = this;
    const { width, height } = canvas;

    // Fondo oscuro tecnológico
    ctx.fillStyle = '#0c0f14';
    ctx.fillRect(0, 0, width, height);

    // Cuadrícula sutil de fondo
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Renderizar ladrillos
    for (const brick of snapshot.bricks) {
      if (brick.hitsLeft <= 0) {
        continue;
      }

      ctx.fillStyle = brick.color;
      ctx.beginPath();
      ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 4);
      ctx.fill();

      // Biselado superior de brillo
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(brick.x + 2, brick.y + 2, brick.width - 4, 3);
    }

    // Renderizar paleta del jugador
    const { paddle } = snapshot;
    ctx.shadowColor = 'rgba(0, 245, 155, 0.5)';
    ctx.shadowBlur = 12;

    const grad = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x + paddle.width, paddle.y);
    grad.addColorStop(0, '#00d9c4');
    grad.addColorStop(0.5, '#00f59b');
    grad.addColorStop(1, '#00d9c4');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 6);
    ctx.fill();

    // Renderizar bola
    const { ball } = snapshot;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Limpiar efectos de sombra
    ctx.shadowBlur = 0;
  }

  private updateHud(snapshot: BreakoutSnapshot): void {
    if (this.scoreEl) {
      this.scoreEl.textContent = snapshot.score.toString();
    }
    if (this.livesEl) {
      const hearts = '❤️'.repeat(Math.max(0, snapshot.lives));
      this.livesEl.textContent = hearts || '0';
    }
    if (this.bricksEl) {
      this.bricksEl.textContent = `${snapshot.remainingBricks} / ${snapshot.totalBricks}`;
    }
    if (this.highScoreEl) {
      this.highScoreEl.textContent = snapshot.highScore.toString();
    }
  }

  private showReadyOverlay(): void {
    this.overlayEl.innerHTML = `
      <div class="overlay-content">
        <h2 class="overlay-title text-accent-green">BREAKOUT</h2>
        <p class="overlay-subtitle">Destruye todos los ladrillos controlando la paleta.</p>
        <button id="breakout-action-btn" class="btn-play-game" style="margin-top: 14px;">
          LANZAR BOLA [Espacio]
        </button>
      </div>
    `;
    this.overlayEl.style.display = 'flex';
    this.bindOverlayButton();
  }

  private showLifeLostOverlay(): void {
    this.overlayEl.innerHTML = `
      <div class="overlay-content">
        <h2 class="overlay-title text-accent-turquoise">¡BOLA PERDIDA!</h2>
        <p class="overlay-subtitle">Te quedan vidas. ¡Concéntrate!</p>
        <button id="breakout-action-btn" class="btn-play-game" style="margin-top: 14px;">
          CONTINUAR [Espacio]
        </button>
      </div>
    `;
    this.overlayEl.style.display = 'flex';
    this.bindOverlayButton();
  }

  private showPausedOverlay(): void {
    this.overlayEl.innerHTML = `
      <div class="overlay-content">
        <h2 class="overlay-title text-accent-turquoise">PAUSA</h2>
        <p class="overlay-subtitle">Partida en suspenso</p>
        <button id="breakout-action-btn" class="btn-play-game" style="margin-top: 14px;">
          REANUDAR [P]
        </button>
      </div>
    `;
    this.overlayEl.style.display = 'flex';
    this.bindOverlayButton();
  }

  private showGameOverOverlay(score: number): void {
    this.overlayEl.innerHTML = `
      <div class="overlay-content">
        <h2 class="overlay-title" style="color: #ff0055;">GAME OVER</h2>
        <p class="overlay-subtitle">Has agotado tus 3 vidas &middot; Puntuación final: <strong>${score}</strong></p>
        <button id="breakout-action-btn" class="btn-play-game" style="margin-top: 14px;">
          REINTENTAR [Espacio]
        </button>
      </div>
    `;
    this.overlayEl.style.display = 'flex';
    this.bindOverlayButton();
  }

  private showVictoryOverlay(score: number): void {
    this.overlayEl.innerHTML = `
      <div class="overlay-content">
        <h2 class="overlay-title overlay-title-win">¡VICTORIA TOTAL!</h2>
        <p class="overlay-subtitle">¡Has destruido todos los ladrillos! Puntuación: <strong>${score}</strong></p>
        <button id="breakout-action-btn" class="btn-play-game" style="margin-top: 14px;">
          NUEVA PARTIDA
        </button>
      </div>
    `;
    this.overlayEl.style.display = 'flex';
    this.bindOverlayButton();
  }

  private hideOverlay(): void {
    this.overlayEl.style.display = 'none';
  }

  private bindOverlayButton(): void {
    const btn = this.overlayEl.querySelector('#breakout-action-btn');
    btn?.addEventListener('click', () => {
      this.handleActionClick();
    });
  }

  private loadHighScore(): number {
    try {
      const saved = localStorage.getItem(HIGH_SCORE_KEY);
      const parsed = saved ? parseInt(saved, 10) : 0;
      return Number.isNaN(parsed) ? 0 : parsed;
    } catch {
      return 0;
    }
  }

  private saveHighScore(score: number): void {
    try {
      localStorage.setItem(HIGH_SCORE_KEY, score.toString());
    } catch {
      // Ignorar fallos de cuota o modo incógnito
    }
  }

  private loadDifficulty(): BreakoutDifficulty {
    try {
      const saved = localStorage.getItem(DIFFICULTY_STORAGE_KEY);
      if (saved === 'easy' || saved === 'normal' || saved === 'hard') {
        return saved;
      }
    } catch {
      // Ignorar
    }
    return 'normal';
  }

  private saveDifficulty(diff: BreakoutDifficulty): void {
    try {
      localStorage.setItem(DIFFICULTY_STORAGE_KEY, diff);
    } catch {
      // Ignorar
    }
  }

  private updateDiffButtonLabel(): void {
    if (!this.diffBtn) {
      return;
    }
    const diff = this.engine.getDifficulty();
    const map: Record<BreakoutDifficulty, string> = {
      easy: 'Fácil',
      normal: 'Normal',
      hard: 'Difícil'
    };
    this.diffBtn.textContent = `Dificultad: ${map[diff]}`;
  }

  private getTemplateHtml(): string {
    const html = `
      <section class="breakout-game-wrapper" aria-label="Juego Breakout">
        <div class="breakout-inner-container">
          <div class="breakout-top-bar">
            <button id="breakout-back-btn" class="snake-back-btn" aria-label="Volver al catálogo principal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Volver al Catálogo</span>
            </button>
            <div class="snake-hud">
              <div class="hud-item">
                <span class="hud-label">PUNTOS</span>
                <span id="breakout-score" class="hud-value">0</span>
              </div>
              <div class="hud-item">
                <span class="hud-label">VIDAS</span>
                <span id="breakout-lives" class="hud-value" style="font-size: 0.9375rem;">❤️❤️❤️</span>
              </div>
              <div class="hud-item">
                <span class="hud-label">LADRILLOS</span>
                <span id="breakout-bricks" class="hud-value text-accent-turquoise" style="font-size: 0.9375rem;">50 / 50</span>
              </div>
              <div class="hud-item">
                <span class="hud-label">RÉCORD</span>
                <span id="breakout-highscore" class="hud-value text-accent-turquoise">0</span>
              </div>
            </div>
            <div class="breakout-actions-bar">
              <button id="breakout-diff-btn" class="hud-btn" aria-label="Cambiar dificultad de Breakout">
                Dificultad: Normal
              </button>
              <button id="breakout-pause-btn" class="hud-btn" aria-label="Pausar o reanudar Breakout">
                Pausa [P]
              </button>
            </div>
          </div>

          <div class="breakout-canvas-box">
            <canvas id="breakout-canvas" width="800" height="600" aria-label="Tablero de Breakout"></canvas>
            <div id="breakout-overlay" class="snake-overlay"></div>
          </div>

          <div class="breakout-touch-controls" aria-label="Controles táctiles de Breakout">
            <button id="breakout-touch-left" class="pong-touch-btn" aria-label="Mover a la izquierda">◀ IZQUIERDA</button>
            <button id="breakout-touch-launch" class="pong-touch-btn btn-play-game" aria-label="Lanzar bola">⤓ LANZAR</button>
            <button id="breakout-touch-right" class="pong-touch-btn" aria-label="Mover a la derecha">DERECHA ▶</button>
          </div>

          <div class="snake-hints">
            <span>Controles: <strong>Flechas / A-D</strong> o <strong>Movimiento de Ratón</strong> para deslizar la paleta &middot; <strong>Espacio</strong> para lanzar &middot; <strong>P</strong> para pausa</span>
          </div>
        </div>
      </section>
    `;
    return html;
  }
}
