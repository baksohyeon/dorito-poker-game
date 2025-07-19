// packages/database/src/repositories/user.repository.ts
import { User, Prisma } from '../generated';
import { prisma } from '../client';
import {
  BaseRepository,
  PaginatedResult,
  PaginationOptions,
} from '../types/repository.types';

export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  country?: string;
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  chips?: number;
  avatar?: string;
  soundEnabled?: boolean;
  animationsEnabled?: boolean;
  autoMuckEnabled?: boolean;
  aiAssistEnabled?: boolean;
}

export interface UserStatsUpdate {
  gamesPlayed?: number;
  gamesWon?: number;
  totalWinnings?: number;
  totalLosses?: number;
  experience?: number;
  level?: number;
  rank?: string;
}

export interface UserSearchFilters {
  username?: string;
  email?: string;
  level?: number;
  rank?: string;
  country?: string;
  isOnline?: boolean;
}

class UserRepository extends BaseRepository<User> {
  protected model = prisma.user;

  async findByEmail(email: string): Promise<User | null> {
    return this.model.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.model.findUnique({
      where: { username },
    });
  }

  async findByEmailOrUsername(emailOrUsername: string): Promise<User | null> {
    return this.model.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });
  }

  async createUser(data: CreateUserData): Promise<User> {
    return this.model.create({
      data: {
        ...data,
        chips: 1000, // Default starting chips
        level: 1,
        rank: 'Beginner',
      },
    });
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    return this.model.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async updateUserStats(id: string, stats: UserStatsUpdate): Promise<User> {
    return this.model.update({
      where: { id },
      data: {
        ...stats,
        updatedAt: new Date(),
      },
    });
  }

  async addChips(id: string, amount: number): Promise<User> {
    return this.model.update({
      where: { id },
      data: {
        chips: {
          increment: amount,
        },
        updatedAt: new Date(),
      },
    });
  }

  async deductChips(id: string, amount: number): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.chips < amount) {
      throw new Error('Insufficient chips');
    }

    return this.model.update({
      where: { id },
      data: {
        chips: {
          decrement: amount,
        },
        updatedAt: new Date(),
      },
    });
  }

  async updateLastLogin(id: string): Promise<User> {
    return this.model.update({
      where: { id },
      data: {
        lastLogin: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findWithStats(id: string): Promise<User | null> {
    return this.model.findUnique({
      where: { id },
      include: {
        gameParticipations: {
          include: {
            game: true,
          },
          orderBy: {
            joinedAt: 'desc',
          },
          take: 10, // Last 10 games
        },
      },
    });
  }

  async searchUsers(
    filters: UserSearchFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<User>> {
    const where: Prisma.UserWhereInput = {};

    if (filters.username) {
      where.username = {
        contains: filters.username,
        mode: 'insensitive',
      };
    }

    if (filters.email) {
      where.email = {
        contains: filters.email,
        mode: 'insensitive',
      };
    }

    if (filters.level) {
      where.level = filters.level;
    }

    if (filters.rank) {
      where.rank = filters.rank;
    }

    if (filters.country) {
      where.country = filters.country;
    }

    if (filters.isOnline !== undefined) {
      if (filters.isOnline) {
        where.sessions = {
          some: {
            isActive: true,
            expiresAt: {
              gt: new Date(),
            },
          },
        };
      } else {
        where.sessions = {
          none: {
            isActive: true,
            expiresAt: {
              gt: new Date(),
            },
          },
        };
      }
    }

    return this.findPaginated({ where }, pagination);
  }

  async getTopPlayers(limit: number = 50) {
    return this.model.findMany({
      take: limit,
      orderBy: [
        { totalWinnings: 'desc' },
        { level: 'desc' },
        { experience: 'desc' },
      ],
      select: {
        id: true,
        username: true,
        avatar: true,
        level: true,
        rank: true,
        totalWinnings: true,
        gamesPlayed: true,
        gamesWon: true,
        country: true,
      },
    });
  }

  async getUserRanking(userId: string): Promise<number> {
    const betterUsers = await this.model.count({
      where: {
        OR: [{ totalWinnings: { gt: 0 } }, { level: { gt: 1 } }],
        totalWinnings: {
          gt: await this.model
            .findUnique({ where: { id: userId } })
            .then((user: User | null) => user?.totalWinnings || 0),
        },
      },
    });

    return betterUsers + 1;
  }

  async deleteUser(id: string): Promise<User> {
    // Soft delete - mark as deleted but keep data for game history
    return this.model.update({
      where: { id },
      data: {
        email: `deleted_${Date.now()}_${id}@deleted.com`,
        username: `deleted_${Date.now()}_${id}`,
        updatedAt: new Date(),
      },
    });
  }

  async deleteAllUsers(): Promise<{ count: number }> {
    // For test cleanup - hard delete all users
    return this.model.deleteMany({});
  }
}

export { UserRepository };
