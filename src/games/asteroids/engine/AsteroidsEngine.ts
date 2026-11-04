// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Motor físico vectorial puro para el juego Asteroids.
 * @spec REQ-54
 */

import type {
  Asteroid,
  AsteroidsConfig,
  AsteroidsDifficulty,
  AsteroidSize,
  AsteroidsSnapshot,
  Bullet,
  GameStatus,
  Particle,
  Ship
} from '../types.js';

export const DEFAULT_ASTEROIDS_CONFIG: AsteroidsConfig = Object.freeze({
  virtualWidth: 800,
  virtualHeight: 600,
  initialLives: 3,
  rotationSpeed: 4.2, // rad/s
  thrustAccel: 320, // px/s^2
  friction: 0.985,
  bulletSpeed: 550, // px/s
  bulletLifeMs: 1200
});

export class AsteroidsEngine {
  private config: AsteroidsConfig;
  private status: GameStatus = 'READY';
  private score: number = 0;
  private highScore: number = 0;
  private lives: number;
  private wave: number = 1;
  private difficulty: AsteroidsDifficulty;

  private ship: Ship = {
    x: 400,
    y: 300,
    vx: 0,
    vy: 0,
    rotation: -Math.PI / 2, // Apuntando hacia arriba
    radius: 14,
    isThrusting: false,
    invulnerableTimerMs: 2500
  };

  private bullets: Bullet[] = [];
  private asteroids: Asteroid[] = [];
  private particles: Particle[] = [];
  private nextEntityId: number = 1;
  private fireCooldownMs: number = 0;

  public onSoundEvent?: (event: 'laser' | 'bounce' | 'die' | 'win') => void;

  constructor(
    config: Partial<AsteroidsConfig> = {},
    highScore: number = 0,
    difficulty: AsteroidsDifficulty = 'normal'
  ) {
    this.config = { ...DEFAULT_ASTEROIDS_CONFIG, ...config };
    this.highScore = highScore;
    this.difficulty = difficulty;
    this.lives = this.getDifficultyInitialLives();
    this.spawnWave(this.wave);
  }

  public start(): void {
    if (this.status === 'READY' || this.status === 'PAUSED') {
      this.status = 'PLAYING';
    }
  }

  public togglePause(): void {
    if (this.status === 'PLAYING') {
      this.status = 'PAUSED';
    } else if (this.status === 'PAUSED') {
      this.status = 'PLAYING';
    }
  }

  public resetGame(): void {
    this.score = 0;
    this.lives = this.getDifficultyInitialLives();
    this.wave = 1;
    this.status = 'READY';
    this.bullets = [];
    this.particles = [];
    this.resetShip(true);
    this.spawnWave(this.wave);
  }

  public resetShip(centered: boolean = false): void {
    this.ship = {
      x: centered ? this.config.virtualWidth / 2 : this.ship.x,
      y: centered ? this.config.virtualHeight / 2 : this.ship.y,
      vx: 0,
      vy: 0,
      rotation: -Math.PI / 2,
      radius: 14,
      isThrusting: false,
      invulnerableTimerMs: this.getDifficultyInvulnerableTime()
    };
  }

  public rotateShip(direction: 'LEFT' | 'RIGHT', deltaMs: number): void {
    if (this.status !== 'PLAYING') return;
    const deltaSec = deltaMs / 1000;
    const sign = direction === 'LEFT' ? -1 : 1;
    this.ship.rotation += sign * this.config.rotationSpeed * deltaSec;
  }

  public setThrust(isThrusting: boolean): void {
    this.ship.isThrusting = isThrusting;
  }

  public fire(): boolean {
    if (this.status !== 'PLAYING') {
      return false;
    }
    if (this.fireCooldownMs > 0 || this.bullets.length >= 6) {
      return false;
    }

    this.fireCooldownMs = this.getDifficultyFireCooldown();
    const noseX = this.ship.x + Math.cos(this.ship.rotation) * this.ship.radius;
    const noseY = this.ship.y + Math.sin(this.ship.rotation) * this.ship.radius;

    const bvx = this.ship.vx * 0.4 + Math.cos(this.ship.rotation) * this.config.bulletSpeed;
    const bvy = this.ship.vy * 0.4 + Math.sin(this.ship.rotation) * this.config.bulletSpeed;

    this.bullets.push({
      id: this.nextEntityId++,
      x: noseX,
      y: noseY,
      vx: bvx,
      vy: bvy,
      lifeMs: this.config.bulletLifeMs
    });

    if (this.onSoundEvent) {
      this.onSoundEvent('laser');
    }
    return true;
  }

  public spawnWave(waveNum: number): void {
    this.asteroids = [];
    const count = this.getDifficultyAsteroidCount(waveNum);
    const speedMult = this.getDifficultySpeedMultiplier();

    for (let i = 0; i < count; i++) {
      let x = 0;
      let y = 0;
      let dist = 0;

      // Generar lejos de la nave
      do {
        x = Math.random() * this.config.virtualWidth;
        y = Math.random() * this.config.virtualHeight;
        dist = Math.hypot(x - this.ship.x, y - this.ship.y);
      } while (dist < 150);

      const angle = Math.random() * Math.PI * 2;
      const speed = (30 + Math.random() * 40) * speedMult;

      this.asteroids.push(this.createAsteroid(x, y, 'large', angle, speed));
    }
  }

  private createAsteroid(
    x: number,
    y: number,
    size: AsteroidSize,
    angle: number,
    speed: number
  ): Asteroid {
    const radius = size === 'large' ? 40 : size === 'medium' ? 22 : 12;
    const pointsCount = 10;
    const points: number[] = [];

    for (let i = 0; i < pointsCount; i++) {
      // Variación radial entre 0.75 y 1.25 para aspecto rugoso
      const variance = 0.75 + Math.random() * 0.5;
      points.push(variance);
    }

    const ast: Asteroid = {
      id: this.nextEntityId++,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      radius,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 1.5,
      points
    };
    return ast;
  }

  public tick(deltaMs: number): void {
    if (this.status !== 'PLAYING') {
      return;
    }

    const deltaSec = deltaMs / 1000;
    this.fireCooldownMs = Math.max(0, this.fireCooldownMs - deltaMs);

    if (this.ship.invulnerableTimerMs > 0) {
      this.ship.invulnerableTimerMs = Math.max(0, this.ship.invulnerableTimerMs - deltaMs);
    }

    this.updateShip(deltaSec);
    this.updateBullets(deltaMs, deltaSec);
    this.updateAsteroids(deltaSec);
    this.updateParticles(deltaSec);
    this.checkCollisions();
    this.checkWaveProgress();
  }

  private updateShip(deltaSec: number): void {
    if (this.ship.isThrusting) {
      const accel = this.config.thrustAccel * deltaSec;
      this.ship.vx += Math.cos(this.ship.rotation) * accel;
      this.ship.vy += Math.sin(this.ship.rotation) * accel;

      // Partículas de escape de propulsor
      const tailX = this.ship.x - Math.cos(this.ship.rotation) * this.ship.radius;
      const tailY = this.ship.y - Math.sin(this.ship.rotation) * this.ship.radius;
      this.spawnExhaustParticle(tailX, tailY, this.ship.rotation);
    }

    // Fricción suave
    this.ship.vx *= this.config.friction;
    this.ship.vy *= this.config.friction;

    // Límite de velocidad
    const maxSpeed = 380;
    const currentSpeed = Math.hypot(this.ship.vx, this.ship.vy);
    if (currentSpeed > maxSpeed) {
      this.ship.vx = (this.ship.vx / currentSpeed) * maxSpeed;
      this.ship.vy = (this.ship.vy / currentSpeed) * maxSpeed;
    }

    this.ship.x += this.ship.vx * deltaSec;
    this.ship.y += this.ship.vy * deltaSec;

    // Envolvente toroidal (Wrap-around)
    this.ship.x = this.wrapCoordinate(this.ship.x, this.config.virtualWidth);
    this.ship.y = this.wrapCoordinate(this.ship.y, this.config.virtualHeight);
  }

  private wrapCoordinate(val: number, max: number): number {
    let result = val;
    if (result < 0) {
      result += max;
    } else if (result >= max) {
      result -= max;
    }
    return result;
  }

  private updateBullets(deltaMs: number, deltaSec: number): void {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      if (!b) continue;
      b.lifeMs -= deltaMs;
      if (b.lifeMs <= 0) {
        this.bullets.splice(i, 1);
        continue;
      }
      b.x += b.vx * deltaSec;
      b.y += b.vy * deltaSec;
      b.x = this.wrapCoordinate(b.x, this.config.virtualWidth);
      b.y = this.wrapCoordinate(b.y, this.config.virtualHeight);
    }
  }

  private updateAsteroids(deltaSec: number): void {
    for (const ast of this.asteroids) {
      ast.x += ast.vx * deltaSec;
      ast.y += ast.vy * deltaSec;
      ast.rotation += ast.rotSpeed * deltaSec;
      ast.x = this.wrapCoordinate(ast.x, this.config.virtualWidth);
      ast.y = this.wrapCoordinate(ast.y, this.config.virtualHeight);
    }
  }

  private updateParticles(deltaSec: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!p) continue;
      p.life -= deltaSec;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * deltaSec;
      p.y += p.vy * deltaSec;
    }
  }

  private checkCollisions(): void {
    // 1. Proyectiles vs Asteroides
    for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
      const b = this.bullets[bi];
      if (!b) continue;

      for (let ai = this.asteroids.length - 1; ai >= 0; ai--) {
        const ast = this.asteroids[ai];
        if (!ast) continue;

        const dist = Math.hypot(b.x - ast.x, b.y - ast.y);
        if (dist <= ast.radius) {
          // Destruir bala
          this.bullets.splice(bi, 1);

          // Puntos según tamaño
          const pts = ast.size === 'large' ? 20 : ast.size === 'medium' ? 50 : 100;
          this.score += pts;
          if (this.score > this.highScore) {
            this.highScore = this.score;
          }

          // Partículas de explosión
          this.spawnExplosionParticles(ast.x, ast.y, ast.radius, '#00d9c4');

          // Sonido
          if (this.onSoundEvent) {
            this.onSoundEvent('bounce');
          }

          // Dividir asteroide o eliminarlo
          this.asteroids.splice(ai, 1);
          this.splitAsteroid(ast);
          break;
        }
      }
    }

    // 2. Nave vs Asteroides
    if (this.ship.invulnerableTimerMs <= 0) {
      for (const ast of this.asteroids) {
        const dist = Math.hypot(this.ship.x - ast.x, this.ship.y - ast.y);
        if (dist <= this.ship.radius + ast.radius * 0.85) {
          this.handleShipHit();
          break;
        }
      }
    }
  }

  private splitAsteroid(ast: Asteroid): void {
    if (ast.size === 'small') {
      return;
    }

    const nextSize: AsteroidSize = ast.size === 'large' ? 'medium' : 'small';
    const splitMult = this.difficulty === 'extreme' ? 1.55 : this.difficulty === 'hard' ? 1.4 : 1.35;
    const baseSpeed = Math.hypot(ast.vx, ast.vy) * splitMult;

    for (let i = 0; i < 2; i++) {
      const offsetAngle = (Math.PI / 4) * (i === 0 ? 1 : -1);
      const angle = Math.atan2(ast.vy, ast.vx) + offsetAngle + (Math.random() - 0.5) * 0.3;
      this.asteroids.push(this.createAsteroid(ast.x, ast.y, nextSize, angle, baseSpeed));
    }
  }

  private handleShipHit(): void {
    this.spawnExplosionParticles(this.ship.x, this.ship.y, 25, '#00f59b');
    this.lives -= 1;

    if (this.onSoundEvent) {
      this.onSoundEvent('die');
    }

    if (this.lives <= 0) {
      this.status = 'GAME_OVER';
    } else {
      this.resetShip(true);
    }
  }

  private checkWaveProgress(): void {
    if (this.asteroids.length === 0 && this.status === 'PLAYING') {
      this.status = 'VICTORY';
      if (this.onSoundEvent) {
        this.onSoundEvent('win');
      }
    }
  }

  public nextWave(): void {
    this.wave += 1;
    this.spawnWave(this.wave);
    this.resetShip(true);
    this.status = 'PLAYING';
  }

  private spawnExhaustParticle(x: number, y: number, shipRot: number): void {
    const spread = (Math.random() - 0.5) * 0.6;
    const speed = 120 + Math.random() * 80;
    const angle = shipRot + Math.PI + spread;

    this.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed + this.ship.vx * 0.3,
      vy: Math.sin(angle) * speed + this.ship.vy * 0.3,
      life: 0.25 + Math.random() * 0.15,
      maxLife: 0.4,
      color: '#ff9f1c'
    });
  }

  private spawnExplosionParticles(x: number, y: number, count: number, color: string): void {
    const num = Math.min(24, Math.max(8, Math.floor(count * 0.6)));
    for (let i = 0; i < num; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 140;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.8,
        color
      });
    }
  }

  public getDifficultyInitialLives(): number {
    if (this.difficulty === 'easy') {
      return this.config.initialLives + 1;
    }
    if (this.difficulty === 'extreme') {
      return Math.max(1, this.config.initialLives - 1);
    }
    return this.config.initialLives;
  }

  public getDifficultyAsteroidCount(waveNum: number): number {
    if (this.difficulty === 'easy') {
      return Math.min(8, 2 + waveNum);
    }
    if (this.difficulty === 'hard') {
      return Math.min(12, 4 + waveNum);
    }
    if (this.difficulty === 'extreme') {
      return Math.min(15, 6 + waveNum);
    }
    return Math.min(10, 3 + waveNum);
  }

  public getDifficultySpeedMultiplier(): number {
    if (this.difficulty === 'easy') {
      return 0.7;
    }
    if (this.difficulty === 'hard') {
      return 1.35;
    }
    if (this.difficulty === 'extreme') {
      return 1.75;
    }
    return 1.0;
  }

  public getDifficultyInvulnerableTime(): number {
    if (this.difficulty === 'easy') {
      return 3500;
    }
    if (this.difficulty === 'hard') {
      return 2000;
    }
    if (this.difficulty === 'extreme') {
      return 1500;
    }
    return 2500;
  }

  public getDifficultyFireCooldown(): number {
    if (this.difficulty === 'easy') {
      return 160;
    }
    if (this.difficulty === 'hard') {
      return 200;
    }
    if (this.difficulty === 'extreme') {
      return 240;
    }
    return 180;
  }

  public getSnapshot(): AsteroidsSnapshot {
    const snap: AsteroidsSnapshot = {
      status: this.status,
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      wave: this.wave,
      difficulty: this.difficulty,
      ship: {
        x: this.ship.x,
        y: this.ship.y,
        rotation: this.ship.rotation,
        radius: this.ship.radius,
        isThrusting: this.ship.isThrusting,
        isInvulnerable: this.ship.invulnerableTimerMs > 0
      },
      bullets: [...this.bullets],
      asteroids: [...this.asteroids],
      particles: [...this.particles]
    };
    return snap;
  }

  public getDifficulty(): AsteroidsDifficulty {
    const diff = this.difficulty;
    return diff;
  }

  public setDifficulty(diff: AsteroidsDifficulty): void {
    const oldMult = this.getDifficultySpeedMultiplier();
    this.difficulty = diff;
    const newMult = this.getDifficultySpeedMultiplier();

    if (this.status === 'READY') {
      this.lives = this.getDifficultyInitialLives();
      this.spawnWave(this.wave);
    } else if (oldMult > 0 && newMult > 0 && oldMult !== newMult) {
      const ratio = newMult / oldMult;
      for (const ast of this.asteroids) {
        ast.vx *= ratio;
        ast.vy *= ratio;
        ast.rotSpeed *= Math.sqrt(ratio);
      }
    }
  }

  public getScore(): number {
    const s = this.score;
    return s;
  }

  public getStatus(): GameStatus {
    const st = this.status;
    return st;
  }
}
