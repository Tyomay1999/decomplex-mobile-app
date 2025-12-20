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
import type { RefreshDataDto } from "../features/auth/authTypes";
import { clearSession, persistSession } from "../storage/sessionStorage";

const mutex = new Mutex();

const API_REDUCER_PATH = "api" as const;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  credentials: "include",
  prepareHeaders: (headers, api) => {
    const state = api.getState() as RootState;

    const accessToken = state.auth.accessToken;
    const language = state.auth.language;
    const fingerprintHash = state.auth.fingerprintHash;

    headers.set("Accept-Language", language);

    if (fingerprintHash) headers.set("X-Client-Fingerprint", fingerprintHash);
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

    return headers;
  },
});

async function hardClearSession(api: BaseQueryApi): Promise<void> {
  api.dispatch(authActions.clearAuth());

  api.dispatch({ type: `${API_REDUCER_PATH}/resetApiState` });

  await clearSession();
}

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401) return result;

  const state = api.getState() as RootState;
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

      if (refreshResult.data) {
        const data = refreshResult.data as RefreshDataDto;
        const fingerprintHash =
          typeof data.fingerprintHash === "string" ? data.fingerprintHash : null;
        api.dispatch(
          authActions.setCredentials({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            fingerprintHash: fingerprintHash || "",
          }),
        );

        await persistSession({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          fingerprintHash: fingerprintHash,
        });

        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        await hardClearSession(api);
      }
    } finally {
      release();
    }
  } else {
    await mutex.waitForUnlock();
    result = await rawBaseQuery(args, api, extraOptions);
  }

  return result;
};
