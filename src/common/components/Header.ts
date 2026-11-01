// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import { soundManager } from '../audio/SoundEffects.js';

/**
 * @fileoverview Componente de Cabecera (Header) con logotipo y marca de GuacamoleGH Games.
 * @spec REQ-01, REQ-41
 */

/**
 * Renderiza el HTML semántico de la cabecera principal incluyendo el control de audio.
 * @spec REQ-01, REQ-41
 * @returns Cadena HTML del componente Header.
 */
export function renderHeader(): string {
  const muted = soundManager.isMuted();
  const icon = muted ? '🔇' : '🔊';
  const label = muted ? 'Activar sonido' : 'Silenciar sonido';

  const html = `
    <header class="site-header" role="banner">
      <div class="container header-inner">
        <a href="/" class="brand-wrapper" aria-label="GuacamoleGH Games - Inicio">
          <img src="/logo.png" alt="GuacamoleGH Logo" class="brand-logo-img" width="38" height="38" />
          <span class="brand-title">
            GuacamoleGH <span class="brand-title-accent">Games</span>
          </span>
        </a>
        <div class="header-status">
          <button id="global-mute-btn" class="sound-toggle-btn" type="button" aria-label="${label}" title="${label}">
            <span class="sound-icon" aria-hidden="true">${icon}</span>
          </button>
          <span class="header-tag" aria-label="Edición Homelab">Homelab Edition</span>
        </div>
      </div>
    </header>
  `;
  return html;
}
