import type { Locale } from "../../storage/sessionStorage";

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
  language?: Locale;
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
