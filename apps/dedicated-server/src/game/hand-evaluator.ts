
// apps/dedicated-server/src/game/hand-evaluator.ts
import { Card, HandResult } from '@poker-game/shared/types';
import { GAME_CONSTANTS } from '@poker-game/shared/constants';
import { IHandEvaluator } from '@poker-game/shared/interfaces';

export class HandEvaluator implements IHandEvaluator {
    evaluateHand(cards: Card[]): HandResult {
        if (cards.length < 5) {
            throw new Error('Need at least 5 cards to evaluate hand');
        }

        const bestFiveCards = this.findBestFiveCards(cards);
        return this.evaluateFiveCards(bestFiveCards);
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

        // MORE CODE HERE
    }
}