// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Pruebas unitarias para requisitos no funcionales (RNF).
 * @spec RNF-01, RNF-02, RNF-03, RNF-04
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Requisitos No Funcionales (@spec RNF-01, RNF-02, RNF-03, RNF-04)', () => {
  it('RNF-01: El código de datos y estilos debe mantenerse ligero y sin dependencias pesadas (@spec RNF-01)', () => {
    const cssPath = path.resolve(process.cwd(), 'src/common/styles/main.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    // El CSS fuente debe ser compacto (< 30KB)
    expect(cssContent.length).toBeLessThan(30000);
  });

  it('RNF-02: El CSS debe incluir reglas responsive para móvil, tablet y escritorio (@spec RNF-02)', () => {
    const cssPath = path.resolve(process.cwd(), 'src/common/styles/main.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    expect(cssContent).toContain('@media (min-width: 640px)');
    expect(cssContent).toContain('@media (min-width: 1024px)');
  });

  it('RNF-03: Debe cumplir directrices de accesibilidad semántica y foco visible (@spec RNF-03)', () => {
    const resetPath = path.resolve(process.cwd(), 'src/common/styles/reset.css');
    const resetContent = fs.readFileSync(resetPath, 'utf-8');

    expect(resetContent).toContain(':focus-visible');
    expect(resetContent).toContain('outline: 2px solid');
  });

  it('RNF-04: Los archivos robots.txt y llms.txt deben existir y declarar señales para agentes (@spec RNF-04)', () => {
    const robotsPath = path.resolve(process.cwd(), 'public/robots.txt');
    const llmsPath = path.resolve(process.cwd(), 'public/llms.txt');

    expect(fs.existsSync(robotsPath)).toBe(true);
    expect(fs.existsSync(llmsPath)).toBe(true);

    const robotsContent = fs.readFileSync(robotsPath, 'utf-8');
    expect(robotsContent).toContain('Content-Signal');
  });
});
