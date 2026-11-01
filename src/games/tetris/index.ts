// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Punto de entrada público del módulo aislado de Tetris.
 * @spec REQ-21
 */

import { TetrisView } from './ui/TetrisView.js';

/**
 * Monta el juego Tetris en el contenedor provisto.
 * @spec REQ-21
 * @param container Elemento contenedor donde se inyectará la vista.
 * @param onBack Callback a invocar cuando el usuario decida salir al catálogo.
 * @returns Función de limpieza (unmount).
 */
export function mountTetris(container: HTMLElement, onBack: () => void): () => void {
  const view = new TetrisView(container, onBack);
  view.mount();

  const unmount = (): void => {
    view.destroy();
  };

  return unmount;
}
