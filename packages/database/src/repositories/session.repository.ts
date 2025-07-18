// packages/database/src/repositories/session.repository.ts
import { UserSession, Prisma } from '../generated';
import { prisma } from '../client';
import { BaseRepository } from '../types/repository.types';

export interface CreateSessionData {
  userId: string;
  sessionId: string;
  deviceInfo?: any;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
}

class SessionRepository extends BaseRepository<UserSession> {
  protected model = prisma.userSession;

  async findBySessionId(sessionId: string): Promise<UserSession | null> {
    return this.model.findUnique({
      where: { sessionId },
      include: {
        user: true,
      },
    });
  }

  async findActiveByUserId(userId: string): Promise<UserSession[]> {
    return this.model.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        lastUsedAt: 'desc',
      },
    });
  }

  async createSession(data: CreateSessionData): Promise<UserSession> {
    return this.model.create({
      data,
    });
  }

  async updateLastUsed(sessionId: string): Promise<UserSession> {
    return this.model.update({
      where: { sessionId },
      data: {
        lastUsedAt: new Date(),
      },
    });
  }

  async deactivateSession(sessionId: string): Promise<UserSession> {
    return this.model.update({
      where: { sessionId },
      data: {
        isActive: false,
      },
    });
  }

  async deactivateAllUserSessions(userId: string): Promise<number> {
    const result = await this.model.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    return result.count;
  }

  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.model.deleteMany({
      where: {
        OR: [
          {
            expiresAt: {
              lt: new Date(),
            },
          },
          {
            isActive: false,
            lastUsedAt: {
              lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            },
          },
        ],
      },
    });

    return result.count;
  }

  async extendSession(
    sessionId: string,
    newExpiryDate: Date
  ): Promise<UserSession> {
    return this.model.update({
      where: { sessionId },
      data: {
        expiresAt: newExpiryDate,
        lastUsedAt: new Date(),
      },
    });
  }

  async getActiveSessionCount(): Promise<number> {
    return this.model.count({
      where: {
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async getSessionsByIpAddress(
    ipAddress: string,
    limit: number = 10
  ): Promise<UserSession[]> {
    return this.model.findMany({
      where: { ipAddress },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
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
}

export { SessionRepository };
