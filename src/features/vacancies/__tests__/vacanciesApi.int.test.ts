import { configureStore } from "@reduxjs/toolkit";

import { api } from "../../../api/api";
import { authReducer } from "../../auth/authSlice";
import { vacanciesApi } from "../vacanciesApi";
import type { VacancyDetailsDto, VacancyDto } from "../vacanciesTypes";

jest.mock("../../../config/env", () => ({
  env: {
    apiBaseUrl: "http://localhost",
  },
}));

type AuthPreloaded = {
  accessToken: string | null;
  refreshToken: string | null;
  fingerprintHash: string | null;
  user: unknown;
  language: "en" | "ru" | "hy";
  bootstrapped: boolean;
  forcedLogout: boolean;
};

type Preloaded = {
  auth: AuthPreloaded;
};

function makeStore(preloaded?: Preloaded) {
  return configureStore({
    reducer: {
      auth: authReducer,
      [api.reducerPath]: api.reducer,
    },
    preloadedState: preloaded as unknown,
    middleware: (gdm) => gdm().concat(api.middleware),
  });
}

type Json = Record<string, unknown>;

function jsonResponse(status: number, body: Json): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function pickUrlFromFetchCall(call: unknown[]): string {
  const req = call[0];

  if (typeof req === "string") return req;

  if (typeof req === "object" && req !== null && "url" in req) {
    const url = (req as { url: unknown }).url;
    if (typeof url === "string") return url;
  }

  return String(req);
}

function pickMethodFromFetchCall(call: unknown[]): string {
  const req = call[0];

  if (typeof req === "object" && req !== null && "method" in req) {
    const m = (req as { method: unknown }).method;
    if (typeof m === "string" && m.length > 0) return m;
  }

  const init = call[1];

  if (typeof init === "object" && init !== null && "method" in init) {
    const method = (init as { method: unknown }).method;
    if (typeof method === "string" && method.length > 0) return method;
  }

  return "GET";
}

describe("vacanciesApi (RTK Query integration)", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("listVacancies builds querystring and transforms response", async () => {
    const vacancy: VacancyDto = {
      id: "v1",
      title: "Title",
      description: null,
      location: null,
      companyId: null,
      jobType: "remote",
      salaryFrom: null,
      salaryTo: null,
      status: "active",
      createdAt: null,
      updatedAt: null,
      applied: false,
      isApplied: false,
      hasApplied: false,
      myApplicationId: null,
    };

    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValueOnce(
      jsonResponse(200, {
        success: true,
        data: {
          vacancies: [vacancy],
          nextCursor: "c2",
        },
      }),
    );

    const store = makeStore({
      auth: {
        accessToken: null,
        refreshToken: null,
        fingerprintHash: null,
        user: null,
        language: "en",
        bootstrapped: true,
        forcedLogout: false,
      },
    });

    const args = {
      q: "react",
      status: "active" as const,
      jobType: "remote" as const,
      limit: 10,
      cursor: "c1",
    };

    const res = await store.dispatch(vacanciesApi.endpoints.listVacancies.initiate(args)).unwrap();

    expect(res.items).toHaveLength(1);
    expect(res.items[0]?.id).toBe("v1");
    expect(res.nextCursor).toBe("c2");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const call = fetchSpy.mock.calls[0] as unknown[];
    const url = pickUrlFromFetchCall(call);

    expect(url).toContain("/vacancies?");
    expect(url).toContain("q=react");
    expect(url).toContain("status=active");
    expect(url).toContain("jobType=remote");
    expect(url).toContain("limit=10");
    expect(url).toContain("cursor=c1");
  });

  it("getVacancyById normalizes nullable fields and supports both payload shapes", async () => {
    const base: VacancyDetailsDto = {
      id: "v2",
      status: "active",
      updatedAt: "2020-01-01",
      title: "T",
      description: null,
      location: undefined,
      companyId: null,
      jobType: "remote",
      salaryFrom: undefined,
      salaryTo: undefined,
      createdAt: null,
      applied: false,
      isApplied: false,
      hasApplied: false,
      myApplicationId: null,
      createdById: null,
    };

    const fetchSpy = jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(
        jsonResponse(200, {
          success: true,
          data: { vacancy: base },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          success: true,
          data: base,
        }),
      );

    const store = makeStore({
      auth: {
        accessToken: null,
        refreshToken: null,
        fingerprintHash: null,
        user: null,
        language: "en",
        bootstrapped: true,
        forcedLogout: false,
      },
    });

    const r1 = await store.dispatch(vacanciesApi.endpoints.getVacancyById.initiate("v2")).unwrap();
    expect(r1.id).toBe("v2");
    expect(r1.location).toBeNull();
    expect(r1.salaryFrom).toBeNull();
    expect(r1.salaryTo).toBeNull();

    const r2 = await store.dispatch(vacanciesApi.endpoints.getVacancyById.initiate("v2b")).unwrap();
    expect(r2.id).toBe("v2");
    expect(r2.location).toBeNull();
    expect(r2.salaryFrom).toBeNull();
    expect(r2.salaryTo).toBeNull();

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const call1 = fetchSpy.mock.calls[0] as unknown[];
    const call2 = fetchSpy.mock.calls[1] as unknown[];

    expect(pickUrlFromFetchCall(call1)).toContain("/vacancies/v2");
    expect(pickUrlFromFetchCall(call2)).toContain("/vacancies/v2b");
  });

  it("applyToVacancy POSTs FormData to correct URL", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValueOnce(
      jsonResponse(200, {
        success: true,
        data: {},
      }),
    );

    const store = makeStore({
      auth: {
        accessToken: "ACCESS",
        refreshToken: "REFRESH",
        fingerprintHash: "FP",
        user: null,
        language: "en",
        bootstrapped: true,
        forcedLogout: false,
      },
    });

    const formData = new FormData();
    formData.append("message", "hi");

    const res = await store
      .dispatch(vacanciesApi.endpoints.applyToVacancy.initiate({ vacancyId: "v3", formData }))
      .unwrap();

    expect(res.success).toBe(true);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const call = fetchSpy.mock.calls[0] as unknown[];
    const url = pickUrlFromFetchCall(call);
    const method = pickMethodFromFetchCall(call);

    expect(url).toContain("/vacancies/v3/apply");
    expect(method).toBe("POST");
  });
});
