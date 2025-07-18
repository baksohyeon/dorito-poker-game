import crypto from 'crypto';

/**
 * Consistent Hash Ring implementation for distributed server load balancing
 */
export class ConsistentHashRing {
    private ring: Map<number, string> = new Map();
    private servers: Set<string> = new Set();
    private sortedKeys: number[] = [];
    private readonly virtualNodes: number;

    constructor(virtualNodes: number = 150) {
        this.virtualNodes = virtualNodes;
    }

    /**
     * Hash a string to a 32-bit unsigned integer
     */
    private hash(key: string): number {
        const hash = crypto.createHash('md5').update(key).digest('hex');
        // Take first 8 characters and convert to integer
        return parseInt(hash.substring(0, 8), 16);
    }

    /**
     * Add a server to the hash ring
     */
    addServer(serverId: string): void {
        if (this.servers.has(serverId)) {
            console.warn(`Server ${serverId} already exists in hash ring`);
            return;
        }

        this.servers.add(serverId);

        // Add virtual nodes
        for (let i = 0; i < this.virtualNodes; i++) {
            const virtualKey = this.hash(`${serverId}-${i}`);
            this.ring.set(virtualKey, serverId);
        }

        this.updateSortedKeys();
        console.log(`Added server ${serverId} with ${this.virtualNodes} virtual nodes`);
    }

    /**
     * Remove a server from the hash ring
     */
    removeServer(serverId: string): AffectedRange[] {
        if (!this.servers.has(serverId)) {
            console.warn(`Server ${serverId} does not exist in hash ring`);
            return [];
        }

        const affectedRanges = this.getAffectedRanges(serverId);

        this.servers.delete(serverId);

        // Remove all virtual nodes for this server
        for (let i = 0; i < this.virtualNodes; i++) {
            const virtualKey = this.hash(`${serverId}-${i}`);
            this.ring.delete(virtualKey);
        }

        this.updateSortedKeys();
        console.log(`Removed server ${serverId} from hash ring`);

        return affectedRanges;
    }

    /**
     * Get the server responsible for a given key
     */
    getServer(key: string): string | null {
        if (this.sortedKeys.length === 0) {
            return null;
        }

        const hash = this.hash(key);

        // Binary search for the first key >= hash
        let left = 0;
        let right = this.sortedKeys.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);

            if (this.sortedKeys[mid] === hash) {
                return this.ring.get(this.sortedKeys[mid]) || null;
            } else if (this.sortedKeys[mid] < hash) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        // If no key >= hash, wrap around to first key
        const targetIndex = left < this.sortedKeys.length ? left : 0;
        const targetKey = this.sortedKeys[targetIndex];

        return this.ring.get(targetKey) || null;
    }

    /**
     * Update the sorted keys array
     */
    private updateSortedKeys(): void {
        this.sortedKeys = Array.from(this.ring.keys()).sort((a, b) => a - b);
    }

    /**
     * Get affected ranges when a server is removed
     */
    private getAffectedRanges(removedServerId: string): AffectedRange[] {
        const affectedRanges: AffectedRange[] = [];

        for (let i = 0; i < this.virtualNodes; i++) {
            const virtualKey = this.hash(`${removedServerId}-${i}`);
            const newServer = this.getNextServerAfterRemoval(virtualKey, removedServerId);

            if (newServer) {
                affectedRanges.push({
                    start: this.getPreviousKey(virtualKey),
                    end: virtualKey,
                    oldServer: removedServerId,
                    newServer
                });
            }
        }

        return affectedRanges;
    }

    /**
     * Get the next server in the ring after removing a specific server
     */
    private getNextServerAfterRemoval(key: number, removedServerId: string): string | null {
        // Find next key that doesn't belong to removed server
        for (const ringKey of this.sortedKeys) {
            if (ringKey > key && this.ring.get(ringKey) !== removedServerId) {
                return this.ring.get(ringKey) || null;
            }
        }

        // Wrap around
        for (const ringKey of this.sortedKeys) {
            if (this.ring.get(ringKey) !== removedServerId) {
                return this.ring.get(ringKey) || null;
            }
        }

        return null;
    }

    /**
     * Get the previous key in the ring
     */
    private getPreviousKey(key: number): number {
        const index = this.sortedKeys.findIndex(k => k >= key);
        if (index === 0) {
            return this.sortedKeys[this.sortedKeys.length - 1];
        }
        return this.sortedKeys[index - 1];
    }

    /**
     * Get ring status and statistics
     */
    getStatus(): HashRingStatus {
        const serverLoad = new Map<string, number>();

        // Initialize counters
        for (const serverId of this.servers) {
            serverLoad.set(serverId, 0);
        }

        // Count virtual nodes per server
        for (const serverId of this.ring.values()) {
            serverLoad.set(serverId, (serverLoad.get(serverId) || 0) + 1);
        }

        return {
            totalServers: this.servers.size,
            totalVirtualNodes: this.ring.size,
            virtualNodesPerServer: this.virtualNodes,
            servers: Array.from(this.servers),
            serverLoad: Object.fromEntries(serverLoad),
            averageLoad: this.ring.size / this.servers.size
        };
    }

    /**
     * Test key distribution across servers
     */
    testDistribution(numKeys: number = 10000): Map<string, number> {
        const distribution = new Map<string, number>();

        // Initialize counters
        for (const serverId of this.servers) {
            distribution.set(serverId, 0);
        }

        // Test random keys
        for (let i = 0; i < numKeys; i++) {
            const testKey = `test-key-${i}`;
            const server = this.getServer(testKey);
            if (server) {
                distribution.set(server, (distribution.get(server) || 0) + 1);
            }
        }

        return distribution;
    }

    /**
     * Get all servers in the ring
     */
    getServers(): string[] {
        return Array.from(this.servers);
    }

    /**
     * Check if ring is empty
     */
    isEmpty(): boolean {
        return this.servers.size === 0;
    }

    /**
     * Clear all servers from the ring
     */
    clear(): void {
        this.ring.clear();
        this.servers.clear();
        this.sortedKeys = [];
    }
}

export interface AffectedRange {
    start: number;
    end: number;
    oldServer: string;
    newServer: string;
}

export interface HashRingStatus {
    totalServers: number;
    totalVirtualNodes: number;
    virtualNodesPerServer: number;
    servers: string[];
    serverLoad: Record<string, number>;
    averageLoad: number;
}
