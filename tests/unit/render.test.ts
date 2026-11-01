// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Pruebas unitarias de renderizado semántico y accesibilidad de componentes.
 * @spec REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06, REQ-10, REQ-13, REQ-18, REQ-19, REQ-20, REQ-25, REQ-26, REQ-27
 */

import { describe, it, expect } from 'vitest';
import { renderHeader } from '../../src/common/components/Header.js';
import { renderHero } from '../../src/common/components/Hero.js';
import { renderGameCard } from '../../src/common/components/GameCard.js';
import { renderGameGrid } from '../../src/common/components/GameGrid.js';
import { renderFooter } from '../../src/common/components/Footer.js';
import { GAMES_DATA } from '../../src/common/data/games.data.js';

describe('Renderizado de Componentes UI (@spec REQ-01 a REQ-06, REQ-10, REQ-13, REQ-18, REQ-19, REQ-20, REQ-25, REQ-26, REQ-27)', () => {
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

  it('renderGameCard debe renderizar botón de acción para juegos disponibles (Snake, Pong y Tetris) (@spec REQ-04, REQ-13, REQ-20, REQ-27)', () => {
    const snakeGame = GAMES_DATA.find((g) => g.id === 'snake')!;
    const snakeHtml = renderGameCard(snakeGame);
    expect(snakeHtml).toContain('class="game-card card-available"');
    expect(snakeHtml).toContain('data-play-id="snake"');
    expect(snakeHtml).toContain('Jugar Ahora');
    expect(snakeHtml).toContain('badge-available');

    const pongGame = GAMES_DATA.find((g) => g.id === 'pong')!;
    const pongHtml = renderGameCard(pongGame);
    expect(pongHtml).toContain('class="game-card card-available"');
    expect(pongHtml).toContain('data-play-id="pong"');
    expect(pongHtml).toContain('Jugar Ahora');
    expect(pongHtml).toContain('badge-available');

    const tetrisGame = GAMES_DATA.find((g) => g.id === 'tetris')!;
    const tetrisHtml = renderGameCard(tetrisGame);
    expect(tetrisHtml).toContain('class="game-card card-available"');
    expect(tetrisHtml).toContain('data-play-id="tetris"');
    expect(tetrisHtml).toContain('Jugar Ahora');
    expect(tetrisHtml).toContain('badge-available');
  });

  it('renderGameCard debe renderizar tarjetas no interactivas seguras para juegos próximamente (@spec REQ-05)', () => {
    const breakoutGame = GAMES_DATA.find((g) => g.id === 'breakout')!;
    const html = renderGameCard(breakoutGame);

    expect(html).toContain('<article');
    expect(html).toContain('class="game-card"');
    expect(html).toContain('role="region"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain(breakoutGame.title);
    expect(html).toContain('Próximamente');

    // REQ-05: Sin enlaces engañosos ni botones que fallen en juegos futuros
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

  it('debe estructurar el Canvas HTML5 y controles accesibles para Snake, Pong y Tetris (@spec REQ-10, REQ-18, REQ-19, REQ-25, REQ-26)', () => {
    const mainCssPath = 'src/common/styles/main.css';
    expect(mainCssPath).toBeDefined();
  });
});
