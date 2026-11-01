// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Vista e interfaz accesible HTML/CSS/SVG para Tres en Raya (Tic-Tac-Toe).
 * @spec REQ-38, REQ-39, REQ-41
 */

import { TicTacToeEngine } from '../engine/TicTacToeEngine.js';
import type { AIDifficulty, ScoreBoard } from '../types.js';
import { soundManager } from '../../../common/audio/SoundEffects.js';

const SCORES_STORAGE_KEY = 'guacamolegh_tictactoe_scores';
const DIFFICULTY_STORAGE_KEY = 'guacamolegh_tictactoe_diff';

export class TicTacToeView {
  private container: HTMLElement;
  private engine: TicTacToeEngine;
  private onBack: () => void;

  private turnEl!: HTMLElement;
  private playerWinsEl!: HTMLElement;
  private drawsEl!: HTMLElement;
  private aiWinsEl!: HTMLElement;
  private diffBtn!: HTMLButtonElement;
  private boardContainer!: HTMLElement;
  private newGameBtn!: HTMLButtonElement;

  private isDestroyed: boolean = false;
  private aiTimeoutId: number | null = null;

  constructor(container: HTMLElement, onBack: () => void) {
    this.container = container;
    this.onBack = onBack;

    const savedScores = this.loadScores();
    const savedDiff = this.loadDifficulty();
    this.engine = new TicTacToeEngine(savedDiff, savedScores);
  }

  /**
   * Monta la vista del juego en el contenedor provisto.
   * @spec REQ-39
   */
  public mount(): void {
    this.container.innerHTML = this.getTemplateHtml();

    this.turnEl = this.container.querySelector('#ttt-turn-msg') as HTMLElement;
    this.playerWinsEl = this.container.querySelector('#ttt-player-wins') as HTMLElement;
    this.drawsEl = this.container.querySelector('#ttt-draws') as HTMLElement;
    this.aiWinsEl = this.container.querySelector('#ttt-ai-wins') as HTMLElement;
    this.diffBtn = this.container.querySelector('#ttt-diff-btn') as HTMLButtonElement;
    this.boardContainer = this.container.querySelector('#ttt-board') as HTMLElement;
    this.newGameBtn = this.container.querySelector('#ttt-new-game-btn') as HTMLButtonElement;

    this.bindEvents();
    this.render();
  }

  /**
   * Destruye la vista liberando escuchadores y temporizadores.
   * @spec REQ-35
   */
  public destroy(): void {
    this.isDestroyed = true;
    if (this.aiTimeoutId !== null) {
      window.clearTimeout(this.aiTimeoutId);
      this.aiTimeoutId = null;
    }
    this.container.innerHTML = '';
  }

  private bindEvents(): void {
    const backBtn = this.container.querySelector('#ttt-back-btn');
    backBtn?.addEventListener('click', () => {
      this.onBack();
    });

    this.diffBtn?.addEventListener('click', () => {
      soundManager.play('click');
      const snap = this.engine.getSnapshot();
      const newDiff: AIDifficulty =
        snap.difficulty === 'normal'
          ? 'unbeatable'
          : snap.difficulty === 'unbeatable'
            ? 'easy'
            : 'normal';
      this.engine.setDifficulty(newDiff);
      this.saveDifficulty(newDiff);
      this.render();
    });

    this.newGameBtn?.addEventListener('click', () => {
      soundManager.play('click');
      this.engine.reset();
      this.render();
    });

    const resetScoresBtn = this.container.querySelector('#ttt-reset-scores-btn');
    resetScoresBtn?.addEventListener('click', () => {
      soundManager.play('click');
      this.engine.setScoresForTesting({ playerWins: 0, aiWins: 0, draws: 0 });
      this.saveScores();
      this.render();
    });

    // Enlazar clics y navegación por teclado en la cuadrícula
    this.boardContainer?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const cellBtn = target.closest<HTMLButtonElement>('[data-cell-index]');
      if (!cellBtn) {
        return;
      }
      const indexAttr = cellBtn.getAttribute('data-cell-index');
      if (indexAttr === null) {
        return;
      }
      const cellIndex = parseInt(indexAttr, 10);
      this.handlePlayerCellClick(cellIndex);
    });

    // Soporte de navegación por flechas en teclado para accesibilidad (REQ-39)
    this.boardContainer?.addEventListener('keydown', (e) => {
      const target = e.target as HTMLElement;
      const cellBtn = target.closest<HTMLButtonElement>('[data-cell-index]');
      if (!cellBtn) {
        return;
      }

      const currentIndex = parseInt(cellBtn.getAttribute('data-cell-index') || '0', 10);
      let targetIndex = currentIndex;

      if (e.key === 'ArrowRight') {
        targetIndex = (currentIndex + 1) % 9;
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        targetIndex = (currentIndex + 8) % 9;
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        targetIndex = (currentIndex + 3) % 9;
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        targetIndex = (currentIndex + 6) % 9;
        e.preventDefault();
      }

      if (targetIndex !== currentIndex) {
        const nextBtn = this.boardContainer.querySelector<HTMLButtonElement>(`[data-cell-index="${targetIndex}"]`);
        nextBtn?.focus();
      }
    });
  }

  private handlePlayerCellClick(cellIndex: number): void {
    const snap = this.engine.getSnapshot();
    if (snap.status !== 'PLAYING' || snap.currentTurn !== 'X' || snap.isAiThinking) {
      return;
    }

    const moved = this.engine.makeMove(cellIndex);
    if (!moved) {
      return;
    }

    soundManager.play('click');
    this.render();
    this.saveScores();

    const afterMoveSnap = this.engine.getSnapshot();
    if (afterMoveSnap.status === 'FINISHED') {
      if (afterMoveSnap.result === 'X_WINS') {
        soundManager.play('win');
      } else if (afterMoveSnap.result === 'DRAW') {
        soundManager.play('bounce');
      }
      return;
    }

    if (afterMoveSnap.status === 'PLAYING' && afterMoveSnap.currentTurn === 'O') {
      // Activar indicador de pensamiento y responder tras breve retardo natural
      this.engine.setAiThinking(true);
      this.render();

      this.aiTimeoutId = window.setTimeout(() => {
        if (this.isDestroyed) {
          return;
        }
        this.engine.makeAiMove();
        soundManager.play('step');
        this.engine.setAiThinking(false);
        this.render();
        this.saveScores();

        const postAiSnap = this.engine.getSnapshot();
        if (postAiSnap.status === 'FINISHED') {
          if (postAiSnap.result === 'O_WINS') {
            soundManager.play('lose');
          } else if (postAiSnap.result === 'DRAW') {
            soundManager.play('bounce');
          }
        }
      }, 350);
    }
  }

  private render(): void {
    const snap = this.engine.getSnapshot();

    // Actualizar marcador
    this.playerWinsEl.textContent = snap.scores.playerWins.toString();
    this.drawsEl.textContent = snap.scores.draws.toString();
    this.aiWinsEl.textContent = snap.scores.aiWins.toString();

    // Actualizar botón de dificultad
    const diffLabelMap: Record<AIDifficulty, string> = {
      easy: 'IA: Fácil (Relajado)',
      normal: 'IA: Normal (Equilibrado)',
      unbeatable: 'IA: Imbatible (Minimax)'
    };
    this.diffBtn.textContent = diffLabelMap[snap.difficulty];

    // Mensaje de turno o resultado
    if (snap.status === 'FINISHED') {
      if (snap.result === 'X_WINS') {
        this.turnEl.innerHTML = '<span class="text-accent-green font-bold">¡HAS GANADO! 🎉</span>';
      } else if (snap.result === 'O_WINS') {
        this.turnEl.innerHTML = '<span class="text-accent-turquoise font-bold">LA IA HA GANADO 🤖</span>';
      } else {
        this.turnEl.innerHTML = '<span class="font-bold">¡TABLAS / EMPATE! 🤝</span>';
      }
    } else if (snap.isAiThinking) {
      this.turnEl.innerHTML = '<span class="text-accent-turquoise">IA analizando jugada...</span>';
    } else if (snap.currentTurn === 'X') {
      this.turnEl.innerHTML = '<span>Tu turno (<strong class="text-accent-green">X</strong>)</span>';
    } else {
      this.turnEl.innerHTML = '<span>Turno del rival (<strong class="text-accent-turquoise">O</strong>)</span>';
    }

    // Renderizar las 9 casillas
    const winningIndices: readonly number[] = snap.winningLine?.line ?? [];
    const cells = this.boardContainer.querySelectorAll<HTMLButtonElement>('.tictactoe-cell');

    cells.forEach((cellBtn, index) => {
      const val = snap.board[index];
      cellBtn.className = 'tictactoe-cell';

      if (val === 'X') {
        cellBtn.classList.add('cell-x');
        cellBtn.innerHTML = `
          <svg viewBox="0 0 24 24" class="tictactoe-icon" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
          </svg>
        `;
        cellBtn.setAttribute('aria-label', `Casilla ${index + 1}: Cruz`);
      } else if (val === 'O') {
        cellBtn.classList.add('cell-o');
        cellBtn.innerHTML = `
          <svg viewBox="0 0 24 24" class="tictactoe-icon" aria-hidden="true">
            <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="3"/>
          </svg>
        `;
        cellBtn.setAttribute('aria-label', `Casilla ${index + 1}: Círculo`);
      } else {
        cellBtn.innerHTML = '';
        cellBtn.setAttribute('aria-label', `Casilla ${index + 1}: Vacía`);
      }

      if (winningIndices.includes(index)) {
        cellBtn.classList.add('cell-winner');
      }

      // Deshabilitar celdas ocupadas o si la partida terminó
      cellBtn.disabled = val !== null || snap.status === 'FINISHED' || snap.isAiThinking;
    });
  }

  private loadScores(): ScoreBoard {
    try {
      const raw = localStorage.getItem(SCORES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          playerWins: typeof parsed.playerWins === 'number' ? parsed.playerWins : 0,
          aiWins: typeof parsed.aiWins === 'number' ? parsed.aiWins : 0,
          draws: typeof parsed.draws === 'number' ? parsed.draws : 0
        };
      }
    } catch {
      // Ignorar fallos de parsing
    }
    return { playerWins: 0, aiWins: 0, draws: 0 };
  }

  private saveScores(): void {
    try {
      const snap = this.engine.getSnapshot();
      localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify(snap.scores));
    } catch {
      // Ignorar fallos de cuota o modo incógnito
    }
  }

  private loadDifficulty(): AIDifficulty {
    try {
      const diff = localStorage.getItem(DIFFICULTY_STORAGE_KEY);
      if (diff === 'easy' || diff === 'normal' || diff === 'unbeatable') {
        return diff;
      }
    } catch {
      // Ignorar
    }
    return 'normal';
  }

  private saveDifficulty(diff: AIDifficulty): void {
    try {
      localStorage.setItem(DIFFICULTY_STORAGE_KEY, diff);
    } catch {
      // Ignorar
    }
  }

  private getTemplateHtml(): string {
    const html = `
      <section class="tictactoe-game-wrapper" aria-label="Juego Tres en Raya">
        <div class="tictactoe-inner-container">
          <div class="tictactoe-top-bar game-top-bar">
            <button id="ttt-back-btn" class="snake-back-btn game-top-btn" aria-label="Volver al catálogo principal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Volver al Catálogo</span>
            </button>
            <div class="snake-hud game-hud">
              <div class="hud-item">
                <span class="hud-label">TÚ (X)</span>
                <span id="ttt-player-wins" class="hud-value text-accent-green">0</span>
              </div>
              <div class="hud-item">
                <span class="hud-label">EMPATES</span>
                <span id="ttt-draws" class="hud-value">0</span>
              </div>
              <div class="hud-item">
                <span class="hud-label">IA (O)</span>
                <span id="ttt-ai-wins" class="hud-value text-accent-turquoise">0</span>
              </div>
            </div>
            <div class="tictactoe-actions-bar game-actions-bar">
              <button id="ttt-diff-btn" class="hud-btn game-top-btn" aria-label="Alternar dificultad de la IA">
                IA: Normal (Equilibrado)
              </button>
            </div>
          </div>

          <div class="tictactoe-status-bar">
            <div id="ttt-turn-msg" class="tictactoe-turn-msg">Tu turno (X)</div>
          </div>

          <div class="tictactoe-board-wrapper">
            <div id="ttt-board" class="tictactoe-board" role="grid" aria-label="Tablero de 3 por 3">
              <button class="tictactoe-cell" data-cell-index="0" role="gridcell" aria-label="Casilla 1"></button>
              <button class="tictactoe-cell" data-cell-index="1" role="gridcell" aria-label="Casilla 2"></button>
              <button class="tictactoe-cell" data-cell-index="2" role="gridcell" aria-label="Casilla 3"></button>
              <button class="tictactoe-cell" data-cell-index="3" role="gridcell" aria-label="Casilla 4"></button>
              <button class="tictactoe-cell" data-cell-index="4" role="gridcell" aria-label="Casilla 5"></button>
              <button class="tictactoe-cell" data-cell-index="5" role="gridcell" aria-label="Casilla 6"></button>
              <button class="tictactoe-cell" data-cell-index="6" role="gridcell" aria-label="Casilla 7"></button>
              <button class="tictactoe-cell" data-cell-index="7" role="gridcell" aria-label="Casilla 8"></button>
              <button class="tictactoe-cell" data-cell-index="8" role="gridcell" aria-label="Casilla 9"></button>
            </div>
          </div>

          <div class="tictactoe-actions">
            <button id="ttt-new-game-btn" class="btn-play-game" aria-label="Empezar nueva ronda">
              Nueva Ronda
            </button>
            <button id="ttt-reset-scores-btn" class="snake-back-btn" aria-label="Reiniciar tanteo a cero">
              Reiniciar Marcador
            </button>
          </div>

          <div class="snake-hints">
            <span>Controles: <strong>Clic</strong> o <strong>Toque</strong> en cada casilla &middot; En teclado: <strong>Flechas</strong> para navegar y <strong>Espacio/Enter</strong> para marcar</span>
          </div>
        </div>
      </section>
    `;
    return html;
  }
}
