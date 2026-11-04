// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Motor de juego puro y desacoplado del DOM para Pac-Man (1980 Namco AI).
 * @spec REQ-50
 */

import type {
  PacmanConfig,
  PacmanDifficulty,
  PacmanDirection,
  GameStatus,
  Ghost,
  PacmanEntity,
  PacmanSnapshot
} from '../types.js';

export const DEFAULT_PACMAN_CONFIG: PacmanConfig = Object.freeze({
  cols: 19,
  rows: 21,
  tileSize: 30, // 570px x 630px
  initialLives: 3,
  baseSpeed: 3.2,
  frightenedDurationMs: 6500
});

// 1 = Muro, 2 = Pellet, 3 = Energizer, 0 = Vacío, 4 = Puerta casa fantasmas
export const INITIAL_MAZE_MAP: readonly (readonly number[])[] = Object.freeze([
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 3, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 3, 1],
  [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
  [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 1],
  [0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0],
  [1, 1, 1, 1, 2, 1, 0, 1, 1, 4, 1, 1, 0, 1, 2, 1, 1, 1, 1],
  [0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0],
  [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1],
  [0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0],
  [1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
  [1, 3, 2, 1, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 1, 2, 3, 1],
  [1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1],
  [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]);

interface ModePhase {
  readonly mode: 'scatter' | 'chase';
  readonly durationMs: number;
}

const GLOBAL_PHASES: readonly ModePhase[] = Object.freeze([
  { mode: 'scatter', durationMs: 7000 },
  { mode: 'chase', durationMs: 20000 },
  { mode: 'scatter', durationMs: 7000 },
  { mode: 'chase', durationMs: 20000 },
  { mode: 'scatter', durationMs: 5000 },
  { mode: 'chase', durationMs: 20000 },
  { mode: 'scatter', durationMs: 5000 },
  { mode: 'chase', durationMs: Number.POSITIVE_INFINITY }
]);

export class PacmanEngine {
  private config: PacmanConfig;
  private status: GameStatus = 'READY';
  private score: number = 0;
  private highScore: number = 0;
  private lives: number;
  private level: number = 1;
  private difficulty: PacmanDifficulty;

  private grid: number[][] = [];
  private pelletsRemaining: number = 0;
  private frightenedTimerMs: number = 0;
  private ghostStreak: number = 0;

  // Temporizador de modos globales de 1980 (Scatter / Chase)
  private currentPhaseIndex: number = 0;
  private phaseTimerMs: number = 0;
  private globalMode: 'scatter' | 'chase' = 'scatter';

  private pacman: PacmanEntity = {
    x: 9,
    y: 16,
    dir: 'NONE',
    nextDir: 'NONE',
    mouthAngle: 0
  };

  private ghosts: Ghost[] = [];

  public onSoundEvent?: (event: 'eat' | 'power' | 'ghost_eat' | 'die' | 'win') => void;

  constructor(
    config: Partial<PacmanConfig> = {},
    highScore: number = 0,
    difficulty: PacmanDifficulty = 'normal'
  ) {
    this.config = { ...DEFAULT_PACMAN_CONFIG, ...config };
    this.highScore = highScore;
    this.difficulty = difficulty;
    this.lives = this.config.initialLives;
    this.resetMaze();
  }

  /**
   * Inicializa o reinicia el laberinto y entidades.
   * @spec REQ-50
   */
  public resetMaze(): void {
    this.grid = INITIAL_MAZE_MAP.map((row) => [...row]);
    let count = 0;
    for (let r = 0; r < this.grid.length; r++) {
      const row = this.grid[r];
      if (row) {
        for (let c = 0; c < row.length; c++) {
          if (row[c] === 2 || row[c] === 3) {
            count += 1;
          }
        }
      }
    }
    this.pelletsRemaining = count;
    this.resetEntities();
  }

  /**
   * Restablece las posiciones iniciales de Pac-Man y los 4 fantasmas según 1980 Namco.
   * @spec REQ-50
   */
  public resetEntities(): void {
    this.pacman = {
      x: 9,
      y: 16,
      dir: 'NONE',
      nextDir: 'NONE',
      mouthAngle: 0
    };

    this.frightenedTimerMs = 0;
    this.ghostStreak = 0;
    this.currentPhaseIndex = 0;
    this.phaseTimerMs = 0;
    this.globalMode = 'scatter';

    this.ghosts = [
      {
        id: 'blinky',
        x: 9,
        y: 8,
        dir: 'LEFT',
        state: 'scatter',
        color: '#ff0055',
        targetX: 18,
        targetY: 0,
        releaseTimerMs: 0
      },
      {
        id: 'pinky',
        x: 9,
        y: 10,
        dir: 'UP',
        state: 'scatter',
        color: '#ff007f',
        targetX: 0,
        targetY: 0,
        releaseTimerMs: 1200
      },
      {
        id: 'inky',
        x: 8,
        y: 10,
        dir: 'UP',
        state: 'scatter',
        color: '#00d9c4',
        targetX: 18,
        targetY: 20,
        releaseTimerMs: 3200
      },
      {
        id: 'clyde',
        x: 10,
        y: 10,
        dir: 'UP',
        state: 'scatter',
        color: '#ff9f1c',
        targetX: 0,
        targetY: 20,
        releaseTimerMs: 5500
      }
    ];
  }

  /**
   * Arranca el juego.
   * @spec REQ-50
   */
  public start(): void {
    if (this.status === 'READY' || this.status === 'PAUSED') {
      this.status = 'PLAYING';
    }
  }

  /**
   * Pausa o despausa.
   * @spec REQ-50
   */
  public togglePause(): void {
    if (this.status === 'PLAYING') {
      this.status = 'PAUSED';
    } else if (this.status === 'PAUSED') {
      this.status = 'PLAYING';
    }
  }

  /**
   * Reinicia la partida completa.
   * @spec REQ-50
   */
  public resetGame(): void {
    this.score = 0;
    this.lives = this.config.initialLives;
    this.level = 1;
    this.status = 'READY';
    this.resetMaze();
  }

  /**
   * Encola la siguiente dirección de Pac-Man.
   * @spec REQ-50
   */
  public setDirection(dir: PacmanDirection): void {
    if (this.status === 'READY') {
      this.status = 'PLAYING';
    }
    this.pacman.nextDir = dir;

    // Si es reversión de 180°, aplicar de inmediato
    if (this.isOppositeDirection(this.pacman.dir, dir)) {
      this.pacman.dir = dir;
    }
  }

  private isOppositeDirection(d1: PacmanDirection, d2: PacmanDirection): boolean {
    const opp =
      (d1 === 'LEFT' && d2 === 'RIGHT') ||
      (d1 === 'RIGHT' && d2 === 'LEFT') ||
      (d1 === 'UP' && d2 === 'DOWN') ||
      (d1 === 'DOWN' && d2 === 'UP');
    return opp;
  }

  private getOppositeDir(dir: PacmanDirection): PacmanDirection {
    if (dir === 'LEFT') return 'RIGHT';
    if (dir === 'RIGHT') return 'LEFT';
    if (dir === 'UP') return 'DOWN';
    if (dir === 'DOWN') return 'UP';
    return 'NONE';
  }

  /**
   * Avanza la simulación por delta de tiempo según las especificaciones Namco 1980.
   * @spec REQ-50
   */
  public tick(deltaMs: number): void {
    if (this.status !== 'PLAYING') {
      return;
    }

    // 1. Temporizador de modo asustado (Frightened)
    if (this.frightenedTimerMs > 0) {
      this.frightenedTimerMs = Math.max(0, this.frightenedTimerMs - deltaMs);
      if (this.frightenedTimerMs === 0) {
        this.ghostStreak = 0;
        this.ghosts.forEach((g) => {
          if (g.state === 'frightened') {
            g.state = this.pelletsRemaining < 20 && g.id === 'blinky' ? 'chase' : this.globalMode;
          }
        });
      }
    } else {
      // 2. Temporizador de fases globales (Scatter / Chase) Namco 1980
      const currentPhase = GLOBAL_PHASES[this.currentPhaseIndex];
      if (currentPhase && currentPhase.durationMs !== Number.POSITIVE_INFINITY) {
        this.phaseTimerMs += deltaMs;
        if (this.phaseTimerMs >= currentPhase.durationMs) {
          this.phaseTimerMs = 0;
          this.currentPhaseIndex = Math.min(GLOBAL_PHASES.length - 1, this.currentPhaseIndex + 1);
          const nextPhase = GLOBAL_PHASES[this.currentPhaseIndex];
          if (nextPhase && nextPhase.mode !== this.globalMode) {
            this.globalMode = nextPhase.mode;
            this.triggerModeReversal();
          }
        }
      }
    }

    // Velocidad según dificultad
    const speedMultiplier =
      this.difficulty === 'easy' ? 0.85 : this.difficulty === 'hard' ? 1.2 : 1.0;
    const baseSpeed = (this.config.baseSpeed * speedMultiplier * deltaMs) / 1000;

    this.updatePacmanPosition(baseSpeed);
    this.updateGhostsPosition(baseSpeed, deltaMs);
    this.checkCollisions();
  }

  /**
   * Regla del Giro en U (180°):
   * Al transicionar entre Scatter <-> Chase, fuerza giro inmediato de 180° a fantasmas activos.
   */
  private triggerModeReversal(): void {
    this.ghosts.forEach((ghost) => {
      if (ghost.state === 'scatter' || ghost.state === 'chase') {
        if (ghost.id === 'blinky' && this.pelletsRemaining < 20) {
          ghost.state = 'chase';
        } else {
          ghost.state = this.globalMode;
        }
        const opp = this.getOppositeDir(ghost.dir);
        if (opp !== 'NONE' && this.canGhostMoveInDirection(ghost, Math.round(ghost.x), Math.round(ghost.y), opp)) {
          ghost.dir = opp;
        }
      }
    });
  }

  private updatePacmanPosition(stepDistance: number): void {
    const { nextDir } = this.pacman;

    // Intentar aplicar la dirección encolada en intersecciones
    if (nextDir !== 'NONE' && nextDir !== this.pacman.dir) {
      const nearCenterX = Math.abs(this.pacman.x - Math.round(this.pacman.x)) < 0.25;
      const nearCenterY = Math.abs(this.pacman.y - Math.round(this.pacman.y)) < 0.25;

      if (nearCenterX && nearCenterY) {
        const checkX = Math.round(this.pacman.x);
        const checkY = Math.round(this.pacman.y);
        if (this.canMoveInDirection(checkX, checkY, nextDir)) {
          this.pacman.x = checkX;
          this.pacman.y = checkY;
          this.pacman.dir = nextDir;
          this.pacman.nextDir = 'NONE';
        }
      }
    }

    if (this.pacman.dir === 'NONE') {
      return;
    }

    // Bloqueo estricto del eje perpendicular para centrado perfecto en pasillos
    if (this.pacman.dir === 'LEFT' || this.pacman.dir === 'RIGHT') {
      this.pacman.y = Math.round(this.pacman.y);
    } else if (this.pacman.dir === 'UP' || this.pacman.dir === 'DOWN') {
      this.pacman.x = Math.round(this.pacman.x);
    }

    let dx = 0;
    let dy = 0;
    if (this.pacman.dir === 'LEFT') dx = -stepDistance;
    else if (this.pacman.dir === 'RIGHT') dx = stepDistance;
    else if (this.pacman.dir === 'UP') dy = -stepDistance;
    else if (this.pacman.dir === 'DOWN') dy = stepDistance;

    const nextX = this.pacman.x + dx;
    const nextY = this.pacman.y + dy;

    // Túnel lateral
    if (nextX < -0.5) {
      this.pacman.x = this.config.cols - 0.5;
      return;
    }
    if (nextX > this.config.cols - 0.5) {
      this.pacman.x = -0.5;
      return;
    }

    if (this.canOccupyPosition(nextX, nextY, this.pacman.dir)) {
      this.pacman.x = nextX;
      this.pacman.y = nextY;
      this.pacman.mouthAngle = (this.pacman.mouthAngle + 0.3) % (Math.PI * 2);
    } else {
      this.pacman.x = Math.round(this.pacman.x);
      this.pacman.y = Math.round(this.pacman.y);
    }

    // Comer pellet o energizer
    const tileX = Math.round(this.pacman.x);
    const tileY = Math.round(this.pacman.y);
    const row = this.grid[tileY];
    if (row && row[tileX] !== undefined) {
      const tile = row[tileX];
      if (tile === 2) {
        row[tileX] = 0;
        this.score += 10;
        this.pelletsRemaining = Math.max(0, this.pelletsRemaining - 1);
        if (this.onSoundEvent) {
          this.onSoundEvent('eat');
        }
      } else if (tile === 3) {
        row[tileX] = 0;
        this.score += 50;
        this.pelletsRemaining = Math.max(0, this.pelletsRemaining - 1);
        this.frightenGhosts();
        if (this.onSoundEvent) {
          this.onSoundEvent('power');
        }
      }

      if (this.score > this.highScore) {
        this.highScore = this.score;
      }

      if (this.pelletsRemaining === 0) {
        this.handleLevelClear();
      }
    }
  }

  private frightenGhosts(): void {
    this.frightenedTimerMs = this.config.frightenedDurationMs;
    this.ghostStreak = 0;
    this.ghosts.forEach((g) => {
      if (g.state !== 'eaten') {
        g.state = 'frightened';
        const opp = this.getOppositeDir(g.dir);
        if (opp !== 'NONE' && this.canGhostMoveInDirection(g, Math.round(g.x), Math.round(g.y), opp)) {
          g.dir = opp;
        }
      }
    });
  }

  private handleLevelClear(): void {
    this.status = 'VICTORY';
    if (this.onSoundEvent) {
      this.onSoundEvent('win');
    }
  }

  private updateGhostsPosition(stepDistance: number, deltaMs: number): void {
    this.ghosts.forEach((ghost) => {
      this.moveGhost(ghost, stepDistance, deltaMs);
    });
  }

  private moveGhost(ghost: Ghost, step: number, deltaMs: number): void {
    // 1. Si el fantasma está dentro de la casa (y > 8.05)
    if (ghost.y > 8.05 && ghost.x >= 7.0 && ghost.x <= 11.0 && ghost.state !== 'eaten') {
      if (ghost.releaseTimerMs > 0) {
        ghost.releaseTimerMs -= deltaMs;
        return;
      }

      // Proceso de salida de la casa:
      // Paso 1: Alinear al centro horizontal de la puerta (x = 9.0)
      if (ghost.x < 8.94) {
        ghost.x = Math.min(9.0, ghost.x + step * 0.8);
        return;
      } else if (ghost.x > 9.06) {
        ghost.x = Math.max(9.0, ghost.x - step * 0.8);
        return;
      }
      ghost.x = 9.0;

      // Paso 2: Subir por la puerta verticalmente hacia y = 8.0
      ghost.y -= step * 0.8;
      if (ghost.y <= 8.0) {
        ghost.y = 8.0;
        ghost.dir = 'LEFT';
        ghost.state = this.pelletsRemaining < 20 && ghost.id === 'blinky' ? 'chase' : this.globalMode;
      }
      return;
    }

    // 2. Si son ojos devorados que llegan a la puerta de la Ghost House (9, 8)
    if (ghost.state === 'eaten') {
      const distToGate = Math.hypot(ghost.x - 9.0, ghost.y - 8.0);
      if (distToGate < 0.65 || (ghost.y >= 7.8 && ghost.y <= 10.5 && Math.abs(ghost.x - 9.0) < 0.8)) {
        ghost.x = 9.0;
        ghost.y = 8.0;
        ghost.dir = 'LEFT';
        ghost.state = this.pelletsRemaining < 20 && ghost.id === 'blinky' ? 'chase' : this.globalMode;
        return;
      }
    }

    // 3. Velocidad efectiva según estado y mapa
    let effStep = step * 0.88;
    const currentRoundY = Math.round(ghost.y);
    if (currentRoundY === 10 && (ghost.x < 4 || ghost.x > 14)) {
      effStep *= 0.5; // Túnel lateral
    } else if (ghost.state === 'frightened') {
      effStep *= 0.6; // Modo asustado
    } else if (ghost.state === 'eaten') {
      effStep *= 1.85; // Ojos
    } else if (ghost.id === 'blinky') {
      if (this.pelletsRemaining < 10) {
        effStep *= 1.30;
      } else if (this.pelletsRemaining < 20) {
        effStep *= 1.15;
      }
    }

    // 4. Túnel lateral con wrap-around seguro
    if (ghost.dir === 'LEFT' && ghost.x < -0.5) {
      ghost.x = this.config.cols - 0.5;
      return;
    }
    if (ghost.dir === 'RIGHT' && ghost.x > this.config.cols - 0.5) {
      ghost.x = -0.5;
      return;
    }

    // 5. Movimiento casilla a casilla estricto (tile-based) sin posibilidad física de atravesar muros
    if (ghost.dir === 'LEFT') {
      ghost.y = Math.round(ghost.y);
      const curTileX = Math.round(ghost.x);
      if (Math.abs(ghost.x - curTileX) < 0.001) {
        ghost.x = curTileX;
        if (!this.canGhostMoveInDirection(ghost, curTileX, ghost.y, 'LEFT')) {
          ghost.dir = this.chooseGhostDirection(ghost);
          return;
        }
      }
      const targetCol = Math.floor(ghost.x - 0.0001);
      const nextX = ghost.x - effStep;
      if (nextX <= targetCol) {
        ghost.x = targetCol;
        ghost.dir = this.chooseGhostDirection(ghost);
      } else {
        ghost.x = nextX;
      }
    } else if (ghost.dir === 'RIGHT') {
      ghost.y = Math.round(ghost.y);
      const curTileX = Math.round(ghost.x);
      if (Math.abs(ghost.x - curTileX) < 0.001) {
        ghost.x = curTileX;
        if (!this.canGhostMoveInDirection(ghost, curTileX, ghost.y, 'RIGHT')) {
          ghost.dir = this.chooseGhostDirection(ghost);
          return;
        }
      }
      const targetCol = Math.ceil(ghost.x + 0.0001);
      const nextX = ghost.x + effStep;
      if (nextX >= targetCol) {
        ghost.x = targetCol;
        ghost.dir = this.chooseGhostDirection(ghost);
      } else {
        ghost.x = nextX;
      }
    } else if (ghost.dir === 'UP') {
      ghost.x = Math.round(ghost.x);
      const curTileY = Math.round(ghost.y);
      if (Math.abs(ghost.y - curTileY) < 0.001) {
        ghost.y = curTileY;
        if (!this.canGhostMoveInDirection(ghost, ghost.x, curTileY, 'UP')) {
          ghost.dir = this.chooseGhostDirection(ghost);
          return;
        }
      }
      const targetRow = Math.floor(ghost.y - 0.0001);
      const nextY = ghost.y - effStep;
      if (nextY <= targetRow) {
        ghost.y = targetRow;
        ghost.dir = this.chooseGhostDirection(ghost);
      } else {
        ghost.y = nextY;
      }
    } else if (ghost.dir === 'DOWN') {
      ghost.x = Math.round(ghost.x);
      const curTileY = Math.round(ghost.y);
      if (Math.abs(ghost.y - curTileY) < 0.001) {
        ghost.y = curTileY;
        if (!this.canGhostMoveInDirection(ghost, ghost.x, curTileY, 'DOWN')) {
          ghost.dir = this.chooseGhostDirection(ghost);
          return;
        }
      }
      const targetRow = Math.ceil(ghost.y + 0.0001);
      const nextY = ghost.y + effStep;
      if (nextY >= targetRow) {
        ghost.y = targetRow;
        ghost.dir = this.chooseGhostDirection(ghost);
      } else {
        ghost.y = nextY;
      }
    }
  }

  /**
   * Toma de decisiones en intersecciones según las fórmulas exactas Namco 1980.
   * Reglas:
   * 1. No retroceder 180° en pasillos.
   * 2. Distancia Euclidiana mínima d = sqrt((x_cand - x_target)^2 + (y_cand - y_target)^2).
   * 3. Desempate estricto: ARRIBA > IZQUIERDA > ABAJO > DERECHA.
   * 4. Vetar giro hacia ARRIBA en casillas restringidas sobre la casa de fantasmas.
   */
  private chooseGhostDirection(ghost: Ghost): PacmanDirection {
    const candidates: readonly PacmanDirection[] = ['UP', 'LEFT', 'DOWN', 'RIGHT'];
    const curX = Math.round(ghost.x);
    const curY = Math.round(ghost.y);

    // Casillas con restricción de no girar hacia arriba en modos normales (Namco 1980)
    const isUpRestrictedTile =
      (curY === 7 && (curX === 8 || curX === 10)) ||
      (curY === 8 && curX === 9);

    const validDirs: PacmanDirection[] = [];

    candidates.forEach((d) => {
      if (this.isOppositeDirection(ghost.dir, d)) {
        return; // Prohibido retroceder 180° voluntariamente
      }
      if (d === 'UP' && isUpRestrictedTile && ghost.state !== 'eaten') {
        return; // Restricción especial de giro hacia arriba
      }
      if (this.canGhostMoveInDirection(ghost, curX, curY, d)) {
        validDirs.push(d);
      }
    });

    if (validDirs.length === 0) {
      // Si no hay salidas sin retroceso, permitir la opuesta si es transitable
      candidates.forEach((d) => {
        if (this.canGhostMoveInDirection(ghost, curX, curY, d)) {
          validDirs.push(d);
        }
      });
    }

    if (validDirs.length === 0) {
      return ghost.dir;
    }

    // Modo Asustado: selección pseudoaleatoria en intersecciones
    if (ghost.state === 'frightened') {
      const randIdx = Math.floor(Math.random() * validDirs.length);
      return validDirs[randIdx] ?? ghost.dir;
    }

    // Calcular Target Tile (x_target, y_target) específico de la personalidad
    const target = this.getGhostTarget(ghost);
    ghost.targetX = target.x;
    ghost.targetY = target.y;

    let bestDir = validDirs[0] ?? ghost.dir;
    let minDistance = Number.POSITIVE_INFINITY;

    // Evaluación en orden UP > LEFT > DOWN > RIGHT.
    // Usar '<' garantiza que ante distancias iguales gana el primero en la lista (desempate estricto).
    for (const d of ['UP', 'LEFT', 'DOWN', 'RIGHT'] as const) {
      if (!validDirs.includes(d)) {
        continue;
      }
      let candX = curX;
      let candY = curY;
      if (d === 'LEFT') candX -= 1;
      else if (d === 'RIGHT') candX += 1;
      else if (d === 'UP') candY -= 1;
      else if (d === 'DOWN') candY += 1;

      const dist = Math.hypot(candX - target.x, candY - target.y);
      if (dist < minDistance) {
        minDistance = dist;
        bestDir = d;
      }
    }

    return bestDir;
  }

  /**
   * Calcula el target tile dinámico según el fantasma y su estado (Namco 1980 AI):
   * - Blinky: Pac-Man (Chase) / Esquina superior derecha (Scatter)
   * - Pinky: 4 casillas por delante de Pac-Man con el overflow bug hacia arriba (Chase) / Superior izq (Scatter)
   * - Inky: Duplicación vectorial desde Blinky respecto a 2 casillas delante de Pac-Man (Chase) / Inferior der (Scatter)
   * - Clyde: Pac-Man si distancia > 8, Esquina inferior izq si <= 8 (Chase) / Inferior izq (Scatter)
   * - Eaten: Puerta de la Ghost House (9, 8)
   */
  private getGhostTarget(ghost: Ghost): { x: number; y: number } {
    // 1. Ojos devorados: regresar a la puerta de la Ghost House (9, 8)
    if (ghost.state === 'eaten') {
      return { x: 9, y: 8 };
    }

    // 2. Modo Dispersión (Scatter): esquinas fijas fuera del laberinto
    if (ghost.state === 'scatter') {
      if (ghost.id === 'blinky') return { x: 18, y: 0 };
      if (ghost.id === 'pinky') return { x: 0, y: 0 };
      if (ghost.id === 'inky') return { x: 18, y: 20 };
      if (ghost.id === 'clyde') return { x: 0, y: 20 };
    }

    // 3. Modo Persecución (Chase): algoritmos de personalidad
    const pacX = this.pacman.x;
    const pacY = this.pacman.y;
    const pacDir = this.pacman.dir;

    if (ghost.id === 'blinky') {
      // Persecución directa implacable
      return { x: pacX, y: pacY };
    }

    if (ghost.id === 'pinky') {
      // 4 casillas por delante con el overflow bug original: si mira arriba, suma 4 arriba y 4 a la izquierda
      let tx = pacX;
      let ty = pacY;
      if (pacDir === 'UP') {
        tx -= 4;
        ty -= 4;
      } else if (pacDir === 'LEFT') {
        tx -= 4;
      } else if (pacDir === 'RIGHT') {
        tx += 4;
      } else if (pacDir === 'DOWN') {
        ty += 4;
      }
      return { x: tx, y: ty };
    }

    if (ghost.id === 'inky') {
      // Vector intermedio: 2 casillas delante de Pac-Man (también con bug hacia arriba)
      let pivotX = pacX;
      let pivotY = pacY;
      if (pacDir === 'UP') {
        pivotX -= 2;
        pivotY -= 2;
      } else if (pacDir === 'LEFT') {
        pivotX -= 2;
      } else if (pacDir === 'RIGHT') {
        pivotX += 2;
      } else if (pacDir === 'DOWN') {
        pivotY += 2;
      }

      // Buscar posición de Blinky
      const blinky = this.ghosts.find((g) => g.id === 'blinky') ?? { x: 9, y: 8 };
      // Vector de Blinky al punto intermedio duplicado
      const vx = pivotX - blinky.x;
      const vy = pivotY - blinky.y;
      return { x: pivotX + vx, y: pivotY + vy };
    }

    if (ghost.id === 'clyde') {
      // Si dist > 8: persigue a Pac-Man; si dist <= 8: huye a su esquina de dispersión (0, 20)
      const dist = Math.hypot(ghost.x - pacX, ghost.y - pacY);
      if (dist > 8) {
        return { x: pacX, y: pacY };
      }
      return { x: 0, y: 20 };
    }

    return { x: pacX, y: pacY };
  }

  private canGhostMoveInDirection(
    ghost: Ghost,
    x: number,
    y: number,
    dir: PacmanDirection
  ): boolean {
    let targetX = Math.round(x);
    let targetY = Math.round(y);

    if (dir === 'LEFT') targetX -= 1;
    if (dir === 'RIGHT') targetX += 1;
    if (dir === 'UP') targetY -= 1;
    if (dir === 'DOWN') targetY += 1;

    // Permitir túnel de escape lateral
    if (targetY === 10 && (targetX < 0 || targetX >= this.config.cols)) {
      return true;
    }

    const row = this.grid[targetY];
    if (!row) {
      return false;
    }
    const tile = row[targetX];
    if (tile === undefined || tile === 1) {
      return false; // Muro infranqueable
    }

    // La puerta de la casa (tile 4) solo la pueden atravesar los ojos ('eaten') para entrar o al salir
    if (tile === 4) {
      return ghost.state === 'eaten' || ghost.y > 8.0;
    }

    return true;
  }

  private canMoveInDirection(x: number, y: number, dir: PacmanDirection): boolean {
    let targetX = Math.round(x);
    let targetY = Math.round(y);

    if (dir === 'LEFT') targetX -= 1;
    if (dir === 'RIGHT') targetX += 1;
    if (dir === 'UP') targetY -= 1;
    if (dir === 'DOWN') targetY += 1;

    // Permitir túnel
    if (targetY === 10 && (targetX < 0 || targetX >= this.config.cols)) {
      return true;
    }

    const row = this.grid[targetY];
    if (!row) {
      return false;
    }
    const tile = row[targetX];
    const canMove = tile !== undefined && tile !== 1 && tile !== 4;
    return canMove;
  }

  private canOccupyPosition(x: number, y: number, dir: PacmanDirection): boolean {
    const margin = 0.38;
    let checkX = x;
    let checkY = y;

    if (dir === 'LEFT') checkX -= margin;
    if (dir === 'RIGHT') checkX += margin;
    if (dir === 'UP') checkY -= margin;
    if (dir === 'DOWN') checkY += margin;

    const tileX = Math.floor(checkX + 0.5);
    const tileY = Math.floor(checkY + 0.5);

    if (tileY === 10 && (tileX < 0 || tileX >= this.config.cols)) {
      return true;
    }

    const row = this.grid[tileY];
    if (!row) {
      return false;
    }
    const tile = row[tileX];
    const canOccupy = tile !== undefined && tile !== 1 && tile !== 4;
    return canOccupy;
  }

  private checkCollisions(): void {
    const pacX = this.pacman.x;
    const pacY = this.pacman.y;

    for (const ghost of this.ghosts) {
      const dist = Math.hypot(pacX - ghost.x, pacY - ghost.y);
      if (dist < 0.68) {
        if (ghost.state === 'frightened') {
          // Fantasma devorado: se convierte en ojos y regresa a gran velocidad a la base
          ghost.state = 'eaten';
          ghost.releaseTimerMs = 0;
          this.ghostStreak += 1;
          const bonus = 200 * Math.pow(2, Math.min(3, this.ghostStreak - 1));
          this.score += bonus;
          if (this.onSoundEvent) {
            this.onSoundEvent('ghost_eat');
          }
        } else if (ghost.state === 'chase' || ghost.state === 'scatter') {
          this.handlePacmanDeath();
          break;
        }
      }
    }
  }

  private handlePacmanDeath(): void {
    this.lives -= 1;
    if (this.onSoundEvent) {
      this.onSoundEvent('die');
    }

    if (this.lives <= 0) {
      this.status = 'GAME_OVER';
    } else {
      this.resetEntities();
    }
  }

  public getSnapshot(): PacmanSnapshot {
    const snap: PacmanSnapshot = {
      status: this.status,
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      level: this.level,
      difficulty: this.difficulty,
      pacman: {
        x: this.pacman.x,
        y: this.pacman.y,
        dir: this.pacman.dir,
        mouthAngle: this.pacman.mouthAngle
      },
      ghosts: this.ghosts.map((g) => ({ ...g })),
      pelletsRemaining: this.pelletsRemaining,
      frightenedTimerMs: this.frightenedTimerMs
    };
    return snap;
  }

  public getDifficulty(): PacmanDifficulty {
    const diff = this.difficulty;
    return diff;
  }

  public setDifficulty(diff: PacmanDifficulty): void {
    this.difficulty = diff;
  }

  public getGrid(): readonly (readonly number[])[] {
    const g = this.grid;
    return g;
  }

  public getScore(): number {
    const s = this.score;
    return s;
  }

  public getLives(): number {
    const l = this.lives;
    return l;
  }

  public getStatus(): GameStatus {
    const st = this.status;
    return st;
  }

  public nextLevel(): void {
    this.level += 1;
    this.resetMaze();
    this.status = 'PLAYING';
  }
}
