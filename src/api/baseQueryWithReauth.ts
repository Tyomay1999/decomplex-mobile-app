import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryApi,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { Mutex } from "async-mutex";

import { env } from "../config/env";
import { authActions } from "../features/auth/authSlice";
import type { RootState } from "../store/store";
import { clearSession, persistSession } from "../storage/sessionStorage";
import { mapLocaleToBackend } from "./locale";
import { api as apiSlice } from "./api";
import type { RefreshDataDto } from "../features/auth/authTypes";
import { resetToLogin } from "../navigation/navigationRef";

const mutex = new Mutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  prepareHeaders: (headers, api) => {
    const state = api.getState() as RootState;

    const accessToken = state.auth.accessToken;
    const language = state.auth.language;
    const fingerprintHash = state.auth.fingerprintHash;

    headers.set("Accept-Language", mapLocaleToBackend(language));

    if (fingerprintHash) headers.set("X-Client-Fingerprint", fingerprintHash);
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

    return headers;
  },
});

function isRefreshDataDto(value: unknown): value is RefreshDataDto {
  if (!value || typeof value !== "object") return false;

  const v = value as Record<string, unknown>;
  const accessTokenOk = typeof v.accessToken === "string" && v.accessToken.trim().length > 0;

  const refreshTokenOk =
    v.refreshToken === null ||
    (typeof v.refreshToken === "string" && v.refreshToken.trim().length > 0);

  const fingerprintOk =
    v.fingerprintHash === undefined ||
    v.fingerprintHash === null ||
    (typeof v.fingerprintHash === "string" && v.fingerprintHash.trim().length > 0);

  return accessTokenOk && refreshTokenOk && fingerprintOk;
}

function isUnauthorized(error: FetchBaseQueryError | undefined): boolean {
  return Boolean(error && typeof error.status === "number" && error.status === 401);
}

async function hardClearSession(api: BaseQueryApi): Promise<void> {
  const state = api.getState() as RootState;

  if (!state.auth.forcedLogout) {
    api.dispatch(authActions.setForcedLogout(true));
    resetToLogin();
  }

  api.dispatch(authActions.clearAuth());
  api.dispatch(apiSlice.util.resetApiState());
  await clearSession();
}

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();

  let result = await rawBaseQuery(args, api, extraOptions);

  if (!isUnauthorized(result.error)) {
    return result;
  }

  const state = api.getState() as RootState;

  if (state.auth.forcedLogout) {
    return result;
  }

  const refreshToken = state.auth.refreshToken;

  if (!refreshToken) {
    await hardClearSession(api);
    return result;
  }

  if (!mutex.isLocked()) {
    const release = await mutex.acquire();

    try {
      const refreshResult = await rawBaseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions,
      );

      if (isRefreshDataDto(refreshResult.data)) {
        const nextFingerprint =
          typeof refreshResult.data.fingerprintHash === "string"
            ? refreshResult.data.fingerprintHash
            : null;

        api.dispatch(
          authActions.setCredentials({
            accessToken: refreshResult.data.accessToken,
            refreshToken: refreshResult.data.refreshToken,
            ...(nextFingerprint ? { fingerprintHash: nextFingerprint } : {}),
          }),
        );

        await persistSession({
          accessToken: refreshResult.data.accessToken,
          refreshToken: refreshResult.data.refreshToken,
          fingerprintHash: nextFingerprint,
        });

        result = await rawBaseQuery(args, api, extraOptions);

        if (isUnauthorized(result.error)) {
          await hardClearSession(api);
        }
      } else {
        await hardClearSession(api);
      }
    } finally {
      release();
    }
  } else {
    await mutex.waitForUnlock();
    result = await rawBaseQuery(args, api, extraOptions);

    if (isUnauthorized(result.error)) {
      await hardClearSession(api);
    }
  }

  return result;
};
