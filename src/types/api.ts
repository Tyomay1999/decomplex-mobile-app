import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

export type ApiErrorShape = { message?: string; code?: string };

export function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === "object" && error !== null && "status" in error;
}

export function getFetchErrorData(error: FetchBaseQueryError): unknown {
  if ("data" in error) return (error as { data?: unknown }).data;
  return undefined;
}

export function getApiErrorMessageFromData(data: unknown): string | null {
  if (typeof data === "string") return data;

  if (typeof data === "object" && data !== null && "message" in data) {
    const msg = (data as ApiErrorShape).message;
    return typeof msg === "string" ? msg : null;
  }

  return null;
}

export function getErrorMessage(error: unknown): string | null {
  if (isFetchBaseQueryError(error)) {
    const data = getFetchErrorData(error);
    return getApiErrorMessageFromData(data);
  }

  if (typeof error === "object" && error !== null) {
    const se = error as SerializedError;
    return typeof se.message === "string" ? se.message : null;
  }

  if (error instanceof Error) return error.message;

  return null;
}
