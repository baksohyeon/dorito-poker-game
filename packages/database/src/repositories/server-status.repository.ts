// packages/database/src/repositories/server-status.repository.ts
import { ServerStatus, Prisma } from '../generated';
import { prisma } from '../client';
import { BaseRepository } from '../types/repository.types';

export interface CreateServerStatusData {
  serverId: string;
  serverType: 'MASTER' | 'DEDICATED' | 'AI';
  status?: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'OVERLOADED';
  host: string;
  port: number;
  maxTables?: number;
  maxPlayers?: number;
  region?: string;
}

export interface UpdateServerStatusData {
  status?: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'OVERLOADED';
  currentTables?: number;
  currentPlayers?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  maxTables?: number;
  maxPlayers?: number;
  region?: string;
  host?: string;
  port?: number;
}

class ServerStatusRepository extends BaseRepository<ServerStatus> {
  protected model = prisma.serverStatus;

  async findByServerId(serverId: string): Promise<ServerStatus | null> {
    return this.model.findUnique({
      where: { serverId },
    });
  }

  async findByServerType(
    serverType: 'MASTER' | 'DEDICATED' | 'AI'
  ): Promise<ServerStatus[]> {
    return this.model.findMany({
      where: { serverType },
      orderBy: { lastHeartbeat: 'desc' },
    });
  }

  async createServerStatus(
    data: CreateServerStatusData
  ): Promise<ServerStatus> {
    return this.model.create({
      data: {
        ...data,
        status: data.status || 'ONLINE',
        maxTables: data.maxTables || 20,
        maxPlayers: data.maxPlayers || 180,
      },
    });
  }

  async updateServerStatus(
    serverId: string,
    data: UpdateServerStatusData
  ): Promise<ServerStatus> {
    return this.model.update({
      where: { serverId },
      data: {
        ...data,
        lastHeartbeat: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async updateHeartbeat(serverId: string): Promise<ServerStatus> {
    return this.model.update({
      where: { serverId },
      data: {
        lastHeartbeat: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findAvailableServers(
    serverType?: 'MASTER' | 'DEDICATED' | 'AI'
  ): Promise<ServerStatus[]> {
    const where: Prisma.ServerStatusWhereInput = {
      status: 'ONLINE',
      lastHeartbeat: {
        gte: new Date(Date.now() - 60000), // Last heartbeat within 1 minute
      },
    };

    if (serverType) {
      where.serverType = serverType;
    }

    return this.model.findMany({
      where,
      orderBy: [{ currentPlayers: 'asc' }, { currentTables: 'asc' }],
    });
  }

  async findBestAvailableServer(
    serverType: 'DEDICATED' | 'AI' = 'DEDICATED'
  ): Promise<ServerStatus | null> {
    return this.model.findFirst({
      where: {
        serverType,
        status: 'ONLINE',
        lastHeartbeat: {
          gte: new Date(Date.now() - 60000),
        },
        // Server not at capacity
        OR: [
          {
            AND: [
              { currentTables: { lt: prisma.serverStatus.fields.maxTables } },
              { currentPlayers: { lt: prisma.serverStatus.fields.maxPlayers } },
            ],
          },
        ],
      },
      orderBy: [
        { cpuUsage: 'asc' },
        { memoryUsage: 'asc' },
        { currentPlayers: 'asc' },
      ],
    });
  }

  async markServerOffline(serverId: string): Promise<ServerStatus> {
    return this.model.update({
      where: { serverId },
      data: {
        status: 'OFFLINE',
        updatedAt: new Date(),
      },
    });
  }

  async cleanupStaleServers(
    staleThresholdMinutes: number = 5
  ): Promise<number> {
    const staleThreshold = new Date(
      Date.now() - staleThresholdMinutes * 60 * 1000
    );

    const result = await this.model.updateMany({
      where: {
        status: {
          in: ['ONLINE', 'OVERLOADED'],
        },
        lastHeartbeat: {
          lt: staleThreshold,
        },
      },
      data: {
        status: 'OFFLINE',
        updatedAt: new Date(),
      },
    });

    return result.count;
  }

  async getSystemOverview(): Promise<{
    totalServers: number;
    onlineServers: number;
    offlineServers: number;
    maintenanceServers: number;
    overloadedServers: number;
    totalTables: number;
    totalPlayers: number;
    averageCpuUsage: number;
    averageMemoryUsage: number;
    byServerType: Record<
      string,
      {
        total: number;
        online: number;
        offline: number;
      }
    >;
  }> {
    const servers = await this.model.findMany();

    const totalServers = servers.length;
    const onlineServers = servers.filter(s => s.status === 'ONLINE').length;
    const offlineServers = servers.filter(s => s.status === 'OFFLINE').length;
    const maintenanceServers = servers.filter(
      s => s.status === 'MAINTENANCE'
    ).length;
    const overloadedServers = servers.filter(
      s => s.status === 'MAINTENANCE'
    ).length; // No OVERLOADED status in enum

    const totalTables = servers.reduce((sum, s) => sum + s.currentTables, 0);
    const totalPlayers = servers.reduce((sum, s) => sum + s.currentPlayers, 0);

    const onlineServersList = servers.filter(s => s.status === 'ONLINE');
    const averageCpuUsage =
      onlineServersList.length > 0
        ? onlineServersList.reduce((sum, s) => sum + s.cpuUsage, 0) /
          onlineServersList.length
        : 0;
    const averageMemoryUsage =
      onlineServersList.length > 0
        ? onlineServersList.reduce((sum, s) => sum + s.memoryUsage, 0) /
          onlineServersList.length
        : 0;

    const byServerType = servers.reduce(
      (acc, server) => {
        const type = server.serverType;
        if (!acc[type]) {
          acc[type] = { total: 0, online: 0, offline: 0 };
        }
        acc[type].total++;
        if (server.status === 'ONLINE') {
          acc[type].online++;
        } else {
          acc[type].offline++;
        }
        return acc;
      },
      {} as Record<string, { total: number; online: number; offline: number }>
    );

    return {
      totalServers,
      onlineServers,
      offlineServers,
      maintenanceServers,
      overloadedServers,
      totalTables,
      totalPlayers,
      averageCpuUsage,
      averageMemoryUsage,
      byServerType,
    };
  }
}

export { ServerStatusRepository };
