// packages/database/src/repositories/game.repository.ts
import { Game, GameParticipation, GameEvent, Prisma } from '../generated';
import { prisma } from '../client';
import {
  BaseRepository,
  PaginatedResult,
  PaginationOptions,
} from '../types/repository.types';

export interface CreateGameData {
  tableId: string;
  gameNumber: number;
  status?: 'WAITING' | 'STARTING' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
}

export interface UpdateGameData {
  status?: 'WAITING' | 'STARTING' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
  currentRound?: number;
  currentPhase?:
    | 'PREFLOP'
    | 'FLOP'
    | 'TURN'
    | 'RIVER'
    | 'SHOWDOWN'
    | 'FINISHED';
  pot?: number;
  sidePots?: any;
  communityCards?: any;
  currentPlayerId?: string;
  dealerPosition?: number;
  smallBlindPos?: number;
  bigBlindPos?: number;
  actionStartTime?: Date;
  winnerId?: string;
  winningHand?: any;
  startedAt?: Date;
  endedAt?: Date;
}

export interface GameSearchFilters {
  tableId?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  playerId?: string;
}

class GameRepository extends BaseRepository<Game> {
  protected model = prisma.game;

  async findByTableId(tableId: string): Promise<Game[]> {
    return this.model.findMany({
      where: { tableId },
      orderBy: { gameNumber: 'desc' },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        events: {
          orderBy: { version: 'asc' },
        },
      },
    });
  }

  async findActiveByTableId(tableId: string): Promise<Game | null> {
    return this.model.findFirst({
      where: {
        tableId,
        status: {
          in: ['WAITING', 'STARTING', 'IN_PROGRESS'],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        events: {
          orderBy: { version: 'asc' },
        },
      },
    });
  }

  async createGame(data: CreateGameData): Promise<Game> {
    return this.model.create({
      data: {
        ...data,
        status: data.status || 'WAITING',
      },
    });
  }

  async updateGame(id: string, data: UpdateGameData): Promise<Game> {
    return this.model.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async addParticipant(
    gameId: string,
    participantData: {
      userId: string;
      position: number;
      startingChips: number;
      buyInAmount: number;
    }
  ): Promise<GameParticipation> {
    return prisma.gameParticipation.create({
      data: {
        gameId,
        ...participantData,
        chips: participantData.startingChips,
      },
    });
  }

  async updateParticipant(
    gameId: string,
    userId: string,
    data: {
      chips?: number;
      currentBet?: number;
      totalBet?: number;
      status?:
        | 'ACTIVE'
        | 'FOLDED'
        | 'ALL_IN'
        | 'SITTING_OUT'
        | 'DISCONNECTED'
        | 'ELIMINATED';
      hasActed?: boolean;
      lastAction?: 'FOLD' | 'CHECK' | 'CALL' | 'BET' | 'RAISE' | 'ALL_IN';
      cards?: any;
      finalPosition?: number;
      winnings?: number;
      bestHand?: any;
      handRank?: number;
    }
  ): Promise<GameParticipation> {
    return prisma.gameParticipation.update({
      where: {
        gameId_userId: {
          gameId,
          userId,
        },
      },
      data: {
        ...data,
        lastActionTime: data.lastAction ? new Date() : undefined,
      },
    });
  }

  async addEvent(
    gameId: string,
    eventData: {
      type: string;
      data: any;
      playerId?: string;
      phase?: string;
      round?: number;
    }
  ): Promise<GameEvent> {
    // Get the next version number
    const lastEvent = await prisma.gameEvent.findFirst({
      where: { gameId },
      orderBy: { version: 'desc' },
    });

    const nextVersion = (lastEvent?.version || 0) + 1;

    return prisma.gameEvent.create({
      data: {
        gameId,
        ...eventData,
        version: nextVersion,
      },
    });
  }

  async getGameEvents(
    gameId: string,
    fromVersion?: number
  ): Promise<GameEvent[]> {
    return prisma.gameEvent.findMany({
      where: {
        gameId,
        version: fromVersion ? { gte: fromVersion } : undefined,
      },
      orderBy: { version: 'asc' },
    });
  }

  async searchGames(
    filters: GameSearchFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<Game>> {
    const where: Prisma.GameWhereInput = {};

    if (filters.tableId) {
      where.tableId = filters.tableId;
    }

    if (filters.status) {
      where.status = filters.status as any;
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

    if (filters.playerId) {
      where.participants = {
        some: {
          userId: filters.playerId,
        },
      };
    }

    return this.findPaginated(
      {
        where,
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
        },
      },
      pagination
    );
  }

  async getPlayerGameHistory(
    userId: string,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<GameParticipation>> {
    const { page, limit, orderBy } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.gameParticipation.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: orderBy || { joinedAt: 'desc' },
        include: {
          game: {
            include: {
              table: {
                select: {
                  id: true,
                  name: true,
                  smallBlind: true,
                  bigBlind: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.gameParticipation.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async getGameStatistics(gameId: string): Promise<{
    totalHands: number;
    averagePot: number;
    duration: number;
    participants: Array<{
      userId: string;
      username: string;
      finalPosition: number | null;
      winnings: number;
    }>;
  }> {
    const game = await this.model.findUnique({
      where: { id: gameId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        events: true,
      },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    const duration =
      game.endedAt && game.startedAt
        ? game.endedAt.getTime() - game.startedAt.getTime()
        : 0;

    const roundEvents =
      game.events?.filter((e: GameEvent) => e.type === 'ROUND_ENDED') || [];
    const totalHands = roundEvents.length;

    const potEvents =
      game.events?.filter((e: GameEvent) => e.type === 'POT_AWARDED') || [];
    const averagePot =
      totalHands > 0
        ? potEvents.reduce(
            (sum: number, event: GameEvent) => sum + (event.data.amount || 0),
            0
          ) / totalHands
        : 0;

    const participants =
      game.participants?.map((p: GameParticipation) => ({
        userId: p.userId,
        username: p.user?.username || 'Unknown',
        finalPosition: p.finalPosition || null,
        winnings: p.winnings || 0,
      })) || [];

    return {
      totalHands,
      averagePot,
      duration,
      participants,
    };
  }

  async finishGame(
    gameId: string,
    winnerId?: string,
    winningHand?: any
  ): Promise<Game> {
    return this.model.update({
      where: { id: gameId },
      data: {
        status: 'FINISHED',
        endedAt: new Date(),
        winnerId,
        winningHand,
        updatedAt: new Date(),
      },
    });
  }

  async cancelGame(gameId: string): Promise<Game> {
    return this.model.update({
      where: { id: gameId },
      data: {
        status: 'CANCELLED',
        endedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}

export { GameRepository };
