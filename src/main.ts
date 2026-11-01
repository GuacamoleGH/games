// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Punto de entrada principal y orquestador de vistas de GuacamoleGH Games.
 * @spec REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06, REQ-07, REQ-13, REQ-14, REQ-20
 */

import './common/styles/main.css';
import { getGames } from './common/data/games.data.js';
import { renderHeader } from './common/components/Header.js';
import { renderHero } from './common/components/Hero.js';
import { renderGameGrid } from './common/components/GameGrid.js';
import { renderFooter } from './common/components/Footer.js';
import { mountSnake } from './games/snake/index.js';
import { mountPong } from './games/pong/index.js';

let activeUnmount: (() => void) | null = null;

/**
 * Renderiza la vista principal del catálogo.
 * @spec REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06
 */
function renderCatalogView(appContainer: HTMLElement): void {
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
      if (gameId === 'snake') {
        window.location.hash = '#snake';
      } else if (gameId === 'pong') {
        window.location.hash = '#pong';
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
      if (gameId === 'snake') {
        window.location.hash = '#snake';
      } else if (gameId === 'pong') {
        window.location.hash = '#pong';
      }
    });
  });
}

/**
 * Renderiza la vista del juego Snake en modo aislado.
 * @spec REQ-07, REQ-13
 */
function renderSnakeGameView(appContainer: HTMLElement): void {
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
    activeUnmount = mountSnake(mountPoint, () => {
      window.location.hash = '';
    });
  }
}

/**
 * Renderiza la vista del juego Pong en modo aislado.
 * @spec REQ-14, REQ-20
 */
function renderPongGameView(appContainer: HTMLElement): void {
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
    activeUnmount = mountPong(mountPoint, () => {
      window.location.hash = '';
    });
  }
}

/**
 * Enruta la aplicación según el hash actual del navegador.
 * @spec REQ-13, REQ-20
 */
export function handleRouting(): void {
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
  } else {
    renderCatalogView(appContainer);
  }
}

/**
 * Inicializa y escucha los cambios de navegación en la aplicación.
 * @spec REQ-01, REQ-13, REQ-20
 */
export function initApp(): void {
  handleRouting();
  window.addEventListener('hashchange', handleRouting);
}

// Ejecutar montaje cuando el DOM esté listo
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}
