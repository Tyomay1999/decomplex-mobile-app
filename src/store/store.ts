import { configureStore } from "@reduxjs/toolkit";

import { authReducer } from "../features/auth/authSlice";
import { api } from "../api/api";
import { notificationsReducer } from "../ui/notifications/notificationSlice";
import { rtkQueryErrorMiddleware } from "../api/rtkQueryErrorMiddleware";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationsReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware, rtkQueryErrorMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
