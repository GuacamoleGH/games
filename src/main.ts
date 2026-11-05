// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Punto de entrada principal y orquestador de vistas de GuacamoleGH Games.
 * @spec REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06, REQ-07, REQ-13, REQ-14, REQ-20, REQ-21, REQ-27, REQ-28, REQ-34, REQ-35, REQ-40, REQ-41, REQ-43, REQ-48, REQ-52, REQ-56, REQ-60
 */

import './common/styles/main.css';
import { getGames } from './common/data/games.data.js';
import { renderHeader } from './common/components/Header.js';
import { renderHero } from './common/components/Hero.js';
import { renderGameGrid } from './common/components/GameGrid.js';
import { renderFooter } from './common/components/Footer.js';
import { soundManager } from './common/audio/SoundEffects.js';
import { mountSnake } from './games/snake/index.js';
import { mountPong } from './games/pong/index.js';
import { mountTetris } from './games/tetris/index.js';
import { mountBreakout } from './games/breakout/index.js';
import { mountTicTacToe } from './games/tic-tac-toe/index.js';
import { mountSpaceInvaders } from './games/space-invaders/index.js';
import { mountPacman } from './games/pacman/index.js';
import { mountAsteroids } from './games/asteroids/index.js';
import { mountBlackjack } from './games/blackjack/index.js';

let activeUnmount: (() => void) | null = null;

/**
 * Renderiza la vista principal del catálogo.
 * @spec REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06
 */
function renderCatalogView(appContainer: HTMLElement): void {
  window.scrollTo(0, 0);
  if (activeUnmount) {
    activeUnmount();
    activeUnmount = null;
  }

  const games = getGames();

  const appHtml = `
    ${renderHeader()}
    <main id="main-content" role="main">
      ${renderHero()}
      ${renderGameGrid(games)}
    </main>
    ${renderFooter()}
  `;

  appContainer.innerHTML = appHtml;

  // Enlazar botones de jugar disponibles
  const playButtons = appContainer.querySelectorAll<HTMLButtonElement>('[data-play-id]');
  playButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const gameId = btn.getAttribute('data-play-id');
      if (gameId) {
        window.location.hash = `#${gameId}`;
      }
    });
  });

  // Enlazar clicks directos a tarjetas disponibles
  const availableCards = appContainer.querySelectorAll<HTMLElement>('.card-available');
  availableCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.btn-play-game')) {
        return;
      }
      const gameId = card.getAttribute('data-game-id');
      if (gameId) {
        window.location.hash = `#${gameId}`;
      }
    });
  });
}

function renderGameContainer(appContainer: HTMLElement, mountFn: (mountPoint: HTMLElement, onBack: () => void) => () => void): void {
  window.scrollTo(0, 0);
  if (activeUnmount) {
    activeUnmount();
    activeUnmount = null;
  }

  const appHtml = `
    ${renderHeader()}
    <main id="main-content" role="main">
      <div id="game-mount-point"></div>
    </main>
    ${renderFooter()}
  `;

  appContainer.innerHTML = appHtml;

  const mountPoint = appContainer.querySelector<HTMLElement>('#game-mount-point');
  if (mountPoint) {
    activeUnmount = mountFn(mountPoint, () => {
      window.location.hash = '';
    });
  }
}

/**
 * Renderiza la vista del juego Snake en modo aislado.
 * @spec REQ-07, REQ-13
 */
function renderSnakeGameView(appContainer: HTMLElement): void {
  renderGameContainer(appContainer, mountSnake);
}

/**
 * Renderiza la vista del juego Pong en modo aislado.
 * @spec REQ-14, REQ-20
 */
function renderPongGameView(appContainer: HTMLElement): void {
  renderGameContainer(appContainer, mountPong);
}

/**
 * Renderiza la vista del juego Tetris en modo aislado.
 * @spec REQ-21, REQ-27
 */
function renderTetrisGameView(appContainer: HTMLElement): void {
  renderGameContainer(appContainer, mountTetris);
}

/**
 * Renderiza la vista del juego Breakout en modo aislado.
 * @spec REQ-28, REQ-34
 */
function renderBreakoutGameView(appContainer: HTMLElement): void {
  renderGameContainer(appContainer, mountBreakout);
}

/**
 * Renderiza la vista del juego Tres en Raya en modo aislado.
 * @spec REQ-35, REQ-40
 */
function renderTicTacToeGameView(appContainer: HTMLElement): void {
  renderGameContainer(appContainer, mountTicTacToe);
}

/**
 * Renderiza la vista del juego Space Invaders en modo aislado.
 * @spec REQ-43, REQ-48
 */
function renderSpaceInvadersGameView(appContainer: HTMLElement): void {
  renderGameContainer(appContainer, mountSpaceInvaders);
}

/**
 * Renderiza la vista del juego Pac-Man en modo aislado.
 * @spec REQ-49, REQ-52
 */
function renderPacmanGameView(appContainer: HTMLElement): void {
  renderGameContainer(appContainer, mountPacman);
}

/**
 * Renderiza la vista del juego Asteroids en modo aislado.
 * @spec REQ-53, REQ-56
 */
function renderAsteroidsGameView(appContainer: HTMLElement): void {
  renderGameContainer(appContainer, mountAsteroids);
}

/**
 * Renderiza la vista del juego Blackjack en modo aislado.
 * @spec REQ-57, REQ-60
 */
function renderBlackjackGameView(appContainer: HTMLElement): void {
  renderGameContainer(appContainer, mountBlackjack);
}

/**
 * Enruta la aplicación según el hash actual del navegador.
 * @spec REQ-13, REQ-20, REQ-27, REQ-34, REQ-40, REQ-48, REQ-52, REQ-56, REQ-60
 */
export function handleRouting(): void {
  window.scrollTo(0, 0);
  const appContainer = document.querySelector<HTMLDivElement>('#app');
  if (!appContainer) {
    console.error('[GuacamoleGH Games] Contenedor #app no encontrado.');
    return;
  }

  const hash = window.location.hash.toLowerCase();

  if (hash === '#snake') {
    renderSnakeGameView(appContainer);
  } else if (hash === '#pong') {
    renderPongGameView(appContainer);
  } else if (hash === '#tetris') {
    renderTetrisGameView(appContainer);
  } else if (hash === '#breakout') {
    renderBreakoutGameView(appContainer);
  } else if (
    hash === '#tic-tac-toe' ||
    hash === '#tres-en-raya' ||
    hash === '#tresenraya' ||
    hash === '#tictactoe'
  ) {
    renderTicTacToeGameView(appContainer);
  } else if (
    hash === '#space-invaders' ||
    hash === '#spaceinvaders' ||
    hash === '#invaders'
  ) {
    renderSpaceInvadersGameView(appContainer);
  } else if (hash === '#pacman' || hash === '#pac-man') {
    renderPacmanGameView(appContainer);
  } else if (hash === '#asteroids' || hash === '#asteroid') {
    renderAsteroidsGameView(appContainer);
  } else if (hash === '#blackjack' || hash === '#black-jack' || hash === '#21') {
    renderBlackjackGameView(appContainer);
  } else {
    renderCatalogView(appContainer);
  }
}

/**
 * Inicializa y escucha los cambios de navegación en la aplicación.
 * @spec REQ-01, REQ-13, REQ-20, REQ-27, REQ-34, REQ-40, REQ-41
 */
export function initApp(): void {
  handleRouting();
  window.addEventListener('hashchange', handleRouting);

  // Delegación de eventos para el botón global de sonido
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const muteBtn = target.closest<HTMLButtonElement>('#global-mute-btn');
    if (muteBtn) {
      const isMuted = soundManager.toggleMute();
      const iconSpan = muteBtn.querySelector('.sound-icon');
      if (iconSpan) {
        iconSpan.textContent = isMuted ? '🔇' : '🔊';
      }
      const label = isMuted ? 'Activar sonido' : 'Silenciar sonido';
      muteBtn.setAttribute('aria-label', label);
      muteBtn.setAttribute('title', label);
    }
  });

  // Reanudar contexto de audio ante la primera interacción
  const unlockAudio = (): void => {
    soundManager.initContext();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
  window.addEventListener('touchstart', unlockAudio);
}

// Ejecutar montaje cuando el DOM esté listo
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}
