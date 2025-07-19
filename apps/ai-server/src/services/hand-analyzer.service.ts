// apps/ai-server/src/services/hand-analyzer.service.ts
import { logger } from '@poker-game/logger';

export interface HandAnalysisRequest {
    holeCards: string[];
    communityCards: string[];
    position: number;
    potSize: number;
    betToCall: number;
}

export interface HandAnalysisResult {
    handType: string;
    handRank: number;
    outs: number;
    drawProbability: number;
    handStrength: number;
    improvement: {
        onTurn: number;
        onRiver: number;
    };
}

export class HandAnalyzer {
    async analyzeHand(request: HandAnalysisRequest): Promise<HandAnalysisResult> {
        try {
            const { holeCards, communityCards } = request;
            const allCards = [...holeCards, ...communityCards];
            
            const handType = this.identifyHandType(allCards);
            const handRank = this.calculateHandRank(allCards);
            const outs = this.calculateOuts(holeCards, communityCards);
            const drawProbability = this.calculateDrawProbability(outs, communityCards.length);
            const handStrength = this.calculateRelativeHandStrength(allCards);
            const improvement = this.calculateImprovementProbabilities(outs, communityCards.length);

            return {
                handType,
                handRank,
                outs,
                drawProbability,
                handStrength,
                improvement
            };
        } catch (error) {
            logger.error('Hand analysis failed:', error);
            throw error;
        }
    }

    private identifyHandType(cards: string[]): string {
        if (cards.length < 5) return 'High Card';
        
        const ranks = cards.map(card => this.getRankValue(card[0])).sort((a, b) => b - a);
        const suits = cards.map(card => card[1]);
        
        const rankCounts = ranks.reduce((acc, rank) => {
            acc[rank] = (acc[rank] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);
        
        const counts = Object.values(rankCounts).sort((a, b) => b - a);
        const suitCounts = suits.reduce((acc, suit) => {
            acc[suit] = (acc[suit] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const isFlush = Object.values(suitCounts).some(count => count >= 5);
        const isStraight = this.isStraight(ranks);
        
        if (isFlush && isStraight) return 'Straight Flush';
        if (counts[0] === 4) return 'Four of a Kind';
        if (counts[0] === 3 && counts[1] === 2) return 'Full House';
        if (isFlush) return 'Flush';
        if (isStraight) return 'Straight';
        if (counts[0] === 3) return 'Three of a Kind';
        if (counts[0] === 2 && counts[1] === 2) return 'Two Pair';
        if (counts[0] === 2) return 'One Pair';
        
        return 'High Card';
    }

    private calculateHandRank(cards: string[]): number {
        const handType = this.identifyHandType(cards);
        const typeRanks = {
            'High Card': 1,
            'One Pair': 2,
            'Two Pair': 3,
            'Three of a Kind': 4,
            'Straight': 5,
            'Flush': 6,
            'Full House': 7,
            'Four of a Kind': 8,
            'Straight Flush': 9
        };
        
        return typeRanks[handType as keyof typeof typeRanks] || 1;
    }

    private calculateOuts(holeCards: string[], communityCards: string[]): number {
        // Simplified outs calculation
        const allCards = [...holeCards, ...communityCards];
        const availableCards = 52 - allCards.length;
        
        // This is a simplified calculation
        // In reality, we'd need to consider specific draws
        const handType = this.identifyHandType(allCards);
        
        switch (handType) {
            case 'High Card':
                return Math.min(6, availableCards); // Pair outs
            case 'One Pair':
                return Math.min(5, availableCards); // Two pair or trips
            case 'Two Pair':
                return Math.min(4, availableCards); // Full house
            case 'Three of a Kind':
                return Math.min(7, availableCards); // Full house or quads
            default:
                return Math.min(2, availableCards); // Improvement outs
        }
    }

    private calculateDrawProbability(outs: number, communityCardsCount: number): number {
        if (communityCardsCount >= 5) return 0;
        
        const cardsRemaining = 5 - communityCardsCount;
        const unknownCards = 52 - 2 - communityCardsCount; // 52 - hole cards - community cards
        
        if (cardsRemaining === 2) {
            // Turn and river
            return 1 - (((unknownCards - outs) / unknownCards) * ((unknownCards - outs - 1) / (unknownCards - 1)));
        } else if (cardsRemaining === 1) {
            // River only
            return outs / unknownCards;
        }
        
        return 0;
    }

    private calculateRelativeHandStrength(cards: string[]): number {
        const handRank = this.calculateHandRank(cards);
        return handRank / 9; // Normalize to 0-1 scale
    }

    private calculateImprovementProbabilities(outs: number, communityCardsCount: number): { onTurn: number; onRiver: number } {
        const unknownCards = 52 - 2 - communityCardsCount;
        
        let onTurn = 0;
        let onRiver = 0;
        
        if (communityCardsCount === 3) {
            onTurn = outs / unknownCards;
            onRiver = (unknownCards - outs) > 0 ? outs / (unknownCards - 1) : 0;
        } else if (communityCardsCount === 4) {
            onRiver = outs / unknownCards;
        }
        
        return { onTurn, onRiver };
    }

    private getRankValue(rank: string): number {
        const values: Record<string, number> = {
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
            '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
        };
        return values[rank] || 0;
    }

    private isStraight(ranks: number[]): boolean {
        const uniqueRanks = [...new Set(ranks)].sort((a, b) => b - a);
        if (uniqueRanks.length < 5) return false;
        
        // Check for regular straight
        for (let i = 0; i <= uniqueRanks.length - 5; i++) {
            let consecutive = true;
            for (let j = 1; j < 5; j++) {
                if (uniqueRanks[i + j] !== uniqueRanks[i] - j) {
                    consecutive = false;
                    break;
                }
            }
            if (consecutive) return true;
        }
        
        // Check for A-2-3-4-5 straight (wheel)
        const wheel = [14, 5, 4, 3, 2]; // A, 5, 4, 3, 2
        return wheel.every(rank => uniqueRanks.includes(rank));
    }
}