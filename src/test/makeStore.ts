import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";

import { authReducer } from "../features/auth/authSlice";
import { api } from "../api/api";
import { notificationsReducer } from "../ui/notifications/notificationSlice";
import { rtkQueryErrorMiddleware } from "../api/rtkQueryErrorMiddleware";

const rootReducer = combineReducers({
  auth: authReducer,
  notifications: notificationsReducer,
  [api.reducerPath]: api.reducer,
});

export type TestRootState = ReturnType<typeof rootReducer>;

export const makeTestStore = (preloadedState?: Partial<TestRootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as TestRootState,
    middleware: (gdm) => gdm().concat(api.middleware, rtkQueryErrorMiddleware),
  });
};

export type TestStore = ReturnType<typeof makeTestStore>;
export type TestDispatch = TestStore["dispatch"];
export type TestState = ReturnType<TestStore["getState"]>;
