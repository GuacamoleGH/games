// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Punto de entrada público del módulo aislado de Space Invaders.
 * @spec REQ-43
 */

import { SpaceInvadersView } from './ui/SpaceInvadersView.js';

export { SpaceInvadersEngine } from './engine/SpaceInvadersEngine.js';
export * from './types.js';

/**
 * Monta el juego Space Invaders en el contenedor provisto.
 * @spec REQ-43
 * @param container Elemento contenedor donde se inyectará la vista.
 * @param onBack Callback a invocar cuando el usuario decida salir al catálogo.
 * @returns Función de limpieza (unmount).
 */
export function mountSpaceInvaders(container: HTMLElement, onBack: () => void): () => void {
  const view = new SpaceInvadersView(container, onBack);
  view.mount();

  const unmount = (): void => {
    view.destroy();
  };

  return unmount;
}
