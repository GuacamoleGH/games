// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Componente de Cabecera (Header) con logotipo y marca de GuacamoleGH Games.
 * @spec REQ-01
 */

/**
 * Renderiza el HTML semántico de la cabecera principal.
 * @spec REQ-01
 * @returns Cadena HTML del componente Header.
 */
export function renderHeader(): string {
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
          <span class="header-tag" aria-label="Edición Homelab">Homelab Edition</span>
        </div>
      </div>
    </header>
  `;
  return html;
}
