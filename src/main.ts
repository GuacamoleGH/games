// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Punto de entrada principal y ensamblaje de la aplicación GuacamoleGH Games.
 * @spec REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06
 */

import './common/styles/main.css';
import { getGames } from './common/data/games.data.js';
import { renderHeader } from './common/components/Header.js';
import { renderHero } from './common/components/Hero.js';
import { renderGameGrid } from './common/components/GameGrid.js';
import { renderFooter } from './common/components/Footer.js';

/**
 * Inicializa y renderiza la aplicación web en el contenedor raíz.
 * @spec REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06
 */
export function initApp(): void {
  const appContainer = document.querySelector<HTMLDivElement>('#app');

  if (!appContainer) {
    console.error('[GuacamoleGH Games] Contenedor #app no encontrado en el DOM.');
    return;
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
}

// Ejecutar montaje cuando el DOM esté listo
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}
