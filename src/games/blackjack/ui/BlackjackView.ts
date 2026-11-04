// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Vista UI para el juego Blackjack con cartas SVG de cardsJS, reparto secuencial y split.
 * Créditos de naipes vectoriales: cardsJS por Richard Schneider (https://github.com/richardschneider/cardsJS).
 * @spec REQ-57, REQ-59, REQ-60
 */

import { soundManager } from '../../../common/audio/SoundEffects.js';
import { BlackjackEngine } from '../engine/BlackjackEngine.js';
import type { BlackjackSnapshot, Card, Hand, Suit } from '../types.js';

const CHIPS_STORAGE_KEY = 'guacamolegh_games_blackjack_chips';
const HIGH_SCORE_STORAGE_KEY = 'guacamolegh_games_blackjack_highscore';

// Importación dinámica de todas las cartas SVG de la carpeta cards/
const cardSvgs = import.meta.glob('../cards/*.svg', {
  eager: true,
  query: '?url',
  import: 'default'
}) as Record<string, string>;

export class BlackjackView {
  private container: HTMLElement;
  private engine: BlackjackEngine;
  private onBack: () => void;

  private chipsEl!: HTMLElement;
  private winsEl!: HTMLElement;
  private highScoreEl!: HTMLElement;
  private dealerScoreEl!: HTMLElement;
  private playerScoreEl!: HTMLElement;
  private dealerCardsContainer!: HTMLElement;
  private playerCardsContainer!: HTMLElement;
  private actionControlsContainer!: HTMLElement;
  private outcomeBannerEl!: HTMLElement;
  private tableBetValEl!: HTMLElement;
  private deckCountEl: HTMLElement | null = null;

  private isDestroyed: boolean = false;
  private isAnimatingDeal: boolean = false;
  private isHoleCardRevealed: boolean = false;
  private justFlippedHoleCard: boolean = false;
  private hasPlayedOutcomeSound: boolean = false;

  private visiblePlayerCount: number = 0;
  private visibleDealerCount: number = 0;
  private newlyAddedPlayerCardIndex: number = -1;
  private newlyAddedDealerCardIndex: number = -1;
  private activeTimeouts: number[] = [];

  private boundKeyDown: (e: KeyboardEvent) => void;

  constructor(container: HTMLElement, onBack: () => void) {
    this.container = container;
    this.onBack = onBack;

    const initialChips = this.loadChips();
    const initialHighScore = this.loadHighScore();
    this.engine = new BlackjackEngine(initialChips, initialHighScore);

    this.engine.onSoundEvent = (event) => {
      if (this.isDestroyed) return;
      if (event === 'click') {
        soundManager.play('click');
      } else if (event === 'step') {
        soundManager.play('step');
      }
    };

    this.boundKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Monta la interfaz del juego en el contenedor.
   * @spec REQ-59
   */
  public mount(): void {
    this.container.innerHTML = this.getTemplateHtml();

    this.chipsEl = this.container.querySelector('#bj-chips') as HTMLElement;
    this.winsEl = this.container.querySelector('#bj-wins') as HTMLElement;
    this.highScoreEl = this.container.querySelector('#bj-highscore') as HTMLElement;
    this.dealerScoreEl = this.container.querySelector('#bj-dealer-score') as HTMLElement;
    this.playerScoreEl = this.container.querySelector('#bj-player-score') as HTMLElement;
    this.dealerCardsContainer = this.container.querySelector('#bj-dealer-cards') as HTMLElement;
    this.playerCardsContainer = this.container.querySelector('#bj-player-cards') as HTMLElement;
    this.actionControlsContainer = this.container.querySelector('#bj-actions') as HTMLElement;
    this.outcomeBannerEl = this.container.querySelector('#bj-outcome-banner') as HTMLElement;
    this.tableBetValEl = this.container.querySelector('#bj-table-bet-val') as HTMLElement;
    this.deckCountEl = this.container.querySelector('#bj-deck-count');

    this.bindEvents();
    this.render();
  }

  /**
   * Desmonta y destruye la vista liberando recursos.
   * @spec REQ-57
   */
  public destroy(): void {
    this.isDestroyed = true;
    this.clearAllTimeouts();
    window.removeEventListener('keydown', this.boundKeyDown);
    this.container.innerHTML = '';
  }

  private clearAllTimeouts(): void {
    this.activeTimeouts.forEach((id) => window.clearTimeout(id));
    this.activeTimeouts = [];
  }

  private addTimeout(fn: () => void, delayMs: number): void {
    if (this.isDestroyed) return;
    const id = window.setTimeout(() => {
      this.activeTimeouts = this.activeTimeouts.filter((t) => t !== id);
      if (!this.isDestroyed) {
        fn();
      }
    }, delayMs);
    this.activeTimeouts.push(id);
  }

  private bindEvents(): void {
    window.addEventListener('keydown', this.boundKeyDown);

    const backBtn = this.container.querySelector('#bj-back-btn');
    backBtn?.addEventListener('click', () => {
      this.destroy();
      this.onBack();
    });

    const reloadBtn = this.container.querySelector('#bj-reload-btn');
    reloadBtn?.addEventListener('click', () => {
      this.engine.reloadChips(500);
      this.saveChips(this.engine.getChips());
      this.render();
    });
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.isAnimatingDeal) return;
    const snap = this.engine.getSnapshot();

    if (e.key === 'h' || e.key === 'H') {
      if (snap.canHit) {
        this.startHitAnimation();
      }
    } else if (e.key === 's' || e.key === 'S') {
      if (snap.canStand) {
        this.startStandAnimation();
      }
    } else if (e.key === 'd' || e.key === 'D') {
      if (snap.canDouble) {
        this.startDoubleAnimation();
      } else if (snap.canDeal) {
        this.startDealAnimation();
      }
    } else if (e.key === 'v' || e.key === 'V') {
      if (snap.canSplit) {
        this.startSplitAction();
      }
    } else if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
      if (snap.status === 'ROUND_OVER') {
        this.engine.newRound();
        this.isHoleCardRevealed = false;
        this.hasPlayedOutcomeSound = false;
        this.visiblePlayerCount = 0;
        this.visibleDealerCount = 0;
        this.render();
      } else if (snap.canDeal) {
        this.startDealAnimation();
      }
    }
  }

  /**
   * Ejecuta el reparto secuencial con animación de cartas y sonido.
   */
  private startDealAnimation(): void {
    if (this.isAnimatingDeal) return;
    const canDeal = this.engine.deal();
    if (!canDeal) return;

    this.isAnimatingDeal = true;
    this.hasPlayedOutcomeSound = false;
    this.visiblePlayerCount = 0;
    this.visibleDealerCount = 0;
    this.newlyAddedPlayerCardIndex = -1;
    this.newlyAddedDealerCardIndex = -1;
    this.isHoleCardRevealed = false;
    this.justFlippedHoleCard = false;
    this.render();

    // Carta 1 Jugador
    this.addTimeout(() => {
      this.visiblePlayerCount = 1;
      this.newlyAddedPlayerCardIndex = 0;
      this.newlyAddedDealerCardIndex = -1;
      soundManager.play('step');
      this.render();
    }, 180);

    // Carta 1 Crupier
    this.addTimeout(() => {
      this.visibleDealerCount = 1;
      this.newlyAddedPlayerCardIndex = -1;
      this.newlyAddedDealerCardIndex = 0;
      soundManager.play('step');
      this.render();
    }, 550);

    // Carta 2 Jugador
    this.addTimeout(() => {
      this.visiblePlayerCount = 2;
      this.newlyAddedPlayerCardIndex = 1;
      this.newlyAddedDealerCardIndex = -1;
      soundManager.play('step');
      this.render();
    }, 920);

    // Carta 2 Crupier (Oculta)
    this.addTimeout(() => {
      this.visibleDealerCount = 2;
      this.newlyAddedPlayerCardIndex = -1;
      this.newlyAddedDealerCardIndex = 1;
      soundManager.play('step');
      this.isAnimatingDeal = false;

      // Si hubo Blackjack directo
      const snap = this.engine.getSnapshot();
      if (snap.status === 'ROUND_OVER') {
        this.isHoleCardRevealed = true;
        this.justFlippedHoleCard = true;
      }
      this.render();
      this.justFlippedHoleCard = false;
    }, 1280);
  }

  private startHitAnimation(): void {
    if (this.isAnimatingDeal) return;
    this.isAnimatingDeal = true;

    this.engine.hit();
    const snap = this.engine.getSnapshot();
    const activeCards = snap.activeHandIndex === 0 ? snap.playerHand.cards : (snap.splitHand?.cards ?? []);
    this.visiblePlayerCount = activeCards.length;
    this.newlyAddedPlayerCardIndex = activeCards.length - 1;
    this.newlyAddedDealerCardIndex = -1;
    soundManager.play('step');
    this.render();

    this.addTimeout(() => {
      this.isAnimatingDeal = false;
      this.newlyAddedPlayerCardIndex = -1;
      if (snap.status === 'ROUND_OVER') {
        this.isHoleCardRevealed = true;
        this.justFlippedHoleCard = true;
      }
      this.render();
      this.justFlippedHoleCard = false;
    }, 360);
  }

  private startDoubleAnimation(): void {
    if (this.isAnimatingDeal) return;
    this.isAnimatingDeal = true;

    this.engine.doubleDown();
    const snap = this.engine.getSnapshot();
    this.visiblePlayerCount = snap.playerHand.cards.length;
    this.newlyAddedPlayerCardIndex = snap.playerHand.cards.length - 1;
    this.newlyAddedDealerCardIndex = -1;
    soundManager.play('step');
    this.render();

    this.addTimeout(() => {
      this.newlyAddedPlayerCardIndex = -1;
      if (snap.status === 'DEALER_TURN' || snap.status === 'ROUND_OVER') {
        this.startDealerCardRevealSequence();
      } else {
        this.isAnimatingDeal = false;
        this.render();
      }
    }, 450);
  }

  private startSplitAction(): void {
    if (this.isAnimatingDeal) return;
    const ok = this.engine.split();
    if (!ok) return;

    soundManager.play('step');
    this.visiblePlayerCount = 2;
    this.newlyAddedPlayerCardIndex = -1;
    this.render();
  }

  private startStandAnimation(): void {
    if (this.isAnimatingDeal) return;
    this.newlyAddedPlayerCardIndex = -1;
    this.newlyAddedDealerCardIndex = -1;

    this.engine.stand();
    const snap = this.engine.getSnapshot();

    // Si aún queda mano 2 por jugar tras plantarse en mano 1, no activar crupier
    if (snap.status === 'PLAYER_TURN') {
      soundManager.play('click');
      this.render();
      return;
    }

    this.isAnimatingDeal = true;
    this.startDealerCardRevealSequence();
  }

  private startDealerCardRevealSequence(): void {
    this.isHoleCardRevealed = true;
    this.justFlippedHoleCard = true;
    this.newlyAddedPlayerCardIndex = -1;
    this.newlyAddedDealerCardIndex = -1;
    soundManager.play('step');
    this.render();
    this.justFlippedHoleCard = false;

    const snap = this.engine.getSnapshot();
    const finalDealerCount = snap.dealerHand.cards.length;

    let currentCount = 2;
    const dealNextDealerCard = (): void => {
      if (currentCount < finalDealerCount) {
        currentCount += 1;
        this.visibleDealerCount = currentCount;
        this.newlyAddedDealerCardIndex = currentCount - 1;
        soundManager.play('step');
        this.render();
        this.addTimeout(dealNextDealerCard, 500);
      } else {
        this.visibleDealerCount = finalDealerCount;
        this.newlyAddedDealerCardIndex = -1;
        this.isAnimatingDeal = false;
        this.render();
      }
    };

    if (finalDealerCount > 2) {
      this.addTimeout(dealNextDealerCard, 500);
    } else {
      this.isAnimatingDeal = false;
      this.render();
    }
  }

  public render(): void {
    if (this.isDestroyed) return;
    const snap = this.engine.getSnapshot();

    // Guardar fichas y récord
    this.saveChips(snap.chips);
    this.saveHighScore(snap.highScoreChips);

    // Actualizar HUD superior (sin apuesta)
    this.chipsEl.textContent = `$${snap.chips}`;
    this.winsEl.textContent = snap.stats.handsWon.toString();
    this.highScoreEl.textContent = `$${snap.highScoreChips}`;

    // Actualizar Apuesta en el tapete de la mesa
    if (this.tableBetValEl) {
      const totalBet = snap.splitBet > 0 ? snap.currentBet + snap.splitBet : snap.currentBet;
      this.tableBetValEl.textContent = totalBet.toString();
    }

    // Actualizar Contador de cartas del zapato
    if (this.deckCountEl) {
      this.deckCountEl.textContent = `${snap.remainingCards}/${snap.totalShoeCards} cartas`;
    }

    // Filtrar cartas visibles del Crupier
    let visibleDealerCards = snap.dealerHand.cards.slice(0, this.visibleDealerCount);
    if (!this.isHoleCardRevealed && visibleDealerCards.length > 1) {
      visibleDealerCards = visibleDealerCards.map((c, idx) => (idx === 1 ? { ...c, isHidden: true } : c));
    }
    const visibleDealerHand: Hand = {
      ...snap.dealerHand,
      cards: visibleDealerCards,
      score: this.engine.calculateHand(visibleDealerCards).score
    };

    // Renderizar mano del Crupier
    this.renderHand(this.dealerCardsContainer, visibleDealerHand, this.newlyAddedDealerCardIndex, true);
    this.dealerScoreEl.textContent = visibleDealerCards.length > 0 ? visibleDealerHand.score.toString() : '-';

    // Renderizar mano del Jugador (simple o con Split)
    if (snap.splitHand) {
      this.renderSplitHands(snap);
      this.playerScoreEl.textContent = `${snap.playerHand.score} / ${snap.splitHand.score}`;
    } else {
      const visiblePlayerCards = snap.playerHand.cards.slice(0, this.visiblePlayerCount);
      const visiblePlayerHand: Hand = {
        ...snap.playerHand,
        cards: visiblePlayerCards,
        score: this.engine.calculateHand(visiblePlayerCards).score
      };
      this.renderHand(this.playerCardsContainer, visiblePlayerHand, this.newlyAddedPlayerCardIndex, false);
      this.playerScoreEl.textContent = visiblePlayerCards.length > 0 ? visiblePlayerHand.score.toString() : '-';
    }

    // Banner de resultado (solo si terminó el reparto y la animación)
    if (!this.isAnimatingDeal && snap.status === 'ROUND_OVER') {
      this.renderOutcome(snap);
    } else {
      this.outcomeBannerEl.style.display = 'none';
      this.outcomeBannerEl.innerHTML = '';
    }

    // Panel de botones de acción
    this.renderActions(snap);
  }

  private renderSplitHands(snap: BlackjackSnapshot): void {
    const isHand1Active = snap.status === 'PLAYER_TURN' && snap.activeHandIndex === 0;
    const isHand2Active = snap.status === 'PLAYER_TURN' && snap.activeHandIndex === 1;

    const hand1CardsHtml = snap.playerHand.cards
      .map((c, idx) => this.renderCardHtml(c, idx === this.newlyAddedPlayerCardIndex && snap.activeHandIndex === 0, false))
      .join('');

    const hand2CardsHtml = (snap.splitHand ? snap.splitHand.cards : [])
      .map((c: Card, idx: number) => this.renderCardHtml(c, idx === this.newlyAddedPlayerCardIndex && snap.activeHandIndex === 1, false))
      .join('');

    this.playerCardsContainer.innerHTML = `
      <div class="bj-split-wrapper" style="display: flex; gap: 16px; width: 100%; justify-content: center; flex-wrap: wrap;">
        <!-- Mano 1 -->
        <div class="bj-split-box ${isHand1Active ? 'bj-hand-active' : ''}" style="flex: 1; min-width: 220px; padding: 10px; border-radius: 12px; background: rgba(0, 0, 0, 0.25); border: 2px solid ${isHand1Active ? 'var(--color-accent-green)' : 'rgba(255, 255, 255, 0.1)'};">
          <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 0.8125rem; color: #a7f3d0; margin-bottom: 8px;">
            <span>MANO 1 ${isHand1Active ? '<strong style="color: #00f59b; margin-left: 4px;">[JUGANDO]</strong>' : ''}</span>
            <span>Valor: <strong>${snap.playerHand.score}</strong></span>
          </div>
          <div class="bj-cards-row" style="min-height: 110px;">${hand1CardsHtml}</div>
        </div>

        <!-- Mano 2 -->
        <div class="bj-split-box ${isHand2Active ? 'bj-hand-active' : ''}" style="flex: 1; min-width: 220px; padding: 10px; border-radius: 12px; background: rgba(0, 0, 0, 0.25); border: 2px solid ${isHand2Active ? 'var(--color-accent-green)' : 'rgba(255, 255, 255, 0.1)'};">
          <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 0.8125rem; color: #a7f3d0; margin-bottom: 8px;">
            <span>MANO 2 ${isHand2Active ? '<strong style="color: #00f59b; margin-left: 4px;">[JUGANDO]</strong>' : ''}</span>
            <span>Valor: <strong>${snap.splitHand?.score ?? 0}</strong></span>
          </div>
          <div class="bj-cards-row" style="min-height: 110px;">${hand2CardsHtml}</div>
        </div>
      </div>
    `;
  }

  private renderHand(
    container: HTMLElement,
    hand: Hand,
    newlyAddedIndex: number,
    isDealerHand: boolean = false
  ): void {
    if (hand.cards.length === 0) {
      container.innerHTML = '<div class="bj-empty-slot">Esperando reparto...</div>';
      return;
    }

    const cardsHtml = hand.cards
      .map((c, idx) => {
        const isNew = idx === newlyAddedIndex;
        const isFlip = isDealerHand && idx === 1 && this.isHoleCardRevealed && this.justFlippedHoleCard;
        return this.renderCardHtml(c, isNew, isFlip);
      })
      .join('');
    container.innerHTML = cardsHtml;
  }

  private renderCardHtml(card: Card, isNew: boolean, isFlip: boolean): string {
    const animClass = isNew ? 'bj-card-deal-anim' : isFlip ? 'bj-card-flip-anim' : '';
    const svgUrl = this.getCardSvgUrl(card);
    const altText = card.isHidden ? 'Carta oculta' : `${card.rank} de ${card.suit}`;

    const html = `
      <div class="bj-card ${animClass}" aria-label="${altText}">
        <img src="${svgUrl}" alt="${altText}" class="bj-card-img" />
      </div>
    `;
    return html;
  }

  private getCardSvgUrl(card: Card): string {
    if (card.isHidden) {
      return cardSvgs['../cards/BLUE_BACK.svg'] ?? '';
    }
    const suitMap: Record<Suit, string> = {
      spades: 'S',
      hearts: 'H',
      diamonds: 'D',
      clubs: 'C'
    };
    const key = `../cards/${card.rank}${suitMap[card.suit]}.svg`;
    return cardSvgs[key] ?? '';
  }

  /**
   * Renderiza el banner de resultados y activa el sonido sincronizado al mostrarse.
   */
  private renderOutcome(snap: BlackjackSnapshot): void {
    if (snap.status !== 'ROUND_OVER' || !snap.outcome) {
      this.outcomeBannerEl.style.display = 'none';
      return;
    }

    // Reproducción sincrónica de sonido únicamente cuando el banner es visible tras el crupier
    if (!this.hasPlayedOutcomeSound) {
      this.hasPlayedOutcomeSound = true;
      const wonAny =
        snap.outcome === 'PLAYER_WIN' ||
        snap.outcome === 'PLAYER_BLACKJACK' ||
        snap.outcome === 'DEALER_BUST' ||
        snap.splitOutcome === 'PLAYER_WIN' ||
        snap.splitOutcome === 'PLAYER_BLACKJACK' ||
        snap.splitOutcome === 'DEALER_BUST';

      const pushedAny = snap.outcome === 'PUSH' || snap.splitOutcome === 'PUSH';

      if (wonAny) {
        soundManager.play('win');
      } else if (pushedAny) {
        soundManager.play('bounce');
      } else {
        soundManager.play('lose');
      }
    }

    if (snap.splitHand && snap.splitOutcome) {
      // Formato con Split
      const describeOutcome = (out: string | null, score: number): string => {
        if (out === 'PLAYER_WIN') return `Victoria (${score} pts)`;
        if (out === 'PLAYER_BLACKJACK') return '¡Blackjack!';
        if (out === 'DEALER_BUST') return 'Crupier se pasa';
        if (out === 'PUSH') return `Empate (${score} pts)`;
        if (out === 'PLAYER_BUST') return `Te pasaste (${score} pts)`;
        return `Derrota (${score} pts)`;
      };

      const h1Desc = describeOutcome(snap.outcome, snap.playerHand.score);
      const h2Desc = describeOutcome(snap.splitOutcome, snap.splitHand.score);

      this.outcomeBannerEl.innerHTML = `
        <div class="bj-banner-content">
          <h4 class="text-accent-turquoise">RONDA FINALIZADA (SPLIT)</h4>
          <p>Mano 1: <strong>${h1Desc}</strong> &middot; Mano 2: <strong>${h2Desc}</strong> (Crupier: ${snap.dealerHand.score})</p>
        </div>
      `;
      this.outcomeBannerEl.style.display = 'block';
      return;
    }

    let title = '';
    let subtitle = '';
    let colorClass = '';

    if (snap.outcome === 'PLAYER_BLACKJACK') {
      title = '¡BLACKJACK NATURAL!';
      subtitle = `¡Cobras 3 a 2! Ganancia neta: +$${Math.floor(snap.currentBet * 1.5)}`;
      colorClass = 'text-accent-green';
    } else if (snap.outcome === 'PLAYER_WIN') {
      title = '¡VICTORIA!';
      subtitle = `Superas al crupier (${snap.playerHand.score} vs ${snap.dealerHand.score}). Ganancia: +$${snap.currentBet}`;
      colorClass = 'text-accent-green';
    } else if (snap.outcome === 'DEALER_BUST') {
      title = '¡EL CRUPIER SE PASA!';
      subtitle = `El crupier superó 21 (${snap.dealerHand.score}). Ganancia: +$${snap.currentBet}`;
      colorClass = 'text-accent-green';
    } else if (snap.outcome === 'PUSH') {
      title = 'EMPATE (PUSH)';
      subtitle = `Mismo tanteo (${snap.playerHand.score}). Apuesta de $${snap.currentBet} devuelta.`;
      colorClass = 'text-accent-turquoise';
    } else if (snap.outcome === 'PLAYER_BUST') {
      title = 'TE HAS PASADO';
      subtitle = `Superaste 21 con ${snap.playerHand.score}. Pierdes la apuesta.`;
      colorClass = 'text-accent-pink';
    } else if (snap.outcome === 'DEALER_BLACKJACK') {
      title = 'BLACKJACK DE LA CASA';
      subtitle = 'El crupier tiene Blackjack natural de 21.';
      colorClass = 'text-accent-pink';
    } else {
      title = 'GANA EL CRUPIER';
      subtitle = `El crupier obtiene ${snap.dealerHand.score} contra tus ${snap.playerHand.score}.`;
      colorClass = 'text-accent-pink';
    }

    this.outcomeBannerEl.innerHTML = `
      <div class="bj-banner-content">
        <h4 class="${colorClass}">${title}</h4>
        <p>${subtitle}</p>
      </div>
    `;
    this.outcomeBannerEl.style.display = 'block';
  }

  private renderActions(snap: BlackjackSnapshot): void {
    if (this.isAnimatingDeal) {
      this.actionControlsContainer.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; min-height: 44px;">
          <span style="font-size: 0.9375rem; color: var(--color-accent-turquoise); font-weight: 600; letter-spacing: 0.05em;">
            REPARTIENDO CARTAS...
          </span>
        </div>
      `;
      return;
    }

    if (snap.status === 'BETTING') {
      const isBankrupt = snap.chips <= 0;
      this.actionControlsContainer.innerHTML = `
        <div class="bj-bet-selector">
          <span class="bj-chips-label">Añadir Fichas:</span>
          <button class="bj-chip-token chip-10" data-chip="10" ${snap.chips < snap.currentBet + 10 ? 'disabled' : ''}>+10</button>
          <button class="bj-chip-token chip-25" data-chip="25" ${snap.chips < snap.currentBet + 25 ? 'disabled' : ''}>+25</button>
          <button class="bj-chip-token chip-50" data-chip="50" ${snap.chips < snap.currentBet + 50 ? 'disabled' : ''}>+50</button>
          <button class="bj-chip-token chip-100" data-chip="100" ${snap.chips < snap.currentBet + 100 ? 'disabled' : ''}>+100</button>
          <button class="bj-chip-token chip-min" id="bj-reset-bet-btn">Min</button>
        </div>
        <div class="bj-actions-row" style="margin-top: 10px;">
          ${
            isBankrupt
              ? '<button id="bj-reload-action-btn" class="bj-btn-action bj-btn-reload">Recargar 500 Fichas</button>'
              : `<button id="bj-deal-btn" class="bj-btn-action bj-btn-deal" ${!snap.canDeal ? 'disabled' : ''}>REPARTIR ($${snap.currentBet}) &rarr;</button>`
          }
        </div>
      `;

      const chipBtns = this.actionControlsContainer.querySelectorAll<HTMLButtonElement>('.bj-chip-token[data-chip]');
      chipBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const chipVal = parseInt(btn.getAttribute('data-chip') || '0', 10);
          if (chipVal > 0) {
            this.engine.addBet(chipVal);
            this.render();
          }
        });
      });

      const resetBetBtn = this.actionControlsContainer.querySelector('#bj-reset-bet-btn');
      resetBetBtn?.addEventListener('click', () => {
        this.engine.resetBet();
        this.render();
      });

      const dealBtn = this.actionControlsContainer.querySelector('#bj-deal-btn');
      dealBtn?.addEventListener('click', () => {
        this.startDealAnimation();
      });

      const reloadBtn = this.actionControlsContainer.querySelector('#bj-reload-action-btn');
      reloadBtn?.addEventListener('click', () => {
        this.engine.reloadChips(500);
        this.render();
      });
    } else if (snap.status === 'PLAYER_TURN') {
      const activeHandLabel = snap.splitHand ? (snap.activeHandIndex === 0 ? ' [MANO 1]' : ' [MANO 2]') : '';

      this.actionControlsContainer.innerHTML = `
        <div class="bj-actions-row">
          <button id="bj-hit-btn" class="bj-btn-action bj-btn-hit">PEDIR CARTA${activeHandLabel} [H]</button>
          <button id="bj-stand-btn" class="bj-btn-action bj-btn-stand">PLANTARSE [S]</button>
          ${
            snap.canDouble
              ? `<button id="bj-double-btn" class="bj-btn-action bj-btn-double">DOBLAR ($${snap.currentBet}) [D]</button>`
              : ''
          }
          ${
            snap.canSplit
              ? `<button id="bj-split-btn" class="bj-btn-action bj-btn-split">DIVIDIR ($${snap.currentBet}) [V]</button>`
              : ''
          }
        </div>
      `;

      const hitBtn = this.actionControlsContainer.querySelector('#bj-hit-btn');
      hitBtn?.addEventListener('click', () => {
        this.startHitAnimation();
      });

      const standBtn = this.actionControlsContainer.querySelector('#bj-stand-btn');
      standBtn?.addEventListener('click', () => {
        this.startStandAnimation();
      });

      const doubleBtn = this.actionControlsContainer.querySelector('#bj-double-btn');
      doubleBtn?.addEventListener('click', () => {
        this.startDoubleAnimation();
      });

      const splitBtn = this.actionControlsContainer.querySelector('#bj-split-btn');
      splitBtn?.addEventListener('click', () => {
        this.startSplitAction();
      });
    } else if (snap.status === 'ROUND_OVER') {
      this.actionControlsContainer.innerHTML = `
        <div class="bj-actions-row">
          <button id="bj-new-round-btn" class="bj-btn-action bj-btn-new-round">NUEVA RONDA &rarr;</button>
        </div>
      `;

      const newRoundBtn = this.actionControlsContainer.querySelector('#bj-new-round-btn');
      newRoundBtn?.addEventListener('click', () => {
        this.engine.newRound();
        this.isHoleCardRevealed = false;
        this.hasPlayedOutcomeSound = false;
        this.visiblePlayerCount = 0;
        this.visibleDealerCount = 0;
        this.render();
      });
    }
  }

  private loadChips(): number {
    try {
      const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      const saved = storage?.getItem(CHIPS_STORAGE_KEY);
      const parsed = saved ? parseInt(saved, 10) : 500;
      return Number.isNaN(parsed) || parsed <= 0 ? 500 : parsed;
    } catch {
      return 500;
    }
  }

  private saveChips(chips: number): void {
    try {
      const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      storage?.setItem(CHIPS_STORAGE_KEY, chips.toString());
    } catch {
      // Ignorar
    }
  }

  private loadHighScore(): number {
    try {
      const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      const saved = storage?.getItem(HIGH_SCORE_STORAGE_KEY);
      const parsed = saved ? parseInt(saved, 10) : 500;
      return Number.isNaN(parsed) ? 500 : parsed;
    } catch {
      return 500;
    }
  }

  private saveHighScore(score: number): void {
    try {
      const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      storage?.setItem(HIGH_SCORE_STORAGE_KEY, score.toString());
    } catch {
      // Ignorar
    }
  }

  private getTemplateHtml(): string {
    const html = `
      <section class="bj-game-wrapper" aria-label="Juego Blackjack">
        <div class="bj-inner-container">
          <div class="bj-top-bar game-top-bar">
            <button id="bj-back-btn" class="snake-back-btn game-top-btn" aria-label="Volver al catálogo principal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Volver al Catálogo</span>
            </button>
            <div class="snake-hud game-hud">
              <div class="hud-item">
                <span class="hud-label">FICHAS</span>
                <span id="bj-chips" class="hud-value text-accent-green">$500</span>
              </div>
              <div class="hud-item">
                <span class="hud-label">VICTORIAS</span>
                <span id="bj-wins" class="hud-value text-accent-turquoise">0</span>
              </div>
              <div class="hud-item">
                <span class="hud-label">RÉCORD</span>
                <span id="bj-highscore" class="hud-value text-accent-turquoise">$500</span>
              </div>
            </div>
            <div class="space-actions-bar game-actions-bar">
              <button id="bj-reload-btn" class="hud-btn game-top-btn" aria-label="Recargar fichas a 500">
                Recargar
              </button>
            </div>
          </div>

          <!-- Mesa de Paño de Blackjack -->
          <div class="bj-table-felt">
            
            <!-- Zona del Crupier -->
            <div class="bj-hand-zone">
              <div class="bj-hand-header">
                <span class="bj-hand-title">Mano del Crupier</span>
                <span class="bj-hand-score">Valor: <strong id="bj-dealer-score">-</strong></span>
              </div>
              <div class="bj-dealer-row-wrap">
                <div id="bj-dealer-cards" class="bj-cards-row"></div>
                <!-- Baraja de Cartas en la esquina superior derecha -->
                <div id="bj-deck-shoe" class="bj-deck-shoe" aria-label="Baraja de cartas">
                  <div class="bj-shoe-stack">
                    <div class="bj-shoe-card-layer layer-3"></div>
                    <div class="bj-shoe-card-layer layer-2"></div>
                    <div class="bj-shoe-card-top">
                      <img src="${cardSvgs['../cards/RED_BACK.svg'] ?? cardSvgs['../cards/BLUE_BACK.svg'] ?? ''}" alt="Baraja de cartas" class="bj-card-img" />
                    </div>
                  </div>
                  <div class="bj-shoe-info">
                    <span class="bj-shoe-label">BARAJA</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Zona central: Apuesta de la mesa y banner de resultados -->
            <div class="bj-center-table-zone">
              <div class="bj-table-bet-spot">
                <div class="bj-chip-token chip-current">
                  <span class="bj-chip-symbol">$</span>
                  <span id="bj-table-bet-val" class="bj-chip-value">10</span>
                </div>
                <span class="bj-bet-title">APUESTA INICIAL</span>
              </div>
              <div id="bj-outcome-banner" class="bj-outcome-banner" style="display: none;"></div>
            </div>

            <!-- Zona del Jugador -->
            <div class="bj-hand-zone">
              <div class="bj-hand-header">
                <span class="bj-hand-title">Tu Mano</span>
                <span class="bj-hand-score">Valor: <strong id="bj-player-score">-</strong></span>
              </div>
              <div id="bj-player-cards" class="bj-cards-row"></div>
            </div>

            <!-- Controles de acción y apuestas -->
            <div id="bj-actions" class="bj-actions-panel"></div>
          </div>

          <div class="snake-hints">
            <span>Reglas: <strong>Blackjack</strong> paga 3:2 &middot; Crupier se planta en 17+ &middot; <strong>H</strong> Pedir &middot; <strong>S</strong> Plantarse &middot; <strong>D</strong> Doblar &middot; <strong>V</strong> Dividir &middot; Naipes: <a href="https://github.com/richardschneider/cardsJS" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">cardsJS</a></span>
          </div>
        </div>
      </section>
    `;
    return html;
  }
}
