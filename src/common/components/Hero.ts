// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Componente de Introducción (Hero) de GuacamoleGH Games.
 * @spec REQ-02
 */

/**
 * Renderiza el HTML semántico de la sección Hero.
 * @spec REQ-02
 * @returns Cadena HTML del componente Hero.
 */
export function renderHero(): string {
  const html = `
    <section class="hero-section" aria-labelledby="hero-title">
      <div class="container">
        <div class="hero-pill">
          <span class="hero-pill-dot" aria-hidden="true"></span>
          <span>Colección Arcade Retro</span>
        </div>
        <h1 id="hero-title" class="hero-title">
          Arcade Clásico en tu <span class="hero-title-highlight">Navegador</span>
        </h1>
        <p class="hero-description">
          Una colección curada de juegos arcade retro construidos para jugar al instante, ligeros y sin dependencias externas.
        </p>
      </div>
    </section>
  `;
  return html;
}
