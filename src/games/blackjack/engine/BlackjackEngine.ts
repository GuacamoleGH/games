// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Motor de juego puro y desacoplado del DOM para Blackjack (21).
 * Implementa baraja estándar de 52 cartas, crupier se planta en 17, doble, dividir y pago 3:2.
 * @spec REQ-58
 */

import type {
  Card,
  Hand,
  Rank,
  RoundOutcome,
  RoundStatus,
  Suit,
  BlackjackSnapshot,
  BlackjackStats
} from '../types.js';

const SUITS: readonly Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS: readonly { rank: Rank; value: number }[] = [
  { rank: 'A', value: 11 },
  { rank: '2', value: 2 },
  { rank: '3', value: 3 },
  { rank: '4', value: 4 },
  { rank: '5', value: 5 },
  { rank: '6', value: 6 },
  { rank: '7', value: 7 },
  { rank: '8', value: 8 },
  { rank: '9', value: 9 },
  { rank: '10', value: 10 },
  { rank: 'J', value: 10 },
  { rank: 'Q', value: 10 },
  { rank: 'K', value: 10 }
];

export class BlackjackEngine {
  private deck: Card[] = [];
  private deckCount: number = 6;
  private playerCards: Card[] = [];
  private splitCards: Card[] = [];
  private dealerCards: Card[] = [];

  private chips: number = 500;
  private currentBet: number = 10;
  private splitBet: number = 0;
  private highScoreChips: number = 500;

  private status: RoundStatus = 'BETTING';
  private outcome: RoundOutcome = null;
  private splitOutcome: RoundOutcome = null;
  private activeHandIndex: number = 0; // 0 = mano principal, 1 = mano dividida

  private stats: BlackjackStats = {
    handsWon: 0,
    handsLost: 0,
    pushes: 0,
    blackjacks: 0
  };

  public onSoundEvent?: (event: 'click' | 'step' | 'win' | 'lose' | 'bounce') => void;

  constructor(initialChips: number = 500, initialHighScore: number = 500) {
    this.chips = initialChips;
    this.highScoreChips = Math.max(initialChips, initialHighScore);
    this.currentBet = Math.min(10, this.chips);
    this.initDeck();
  }

  /**
   * Crea y baraja un zapato de múltiples barajas (6 barajas = 312 cartas por defecto)
   * con el algoritmo Fisher-Yates para impedir el conteo fácil de cartas.
   * @spec REQ-58
   */
  public initDeck(decks: number = 6): void {
    this.deckCount = decks;
    const cards: Card[] = [];
    for (let d = 0; d < decks; d++) {
      for (const suit of SUITS) {
        for (const item of RANKS) {
          cards.push({
            suit,
            rank: item.rank,
            value: item.value
          });
        }
      }
    }

    // Barajado Fisher-Yates
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = cards[i]!;
      cards[i] = cards[j]!;
      cards[j] = temp;
    }

    this.deck = cards;
  }

  /**
   * Roba una carta del zapato. Si queda menos de 1 baraja (< 52 cartas), se baraja el zapato completo.
   */
  private drawCard(hidden: boolean = false): Card {
    if (this.deck.length < 52) {
      this.initDeck(this.deckCount);
    }
    const card = this.deck.pop();
    const finalCard: Card = card
      ? { ...card, isHidden: hidden }
      : { suit: 'spades', rank: 'A', value: 11, isHidden: hidden };
    return finalCard;
  }

  public setBet(amount: number): boolean {
    if (this.status !== 'BETTING') {
      return false;
    }
    const safeAmount = Math.max(10, Math.min(this.chips, amount));
    this.currentBet = safeAmount;
    if (this.onSoundEvent) {
      this.onSoundEvent('click');
    }
    return true;
  }

  public addBet(amount: number): boolean {
    if (this.status !== 'BETTING') {
      return false;
    }
    const newAmount = this.currentBet + amount;
    if (newAmount > this.chips) {
      return false;
    }
    this.currentBet = newAmount;
    if (this.onSoundEvent) {
      this.onSoundEvent('click');
    }
    return true;
  }

  public resetBet(): void {
    if (this.status !== 'BETTING') return;
    this.currentBet = Math.min(10, this.chips);
  }

  public reloadChips(amount: number = 500): void {
    if (this.chips <= 0) {
      this.chips = amount;
      this.currentBet = Math.min(10, this.chips);
      if (this.onSoundEvent) {
        this.onSoundEvent('win');
      }
    }
  }

  /**
   * Comienza la ronda repartiendo 2 cartas al jugador y 2 al crupier (1 oculta).
   * @spec REQ-58
   */
  public deal(): boolean {
    if (this.status !== 'BETTING') {
      return false;
    }
    if (this.chips < this.currentBet || this.currentBet <= 0) {
      return false;
    }

    // Descontar apuesta
    this.chips -= this.currentBet;
    this.status = 'PLAYER_TURN';
    this.outcome = null;
    this.splitOutcome = null;
    this.splitCards = [];
    this.splitBet = 0;
    this.activeHandIndex = 0;

    // Repartir 2 cartas a jugador y 2 a dealer (1 oculta)
    this.playerCards = [this.drawCard(false), this.drawCard(false)];
    this.dealerCards = [this.drawCard(false), this.drawCard(true)];

    if (this.onSoundEvent) {
      this.onSoundEvent('step');
    }

    const playerHand = this.calculateHand(this.playerCards);
    const dealerHand = this.calculateHand(this.dealerCards, true);

    // Comprobar Blackjack Natural
    if (playerHand.isBlackjack) {
      this.revealDealerHoleCard();
      if (dealerHand.isBlackjack) {
        this.finishRound('PUSH');
      } else {
        this.stats.blackjacks += 1;
        this.finishRound('PLAYER_BLACKJACK');
      }
      return true;
    }

    if (dealerHand.isBlackjack) {
      this.revealDealerHoleCard();
      this.finishRound('DEALER_BLACKJACK');
      return true;
    }

    return true;
  }

  /**
   * Comprueba si el jugador puede dividir sus cartas (Split).
   * Regla: primera mano de 2 cartas con igual valor/rango y fichas suficientes.
   */
  public canSplit(): boolean {
    if (this.status !== 'PLAYER_TURN') {
      return false;
    }
    if (this.splitCards.length > 0) {
      return false; // Máximo 1 división por ronda
    }
    if (this.playerCards.length !== 2) {
      return false;
    }
    const c1 = this.playerCards[0]!;
    const c2 = this.playerCards[1]!;
    const sameValueOrRank = c1.value === c2.value || c1.rank === c2.rank;
    return sameValueOrRank && this.chips >= this.currentBet;
  }

  /**
   * Divide la mano del jugador en dos manos independientes (Split).
   * @spec REQ-58
   */
  public split(): boolean {
    if (!this.canSplit()) {
      return false;
    }

    // Descontar apuesta equivalente para la segunda mano
    this.chips -= this.currentBet;
    this.splitBet = this.currentBet;

    // Mover la segunda carta a splitCards
    const secondCard = this.playerCards.pop()!;
    this.splitCards = [secondCard];

    // Robar una carta para cada mano
    this.playerCards.push(this.drawCard(false));
    this.splitCards.push(this.drawCard(false));

    this.activeHandIndex = 0;

    if (this.onSoundEvent) {
      this.onSoundEvent('step');
    }

    // Si la mano 1 tiene 21 de inmediato, avanzar automáticamente a la mano 2
    if (this.calculateHand(this.playerCards).score === 21) {
      this.activeHandIndex = 1;
      if (this.calculateHand(this.splitCards).score === 21) {
        this.stand();
      }
    }

    return true;
  }

  /**
   * El jugador pide una carta (Hit).
   * @spec REQ-58
   */
  public hit(): boolean {
    if (this.status !== 'PLAYER_TURN') {
      return false;
    }

    if (this.onSoundEvent) {
      this.onSoundEvent('step');
    }

    if (this.splitCards.length > 0) {
      // Manejar mano activa en split
      if (this.activeHandIndex === 0) {
        this.playerCards.push(this.drawCard(false));
        const hand = this.calculateHand(this.playerCards);
        if (hand.isBust || hand.score === 21) {
          this.activeHandIndex = 1;
          if (this.calculateHand(this.splitCards).score === 21) {
            this.stand();
          }
        }
      } else {
        this.splitCards.push(this.drawCard(false));
        const hand = this.calculateHand(this.splitCards);
        if (hand.isBust || hand.score === 21) {
          this.stand();
        }
      }
      return true;
    }

    // Juego estándar sin split
    const newCard = this.drawCard(false);
    this.playerCards.push(newCard);

    const playerHand = this.calculateHand(this.playerCards);
    if (playerHand.isBust) {
      this.revealDealerHoleCard();
      this.finishRound('PLAYER_BUST');
    } else if (playerHand.score === 21) {
      this.stand();
    }

    return true;
  }

  /**
   * Dobla la apuesta actual y roba exactamente una carta más (Double Down).
   * @spec REQ-58
   */
  public doubleDown(): boolean {
    if (this.status !== 'PLAYER_TURN') {
      return false;
    }

    if (this.splitCards.length > 0) {
      // Doblar en mano dividida
      const activeCards = this.activeHandIndex === 0 ? this.playerCards : this.splitCards;
      if (activeCards.length !== 2 || this.chips < this.currentBet) {
        return false;
      }
      this.chips -= this.currentBet;
      if (this.activeHandIndex === 0) {
        this.currentBet *= 2;
      } else {
        this.splitBet *= 2;
      }
      activeCards.push(this.drawCard(false));
      if (this.onSoundEvent) {
        this.onSoundEvent('step');
      }
      if (this.activeHandIndex === 0) {
        this.activeHandIndex = 1;
      } else {
        this.stand();
      }
      return true;
    }

    if (this.playerCards.length !== 2 || this.chips < this.currentBet) {
      return false;
    }

    // Descontar la apuesta adicional equivalente
    this.chips -= this.currentBet;
    this.currentBet *= 2;

    const newCard = this.drawCard(false);
    this.playerCards.push(newCard);

    if (this.onSoundEvent) {
      this.onSoundEvent('step');
    }

    const playerHand = this.calculateHand(this.playerCards);
    if (playerHand.isBust) {
      this.revealDealerHoleCard();
      this.finishRound('PLAYER_BUST');
    } else {
      this.stand();
    }

    return true;
  }

  /**
   * El jugador se planta (Stand). Si hay split pendiente pasa a mano 2; si no, juega el crupier.
   * @spec REQ-58
   */
  public stand(): boolean {
    if (this.status !== 'PLAYER_TURN') {
      return false;
    }

    if (this.splitCards.length > 0 && this.activeHandIndex === 0) {
      // Plantarse en mano 1: pasa el turno a mano 2
      this.activeHandIndex = 1;
      if (this.calculateHand(this.splitCards).score === 21) {
        // Si mano 2 ya tiene 21, termina turno de jugador
        return this.stand();
      }
      return true;
    }

    this.status = 'DEALER_TURN';
    this.revealDealerHoleCard();

    // Comprobar si al menos una mano no se ha pasado (no bust)
    const hand1Bust = this.calculateHand(this.playerCards).isBust;
    const hand2Bust = this.splitCards.length > 0 ? this.calculateHand(this.splitCards).isBust : true;

    // El crupier solo pide carta si hay al menos una mano viva
    if (!hand1Bust || !hand2Bust) {
      let dealerHand = this.calculateHand(this.dealerCards);
      while (dealerHand.score < 17) {
        this.dealerCards.push(this.drawCard(false));
        dealerHand = this.calculateHand(this.dealerCards);
      }
    }

    this.resolveAllHands();
    return true;
  }

  private revealDealerHoleCard(): void {
    this.dealerCards = this.dealerCards.map((c) => ({ ...c, isHidden: false }));
  }

  /**
   * Resuelve el resultado de la ronda para mano simple o manos divididas.
   */
  private resolveAllHands(): void {
    const dealerHand = this.calculateHand(this.dealerCards);

    const resolveHand = (hand: Hand): RoundOutcome => {
      if (hand.isBust) {
        return 'PLAYER_BUST';
      }
      if (dealerHand.isBust) {
        return 'DEALER_BUST';
      }
      if (hand.score > dealerHand.score) {
        return 'PLAYER_WIN';
      }
      if (hand.score < dealerHand.score) {
        return 'DEALER_WIN';
      }
      return 'PUSH';
    };

    const hand1 = this.calculateHand(this.playerCards);
    this.outcome = resolveHand(hand1);

    if (this.splitCards.length > 0) {
      const hand2 = this.calculateHand(this.splitCards);
      this.splitOutcome = resolveHand(hand2);
    }

    this.finishRound(this.outcome, this.splitOutcome);
  }

  private finishRound(outcome: RoundOutcome, splitOutcome: RoundOutcome = null): void {
    this.status = 'ROUND_OVER';
    this.outcome = outcome;
    this.splitOutcome = splitOutcome;

    // Liquidar apuesta de Mano 1
    this.payoutHand(outcome, this.currentBet);

    // Liquidar apuesta de Mano 2 si hubo split
    if (splitOutcome && this.splitBet > 0) {
      this.payoutHand(splitOutcome, this.splitBet);
    }

    if (this.chips > this.highScoreChips) {
      this.highScoreChips = this.chips;
    }

    // Normalizar apuesta al saldo si es menor
    if (this.chips > 0 && this.currentBet > this.chips) {
      this.currentBet = Math.max(10, this.chips);
    }
  }

  private payoutHand(outcome: RoundOutcome, betAmount: number): void {
    if (outcome === 'PLAYER_WIN' || outcome === 'DEALER_BUST') {
      this.chips += betAmount * 2;
      this.stats.handsWon += 1;
    } else if (outcome === 'PLAYER_BLACKJACK') {
      this.chips += Math.floor(betAmount * 2.5);
      this.stats.handsWon += 1;
    } else if (outcome === 'PUSH') {
      this.chips += betAmount;
      this.stats.pushes += 1;
    } else {
      this.stats.handsLost += 1;
    }
  }

  public newRound(): void {
    if (this.status !== 'ROUND_OVER') return;
    this.playerCards = [];
    this.splitCards = [];
    this.dealerCards = [];
    this.outcome = null;
    this.splitOutcome = null;
    this.splitBet = 0;
    this.activeHandIndex = 0;
    this.status = 'BETTING';

    if (this.chips <= 0) {
      this.currentBet = 0;
    } else if (this.currentBet > this.chips) {
      this.currentBet = this.chips;
    } else if (this.currentBet === 0) {
      this.currentBet = Math.min(10, this.chips);
    }
  }

  public calculateHand(cards: readonly Card[], includeHidden: boolean = false): Hand {
    let score = 0;
    let aceCount = 0;

    for (const card of cards) {
      if (card.isHidden && !includeHidden) {
        continue;
      }
      if (card.rank === 'A') {
        aceCount += 1;
        score += 11;
      } else {
        score += card.value;
      }
    }

    // Ajustar Ases de 11 a 1 si se pasa de 21
    while (score > 21 && aceCount > 0) {
      score -= 10;
      aceCount -= 1;
    }

    const isBlackjack = cards.length === 2 && score === 21;
    const isBust = score > 21;
    const isSoft = aceCount > 0;

    return {
      cards,
      score,
      isSoft,
      isBlackjack,
      isBust
    };
  }

  public getSnapshot(): BlackjackSnapshot {
    const playerHand = this.calculateHand(this.playerCards);
    const dealerHand = this.calculateHand(this.dealerCards);
    const splitHand = this.splitCards.length > 0 ? this.calculateHand(this.splitCards) : null;

    const isPlayerTurn = this.status === 'PLAYER_TURN';
    const activeCards = this.activeHandIndex === 0 ? this.playerCards : this.splitCards;
    const activeHand = this.calculateHand(activeCards);

    const snap: BlackjackSnapshot = {
      status: this.status,
      outcome: this.outcome,
      splitOutcome: this.splitOutcome,
      chips: this.chips,
      currentBet: this.currentBet,
      splitBet: this.splitBet,
      highScoreChips: this.highScoreChips,
      playerHand,
      splitHand,
      dealerHand,
      activeHandIndex: this.activeHandIndex,
      stats: { ...this.stats },
      canHit: isPlayerTurn && !activeHand.isBust && activeHand.score < 21,
      canStand: isPlayerTurn,
      canDouble: isPlayerTurn && activeCards.length === 2 && this.chips >= this.currentBet,
      canSplit: this.canSplit(),
      canDeal: this.status === 'BETTING' && this.currentBet > 0 && this.chips >= this.currentBet,
      remainingCards: this.deck.length,
      totalShoeCards: this.deckCount * 52
    };

    return snap;
  }

  public getRemainingCards(): number {
    return this.deck.length;
  }

  public getTotalShoeCards(): number {
    return this.deckCount * 52;
  }

  public getStatus(): RoundStatus {
    return this.status;
  }

  public getChips(): number {
    return this.chips;
  }

  public getCurrentBet(): number {
    return this.currentBet;
  }
}
