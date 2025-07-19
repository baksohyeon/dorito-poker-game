// apps/ai-server/src/services/analysis.service.ts
import { logger } from '@poker-game/logger';

export interface AnalysisRequest {
    holeCards: string[];
    communityCards: string[];
    position: number;
    potSize: number;
    betToCall: number;
    playersInHand: number;
}

export interface AnalysisResult {
    handStrength: number;
    winProbability: number;
    recommendation: 'fold' | 'call' | 'raise' | 'check' | 'bet';
    confidence: number;
    reasoning: string;
    potOdds: number;
    expectedValue: number;
}

export class AIAnalysisService {
    async getRecommendation(request: AnalysisRequest): Promise<AnalysisResult> {
        try {
            // Basic hand strength calculation (simplified)
            const handStrength = this.calculateHandStrength(request.holeCards, request.communityCards);
            const winProbability = this.estimateWinProbability(handStrength, request.playersInHand);
            const potOdds = this.calculatePotOdds(request.potSize, request.betToCall);
            const expectedValue = this.calculateExpectedValue(winProbability, request.potSize, request.betToCall);
            
            const recommendation = this.getRecommendationFromAnalysis({
                handStrength,
                winProbability,
                potOdds,
                expectedValue,
                position: request.position
            });

            const confidence = this.calculateConfidence(handStrength, request.communityCards.length);
            const reasoning = this.generateReasoning(recommendation, handStrength, winProbability, potOdds);

            return {
                handStrength,
                winProbability,
                recommendation,
                confidence,
                reasoning,
                potOdds,
                expectedValue
            };
        } catch (error) {
            logger.error('Analysis failed:', error);
            throw error;
        }
    }

    private calculateHandStrength(holeCards: string[], communityCards: string[]): number {
        // Simplified hand strength calculation
        // In a real implementation, this would use proper poker hand evaluation
        const allCards = [...holeCards, ...communityCards];
        
        // Basic scoring system (0-1 scale)
        let strength = 0.1; // Base strength
        
        // Check for pairs
        const ranks = allCards.map(card => card[0]);
        const rankCounts = ranks.reduce((acc, rank) => {
            acc[rank] = (acc[rank] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const counts = Object.values(rankCounts).sort((a, b) => b - a);
        
        if (counts[0] >= 4) strength = 0.95; // Four of a kind
        else if (counts[0] >= 3 && counts[1] >= 2) strength = 0.9; // Full house
        else if (counts[0] >= 3) strength = 0.6; // Three of a kind
        else if (counts[0] >= 2 && counts[1] >= 2) strength = 0.5; // Two pair
        else if (counts[0] >= 2) strength = 0.3; // One pair
        
        // Check for high cards
        const highCards = ranks.filter(rank => ['A', 'K', 'Q', 'J'].includes(rank));
        strength += highCards.length * 0.05;
        
        return Math.min(strength, 1.0);
    }

    private estimateWinProbability(handStrength: number, playersInHand: number): number {
        // Adjust win probability based on number of opponents
        const baseWinRate = handStrength;
        const adjustment = Math.pow(0.85, playersInHand - 1);
        return baseWinRate * adjustment;
    }

    private calculatePotOdds(potSize: number, betToCall: number): number {
        if (betToCall === 0) return Infinity;
        return potSize / betToCall;
    }

    private calculateExpectedValue(winProbability: number, potSize: number, betToCall: number): number {
        const winAmount = potSize;
        const loseAmount = betToCall;
        return (winProbability * winAmount) - ((1 - winProbability) * loseAmount);
    }

    private getRecommendationFromAnalysis(analysis: {
        handStrength: number;
        winProbability: number;
        potOdds: number;
        expectedValue: number;
        position: number;
    }): 'fold' | 'call' | 'raise' | 'check' | 'bet' {
        const { handStrength, winProbability, potOdds, expectedValue, position } = analysis;
        
        // If expected value is negative, consider folding
        if (expectedValue < -10) return 'fold';
        
        // Strong hands - consider raising
        if (handStrength > 0.8 || winProbability > 0.7) return 'raise';
        
        // Good hands with good pot odds - call
        if (handStrength > 0.4 && potOdds > 2) return 'call';
        
        // Marginal hands - check if possible, otherwise fold
        if (handStrength > 0.2) return 'check';
        
        return 'fold';
    }

    private calculateConfidence(handStrength: number, communityCardsCount: number): number {
        // More community cards = higher confidence in analysis
        const baseConfidence = 0.5;
        const handBonus = handStrength * 0.3;
        const cardBonus = (communityCardsCount / 5) * 0.2;
        
        return Math.min(baseConfidence + handBonus + cardBonus, 1.0);
    }

    private generateReasoning(
        recommendation: string,
        handStrength: number,
        winProbability: number,
        potOdds: number
    ): string {
        const reasons = [];
        
        if (handStrength > 0.8) {
            reasons.push('Very strong hand');
        } else if (handStrength > 0.5) {
            reasons.push('Good hand strength');
        } else if (handStrength < 0.3) {
            reasons.push('Weak hand');
        }
        
        if (winProbability > 0.6) {
            reasons.push('High win probability');
        } else if (winProbability < 0.3) {
            reasons.push('Low win probability');
        }
        
        if (potOdds > 3) {
            reasons.push('Favorable pot odds');
        } else if (potOdds < 2) {
            reasons.push('Poor pot odds');
        }
        
        return reasons.join(', ') || `Recommended action: ${recommendation}`;
    }
}