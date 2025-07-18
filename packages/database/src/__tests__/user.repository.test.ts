// packages/database/src/__tests__/user.repository.test.ts
import { UserRepository } from '../repositories/user.repository';
import { DatabaseClient } from '../client';

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeAll(async () => {
    await DatabaseClient.connect();
    userRepository = new UserRepository();
  });

  afterAll(async () => {
    await DatabaseClient.disconnect();
  });

  beforeEach(async () => {
    // Clean up test data
    await (userRepository as any).model.deleteMany({
      where: {
        email: {
          contains: 'test',
        },
      },
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
      };

      const user = await userRepository.createUser(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.username).toBe(userData.username);
      expect(user.chips).toBe(1000); // Default chips
      expect(user.level).toBe(1); // Default level
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser1',
        password: 'hashedpassword',
      };

      await userRepository.createUser(userData);

      const duplicateUserData = {
        email: 'test@example.com',
        username: 'testuser2',
        password: 'hashedpassword',
      };

      await expect(
        userRepository.createUser(duplicateUserData)
      ).rejects.toThrow();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
      };

      const createdUser = await userRepository.createUser(userData);
      const foundUser = await userRepository.findByEmail('test@example.com');

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
    });

    it('should return null for non-existent email', async () => {
      const foundUser = await userRepository.findByEmail(
        'nonexistent@example.com'
      );
      expect(foundUser).toBeNull();
    });
  });
});
