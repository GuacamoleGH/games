// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Vista y renderizado en Canvas HTML5 para Space Invaders.
 * @spec REQ-45, REQ-46, REQ-47
 */

import {
  SpaceInvadersEngine,
  DEFAULT_SPACE_INVADERS_CONFIG
} from '../engine/SpaceInvadersEngine.js';
import type {
  SpaceInvadersSnapshot,
  SpaceInvadersDifficulty,
  Invader,
  Bunker,
  Bullet
} from '../types.js';
import { soundManager } from '../../../common/audio/SoundEffects.js';

const HIGH_SCORE_KEY = 'guacamolegh_spaceinvaders_highscore';
const DIFFICULTY_STORAGE_KEY = 'guacamolegh_spaceinvaders_diff';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
  life: number;
}

export class SpaceInvadersView {
  private container: HTMLElement;
  private engine: SpaceInvadersEngine;
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
  private timeAccumulator: number = 0;
  private readonly TICK_DURATION_MS: number = 1000 / 60; // 60 Hz fijo

  private isKeyLeftPressed: boolean = false;
  private isKeyRightPressed: boolean = false;

  private particles: Particle[] = [];

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private boundMouseMove: (e: MouseEvent) => void;
  private boundTouchMove: (e: TouchEvent) => void;

  constructor(container: HTMLElement, onBack: () => void) {
    this.container = container;
    this.onBack = onBack;

    const savedHighScore = this.loadHighScore();
    const savedDiff = this.loadDifficulty();
    this.engine = new SpaceInvadersEngine(undefined, savedHighScore, savedDiff);

    this.engine.onSoundEvent = (event) => {
      if (event === 'laser') {
        soundManager.play('laser');
      } else if (event === 'step') {
        soundManager.play('step');
      } else if (event === 'invader_hit') {
        soundManager.play('eat');
      } else if (event === 'shield_hit') {
        soundManager.play('bounce');
      } else if (event === 'die') {
        soundManager.play('die');
      } else if (event === 'win') {
        soundManager.play('win');
      } else if (event === 'lose') {
        soundManager.play('lose');
      } else if (event === 'ufo') {
        soundManager.play('tetris');
      }
    };

    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundTouchMove = this.handleTouchMove.bind(this);
  }

  /**
   * Monta la interfaz del juego en el contenedor.
   * @spec REQ-46
   */
  public mount(): void {
    this.container.innerHTML = this.getTemplateHtml();

    this.canvas = this.container.querySelector('#space-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    this.scoreEl = this.container.querySelector('#space-score') as HTMLElement;
    this.livesEl = this.container.querySelector('#space-lives') as HTMLElement;
    this.waveEl = this.container.querySelector('#space-wave') as HTMLElement;
    this.highScoreEl = this.container.querySelector('#space-highscore') as HTMLElement;
    this.overlayEl = this.container.querySelector('#space-overlay') as HTMLElement;
    this.diffBtn = this.container.querySelector('#space-diff-btn') as HTMLButtonElement;

    this.bindEvents();
    this.updateDiffButtonLabel();
    this.updateHud(this.engine.getSnapshot());
    this.showReadyOverlay();

    this.startGameLoop();
  }

  /**
   * Desmonta y destruye la vista liberando eventos y animación.
   * @spec REQ-43
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

  private bindEvents(): void {
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    this.canvas.addEventListener('mousemove', this.boundMouseMove);
    this.canvas.addEventListener('touchmove', this.boundTouchMove, { passive: false });

    // Volver al catálogo
    const backBtn = this.container.querySelector('#space-back-btn');
    backBtn?.addEventListener('click', () => {
      this.destroy();
      this.onBack();
    });

    // Botón dificultad en HUD
    this.diffBtn?.addEventListener('click', () => {
      soundManager.play('click');
      const current = this.engine.getDifficulty();
      const next: SpaceInvadersDifficulty =
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
    const pauseBtn = this.container.querySelector('#space-pause-btn');
    pauseBtn?.addEventListener('click', () => {
      this.togglePause();
    });

    // Controles táctiles virtuales
    const touchLeft = this.container.querySelector('#space-touch-left');
    const touchRight = this.container.querySelector('#space-touch-right');
    const touchFire = this.container.querySelector('#space-touch-fire');

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

    touchFire?.addEventListener('click', (e) => {
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
    if (this.engine.getStatus() !== 'PLAYING') {
      return;
    }
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = DEFAULT_SPACE_INVADERS_CONFIG.virtualWidth / rect.width;
    const canvasX = (e.clientX - rect.left) * scaleX;
    this.engine.setPlayerPosition(canvasX);
  }

  private handleTouchMove(e: TouchEvent): void {
    if (this.engine.getStatus() !== 'PLAYING') {
      return;
    }
    const touch = e.touches[0];
    if (!touch) {
      return;
    }
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = DEFAULT_SPACE_INVADERS_CONFIG.virtualWidth / rect.width;
    const canvasX = (touch.clientX - rect.left) * scaleX;
    this.engine.setPlayerPosition(canvasX);
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
      this.engine.reset();
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
    this.timeAccumulator = 0;

    const loop = (currentTime: number): void => {
      if (this.isDestroyed) {
        return;
      }

      const elapsed = currentTime - this.lastFrameTime;
      this.lastFrameTime = currentTime;

      // Limitar acumulación para evitar espirales tras pausas de pestaña
      this.timeAccumulator += Math.min(elapsed, 100);

      while (this.timeAccumulator >= this.TICK_DURATION_MS) {
        this.stepSimulation();
        this.timeAccumulator -= this.TICK_DURATION_MS;
      }

      this.render();
      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  private stepSimulation(): void {
    if (this.engine.getStatus() === 'PLAYING') {
      if (this.isKeyLeftPressed) {
        this.engine.moveLeft();
      }
      if (this.isKeyRightPressed) {
        this.engine.moveRight();
      }

      const prevAlive = this.engine.getSnapshot().remainingInvaders;
      const prevLives = this.engine.getSnapshot().lives;
      const snapshot = this.engine.tick(this.TICK_DURATION_MS / 1000);

      // Partículas al abatir invasores
      if (snapshot.remainingInvaders < prevAlive) {
        this.spawnExplosionParticles(400, 200, '#ff0055');
      }
      // Partículas al ser impactado el cañón
      if (snapshot.lives < prevLives) {
        this.spawnExplosionParticles(snapshot.player.x + 24, snapshot.player.y + 10, '#00f59b');
      }

      this.updateHud(snapshot);

      if (snapshot.status === 'VICTORY') {
        this.showVictoryOverlay();
      } else if (snapshot.status === 'GAME_OVER') {
        this.saveHighScore(snapshot.highScore);
        this.showGameOverOverlay();
      }
    }

    this.updateParticles();
  }

  private render(): void {
    if (!this.ctx || !this.canvas) {
      return;
    }

    const { virtualWidth, virtualHeight } = DEFAULT_SPACE_INVADERS_CONFIG;
    const snap = this.engine.getSnapshot();

    // Fondo oscuro espacial
    this.ctx.fillStyle = '#0a0d14';
    this.ctx.fillRect(0, 0, virtualWidth, virtualHeight);

    // Línea base defensiva verde
    this.ctx.strokeStyle = 'rgba(0, 245, 155, 0.25)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, virtualHeight - 20);
    this.ctx.lineTo(virtualWidth, virtualHeight - 20);
    this.ctx.stroke();

    // 1. Renderizar búnkeres
    this.renderBunkers(snap.bunkers);

    // 2. Renderizar invasores
    this.renderInvaders(snap.invaders);

    // 3. Renderizar nave nodriza misteriosa (UFO)
    if (snap.ufo.isActive) {
      this.renderUfo(snap.ufo);
    }

    // 4. Renderizar proyectiles
    this.renderBullets(snap.bullets);

    // 5. Renderizar cañón del jugador
    this.renderPlayer(snap.player);

    // 6. Renderizar partículas
    this.renderParticles();
  }

  private renderPlayer(player: { x: number; y: number; width: number; height: number }): void {
    const { x, y, width, height } = player;
    this.ctx.save();
    this.ctx.fillStyle = '#00f59b';
    this.ctx.shadowColor = 'rgba(0, 245, 155, 0.6)';
    this.ctx.shadowBlur = 10;

    // Base del tanque
    this.ctx.fillRect(x + 4, y + 10, width - 8, height - 10);
    // Casco intermedio
    this.ctx.fillRect(x + 12, y + 4, width - 24, 6);
    // Cañón superior
    this.ctx.fillRect(x + width / 2 - 2, y, 4, 6);

    this.ctx.restore();
  }

  private renderInvaders(invaders: readonly Invader[]): void {
    for (const inv of invaders) {
      if (!inv.isAlive) {
        continue;
      }
      this.ctx.save();
      const { x, y, width, height, type, animFrame } = inv;

      if (type === 'squid') {
        this.ctx.fillStyle = '#ff007f';
        this.ctx.shadowColor = 'rgba(255, 0, 127, 0.4)';
        this.ctx.shadowBlur = 8;
        // Cabeza
        this.ctx.fillRect(x + 8, y + 2, width - 16, height - 10);
        // Ojos
        this.ctx.fillStyle = '#0a0d14';
        this.ctx.fillRect(x + 10, y + 6, 3, 3);
        this.ctx.fillRect(x + width - 13, y + 6, 3, 3);
        // Tentáculos alternados según animación
        this.ctx.fillStyle = '#ff007f';
        if (animFrame === 0) {
          this.ctx.fillRect(x + 6, y + height - 8, 4, 8);
          this.ctx.fillRect(x + width - 10, y + height - 8, 4, 8);
          this.ctx.fillRect(x + width / 2 - 2, y + height - 6, 4, 6);
        } else {
          this.ctx.fillRect(x + 2, y + height - 6, 4, 6);
          this.ctx.fillRect(x + width - 6, y + height - 6, 4, 6);
          this.ctx.fillRect(x + 10, y + height - 8, 4, 8);
          this.ctx.fillRect(x + width - 14, y + height - 8, 4, 8);
        }
      } else if (type === 'crab') {
        this.ctx.fillStyle = '#ff9f1c';
        this.ctx.shadowColor = 'rgba(255, 159, 28, 0.4)';
        this.ctx.shadowBlur = 8;
        // Cuerpo principal
        this.ctx.fillRect(x + 4, y + 4, width - 8, height - 10);
        // Ojos
        this.ctx.fillStyle = '#0a0d14';
        this.ctx.fillRect(x + 8, y + 8, 4, 3);
        this.ctx.fillRect(x + width - 12, y + 8, 4, 3);
        // Pinzas / patas
        this.ctx.fillStyle = '#ff9f1c';
        if (animFrame === 0) {
          this.ctx.fillRect(x, y + 2, 4, 6);
          this.ctx.fillRect(x + width - 4, y + 2, 4, 6);
          this.ctx.fillRect(x + 4, y + height - 6, 4, 6);
          this.ctx.fillRect(x + width - 8, y + height - 6, 4, 6);
        } else {
          this.ctx.fillRect(x, y + 8, 4, 6);
          this.ctx.fillRect(x + width - 4, y + 8, 4, 6);
          this.ctx.fillRect(x + 8, y + height - 6, 4, 6);
          this.ctx.fillRect(x + width - 12, y + height - 6, 4, 6);
        }
      } else {
        // Octopus
        this.ctx.fillStyle = '#00d9c4';
        this.ctx.shadowColor = 'rgba(0, 217, 196, 0.4)';
        this.ctx.shadowBlur = 8;
        // Cuerpo
        this.ctx.fillRect(x + 4, y + 2, width - 8, height - 8);
        // Ojos
        this.ctx.fillStyle = '#0a0d14';
        this.ctx.fillRect(x + 8, y + 6, 4, 4);
        this.ctx.fillRect(x + width - 12, y + 6, 4, 4);
        // Patas
        this.ctx.fillStyle = '#00d9c4';
        if (animFrame === 0) {
          this.ctx.fillRect(x + 2, y + height - 6, 5, 6);
          this.ctx.fillRect(x + width - 7, y + height - 6, 5, 6);
          this.ctx.fillRect(x + 11, y + height - 4, width - 22, 4);
        } else {
          this.ctx.fillRect(x + 6, y + height - 6, 4, 6);
          this.ctx.fillRect(x + width - 10, y + height - 6, 4, 6);
          this.ctx.fillRect(x + 12, y + height - 6, width - 24, 6);
        }
      }

      this.ctx.restore();
    }
  }

  private renderBunkers(bunkers: readonly Bunker[]): void {
    for (const b of bunkers) {
      for (const cell of b.cells) {
        if (cell.health <= 0) {
          continue;
        }

        this.ctx.save();
        if (cell.health === 3) {
          this.ctx.fillStyle = '#00f59b';
        } else if (cell.health === 2) {
          this.ctx.fillStyle = '#ffe600';
        } else {
          this.ctx.fillStyle = '#ff0055';
        }

        this.ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
        this.ctx.restore();
      }
    }
  }

  private renderUfo(ufo: { x: number; y: number; width: number; height: number }): void {
    this.ctx.save();
    this.ctx.fillStyle = '#ff0055';
    this.ctx.shadowColor = 'rgba(255, 0, 85, 0.8)';
    this.ctx.shadowBlur = 12;

    // Disco platillo
    this.ctx.fillRect(ufo.x + 8, ufo.y + 6, ufo.width - 16, ufo.height - 8);
    this.ctx.fillRect(ufo.x + 4, ufo.y + 10, ufo.width - 8, 4);
    // Cúpula superior
    this.ctx.fillStyle = '#ffe600';
    this.ctx.fillRect(ufo.x + ufo.width / 2 - 6, ufo.y + 2, 12, 4);

    this.ctx.restore();
  }

  private renderBullets(bullets: readonly Bullet[]): void {
    for (const b of bullets) {
      this.ctx.save();
      if (b.fromPlayer) {
        this.ctx.fillStyle = '#00f59b';
        this.ctx.shadowColor = '#00f59b';
        this.ctx.shadowBlur = 8;
        this.ctx.fillRect(b.x, b.y, b.width, b.height);
      } else {
        this.ctx.fillStyle = '#ff0055';
        this.ctx.shadowColor = '#ff0055';
        this.ctx.shadowBlur = 8;
        this.ctx.fillRect(b.x, b.y, b.width, b.height);
      }
      this.ctx.restore();
    }
  }

  private spawnExplosionParticles(x: number, y: number, color: string): void {
    for (let i = 0; i < 8; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.5 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        radius: Math.random() * 2 + 1,
        alpha: 1,
        life: 1
      });
    }
  }

  private updateParticles(): void {
    const retained: Particle[] = [];
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.04;
      p.life -= 0.04;
      if (p.life > 0 && p.alpha > 0) {
        retained.push(p);
      }
    }
    this.particles = retained;
  }

  private renderParticles(): void {
    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  private updateHud(snap: SpaceInvadersSnapshot): void {
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
      const hearts = '🚀 '.repeat(Math.max(0, snap.lives)).trim();
      this.livesEl.textContent = hearts || '💀';
    }
  }

  private showReadyOverlay(): void {
    this.overlayEl.innerHTML = `
      <div class="overlay-card">
        <h3 class="overlay-title">SPACE INVADERS</h3>
        <p class="overlay-desc">Defiende la Tierra del asalto alienígena. Destruye la flota antes de que aterrice.</p>
        <button id="space-action-btn" class="btn-play-game" aria-label="Comenzar partida de Space Invaders">
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
        <p class="overlay-desc">Pausa táctica activa. Pulsa Reanudar o la tecla [P].</p>
        <button id="space-action-btn" class="btn-play-game" aria-label="Reanudar Space Invaders">
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
        <h3 class="overlay-title text-accent-green">¡OLEADA SUPERADA!</h3>
        <p class="overlay-desc">Has erradicado la flota invasora. Prepárate para el siguiente sector.</p>
        <button id="space-action-btn" class="btn-play-game" aria-label="Siguiente oleada">
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
        <h3 class="overlay-title" style="color: var(--color-accent-pink, #ff0055);">INVASIÓN COMPLETADA</h3>
        <p class="overlay-desc">Puntuación alcanzada: <strong>${this.engine.getScore()}</strong> puntos.</p>
        <button id="space-action-btn" class="btn-play-game" aria-label="Reintentar Space Invaders">
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
    const btn = this.overlayEl.querySelector('#space-action-btn');
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
      // Ignorar
    }
  }

  private loadDifficulty(): SpaceInvadersDifficulty {
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

  private saveDifficulty(diff: SpaceInvadersDifficulty): void {
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
    const map: Record<SpaceInvadersDifficulty, string> = {
      easy: 'Fácil',
      normal: 'Normal',
      hard: 'Difícil',
      extreme: 'Extremo'
    };
    this.diffBtn.textContent = `Dificultad: ${map[diff]}`;
  }

  private getTemplateHtml(): string {
    const html = `
      <section class="space-game-wrapper" aria-label="Juego Space Invaders">
        <div class="space-inner-container">
          <div class="space-top-bar">
            <button id="space-back-btn" class="snake-back-btn" aria-label="Volver al catálogo principal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Volver al Catálogo</span>
            </button>
            <div class="snake-hud">
              <div class="hud-item">
                <span class="hud-label">PUNTOS</span>
                <span id="space-score" class="hud-value">0</span>
              </div>
              <div class="hud-item">
                <span class="hud-label">VIDAS</span>
                <span id="space-lives" class="hud-value" style="font-size: 0.9375rem;">🚀 🚀 🚀</span>
              </div>
              <div class="hud-item">
                <span class="hud-label">SECTOR</span>
                <span id="space-wave" class="hud-value text-accent-turquoise">1</span>
              </div>
              <div class="hud-item">
                <span class="hud-label">RÉCORD</span>
                <span id="space-highscore" class="hud-value text-accent-turquoise">0</span>
              </div>
            </div>
            <div class="space-actions-bar">
              <button id="space-diff-btn" class="hud-btn" aria-label="Cambiar dificultad de Space Invaders">
                Dificultad: Normal
              </button>
              <button id="space-pause-btn" class="hud-btn" aria-label="Pausar o reanudar Space Invaders">
                Pausa [P]
              </button>
            </div>
          </div>

          <div class="space-canvas-box">
            <canvas id="space-canvas" width="800" height="600" aria-label="Pantalla de Space Invaders"></canvas>
            <div id="space-overlay" class="snake-overlay"></div>
          </div>

          <div class="space-touch-controls" aria-label="Controles táctiles de Space Invaders">
            <button id="space-touch-left" class="pong-touch-btn" aria-label="Mover a la izquierda">◀ IZQUIERDA</button>
            <button id="space-touch-fire" class="pong-touch-btn btn-play-game" aria-label="Disparar cañón">🚀 DISPARAR</button>
            <button id="space-touch-right" class="pong-touch-btn" aria-label="Mover a la derecha">DERECHA ▶</button>
          </div>

          <div class="snake-hints">
            <span>Controles: <strong>Flechas / A-D</strong> o <strong>Ratón</strong> para mover el cañón &middot; <strong>Espacio</strong> para disparar &middot; <strong>P</strong> para pausa</span>
          </div>
        </div>
      </section>
    `;
    return html;
  }
}
