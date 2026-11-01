// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Componente de Cuadrícula del Catálogo (GameGrid) responsive.
 * @spec REQ-03
 */

import type { GameMetadata } from '../types/game.js';
import { renderGameCard } from './GameCard.js';

/**
 * Renderiza el HTML semántico de la sección de cuadrícula de juegos.
 * @spec REQ-03
 * @param games Lista inmutable de juegos.
 * @returns Cadena HTML del contenedor y cuadrícula de tarjetas.
 */
export function renderGameGrid(games: readonly GameMetadata[]): string {
  if (!games || games.length === 0) {
    return '<section class="catalog-section"><div class="container"><p>No hay juegos disponibles en este momento.</p></div></section>';
  }

  const cardsHtml = games.map((game) => renderGameCard(game)).join('\n');

  const html = `
    <section class="catalog-section" aria-labelledby="catalog-heading">
      <div class="container">
        <div class="catalog-header">
          <h2 id="catalog-heading" class="catalog-heading">
            Catálogo de Juegos
            <span class="catalog-count">${games.length} títulos</span>
          </h2>
        </div>
        <div class="game-grid">
          ${cardsHtml}
        </div>
      </div>
    </section>
  `;
  return html;
}
