
// packages/shared/src/__tests__/validation.test.ts
import { ValidationHelper } from '../utils/validation';
import { Card, PlayerAction } from '../types';

describe('ValidationHelper', () => {
    describe('validateCard', () => {
        it('should validate correct card', () => {
            const card: Card = { suit: 'hearts', rank: 'A', value: 14 };
            expect(ValidationHelper.validateCard(card)).toBe(true);
        });

        it('should reject invalid card', () => {
            const invalidCard = { suit: 'invalid', rank: 'A', value: 14 };
            expect(ValidationHelper.validateCard(invalidCard)).toBe(false);
        });
    });

    describe('validatePlayerAction', () => {
        it('should validate correct action', () => {
            const action: PlayerAction = {
                type: 'bet',
                amount: 100,
                timestamp: Date.now(),
                playerId: 'player1'
            };
            expect(ValidationHelper.validatePlayerAction(action)).toBe(true);
        });

        it('should reject action without required fields', () => {
            const invalidAction = { type: 'bet' };
            expect(ValidationHelper.validatePlayerAction(invalidAction)).toBe(false);
        });
    });

    describe('validateSnowflakeId', () => {
        it('should validate correct snowflake ID', () => {
            expect(ValidationHelper.validateSnowflakeId('123456789012345')).toBe(true);
            expect(ValidationHelper.validateSnowflakeId('1234567890123456789')).toBe(true);
        });

        it('should reject invalid snowflake ID', () => {
            expect(ValidationHelper.validateSnowflakeId('123')).toBe(false);
            expect(ValidationHelper.validateSnowflakeId('12345678901234567890')).toBe(false);
            expect(ValidationHelper.validateSnowflakeId('abc123')).toBe(false);
        });
    });

    describe('validateBetAmount', () => {
        it('should validate correct bet', () => {
            const result = ValidationHelper.validateBetAmount(100, 50, 500);
            expect(result.valid).toBe(true);
        });

        it('should reject bet higher than chips', () => {
            const result = ValidationHelper.validateBetAmount(600, 50, 500);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Insufficient chips');
        });

        it('should reject bet lower than current bet', () => {
            const result = ValidationHelper.validateBetAmount(30, 50, 500);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Bet amount too low');
        });
    });
});