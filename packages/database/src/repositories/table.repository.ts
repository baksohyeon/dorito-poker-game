// packages/database/src/repositories/table.repository.ts
import { Table, Prisma } from '../generated';
import { prisma } from '../client';
import {
  BaseRepository,
  PaginatedResult,
  PaginationOptions,
} from '../types/repository.types';

export interface CreateTableData {
  id: string; // Snowflake ID
  serverId: string;
  name?: string;
  gameType?: 'TEXAS_HOLDEM' | 'OMAHA' | 'OMAHA_HI_LO' | 'SEVEN_CARD_STUD';
  maxPlayers?: number;
  minPlayers?: number;
  smallBlind: number;
  bigBlind: number;
  buyInMin: number;
  buyInMax: number;
  isPrivate?: boolean;
  password?: string;
  timeLimit?: number;
}

export interface UpdateTableData {
  name?: string;
  status?: 'WAITING' | 'ACTIVE' | 'PAUSED' | 'CLOSED';
  maxPlayers?: number;
  minPlayers?: number;
  smallBlind?: number;
  bigBlind?: number;
  buyInMin?: number;
  buyInMax?: number;
  isPrivate?: boolean;
  password?: string;
  timeLimit?: number;
}

export interface TableSearchFilters {
  serverId?: string;
  gameType?: string;
  status?: string;
  isPrivate?: boolean;
  maxPlayers?: number;
  blindRange?: {
    min: number;
    max: number;
  };
}

class TableRepository extends BaseRepository<Table> {
  protected model = prisma.table;

  async findByServerId(serverId: string): Promise<Table[]> {
    return this.model.findMany({
      where: { serverId },
      include: {
        games: {
          where: {
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
          },
        },
      },
    });
  }

  async createTable(data: CreateTableData): Promise<Table> {
    return this.model.create({
      data: {
        ...data,
        status: 'WAITING',
        gameType: data.gameType || 'TEXAS_HOLDEM',
        maxPlayers: data.maxPlayers || 9,
        minPlayers: data.minPlayers || 2,
        isPrivate: data.isPrivate || false,
        timeLimit: data.timeLimit || 30,
      },
    });
  }

  async updateTable(id: string, data: UpdateTableData): Promise<Table> {
    return this.model.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async findAvailableTables(filters?: {
    gameType?: string;
    maxBuyIn?: number;
    minBuyIn?: number;
  }): Promise<Table[]> {
    const where: Prisma.TableWhereInput = {
      status: 'WAITING',
      isPrivate: false,
    };

    if (filters?.gameType) {
      where.gameType = filters.gameType as
        | 'TEXAS_HOLDEM'
        | 'OMAHA'
        | 'OMAHA_HI_LO'
        | 'SEVEN_CARD_STUD';
    }

    if (filters?.maxBuyIn) {
      where.buyInMax = {
        lte: filters.maxBuyIn,
      };
    }

    if (filters?.minBuyIn) {
      where.buyInMin = {
        gte: filters.minBuyIn,
      };
    }

    return this.model.findMany({
      where,
      include: {
        games: {
          where: {
            status: {
              in: ['WAITING', 'STARTING', 'IN_PROGRESS'],
            },
          },
          include: {
            participants: {
              select: {
                userId: true,
                position: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async searchTables(
    filters: TableSearchFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<Table>> {
    const where: Prisma.TableWhereInput = {};
    if (filters.serverId) {
      where.serverId = filters.serverId;
    }

    if (filters.gameType) {
      where.gameType = filters.gameType as
        | 'TEXAS_HOLDEM'
        | 'OMAHA'
        | 'OMAHA_HI_LO'
        | 'SEVEN_CARD_STUD';
    }

    if (filters.status) {
      where.status = filters.status as
        | 'WAITING'
        | 'ACTIVE'
        | 'PAUSED'
        | 'CLOSED';
    }

    if (filters.isPrivate !== undefined) {
      where.isPrivate = filters.isPrivate;
    }

    if (filters.maxPlayers) {
      where.maxPlayers = {
        lte: filters.maxPlayers,
      };
    }

    if (filters.blindRange) {
      where.AND = [
        {
          bigBlind: {
            gte: filters.blindRange.min,
          },
        },
        {
          bigBlind: {
            lte: filters.blindRange.max,
          },
        },
      ];
    }

    return this.findPaginated(
      {
        where,
        include: {
          games: {
            where: {
              status: {
                in: ['WAITING', 'STARTING', 'IN_PROGRESS'],
              },
            },
            include: {
              participants: {
                select: {
                  userId: true,
                  position: true,
                  status: true,
                },
              },
            },
          },
        },
      },
      pagination
    );
  }

  async getTableWithCurrentGame(tableId: string): Promise<Table | null> {
    return this.model.findUnique({
      where: { id: tableId },
      include: {
        games: {
          where: {
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
                    chips: true,
                  },
                },
              },
            },
            events: {
              orderBy: { version: 'desc' },
              take: 100, // Last 100 events
            },
          },
        },
      },
    });
  }

  async getTableStatistics(tableId: string): Promise<{
    totalGames: number;
    averageGameDuration: number;
    averagePlayers: number;
    totalHandsPlayed: number;
    averagePot: number;
  }> {
    const table = await this.model.findUnique({
      where: { id: tableId },
      include: {
        games: {
          where: {
            status: 'FINISHED',
          },
          include: {
            participants: true,
            events: true,
          },
        },
      },
    });

    if (!table) {
      throw new Error('Table not found');
    }

    const totalGames = table.games?.length || 0;
    const totalHandsPlayed = table.games?.reduce(
      (sum, game) =>
        sum + (game.events?.filter(e => e.type === 'ROUND_ENDED').length || 0),
      0
    );

    const averageGameDuration =
      totalGames > 0
        ? (table.games?.reduce((sum, game) => {
            if (game.endedAt && game.startedAt) {
              return sum + (game.endedAt.getTime() - game.startedAt.getTime());
            }
            return sum;
          }, 0) || 0) / totalGames
        : 0;

    const averagePlayers =
      totalGames > 0
        ? (table.games?.reduce(
            (sum, game) => sum + (game.participants?.length || 0),
            0
          ) || 0) / totalGames
        : 0;

    const totalPots = table.games?.reduce(
      (sum, game) =>
        sum +
        (game.events?.filter((e: any) => e.type === 'POT_AWARDED').length || 0),
      0
    );

    const averagePot =
      (totalPots || 0) > 0
        ? (table.games?.reduce((sum, game) => {
            const potEvents =
              game.events?.filter((e: any) => e.type === 'POT_AWARDED') || [];
            const eventSum = potEvents.reduce(
              (potSum: number, event: any) =>
                potSum + (event.data?.amount || 0),
              0
            );
            return sum + eventSum;
          }, 0) || 0) / (totalPots || 1)
        : 0;

    return {
      totalGames,
      averageGameDuration,
      averagePlayers,
      totalHandsPlayed: totalHandsPlayed || 0,
      averagePot,
    };
  }

  async closeTable(tableId: string): Promise<Table> {
    return this.model.update({
      where: { id: tableId },
      data: {
        status: 'CLOSED',
        updatedAt: new Date(),
      },
    });
  }

  async getServerTableLoad(serverId: string): Promise<{
    totalTables: number;
    activeTables: number;
    totalPlayers: number;
    averagePlayersPerTable: number;
  }> {
    const tables = await this.findByServerId(serverId);
    const activeTables = tables.filter(t => t.status === 'ACTIVE').length;

    const totalPlayers = tables.reduce((sum, table) => {
      const currentGame = table.games?.[0]; // Current active game
      return sum + (currentGame?.participants?.length || 0);
    }, 0);

    return {
      totalTables: tables.length,
      activeTables,
      totalPlayers,
      averagePlayersPerTable:
        tables.length > 0 ? totalPlayers / tables.length : 0,
    };
  }
}

export { TableRepository };
