module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  testTimeout: 75000,
  // Run tests sequentially — they share a live DB
  maxWorkers: 1,
};
