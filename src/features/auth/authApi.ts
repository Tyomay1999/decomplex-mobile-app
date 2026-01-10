import { api } from "../../api/api";
import type {
  LoginDataDto,
  LoginRequestDto,
  LogoutRequestDto,
  UserDto,
  RegisterCandidateRequestDto,
} from "./authTypes";

import { authActions } from "./authSlice";
import { clearSession, persistSession } from "../../storage/sessionStorage";

export type ApiResponse<T> = {
  success: boolean;
  data: T;
};

function mapBackendLangToApp(value: unknown): "en" | "ru" | "hy" {
  if (value === "en") return "en";
  if (value === "ru") return "ru";
  if (value === "hy") return "hy";
  if (value === "am") return "hy";
  return "en";
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginDataDto, LoginRequestDto>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<LoginDataDto>) => response.data,
      invalidatesTags: ["Auth"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            authActions.setCredentials({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken ?? null,
              fingerprintHash: data.fingerprintHash,
            }),
          );

          if (data.user) {
            dispatch(authActions.setUser(data.user));
            dispatch(authActions.setLanguage(mapBackendLangToApp(data.user.language)));
          }

          await persistSession({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken ?? null,
            fingerprintHash: data.fingerprintHash ?? null,
            language: mapBackendLangToApp(data.user?.language),
          });
        } catch {
          dispatch(authActions.clearAuth());
          await clearSession();
        }
      },
    }),

    me: builder.query<UserDto, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["Auth"],
      transformResponse: (response: ApiResponse<{ user: UserDto }>) => response.data.user,
    }),

    registerCandidate: builder.mutation<LoginDataDto, RegisterCandidateRequestDto>({
      query: (body) => ({
        url: "/auth/register/candidate",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<LoginDataDto>) => response.data,
      invalidatesTags: ["Auth"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            authActions.setCredentials({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken ?? null,
              fingerprintHash: data.fingerprintHash,
            }),
          );

          if (data.user) {
            dispatch(authActions.setUser(data.user));
            dispatch(authActions.setLanguage(mapBackendLangToApp(data.user.language)));
          }

          await persistSession({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken ?? null,
            fingerprintHash: data.fingerprintHash ?? null,
            language: mapBackendLangToApp(data.user?.language),
          });
        } catch {
          dispatch(authActions.clearAuth());
          await clearSession();
        }
      },
    }),

    logout: builder.mutation<void, LogoutRequestDto>({
      query: (body) => ({
        url: "/auth/logout",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Auth"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(authActions.clearAuth());
          dispatch(api.util.resetApiState());
          await clearSession();
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterCandidateMutation,
  useMeQuery,
  useLazyMeQuery,
  useLogoutMutation,
} = authApi;
