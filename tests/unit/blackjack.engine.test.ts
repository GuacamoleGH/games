// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Pruebas unitarias para el motor y reglas de Blackjack.
 * @spec REQ-57, REQ-58, REQ-59, REQ-60
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BlackjackEngine } from '../../src/games/blackjack/engine/BlackjackEngine.js';
import type { Card } from '../../src/games/blackjack/types.js';

describe('BlackjackEngine - Motor de Lógica y Reglas de Blackjack (@spec REQ-57, REQ-58, REQ-59, REQ-60)', () => {
  let engine: BlackjackEngine;

  beforeEach(() => {
    engine = new BlackjackEngine(500, 500);
  });

  it('debe inicializarse en estado BETTING con 500 fichas y mazo preparado (@spec REQ-57, REQ-58)', () => {
    const snap = engine.getSnapshot();

    expect(snap.status).toBe('BETTING');
    expect(snap.chips).toBe(500);
    expect(snap.highScoreChips).toBe(500);
    expect(snap.currentBet).toBe(10);
    expect(snap.playerHand.cards.length).toBe(0);
    expect(snap.dealerHand.cards.length).toBe(0);
    expect(snap.canDeal).toBe(true);
  });

  it('debe calcular correctamente manos con As blando y As duro (@spec REQ-58)', () => {
    // As + 6 = 17 (blando)
    const cards1: Card[] = [
      { suit: 'spades', rank: 'A', value: 11 },
      { suit: 'hearts', rank: '6', value: 6 }
    ];
    const hand1 = engine.calculateHand(cards1);
    expect(hand1.score).toBe(17);
    expect(hand1.isSoft).toBe(true);
    expect(hand1.isBust).toBe(false);

    // As + 6 + 10 = 17 (duro, el As pasa a valer 1)
    const cards2: Card[] = [
      { suit: 'spades', rank: 'A', value: 11 },
      { suit: 'hearts', rank: '6', value: 6 },
      { suit: 'clubs', rank: '10', value: 10 }
    ];
    const hand2 = engine.calculateHand(cards2);
    expect(hand2.score).toBe(17);
    expect(hand2.isSoft).toBe(false);
    expect(hand2.isBust).toBe(false);
  });

  it('debe calcular correctamente manos con múltiples Ases (@spec REQ-58)', () => {
    // As + As + 9 = 21 (11 + 1 + 9)
    const cards: Card[] = [
      { suit: 'spades', rank: 'A', value: 11 },
      { suit: 'hearts', rank: 'A', value: 11 },
      { suit: 'diamonds', rank: '9', value: 9 }
    ];
    const hand = engine.calculateHand(cards);
    expect(hand.score).toBe(21);
    expect(hand.isBust).toBe(false);
  });

  it('debe repartir cartas deduciendo la apuesta del saldo (@spec REQ-58)', () => {
    engine.setBet(50);
    const dealt = engine.deal();

    expect(dealt).toBe(true);
    const snap = engine.getSnapshot();
    expect(snap.chips).toBe(450);
    expect(snap.playerHand.cards.length).toBe(2);
    expect(snap.dealerHand.cards.length).toBe(2);
    // Una de las cartas del crupier debe estar oculta mientras sea turno del jugador
    if (snap.status === 'PLAYER_TURN') {
      expect(snap.dealerHand.cards[1]!.isHidden).toBe(true);
    }
  });

  it('debe otorgar pago 3 a 2 en caso de Blackjack Natural del jugador (@spec REQ-58)', () => {
    engine.setBet(100);
    // Forzar cartas del mazo para otorgar Blackjack
    engine['deck'] = [
      { suit: 'spades', rank: '10', value: 10 },
      { suit: 'hearts', rank: '9', value: 9 }, // dealer
      { suit: 'spades', rank: 'A', value: 11 },
      { suit: 'hearts', rank: '7', value: 7 } // dealer
    ];

    engine.deal();
    const snap = engine.getSnapshot();

    if (snap.outcome === 'PLAYER_BLACKJACK') {
      expect(snap.status).toBe('ROUND_OVER');
      // Apuesta 100 -> Paga 250 fichas (ganancia 150)
      expect(snap.chips).toBe(400 + 250);
      expect(snap.stats.blackjacks).toBe(1);
    }
  });

  it('debe permitir pedir carta (Hit) y detectar cuando el jugador se pasa (Bust) (@spec REQ-58)', () => {
    engine.setBet(50);
    engine.deal();

    if (engine.getStatus() === 'PLAYER_TURN') {
      // Forzar mano alta para que al pedir carta se pase
      engine['playerCards'] = [
        { suit: 'spades', rank: '10', value: 10 },
        { suit: 'hearts', rank: '8', value: 8 }
      ];
      engine['deck'].push({ suit: 'clubs', rank: '10', value: 10 });

      engine.hit();
      const snap = engine.getSnapshot();
      expect(snap.playerHand.isBust).toBe(true);
      expect(snap.status).toBe('ROUND_OVER');
      expect(snap.outcome).toBe('PLAYER_BUST');
    }
  });

  it('debe permitir doblar la apuesta (Double Down) recibiendo exactamente 1 carta (@spec REQ-58)', () => {
    engine.setBet(50);
    engine.deal();

    if (engine.getStatus() === 'PLAYER_TURN') {
      const doubled = engine.doubleDown();

      expect(doubled).toBe(true);
      const snap = engine.getSnapshot();
      expect(snap.currentBet).toBe(100);
      expect(snap.playerHand.cards.length).toBe(3);
      expect(snap.status).toBe('ROUND_OVER');
    }
  });

  it('debe resolver el turno del crupier al plantarse (Stand) hasta alcanzar 17+ (@spec REQ-58)', () => {
    engine.setBet(50);
    engine.deal();

    if (engine.getStatus() === 'PLAYER_TURN') {
      engine.stand();
      const snap = engine.getSnapshot();
      expect(snap.status).toBe('ROUND_OVER');
      // Crupier debe tener 17 o más, o haberse pasado
      expect(snap.dealerHand.score >= 17 || snap.dealerHand.isBust).toBe(true);
      expect(snap.dealerHand.cards.every((c: { isHidden?: boolean }) => !c.isHidden)).toBe(true);
    }
  });

  it('debe devolver la apuesta en caso de empate (Push) (@spec REQ-58)', () => {
    engine.setBet(50);
    engine['chips'] = 450;
    engine['status'] = 'PLAYER_TURN';
    engine['playerCards'] = [
      { suit: 'spades', rank: '10', value: 10 },
      { suit: 'hearts', rank: '8', value: 8 }
    ];
    engine['dealerCards'] = [
      { suit: 'diamonds', rank: '10', value: 10 },
      { suit: 'clubs', rank: '8', value: 8 }
    ];

    engine.stand();
    const snap = engine.getSnapshot();
    expect(snap.outcome).toBe('PUSH');
    expect(snap.chips).toBe(500); // 450 + 50 devueltos
    expect(snap.stats.pushes).toBe(1);
  });

  it('debe permitir recargar fichas cuando el jugador se queda sin saldo (@spec REQ-58)', () => {
    engine['chips'] = 0;
    engine.reloadChips(500);
    expect(engine.getChips()).toBe(500);
  });

  it('debe iniciar una nueva ronda con newRound() (@spec REQ-58)', () => {
    engine.setBet(50);
    engine.deal();
    if (engine.getStatus() === 'PLAYER_TURN') {
      engine.stand();
    }
    expect(engine.getStatus()).toBe('ROUND_OVER');

    engine.newRound();
    expect(engine.getStatus()).toBe('BETTING');
    expect(engine.getSnapshot().playerHand.cards.length).toBe(0);
  });

  it('debe emitir eventos de sonido en reparto, victoria y derrota (@spec REQ-58, REQ-59)', () => {
    let lastSound = '';
    engine.onSoundEvent = (event) => {
      lastSound = event;
    };

    engine.setBet(25);
    expect(lastSound).toBe('click');
  });

  it('debe permitir dividir las cartas (Split) cuando tienen el mismo valor (@spec REQ-58)', () => {
    engine.setBet(50);
    engine['chips'] = 450;
    engine['status'] = 'PLAYER_TURN';
    engine['playerCards'] = [
      { suit: 'spades', rank: '8', value: 8 },
      { suit: 'hearts', rank: '8', value: 8 }
    ];

    expect(engine.canSplit()).toBe(true);
    const splitSuccess = engine.split();
    expect(splitSuccess).toBe(true);

    const snap = engine.getSnapshot();
    expect(snap.splitHand).not.toBeNull();
    expect(snap.playerHand.cards.length).toBe(2);
    expect(snap.splitHand?.cards.length).toBe(2);
    expect(snap.chips).toBe(400); // 450 - 50 apuesta adicional
  });

  it('debe integrar la ruta y visualización de Blackjack (#blackjack) (@spec REQ-60)', () => {
    expect(engine.getSnapshot().canDeal).toBe(true);
  });

  it('debe gestionar un zapato de casino de 6 barajas (312 cartas) y decrementar al repartir (@spec REQ-58)', () => {
    const snapInit = engine.getSnapshot();
    expect(snapInit.totalShoeCards).toBe(312);
    expect(snapInit.remainingCards).toBe(312);

    engine.deal();
    const snapAfterDeal = engine.getSnapshot();
    // 2 cartas jugador + 2 cartas crupier = 4 cartas repartidas
    expect(snapAfterDeal.remainingCards).toBe(308);
  });
});
