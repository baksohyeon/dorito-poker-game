// apps/dedicated-server/src/game/hand-evaluator.ts
import { Card, HandResult } from '@poker-game/shared';
import { GAME_CONSTANTS } from '@poker-game/shared';
import { IHandEvaluator } from '@poker-game/shared';

export class HandEvaluator implements IHandEvaluator {
    evaluateHand(cards: Card[]): HandResult {
        if (cards.length < 5) {
            throw new Error('Need at least 5 cards to evaluate hand');
        }

        const bestFiveCards = this.findBestFiveCards(cards);
        return this.evaluateFiveCards(bestFiveCards);
    }

    compareHands(hand1: HandResult, hand2: HandResult): number {
        if (hand1.rank !== hand2.rank) {
            return hand2.rank - hand1.rank;
        }

        // Same hand type, compare by highest card values
        for (let i = 0; i < hand1.cards.length; i++) {
            if (hand1.cards[i].value !== hand2.cards[i].value) {
                return hand2.cards[i].value - hand1.cards[i].value;
            }
        }

        return 0; // Tie
    }

    getBestHand(cards: Card[]): HandResult {
        return this.evaluateHand(cards);
    }

    findBestFiveCards(cards: Card[]): Card[] {
        if (cards.length === 5) {
            return cards;
        }

        let bestHand: HandResult | null = null;
        let bestCards: Card[] = [];

        // Generate all possible 5-card combinations
        const combinations = this.getCombinations(cards, 5);
        
        for (const combination of combinations) {
            const handResult = this.evaluateFiveCards(combination);
            
            if (!bestHand || this.compareHands(handResult, bestHand) < 0) {
                bestHand = handResult;
                bestCards = combination;
            }
        }

        return bestCards;
    }

    private evaluateFiveCards(cards: Card[]): HandResult {
        const sortedCards = [...cards].sort((a, b) => b.value - a.value);

        // Check for flush
        const isFlush = this.isFlush(sortedCards);

        // Check for straight
        const straightHigh = this.getStraightHigh(sortedCards);
        const isStraight = straightHigh !== null;

        // Get rank counts
        const rankCounts = this.getRankCounts(sortedCards);
        const counts = Object.values(rankCounts).sort((a, b) => b - a);

        // Royal flush
        if (isFlush && isStraight && straightHigh === 14) {
            return {
                type: 'royal-flush',
                rank: 10,
                cards: sortedCards,
                description: 'Royal Flush'
            };
        }

        // Straight flush
        if (isFlush && isStraight) {
            return {
                type: 'straight-flush',
                rank: 9,
                cards: sortedCards,
                description: `Straight Flush, ${this.getRankName(straightHigh)} high`
            };
        }

        // Four of a kind
        if (counts[0] === 4) {
            return {
                type: 'four-of-a-kind',
                rank: 8,
                cards: sortedCards,
                description: `Four of a Kind, ${this.getRankName(sortedCards[0].value)}`
            };
        }

        // Full house
        if (counts[0] === 3 && counts[1] === 2) {
            return {
                type: 'full-house',
                rank: 7,
                cards: sortedCards,
                description: `Full House`
            };
        }

        // Flush
        if (isFlush) {
            return {
                type: 'flush',
                rank: 6,
                cards: sortedCards,
                description: `Flush, ${this.getRankName(sortedCards[0].value)} high`
            };
        }

        // Straight
        if (isStraight) {
            return {
                type: 'straight',
                rank: 5,
                cards: sortedCards,
                description: `Straight, ${this.getRankName(straightHigh)} high`
            };
        }

        // Three of a kind
        if (counts[0] === 3) {
            return {
                type: 'three-of-a-kind',
                rank: 4,
                cards: sortedCards,
                description: `Three of a Kind`
            };
        }

        // Two pair
        if (counts[0] === 2 && counts[1] === 2) {
            return {
                type: 'two-pair',
                rank: 3,
                cards: sortedCards,
                description: `Two Pair`
            };
        }

        // Pair
        if (counts[0] === 2) {
            return {
                type: 'pair',
                rank: 2,
                cards: sortedCards,
                description: `Pair`
            };
        }

        // High card
        return {
            type: 'high-card',
            rank: 1,
            cards: sortedCards,
            description: `High Card, ${this.getRankName(sortedCards[0].value)} high`
        };
    }

    private isFlush(cards: Card[]): boolean {
        const suit = cards[0].suit;
        return cards.every(card => card.suit === suit);
    }

    private getStraightHigh(cards: Card[]): number | null {
        const values = cards.map(card => card.value).sort((a, b) => b - a);
        
        // Check for A-2-3-4-5 straight (wheel)
        if (values[0] === 14 && values[1] === 5 && values[2] === 4 && 
            values[3] === 3 && values[4] === 2) {
            return 5; // 5-high straight
        }

        // Check for regular straight
        for (let i = 0; i < values.length - 1; i++) {
            if (values[i] - values[i + 1] !== 1) {
                return null;
            }
        }

        return values[0];
    }

    private getRankCounts(cards: Card[]): Record<number, number> {
        const counts: Record<number, number> = {};
        
        for (const card of cards) {
            counts[card.value] = (counts[card.value] || 0) + 1;
        }
        
        return counts;
    }

    private getRankName(value: number): string {
        const rankMap: Record<number, string> = {
            14: 'Ace',
            13: 'King', 
            12: 'Queen',
            11: 'Jack',
            10: 'Ten',
            9: 'Nine',
            8: 'Eight',
            7: 'Seven',
            6: 'Six',
            5: 'Five',
            4: 'Four',
            3: 'Three',
            2: 'Two'
        };
        
        return rankMap[value] || value.toString();
    }

    private getCombinations<T>(arr: T[], k: number): T[][] {
        if (k === 1) return arr.map(el => [el]);
        if (k === arr.length) return [arr];
        
        const result: T[][] = [];
        
        for (let i = 0; i <= arr.length - k; i++) {
            const head = arr[i];
            const tailCombs = this.getCombinations(arr.slice(i + 1), k - 1);
            
            for (const tailComb of tailCombs) {
                result.push([head, ...tailComb]);
            }
        }
        
        return result;
    }
}