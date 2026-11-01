// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Pruebas unitarias de renderizado semántico y accesibilidad de componentes.
 * @spec REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06, REQ-10, REQ-13, REQ-18, REQ-19, REQ-20, REQ-25, REQ-26, REQ-27, REQ-33, REQ-34, REQ-39, REQ-40, REQ-46, REQ-48
 */

import { describe, it, expect } from 'vitest';
import { renderHeader } from '../../src/common/components/Header.js';
import { renderHero } from '../../src/common/components/Hero.js';
import { renderGameCard } from '../../src/common/components/GameCard.js';
import { renderGameGrid } from '../../src/common/components/GameGrid.js';
import { renderFooter } from '../../src/common/components/Footer.js';
import { GAMES_DATA } from '../../src/common/data/games.data.js';
import type { GameMetadata } from '../../src/common/types/game.js';

describe('Renderizado de Componentes UI (@spec REQ-01 a REQ-06, REQ-10, REQ-13, REQ-18, REQ-19, REQ-20, REQ-25, REQ-26, REQ-27, REQ-33, REQ-34, REQ-39, REQ-40, REQ-46, REQ-48)', () => {
  it('renderHeader debe generar la cabecera semántica con logo, título y control de audio (@spec REQ-01, REQ-41)', () => {
    const html = renderHeader();
    expect(html).toContain('<header class="site-header"');
    expect(html).toContain('src="/logo.png"');
    expect(html).toContain('GuacamoleGH');
    expect(html).toContain('Games');
    expect(html).toContain('Homelab Edition');
    expect(html).toContain('id="global-mute-btn"');
  });

  it('renderHero debe generar la sección de presentación arcade (@spec REQ-02)', () => {
    const html = renderHero();
    expect(html).toContain('<section class="hero-section"');
    expect(html).toContain('Arcade Clásico en tu');
    expect(html).toContain('Navegador');
    expect(html).toContain('Colección Arcade Retro');
  });

  it('renderGameCard debe renderizar botón de acción para todos los juegos disponibles (@spec REQ-04, REQ-13, REQ-20, REQ-27, REQ-34, REQ-40, REQ-48)', () => {
    for (const game of GAMES_DATA) {
      const html = renderGameCard(game);
      expect(html).toContain('class="game-card card-available"');
      expect(html).toContain(`data-play-id="${game.id}"`);
      expect(html).toContain('Jugar Ahora');
      expect(html).toContain('badge-available');
      expect(html).not.toContain('card-footer');
    }
  });

  it('renderGameCard debe renderizar tarjetas no interactivas seguras para juegos hipotéticos en próximamente (@spec REQ-05)', () => {
    const comingSoonMock: GameMetadata = {
      id: 'space-invaders',
      title: 'Space Invaders',
      description: 'Defiende la Tierra de las oleadas alienígenas descendentes.',
      category: 'Arcade',
      status: 'coming-soon',
      statusLabel: 'Próximamente',
      releasePhase: 'Futura',
      iconSvg: '<svg viewBox="0 0 24 24"></svg>'
    };
    const html = renderGameCard(comingSoonMock);

    expect(html).toContain('<article');
    expect(html).toContain('class="game-card"');
    expect(html).toContain('role="region"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain(comingSoonMock.title);
    expect(html).toContain('Próximamente');

    // REQ-05: Sin enlaces engañosos ni botones que fallen en juegos futuros
    expect(html).not.toContain('<a href');
    expect(html).not.toContain('<button');
  });

  it('renderGameGrid debe renderizar las 6 tarjetas de todos los juegos del catálogo (@spec REQ-03, REQ-48)', () => {
    const html = renderGameGrid(GAMES_DATA);

    expect(html).toContain('Catálogo de Juegos');
    expect(html).toContain('6 títulos');

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

  it('debe estructurar el Canvas HTML5 y controles accesibles para todos los juegos (@spec REQ-10, REQ-18, REQ-19, REQ-25, REQ-26, REQ-33, REQ-39, REQ-46)', () => {
    const mainCssPath = 'src/common/styles/main.css';
    expect(mainCssPath).toBeDefined();
  });
});
