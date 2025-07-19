
// apps/dedicated-server/src/game/deck.ts
import { Card } from '@poker-game/shared/types';
import { GAME_CONSTANTS } from '@poker-game/shared/constants';
import { CryptoHelper } from '@poker-game/shared/utils';
import { IDeck } from '@poker-game/shared/interfaces';

export class Deck implements IDeck {
    private cards: Card[] = [];
    private originalDeck: Card[] = [];

    constructor() {
        this.initializeDeck();
        this.reset();
    }

    private initializeDeck(): void {
        const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
        const ranks: Card['rank'][] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

        this.originalDeck = [];

        for (const suit of suits) {
            for (const rank of ranks) {
                this.originalDeck.push({
                    suit,
                    rank,
                    value: GAME_CONSTANTS.CARD_VALUES[rank]
                });
            }
        }
    }

    shuffle(seed?: string): void {
        this.cards = CryptoHelper.secureArrayShuffle([...this.originalDeck], seed);
    }

    deal(count: number): Card[] {
        if (count > this.cards.length) {
            throw new Error('Not enough cards in deck');
        }

        return this.cards.splice(0, count);
    }

    reset(): void {
        this.cards = [...this.originalDeck];
    }

    getRemainingCount(): number {
        return this.cards.length;
    }

    isEmpty(): boolean {
        return this.cards.length === 0;
    }

    peek(count: number): Card[] {
        return this.cards.slice(0, count);
    }

    addCard(card: Card): void {
        this.cards.push(card);
    }

    removeCard(card: Card): boolean {
        const index = this.cards.findIndex(c =>
            c.suit === card.suit && c.rank === card.rank
        );

        if (index !== -1) {
            this.cards.splice(index, 1);
            return true;
        }

        return false;
    }
}
