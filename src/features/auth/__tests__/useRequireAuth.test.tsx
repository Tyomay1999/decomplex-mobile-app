import React from "react";
import { renderHook } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import { useRequireAuth } from "../useRequireAuth";
import { authReducer } from "../authSlice";
import type { RootState } from "../../../store/store";

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: (...args: unknown[]) => mockNavigate(...args),
  }),
}));

type Preloaded = Partial<RootState>;

function makeStore(preloaded?: Preloaded) {
  return configureStore({
    reducer: {
      auth: authReducer,
      notifications: (s = { queue: [] as unknown[] }) => s,
      api: (s = {}) => s,
    },
    preloadedState: preloaded as RootState,
  });
}

function wrapper(store: ReturnType<typeof makeStore>) {
  return function Wrap({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe("useRequireAuth", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("returns false when not bootstrapped", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        refreshToken: null,
        fingerprintHash: null,
        user: null,
        language: "en",
        bootstrapped: false,
        forcedLogout: false,
      },
    });

    const { result } = renderHook(() => useRequireAuth(), { wrapper: wrapper(store) });
    const ok = result.current.requireAuth();

    expect(ok).toBe(false);
    expect(mockNavigate).toHaveBeenCalledTimes(0);
  });

  it("navigates to Login when guest and returns false", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        refreshToken: null,
        fingerprintHash: null,
        user: null,
        language: "en",
        bootstrapped: true,
        forcedLogout: false,
      },
    });

    const { result } = renderHook(() => useRequireAuth(), { wrapper: wrapper(store) });
    const ok = result.current.requireAuth();

    expect(ok).toBe(false);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("Login", { redirect: "MainTabs" });
  });

  it("navigates to Login with custom redirect when provided", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        refreshToken: null,
        fingerprintHash: null,
        user: null,
        language: "en",
        bootstrapped: true,
        forcedLogout: false,
      },
    });

    const { result } = renderHook(() => useRequireAuth(), { wrapper: wrapper(store) });

    const ok = result.current.requireAuth({ redirect: { redirect: "MyApplications" } });

    expect(ok).toBe(false);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("Login", { redirect: "MyApplications" });
  });

  it("returns true when authed", () => {
    const store = makeStore({
      auth: {
        accessToken: "A",
        refreshToken: "R",
        fingerprintHash: "F",
        user: { id: "1", email: "a@b.com" },
        language: "en",
        bootstrapped: true,
        forcedLogout: false,
      },
    });

    const { result } = renderHook(() => useRequireAuth(), { wrapper: wrapper(store) });
    const ok = result.current.requireAuth();

    expect(ok).toBe(true);
    expect(mockNavigate).toHaveBeenCalledTimes(0);
  });
});
