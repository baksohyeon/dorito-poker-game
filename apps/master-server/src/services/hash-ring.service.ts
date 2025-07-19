
// apps/master-server/src/services/hash-ring.service.ts
import { ConsistentHashRing, AffectedRange } from '@poker-game/shared/utils';
import { logger } from '@poker-game/logger';

export class HashRingService {
    private hashRing: ConsistentHashRing;

    constructor() {
        this.hashRing = new ConsistentHashRing(150); // 150 virtual nodes per server
    }

    addServer(serverId: string): void {
        this.hashRing.addServer(serverId);
        logger.info(`Server ${serverId} added to hash ring`);
        this.logRingStatus();
    }

    removeServer(serverId: string): AffectedRange[] {
        const affectedRanges = this.hashRing.removeServer(serverId);
        logger.info(`Server ${serverId} removed from hash ring`);
        this.logRingStatus();
        return affectedRanges;
    }

    getServerForKey(key: string): string | null {
        return this.hashRing.getServer(key);
    }

    getServers(): string[] {
        return this.hashRing.getServers();
    }

    getStatus() {
        return this.hashRing.getStatus();
    }

    testDistribution(numKeys: number = 10000): Map<string, number> {
        return this.hashRing.testDistribution(numKeys);
    }

    private logRingStatus(): void {
        const status = this.hashRing.getStatus();
        logger.debug('Hash Ring Status:', {
            totalServers: status.totalServers,
            totalVirtualNodes: status.totalVirtualNodes,
            serverLoad: status.serverLoad
        });
    }
}
