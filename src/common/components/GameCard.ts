// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Componente de Tarjeta de Juego (GameCard) informativa y accesible.
 * @spec REQ-04, REQ-05, REQ-13
 */

import type { GameMetadata } from '../types/game.js';

/**
 * Renderiza el HTML semántico de una tarjeta de juego individual.
 * @spec REQ-04, REQ-05, REQ-13
 * @param game Metadatos del juego a representar.
 * @returns Cadena HTML del componente GameCard.
 */
export function renderGameCard(game: GameMetadata): string {
  if (!game || !game.id) {
    return '';
  }

  const isAvailable = game.status === 'available';
  const cardClass = isAvailable ? 'game-card card-available' : 'game-card';
  const badgeMarkup = !isAvailable
    ? `<span class="badge-coming-soon" aria-label="Estado: ${game.statusLabel}">
        <span class="badge-dot" aria-hidden="true"></span>
        ${game.statusLabel}
      </span>`
    : '';

  const actionButton = isAvailable
    ? `<button class="btn-play-game" data-play-id="${game.id}" aria-label="Jugar a ${game.title}">Jugar Ahora &rarr;</button>`
    : '';

  const iconMarkup = game.iconUrl
    ? `<img src="${game.iconUrl}" alt="" class="game-icon-img" width="38" height="38" loading="lazy" />`
    : game.iconSvg;

  const html = `
    <article 
      class="${cardClass}" 
      role="region" 
      tabindex="0" 
      aria-label="${game.title}"
      data-game-id="${game.id}"
    >
      <div class="card-top">
        <div class="card-title-group">
          <div class="game-icon-box" aria-hidden="true">
            ${iconMarkup}
          </div>
          <h3 class="game-title">${game.title}</h3>
        </div>
        ${badgeMarkup}
      </div>
      
      <div class="card-body">
        <p class="game-description">${game.description}</p>
        ${actionButton}
      </div>
    </article>
  `;
  return html;
}
