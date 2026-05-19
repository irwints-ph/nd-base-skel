/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  // transform: {
  //   '^.+\\.ts$': ['ts-jest', { useESM: true }],
  // },  
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'ESNext',
        target: 'ES2022',
        moduleResolution: 'NodeNext',
        rootDir: undefined
      }
    }]
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',        // Central test directory
    '<rootDir>/src/**/__tests__/**/*.ts',  // Legacy __tests__ folders
    '<rootDir>/src/**/*.test.ts',          // .test.ts files in src
    '<rootDir>/src/**/*.spec.ts'           // .spec.ts files in src
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ],
  // Path mapping for Jest (mirrors tsconfig.json paths)
  // Allows imports like "@/domain/models/constants/ContactTypes" in tests
  moduleNameMapper: {
    "^@Api/(.*)$": "<rootDir>/src/01-Api/$1",
    "^@Contracts/(.*)$": "<rootDir>/src/01-Contracts/$1",
    "^@Application/(.*)$": "<rootDir>/src/02-Application/$1",
    "^@Infrastructure/(.*)$": "<rootDir>/src/04-Infrastructure/$1",
    "^@Domain/(.*)$": "<rootDir>/src/03-Domain/$1",
    "^@Tests/(.*)$": "<rootDir>/tests/$1",
    '^@/(.*)': '<rootDir>/src/$1'
  }
};