// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Pruebas unitarias de renderizado semántico y accesibilidad de componentes.
 * @spec REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06
 */

import { describe, it, expect } from 'vitest';
import { renderHeader } from '../../src/common/components/Header.js';
import { renderHero } from '../../src/common/components/Hero.js';
import { renderGameCard } from '../../src/common/components/GameCard.js';
import { renderGameGrid } from '../../src/common/components/GameGrid.js';
import { renderFooter } from '../../src/common/components/Footer.js';
import { GAMES_DATA } from '../../src/common/data/games.data.js';

describe('Renderizado de Componentes UI (@spec REQ-01 a REQ-06)', () => {
  it('renderHeader debe generar la cabecera semántica con logo y título (@spec REQ-01)', () => {
    const html = renderHeader();
    expect(html).toContain('<header class="site-header"');
    expect(html).toContain('src="/logo.png"');
    expect(html).toContain('GuacamoleGH');
    expect(html).toContain('Games');
    expect(html).toContain('Homelab Edition');
  });

  it('renderHero debe generar la sección de presentación arcade (@spec REQ-02)', () => {
    const html = renderHero();
    expect(html).toContain('<section class="hero-section"');
    expect(html).toContain('Arcade Clásico en tu');
    expect(html).toContain('Navegador');
    expect(html).toContain('Colección Arcade Retro');
  });

  it('renderGameCard debe renderizar una tarjeta segura sin enlaces rotos (@spec REQ-04, REQ-05)', () => {
    const sampleGame = GAMES_DATA[0]!;
    const html = renderGameCard(sampleGame);

    expect(html).toContain('<article');
    expect(html).toContain('class="game-card"');
    expect(html).toContain('role="region"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain(sampleGame.title);
    expect(html).toContain(sampleGame.description);
    expect(html).toContain('Próximamente');

    // REQ-05: Verificación estricta de que NO hay enlaces engañosos ni botones que fallen
    expect(html).not.toContain('<a href');
    expect(html).not.toContain('<button');
  });

  it('renderGameGrid debe renderizar las 5 tarjetas de los juegos planificados (@spec REQ-03)', () => {
    const html = renderGameGrid(GAMES_DATA);

    expect(html).toContain('Catálogo de Juegos');
    expect(html).toContain('5 títulos');

    for (const game of GAMES_DATA) {
      expect(html).toContain(`data-game-id="${game.id}"`);
      expect(html).toContain(game.title);
    }
  });

  it('renderFooter debe incluir créditos y enlace al repositorio (@spec REQ-06)', () => {
    const html = renderFooter();

    expect(html).toContain('<footer class="site-footer"');
    expect(html).toContain('GuacamoleGH Games');
    expect(html).toContain('https://github.com/GuacamoleGH/games');
    expect(html).toContain('SDD con dbv-specs-ops');
  });
});
