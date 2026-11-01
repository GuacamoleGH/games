// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Componente de Tarjeta de Juego (GameCard) informativa y accesible.
 * @spec REQ-04, REQ-05
 */

import type { GameMetadata } from '../types/game.js';

/**
 * Renderiza el HTML semántico de una tarjeta de juego individual.
 * @spec REQ-04, REQ-05
 * @param game Metadatos del juego a representar.
 * @returns Cadena HTML del componente GameCard.
 */
export function renderGameCard(game: GameMetadata): string {
  if (!game || !game.id) {
    return '';
  }

  const html = `
    <article 
      class="game-card" 
      role="region" 
      tabindex="0" 
      aria-label="${game.title} - ${game.statusLabel}"
      data-game-id="${game.id}"
    >
      <div class="card-top">
        <div class="game-icon-box" aria-hidden="true">
          ${game.iconSvg}
        </div>
        <span class="badge-coming-soon" aria-label="Estado: ${game.statusLabel}">
          <span class="badge-dot" aria-hidden="true"></span>
          ${game.statusLabel}
        </span>
      </div>
      
      <div class="card-body">
        <h3 class="game-title">${game.title}</h3>
        <p class="game-description">${game.description}</p>
      </div>

      <div class="card-footer">
        <span class="meta-status-text">Previsto: ${game.releasePhase}</span>
        <span class="meta-type">${game.category}</span>
      </div>
    </article>
  `;
  return html;
}
