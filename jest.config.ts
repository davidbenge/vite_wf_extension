import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/test/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/test/__mocks__/fileMock.js'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        moduleResolution: 'node',
        module: 'commonjs'
      }
    }]
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**'
  ],
  testMatch: [
    '<rootDir>/test/**/*.{spec,test}.{ts,tsx}',
    '<rootDir>/test/**/__tests__/**/*.{ts,tsx}'
  ],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};

export default config; 