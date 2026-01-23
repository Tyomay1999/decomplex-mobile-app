import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { act, fireEvent, render } from "@testing-library/react-native";

import { NotificationHost } from "../NotificationHost";
import { notificationsActions, notificationsReducer } from "../notificationSlice";
import { ThemeContext } from "../../../app/ThemeProvider";

import type { Theme } from "../../../app/theme";

type ThemeContextValue = React.ContextType<typeof ThemeContext>;

const rn = jest.requireActual("react-native") as {
  Animated: {
    timing: (v: unknown, cfg: unknown) => { start: (cb?: () => void) => void };
    parallel: (a: Array<{ start: (cb?: () => void) => void }>) => {
      start: (cb?: () => void) => void;
    };
    Value: new (v: number) => { setValue: (n: number) => void };
  };
};

jest.spyOn(rn.Animated, "timing").mockImplementation(() => ({
  start: () => undefined,
}));

jest.spyOn(rn.Animated, "parallel").mockImplementation(() => ({
  start: () => undefined,
}));

class TestAnimatedValue {
  private v: number;

  constructor(initial: number) {
    this.v = initial;
  }

  setValue(next: number) {
    this.v = next;
  }
}

jest.spyOn(rn.Animated, "Value").mockImplementation((initial: number) => {
  return new TestAnimatedValue(initial) as unknown as { setValue: (n: number) => void };
});

function makeStore() {
  return configureStore({
    reducer: {
      notifications: notificationsReducer,
    },
  });
}

function makeTheme(name: "light" | "dark"): Theme {
  return {
    name,
    background: "#000000",
    surface: "#111111",
    textPrimary: "#ffffff",
    textSecondary: "#aaaaaa",
    textTertiary: "#888888",
    border: "#222222",
    divider: "#222222",
    primary: "#3B82F6",
  };
}

function makeThemeValue(themeName: "light" | "dark"): ThemeContextValue {
  return {
    themeName,
    theme: makeTheme(themeName),
    toggleTheme: () => undefined,
    setTheme: () => undefined,
  };
}

function renderHost(opts: { withTheme: boolean }) {
  const store = makeStore();

  const content = (
    <Provider store={store}>
      <ThemeContext.Provider value={opts.withTheme ? makeThemeValue("light") : null}>
        <NotificationHost />
      </ThemeContext.Provider>
    </Provider>
  );

  return { store, ...render(content) };
}

function flushState(): void {
  act(() => undefined);
}

describe("NotificationHost integration", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-01-20T00:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("returns null when theme is missing", () => {
    const { queryByText, store } = renderHost({ withTheme: false });

    act(() => {
      store.dispatch(notificationsActions.push({ kind: "info", message: "hello", durationMs: 10 }));
    });

    flushState();

    expect(queryByText("hello")).toBeNull();
  });

  test("returns null when queue is empty", () => {
    const { queryByText } = renderHost({ withTheme: true });
    expect(queryByText("hello")).toBeNull();
  });

  test("renders top item and auto-removes after duration", () => {
    const { store, getByText, queryByText } = renderHost({ withTheme: true });

    act(() => {
      store.dispatch(notificationsActions.push({ kind: "info", message: "hello", durationMs: 50 }));
    });

    flushState();

    expect(getByText("hello")).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(60);
    });

    flushState();

    expect(queryByText("hello")).toBeNull();
  });

  test("press removes notification", () => {
    const { store, getByText, queryByText } = renderHost({ withTheme: true });

    act(() => {
      store.dispatch(
        notificationsActions.push({ kind: "info", message: "hello", durationMs: 5000 }),
      );
    });

    flushState();

    expect(getByText("hello")).toBeTruthy();

    act(() => {
      fireEvent.press(getByText("✕"));
    });

    flushState();

    expect(queryByText("hello")).toBeNull();
  });

  test("shows first item, then shows second after first is removed by timer", () => {
    const { store, getByText, queryByText } = renderHost({ withTheme: true });

    act(() => {
      store.dispatch(notificationsActions.push({ kind: "info", message: "m1", durationMs: 30 }));
      store.dispatch(notificationsActions.push({ kind: "info", message: "m2", durationMs: 5000 }));
    });

    flushState();

    expect(getByText("m1")).toBeTruthy();
    expect(queryByText("m2")).toBeNull();

    act(() => {
      jest.advanceTimersByTime(35);
    });

    flushState();

    expect(queryByText("m1")).toBeNull();
    expect(getByText("m2")).toBeTruthy();
  });
});
