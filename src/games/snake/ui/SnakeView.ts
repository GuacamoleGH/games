// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Vista, ciclo de renderizado en Canvas HTML5, HUD y controles para Snake.
 * @spec REQ-10, REQ-11, REQ-12, REQ-13, REQ-41
 */

import { SnakeEngine, type SnakeDifficulty } from '../engine/SnakeEngine.js';
import type { Direction, Point } from '../types.js';
import { soundManager } from '../../../common/audio/SoundEffects.js';

const HIGH_SCORE_KEY = 'guacamolegh_snake_highscore';
const DIFFICULTY_STORAGE_KEY = 'guacamolegh_snake_diff';

export class SnakeView {
  private container: HTMLElement;
  private engine: SnakeEngine;
  private onBack: () => void;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private scoreEl!: HTMLElement;
  private highScoreEl!: HTMLElement;
  private overlayEl!: HTMLElement;
  private diffBtn!: HTMLButtonElement;

  private animationFrameId: number | null = null;
  private lastTickTime: number = 0;
  private isDestroyed: boolean = false;

  private boundKeyDown: (e: KeyboardEvent) => void;

  constructor(container: HTMLElement, onBack: () => void) {
    this.container = container;
    this.onBack = onBack;

    const savedHighScore = this.loadHighScore();
    const savedDiff = this.loadDifficulty();
    this.engine = new SnakeEngine(undefined, savedHighScore, savedDiff);
    this.boundKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Monta la vista del juego en el contenedor DOM y arranca el ciclo.
   * @spec REQ-10, REQ-13
   */
  public mount(): void {
    this.container.innerHTML = this.getTemplateHtml();

    this.canvas = this.container.querySelector('#snake-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.scoreEl = this.container.querySelector('#snake-score') as HTMLElement;
    this.highScoreEl = this.container.querySelector('#snake-highscore') as HTMLElement;
    this.overlayEl = this.container.querySelector('#snake-overlay') as HTMLElement;
    this.diffBtn = this.container.querySelector('#snake-diff-btn') as HTMLButtonElement;

    this.setupEventListeners();
    this.updateDiffButtonLabel();
    this.updateHUD();
    this.render();
    this.showReadyOverlay();

    this.lastTickTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Desmonta la vista, cancela bucles de animación y elimina event listeners.
   * @spec REQ-07
   */
  public destroy(): void {
    this.isDestroyed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('keydown', this.boundKeyDown);
    this.container.innerHTML = '';
  }

  private gameLoop(currentTime: number): void {
    if (this.isDestroyed) {
      return;
    }

    const elapsed = currentTime - this.lastTickTime;
    const interval = this.engine.getTickIntervalMs();

    if (elapsed >= interval) {
      if (this.engine.getStatus() === 'PLAYING') {
        const prevScore = this.engine.getSnapshot().score;
        const snapshot = this.engine.tick();
        this.lastTickTime = currentTime;

        if (snapshot.score !== prevScore) {
          this.updateHUD();
          this.saveHighScore(snapshot.highScore);
          soundManager.play('eat');
        }

        if (snapshot.status === 'GAME_OVER') {
          soundManager.play('die');
          this.showGameOverOverlay(snapshot.score, snapshot.highScore);
        }
      } else {
        this.lastTickTime = currentTime;
      }
    }

    this.render();
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Renderiza el estado actual en el Canvas HTML5.
   * @spec REQ-10
   */
  private render(): void {
    if (!this.ctx || !this.canvas) {
      return;
    }

    const snapshot = this.engine.getSnapshot();
    const width = this.canvas.width;
    const height = this.canvas.height;
    const cellSize = width / snapshot.gridSize;

    // Fondo oscuro carbón
    this.ctx.fillStyle = '#0f131a';
    this.ctx.fillRect(0, 0, width, height);

    // Rejilla arcade sutil
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= snapshot.gridSize; i += 1) {
      const pos = i * cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(pos, 0);
      this.ctx.lineTo(pos, height);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(0, pos);
      this.ctx.lineTo(width, pos);
      this.ctx.stroke();
    }

    // Dibujar Comida (Turquesa Neón con brillo)
    this.drawFood(snapshot.food, cellSize);

    // Dibujar Serpiente (Verde Aguacate / Neón)
    this.drawSnake(snapshot.snake, snapshot.direction, cellSize);
  }

  private drawFood(food: Point, cellSize: number): void {
    const cx = food.x * cellSize + cellSize / 2;
    const cy = food.y * cellSize + cellSize / 2;
    const radius = (cellSize / 2) * 0.75;

    // Resplandor
    this.ctx.save();
    this.ctx.shadowColor = '#00d9c4';
    this.ctx.shadowBlur = 12;
    this.ctx.fillStyle = '#00d9c4';

    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  private drawSnake(snake: readonly Point[], direction: Direction, cellSize: number): void {
    for (let i = 0; i < snake.length; i += 1) {
      const segment = snake[i];
      if (!segment) {
        continue;
      }

      const x = segment.x * cellSize;
      const y = segment.y * cellSize;
      const isHead = i === 0;

      this.ctx.save();
      if (isHead) {
        // Cabeza con resplandor verde
        this.ctx.shadowColor = '#00f59b';
        this.ctx.shadowBlur = 8;
        this.ctx.fillStyle = '#00f59b';
        this.ctx.beginPath();
        this.roundRect(this.ctx, x + 1, y + 1, cellSize - 2, cellSize - 2, 5);
        this.ctx.fill();

        // Ojos
        this.drawEyes(x, y, cellSize, direction);
      } else {
        // Cuerpo con degradado sutil
        const ratio = 1 - (i / snake.length) * 0.35;
        this.ctx.fillStyle = `rgba(0, 245, 155, ${ratio.toFixed(2)})`;
        this.ctx.beginPath();
        this.roundRect(this.ctx, x + 1.5, y + 1.5, cellSize - 3, cellSize - 3, 3);
        this.ctx.fill();
      }
      this.ctx.restore();
    }
  }

  private drawEyes(x: number, y: number, size: number, dir: Direction): void {
    this.ctx.fillStyle = '#0a0d12';
    const eyeSize = 3;

    let e1x = x + size * 0.3;
    let e1y = y + size * 0.3;
    let e2x = x + size * 0.7;
    let e2y = y + size * 0.3;

    if (dir === 'DOWN') {
      e1y = y + size * 0.7;
      e2y = y + size * 0.7;
    } else if (dir === 'LEFT') {
      e1x = x + size * 0.3;
      e1y = y + size * 0.3;
      e2x = x + size * 0.3;
      e2y = y + size * 0.7;
    } else if (dir === 'RIGHT') {
      e1x = x + size * 0.7;
      e1y = y + size * 0.3;
      e2x = x + size * 0.7;
      e2y = y + size * 0.7;
    }

    this.ctx.beginPath();
    this.ctx.arc(e1x, e1y, eyeSize, 0, Math.PI * 2);
    this.ctx.arc(e2x, e2y, eyeSize, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
  }

  private updateHUD(): void {
    const snapshot = this.engine.getSnapshot();
    if (this.scoreEl) {
      this.scoreEl.textContent = String(snapshot.score);
    }
    if (this.highScoreEl) {
      this.highScoreEl.textContent = String(snapshot.highScore);
    }
  }

  private showReadyOverlay(): void {
    this.overlayEl.innerHTML = `
      <div class="overlay-card">
        <h3 class="overlay-title">SNAKE ARCADE</h3>
        <p class="overlay-text">Usa las flechas, WASD o los controles táctiles para comer y esquivar los muros.</p>
        <button id="snake-start-btn" class="btn-arcade-primary" aria-label="Comenzar partida">
          EMPEZAR PARTIDA
        </button>
      </div>
    `;
    this.overlayEl.style.display = 'flex';

    const startBtn = this.overlayEl.querySelector('#snake-start-btn');
    startBtn?.addEventListener('click', () => {
      soundManager.play('click');
      this.hideOverlay();
      this.engine.start();
    });
  }

  private showGameOverOverlay(score: number, highScore: number): void {
    const isNewRecord = score >= highScore && score > 0;
    this.overlayEl.innerHTML = `
      <div class="overlay-card">
        <h3 class="overlay-title overlay-game-over">FIN DE PARTIDA</h3>
        ${isNewRecord ? '<span class="badge-record">¡NUEVO RÉCORD!</span>' : ''}
        <p class="overlay-score">Puntuación: <strong>${score}</strong> &middot; Récord: <strong>${highScore}</strong></p>
        <button id="snake-restart-btn" class="btn-arcade-primary" aria-label="Jugar de nuevo">
          JUGAR DE NUEVO
        </button>
      </div>
    `;
    this.overlayEl.style.display = 'flex';

    const restartBtn = this.overlayEl.querySelector('#snake-restart-btn');
    restartBtn?.addEventListener('click', () => {
      soundManager.play('click');
      this.hideOverlay();
      this.engine.start();
      this.updateHUD();
    });
  }

  private showPauseOverlay(): void {
    this.overlayEl.innerHTML = `
      <div class="overlay-card">
        <h3 class="overlay-title">EN PAUSA</h3>
        <p class="overlay-text">Partida suspendida temporalmente.</p>
        <button id="snake-resume-btn" class="btn-arcade-primary" aria-label="Reanudar partida">
          REANUDAR
        </button>
      </div>
    `;
    this.overlayEl.style.display = 'flex';

    const resumeBtn = this.overlayEl.querySelector('#snake-resume-btn');
    resumeBtn?.addEventListener('click', () => {
      soundManager.play('click');
      this.hideOverlay();
      this.engine.togglePause();
    });
  }

  private hideOverlay(): void {
    this.overlayEl.style.display = 'none';
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', this.boundKeyDown);

    // Botón volver
    const backBtn = this.container.querySelector('#snake-back-btn');
    backBtn?.addEventListener('click', () => {
      this.destroy();
      this.onBack();
    });

    // Botón de dificultad en HUD
    this.diffBtn?.addEventListener('click', () => {
      soundManager.play('click');
      const current = this.engine.getDifficulty();
      const next: SnakeDifficulty =
        current === 'easy'
          ? 'normal'
          : current === 'normal'
            ? 'hard'
            : current === 'hard'
              ? 'extreme'
              : 'easy';
      this.engine.setDifficulty(next);
      this.saveDifficulty(next);
      this.updateDiffButtonLabel();
    });

    // Botón de pausa en HUD
    const pauseHudBtn = this.container.querySelector('#snake-pause-hud-btn');
    pauseHudBtn?.addEventListener('click', () => {
      this.handlePause();
    });

    // Controles táctiles D-pad
    const dpadButtons = this.container.querySelectorAll<HTMLButtonElement>('.dpad-btn');
    dpadButtons.forEach((btn) => {
      const dir = btn.getAttribute('data-dir') as Direction | null;
      if (dir) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.engine.setDirection(dir);
        });
        btn.addEventListener('touchstart', (e) => {
          e.preventDefault();
          this.engine.setDirection(dir);
        });
      }
    });

    const dpadPause = this.container.querySelector('#snake-dpad-pause');
    dpadPause?.addEventListener('click', () => this.handlePause());
  }

  private handlePause(): void {
    const currentStatus = this.engine.getStatus();
    if (currentStatus === 'PLAYING') {
      this.engine.togglePause();
      this.showPauseOverlay();
    } else if (currentStatus === 'PAUSED') {
      this.engine.togglePause();
      this.hideOverlay();
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const key = e.key.toLowerCase();

    if (key === 'arrowup' || key === 'w') {
      e.preventDefault();
      if (this.engine.getStatus() === 'READY') {
        this.hideOverlay();
        this.engine.start();
        this.updateHUD();
      }
      this.engine.setDirection('UP');
    } else if (key === 'arrowdown' || key === 's') {
      e.preventDefault();
      if (this.engine.getStatus() === 'READY') {
        this.hideOverlay();
        this.engine.start();
        this.updateHUD();
      }
      this.engine.setDirection('DOWN');
    } else if (key === 'arrowleft' || key === 'a') {
      e.preventDefault();
      if (this.engine.getStatus() === 'READY') {
        this.hideOverlay();
        this.engine.start();
        this.updateHUD();
      }
      this.engine.setDirection('LEFT');
    } else if (key === 'arrowright' || key === 'd') {
      e.preventDefault();
      if (this.engine.getStatus() === 'READY') {
        this.hideOverlay();
        this.engine.start();
        this.updateHUD();
      }
      this.engine.setDirection('RIGHT');
    } else if (key === 'p' || key === 'escape') {
      e.preventDefault();
      this.handlePause();
    } else if (key === ' ' || key === 'enter') {
      const status = this.engine.getStatus();
      if (status === 'READY' || status === 'GAME_OVER') {
        e.preventDefault();
        this.hideOverlay();
        this.engine.start();
        this.updateHUD();
      }
    }
  }

  private loadHighScore(): number {
    try {
      const val = localStorage.getItem(HIGH_SCORE_KEY);
      if (val) {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? 0 : parsed;
      }
    } catch {
      // Ignorar fallos de acceso a localStorage
    }
    return 0;
  }

  private saveHighScore(score: number): void {
    try {
      localStorage.setItem(HIGH_SCORE_KEY, String(score));
    } catch {
      // Ignorar fallos de acceso a localStorage
    }
  }

  private loadDifficulty(): SnakeDifficulty {
    try {
      const saved = localStorage.getItem(DIFFICULTY_STORAGE_KEY);
      if (saved === 'easy' || saved === 'normal' || saved === 'hard' || saved === 'extreme') {
        return saved;
      }
    } catch {
      // Ignorar
    }
    return 'normal';
  }

  private saveDifficulty(diff: SnakeDifficulty): void {
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
    const map: Record<SnakeDifficulty, string> = {
      easy: 'Fácil',
      normal: 'Normal',
      hard: 'Difícil',
      extreme: 'Extremo'
    };
    this.diffBtn.textContent = `Dificultad: ${map[diff]}`;
  }

  private getTemplateHtml(): string {
    const html = `
      <section class="snake-game-wrapper" aria-label="Juego Snake">
        <div class="container snake-inner-container">
          <div class="snake-top-bar">
            <button id="snake-back-btn" class="snake-back-btn" aria-label="Volver al catálogo principal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Volver al Catálogo</span>
            </button>

            <div class="snake-hud">
              <div class="hud-item">
                <span class="hud-label">PUNTOS</span>
                <span id="snake-score" class="hud-value">0</span>
              </div>
              <div class="hud-item">
                <span class="hud-label">RÉCORD</span>
                <span id="snake-highscore" class="hud-value">0</span>
              </div>
              <button id="snake-diff-btn" class="hud-btn" aria-label="Cambiar dificultad de Snake">
                Dificultad: Normal
              </button>
              <button id="snake-pause-hud-btn" class="hud-btn" aria-label="Pausar o reanudar partida">
                Pausa [P]
              </button>
            </div>
          </div>

          <div class="snake-canvas-box">
            <canvas id="snake-canvas" width="400" height="400" aria-label="Tablero de Snake"></canvas>
            <div id="snake-overlay" class="snake-overlay"></div>
          </div>

          <div class="snake-touch-controls" aria-label="Controles táctiles virtuales">
            <button class="dpad-btn dpad-up" data-dir="UP" aria-label="Mover hacia arriba">▲</button>
            <div class="dpad-middle-row">
              <button class="dpad-btn dpad-left" data-dir="LEFT" aria-label="Mover hacia la izquierda">◀</button>
              <button class="dpad-btn dpad-pause" id="snake-dpad-pause" aria-label="Pausar">⏸</button>
              <button class="dpad-btn dpad-right" data-dir="RIGHT" aria-label="Mover hacia la derecha">▶</button>
            </div>
            <button class="dpad-btn dpad-down" data-dir="DOWN" aria-label="Mover hacia abajo">▼</button>
          </div>

          <div class="snake-hints">
            <span>Controles: <strong>Flechas / WASD</strong> para girar &middot; <strong>P</strong> para pausa</span>
          </div>
        </div>
      </section>
    `;
    return html;
  }
}
