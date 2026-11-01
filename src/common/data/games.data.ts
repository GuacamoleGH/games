// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Registro inmutable de los 5 juegos clásicos planificados para GuacamoleGH Games.
 * @spec REQ-03, REQ-04
 */

import type { GameMetadata } from '../types/game.js';

export const GAMES_DATA: readonly GameMetadata[] = Object.freeze([
  {
    id: 'snake',
    title: 'Snake',
    description: 'Guía a la serpiente para devorar comida mientras crece en longitud. Evita impactar con los muros o con tu propio cuerpo.',
    category: 'Arcade',
    status: 'available',
    statusLabel: 'Jugar',
    releasePhase: 'Fase 2 (Disponible)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 2a4 4 0 0 0-4 4v4a4 4 0 0 1-4 4v0a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-4a4 4 0 0 1-4-4V6a4 4 0 0 0-4-4z"/>
      <circle cx="10" cy="6" r="1" fill="currentColor"/>
    </svg>`
  },
  {
    id: 'pong',
    title: 'Pong',
    description: 'El duelo original de dos dimensiones. Controla tu pala para golpear la pelota y superar al oponente en reflejos y precisión.',
    category: 'Clásico',
    status: 'available',
    statusLabel: 'Jugar',
    releasePhase: 'Fase 3 (Disponible)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <line x1="4" y1="6" x2="4" y2="18"/>
      <line x1="20" y1="8" x2="20" y2="20"/>
      <circle cx="12" cy="13" r="2" fill="currentColor"/>
      <line x1="12" y1="2" x2="12" y2="6" stroke-dasharray="2 2"/>
      <line x1="12" y1="18" x2="12" y2="22" stroke-dasharray="2 2"/>
    </svg>`
  },
  {
    id: 'tetris',
    title: 'Tetris',
    description: 'Rota y encaja las piezas geométricas en caída continua para completar líneas horizontales y despejar la matriz antes de que se llene.',
    category: 'Puzzle',
    status: 'available',
    statusLabel: 'Jugar',
    releasePhase: 'Fase 4 (Disponible)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="7" height="7"/>
      <rect x="13" y="4" width="7" height="7"/>
      <rect x="13" y="13" width="7" height="7"/>
      <rect x="4" y="13" width="7" height="7"/>
    </svg>`
  },
  {
    id: 'breakout',
    title: 'Breakout',
    description: 'Lanza la bola con tu paleta inferior para destruir metódicamente las barreras de ladrillos superiores calculando cada ángulo de rebote.',
    category: 'Arcade',
    status: 'available',
    statusLabel: 'Jugar',
    releasePhase: 'Fase 5 (Disponible)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="4" height="3" fill="currentColor"/>
      <rect x="10" y="4" width="4" height="3" fill="currentColor"/>
      <rect x="17" y="4" width="4" height="3" fill="currentColor"/>
      <rect x="3" y="9" width="4" height="3" fill="currentColor"/>
      <rect x="10" y="9" width="4" height="3" fill="currentColor"/>
      <rect x="17" y="9" width="4" height="3" fill="currentColor"/>
      <circle cx="12" cy="15" r="1.5" fill="currentColor"/>
      <line x1="8" y1="20" x2="16" y2="20" stroke-width="3"/>
    </svg>`
  },
  {
    id: 'tic-tac-toe',
    title: 'Tres en raya',
    description: 'Duelo táctico de ingenio por turnos sobre una cuadrícula de 3x3. Sé el primero en alinear tres fichas en horizontal, vertical o diagonal.',
    category: 'Estrategia',
    status: 'available',
    statusLabel: 'Jugar',
    releasePhase: 'Fase 6 (Disponible)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <line x1="8" y1="3" x2="8" y2="21"/>
      <line x1="16" y1="3" x2="16" y2="21"/>
      <line x1="3" y1="8" x2="21" y2="8"/>
      <line x1="3" y1="16" x2="21" y2="16"/>
      <path d="M4.5 4.5l2 2m0-2l-2 2"/>
      <circle cx="12" cy="12" r="1.5"/>
      <path d="M17.5 17.5l2 2m0-2l-2 2"/>
    </svg>`
  }
]);

/**
 * Retorna la lista inmutable de juegos del catálogo.
 * @spec REQ-03
 * @returns Lista de metadatos de los juegos.
 */
export function getGames(): readonly GameMetadata[] {
  const games = GAMES_DATA;
  return games;
}
