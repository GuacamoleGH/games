// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Punto de entrada público del módulo aislado de Tres en Raya (Tic-Tac-Toe).
 * @spec REQ-35
 */

import { TicTacToeView } from './ui/TicTacToeView.js';

/**
 * Monta el juego Tres en Raya en el contenedor provisto.
 * @spec REQ-35
 * @param container Elemento contenedor donde se inyectará la vista.
 * @param onBack Callback a invocar cuando el usuario decida salir al catálogo.
 * @returns Función de limpieza (unmount).
 */
export function mountTicTacToe(container: HTMLElement, onBack: () => void): () => void {
  const view = new TicTacToeView(container, onBack);
  view.mount();

  const unmount = (): void => {
    view.destroy();
  };

  return unmount;
}
