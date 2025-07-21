
// Mock environment variables
process.env.PORT = '3001';
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