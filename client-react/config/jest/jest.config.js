module.exports = {
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/config/jest/setupTests.ts'],
  transform: {
    '\\.(js|jsx|ts|tsx)$': ['esbuild-jest']
  },
  testRegex: '/*.test.(ts|tsx|js)$',
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/config/jest/assetsTransformer.ts',
    '\\.svg': '<rootDir>/config/jest/svgrMock.ts'
  }
};
