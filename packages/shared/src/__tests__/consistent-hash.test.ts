// packages/shared/src/__tests__/consistent-hash.test.ts
import { ConsistentHashRing } from '../utils/consistent-hash';

describe('ConsistentHashRing', () => {
  let hashRing: ConsistentHashRing;

  beforeEach(() => {
    hashRing = new ConsistentHashRing(150);
  });

  describe('addServer', () => {
    it('should add server to ring', () => {
      hashRing.addServer('server1');
      expect(hashRing.getServers()).toContain('server1');
    });

    it('should not add duplicate servers', () => {
      hashRing.addServer('server1');
      hashRing.addServer('server1');
      expect(hashRing.getServers().length).toBe(1);
    });
  });

  describe('removeServer', () => {
    it('should remove server from ring', () => {
      hashRing.addServer('server1');
      hashRing.removeServer('server1');
      expect(hashRing.getServers()).not.toContain('server1');
    });

    it('should return affected ranges', () => {
      hashRing.addServer('server1');
      hashRing.addServer('server2');
      const affectedRanges = hashRing.removeServer('server1');
      expect(affectedRanges.length).toBeGreaterThan(0);
    });
  });

  describe('getServer', () => {
    beforeEach(() => {
      hashRing.addServer('server1');
      hashRing.addServer('server2');
      hashRing.addServer('server3');
    });

    it('should return server for key', () => {
      const server = hashRing.getServer('test-key');
      expect(server).toBeTruthy();
      expect(['server1', 'server2', 'server3']).toContain(server);
    });

    it('should return same server for same key', () => {
      const server1 = hashRing.getServer('test-key');
      const server2 = hashRing.getServer('test-key');
      expect(server1).toBe(server2);
    });

    it('should return null for empty ring', () => {
      const emptyRing = new ConsistentHashRing();
      expect(emptyRing.getServer('test-key')).toBeNull();
    });
  });

  describe('testDistribution', () => {
    it('should distribute keys relatively evenly', () => {
      hashRing.addServer('server1');
      hashRing.addServer('server2');
      hashRing.addServer('server3');

      const distribution = hashRing.testDistribution(3000);

      // Each server should get roughly 1000 keys (±200 tolerance)
      for (const [server, count] of distribution) {
        expect(count).toBeGreaterThan(800);
        expect(count).toBeLessThan(1200);
      }
    });
  });

  describe('getStatus', () => {
    it('should return correct status', () => {
      hashRing.addServer('server1');
      hashRing.addServer('server2');

      const status = hashRing.getStatus();
      expect(status.totalServers).toBe(2);
      expect(status.totalVirtualNodes).toBe(300); // 2 servers * 150 virtual nodes
      expect(status.servers).toEqual(['server1', 'server2']);
    });
  });
});
