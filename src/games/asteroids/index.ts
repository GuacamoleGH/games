// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Punto de entrada público del módulo aislado de Asteroids.
 * @spec REQ-53
 */

import { AsteroidsView } from './ui/AsteroidsView.js';

export { AsteroidsEngine, DEFAULT_ASTEROIDS_CONFIG } from './engine/AsteroidsEngine.js';
export * from './types.js';

/**
 * Monta el juego Asteroids en el contenedor provisto.
 * @spec REQ-53
 * @param container Elemento contenedor donde se inyectará la vista.
 * @param onBack Callback a invocar cuando el usuario decida salir al catálogo.
 * @returns Función de limpieza (unmount).
 */
export function mountAsteroids(container: HTMLElement, onBack: () => void): () => void {
  const view = new AsteroidsView(container, onBack);
  view.mount();

  const unmount = (): void => {
    view.destroy();
  };

  return unmount;
}
