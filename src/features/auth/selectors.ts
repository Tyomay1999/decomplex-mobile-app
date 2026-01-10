import type { RootState } from "../../store/store";

export const selectAuth = (s: RootState) => s.auth;

export const selectBootstrapped = (s: RootState) => s.auth.bootstrapped;
export const selectUser = (s: RootState) => s.auth.user;

export const selectIsGuest = (s: RootState) => s.auth.bootstrapped && !s.auth.user;
export const selectIsAuthed = (s: RootState) => s.auth.bootstrapped && Boolean(s.auth.user);
