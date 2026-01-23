import "whatwg-fetch";
import "react-native-gesture-handler/jestSetup";
import "@testing-library/jest-native/extend-expect";
import type { ReactNode } from "react";

jest.mock("../config/env", () => ({
  env: {
    apiBaseUrl: "http://localhost",
  },
}));

jest.mock("@react-native-async-storage/async-storage");
jest.mock("expo-secure-store");

jest.mock("react-native-safe-area-context", () => {
  const actual: unknown = jest.requireActual("react-native-safe-area-context");
  return {
    ...(actual as Record<string, unknown>),
    SafeAreaProvider: ({ children }: { children: ReactNode }) => children,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

const originalError = console.error;

console.error = (...args: unknown[]) => {
  const first = args[0];
  if (typeof first === "string" && first.includes("useNativeDriver")) return;
  originalError(...args);
};

jest.mock("react-native/Libraries/TurboModule/TurboModuleRegistry", () => {
  const actual = jest.requireActual("react-native/Libraries/TurboModule/TurboModuleRegistry");
  return {
    ...actual,
    getEnforcing: (name: string) => {
      if (name === "DevMenu") return {};
      return actual.getEnforcing(name);
    },
  };
});

import { Keyboard } from "react-native";

jest.spyOn(Keyboard, "dismiss").mockImplementation(() => undefined);
