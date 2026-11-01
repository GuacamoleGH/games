// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Vista y ciclo de renderizado en Canvas HTML5 para Pong (marcador, controles e IA).
 * @spec REQ-18, REQ-19, REQ-20
 */

import { PongEngine } from '../engine/PongEngine.js';

export class PongView {
  private container: HTMLElement;
  private engine: PongEngine;
  private onBack: () => void;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private playerScoreEl!: HTMLElement;
  private aiScoreEl!: HTMLElement;
  private overlayEl!: HTMLElement;

  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private isDestroyed: boolean = false;

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private boundMouseMove: (e: MouseEvent) => void;
  private boundTouchMove: (e: TouchEvent) => void;

  constructor(container: HTMLElement, onBack: () => void) {
    this.container = container;
    this.onBack = onBack;
    this.engine = new PongEngine();

    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundTouchMove = this.handleTouchMove.bind(this);
  }

  /**
   * Monta la vista del juego Pong y arranca el ciclo.
   * @spec REQ-18, REQ-20
   */
  public mount(): void {
    this.container.innerHTML = this.getTemplateHtml();

    this.canvas = this.container.querySelector('#pong-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.playerScoreEl = this.container.querySelector('#pong-player-score') as HTMLElement;
    this.aiScoreEl = this.container.querySelector('#pong-ai-score') as HTMLElement;
    this.overlayEl = this.container.querySelector('#pong-overlay') as HTMLElement;

    this.setupEventListeners();
    this.updateHUD();
    this.render();
    this.showReadyOverlay();

    this.lastFrameTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Desmonta la vista, cancela bucles y libera recursos.
   * @spec REQ-14
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
      this.canvas.removeEventListener('touchmove', this.boundTouchMove);
    }
    this.container.innerHTML = '';
  }

  private gameLoop(currentTime: number): void {
    if (this.isDestroyed) {
      return;
    }

    const dt = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    if (this.engine.getStatus() === 'PLAYING') {
      const prevPlayerScore = this.engine.getSnapshot().playerScore;
      const prevAiScore = this.engine.getSnapshot().aiScore;

      const snapshot = this.engine.tick(dt);

      if (snapshot.playerScore !== prevPlayerScore || snapshot.aiScore !== prevAiScore) {
        this.updateHUD();
      }

      if (snapshot.status === 'GAME_OVER') {
        this.showGameOverOverlay(snapshot.winner);
      }
    }

    this.render();
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Renderiza el campo retro, las palas y la bola en el Canvas.
   * @spec REQ-18
   */
  private render(): void {
    if (!this.ctx || !this.canvas) {
      return;
    }

    const snapshot = this.engine.getSnapshot();
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Fondo carbón oscuro
    this.ctx.fillStyle = '#0c0f14';
    this.ctx.fillRect(0, 0, width, height);

    // Red central discontinua
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    this.ctx.lineWidth = 4;
    this.ctx.setLineDash([12, 12]);
    this.ctx.beginPath();
    this.ctx.moveTo(width / 2, 0);
    this.ctx.lineTo(width / 2, height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Pala Jugador (Verde Neón)
    this.ctx.save();
    this.ctx.fillStyle = '#00f59b';
    this.ctx.shadowColor = '#00f59b';
    this.ctx.shadowBlur = 10;
    this.roundRect(
      this.ctx,
      snapshot.playerPaddle.x,
      snapshot.playerPaddle.y,
      snapshot.playerPaddle.width,
      snapshot.playerPaddle.height,
      6
    );
    this.ctx.fill();
    this.ctx.restore();

    // Pala IA Rival (Turquesa Neón)
    this.ctx.save();
    this.ctx.fillStyle = '#00d9c4';
    this.ctx.shadowColor = '#00d9c4';
    this.ctx.shadowBlur = 10;
    this.roundRect(
      this.ctx,
      snapshot.aiPaddle.x,
      snapshot.aiPaddle.y,
      snapshot.aiPaddle.width,
      snapshot.aiPaddle.height,
      6
    );
    this.ctx.fill();
    this.ctx.restore();

    // Bola con resplandor
    this.ctx.save();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.shadowColor = '#00d9c4';
    this.ctx.shadowBlur = 14;
    this.ctx.beginPath();
    this.ctx.arc(snapshot.ball.x, snapshot.ball.y, snapshot.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  private updateHUD(): void {
    const snapshot = this.engine.getSnapshot();
    if (this.playerScoreEl) {
      this.playerScoreEl.textContent = String(snapshot.playerScore);
    }
    if (this.aiScoreEl) {
      this.aiScoreEl.textContent = String(snapshot.aiScore);
    }
  }

  private showReadyOverlay(): void {
    this.overlayEl.innerHTML = `
      <div class="overlay-card">
        <h3 class="overlay-title">PONG ARCADE</h3>
        <p class="overlay-text">Mueve tu pala verticalmente. El primero en alcanzar 5 puntos gana el duelo.</p>
        <button id="pong-start-btn" class="btn-arcade-primary" aria-label="Empezar partida de Pong">
          SACAR Y JUGAR
        </button>
      </div>
    `;
    this.overlayEl.style.display = 'flex';

    const startBtn = this.overlayEl.querySelector('#pong-start-btn');
    startBtn?.addEventListener('click', () => {
      this.hideOverlay();
      this.engine.start();
    });
  }

  private showGameOverOverlay(winner: 'PLAYER' | 'AI' | null): void {
    const isPlayerVictory = winner === 'PLAYER';
    this.overlayEl.innerHTML = `
      <div class="overlay-card">
        <h3 class="overlay-title ${isPlayerVictory ? 'overlay-title-win' : 'overlay-game-over'}">
          ${isPlayerVictory ? '¡VICTORIA!' : 'DERROTA'}
        </h3>
        <p class="overlay-score">
          ${isPlayerVictory ? 'Has derrotado al rival en el homelab.' : 'El rival autónomo ha ganado la partida.'}
        </p>
        <button id="pong-restart-btn" class="btn-arcade-primary" aria-label="Revancha de Pong">
          REVANCHA
        </button>
      </div>
    `;
    this.overlayEl.style.display = 'flex';

    const restartBtn = this.overlayEl.querySelector('#pong-restart-btn');
    restartBtn?.addEventListener('click', () => {
      this.hideOverlay();
      this.engine.start();
      this.updateHUD();
    });
  }

  private showPauseOverlay(): void {
    this.overlayEl.innerHTML = `
      <div class="overlay-card">
        <h3 class="overlay-title">PAUSA</h3>
        <p class="overlay-text">Duelo de Pong suspendido.</p>
        <button id="pong-resume-btn" class="btn-arcade-primary" aria-label="Reanudar Pong">
          REANUDAR
        </button>
      </div>
    `;
    this.overlayEl.style.display = 'flex';

    const resumeBtn = this.overlayEl.querySelector('#pong-resume-btn');
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
    window.addEventListener('keyup', this.boundKeyUp);

    if (this.canvas) {
      this.canvas.addEventListener('mousemove', this.boundMouseMove);
      this.canvas.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    }

    // Botón volver
    const backBtn = this.container.querySelector('#pong-back-btn');
    backBtn?.addEventListener('click', () => {
      this.destroy();
      this.onBack();
    });

    // Botón de pausa en HUD
    const pauseHudBtn = this.container.querySelector('#pong-pause-hud-btn');
    pauseHudBtn?.addEventListener('click', () => {
      this.handlePause();
    });

    // Controles táctiles verticales en pantalla (arriba/abajo)
    const btnUp = this.container.querySelector('#pong-touch-up');
    const btnDown = this.container.querySelector('#pong-touch-down');

    btnUp?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.engine.setPlayerMove(-1);
    });
    btnUp?.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.engine.setPlayerMove(0);
    });
    btnUp?.addEventListener('mousedown', () => this.engine.setPlayerMove(-1));
    btnUp?.addEventListener('mouseup', () => this.engine.setPlayerMove(0));

    btnDown?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.engine.setPlayerMove(1);
    });
    btnDown?.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.engine.setPlayerMove(0);
    });
    btnDown?.addEventListener('mousedown', () => this.engine.setPlayerMove(1));
    btnDown?.addEventListener('mouseup', () => this.engine.setPlayerMove(0));
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
      this.engine.setPlayerMove(-1);
    } else if (key === 'arrowdown' || key === 's') {
      e.preventDefault();
      this.engine.setPlayerMove(1);
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

  private handleKeyUp(e: KeyboardEvent): void {
    const key = e.key.toLowerCase();
    if (key === 'arrowup' || key === 'w' || key === 'arrowdown' || key === 's') {
      this.engine.setPlayerMove(0);
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.engine.getStatus() !== 'PLAYING') {
      return;
    }
    const rect = this.canvas.getBoundingClientRect();
    const scaleY = this.canvas.height / rect.height;
    const clientY = (e.clientY - rect.top) * scaleY;
    this.engine.setPlayerCenterY(clientY);
  }

  private handleTouchMove(e: TouchEvent): void {
    if (this.engine.getStatus() !== 'PLAYING') {
      return;
    }
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) {
      return;
    }
    const rect = this.canvas.getBoundingClientRect();
    const scaleY = this.canvas.height / rect.height;
    const clientY = (touch.clientY - rect.top) * scaleY;
    this.engine.setPlayerCenterY(clientY);
  }

  private getTemplateHtml(): string {
    const html = `
      <section class="pong-game-wrapper" aria-label="Juego Pong">
        <div class="container pong-inner-container">
          <div class="pong-top-bar">
            <button id="pong-back-btn" class="snake-back-btn" aria-label="Volver al catálogo principal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Volver al Catálogo</span>
            </button>

            <div class="pong-scoreboard">
              <div class="score-team team-player">
                <span class="team-label">TÚ</span>
                <span id="pong-player-score" class="score-number score-player">0</span>
              </div>
              <span class="score-vs">&middot;</span>
              <div class="score-team team-ai">
                <span id="pong-ai-score" class="score-number score-ai">0</span>
                <span class="team-label">RIVAL</span>
              </div>
              <button id="pong-pause-hud-btn" class="hud-btn" aria-label="Pausar o reanudar Pong">
                Pausa [P]
              </button>
            </div>
          </div>

          <div class="pong-canvas-box">
            <canvas id="pong-canvas" width="800" height="500" aria-label="Pista de Pong"></canvas>
            <div id="pong-overlay" class="snake-overlay"></div>
          </div>

          <div class="pong-touch-controls" aria-label="Controles táctiles de Pong">
            <button id="pong-touch-up" class="pong-touch-btn" aria-label="Mover pala arriba">▲ SUBIR</button>
            <button id="pong-touch-down" class="pong-touch-btn" aria-label="Mover pala abajo">▼ BAJAR</button>
          </div>

          <div class="snake-hints">
            <span>Controles: <strong>W/S</strong> o <strong>Flechas</strong> para moverte &middot; <strong>Ratón / Toque</strong> deslizando &middot; <strong>P</strong> para pausa</span>
          </div>
        </div>
      </section>
    `;
    return html;
  }
}
