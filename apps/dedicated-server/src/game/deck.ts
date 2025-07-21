
// apps/dedicated-server/src/game/deck.ts
import { Card } from '@poker-game/shared';
import { GAME_CONSTANTS } from '@poker-game/shared';
import { CryptoHelper } from '@poker-game/shared';
import { IDeck } from '@poker-game/shared';

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

    burn(count: number = 1): Card[] {
        return this.deal(count);
    }

    getAllCards(): Card[] {
        return [...this.cards];
    }

    getShuffledDeck(): Card[] {
        const shuffled = [...this.originalDeck];
        // Use same shuffle logic as the shuffle method
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    canDeal(count: number): boolean {
        return this.cards.length >= count;
    }

    validateDeck(): boolean {
        return this.cards.length >= 0 && 
               this.cards.length <= 52 &&
               new Set(this.cards.map(c => `${c.suit}_${c.rank}`)).size === this.cards.length;
    }
}
