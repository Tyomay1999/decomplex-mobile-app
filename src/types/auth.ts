export type LanguageCode = "en" | "ru" | "hy";

export type AuthUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
};
