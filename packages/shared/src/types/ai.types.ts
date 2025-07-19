import { Card, GameState } from './game.types';

// packages/shared/src/types/ai.types.ts
export interface AIAnalysisRequest {
  playerId: string;
  gameState: GameState;
  playerCards: Card[];
  priority: 'low' | 'normal' | 'high';
}

export interface AIAnalysisResult {
  playerId: string;
  handStrength: number; // 0-1
  winProbability: number; // 0-1
  tieProba: number; // 0-1
  expectedValue: number;
  potOdds: number;
  impliedOdds: number;
  recommendation: AIRecommendation;
  confidence: number; // 0-1
  reasoning: string;
  patternAnalysis: PatternAnalysis;
}

export interface AIRecommendation {
  action: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in';
  amount?: number;
  strength: 'weak' | 'medium' | 'strong';
  explanation: string;
}

export interface PatternAnalysis {
  aggressionLevel: number; // 0-1
  tightnessLevel: number; // 0-1
  bluffFrequency: number; // 0-1
  positionalAwareness: number; // 0-1
  tendencies: string[];
}
