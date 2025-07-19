// packages/shared/src/__tests__/snowflake.test.ts
import { SnowflakeGenerator } from '../utils/snowflake';

describe('SnowflakeGenerator', () => {
  let generator: SnowflakeGenerator;

  beforeEach(() => {
    generator = new SnowflakeGenerator(1);
  });

  describe('constructor', () => {
    it('should create generator with valid machine ID', () => {
      expect(() => new SnowflakeGenerator(0)).not.toThrow();
      expect(() => new SnowflakeGenerator(1023)).not.toThrow();
    });

    it('should throw error for invalid machine ID', () => {
      expect(() => new SnowflakeGenerator(-1)).toThrow();
      expect(() => new SnowflakeGenerator(1024)).toThrow();
    });
  });

  describe('generate', () => {
    it('should generate valid ID', () => {
      const id = generator.generate();
      expect(typeof id).toBe('string');
      expect(/^\d+$/.test(id)).toBe(true);
    });

    it('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 1000; i++) {
        const id = generator.generate();
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }
    });

    it('should generate IDs in chronological order', () => {
      const id1 = generator.generate();
      const id2 = generator.generate();
      expect(BigInt(id2) > BigInt(id1)).toBe(true);
    });
  });

  describe('parse', () => {
    it('should correctly parse generated ID', () => {
      const id = generator.generate();
      const parsed = SnowflakeGenerator.parse(id);

      expect(parsed.machineId).toBe(1);
      expect(parsed.timestamp).toBeInstanceOf(Date);
      expect(parsed.sequence).toBeGreaterThanOrEqual(0);
    });

    it('should extract correct machine ID', () => {
      const generator1 = new SnowflakeGenerator(1);
      const generator2 = new SnowflakeGenerator(100);

      const id1 = generator1.generate();
      const id2 = generator2.generate();

      expect(SnowflakeGenerator.getMachineId(id1)).toBe(1);
      expect(SnowflakeGenerator.getMachineId(id2)).toBe(100);
    });
  });

  describe('isFromMachine', () => {
    it('should correctly identify machine ID', () => {
      const id = generator.generate();
      expect(SnowflakeGenerator.isFromMachine(id, 1)).toBe(true);
      expect(SnowflakeGenerator.isFromMachine(id, 2)).toBe(false);
    });
  });
});
