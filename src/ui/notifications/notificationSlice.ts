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

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    push(state, action: PayloadAction<PushPayload>) {
      const durationMs =
        typeof action.payload.durationMs === "number" && action.payload.durationMs > 0
          ? action.payload.durationMs
          : action.payload.kind === "error"
            ? 4500
            : 2500;

      state.queue.push({
        id: makeId(),
        kind: action.payload.kind,
        message: action.payload.message,
        title: action.payload.title,
        durationMs,
        createdAt: Date.now(),
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
