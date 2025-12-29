import type { Locale } from "../../storage/sessionStorage";
import type { BackendLocale } from "../../api/locale";

export type UserDto = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  userType?: string;
  language?: Locale;
};

export type LoginRequestDto = {
  email: string;
  password: string;
  rememberUser?: boolean;
  language?: BackendLocale;
};

export type LoginDataDto = {
  accessToken: string;
  refreshToken: string;
  fingerprintHash: string;
  user: UserDto;
};

export type LogoutRequestDto = {
  refreshToken: string;
};

export type RefreshRequestDto = {
  refreshToken: string;
};

export type RefreshDataDto = {
  accessToken: string;
  refreshToken: string;
  fingerprintHash?: string;
};

export type RegisterCandidateRequestDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  language: BackendLocale;
};

export type RegisterCandidateDataDto = LoginDataDto;
