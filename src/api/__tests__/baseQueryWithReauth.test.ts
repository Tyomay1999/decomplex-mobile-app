import { configureStore } from "@reduxjs/toolkit";
import type { BaseQueryApi } from "@reduxjs/toolkit/query";

import { api } from "../api";
import { baseQueryWithReauth } from "../baseQueryWithReauth";
import { authReducer } from "../../features/auth/authSlice";

import { clearSession, persistSession } from "../../storage/sessionStorage";
import { resetToLogin } from "../../navigation/navigationRef";

jest.mock("../../storage/sessionStorage", () => ({
  clearSession: jest.fn(async () => undefined),
  persistSession: jest.fn(async () => undefined),
}));

jest.mock("../../navigation/navigationRef", () => ({
  resetToLogin: jest.fn(() => undefined),
}));

type Json = Record<string, unknown>;

function jsonResponse(status: number, body: Json): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

type RootState = {
  auth: ReturnType<typeof authReducer>;
} & Record<typeof api.reducerPath, ReturnType<typeof api.reducer>>;

function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      auth: authReducer,
      [api.reducerPath]: api.reducer,
    },
    preloadedState: preloadedState as RootState | undefined,
    middleware: (gdm) => gdm().concat(api.middleware),
  });
}

function makeBaseQueryApi(store: ReturnType<typeof makeStore>): BaseQueryApi {
  const ac = new AbortController();

  return {
    dispatch: store.dispatch,
    getState: store.getState,
    extra: undefined,
    endpoint: "test",
    type: "query",
    forced: false,
    signal: ac.signal,
    abort: () => ac.abort(),
  };
}

function pickHeadersFromFetchCall(call: unknown[]): Headers {
  const req = call[0];
  const init = call[1];

  const reqHeaders =
    typeof req === "object" && req !== null && "headers" in req
      ? (req as { headers: unknown }).headers
      : undefined;

  const initHeaders =
    typeof init === "object" && init !== null && "headers" in init
      ? (init as { headers: unknown }).headers
      : undefined;

  const headers = (reqHeaders ?? initHeaders) as unknown;

  if (typeof headers !== "object" || headers === null) {
    throw new Error("Headers not found");
  }

  if (!("get" in headers) || typeof (headers as { get: unknown }).get !== "function") {
    throw new Error("Headers.get not found");
  }

  return headers as Headers;
}

function pickUrlFromFetchCall(call: unknown[]): string {
  const req = call[0];

  if (typeof req === "string") return req;

  if (typeof req === "object" && req !== null && "url" in req) {
    const url = (req as { url: unknown }).url;
    if (typeof url === "string") return url;
  }

  return String(req);
}

describe("baseQueryWithReauth", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("sets Authorization and X-Client-Fingerprint headers", async () => {
    const fetchSpy = jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    const store = makeStore({
      auth: {
        accessToken: "ACCESS",
        refreshToken: "REFRESH",
        fingerprintHash: "FP",
        language: "en",
        bootstrapped: true,
        forcedLogout: false,
        user: null,
      },
    });

    const res = await baseQueryWithReauth(
      { url: "/ping", method: "GET" },
      makeBaseQueryApi(store),
      {},
    );

    expect((res as { error?: unknown }).error).toBeUndefined();

    const firstCall = fetchSpy.mock.calls[0] as unknown[];
    const headers = pickHeadersFromFetchCall(firstCall);

    expect(headers.get("Authorization")).toBe("Bearer ACCESS");
    expect(headers.get("X-Client-Fingerprint")).toBe("FP");
  });

  it("on 401: refreshes token and retries original request", async () => {
    const fetchSpy = jest.spyOn(global, "fetch");

    fetchSpy
      .mockResolvedValueOnce(jsonResponse(401, { message: "unauthorized" }))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          accessToken: "NEW_ACCESS",
          refreshToken: "NEW_REFRESH",
          fingerprintHash: "NEW_FP",
        }),
      )
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    const store = makeStore({
      auth: {
        accessToken: "ACCESS",
        refreshToken: "REFRESH",
        fingerprintHash: "FP",
        language: "en",
        bootstrapped: true,
        forcedLogout: false,
        user: null,
      },
    });

    const res = await baseQueryWithReauth(
      { url: "/protected", method: "GET" },
      makeBaseQueryApi(store),
      {},
    );

    expect((res as { error?: unknown }).error).toBeUndefined();
    expect(fetchSpy).toHaveBeenCalledTimes(3);

    const refreshCall = fetchSpy.mock.calls[1] as unknown[];
    expect(pickUrlFromFetchCall(refreshCall)).toContain("/auth/refresh");

    const state = store.getState();
    expect(state.auth.accessToken).toBe("NEW_ACCESS");
    expect(state.auth.refreshToken).toBe("NEW_REFRESH");
    expect(state.auth.fingerprintHash).toBe("NEW_FP");

    expect(persistSession).toHaveBeenCalledTimes(1);
  });

  it("on 401 and no refreshToken: hard clears session and navigates to login", async () => {
    jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(jsonResponse(401, { message: "unauthorized" }));

    const store = makeStore({
      auth: {
        accessToken: "ACCESS",
        refreshToken: null,
        fingerprintHash: null,
        language: "en",
        bootstrapped: true,
        forcedLogout: false,
        user: null,
      },
    });

    const res = await baseQueryWithReauth(
      { url: "/protected", method: "GET" },
      makeBaseQueryApi(store),
      {},
    );

    expect((res as { error?: unknown }).error).toBeTruthy();

    expect(clearSession).toHaveBeenCalledTimes(1);
    expect(resetToLogin).toHaveBeenCalledTimes(1);
  });

  it("on 401 and refresh returns invalid payload: hard clears session", async () => {
    jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(jsonResponse(401, { message: "unauthorized" }))
      .mockResolvedValueOnce(jsonResponse(200, { bad: "shape" }))
      .mockResolvedValueOnce(jsonResponse(401, { message: "unauthorized" }));

    const store = makeStore({
      auth: {
        accessToken: "ACCESS",
        refreshToken: "REFRESH",
        fingerprintHash: null,
        language: "en",
        bootstrapped: true,
        forcedLogout: false,
        user: null,
      },
    });

    const res = await baseQueryWithReauth(
      { url: "/protected", method: "GET" },
      makeBaseQueryApi(store),
      {},
    );

    expect((res as { error?: unknown }).error).toBeTruthy();

    expect(clearSession).toHaveBeenCalledTimes(1);
    expect(resetToLogin).toHaveBeenCalledTimes(1);
  });
});
