import { HandAnalyzer, HandAnalysisRequest } from '../services/hand-analyzer.service';

describe('HandAnalyzer', () => {
    let analyzer: HandAnalyzer;

    beforeEach(() => {
        analyzer = new HandAnalyzer();
    });

    describe('analyzeHand', () => {
        it('should correctly identify a pair', async () => {
            const request: HandAnalysisRequest = {
                holeCards: ['AH', 'AC'], // Pair of Aces
                communityCards: ['2H', '7D', '9S'],
                position: 1,
                potSize: 100,
                betToCall: 20
            };

            const result = await analyzer.analyzeHand(request);

            expect(result.handType).toBe('One Pair');
            expect(result.handRank).toBe(2);
            expect(result.handStrength).toBeCloseTo(2 / 9, 2);
            expect(result.outs).toBeLessThanOrEqual(5);
            expect(result.drawProbability).toBeGreaterThan(0);
        });

        it('should correctly identify a flush', async () => {
            const request: HandAnalysisRequest = {
                holeCards: ['AH', 'KH'],
                communityCards: ['2H', '7H', '9H'], // All hearts
                position: 1,
                potSize: 100,
                betToCall: 20
            };

            const result = await analyzer.analyzeHand(request);

            expect(result.handType).toBe('Flush');
            expect(result.handRank).toBe(6);
            expect(result.handStrength).toBeCloseTo(6 / 9, 2);
            expect(result.outs).toBeLessThanOrEqual(2);
        });

        it('should correctly identify high card', async () => {
            const request: HandAnalysisRequest = {
                holeCards: ['AH', 'KD'],
                communityCards: ['2S', '7C', '9H'], // No pairs or draws
                position: 1,
                potSize: 100,
                betToCall: 20
            };

            const result = await analyzer.analyzeHand(request);

            expect(result.handType).toBe('High Card');
            expect(result.handRank).toBe(1);
            expect(result.handStrength).toBeCloseTo(1 / 9, 2);
            expect(result.outs).toBeLessThanOrEqual(6);
            expect(result.drawProbability).toBeGreaterThan(0);
        });

        it('should calculate improvement probabilities correctly', async () => {
            const request: HandAnalysisRequest = {
                holeCards: ['AH', 'KH'],
                communityCards: ['2H', '7H', '9S'], // Flush draw
                position: 1,
                potSize: 100,
                betToCall: 20
            };

            const result = await analyzer.analyzeHand(request);

            expect(result.improvement.onTurn).toBeGreaterThan(0);
            expect(result.improvement.onRiver).toBeGreaterThan(0);
            expect(result.improvement.onTurn).toBeLessThanOrEqual(1);
            expect(result.improvement.onRiver).toBeLessThanOrEqual(1);
        });
    });
}); 