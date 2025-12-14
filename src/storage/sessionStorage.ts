import { storageKeys } from "./storageKeys";
import { getSecureItem, removeSecureItem, setSecureItem } from "./secureStorage";
import { getAsyncItem, removeAsyncItem, setAsyncItem } from "./asyncStorage";

export type Locale = "en" | "ru" | "hy";

export type SessionData = {
  accessToken: string | null;
  refreshToken: string | null;
  fingerprintHash: string | null;
  language: Locale;
};

const DEFAULT_LANGUAGE: Locale = "en";

export async function loadSession(): Promise<SessionData> {
  const [accessToken, refreshToken, fingerprintHash, languageRaw] = await Promise.all([
    getSecureItem(storageKeys.accessToken),
    getSecureItem(storageKeys.refreshToken),
    getSecureItem(storageKeys.fingerprintHash),
    getAsyncItem(storageKeys.language),
  ]);

  return {
    accessToken,
    refreshToken,
    fingerprintHash,
    language: isLocale(languageRaw) ? languageRaw : DEFAULT_LANGUAGE,
  };
}

export async function persistSession(partial: Partial<SessionData>): Promise<void> {
  const tasks: Promise<unknown>[] = [];

  if ("accessToken" in partial) {
    tasks.push(
      partial.accessToken
        ? setSecureItem(storageKeys.accessToken, partial.accessToken)
        : removeSecureItem(storageKeys.accessToken),
    );
  }

  if ("refreshToken" in partial) {
    tasks.push(
      partial.refreshToken
        ? setSecureItem(storageKeys.refreshToken, partial.refreshToken)
        : removeSecureItem(storageKeys.refreshToken),
    );
  }

  if ("fingerprintHash" in partial) {
    tasks.push(
      partial.fingerprintHash
        ? setSecureItem(storageKeys.fingerprintHash, partial.fingerprintHash)
        : removeSecureItem(storageKeys.fingerprintHash),
    );
  }

  if ("language" in partial && partial.language) {
    tasks.push(setAsyncItem(storageKeys.language, partial.language));
  }

  await Promise.all(tasks);
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    removeSecureItem(storageKeys.accessToken),
    removeSecureItem(storageKeys.refreshToken),
    removeSecureItem(storageKeys.fingerprintHash),
    removeAsyncItem(storageKeys.language),
  ]);
}

function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "ru" || value === "hy";
}
