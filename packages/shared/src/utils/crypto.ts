// packages/shared/src/utils/crypto.ts
import * as crypto from 'crypto';

/**
 * Cryptographic utilities for secure operations
 */
export class CryptoHelper {
  /**
   * Generate a cryptographically secure random string
   */
  static generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a secure session ID
   */
  static generateSessionId(): string {
    return this.generateSecureRandom(16);
  }

  /**
   * Generate a secure reconnect token
   */
  static generateReconnectToken(): string {
    return this.generateSecureRandom(24);
  }

  /**
   * Hash a password with salt
   */
  static async hashPassword(
    password: string,
    saltRounds: number = 12
  ): Promise<string> {
    const bcrypt = await import('bcryptjs');
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify a password against its hash
   */
  static async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    const bcrypt = await import('bcryptjs');
    return bcrypt.compare(password, hash);
  }

  /**
   * Create HMAC signature
   */
  static createHMAC(data: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  static verifyHMAC(data: string, signature: string, secret: string): boolean {
    const expectedSignature = this.createHMAC(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  static encrypt(
    data: string,
    key: string
  ): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', key);
    cipher.setAAD(Buffer.from('poker-game', 'utf8'));

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  static decrypt(
    encryptedData: { encrypted: string; iv: string; tag: string },
    key: string
  ): string {
    const decipher = crypto.createDecipher('aes-256-gcm', key);
    decipher.setAAD(Buffer.from('poker-game', 'utf8'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generate a secure card shuffle seed
   */
  static generateShuffleSeed(): string {
    const timestamp = Date.now().toString();
    const random = this.generateSecureRandom(16);
    return crypto
      .createHash('sha256')
      .update(timestamp + random)
      .digest('hex');
  }

  /**
   * Shuffle array using cryptographically secure random
   */
  static secureArrayShuffle<T>(array: T[], seed?: string): T[] {
    const result = [...array];
    let currentIndex = result.length;

    // Use seed if provided, otherwise use crypto.randomBytes
    if (seed) {
      // Deterministic shuffle based on seed
      const hash = crypto.createHash('sha256').update(seed).digest();
      let hashIndex = 0;

      while (currentIndex !== 0) {
        // Get next random value from hash
        if (hashIndex >= hash.length - 4) {
          // Re-hash if we've used all bytes
          const newHash = crypto.createHash('sha256').update(hash).digest();
          hash.set(newHash);
          hashIndex = 0;
        }

        const randomValue = hash.readUInt32BE(hashIndex);
        hashIndex += 4;

        const randomIndex = randomValue % currentIndex;
        currentIndex--;

        [result[currentIndex], result[randomIndex]] = [
          result[randomIndex],
          result[currentIndex],
        ];
      }
    } else {
      // True random shuffle
      while (currentIndex !== 0) {
        const randomBytes = crypto.randomBytes(4);
        const randomValue = randomBytes.readUInt32BE(0);
        const randomIndex = randomValue % currentIndex;
        currentIndex--;

        [result[currentIndex], result[randomIndex]] = [
          result[randomIndex],
          result[currentIndex],
        ];
      }
    }

    return result;
  }
}
