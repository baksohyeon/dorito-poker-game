
// apps/master-server/src/__tests__/auth.service.test.ts
import { AuthService } from '../services/auth.service';
import { databaseService } from '@poker-game/database';

describe('AuthService', () => {
    let authService: AuthService;

    beforeAll(async () => {
        await databaseService.connect();
        authService = new AuthService();
    });

    afterAll(async () => {
        await databaseService.disconnect();
    });

    beforeEach(async () => {
        // Clean up test data
        await databaseService.users.deleteAllUsers();
        await databaseService.sessions.deleteAllSessions();
    });

    describe('login', () => {
        it('should return a valid token for valid credentials', async () => {
            const result = await authService.login({
                email: 'test@example.com',
                password: 'password123'
                        });

            expect(result.success).toBe(true);
            expect(result.token).toBeDefined();
            expect(result.refreshToken).toBeDefined();
        });

        it('should return an error for invalid credentials', async () => {
            const result = await authService.login({
                email: 'test@example.com',
                password: 'wrongpassword'
            });

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });
});