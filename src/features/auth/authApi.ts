import { api } from "../../api/api";
import type {
  LoginDataDto,
  LoginRequestDto,
  LogoutRequestDto,
  RefreshDataDto,
  RefreshRequestDto,
  UserDto,
  RegisterCandidateRequestDto,
} from "./authTypes";

export type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  message?: string;
  data?: unknown;
};

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginDataDto, LoginRequestDto>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<LoginDataDto>) => response.data,
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
    }),

    logout: builder.mutation<void, LogoutRequestDto>({
      query: (body) => ({
        url: "/auth/logout",
        method: "PATCH",
        body,
      }),
    }),

    current: builder.query<UserDto, void>({
      query: () => ({
        url: "/auth/current",
        method: "GET",
      }),
      providesTags: ["Auth"],
      transformResponse: (response: ApiResponse<{ user: UserDto }>) => response.data.user,
    }),

    refresh: builder.mutation<RefreshDataDto, RefreshRequestDto>({
      query: (body) => ({
        url: "/auth/refresh",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<RefreshDataDto>) => response.data,
    }),
  }),
});

export const { useLoginMutation, useRegisterCandidateMutation, useLazyMeQuery } = authApi;
