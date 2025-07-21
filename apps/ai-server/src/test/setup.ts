// Mock environment variables
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.PORT = '3002';
process.env.NODE_ENV = 'test';

// Global test setup
beforeAll(() => {
    // Add any global setup here
});

// Global test teardown
afterAll(() => {
    // Add any global teardown here
});

// Reset mocks between tests
afterEach(() => {
    jest.clearAllMocks();
}); 