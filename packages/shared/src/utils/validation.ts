// packages/shared/src/utils/validation.ts
import {
  Card,
  PlayerAction,
  TableConfig,
  Player,
} from 'packages/shared/src/types';
import { z } from 'zod';

/**
 * Validation schemas using Zod
 */

// Card validation
export const CardSchema = z.object({
  suit: z.enum(['hearts', 'diamonds', 'clubs', 'spades']),
  rank: z.enum([
    'A',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
  ]),
  value: z.number().min(1).max(14),
});

// Player action validation
export const PlayerActionSchema = z.object({
  type: z.enum(['fold', 'check', 'call', 'bet', 'raise', 'all-in']),
  amount: z.number().min(0).optional(),
  timestamp: z.number(),
  playerId: z.string().min(1),
});

// Table configuration validation
export const TableConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  maxPlayers: z.number().min(2).max(10),
  minPlayers: z.number().min(2),
  blinds: z.object({
    small: z.number().min(1),
    big: z.number().min(1),
  }),
  buyIn: z.object({
    min: z.number().min(1),
    max: z.number().min(1),
  }),
  gameType: z.enum(['texas-holdem', 'omaha', 'seven-card-stud']),
  isPrivate: z.boolean(),
  password: z.string().optional(),
  timeLimit: z.number().min(10).max(300),
});

// Player validation
export const PlayerSchema = z.object({
  id: z.string().min(1),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  chips: z.number().min(0),
  avatar: z.string().url().optional(),
  level: z.number().min(1),
  experience: z.number().min(0),
  rank: z.string().min(1),
});

/**
 * Validation helper functions
 */
export class ValidationHelper {
  static validateCard(card: unknown): card is Card {
    return CardSchema.safeParse(card).success;
  }

  static validatePlayerAction(action: unknown): action is PlayerAction {
    return PlayerActionSchema.safeParse(action).success;
  }

  static validateTableConfig(config: unknown): config is TableConfig {
    return TableConfigSchema.safeParse(config).success;
  }

  static validatePlayer(player: unknown): player is Player {
    return PlayerSchema.safeParse(player).success;
  }

  static validateSnowflakeId(id: string): boolean {
    // Check if it's a valid snowflake ID format
    return /^\d{15,19}$/.test(id);
  }

  static validateEmail(email: string): boolean {
    return z.string().email().safeParse(email).success;
  }

  static validateUsername(username: string): boolean {
    return z
      .string()
      .min(3)
      .max(20)
      .regex(/^[a-zA-Z0-9_]+$/)
      .safeParse(username).success;
  }

  static validateChipAmount(amount: number, maxAmount?: number): boolean {
    if (amount < 0) return false;
    if (maxAmount && amount > maxAmount) return false;
    return Number.isInteger(amount);
  }

  static validateBetAmount(
    amount: number,
    currentBet: number,
    chips: number
  ): {
    valid: boolean;
    error?: string;
  } {
    if (!Number.isInteger(amount) || amount < 0) {
      return { valid: false, error: 'Invalid bet amount' };
    }

    if (amount > chips) {
      return { valid: false, error: 'Insufficient chips' };
    }

    if (amount < currentBet && amount !== chips) {
      return { valid: false, error: 'Bet amount too low' };
    }

    return { valid: true };
  }
}

// Re-export types for convenience
export type { Card, PlayerAction, TableConfig, Player } from '../types';
