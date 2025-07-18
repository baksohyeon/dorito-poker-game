// packages/database/src/repositories/ai-analysis.repository.ts
import { AIAnalysis, Prisma } from '../generated';
import { prisma } from '../client';
import {
  BaseRepository,
  PaginatedResult,
  PaginationOptions,
} from '../types/repository.types';

export interface CreateAIAnalysisData {
  userId: string;
  gameId: string;
  holeCards: any;
  communityCards: any;
  position: number;
  handStrength: number;
  winProbability: number;
  tieProba?: number;
  expectedValue: number;
  potOdds: number;
  impliedOdds: number;
  recommendation:
    | 'FOLD'
    | 'CHECK'
    | 'CALL'
    | 'BET_SMALL'
    | 'BET_MEDIUM'
    | 'BET_LARGE'
    | 'RAISE_SMALL'
    | 'RAISE_MEDIUM'
    | 'RAISE_LARGE'
    | 'ALL_IN';
  confidence: number;
  reasoning?: string;
  aggressionLevel?: number;
  tightnessLevel?: number;
  bluffFrequency?: number;
  positionalAwareness?: number;
  potSize: number;
  betToCall: number;
  playersInHand: number;
}

export interface AIAnalysisFilters {
  userId?: string;
  gameId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  recommendation?: string;
  minConfidence?: number;
  maxConfidence?: number;
}

class AIAnalysisRepository extends BaseRepository<AIAnalysis> {
  protected model = prisma.aIAnalysis;

  async createAnalysis(data: CreateAIAnalysisData): Promise<AIAnalysis> {
    return this.model.create({
      data: {
        ...data,
        tieProba: data.tieProba || 0,
      },
    });
  }

  async findByGameId(gameId: string): Promise<AIAnalysis[]> {
    return this.model.findMany({
      where: { gameId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  async findByUserId(
    userId: string,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<AIAnalysis>> {
    return this.findPaginated(
      {
        where: { userId },
        orderBy: { createdAt: 'desc' },
      },
      pagination
    );
  }

  async searchAnalyses(
    filters: AIAnalysisFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<AIAnalysis>> {
    const where: Prisma.AIAnalysisWhereInput = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.gameId) {
      where.gameId = filters.gameId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    if (filters.recommendation) {
      where.recommendation = filters.recommendation as any;
    }

    if (
      filters.minConfidence !== undefined ||
      filters.maxConfidence !== undefined
    ) {
      where.confidence = {};
      if (filters.minConfidence !== undefined) {
        where.confidence.gte = filters.minConfidence;
      }
      if (filters.maxConfidence !== undefined) {
        where.confidence.lte = filters.maxConfidence;
      }
    }

    return this.findPaginated(
      {
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
      pagination
    );
  }

  async getPlayerAnalysisStats(userId: string): Promise<{
    totalAnalyses: number;
    averageConfidence: number;
    mostCommonRecommendation: string;
    averageWinProbability: number;
    recommendationBreakdown: Record<string, number>;
  }> {
    const analyses = await this.model.findMany({
      where: { userId },
    });

    if (analyses.length === 0) {
      return {
        totalAnalyses: 0,
        averageConfidence: 0,
        mostCommonRecommendation: '',
        averageWinProbability: 0,
        recommendationBreakdown: {},
      };
    }

    const averageConfidence =
      analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length;
    const averageWinProbability =
      analyses.reduce((sum, a) => sum + a.winProbability, 0) / analyses.length;

    const recommendationCounts = analyses.reduce(
      (acc, analysis) => {
        acc[analysis.recommendation] = (acc[analysis.recommendation] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const mostCommonRecommendation =
      Object.entries(recommendationCounts).sort(
        ([, a], [, b]) => b - a
      )[0]?.[0] || '';

    return {
      totalAnalyses: analyses.length,
      averageConfidence,
      mostCommonRecommendation,
      averageWinProbability,
      recommendationBreakdown: recommendationCounts,
    };
  }

  async getRecommendationAccuracy(
    userId: string,
    days: number = 30
  ): Promise<{
    totalRecommendations: number;
    correctPredictions: number;
    accuracy: number;
    byRecommendation: Record<
      string,
      { total: number; correct: number; accuracy: number }
    >;
  }> {
    const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const analyses = await this.model.findMany({
      where: {
        userId,
        createdAt: {
          gte: dateFrom,
        },
      },
      include: {
        // We would need to join with actual game results to calculate accuracy
        // This is a simplified version
      },
    });

    // This would require actual game outcome data to implement properly
    // For now, returning a placeholder structure
    const byRecommendation: Record<
      string,
      { total: number; correct: number; accuracy: number }
    > = {};

    analyses.forEach(analysis => {
      if (!byRecommendation[analysis.recommendation]) {
        byRecommendation[analysis.recommendation] = {
          total: 0,
          correct: 0,
          accuracy: 0,
        };
      }
      byRecommendation[analysis.recommendation].total++;
      // Would calculate correct predictions based on actual game outcomes
    });

    Object.keys(byRecommendation).forEach(recommendation => {
      const stats = byRecommendation[recommendation];
      stats.accuracy = stats.total > 0 ? stats.correct / stats.total : 0;
    });

    return {
      totalRecommendations: analyses.length,
      correctPredictions: 0, // Would calculate from actual results
      accuracy: 0, // Would calculate from actual results
      byRecommendation,
    };
  }

  async deleteOldAnalyses(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date(
      Date.now() - olderThanDays * 24 * 60 * 60 * 1000
    );

    const result = await this.model.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}

export { AIAnalysisRepository };
