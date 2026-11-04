// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Vista y renderizado Canvas HTML5 vectorial para Asteroids.
 * @spec REQ-54, REQ-55
 */

import { AsteroidsEngine, DEFAULT_ASTEROIDS_CONFIG } from '../engine/AsteroidsEngine.js';
import type {
  Asteroid,
  AsteroidsDifficulty,
  AsteroidsSnapshot,
  Bullet,
  Particle
} from '../types.js';
import { soundManager } from '../../../common/audio/SoundEffects.js';

const HIGH_SCORE_KEY = 'guacamolegh_asteroids_highscore';
const DIFFICULTY_STORAGE_KEY = 'guacamolegh_asteroids_diff';

export class AsteroidsView {
  private container: HTMLElement;
  private engine: AsteroidsEngine;
  private onBack: () => void;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  private scoreEl!: HTMLElement;
  private livesEl!: HTMLElement;
  private waveEl!: HTMLElement;
  private highScoreEl!: HTMLElement;
  private overlayEl!: HTMLElement;
  private diffBtn!: HTMLButtonElement;

  private animationFrameId: number | null = null;
  private isDestroyed: boolean = false;
  private lastFrameTime: number = 0;

  private isKeyLeftPressed: boolean = false;
  private isKeyRightPressed: boolean = false;

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;

  constructor(container: HTMLElement, onBack: () => void) {
    this.container = container;
    this.onBack = onBack;

    const savedHighScore = this.loadHighScore();
    const savedDiff = this.loadDifficulty();
    this.engine = new AsteroidsEngine(undefined, savedHighScore, savedDiff);

    this.engine.onSoundEvent = (event) => {
      if (event === 'laser') {
        soundManager.play('laser');
      } else if (event === 'bounce') {
        soundManager.play('bounce');
      } else if (event === 'die') {
        soundManager.play('die');
      } else if (event === 'win') {
        soundManager.play('win');
      }
    };

    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
  }

  /**
   * Monta la interfaz del juego en el contenedor.
   * @spec REQ-55
   */
  public mount(): void {
    this.container.innerHTML = this.getTemplateHtml();

    this.canvas = this.container.querySelector('#asteroids-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    this.scoreEl = this.container.querySelector('#asteroids-score') as HTMLElement;
    this.livesEl = this.container.querySelector('#asteroids-lives') as HTMLElement;
    this.waveEl = this.container.querySelector('#asteroids-wave') as HTMLElement;
    this.highScoreEl = this.container.querySelector('#asteroids-highscore') as HTMLElement;
    this.overlayEl = this.container.querySelector('#asteroids-overlay') as HTMLElement;
    this.diffBtn = this.container.querySelector('#asteroids-diff-btn') as HTMLButtonElement;

    this.bindEvents();
    this.updateDiffButtonLabel();
    this.updateHud(this.engine.getSnapshot());
    this.showReadyOverlay();

    this.startGameLoop();
  }

  /**
   * Desmonta y destruye la vista liberando recursos.
   * @spec REQ-53
   */
  public destroy(): void {
    this.isDestroyed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    this.container.innerHTML = '';
  }

  private bindEvents(): void {
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);

    const backBtn = this.container.querySelector('#asteroids-back-btn');
    backBtn?.addEventListener('click', () => {
      this.destroy();
      this.onBack();
    });

    this.diffBtn?.addEventListener('click', () => {
      soundManager.play('click');
      const current = this.engine.getDifficulty();
      const next: AsteroidsDifficulty =
        current === 'easy'
          ? 'normal'
          : current === 'normal'
            ? 'hard'
            : current === 'hard'
              ? 'extreme'
              : 'easy';
      this.engine.setDifficulty(next);
      this.saveDifficulty(next);
      this.engine.resetGame();
      this.updateDiffButtonLabel();
      this.updateHud(this.engine.getSnapshot());
      this.showReadyOverlay();
    });

    const pauseBtn = this.container.querySelector('#asteroids-pause-btn');
    pauseBtn?.addEventListener('click', () => {
      this.togglePause();
    });

    // Controles táctiles virtuales
    const touchLeft = this.container.querySelector('#asteroids-touch-left');
    const touchThrust = this.container.querySelector('#asteroids-touch-thrust');
    const touchRight = this.container.querySelector('#asteroids-touch-right');
    const touchFire = this.container.querySelector('#asteroids-touch-fire');

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

    touchThrust?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.engine.setThrust(true);
    });
    touchThrust?.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.engine.setThrust(false);
    });

    touchFire?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleActionClick();
    });
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      this.isKeyLeftPressed = true;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      e.preventDefault();
      this.isKeyRightPressed = true;
    } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      e.preventDefault();
      this.engine.setThrust(true);
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      if (!e.repeat) {
        this.handleActionClick();
      }
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
    } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      this.engine.setThrust(false);
    }
  }

  private handleActionClick(): void {
    const status = this.engine.getStatus();
    if (status === 'READY') {
      this.engine.start();
      this.hideOverlay();
    } else if (status === 'PLAYING') {
      this.engine.fire();
    } else if (status === 'PAUSED') {
      this.togglePause();
    } else if (status === 'VICTORY') {
      this.engine.nextWave();
      this.hideOverlay();
    } else if (status === 'GAME_OVER') {
      this.engine.resetGame();
      this.engine.start();
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
      this.showPausedOverlay();
    } else {
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

      if (this.isKeyLeftPressed) {
        this.engine.rotateShip('LEFT', elapsed);
      }
      if (this.isKeyRightPressed) {
        this.engine.rotateShip('RIGHT', elapsed);
      }

      this.engine.tick(elapsed);
      const snap = this.engine.getSnapshot();

      this.render(snap);
      this.updateHud(snap);

      if (snap.status === 'GAME_OVER' && this.overlayEl.style.display !== 'flex') {
        this.saveHighScore(snap.highScore);
        this.showGameOverOverlay();
      } else if (snap.status === 'VICTORY' && this.overlayEl.style.display !== 'flex') {
        this.saveHighScore(snap.highScore);
        this.showVictoryOverlay();
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  private render(snap: AsteroidsSnapshot): void {
    const { virtualWidth, virtualHeight } = DEFAULT_ASTEROIDS_CONFIG;
    this.ctx.clearRect(0, 0, virtualWidth, virtualHeight);

    // Fondo espacio profundo
    this.ctx.fillStyle = '#0a0d14';
    this.ctx.fillRect(0, 0, virtualWidth, virtualHeight);

    this.renderAsteroids(snap.asteroids);
    this.renderBullets(snap.bullets);
    this.renderParticles(snap.particles);
    this.renderShip(snap.ship);
  }

  private renderShip(ship: AsteroidsSnapshot['ship']): void {
    if (ship.isInvulnerable && Math.floor(performance.now() / 100) % 2 === 0) {
      return; // Efecto parpadeo de invulnerabilidad
    }

    this.ctx.save();
    this.ctx.translate(ship.x, ship.y);
    this.ctx.rotate(ship.rotation);

    this.ctx.strokeStyle = '#00f59b';
    this.ctx.lineWidth = 2;
    this.ctx.shadowColor = '#00f59b';
    this.ctx.shadowBlur = 8;

    // Cuerpo de la nave (triángulo estilizado)
    this.ctx.beginPath();
    this.ctx.moveTo(ship.radius, 0); // Punta frontal
    this.ctx.lineTo(-ship.radius, -ship.radius * 0.7);
    this.ctx.lineTo(-ship.radius * 0.5, 0);
    this.ctx.lineTo(-ship.radius, ship.radius * 0.7);
    this.ctx.closePath();
    this.ctx.stroke();

    // Llama del propulsor
    if (ship.isThrusting) {
      this.ctx.strokeStyle = '#ff9f1c';
      this.ctx.shadowColor = '#ff9f1c';
      this.ctx.beginPath();
      this.ctx.moveTo(-ship.radius * 0.5, -ship.radius * 0.35);
      this.ctx.lineTo(-ship.radius * 1.5, 0);
      this.ctx.lineTo(-ship.radius * 0.5, ship.radius * 0.35);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  private renderBullets(bullets: readonly Bullet[]): void {
    this.ctx.save();
    this.ctx.fillStyle = '#ffe600';
    this.ctx.shadowColor = '#ffe600';
    this.ctx.shadowBlur = 6;

    for (const b of bullets) {
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  private renderAsteroids(asteroids: readonly Asteroid[]): void {
    this.ctx.save();
    this.ctx.strokeStyle = '#00d9c4';
    this.ctx.lineWidth = 2;
    this.ctx.shadowColor = 'rgba(0, 217, 196, 0.4)';
    this.ctx.shadowBlur = 6;

    for (const ast of asteroids) {
      this.ctx.save();
      this.ctx.translate(ast.x, ast.y);
      this.ctx.rotate(ast.rotation);

      const pts = ast.points;
      const count = pts.length;
      this.ctx.beginPath();

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const radMult = pts[i] ?? 1;
        const r = ast.radius * radMult;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) {
          this.ctx.moveTo(px, py);
        } else {
          this.ctx.lineTo(px, py);
        }
      }

      this.ctx.closePath();
      this.ctx.stroke();
      this.ctx.restore();
    }

    this.ctx.restore();
  }

  private renderParticles(particles: readonly Particle[]): void {
    for (const p of particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(p.x, p.y, 2, 2);
      this.ctx.restore();
    }
  }

  private updateHud(snap: AsteroidsSnapshot): void {
    if (this.scoreEl) {
      this.scoreEl.textContent = snap.score.toString();
    }
    if (this.highScoreEl) {
      this.highScoreEl.textContent = snap.highScore.toString();
    }
    if (this.waveEl) {
      this.waveEl.textContent = snap.wave.toString();
    }
    if (this.livesEl) {
      const shipIcons = '🚀 '.repeat(Math.max(0, snap.lives)).trim();
      this.livesEl.textContent = shipIcons || '💀';
    }
  }

  private showReadyOverlay(): void {
    this.overlayEl.innerHTML = `
      <div class="overlay-card">
        <h3 class="overlay-title">ASTEROIDS</h3>
        <p class="overlay-desc">Pilota tu nave en el vacío espacial. Destruye los asteroides y sobrevive a las oleadas consecutivas.</p>
        <button id="asteroids-action-btn" class="btn-play-game" aria-label="Comenzar partida de Asteroids">
          DESPEGAR &rarr;
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
        <p class="overlay-desc">Propulsores en reposo. Pulsa Reanudar o la tecla [P].</p>
        <button id="asteroids-action-btn" class="btn-play-game" aria-label="Reanudar Asteroids">
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
        <h3 class="overlay-title text-accent-green">¡SECTOR DESPEJADO!</h3>
        <p class="overlay-desc">Todos los asteroides han sido destruidos. Prepárate para la siguiente oleada.</p>
        <button id="asteroids-action-btn" class="btn-play-game" aria-label="Siguiente oleada">
          SIGUIENTE OLEADA &rarr;
        </button>
      </div>
    `;
    this.overlayEl.style.display = 'flex';
    this.bindOverlayButton();
  }

  private showGameOverOverlay(): void {
    this.overlayEl.innerHTML = `
      <div class="overlay-card">
        <h3 class="overlay-title" style="color: var(--color-accent-pink, #ff0055);">NAVE DESTRUIDA</h3>
        <p class="overlay-desc">Puntuación alcanzada: <strong>${this.engine.getScore()}</strong> puntos.</p>
        <button id="asteroids-action-btn" class="btn-play-game" aria-label="Reintentar Asteroids">
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
    const btn = this.overlayEl.querySelector('#asteroids-action-btn');
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

  private loadDifficulty(): AsteroidsDifficulty {
    try {
      const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      const saved = storage?.getItem(DIFFICULTY_STORAGE_KEY);
      if (saved === 'easy' || saved === 'normal' || saved === 'hard' || saved === 'extreme') {
        return saved;
      }
    } catch {
      // Ignorar
    }
    return 'normal';
  }

  private saveDifficulty(diff: AsteroidsDifficulty): void {
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
    const map: Record<AsteroidsDifficulty, string> = {
      easy: 'Fácil',
      normal: 'Normal',
      hard: 'Difícil',
      extreme: 'Extremo'
    };
    this.diffBtn.textContent = `Dificultad: ${map[diff]}`;
  }

  private getTemplateHtml(): string {
    const html = `
      <section class="space-game-wrapper" aria-label="Juego Asteroids">
        <div class="space-inner-container">
          <div class="space-top-bar game-top-bar">
            <button id="asteroids-back-btn" class="snake-back-btn game-top-btn" aria-label="Volver al catálogo principal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Volver al Catálogo</span>
            </button>
            <div class="snake-hud game-hud">
              <div class="hud-item">
                <span class="hud-label">PUNTOS</span>
                <span id="asteroids-score" class="hud-value">0</span>
              </div>
              <div class="hud-item">
                <span class="hud-label">VIDAS</span>
                <span id="asteroids-lives" class="hud-value" style="font-size: 0.9375rem;">🚀 🚀 🚀</span>
              </div>
              <div class="hud-item">
                <span class="hud-label">OLEADA</span>
                <span id="asteroids-wave" class="hud-value text-accent-turquoise">1</span>
              </div>
              <div class="hud-item">
                <span class="hud-label">RÉCORD</span>
                <span id="asteroids-highscore" class="hud-value text-accent-turquoise">0</span>
              </div>
            </div>
            <div class="space-actions-bar game-actions-bar">
              <button id="asteroids-diff-btn" class="hud-btn game-top-btn" aria-label="Cambiar dificultad de Asteroids">
                Dificultad: Normal
              </button>
              <button id="asteroids-pause-btn" class="hud-btn game-top-btn" aria-label="Pausar o reanudar Asteroids">
                Pausa [P]
              </button>
            </div>
          </div>

          <div class="space-canvas-box">
            <canvas id="asteroids-canvas" width="800" height="600" aria-label="Pantalla de Asteroids"></canvas>
            <div id="asteroids-overlay" class="snake-overlay"></div>
          </div>

          <div class="space-touch-controls" aria-label="Controles táctiles de Asteroids">
            <button id="asteroids-touch-left" class="pong-touch-btn" aria-label="Girar izquierda">◀ GIRAR</button>
            <button id="asteroids-touch-thrust" class="pong-touch-btn" aria-label="Empuje">▲ EMPUJE</button>
            <button id="asteroids-touch-right" class="pong-touch-btn" aria-label="Girar derecha">GIRAR ▶</button>
            <button id="asteroids-touch-fire" class="pong-touch-btn btn-play-game" aria-label="Disparar">🚀 FUEGO</button>
          </div>

          <div class="snake-hints">
            <span>Controles: <strong>Flechas / A-D</strong> para girar &middot; <strong>Arriba / W</strong> empuje &middot; <strong>Espacio</strong> disparar &middot; <strong>P</strong> pausa</span>
          </div>
        </div>
      </section>
    `;
    return html;
  }
}
