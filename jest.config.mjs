// jest.config.mjs
import { pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from "./tsconfig.json" assert { type: "json" };

/** @type {import('jest').Config} */
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
      useESM: true,
      tsconfig: {
        module: "ESNext",
        target: "ES2022",
        moduleResolution: "NodeNext",
        rootDir: "./"
      }
    }
  },
  transform: {}, // keep empty for ts-jest preset
  testMatch: ["<rootDir>/tests/**/*.test.ts", "<rootDir>/src/**/*.test.ts"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
    '^@Api/(.*)$': '<rootDir>/src/01-Api/$1',
    '^@Contracts/(.*)$': '<rootDir>/src/01-Contracts/$1',
    '^@Application/(.*)$': '<rootDir>/src/02-Application/$1',
    '^@Infrastructure/(.*)$': '<rootDir>/src/04-Infrastructure/$1',
    '^@Domain/(.*)$': '<rootDir>/src/03-Domain/$1',
    '^@Tests/(.*)$': '<rootDir>/tests/$1',
    prefix: "<rootDir>/"
  }),
  moduleFileExtensions: ["ts", "js", "json", "node"]
};