module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.njk?$': 'jest-text-transformer',
  },
  moduleNameMapper: {
    '^~/(.*)': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testRegex: '(/(tests|src)/.*.(test|spec))\\.(ts|js)x?$',
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.test.{ts,tsx,js,jsx}', '!src/**/*.d.ts'],
};
