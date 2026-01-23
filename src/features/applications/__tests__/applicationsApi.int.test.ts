import { makeTestStore } from "../../../test/makeStore";
import { applicationsApi } from "../applicationsApi";
import type { ApplicationDto, ListMyApplicationsResponseDto } from "../applicationsTypes";
import { authActions } from "../../auth/authSlice";

type FetchCall = [RequestInfo | URL, RequestInit | undefined];

function lastCall(spy: jest.SpyInstance): FetchCall | null {
  const calls = spy.mock.calls as FetchCall[];
  if (calls.length === 0) return null;
  return calls[calls.length - 1] ?? null;
}

function getUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  if (typeof input === "object" && input !== null && "url" in input) {
    const r = input as { url: string };
    return r.url;
  }
  return String(input);
}

function getHeadersFromCall(call: FetchCall): Headers | null {
  const req = call[0];

  if (typeof req === "object" && req !== null && "headers" in req) {
    const h = (req as { headers: unknown }).headers;
    if (h instanceof Headers) return h;
  }

  const init = call[1];

  if (!init || !init.headers) return null;

  const h = init.headers;
  if (h instanceof Headers) return h;
  if (Array.isArray(h)) return new Headers(h);
  return new Headers(h as Record<string, string>);
}

function okJson(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function makeApp(overrides?: Partial<ApplicationDto>): ApplicationDto {
  return {
    id: overrides?.id ?? "a1",
    vacancyId: overrides?.vacancyId ?? "v1",
    candidateId: overrides?.candidateId ?? "c1",
    cvFilePath: overrides?.cvFilePath ?? "/cv.pdf",
    coverLetter: overrides?.coverLetter ?? null,
    status: overrides?.status ?? "applied",
    createdAt: overrides?.createdAt ?? "2024-01-01T00:00:00.000Z",
    updatedAt: overrides?.updatedAt ?? "2024-01-01T00:00:00.000Z",
  };
}

describe("applicationsApi (RTK Query integration)", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("listMyApplications builds querystring and transforms response", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValueOnce(
      okJson({
        success: true,
        data: {
          items: [makeApp({ id: "a1" }), makeApp({ id: "a2" })],
          nextCursor: "next",
        },
      } satisfies ListMyApplicationsResponseDto),
    );

    const store = makeTestStore();

    store.dispatch(
      authActions.hydrateFromStorage({
        accessToken: "ACCESS",
        refreshToken: "REFRESH",
        fingerprintHash: "FP",
        language: "en",
      }),
    );

    const res = await store
      .dispatch(applicationsApi.endpoints.listMyApplications.initiate({ limit: 20, cursor: "c1" }))
      .unwrap();

    expect(res.items).toHaveLength(2);
    expect(res.nextCursor).toBe("next");

    const call = lastCall(fetchSpy);
    expect(call).toBeTruthy();

    const url = call ? getUrl(call[0]) : "";
    const init = call ? call[1] : undefined;

    expect(url).toContain("/applications/my");
    expect(url).toContain("limit=20");
    expect(url).toContain("cursor=c1");

    const method = init?.method ?? "GET";
    expect(method).toBe("GET");

    const headers = call ? getHeadersFromCall(call) : null;
    expect(headers).toBeTruthy();
    expect(headers ? headers.get("Accept-Language") : null).toBe("en");
    expect(headers ? headers.get("Authorization") : null).toBe("Bearer ACCESS");
    expect(headers ? headers.get("X-Client-Fingerprint") : null).toBe("FP");
  });

  it("listMyApplications supports void args", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValueOnce(
      okJson({
        success: true,
        data: {
          items: [],
          nextCursor: null,
        },
      } satisfies ListMyApplicationsResponseDto),
    );

    const store = makeTestStore();

    store.dispatch(
      authActions.hydrateFromStorage({
        accessToken: null,
        refreshToken: null,
        fingerprintHash: null,
        language: "en",
      }),
    );

    const res = await store
      .dispatch(applicationsApi.endpoints.listMyApplications.initiate())
      .unwrap();

    expect(res.items).toHaveLength(0);
    expect(res.nextCursor).toBeNull();

    const call = lastCall(fetchSpy);
    expect(call).toBeTruthy();

    const url = call ? getUrl(call[0]) : "";
    expect(url).toContain("/applications/my");
  });
});
