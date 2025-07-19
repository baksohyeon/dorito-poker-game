
// apps/master-server/src/services/server-manager.service.ts
import { ServerInfo, ServerMetrics } from '@poker-game/shared';
import { logger } from '@poker-game/logger';
import { databaseService } from '@poker-game/database';
import { HashRingService } from './hash-ring.service';

export class ServerManager {
    private servers: Map<string, ServerInfo> = new Map();
    private healthCheckInterval: NodeJS.Timeout | null = null;
    private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
    private readonly SERVER_TIMEOUT = 60000; // 1 minute

    constructor(private hashRingService: HashRingService) { }

    async registerServer(serverInfo: Partial<ServerInfo>): Promise<ServerInfo> {
        const server: ServerInfo = {
            id: serverInfo.id!,
            type: serverInfo.type!,
            status: 'online',
            host: serverInfo.host!,
            port: serverInfo.port!,
            region: serverInfo.region,
            metrics: serverInfo.metrics || this.getDefaultMetrics(),
            createdAt: new Date(),
            lastHeartbeat: new Date()
        };

        // Save to database
        await databaseService.serverStatus.createServerStatus({
            serverId: server.id,
            serverType: server.type === 'master' ? 'MASTER' :
                server.type === 'dedicated' ? 'DEDICATED' : 'AI',
            status: 'ONLINE',
            host: server.host,
            port: server.port,
            maxTables: server.metrics.maxTables,
            maxPlayers: server.metrics.maxPlayers,
            region: server.region
        });

        // Add to hash ring if it's a dedicated server
        if (server.type === 'dedicated') {
            this.hashRingService.addServer(server.id);
        }

        this.servers.set(server.id, server);

        logger.info(`Server registered: ${server.id} (${server.type})`);
        return server;
    }

    async unregisterServer(serverId: string): Promise<void> {
        const server = this.servers.get(serverId);
        if (!server) {
            throw new Error('Server not found');
        }

        // Remove from hash ring
        if (server.type === 'dedicated') {
            const affectedRanges = this.hashRingService.removeServer(serverId);

            // Handle table migration for affected ranges
            if (affectedRanges.length > 0) {
                await this.handleTableMigration(affectedRanges);
            }
        }

        // Update database
        await databaseService.serverStatus.markServerOffline(serverId);

        this.servers.delete(serverId);

        logger.info(`Server unregistered: ${serverId}`);
    }

    async updateServerMetrics(serverId: string, metrics: ServerMetrics): Promise<void> {
        const server = this.servers.get(serverId);
        if (!server) {
            throw new Error('Server not found');
        }

        server.metrics = metrics;
        server.lastHeartbeat = new Date();

        // Update database
        await databaseService.serverStatus.updateServerStatus(serverId, {
            currentTables: metrics.currentTables,
            currentPlayers: metrics.currentPlayers,
            cpuUsage: metrics.cpuUsage,
            memoryUsage: metrics.memoryUsage
        });

        logger.debug(`Server metrics updated: ${serverId}`);
    }

    findBestServer(criteria?: {
        type?: 'dedicated' | 'ai';
        region?: string;
        maxLatency?: number;
    }): ServerInfo | null {
        const servers = Array.from(this.servers.values()).filter(server => {
            if (criteria?.type && server.type !== criteria.type) return false;
            if (criteria?.region && server.region !== criteria.region) return false;
            if (server.status !== 'online') return false;

            // Check if server is not overloaded
            const isOverloaded = server.metrics.currentPlayers >= server.metrics.maxPlayers ||
                server.metrics.currentTables >= server.metrics.maxTables ||
                server.metrics.cpuUsage > 80 ||
                server.metrics.memoryUsage > 80;

            return !isOverloaded;
        });

        if (servers.length === 0) return null;

        // Sort by load (least loaded first)
        servers.sort((a, b) => {
            const loadA = (a.metrics.currentPlayers / a.metrics.maxPlayers) +
                (a.metrics.currentTables / a.metrics.maxTables);
            const loadB = (b.metrics.currentPlayers / b.metrics.maxPlayers) +
                (b.metrics.currentTables / b.metrics.maxTables);

            return loadA - loadB;
        });

        return servers[0];
    }

    getServerForTable(tableId: string): string | null {
        return this.hashRingService.getServerForKey(tableId);
    }

    getAllServers(): ServerInfo[] {
        return Array.from(this.servers.values());
    }

    getServerById(serverId: string): ServerInfo | null {
        return this.servers.get(serverId) || null;
    }

    getServersByType(type: 'master' | 'dedicated' | 'ai'): ServerInfo[] {
        return Array.from(this.servers.values()).filter(server => server.type === type);
    }

    getOnlineServers(): ServerInfo[] {
        return Array.from(this.servers.values()).filter(server => server.status === 'online');
    }

    getServerCount(): number {
        return this.servers.size;
    }

    getServerStats(): {
        total: number;
        online: number;
        offline: number;
        byType: Record<string, number>;
        totalTables: number;
        totalPlayers: number;
    } {
        const servers = Array.from(this.servers.values());
        const onlineServers = servers.filter(s => s.status === 'online');

        const byType = servers.reduce((acc, server) => {
            acc[server.type] = (acc[server.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const totalTables = onlineServers.reduce((sum, s) => sum + s.metrics.currentTables, 0);
        const totalPlayers = onlineServers.reduce((sum, s) => sum + s.metrics.currentPlayers, 0);

        return {
            total: servers.length,
            online: onlineServers.length,
            offline: servers.length - onlineServers.length,
            byType,
            totalTables,
            totalPlayers
        };
    }

    startHealthMonitoring(): void {
        if (this.healthCheckInterval) return;

        this.healthCheckInterval = setInterval(() => {
            this.performHealthCheck();
        }, this.HEALTH_CHECK_INTERVAL);

        logger.info('Server health monitoring started');
    }

    stopHealthMonitoring(): void {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
            logger.info('Server health monitoring stopped');
        }
    }

    private async performHealthCheck(): Promise<void> {
        const now = new Date();
        const staleServers: string[] = [];

        for (const [serverId, server] of this.servers) {
            const timeSinceLastHeartbeat = now.getTime() - server.lastHeartbeat.getTime();

            if (timeSinceLastHeartbeat > this.SERVER_TIMEOUT) {
                staleServers.push(serverId);
            }
        }

        // Mark stale servers as offline
        for (const serverId of staleServers) {
            try {
                await this.markServerOffline(serverId);
            } catch (error) {
                logger.error(`Failed to mark server ${serverId} as offline:`, error);
            }
        }

        if (staleServers.length > 0) {
            logger.warn(`Marked ${staleServers.length} servers as offline due to missed heartbeats`);
        }
    }

    private async markServerOffline(serverId: string): Promise<void> {
        const server = this.servers.get(serverId);
        if (!server) return;

        server.status = 'offline';

        // Remove from hash ring
        if (server.type === 'dedicated') {
            const affectedRanges = this.hashRingService.removeServer(serverId);
            if (affectedRanges.length > 0) {
                await this.handleTableMigration(affectedRanges);
            }
        }

        // Update database
        await databaseService.serverStatus.markServerOffline(serverId);

        logger.warn(`Server marked offline: ${serverId}`);
    }

    private async handleTableMigration(affectedRanges: any[]): Promise<void> {
        logger.info(`Handling table migration for ${affectedRanges.length} affected ranges`);

        // In a real implementation, this would:
        // 1. Identify tables that need to be migrated
        // 2. Find new servers for those tables
        // 3. Coordinate the migration process
        // 4. Update routing information

        // For now, just log the migration need
        for (const range of affectedRanges) {
            logger.info(`Tables in range ${range.start}-${range.end} need migration from ${range.oldServer} to ${range.newServer}`);
        }
    }

    private getDefaultMetrics(): ServerMetrics {
        return {
            currentTables: 0,
            currentPlayers: 0,
            maxTables: 20,
            maxPlayers: 180,
            cpuUsage: 0,
            memoryUsage: 0,
            networkLatency: 0
        };
    }
}
