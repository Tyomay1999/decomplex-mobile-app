import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export const API_REDUCER_PATH = "api" as const;

export const api = createApi({
  reducerPath: API_REDUCER_PATH,
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth", "Vacancy", "Application"],
  endpoints: () => ({}),
});
