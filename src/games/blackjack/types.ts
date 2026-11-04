// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Tipos y modelos de datos para el juego Blackjack.
 * @spec REQ-57, REQ-58
 */

export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export type Rank =
  | 'A'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K';

export interface Card {
  readonly suit: Suit;
  readonly rank: Rank;
  readonly value: number;
  readonly isHidden?: boolean;
}

export type RoundStatus = 'BETTING' | 'PLAYER_TURN' | 'DEALER_TURN' | 'ROUND_OVER';

export type RoundOutcome =
  | 'PLAYER_WIN'
  | 'DEALER_WIN'
  | 'PUSH'
  | 'PLAYER_BLACKJACK'
  | 'DEALER_BLACKJACK'
  | 'PLAYER_BUST'
  | 'DEALER_BUST'
  | null;

export interface Hand {
  readonly cards: readonly Card[];
  readonly score: number;
  readonly isSoft: boolean;
  readonly isBlackjack: boolean;
  readonly isBust: boolean;
}

export interface BlackjackStats {
  handsWon: number;
  handsLost: number;
  pushes: number;
  blackjacks: number;
}

export interface BlackjackSnapshot {
  readonly status: RoundStatus;
  readonly outcome: RoundOutcome;
  readonly splitOutcome: RoundOutcome;
  readonly chips: number;
  readonly currentBet: number;
  readonly splitBet: number;
  readonly highScoreChips: number;
  readonly playerHand: Hand;
  readonly splitHand: Hand | null;
  readonly dealerHand: Hand;
  readonly activeHandIndex: number;
  readonly stats: BlackjackStats;
  readonly canHit: boolean;
  readonly canStand: boolean;
  readonly canDouble: boolean;
  readonly canSplit: boolean;
  readonly canDeal: boolean;
  readonly remainingCards: number;
  readonly totalShoeCards: number;
}
