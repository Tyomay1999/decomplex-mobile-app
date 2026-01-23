import React from "react";
import { act, renderHook } from "@testing-library/react-native";

import { useVacancyDetailsScreen } from "../useVacancyDetailsScreen";

import type { Theme } from "../../../../app/theme";
import type { VacancyDto } from "../../../../features/vacancies/vacanciesTypes";

type QueryState = {
  data?: VacancyDto;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  refetch: () => void;
};

type ApplyUnwrap = { unwrap: () => Promise<unknown> };
type ApplyFn = (args: { vacancyId: string; formData: FormData }) => ApplyUnwrap;

type TOptions = { defaultValue?: string; count?: number };
type TFn = (key: string, opts?: TOptions) => string;

const mockDispatch = jest.fn<void, [unknown]>();
const mockRefetch = jest.fn<void, []>();
const mockGoBack = jest.fn<void, []>();

const mockGetDocumentAsync = jest.fn<
  Promise<{
    canceled: boolean;
    assets?: Array<{
      uri?: string;
      name?: string;
      mimeType?: string;
      size?: number;
    }>;
  }>,
  [unknown]
>();

const mockUseGetVacancyByIdQuery = jest.fn<QueryState, [string]>();
const mockApplyUnwrap = jest.fn<Promise<unknown>, []>();
const mockApplyToVacancy = jest.fn<ApplyUnwrap, [{ vacancyId: string; formData: FormData }]>();

const mockPush = jest.fn<unknown, [unknown]>();

jest.mock("react-i18next", () => {
  const t: TFn = (key, opts) => {
    if (key.startsWith("vacancy.status.")) return key;
    if (opts?.defaultValue) return opts.defaultValue;
    return key;
  };

  return {
    useTranslation: () => ({ t }),
  };
});

jest.mock("@react-navigation/native", () => {
  return {
    useNavigation: () => ({ goBack: mockGoBack }),
    useRoute: () => ({ params: { vacancyId: "v1" } }),
  };
});

jest.mock("expo-document-picker", () => {
  return {
    getDocumentAsync: (args: unknown) => mockGetDocumentAsync(args),
  };
});

jest.mock("../../../../store/hooks", () => {
  return {
    useAppDispatch: () => mockDispatch,
  };
});

jest.mock("../../../../ui/notifications", () => {
  return {
    notificationsActions: {
      push: (payload: unknown) => mockPush(payload),
    },
  };
});

jest.mock("../../../../features/vacancies/vacanciesApi", () => {
  return {
    useGetVacancyByIdQuery: (id: string) => mockUseGetVacancyByIdQuery(id),
    useApplyToVacancyMutation: () => {
      const fn: ApplyFn = (args) => mockApplyToVacancy(args);
      return [fn, { isLoading: false }] as const;
    },
  };
});

jest.mock("../../../../app/ThemeProvider", () => {
  const ReactActual = jest.requireActual("react") as typeof React;

  const theme: Theme = {
    name: "light",
    surface: "#ffffff",
    border: "rgba(0,0,0,0.12)",
    divider: "rgba(0,0,0,0.12)",
    background: "#f5f5f5",
    primary: "#3b82f6",
    textPrimary: "#111111",
    textSecondary: "#666666",
    textTertiary: "#999999",
  };

  const ThemeContext = ReactActual.createContext<{ theme: Theme } | null>({ theme });

  return { ThemeContext };
});

function makeVacancy(overrides?: Partial<VacancyDto>): VacancyDto {
  const base: VacancyDto = {
    id: "v1",
    title: "Title v1",
    companyId: "c1",
    jobType: "full_time",
    salaryFrom: 1000,
    salaryTo: 2000,
    location: "Yerevan",
    description: "Desc",
    createdAt: new Date().toISOString(),
    updatedAt: null,
  } as VacancyDto;

  return { ...base, ...(overrides ?? {}) };
}

function setQueryState(state: Partial<QueryState>): void {
  const base: QueryState = {
    data: makeVacancy(),
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: mockRefetch,
  };
  mockUseGetVacancyByIdQuery.mockReturnValue({ ...base, ...state });
}

beforeEach(() => {
  mockDispatch.mockClear();
  mockRefetch.mockClear();
  mockGoBack.mockClear();
  mockGetDocumentAsync.mockClear();

  mockUseGetVacancyByIdQuery.mockReset();

  mockApplyUnwrap.mockReset();
  mockApplyToVacancy.mockReset();

  mockPush.mockClear();

  setQueryState({});
  mockApplyToVacancy.mockReturnValue({ unwrap: mockApplyUnwrap });
  mockApplyUnwrap.mockResolvedValueOnce({});
});

test("returns query flags and vacancy", () => {
  const vacancy = makeVacancy({ id: "v1" });
  setQueryState({ data: vacancy, isLoading: false, isError: false, isFetching: true });

  const { result } = renderHook(() => useVacancyDetailsScreen());

  expect(result.current.query.isLoading).toBe(false);
  expect(result.current.query.isError).toBe(false);
  expect(result.current.query.isFetching).toBe(true);
  expect(result.current.vacancy?.id).toBe("v1");
});

test("alreadyApplied is true when vacancy.applied is true", () => {
  setQueryState({ data: makeVacancy({ applied: true } as Partial<VacancyDto>) });

  const { result } = renderHook(() => useVacancyDetailsScreen());

  expect(result.current.alreadyApplied).toBe(true);
  expect(result.current.applyDisabled).toBe(true);
});

test("alreadyApplied is true when vacancy.myApplicationId is set", () => {
  setQueryState({ data: makeVacancy({ myApplicationId: "a1" } as Partial<VacancyDto>) });

  const { result } = renderHook(() => useVacancyDetailsScreen());

  expect(result.current.alreadyApplied).toBe(true);
  expect(result.current.applyDisabled).toBe(true);
});

test("openApply opens modal and resets form fields", () => {
  setQueryState({ data: makeVacancy() });

  const { result } = renderHook(() => useVacancyDetailsScreen());

  act(() => {
    result.current.openApply();
  });

  expect(result.current.applyOpen).toBe(true);
  expect(result.current.coverLetter).toBe("");
  expect(result.current.pickedFile).toBeNull();
  expect(result.current.formError).toBeNull();
});

test("openApply does nothing when applyDisabled is true", () => {
  setQueryState({ data: makeVacancy({ applied: true } as Partial<VacancyDto>) });

  const { result } = renderHook(() => useVacancyDetailsScreen());

  act(() => {
    result.current.openApply();
  });

  expect(result.current.applyOpen).toBe(false);
});

test("pickResume ignores canceled picker", async () => {
  mockGetDocumentAsync.mockResolvedValueOnce({ canceled: true });

  const { result } = renderHook(() => useVacancyDetailsScreen());

  await act(async () => {
    await result.current.pickResume();
  });

  expect(result.current.pickedFile).toBeNull();
  expect(result.current.formError).toBeNull();
});

test("pickResume sets error when file is too large", async () => {
  mockGetDocumentAsync.mockResolvedValueOnce({
    canceled: false,
    assets: [
      {
        uri: "file://resume.pdf",
        name: "resume.pdf",
        mimeType: "application/pdf",
        size: 6 * 1024 * 1024,
      },
    ],
  });

  const { result } = renderHook(() => useVacancyDetailsScreen());

  await act(async () => {
    await result.current.pickResume();
  });

  expect(result.current.pickedFile).toBeNull();
  expect(result.current.formError).toBe("vacancy.fileTooLarge");
});

test("pickResume sets pickedFile when valid asset provided", async () => {
  mockGetDocumentAsync.mockResolvedValueOnce({
    canceled: false,
    assets: [
      {
        uri: "file://resume.pdf",
        name: "resume.pdf",
        mimeType: "application/pdf",
        size: 1200,
      },
    ],
  });

  const { result } = renderHook(() => useVacancyDetailsScreen());

  await act(async () => {
    await result.current.pickResume();
  });

  expect(result.current.formError).toBeNull();
  expect(result.current.pickedFile?.uri).toBe("file://resume.pdf");
  expect(result.current.pickedFile?.name).toBe("resume.pdf");
  expect(result.current.pickedFile?.type).toBe("application/pdf");
  expect(result.current.pickedFile?.size).toBe(1200);
});

test("submitApply sets error when pickedFile is missing", async () => {
  const { result } = renderHook(() => useVacancyDetailsScreen());

  await act(async () => {
    await result.current.submitApply();
  });

  expect(result.current.formError).toBe("vacancy.cvRequired");
  expect(mockApplyToVacancy).toHaveBeenCalledTimes(0);
});

test("submitApply success: closes modal, sets appliedOnce, dispatches success toast, refetches", async () => {
  const { result } = renderHook(() => useVacancyDetailsScreen());

  act(() => {
    result.current.openApply();
  });

  mockGetDocumentAsync.mockResolvedValueOnce({
    canceled: false,
    assets: [
      { uri: "file://resume.pdf", name: "resume.pdf", mimeType: "application/pdf", size: 1200 },
    ],
  });

  await act(async () => {
    await result.current.pickResume();
  });

  await act(async () => {
    await result.current.submitApply();
  });

  expect(mockApplyToVacancy).toHaveBeenCalledTimes(1);
  expect(mockRefetch).toHaveBeenCalledTimes(1);
  expect(mockDispatch).toHaveBeenCalledTimes(1);
  expect(mockPush).toHaveBeenCalledTimes(1);

  expect(result.current.alreadyApplied).toBe(true);
  expect(result.current.applyOpen).toBe(false);
  expect(result.current.pickedFile).toBeNull();
  expect(result.current.coverLetter).toBe("");
});

test("submitApply 409 already applied: closes modal, marks applied, dispatches success toast", async () => {
  const err = { status: 409 };

  mockApplyUnwrap.mockReset();
  mockApplyUnwrap.mockRejectedValueOnce(err);
  mockApplyToVacancy.mockReturnValueOnce({ unwrap: mockApplyUnwrap });

  const { result } = renderHook(() => useVacancyDetailsScreen());

  act(() => {
    result.current.openApply();
  });

  mockGetDocumentAsync.mockResolvedValueOnce({
    canceled: false,
    assets: [
      { uri: "file://resume.pdf", name: "resume.pdf", mimeType: "application/pdf", size: 1200 },
    ],
  });

  await act(async () => {
    await result.current.pickResume();
  });

  await act(async () => {
    await result.current.submitApply();
  });

  expect(mockApplyToVacancy).toHaveBeenCalledTimes(1);
  expect(mockDispatch).toHaveBeenCalledTimes(1);
  expect(mockPush).toHaveBeenCalledTimes(1);

  expect(result.current.alreadyApplied).toBe(true);
  expect(result.current.applyOpen).toBe(false);
});

test("submitApply backend error message: sets formError and keeps modal open", async () => {
  const err = { data: { error: { message: "Backend failed" } } };

  mockApplyUnwrap.mockReset();
  mockApplyUnwrap.mockRejectedValueOnce(err);
  mockApplyToVacancy.mockReturnValueOnce({ unwrap: mockApplyUnwrap });

  const { result } = renderHook(() => useVacancyDetailsScreen());

  act(() => {
    result.current.openApply();
  });

  mockGetDocumentAsync.mockResolvedValueOnce({
    canceled: false,
    assets: [
      { uri: "file://resume.pdf", name: "resume.pdf", mimeType: "application/pdf", size: 1200 },
    ],
  });

  await act(async () => {
    await result.current.pickResume();
  });

  await act(async () => {
    await result.current.submitApply();
  });

  expect(result.current.applyOpen).toBe(true);
  expect(result.current.formError).toBe("Backend failed");
});

test("formatStatus returns dash for empty and translates known strings", () => {
  const { result } = renderHook(() => useVacancyDetailsScreen());

  expect(result.current.formatStatus(undefined)).toBe("—");
  expect(result.current.formatStatus("ACTIVE")).toBe("vacancy.status.active");
});
