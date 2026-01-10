import { isRejectedWithValue, Middleware } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import { notificationsActions } from "../ui/notifications";
import { i18n } from "../i18n/i18n";

type ApiErrorShape = {
  message?: string;
  code?: string;
  error?: { message?: string; code?: string };
};

function isFetchBaseQueryError(e: unknown): e is FetchBaseQueryError {
  return typeof e === "object" && e !== null && "status" in e;
}

function extractApiError(payload: unknown): { message?: string; code?: string } {
  if (typeof payload !== "object" || payload === null) return {};
  const p = payload as ApiErrorShape;

  const directMsg = typeof p.message === "string" ? p.message : undefined;
  const directCode = typeof p.code === "string" ? p.code : undefined;

  const nestedMsg = typeof p.error?.message === "string" ? p.error?.message : undefined;
  const nestedCode = typeof p.error?.code === "string" ? p.error?.code : undefined;

  return {
    message: directMsg ?? nestedMsg,
    code: directCode ?? nestedCode,
  };
}

function resolveI18nKeys(action: unknown): { titleKey: string; messageKey: string } | null {
  if (typeof action !== "object" || action === null) return null;
  const a = action as { payload?: unknown; error?: unknown };

  const payload = a.payload;

  if (isFetchBaseQueryError(payload)) {
    const status = payload.status;

    if (status === "FETCH_ERROR") {
      return { titleKey: "toast.errorTitle", messageKey: "errors.network" };
    }

    if (status === "PARSING_ERROR") {
      return { titleKey: "toast.errorTitle", messageKey: "errors.badResponse" };
    }

    if (typeof status === "number") {
      if (status === 401) return null;
      if (status === 403) return { titleKey: "toast.errorTitle", messageKey: "errors.forbidden" };
      if (status === 404) return { titleKey: "toast.errorTitle", messageKey: "errors.notFound" };
      if (status === 409) return { titleKey: "toast.errorTitle", messageKey: "errors.conflict" };
      if (status === 422) return { titleKey: "toast.errorTitle", messageKey: "errors.validation" };
      if (status >= 500) return { titleKey: "toast.errorTitle", messageKey: "errors.server" };

      return { titleKey: "toast.errorTitle", messageKey: "errors.requestFailed" };
    }

    return { titleKey: "toast.errorTitle", messageKey: "common.error" };
  }

  const api = extractApiError(payload);
  if (api.code) {
    return {
      titleKey: "toast.errorTitle",
      messageKey: `errors.codes.${api.code}`,
    };
  }

  return { titleKey: "toast.errorTitle", messageKey: "common.error" };
}

function hasKey(key: string): boolean {
  try {
    return i18n.exists(key);
  } catch {
    return false;
  }
}

export const rtkQueryErrorMiddleware: Middleware = (api) => (next) => (action) => {
  const res = next(action);

  if (isRejectedWithValue(action)) {
    const keys = resolveI18nKeys(action);
    if (!keys) return res;

    const titleKey = keys.titleKey;
    const messageKey = keys.messageKey;

    const title = hasKey(titleKey) ? i18n.t(titleKey) : i18n.t("toast.errorTitle");
    const message = hasKey(messageKey) ? i18n.t(messageKey) : i18n.t("common.error");

    api.dispatch(
      notificationsActions.push({
        kind: "error",
        title,
        message,
      }),
    );
  }

  return res;
};
