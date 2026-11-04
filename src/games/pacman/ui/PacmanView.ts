// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Vista y renderizado en Canvas HTML5 para Pac-Man.
 * @spec REQ-50, REQ-51
 */

import { PacmanEngine, DEFAULT_PACMAN_CONFIG } from '../engine/PacmanEngine.js';
import type {
  PacmanSnapshot,
  PacmanDifficulty,
  PacmanDirection,
  Ghost
} from '../types.js';
import { soundManager } from '../../../common/audio/SoundEffects.js';

const HIGH_SCORE_KEY = 'guacamolegh_pacman_highscore';
const DIFFICULTY_STORAGE_KEY = 'guacamolegh_pacman_diff';

export class PacmanView {
  private container: HTMLElement;
  private engine: PacmanEngine;
  private onBack: () => void;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  private scoreEl!: HTMLElement;
  private livesEl!: HTMLElement;
  private levelEl!: HTMLElement;
  private highScoreEl!: HTMLElement;
  private overlayEl!: HTMLElement;
  private diffBtn: HTMLButtonElement | null = null;

  private animationFrameId: number | null = null;
  private isDestroyed: boolean = false;
  private lastFrameTime: number = 0;

  private boundKeyDown: (e: KeyboardEvent) => void;

  constructor(container: HTMLElement, onBack: () => void) {
    this.container = container;
    this.onBack = onBack;

    const savedHighScore = this.loadHighScore();
    const savedDiff = this.loadDifficulty();
    this.engine = new PacmanEngine(undefined, savedHighScore, savedDiff);

    this.engine.onSoundEvent = (event) => {
      if (event === 'eat') {
        soundManager.play('eat');
      } else if (event === 'power') {
        soundManager.play('tetris');
      } else if (event === 'ghost_eat') {
        soundManager.play('win');
      } else if (event === 'die') {
        soundManager.stopPacmanMusic();
        soundManager.play('die');
        if (this.engine.getLives() > 0) {
          setTimeout(() => {
            if (!this.isDestroyed && this.engine.getStatus() === 'PLAYING') {
              soundManager.startPacmanMusic();
            }
          }, 1400);
        }
      } else if (event === 'win') {
        soundManager.stopPacmanMusic();
        soundManager.play('win');
      }
    };

    this.boundKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Monta la interfaz del juego en el contenedor.
   * @spec REQ-51
   */
  public mount(): void {
    this.container.innerHTML = this.getTemplateHtml();

    this.canvas = this.container.querySelector('#pacman-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    this.scoreEl = this.container.querySelector('#pacman-score') as HTMLElement;
    this.livesEl = this.container.querySelector('#pacman-lives') as HTMLElement;
    this.levelEl = this.container.querySelector('#pacman-level') as HTMLElement;
    this.highScoreEl = this.container.querySelector('#pacman-highscore') as HTMLElement;
    this.overlayEl = this.container.querySelector('#pacman-overlay') as HTMLElement;
    this.diffBtn = this.container.querySelector('#pacman-diff-btn');

    this.bindEvents();
    if (this.diffBtn) {
      this.updateDiffButtonLabel();
    }
    this.updateHud(this.engine.getSnapshot());
    this.showReadyOverlay();

    this.startGameLoop();
  }

  /**
   * Desmonta y destruye la vista liberando recursos.
   * @spec REQ-49
   */
  public destroy(): void {
    this.isDestroyed = true;
    soundManager.stopPacmanMusic();
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('keydown', this.boundKeyDown);
    this.container.innerHTML = '';
  }

  private bindEvents(): void {
    window.addEventListener('keydown', this.boundKeyDown);

    const backBtn = this.container.querySelector('#pacman-back-btn');
    backBtn?.addEventListener('click', () => {
      this.destroy();
      this.onBack();
    });

    this.diffBtn?.addEventListener('click', () => {
      soundManager.play('click');
      const current = this.engine.getDifficulty();
      const next: PacmanDifficulty =
        current === 'easy' ? 'normal' : current === 'normal' ? 'hard' : 'easy';
      this.engine.setDifficulty(next);
      this.saveDifficulty(next);
      this.updateDiffButtonLabel();
    });

    const pauseBtn = this.container.querySelector('#pacman-pause-btn');
    pauseBtn?.addEventListener('click', () => {
      this.togglePause();
    });

    // Controles táctiles virtuales D-Pad
    const touchUp = this.container.querySelector('#pacman-touch-up');
    const touchDown = this.container.querySelector('#pacman-touch-down');
    const touchLeft = this.container.querySelector('#pacman-touch-left');
    const touchRight = this.container.querySelector('#pacman-touch-right');

    const handleTouchDir = (dir: PacmanDirection, e: Event): void => {
      e.preventDefault();
      const status = this.engine.getStatus();
      if (status === 'READY') {
        this.engine.start();
        soundManager.startPacmanMusic();
        this.hideOverlay();
      }
      this.engine.setDirection(dir);
    };

    touchUp?.addEventListener('touchstart', (e) => handleTouchDir('UP', e));
    touchDown?.addEventListener('touchstart', (e) => handleTouchDir('DOWN', e));
    touchLeft?.addEventListener('touchstart', (e) => handleTouchDir('LEFT', e));
    touchRight?.addEventListener('touchstart', (e) => handleTouchDir('RIGHT', e));

    touchUp?.addEventListener('click', (e) => handleTouchDir('UP', e));
    touchDown?.addEventListener('click', (e) => handleTouchDir('DOWN', e));
    touchLeft?.addEventListener('click', (e) => handleTouchDir('LEFT', e));
    touchRight?.addEventListener('click', (e) => handleTouchDir('RIGHT', e));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      e.preventDefault();
      this.setDirection('UP');
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      e.preventDefault();
      this.setDirection('DOWN');
    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      this.setDirection('LEFT');
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      e.preventDefault();
      this.setDirection('RIGHT');
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      this.handleActionClick();
    } else if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      this.togglePause();
    }
  }

  private setDirection(dir: PacmanDirection): void {
    const status = this.engine.getStatus();
    if (status === 'READY') {
      this.engine.start();
      soundManager.startPacmanMusic();
      this.hideOverlay();
    }
    this.engine.setDirection(dir);
  }

  private handleActionClick(): void {
    const status = this.engine.getStatus();
    if (status === 'READY') {
      this.engine.start();
      soundManager.startPacmanMusic();
      this.hideOverlay();
    } else if (status === 'PAUSED') {
      this.togglePause();
    } else if (status === 'VICTORY') {
      this.engine.nextLevel();
      soundManager.startPacmanMusic();
      this.hideOverlay();
    } else if (status === 'GAME_OVER') {
      this.engine.resetGame();
      this.engine.start();
      soundManager.startPacmanMusic();
      this.hideOverlay();
    }
  }

  private togglePause(): void {
    const currentStatus = this.engine.getStatus();
    if (currentStatus === 'READY' || currentStatus === 'GAME_OVER' || currentStatus === 'VICTORY') {
      return;
    }

    this.engine.togglePause();
    if (this.engine.getStatus() === 'PAUSED') {
      soundManager.stopPacmanMusic();
      this.showPausedOverlay();
    } else {
      soundManager.startPacmanMusic();
      this.hideOverlay();
    }
  }

  private startGameLoop(): void {
    this.lastFrameTime = performance.now();

    const loop = (currentTime: number): void => {
      if (this.isDestroyed) {
        return;
      }

      const elapsed = Math.min(currentTime - this.lastFrameTime, 100);
      this.lastFrameTime = currentTime;

      this.engine.tick(elapsed);
      const snap = this.engine.getSnapshot();

      this.render(snap);
      this.updateHud(snap);

      if (snap.status === 'GAME_OVER' && this.overlayEl.style.display !== 'flex') {
        soundManager.stopPacmanMusic();
        this.saveHighScore(snap.highScore);
        this.showGameOverOverlay();
      } else if (snap.status === 'VICTORY' && this.overlayEl.style.display !== 'flex') {
        soundManager.stopPacmanMusic();
        this.saveHighScore(snap.highScore);
        this.showVictoryOverlay();
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  private render(snap: PacmanSnapshot): void {
    const { cols, rows, tileSize } = DEFAULT_PACMAN_CONFIG;
    this.ctx.clearRect(0, 0, cols * tileSize, rows * tileSize);

    // Fondo carbón oscuro
    this.ctx.fillStyle = '#0a0d14';
    this.ctx.fillRect(0, 0, cols * tileSize, rows * tileSize);

    this.renderMaze(tileSize);
    this.renderPacman(snap.pacman, tileSize);
    this.renderGhosts(snap.ghosts, tileSize, snap.frightenedTimerMs);
  }

  private renderMaze(tileSize: number): void {
    const grid = this.engine.getGrid();

    for (let r = 0; r < grid.length; r++) {
      const row = grid[r];
      if (!row) continue;
      for (let c = 0; c < row.length; c++) {
        const tile = row[c];
        const x = c * tileSize;
        const y = r * tileSize;

        if (tile === 1) {
          // Muro neón
          this.ctx.save();
          this.ctx.fillStyle = '#0f172a';
          this.ctx.strokeStyle = '#00d9c4';
          this.ctx.lineWidth = 2;
          this.ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
          this.ctx.strokeRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
          this.ctx.restore();
        } else if (tile === 2) {
          // Pellet
          this.ctx.save();
          this.ctx.fillStyle = '#fff275';
          this.ctx.shadowColor = 'rgba(255, 242, 117, 0.7)';
          this.ctx.shadowBlur = 5;
          this.ctx.beginPath();
          this.ctx.arc(x + tileSize / 2, y + tileSize / 2, 3.5, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.restore();
        } else if (tile === 3) {
          // Energizer pulsante
          this.ctx.save();
          const pulse = (Math.sin(performance.now() * 0.008) + 1) * 0.5;
          const radius = 6 + pulse * 3;
          this.ctx.fillStyle = '#fffae0';
          this.ctx.shadowColor = '#00f59b';
          this.ctx.shadowBlur = 12;
          this.ctx.beginPath();
          this.ctx.arc(x + tileSize / 2, y + tileSize / 2, radius, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.restore();
        } else if (tile === 4) {
          // Puerta de la casa de fantasmas
          this.ctx.save();
          this.ctx.strokeStyle = '#ff007f';
          this.ctx.lineWidth = 3;
          this.ctx.beginPath();
          this.ctx.moveTo(x, y + tileSize / 2);
          this.ctx.lineTo(x + tileSize, y + tileSize / 2);
          this.ctx.stroke();
          this.ctx.restore();
        }
      }
    }
  }

  private renderPacman(
    pac: { x: number; y: number; dir: PacmanDirection; mouthAngle: number },
    tileSize: number
  ): void {
    const cx = pac.x * tileSize + tileSize / 2;
    const cy = pac.y * tileSize + tileSize / 2;
    const radius = tileSize * 0.44;

    let rotation = 0;
    if (pac.dir === 'RIGHT') rotation = 0;
    else if (pac.dir === 'DOWN') rotation = Math.PI * 0.5;
    else if (pac.dir === 'LEFT') rotation = Math.PI;
    else if (pac.dir === 'UP') rotation = Math.PI * 1.5;

    const mouth = Math.abs(Math.sin(pac.mouthAngle)) * 0.25 * Math.PI;

    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(rotation);

    this.ctx.fillStyle = '#00f59b';
    this.ctx.shadowColor = 'rgba(0, 245, 155, 0.7)';
    this.ctx.shadowBlur = 10;

    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, mouth, Math.PI * 2 - mouth);
    this.ctx.lineTo(0, 0);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  private renderGhosts(ghosts: readonly Ghost[], tileSize: number, frightenedMs: number): void {
    ghosts.forEach((ghost) => {
      const cx = ghost.x * tileSize + tileSize / 2;
      const cy = ghost.y * tileSize + tileSize / 2;
      const r = tileSize * 0.42;

      this.ctx.save();
      this.ctx.translate(cx, cy);

      let bodyColor = ghost.color;
      if (ghost.state === 'frightened') {
        const flash = frightenedMs < 2000 && Math.floor(performance.now() / 200) % 2 === 0;
        bodyColor = flash ? '#ffffff' : '#2563eb';
      } else if (ghost.state === 'eaten') {
        bodyColor = 'transparent';
      }

      if (ghost.state !== 'eaten') {
        this.ctx.fillStyle = bodyColor;
        this.ctx.shadowColor = bodyColor;
        this.ctx.shadowBlur = 8;

        // Cabeza semiesférica y cuerpo
        this.ctx.beginPath();
        this.ctx.arc(0, -3, r, Math.PI, 0, false);
        this.ctx.lineTo(r, r);
        // Falda ondulada
        this.ctx.lineTo(r * 0.5, r - 4);
        this.ctx.lineTo(0, r);
        this.ctx.lineTo(-r * 0.5, r - 4);
        this.ctx.lineTo(-r, r);
        this.ctx.closePath();
        this.ctx.fill();
      }

      // Ojos
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(-r * 0.4, -r * 0.2, r * 0.28, 0, Math.PI * 2);
      this.ctx.arc(r * 0.4, -r * 0.2, r * 0.28, 0, Math.PI * 2);
      this.ctx.fill();

      // Pupilas
      let pupilDx = 0;
      let pupilDy = 0;
      if (ghost.dir === 'LEFT') pupilDx = -2;
      if (ghost.dir === 'RIGHT') pupilDx = 2;
      if (ghost.dir === 'UP') pupilDy = -2;
      if (ghost.dir === 'DOWN') pupilDy = 2;

      this.ctx.fillStyle = '#0a0d14';
      this.ctx.beginPath();
      this.ctx.arc(-r * 0.4 + pupilDx, -r * 0.2 + pupilDy, r * 0.15, 0, Math.PI * 2);
      this.ctx.arc(r * 0.4 + pupilDx, -r * 0.2 + pupilDy, r * 0.15, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    });
  }

  private updateHud(snap: PacmanSnapshot): void {
    if (this.scoreEl) {
      this.scoreEl.textContent = snap.score.toString();
    }
    if (this.highScoreEl) {
      this.highScoreEl.textContent = snap.highScore.toString();
    }
    if (this.levelEl) {
      this.levelEl.textContent = snap.level.toString();
    }
    if (this.livesEl) {
      const yellowDots = '🟡 '.repeat(Math.max(0, snap.lives)).trim();
      this.livesEl.textContent = yellowDots || '💀';
    }
  }

  private showReadyOverlay(): void {
    this.overlayEl.innerHTML = `
      <div class="overlay-card">
        <h3 class="overlay-title">PAC-MAN</h3>
        <p class="overlay-desc">Devora todos los puntos del laberinto mientras evitas a los 4 fantasmas. ¡Usa las pildoras de energía para contraatacar!</p>
        <button id="pacman-action-btn" class="btn-play-game" aria-label="Comenzar partida de Pac-Man">
          COMENZAR &rarr;
        </button>
      </div>
    `;
    this.overlayEl.style.display = 'flex';
    this.bindOverlayButton();
  }

  private showPausedOverlay(): void {
    this.overlayEl.innerHTML = `
      <div class="overlay-card">
        <h3 class="overlay-title">PARTIDA EN PAUSA</h3>
        <p class="overlay-desc">Pausa táctica activa. Pulsa Reanudar o la tecla [P].</p>
        <button id="pacman-action-btn" class="btn-play-game" aria-label="Reanudar Pac-Man">
          REANUDAR
        </button>
      </div>
    `;
    this.overlayEl.style.display = 'flex';
    this.bindOverlayButton();
  }

  private showVictoryOverlay(): void {
    this.overlayEl.innerHTML = `
      <div class="overlay-card">
        <h3 class="overlay-title text-accent-green">¡LABERINTO COMPLETADO!</h3>
        <p class="overlay-desc">Has devorado todos los puntos. Prepárate para el siguiente sector.</p>
        <button id="pacman-action-btn" class="btn-play-game" aria-label="Siguiente nivel">
          SIGUIENTE NIVEL &rarr;
        </button>
      </div>
    `;
    this.overlayEl.style.display = 'flex';
    this.bindOverlayButton();
  }

  private showGameOverOverlay(): void {
    this.overlayEl.innerHTML = `
      <div class="overlay-card">
        <h3 class="overlay-title" style="color: var(--color-accent-pink, #ff0055);">FIN DE PARTIDA</h3>
        <p class="overlay-desc">Puntuación alcanzada: <strong>${this.engine.getScore()}</strong> puntos.</p>
        <button id="pacman-action-btn" class="btn-play-game" aria-label="Reintentar Pac-Man">
          JUGAR DE NUEVO &rarr;
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
    const btn = this.overlayEl.querySelector('#pacman-action-btn');
    btn?.addEventListener('click', () => {
      this.handleActionClick();
    });
  }

  private loadHighScore(): number {
    try {
      const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      const saved = storage?.getItem(HIGH_SCORE_KEY);
      const parsed = saved ? parseInt(saved, 10) : 0;
      return Number.isNaN(parsed) ? 0 : parsed;
    } catch {
      return 0;
    }
  }

  private saveHighScore(score: number): void {
    try {
      const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      storage?.setItem(HIGH_SCORE_KEY, score.toString());
    } catch {
      // Ignorar
    }
  }

  private loadDifficulty(): PacmanDifficulty {
    try {
      const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      const saved = storage?.getItem(DIFFICULTY_STORAGE_KEY);
      if (saved === 'easy' || saved === 'normal' || saved === 'hard') {
        return saved;
      }
    } catch {
      // Ignorar
    }
    return 'normal';
  }

  private saveDifficulty(diff: PacmanDifficulty): void {
    try {
      const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      storage?.setItem(DIFFICULTY_STORAGE_KEY, diff);
    } catch {
      // Ignorar
    }
  }

  private updateDiffButtonLabel(): void {
    if (!this.diffBtn) {
      return;
    }
    const diff = this.engine.getDifficulty();
    const map: Record<PacmanDifficulty, string> = {
      easy: 'Fácil',
      normal: 'Normal',
      hard: 'Difícil'
    };
    this.diffBtn.textContent = `Dificultad: ${map[diff]}`;
  }

  private getTemplateHtml(): string {
    const html = `
      <section class="pacman-game-wrapper" aria-label="Juego Pac-Man">
        <div class="pacman-inner-container">
          <div class="pacman-top-bar game-top-bar">
            <button id="pacman-back-btn" class="snake-back-btn game-top-btn" aria-label="Volver al catálogo principal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Volver al Catálogo</span>
            </button>
            <div class="snake-hud game-hud">
              <div class="hud-item">
                <span class="hud-label">PUNTOS</span>
                <span id="pacman-score" class="hud-value">0</span>
              </div>
              <div class="hud-item hud-lives-item">
                <span class="hud-label">VIDAS</span>
                <span id="pacman-lives" class="hud-value hud-lives-value">🟡 🟡 🟡</span>
              </div>
              <div class="hud-item">
                <span class="hud-label">NIVEL</span>
                <span id="pacman-level" class="hud-value text-accent-turquoise">1</span>
              </div>
              <div class="hud-item">
                <span class="hud-label">RÉCORD</span>
                <span id="pacman-highscore" class="hud-value text-accent-turquoise">0</span>
              </div>
            </div>
            <div class="space-actions-bar game-actions-bar">
              <button id="pacman-pause-btn" class="hud-btn game-top-btn" aria-label="Pausar o reanudar Pac-Man">
                Pausa [P]
              </button>
            </div>
          </div>

          <div class="pacman-canvas-box">
            <canvas id="pacman-canvas" width="570" height="630" aria-label="Pantalla de Pac-Man"></canvas>
            <div id="pacman-overlay" class="snake-overlay"></div>
          </div>

          <div class="pacman-touch-controls" aria-label="Controles táctiles de Pac-Man">
            <button id="pacman-touch-up" class="pong-touch-btn" aria-label="Mover hacia arriba">▲</button>
            <div style="display: flex; gap: 16px;">
              <button id="pacman-touch-left" class="pong-touch-btn" aria-label="Mover hacia la izquierda">◀</button>
              <button id="pacman-touch-down" class="pong-touch-btn" aria-label="Mover hacia abajo">▼</button>
              <button id="pacman-touch-right" class="pong-touch-btn" aria-label="Mover hacia la derecha">▶</button>
            </div>
          </div>

          <div class="snake-hints">
            <span>Controles: <strong>Flechas / WASD</strong> para moverte &middot; <strong>P</strong> para pausa</span>
          </div>
        </div>
      </section>
    `;
    return html;
  }
}
