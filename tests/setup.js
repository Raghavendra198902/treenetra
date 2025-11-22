// Test setup file
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

// Setup test database connection
beforeAll(async () => {
  // Connect to test database
});

afterAll(async () => {
  // Disconnect from test database
});

afterEach(async () => {
  // Clear test data between tests
});
