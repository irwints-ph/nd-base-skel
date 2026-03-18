// jest.config.live.cjs
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/tests/integration/api/**/*-live.test.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup-live.ts'],
  testTimeout: 30000, // Longer timeout for live server tests
  collectCoverageFrom: [
    // Coverage not typically collected for live server tests
    // as they test integration, not implementation
  ],
  // Disable coverage for live tests by default
  collectCoverage: false,
}