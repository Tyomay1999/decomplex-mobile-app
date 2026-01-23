export default {
  preset: "jest-expo",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.test.(ts|tsx)",
    "<rootDir>/src/**/*.test.(ts|tsx)",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native" +
    "|@react-native" +
    "|@react-navigation" +
    "|expo(nent)?" +
    "|@expo(nent)?" +
    "|expo-modules-core" +
    "|react-native-safe-area-context" +
    "|react-native-screens" +
    "|react-native-web" +
    ")/",
  ],
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
};
