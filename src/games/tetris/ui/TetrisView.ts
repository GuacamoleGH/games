// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Vista y renderizado en Canvas HTML5 para Tetris (matriz, ghost piece, siguiente pieza y controles).
 * @spec REQ-24, REQ-25, REQ-26, REQ-27
 */

import { TetrisEngine } from '../engine/TetrisEngine.js';
import type { Tetromino } from '../types.js';

const HIGH_SCORE_KEY = 'guacamolegh_tetris_highscore';

export class TetrisView {
  private container: HTMLElement;
  private engine: TetrisEngine;
  private onBack: () => void;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private nextCanvas!: HTMLCanvasElement;
  private nextCtx!: CanvasRenderingContext2D;

  private scoreEl!: HTMLElement;
  private linesEl!: HTMLElement;
  private levelEl!: HTMLElement;
  private highScoreEl!: HTMLElement;
  private overlayEl!: HTMLElement;

  private animationFrameId: number | null = null;
  private lastDropTime: number = 0;
  private isDestroyed: boolean = false;

  private boundKeyDown: (e: KeyboardEvent) => void;

  constructor(container: HTMLElement, onBack: () => void) {
    this.container = container;
    this.onBack = onBack;

    const savedHighScore = this.loadHighScore();
    this.engine = new TetrisEngine(undefined, savedHighScore);
    this.boundKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Monta la vista del juego Tetris en el contenedor provisto.
   * @spec REQ-25, REQ-27
   */
  public mount(): void {
    this.container.innerHTML = this.getTemplateHtml();

    this.canvas = this.container.querySelector('#tetris-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.nextCanvas = this.container.querySelector('#tetris-next-canvas') as HTMLCanvasElement;
    this.nextCtx = this.nextCanvas.getContext('2d') as CanvasRenderingContext2D;

    this.scoreEl = this.container.querySelector('#tetris-score') as HTMLElement;
    this.linesEl = this.container.querySelector('#tetris-lines') as HTMLElement;
    this.levelEl = this.container.querySelector('#tetris-level') as HTMLElement;
    this.highScoreEl = this.container.querySelector('#tetris-highscore') as HTMLElement;
    this.overlayEl = this.container.querySelector('#tetris-overlay') as HTMLElement;

    this.setupEventListeners();
    this.updateHUD();
    this.render();
    this.showReadyOverlay();

    this.lastDropTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Desmonta la vista y libera bucles y listeners.
   * @spec REQ-21
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

    const elapsed = currentTime - this.lastDropTime;
    const dropInterval = this.engine.getDropIntervalMs();

    if (elapsed >= dropInterval) {
      if (this.engine.getStatus() === 'PLAYING') {
        const prevScore = this.engine.getSnapshot().score;
        const snapshot = this.engine.tick();
        this.lastDropTime = currentTime;

        if (snapshot.score !== prevScore) {
          this.updateHUD();
          this.saveHighScore(snapshot.highScore);
        }

        if (snapshot.status === 'GAME_OVER') {
          this.showGameOverOverlay(snapshot.score, snapshot.highScore);
        }
      } else {
        this.lastDropTime = currentTime;
      }
    }

    this.render();
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Renderiza la matriz de juego, la ghost piece y la siguiente pieza.
   * @spec REQ-24, REQ-25
   */
  private render(): void {
    if (!this.ctx || !this.canvas) {
      return;
    }

    const snapshot = this.engine.getSnapshot();
    const width = this.canvas.width;
    const height = this.canvas.height;
    const cols = 10;
    const rows = 20;
    const cellW = width / cols;
    const cellH = height / rows;

    // Fondo carbón
    this.ctx.fillStyle = '#0a0d13';
    this.ctx.fillRect(0, 0, width, height);

    // Rejilla sutil
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    this.ctx.lineWidth = 1;
    for (let c = 0; c <= cols; c += 1) {
      this.ctx.beginPath();
      this.ctx.moveTo(c * cellW, 0);
      this.ctx.lineTo(c * cellW, height);
      this.ctx.stroke();
    }
    for (let r = 0; r <= rows; r += 1) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, r * cellH);
      this.ctx.lineTo(width, r * cellH);
      this.ctx.stroke();
    }

    // Dibujar bloques fijos del tablero
    for (let r = 0; r < rows; r += 1) {
      const row = snapshot.board[r];
      if (!row) {
        continue;
      }
      for (let c = 0; c < cols; c += 1) {
        const color = row[c];
        if (color) {
          this.drawCell(this.ctx, c * cellW, r * cellH, cellW, cellH, color);
        }
      }
    }

    // Dibujar Ghost Piece (Proyección de impacto) (REQ-24)
    if (snapshot.currentPiece && snapshot.status === 'PLAYING') {
      const { matrix, x } = snapshot.currentPiece;
      for (let r = 0; r < matrix.length; r += 1) {
        const row = matrix[r];
        if (!row) {
          continue;
        }
        for (let c = 0; c < row.length; c += 1) {
          if (row[c] !== 0) {
            const gx = (x + c) * cellW;
            const gy = (snapshot.ghostY + r) * cellH;
            this.drawGhostCell(this.ctx, gx, gy, cellW, cellH);
          }
        }
      }
    }

    // Dibujar Pieza Activa (REQ-25)
    if (snapshot.currentPiece) {
      const { matrix, x, y, color } = snapshot.currentPiece;
      for (let r = 0; r < matrix.length; r += 1) {
        const row = matrix[r];
        if (!row) {
          continue;
        }
        for (let c = 0; c < row.length; c += 1) {
          if (row[c] !== 0) {
            this.drawCell(this.ctx, (x + c) * cellW, (y + r) * cellH, cellW, cellH, color);
          }
        }
      }
    }

    // Renderizar previsualización de la siguiente pieza (REQ-24)
    this.renderNextPiece(snapshot.nextPiece);
  }

  private drawCell(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, w - 2, h - 2);

    // Biselado arcade brillante
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
    ctx.restore();
  }

  private drawGhostCell(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 245, 155, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
    ctx.restore();
  }

  private renderNextPiece(piece: Tetromino): void {
    if (!this.nextCtx || !this.nextCanvas) {
      return;
    }
    const width = this.nextCanvas.width;
    const height = this.nextCanvas.height;

    this.nextCtx.fillStyle = '#0a0d13';
    this.nextCtx.fillRect(0, 0, width, height);

    const matrix = piece.matrix;
    const cellSize = 18;
    const pieceWidth = matrix[0]!.length * cellSize;
    const pieceHeight = matrix.length * cellSize;
    const offsetX = (width - pieceWidth) / 2;
    const offsetY = (height - pieceHeight) / 2;

    for (let r = 0; r < matrix.length; r += 1) {
      const row = matrix[r];
      if (!row) {
        continue;
      }
      for (let c = 0; c < row.length; c += 1) {
        if (row[c] !== 0) {
          this.drawCell(this.nextCtx, offsetX + c * cellSize, offsetY + r * cellSize, cellSize, cellSize, piece.color);
        }
      }
    }
  }

  private updateHUD(): void {
    const snapshot = this.engine.getSnapshot();
    if (this.scoreEl) {
      this.scoreEl.textContent = String(snapshot.score);
    }
    if (this.linesEl) {
      this.linesEl.textContent = String(snapshot.lines);
    }
    if (this.levelEl) {
      this.levelEl.textContent = String(snapshot.level);
    }
    if (this.highScoreEl) {
      this.highScoreEl.textContent = String(snapshot.highScore);
    }
  }

  private showReadyOverlay(): void {
    this.overlayEl.innerHTML = `
      <div class="overlay-card">
        <h3 class="overlay-title">TETRIS ARCADE</h3>
        <p class="overlay-text">Completa líneas horizontales para ganar puntos. ¡Cada 10 líneas subes de nivel y velocidad!</p>
        <button id="tetris-start-btn" class="btn-arcade-primary" aria-label="Comenzar partida de Tetris">
          EMPEZAR PARTIDA
        </button>
      </div>
    `;
    this.overlayEl.style.display = 'flex';

    const startBtn = this.overlayEl.querySelector('#tetris-start-btn');
    startBtn?.addEventListener('click', () => {
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
        <button id="tetris-restart-btn" class="btn-arcade-primary" aria-label="Jugar de nuevo a Tetris">
          JUGAR DE NUEVO
        </button>
      </div>
    `;
    this.overlayEl.style.display = 'flex';

    const restartBtn = this.overlayEl.querySelector('#tetris-restart-btn');
    restartBtn?.addEventListener('click', () => {
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
        <button id="tetris-resume-btn" class="btn-arcade-primary" aria-label="Reanudar Tetris">
          REANUDAR
        </button>
      </div>
    `;
    this.overlayEl.style.display = 'flex';

    const resumeBtn = this.overlayEl.querySelector('#tetris-resume-btn');
    resumeBtn?.addEventListener('click', () => {
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
    const backBtn = this.container.querySelector('#tetris-back-btn');
    backBtn?.addEventListener('click', () => {
      this.destroy();
      this.onBack();
    });

    // Botón pausa
    const pauseBtn = this.container.querySelector('#tetris-pause-btn');
    pauseBtn?.addEventListener('click', () => {
      this.handlePause();
    });

    // Controles táctiles
    const btnLeft = this.container.querySelector('#tetris-touch-left');
    const btnRight = this.container.querySelector('#tetris-touch-right');
    const btnRotate = this.container.querySelector('#tetris-touch-rotate');
    const btnDrop = this.container.querySelector('#tetris-touch-drop');
    const btnHardDrop = this.container.querySelector('#tetris-touch-harddrop');

    btnLeft?.addEventListener('click', () => this.engine.moveLeft());
    btnRight?.addEventListener('click', () => this.engine.moveRight());
    btnRotate?.addEventListener('click', () => this.engine.rotate());
    btnDrop?.addEventListener('click', () => this.engine.softDrop());
    btnHardDrop?.addEventListener('click', () => {
      this.engine.hardDrop();
      this.updateHUD();
    });
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

    if (key === 'arrowleft' || key === 'a') {
      e.preventDefault();
      this.engine.moveLeft();
    } else if (key === 'arrowright' || key === 'd') {
      e.preventDefault();
      this.engine.moveRight();
    } else if (key === 'arrowdown' || key === 's') {
      e.preventDefault();
      this.engine.softDrop();
    } else if (key === 'arrowup' || key === 'w' || key === 'x') {
      e.preventDefault();
      this.engine.rotate();
    } else if (key === ' ') {
      e.preventDefault();
      const status = this.engine.getStatus();
      if (status === 'PLAYING') {
        this.engine.hardDrop();
        this.updateHUD();
      } else if (status === 'READY' || status === 'GAME_OVER') {
        this.hideOverlay();
        this.engine.start();
        this.updateHUD();
      }
    } else if (key === 'p' || key === 'escape') {
      e.preventDefault();
      this.handlePause();
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

  private getTemplateHtml(): string {
    const html = `
      <section class="tetris-game-wrapper" aria-label="Juego Tetris">
        <div class="container tetris-inner-container">
          <div class="tetris-top-bar">
            <button id="tetris-back-btn" class="snake-back-btn" aria-label="Volver al catálogo principal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Volver al Catálogo</span>
            </button>
            <button id="tetris-pause-btn" class="hud-btn" aria-label="Pausar o reanudar Tetris">
              Pausa [P]
            </button>
          </div>

          <div class="tetris-layout">
            <div class="tetris-canvas-box">
              <canvas id="tetris-canvas" width="280" height="560" aria-label="Matriz de Tetris"></canvas>
              <div id="tetris-overlay" class="snake-overlay"></div>
            </div>

            <div class="tetris-side-panel">
              <div class="side-card">
                <span class="side-label">SIGUIENTE</span>
                <div class="next-piece-box">
                  <canvas id="tetris-next-canvas" width="90" height="90" aria-label="Siguiente pieza"></canvas>
                </div>
              </div>

              <div class="side-card">
                <span class="side-label">PUNTOS</span>
                <span id="tetris-score" class="side-value text-accent-green">0</span>
              </div>

              <div class="side-card">
                <span class="side-label">LÍNEAS</span>
                <span id="tetris-lines" class="side-value">0</span>
              </div>

              <div class="side-card">
                <span class="side-label">NIVEL</span>
                <span id="tetris-level" class="side-value text-accent-turquoise">1</span>
              </div>

              <div class="side-card">
                <span class="side-label">RÉCORD</span>
                <span id="tetris-highscore" class="side-value">0</span>
              </div>
            </div>
          </div>

          <div class="tetris-touch-controls" aria-label="Controles táctiles de Tetris">
            <button id="tetris-touch-left" class="tetris-touch-btn" aria-label="Mover a la izquierda">◀</button>
            <button id="tetris-touch-rotate" class="tetris-touch-btn tetris-btn-rotate" aria-label="Rotar pieza">⤾</button>
            <button id="tetris-touch-drop" class="tetris-touch-btn" aria-label="Caída suave">▼</button>
            <button id="tetris-touch-right" class="tetris-touch-btn" aria-label="Mover a la derecha">▶</button>
            <button id="tetris-touch-harddrop" class="tetris-touch-btn tetris-btn-hard" aria-label="Caída instantánea">⤓ CAER</button>
          </div>

          <div class="snake-hints">
            <span>Controles: <strong>Flechas / WASD</strong> para mover y rotar &middot; <strong>Espacio</strong> para caída directa &middot; <strong>P</strong> para pausa</span>
          </div>
        </div>
      </section>
    `;
    return html;
  }
}
