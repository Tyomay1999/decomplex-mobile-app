import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { UserDto } from "./authTypes";
import type { Locale } from "../../storage/sessionStorage";

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  fingerprintHash: string | null;
  user: UserDto | null;
  language: Locale;
  bootstrapped: boolean;
  forcedLogout: boolean;
};

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  fingerprintHash: null,
  user: null,
  language: "en",
  bootstrapped: false,
  forcedLogout: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateFromStorage(
      state,
      action: PayloadAction<{
        accessToken: string | null;
        refreshToken: string | null;
        fingerprintHash: string | null;
        language: Locale;
      }>,
    ) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.fingerprintHash = action.payload.fingerprintHash;
      state.language = action.payload.language;
      state.forcedLogout = false;
    },

    setBootstrapped(state, action: PayloadAction<boolean>) {
      state.bootstrapped = action.payload;
    },

    setLanguage(state, action: PayloadAction<Locale>) {
      state.language = action.payload;
    },

    setCredentials(
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string | null;
        fingerprintHash?: string;
      }>,
    ) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.forcedLogout = false;

      if (typeof action.payload.fingerprintHash === "string") {
        state.fingerprintHash = action.payload.fingerprintHash;
      }
    },

    setUser(state, action: PayloadAction<UserDto | null>) {
      state.user = action.payload ?? null;
    },

    setForcedLogout(state, action: PayloadAction<boolean>) {
      state.forcedLogout = action.payload;
    },

    clearAuth(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.fingerprintHash = null;
      state.user = null;
    },
  },
});

export const authActions = authSlice.actions;
export const authReducer = authSlice.reducer;
