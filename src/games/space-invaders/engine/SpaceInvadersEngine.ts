// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Motor cinemático y lógico desacoplado para Space Invaders.
 * @spec REQ-43, REQ-44, REQ-45
 */

import type {
  PlayerCannon,
  Invader,
  InvaderType,
  Bullet,
  Bunker,
  BunkerCell,
  Ufo,
  SpaceInvadersConfig,
  SpaceInvadersSnapshot,
  SpaceInvadersGameStatus,
  SpaceInvadersDifficulty
} from '../types.js';

export const DEFAULT_SPACE_INVADERS_CONFIG: SpaceInvadersConfig = {
  virtualWidth: 800,
  virtualHeight: 600,
  playerWidth: 48,
  playerHeight: 22,
  playerSpeed: 7.5,
  playerBulletSpeed: 9.0,
  invaderBulletSpeed: 4.5,
  bulletWidth: 3,
  bulletHeight: 12,
  invaderRows: 5,
  invaderCols: 11,
  invaderWidth: 32,
  invaderHeight: 22,
  invaderPaddingX: 14,
  invaderPaddingY: 14,
  invaderOffsetTop: 70,
  bunkerCount: 4,
  initialLives: 3,
  baseMarchIntervalMs: 700
};

export class SpaceInvadersEngine {
  public onSoundEvent?: (
    event: 'laser' | 'step' | 'invader_hit' | 'shield_hit' | 'die' | 'win' | 'lose' | 'ufo'
  ) => void;

  private config: SpaceInvadersConfig;
  private player!: PlayerCannon;
  private invaders: Invader[] = [];
  private bullets: Bullet[] = [];
  private bunkers: Bunker[] = [];
  private ufo!: Ufo;

  private score: number = 0;
  private lives: number = 3;
  private highScore: number = 0;
  private wave: number = 1;
  private status: SpaceInvadersGameStatus = 'READY';
  private difficulty: SpaceInvadersDifficulty = 'normal';

  private invaderDirection: number = 1; // 1 = derecha, -1 = izquierda
  private marchTimerMs: number = 0;
  private enemyFireTimerMs: number = 0;
  private ufoTimerMs: number = 0;
  private animFrameState: number = 0;

  constructor(
    customConfig?: Partial<SpaceInvadersConfig>,
    initialHighScore: number = 0,
    initialDifficulty: SpaceInvadersDifficulty = 'normal'
  ) {
    this.config = {
      virtualWidth: customConfig?.virtualWidth ?? DEFAULT_SPACE_INVADERS_CONFIG.virtualWidth,
      virtualHeight: customConfig?.virtualHeight ?? DEFAULT_SPACE_INVADERS_CONFIG.virtualHeight,
      playerWidth: customConfig?.playerWidth ?? DEFAULT_SPACE_INVADERS_CONFIG.playerWidth,
      playerHeight: customConfig?.playerHeight ?? DEFAULT_SPACE_INVADERS_CONFIG.playerHeight,
      playerSpeed: customConfig?.playerSpeed ?? DEFAULT_SPACE_INVADERS_CONFIG.playerSpeed,
      playerBulletSpeed:
        customConfig?.playerBulletSpeed ?? DEFAULT_SPACE_INVADERS_CONFIG.playerBulletSpeed,
      invaderBulletSpeed:
        customConfig?.invaderBulletSpeed ?? DEFAULT_SPACE_INVADERS_CONFIG.invaderBulletSpeed,
      bulletWidth: customConfig?.bulletWidth ?? DEFAULT_SPACE_INVADERS_CONFIG.bulletWidth,
      bulletHeight: customConfig?.bulletHeight ?? DEFAULT_SPACE_INVADERS_CONFIG.bulletHeight,
      invaderRows: customConfig?.invaderRows ?? DEFAULT_SPACE_INVADERS_CONFIG.invaderRows,
      invaderCols: customConfig?.invaderCols ?? DEFAULT_SPACE_INVADERS_CONFIG.invaderCols,
      invaderWidth: customConfig?.invaderWidth ?? DEFAULT_SPACE_INVADERS_CONFIG.invaderWidth,
      invaderHeight: customConfig?.invaderHeight ?? DEFAULT_SPACE_INVADERS_CONFIG.invaderHeight,
      invaderPaddingX: customConfig?.invaderPaddingX ?? DEFAULT_SPACE_INVADERS_CONFIG.invaderPaddingX,
      invaderPaddingY: customConfig?.invaderPaddingY ?? DEFAULT_SPACE_INVADERS_CONFIG.invaderPaddingY,
      invaderOffsetTop:
        customConfig?.invaderOffsetTop ?? DEFAULT_SPACE_INVADERS_CONFIG.invaderOffsetTop,
      bunkerCount: customConfig?.bunkerCount ?? DEFAULT_SPACE_INVADERS_CONFIG.bunkerCount,
      initialLives: customConfig?.initialLives ?? DEFAULT_SPACE_INVADERS_CONFIG.initialLives,
      baseMarchIntervalMs:
        customConfig?.baseMarchIntervalMs ?? DEFAULT_SPACE_INVADERS_CONFIG.baseMarchIntervalMs
    };

    this.highScore = Math.max(0, initialHighScore);
    this.setDifficulty(initialDifficulty);
    this.reset();
  }

  /**
   * Modifica la dificultad del juego modulando velocidades y cadencias.
   * @spec REQ-45
   */
  public setDifficulty(diff: SpaceInvadersDifficulty): void {
    this.difficulty = diff;
    if (diff === 'easy') {
      this.config.playerSpeed = 7.5;
      this.config.playerBulletSpeed = 9.5;
      this.config.invaderBulletSpeed = 3.5;
      this.config.baseMarchIntervalMs = 850;
    } else if (diff === 'hard') {
      this.config.playerSpeed = 8.5;
      this.config.playerBulletSpeed = 9.5;
      this.config.invaderBulletSpeed = 6.0;
      this.config.baseMarchIntervalMs = 500;
    } else if (diff === 'extreme') {
      this.config.playerSpeed = 10.0;
      this.config.playerBulletSpeed = 11.5;
      this.config.invaderBulletSpeed = 8.5;
      this.config.baseMarchIntervalMs = 300;
    } else {
      this.config.playerSpeed = 8.0;
      this.config.playerBulletSpeed = 9.0;
      this.config.invaderBulletSpeed = 4.5;
      this.config.baseMarchIntervalMs = 680;
    }

    if (this.player) {
      this.player.speed = this.config.playerSpeed;
    }
  }

  /**
   * Retorna la dificultad configurada.
   * @spec REQ-45
   */
  public getDifficulty(): SpaceInvadersDifficulty {
    const d = this.difficulty;
    return d;
  }

  /**
   * Retorna la configuración inmutable del motor.
   * @spec REQ-44, REQ-45
   */
  public getConfig(): Readonly<SpaceInvadersConfig> {
    const cfg = { ...this.config };
    return cfg;
  }

  /**
   * Reinicia la partida al estado inicial con todas las naves e invasores.
   * @spec REQ-44
   */
  public reset(): void {
    this.score = 0;
    this.lives = this.config.initialLives;
    this.wave = 1;
    this.status = 'READY';
    this.invaderDirection = 1;
    this.marchTimerMs = 0;
    this.enemyFireTimerMs = 0;
    this.ufoTimerMs = 0;
    this.animFrameState = 0;
    this.bullets = [];

    this.initPlayer();
    this.initInvaders();
    this.initBunkers();
    this.initUfo();
  }

  /**
   * Inicia o reanuda la partida.
   * @spec REQ-44
   */
  public start(): void {
    if (this.status === 'GAME_OVER' || this.status === 'VICTORY') {
      this.reset();
    }
    this.status = 'PLAYING';
  }

  /**
   * Pausa o despausa la partida.
   * @spec REQ-44
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
   * Avanza a la siguiente oleada de invasores tras la victoria.
   * @spec REQ-44
   */
  public nextWave(): void {
    this.wave += 1;
    this.bullets = [];
    this.invaderDirection = 1;
    this.marchTimerMs = 0;
    this.enemyFireTimerMs = 0;
    this.initInvaders();
    this.status = 'PLAYING';
  }

  /**
   * Desplaza el cañón hacia la izquierda.
   * @spec REQ-44
   */
  public moveLeft(): void {
    this.player.x = Math.max(12, this.player.x - this.player.speed);
  }

  /**
   * Desplaza el cañón hacia la derecha.
   * @spec REQ-44
   */
  public moveRight(): void {
    this.player.x = Math.min(
      this.config.virtualWidth - this.player.width - 12,
      this.player.x + this.player.speed
    );
  }

  /**
   * Posiciona el cañón de forma absoluta en un punto horizontal X.
   * @spec REQ-44
   */
  public setPlayerPosition(centerX: number): void {
    const half = this.player.width / 2;
    const clampedX = Math.max(
      12,
      Math.min(this.config.virtualWidth - this.player.width - 12, centerX - half)
    );
    this.player.x = clampedX;
  }

  /**
   * Dispara un proyectil del cañón defensor si no hay proyectiles excedentes en pantalla.
   * @spec REQ-44
   */
  public fire(): boolean {
    if (this.status !== 'PLAYING') {
      return false;
    }

    const maxPlayerBullets = this.difficulty === 'extreme' ? 2 : 1;
    const activePlayerBullets = this.bullets.filter((b) => b.fromPlayer).length;
    if (activePlayerBullets >= maxPlayerBullets) {
      return false;
    }

    const bx = this.player.x + this.player.width / 2 - this.config.bulletWidth / 2;
    const by = this.player.y - this.config.bulletHeight - 2;

    this.bullets.push({
      id: `p_bullet_${Date.now()}_${Math.random()}`,
      x: bx,
      y: by,
      width: this.config.bulletWidth,
      height: this.config.bulletHeight,
      vy: -this.config.playerBulletSpeed,
      fromPlayer: true
    });

    this.onSoundEvent?.('laser');
    return true;
  }

  /**
   * Ejecuta un paso de simulación cinemática y lógica.
   * @spec REQ-44
   * @param dt Segundos transcurridos en el paso.
   */
  public tick(dt: number = 0.016): SpaceInvadersSnapshot {
    if (this.status !== 'PLAYING') {
      const snap = this.getSnapshot();
      return snap;
    }

    const dtMs = dt * 1000;

    // 1. Actualizar marcha de los invasores
    this.updateInvadersMarch(dtMs);

    // 2. Fuego enemigo aleatorio
    this.updateEnemyFire(dtMs);

    // 3. Actualizar nave misteriosa UFO
    this.updateUfo(dtMs);

    // 4. Mover proyectiles
    this.updateBullets();

    // 5. Detección de colisiones
    this.handleCollisions();

    // 6. Verificar condición de invasión terrestre (aliens tocan suelo)
    this.checkGroundInvasion();

    const snapshot = this.getSnapshot();
    return snapshot;
  }

  /**
   * Retorna una instantánea inmutable del estado actual.
   * @spec REQ-44
   */
  public getSnapshot(): SpaceInvadersSnapshot {
    const aliveCount = this.bullets ? this.invaders.filter((i) => i.isAlive).length : 0;
    const snapshot: SpaceInvadersSnapshot = {
      player: { ...this.player },
      invaders: this.invaders.map((i) => ({ ...i })),
      bullets: this.bullets.map((b) => ({ ...b })),
      bunkers: this.bunkers.map((b) => ({
        ...b,
        cells: b.cells.map((c) => ({ ...c }))
      })),
      ufo: { ...this.ufo },
      score: this.score,
      lives: this.lives,
      highScore: this.highScore,
      wave: this.wave,
      status: this.status,
      difficulty: this.difficulty,
      remainingInvaders: aliveCount,
      totalInvaders: this.invaders.length
    };
    return snapshot;
  }

  public getStatus(): SpaceInvadersGameStatus {
    const s = this.status;
    return s;
  }

  public getScore(): number {
    const sc = this.score;
    return sc;
  }

  public getLives(): number {
    const lv = this.lives;
    return lv;
  }

  // Métodos de inicialización interna
  private initPlayer(): void {
    const px = (this.config.virtualWidth - this.config.playerWidth) / 2;
    const py = this.config.virtualHeight - 48;
    this.player = {
      x: px,
      y: py,
      width: this.config.playerWidth,
      height: this.config.playerHeight,
      speed: this.config.playerSpeed
    };
  }

  private initInvaders(): void {
    this.invaders = [];
    const waveOffset = Math.min(80, (this.wave - 1) * 12);
    const startY = this.config.invaderOffsetTop + waveOffset;

    const fleetWidth =
      this.config.invaderCols * this.config.invaderWidth +
      (this.config.invaderCols - 1) * this.config.invaderPaddingX;
    const startX = Math.floor((this.config.virtualWidth - fleetWidth) / 2);

    for (let r = 0; r < this.config.invaderRows; r += 1) {
      let type: InvaderType = 'octopus';
      let points = 10;
      if (r === 0) {
        type = 'squid';
        points = 30;
      } else if (r === 1 || r === 2) {
        type = 'crab';
        points = 20;
      }

      for (let c = 0; c < this.config.invaderCols; c += 1) {
        const x = startX + c * (this.config.invaderWidth + this.config.invaderPaddingX);
        const y = startY + r * (this.config.invaderHeight + this.config.invaderPaddingY);

        this.invaders.push({
          id: `invader_${r}_${c}`,
          row: r,
          col: c,
          x,
          y,
          width: this.config.invaderWidth,
          height: this.config.invaderHeight,
          type,
          points,
          isAlive: true,
          animFrame: 0
        });
      }
    }
  }

  private initBunkers(): void {
    this.bunkers = [];
    const count = this.config.bunkerCount;
    const bunkerWidth = 64;
    const bunkerHeight = 44;
    const bunkerY = this.config.virtualHeight - 135;

    const spacing = this.config.virtualWidth / (count + 1);

    for (let b = 0; b < count; b += 1) {
      const bx = Math.floor(spacing * (b + 1) - bunkerWidth / 2);
      const cells: BunkerCell[] = [];

      // Estructura clásica de búnker en 4 columnas x 3 filas
      const cellW = bunkerWidth / 4; // 16px
      const cellH = bunkerHeight / 3; // ~14.6px

      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 4; col += 1) {
          // El hueco central inferior crea el arco protector
          if (row === 2 && (col === 1 || col === 2)) {
            continue;
          }
          // Las esquinas superiores recortadas dan la forma redondeada retro
          if (row === 0 && (col === 0 || col === 3)) {
            continue;
          }

          cells.push({
            x: bx + col * cellW,
            y: bunkerY + row * cellH,
            width: cellW,
            height: cellH,
            health: 3
          });
        }
      }

      this.bunkers.push({
        id: `bunker_${b}`,
        x: bx,
        y: bunkerY,
        width: bunkerWidth,
        height: bunkerHeight,
        cells
      });
    }
  }

  private initUfo(): void {
    this.ufo = {
      x: -60,
      y: 38,
      width: 48,
      height: 20,
      speed: 3.5,
      points: 200,
      isActive: false
    };
  }

  private updateInvadersMarch(dtMs: number): void {
    this.marchTimerMs += dtMs;

    const aliveInvaders = this.invaders.filter((i) => i.isAlive);
    if (aliveInvaders.length === 0) {
      this.status = 'VICTORY';
      this.onSoundEvent?.('win');
      return;
    }

    // El intervalo de marcha se acelera a medida que caen invasores
    const ratio = aliveInvaders.length / this.invaders.length;
    const currentInterval = Math.max(65, this.config.baseMarchIntervalMs * ratio);

    if (this.marchTimerMs < currentInterval) {
      return;
    }

    this.marchTimerMs = 0;
    this.animFrameState = this.animFrameState === 0 ? 1 : 0;

    const marchStepX = 12;
    const dropDistance = 16;

    // Comprobar si algún invasor tocará los bordes laterales
    let mustDropAndReverse = false;
    for (const inv of aliveInvaders) {
      const nextX = inv.x + this.invaderDirection * marchStepX;
      if (nextX <= 14 || nextX + inv.width >= this.config.virtualWidth - 14) {
        mustDropAndReverse = true;
        break;
      }
    }

    if (mustDropAndReverse) {
      this.invaderDirection = -this.invaderDirection;
      for (const inv of aliveInvaders) {
        inv.y += dropDistance;
        inv.animFrame = this.animFrameState;
      }
    } else {
      for (const inv of aliveInvaders) {
        inv.x += this.invaderDirection * marchStepX;
        inv.animFrame = this.animFrameState;
      }
    }

    this.onSoundEvent?.('step');
  }

  private updateEnemyFire(dtMs: number): void {
    this.enemyFireTimerMs += dtMs;
    const fireInterval =
      this.difficulty === 'extreme'
        ? 650
        : this.difficulty === 'hard'
          ? 950
          : this.difficulty === 'easy'
            ? 1800
            : 1300;

    if (this.enemyFireTimerMs < fireInterval) {
      return;
    }
    this.enemyFireTimerMs = 0;

    // Buscar el invasor más bajo en cada columna activa
    const aliveInvaders = this.invaders.filter((i) => i.isAlive);
    if (aliveInvaders.length === 0) {
      return;
    }

    const lowestByCol: Record<number, Invader> = {};
    for (const inv of aliveInvaders) {
      const existing = lowestByCol[inv.col];
      if (!existing || inv.row > existing.row) {
        lowestByCol[inv.col] = inv;
      }
    }

    const candidates = Object.values(lowestByCol);
    if (candidates.length === 0) {
      return;
    }

    const shooter = candidates[Math.floor(Math.random() * candidates.length)]!;
    this.bullets.push({
      id: `e_bullet_${Date.now()}_${Math.random()}`,
      x: shooter.x + shooter.width / 2 - this.config.bulletWidth / 2,
      y: shooter.y + shooter.height + 2,
      width: this.config.bulletWidth,
      height: this.config.bulletHeight,
      vy: this.config.invaderBulletSpeed,
      fromPlayer: false
    });
  }

  private updateUfo(dtMs: number): void {
    if (this.ufo.isActive) {
      this.ufo.x += this.ufo.speed;
      if (this.ufo.x > this.config.virtualWidth + 50) {
        this.ufo.isActive = false;
      }
      return;
    }

    this.ufoTimerMs += dtMs;
    // La nave nodriza aparece cada ~25 segundos
    if (this.ufoTimerMs >= 24000) {
      this.ufoTimerMs = 0;
      this.ufo.x = -this.ufo.width;
      this.ufo.isActive = true;
      const ptsPool = [100, 150, 200, 300];
      this.ufo.points = ptsPool[Math.floor(Math.random() * ptsPool.length)]!;
      this.onSoundEvent?.('ufo');
    }
  }

  private updateBullets(): void {
    const retained: Bullet[] = [];
    for (const b of this.bullets) {
      b.y += b.vy;
      // Descartar proyectiles fuera de pantalla
      if (b.y + b.height >= 0 && b.y <= this.config.virtualHeight) {
        retained.push(b);
      }
    }
    this.bullets = retained;
  }

  private handleCollisions(): void {
    const toRemoveBullets = new Set<string>();

    // 1. Proyectil jugador vs Proyectil alienígena (se cancelan)
    const playerBullets = this.bullets.filter((b) => b.fromPlayer);
    const alienBullets = this.bullets.filter((b) => !b.fromPlayer);

    for (const pb of playerBullets) {
      if (toRemoveBullets.has(pb.id)) {
        continue;
      }
      for (const ab of alienBullets) {
        if (toRemoveBullets.has(ab.id)) {
          continue;
        }
        if (this.isAABBIntersecting(pb, ab)) {
          toRemoveBullets.add(pb.id);
          toRemoveBullets.add(ab.id);
          this.onSoundEvent?.('shield_hit');
          break;
        }
      }
    }

    // 2. Proyectiles vs Búnkeres
    for (const b of this.bullets) {
      if (toRemoveBullets.has(b.id)) {
        continue;
      }

      for (const bunker of this.bunkers) {
        for (const cell of bunker.cells) {
          if (cell.health > 0 && this.isAABBIntersecting(b, cell)) {
            cell.health -= 1;
            toRemoveBullets.add(b.id);
            this.onSoundEvent?.('shield_hit');
            break;
          }
        }
        if (toRemoveBullets.has(b.id)) {
          break;
        }
      }
    }

    // 3. Proyectil jugador vs Invasores
    for (const pb of playerBullets) {
      if (toRemoveBullets.has(pb.id)) {
        continue;
      }

      for (const inv of this.invaders) {
        if (inv.isAlive && this.isAABBIntersecting(pb, inv)) {
          inv.isAlive = false;
          toRemoveBullets.add(pb.id);
          this.score += inv.points;
          if (this.score > this.highScore) {
            this.highScore = this.score;
          }
          this.onSoundEvent?.('invader_hit');

          const hasAliveInvaders = this.invaders.some((i) => i.isAlive);
          if (!hasAliveInvaders) {
            this.status = 'VICTORY';
            this.onSoundEvent?.('win');
          }
          break;
        }
      }
    }

    // 4. Proyectil jugador vs OVNI / UFO
    if (this.ufo.isActive) {
      for (const pb of playerBullets) {
        if (toRemoveBullets.has(pb.id)) {
          continue;
        }
        if (this.isAABBIntersecting(pb, this.ufo)) {
          this.ufo.isActive = false;
          toRemoveBullets.add(pb.id);
          this.score += this.ufo.points;
          if (this.score > this.highScore) {
            this.highScore = this.score;
          }
          this.onSoundEvent?.('win');
          break;
        }
      }
    }

    // 5. Proyectil alienígena vs Cañón del Jugador
    for (const ab of alienBullets) {
      if (toRemoveBullets.has(ab.id)) {
        continue;
      }
      if (this.isAABBIntersecting(ab, this.player)) {
        toRemoveBullets.add(ab.id);
        this.lives -= 1;
        this.onSoundEvent?.('die');

        if (this.lives <= 0) {
          this.lives = 0;
          this.status = 'GAME_OVER';
          this.onSoundEvent?.('lose');
        } else {
          // Reposicionar cañón
          this.initPlayer();
        }
        break;
      }
    }

    // Filtrar los proyectiles destruidos
    this.bullets = this.bullets.filter((b) => !toRemoveBullets.has(b.id));

    // 6. Invasores vivos arrasan celdas de búnker si las pisan
    for (const inv of this.invaders) {
      if (!inv.isAlive) {
        continue;
      }
      for (const bunker of this.bunkers) {
        for (const cell of bunker.cells) {
          if (cell.health > 0 && this.isAABBIntersecting(inv, cell)) {
            cell.health = 0;
          }
        }
      }
    }
  }

  private checkGroundInvasion(): void {
    if (this.status !== 'PLAYING') {
      return;
    }

    for (const inv of this.invaders) {
      if (inv.isAlive && inv.y + inv.height >= this.player.y) {
        this.status = 'GAME_OVER';
        this.lives = 0;
        this.onSoundEvent?.('lose');
        return;
      }
    }
  }

  private isAABBIntersecting(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
  ): boolean {
    const hit =
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y;
    return hit;
  }

  // Métodos de asistencia para pruebas unitarias
  public setInvadersForTesting(invaders: Invader[]): void {
    this.invaders = invaders;
  }

  public setBulletsForTesting(bullets: Bullet[]): void {
    this.bullets = bullets;
  }

  public setPlayerForTesting(x: number, y: number): void {
    this.player.x = x;
    this.player.y = y;
  }

  public setBunkersForTesting(bunkers: Bunker[]): void {
    this.bunkers = bunkers;
  }

  public setUfoForTesting(ufo: Ufo): void {
    this.ufo = ufo;
  }

  public forceMarchForTesting(): void {
    this.marchTimerMs = 999999;
    this.updateInvadersMarch(0);
  }
}
