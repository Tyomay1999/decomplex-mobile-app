export const storageKeys = {
  accessToken: "decomplex.accessToken",
  refreshToken: "decomplex.refreshToken",
  fingerprintHash: "decomplex.fingerprintHash",
  language: "decomplex.language",
} as const;

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];
