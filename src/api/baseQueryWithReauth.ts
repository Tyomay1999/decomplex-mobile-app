import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { env } from "../config/env";
import { authActions } from "../features/auth/authSlice";
import type { RootState } from "../store/store";
import type { RefreshDataDto } from "../features/auth/authTypes";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  prepareHeaders: (headers, api) => {
    const state = api.getState() as RootState;

    const accessToken = state.auth.accessToken;
    const language = state.auth.language;
    const fingerprintHash = state.auth.fingerprintHash;

    headers.set("Content-Type", "application/json");
    headers.set("Accept-Language", language);

    if (fingerprintHash) headers.set("X-Client-Fingerprint", fingerprintHash);
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const state = api.getState() as RootState;
    const refreshToken = state.auth.refreshToken;

    if (!refreshToken) {
      api.dispatch(authActions.clearAuth());
      return result;
    }

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
      api.dispatch(
        authActions.setCredentials({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }),
      );

      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(authActions.clearAuth());
    }
  }

  return result;
};
