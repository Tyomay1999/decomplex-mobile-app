import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { NotificationItem, NotificationKind } from "./types";

type PushPayload = {
  kind: NotificationKind;
  message: string;
  title?: string;
  durationMs?: number;
};

type NotificationsState = {
  queue: NotificationItem[];
};

const MAX_QUEUE = 5;

const initialState: NotificationsState = {
  queue: [],
};

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeText(value: string | undefined): string {
  return (value ?? "").trim();
}

function signatureOf(input: { kind: NotificationKind; title?: string; message: string }): string {
  return `${input.kind}__${normalizeText(input.title)}__${normalizeText(input.message)}`;
}

function pickDurationMs(payload: PushPayload): number {
  if (typeof payload.durationMs === "number" && payload.durationMs > 0) return payload.durationMs;
  return payload.kind === "error" ? 4500 : 2500;
}

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    push(state, action: PayloadAction<PushPayload>) {
      const now = Date.now();
      const durationMs = pickDurationMs(action.payload);

      const sig = signatureOf(action.payload);
      const existing = state.queue.find((n) => signatureOf(n) === sig);

      if (existing) {
        existing.durationMs = Math.max(existing.durationMs, durationMs);
        existing.expiresAt = now + durationMs;
        return;
      }

      state.queue.push({
        id: makeId(),
        kind: action.payload.kind,
        message: action.payload.message,
        title: action.payload.title,
        durationMs,
        createdAt: now,
        expiresAt: now + durationMs,
      });

      if (state.queue.length > MAX_QUEUE) {
        state.queue = state.queue.slice(state.queue.length - MAX_QUEUE);
      }
    },
    remove(state, action: PayloadAction<string>) {
      state.queue = state.queue.filter((x) => x.id !== action.payload);
    },
    clear(state) {
      state.queue = [];
    },
  },
});

export const notificationsActions = notificationsSlice.actions;
export const notificationsReducer = notificationsSlice.reducer;
