import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['./__tests__'],
  moduleNameMapper: {
    '^../../packages/(.*)$': '<rootDir>/../packages/$1',
    '^../packages/(.*)$': '<rootDir>/../packages/$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: { module: 'commonjs', strict: false } }],
  },
};

export default config;
