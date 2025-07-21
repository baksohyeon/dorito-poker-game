// apps/dedicated-server/src/game/hand-evaluator.ts
import { Card, HandResult, HandType } from '@poker-game/shared';
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
            return this.createHandResult('royal-flush', 10, sortedCards, 'Royal Flush');
        }

        // Straight flush
        if (isFlush && isStraight) {
            return this.createHandResult('straight-flush', 9, sortedCards, `Straight Flush, ${this.getRankName(straightHigh)} high`);
        }

        // Four of a kind
        if (counts[0] === 4) {
            return this.createHandResult('four-of-a-kind', 8, sortedCards, `Four of a Kind, ${this.getRankName(sortedCards[0].value)}`);
        }

        // Full house
        if (counts[0] === 3 && counts[1] === 2) {
            return this.createHandResult('full-house', 7, sortedCards, `Full House`);
        }

        // Flush
        if (isFlush) {
            return this.createHandResult('flush', 6, sortedCards, `Flush, ${this.getRankName(sortedCards[0].value)} high`);
        }

        // Straight
        if (isStraight) {
            return this.createHandResult('straight', 5, sortedCards, `Straight, ${this.getRankName(straightHigh)} high`);
        }

        // Three of a kind
        if (counts[0] === 3) {
            return this.createHandResult('three-of-a-kind', 4, sortedCards, `Three of a Kind`);
        }

        // Two pair
        if (counts[0] === 2 && counts[1] === 2) {
            return this.createHandResult('two-pair', 3, sortedCards, `Two Pair`);
        }

        // Pair
        if (counts[0] === 2) {
            return this.createHandResult('pair', 2, sortedCards, `Pair`);
        }

        // High card
        return this.createHandResult('high-card', 1, sortedCards, `High Card, ${this.getRankName(sortedCards[0].value)} high`);
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

    calculateHandStrength(playerCards: Card[], communityCards: Card[]): number {
        const allCards = [...playerCards, ...communityCards];
        const handResult = this.evaluateHand(allCards);
        
        // Convert hand rank to strength percentage (higher is better)
        const maxRank = GAME_CONSTANTS.HAND_RANKINGS.ROYAL_FLUSH;
        return (handResult.rank / maxRank) * 100;
    }

    getHandEquity(playerCards: Card[], communityCards: Card[], opponents: number): number {
        // Simplified equity calculation - in production, use Monte Carlo simulation
        const handStrength = this.calculateHandStrength(playerCards, communityCards);
        const adjustedStrength = handStrength / (1 + (opponents * 0.1)); // Adjust for opponents
        return Math.min(100, Math.max(0, adjustedStrength));
    }

    getRankDescription(handResult: HandResult): string {
        const descriptions: Record<HandType, string> = {
            'royal-flush': 'Royal Flush - Ace high straight flush',
            'straight-flush': `Straight Flush - ${handResult.cards[0].rank} high`,
            'four-of-a-kind': `Four of a Kind - ${this.getRankName(handResult.cards[0].value)}s`,
            'full-house': `Full House - ${this.getRankName(handResult.cards[0].value)}s over ${this.getRankName(handResult.cards[3].value)}s`,
            'flush': `Flush - ${handResult.cards[0].rank} high`,
            'straight': `Straight - ${handResult.cards[0].rank} high`,
            'three-of-a-kind': `Three of a Kind - ${this.getRankName(handResult.cards[0].value)}s`,
            'two-pair': `Two Pair - ${this.getRankName(handResult.cards[0].value)}s and ${this.getRankName(handResult.cards[2].value)}s`,
            'pair': `Pair of ${this.getRankName(handResult.cards[0].value)}s`,
            'high-card': `High Card - ${handResult.cards[0].rank}`
        };
        
        return descriptions[handResult.type] || handResult.description;
    }

    getShortDescription(handResult: HandResult): string {
        const shortDescriptions: Record<HandType, string> = {
            'royal-flush': 'Royal Flush',
            'straight-flush': 'Straight Flush',
            'four-of-a-kind': 'Four of a Kind',
            'full-house': 'Full House',
            'flush': 'Flush',
            'straight': 'Straight',
            'three-of-a-kind': 'Three of a Kind',
            'two-pair': 'Two Pair',
            'pair': 'Pair',
            'high-card': 'High Card'
        };
        
        return shortDescriptions[handResult.type] || handResult.type;
    }

    isDrawPossible(communityCards: Card[], drawType: 'straight' | 'flush' | 'full-house'): boolean {
        switch (drawType) {
            case 'flush':
                return this.isFlushDrawPossible(communityCards);
            case 'straight':
                return this.isStraightDrawPossible(communityCards);
            case 'full-house':
                return this.isFullHouseDrawPossible(communityCards);
            default:
                return false;
        }
    }

    countOuts(playerCards: Card[], communityCards: Card[]): number {
        const allCards = [...playerCards, ...communityCards];
        const usedCards = new Set(allCards.map(c => `${c.suit}_${c.rank}`));
        
        let outs = 0;
        
        // Create all possible remaining cards
        const remainingCards: Card[] = [];
        for (const suit of GAME_CONSTANTS.SUITS) {
            for (const rank of GAME_CONSTANTS.RANKS) {
                if (!usedCards.has(`${suit}_${rank}`)) {
                    remainingCards.push({
                        suit: suit as any,
                        rank: rank as any,
                        value: GAME_CONSTANTS.CARD_VALUES[rank]
                    });
                }
            }
        }
        
        const currentHand = this.evaluateHand(allCards);
        
        // Count how many cards improve the hand
        for (const card of remainingCards) {
            const newHand = this.evaluateHand([...allCards, card]);
            if (newHand.rank > currentHand.rank) {
                outs++;
            }
        }
        
        return outs;
    }

    private isFlushDrawPossible(communityCards: Card[]): boolean {
        const suitCounts = this.getSuitCounts(communityCards);
        return Object.values(suitCounts).some(count => count >= 3);
    }

    private isStraightDrawPossible(communityCards: Card[]): boolean {
        const uniqueValues = [...new Set(communityCards.map(c => c.value))].sort((a, b) => a - b);
        
        // Check for gaps that could be filled for a straight
        for (let i = 0; i < uniqueValues.length - 2; i++) {
            const span = uniqueValues[i + 2] - uniqueValues[i];
            if (span <= 4) return true; // Potential straight draw
        }
        
        return false;
    }

    private isFullHouseDrawPossible(communityCards: Card[]): boolean {
        const rankCounts = this.getRankCounts(communityCards);
        const counts = Object.values(rankCounts);
        
        // Need at least one pair to have full house draw potential
        return counts.some(count => count >= 2);
    }

    private getSuitCounts(cards: Card[]): Record<string, number> {
        const suitCounts: Record<string, number> = {};
        
        for (const card of cards) {
            suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
        }
        
        return suitCounts;
    }

    private createHandResult(type: HandType, rank: number, cards: Card[], description: string, kickers: Card[] = []): HandResult {
        const strength = this.calculateNumericStrength(cards);
        const tieBreaker = cards.map(c => c.value);
        
        return {
            type,
            rank,
            strength,
            cards,
            playingCards: [...cards],
            kickers,
            description,
            shortDescription: this.getShortDescription({ type } as HandResult),
            rawRank: rank,
            isWinner: false,
            tieBreaker,
            handValue: cards.map(c => `${c.rank}${this.getSuitSymbol(c.suit)}`).join(' ')
        };
    }

    private calculateNumericStrength(cards: Card[]): number {
        // Create a unique numeric strength for hand comparison
        let strength = 0;
        for (let i = 0; i < cards.length; i++) {
            strength += cards[i].value * Math.pow(100, 4 - i);
        }
        return strength;
    }

    private getSuitSymbol(suit: string): string {
        const symbols: Record<string, string> = {
            'hearts': '♥',
            'diamonds': '♦',
            'clubs': '♣',
            'spades': '♠'
        };
        return symbols[suit] || suit;
    }
}