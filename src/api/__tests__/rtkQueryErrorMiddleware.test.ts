import type { AnyAction, Dispatch, MiddlewareAPI } from "@reduxjs/toolkit";
import { rtkQueryErrorMiddleware } from "../rtkQueryErrorMiddleware";

type TestAction = {
  type: string;
  payload?: unknown;
};

type TestApi = MiddlewareAPI<Dispatch<AnyAction>, unknown> & {
  dispatch: jest.MockedFunction<Dispatch<AnyAction>>;
};

type PushPayload = {
  kind: "error";
  title: string;
  message: string;
};

type PushFn = (payload: PushPayload) => void;

const mockPush: jest.MockedFunction<PushFn> = jest.fn();

jest.mock("../../ui/notifications", () => ({
  notificationsActions: {
    push: (payload: PushPayload) => mockPush(payload),
  },
}));

const mockI18nExists: jest.MockedFunction<(key: string) => boolean> = jest.fn();
const mockI18nT: jest.MockedFunction<(key: string) => string> = jest.fn();

jest.mock("../../i18n/i18n", () => ({
  i18n: {
    exists: (key: string) => mockI18nExists(key),
    t: (key: string) => mockI18nT(key),
  },
}));

const mockIsRejectedWithValue: jest.MockedFunction<(action: unknown) => boolean> = jest.fn();

jest.mock("@reduxjs/toolkit", () => {
  const actual = jest.requireActual("@reduxjs/toolkit") as Record<string, unknown>;
  return {
    ...actual,
    isRejectedWithValue: (action: unknown) => mockIsRejectedWithValue(action),
  };
});

function makeApi(): TestApi {
  return {
    dispatch: jest.fn() as unknown as jest.MockedFunction<Dispatch<AnyAction>>,
    getState: jest.fn(),
  } as unknown as TestApi;
}

function run(action: TestAction) {
  const api = makeApi();

  const next = jest.fn((a: unknown) => a) as (action: unknown) => unknown;

  rtkQueryErrorMiddleware(api)(next)(action);
}

function resetI18n() {
  mockI18nExists.mockReset();
  mockI18nT.mockReset();
  mockI18nExists.mockImplementation(() => true);
  mockI18nT.mockImplementation((k) => k);
}

function expectToast(expected: PushPayload) {
  expect(mockPush).toHaveBeenCalledTimes(1);
  expect(mockPush).toHaveBeenCalledWith(expected);
}

describe("rtkQueryErrorMiddleware", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockIsRejectedWithValue.mockReset();
    resetI18n();
  });

  test("does nothing when action is not rejectedWithValue", () => {
    mockIsRejectedWithValue.mockReturnValue(false);

    run({ type: "ANY" });

    expect(mockPush).not.toHaveBeenCalled();
  });

  test("ignores 401 status", () => {
    mockIsRejectedWithValue.mockReturnValue(true);

    run({
      type: "test/rejected",
      payload: { status: 401 },
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  test("FETCH_ERROR -> errors.network", () => {
    mockIsRejectedWithValue.mockReturnValue(true);

    run({
      type: "test/rejected",
      payload: { status: "FETCH_ERROR" },
    });

    expectToast({
      kind: "error",
      title: "toast.errorTitle",
      message: "errors.network",
    });
  });

  test("PARSING_ERROR -> errors.badResponse", () => {
    mockIsRejectedWithValue.mockReturnValue(true);

    run({
      type: "test/rejected",
      payload: { status: "PARSING_ERROR" },
    });

    expectToast({
      kind: "error",
      title: "toast.errorTitle",
      message: "errors.badResponse",
    });
  });

  test("403 -> errors.forbidden", () => {
    mockIsRejectedWithValue.mockReturnValue(true);

    run({
      type: "test/rejected",
      payload: { status: 403 },
    });

    expectToast({
      kind: "error",
      title: "toast.errorTitle",
      message: "errors.forbidden",
    });
  });

  test("404 -> errors.notFound", () => {
    mockIsRejectedWithValue.mockReturnValue(true);

    run({
      type: "test/rejected",
      payload: { status: 404 },
    });

    expectToast({
      kind: "error",
      title: "toast.errorTitle",
      message: "errors.notFound",
    });
  });

  test("409 -> errors.conflict", () => {
    mockIsRejectedWithValue.mockReturnValue(true);

    run({
      type: "test/rejected",
      payload: { status: 409 },
    });

    expectToast({
      kind: "error",
      title: "toast.errorTitle",
      message: "errors.conflict",
    });
  });

  test("422 -> errors.validation", () => {
    mockIsRejectedWithValue.mockReturnValue(true);

    run({
      type: "test/rejected",
      payload: { status: 422 },
    });

    expectToast({
      kind: "error",
      title: "toast.errorTitle",
      message: "errors.validation",
    });
  });

  test(">= 500 -> errors.server", () => {
    mockIsRejectedWithValue.mockReturnValue(true);

    run({
      type: "test/rejected",
      payload: { status: 503 },
    });

    expectToast({
      kind: "error",
      title: "toast.errorTitle",
      message: "errors.server",
    });
  });

  test("other numeric status -> errors.requestFailed", () => {
    mockIsRejectedWithValue.mockReturnValue(true);

    run({
      type: "test/rejected",
      payload: { status: 418 },
    });

    expectToast({
      kind: "error",
      title: "toast.errorTitle",
      message: "errors.requestFailed",
    });
  });

  test("unknown status -> common.error", () => {
    mockIsRejectedWithValue.mockReturnValue(true);

    run({
      type: "test/rejected",
      payload: { status: "SOMETHING" },
    });

    expectToast({
      kind: "error",
      title: "toast.errorTitle",
      message: "common.error",
    });
  });

  test("api.code direct -> errors.codes.<code>", () => {
    mockIsRejectedWithValue.mockReturnValue(true);

    run({
      type: "test/rejected",
      payload: { code: "USER_BLOCKED" },
    });

    expectToast({
      kind: "error",
      title: "toast.errorTitle",
      message: "errors.codes.USER_BLOCKED",
    });
  });

  test("api.code nested -> errors.codes.<code>", () => {
    mockIsRejectedWithValue.mockReturnValue(true);

    run({
      type: "test/rejected",
      payload: { error: { code: "EMAIL_TAKEN" } },
    });

    expectToast({
      kind: "error",
      title: "toast.errorTitle",
      message: "errors.codes.EMAIL_TAKEN",
    });
  });

  test("missing i18n key -> common.error", () => {
    mockIsRejectedWithValue.mockReturnValue(true);

    mockI18nExists.mockImplementation((key) => key !== "errors.network");

    run({
      type: "test/rejected",
      payload: { status: "FETCH_ERROR" },
    });

    expectToast({
      kind: "error",
      title: "toast.errorTitle",
      message: "common.error",
    });
  });

  test("i18n.exists throws -> common.error", () => {
    mockIsRejectedWithValue.mockReturnValue(true);

    mockI18nExists.mockImplementation(() => {
      throw new Error("boom");
    });

    run({
      type: "test/rejected",
      payload: { status: 404 },
    });

    expectToast({
      kind: "error",
      title: "toast.errorTitle",
      message: "common.error",
    });
  });
});
