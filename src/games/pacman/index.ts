// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Punto de entrada público del módulo aislado de Pac-Man.
 * @spec REQ-49
 */

import { PacmanView } from './ui/PacmanView.js';

export { PacmanEngine, DEFAULT_PACMAN_CONFIG } from './engine/PacmanEngine.js';
export * from './types.js';

/**
 * Monta el juego Pac-Man en el contenedor provisto.
 * @spec REQ-49
 * @param container Elemento contenedor donde se inyectará la vista.
 * @param onBack Callback a invocar cuando el usuario decida salir al catálogo.
 * @returns Función de limpieza (unmount).
 */
export function mountPacman(container: HTMLElement, onBack: () => void): () => void {
  const view = new PacmanView(container, onBack);
  view.mount();

  const unmount = (): void => {
    view.destroy();
  };

  return unmount;
}
