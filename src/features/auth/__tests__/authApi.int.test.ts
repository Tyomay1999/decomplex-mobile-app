import { configureStore } from "@reduxjs/toolkit";

import { api } from "../../../api/api";
import { authApi } from "../authApi";
import { authReducer } from "../authSlice";
import type { LoginDataDto, UserDto } from "../authTypes";

const mockPersistSession = jest.fn<Promise<void>, []>(async () => undefined);
const mockClearSession = jest.fn<Promise<void>, []>(async () => undefined);

jest.mock("../../../config/env", () => ({
  env: {
    apiBaseUrl: "http://localhost",
  },
}));

jest.mock("../../../storage/sessionStorage", () => ({
  persistSession: () => mockPersistSession(),
  clearSession: () => mockClearSession(),
}));

type RootState = {
  auth: ReturnType<typeof authReducer>;
} & Record<typeof api.reducerPath, ReturnType<typeof api.reducer>>;

function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      auth: authReducer,
      [api.reducerPath]: api.reducer,
    },
    preloadedState: preloadedState as unknown,
    middleware: (gdm) => gdm().concat(api.middleware),
  });
}

type Json = Record<string, unknown>;

function jsonResponse(status: number, body: Json): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function pickUrl(call: unknown[]): string {
  const req = call[0];

  if (typeof req === "string") return req;

  if (typeof req === "object" && req !== null && "url" in req) {
    const url = (req as { url: unknown }).url;
    if (typeof url === "string") return url;
  }

  return String(req);
}

function pickMethod(call: unknown[]): string {
  const req = call[0];

  if (typeof req === "object" && req !== null && "method" in req) {
    const m = (req as { method: unknown }).method;
    if (typeof m === "string" && m.length > 0) return m;
  }

  const init = call[1];

  if (typeof init === "object" && init !== null && "method" in init) {
    const m = (init as { method: unknown }).method;
    if (typeof m === "string" && m.length > 0) return m;
  }

  return "GET";
}

describe("authApi (RTK Query integration)", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    mockPersistSession.mockClear();
    mockClearSession.mockClear();
  });

  it("login sets credentials, user, language and persists session", async () => {
    const user: UserDto = { id: "u1", email: "a@b.com", language: "ru" };

    const data: LoginDataDto = {
      accessToken: "ACCESS",
      refreshToken: "REFRESH",
      fingerprintHash: "FP",
      user,
    };

    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValueOnce(
      jsonResponse(200, {
        success: true,
        data,
      }),
    );

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

    const res = await store
      .dispatch(authApi.endpoints.login.initiate({ email: "a@b.com", password: "x" }))
      .unwrap();
    expect(res.accessToken).toBe("ACCESS");

    const state = store.getState();
    expect(state.auth.accessToken).toBe("ACCESS");
    expect(state.auth.language).toBe("ru");
    expect(state.auth.user?.id).toBe("u1");

    expect(mockPersistSession).toHaveBeenCalledTimes(1);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const call = fetchSpy.mock.calls[0] as unknown[];
    expect(pickUrl(call)).toContain("/auth/login");
    expect(pickMethod(call)).toBe("POST");
  });

  it("login on failure clears auth and clears session", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValueOnce(
      jsonResponse(500, {
        success: false,
        data: {},
      }),
    );

    const store = makeStore({
      auth: {
        accessToken: "A",
        refreshToken: "R",
        fingerprintHash: "F",
        user: { id: "u1", email: "a@b.com", language: "en" },
        language: "en",
        bootstrapped: true,
        forcedLogout: false,
      },
    });

    await expect(
      store
        .dispatch(authApi.endpoints.login.initiate({ email: "a@b.com", password: "x" }))
        .unwrap(),
    ).rejects.toBeTruthy();

    const state = store.getState();
    expect(state.auth.accessToken).toBeNull();
    expect(state.auth.user).toBeNull();

    expect(mockClearSession).toHaveBeenCalledTimes(1);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const call = fetchSpy.mock.calls[0] as unknown[];
    expect(pickUrl(call)).toContain("/auth/login");
    expect(pickMethod(call)).toBe("POST");
  });

  it("logout clears auth, resets api state, clears session and calls PATCH /auth/logout", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValueOnce(
      jsonResponse(200, {
        success: true,
        data: {},
      }),
    );

    const store = makeStore({
      auth: {
        accessToken: "A",
        refreshToken: "R",
        fingerprintHash: "F",
        user: { id: "u1", email: "a@b.com", language: "en" },
        language: "en",
        bootstrapped: true,
        forcedLogout: false,
      },
    });

    await store.dispatch(authApi.endpoints.logout.initiate({ refreshToken: "R" })).unwrap();

    const state = store.getState();
    expect(state.auth.accessToken).toBeNull();
    expect(state.auth.user).toBeNull();

    expect(mockClearSession).toHaveBeenCalledTimes(1);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const call = fetchSpy.mock.calls[0] as unknown[];
    expect(pickUrl(call)).toContain("/auth/logout");
    expect(pickMethod(call)).toBe("PATCH");
  });
});
