import React from "react";
import { fireEvent } from "@testing-library/react-native";

import { renderWithProviders } from "../../../test/render";
import { VacancyDetailsScreen } from "../VacancyDetailsScreen";
import { useVacancyDetailsScreen } from "../hooks/useVacancyDetailsScreen";

import type { Theme } from "../../../app/theme";
import type { VacancyDto } from "../../../features/vacancies/vacanciesTypes";

jest.mock("../hooks/useVacancyDetailsScreen", () => {
  const actual: unknown = jest.requireActual("../hooks/useVacancyDetailsScreen");
  const mod = actual as Record<string, unknown>;

  return {
    ...mod,
    useVacancyDetailsScreen: jest.fn(),
  };
});

type TFn = (key: string, opts?: { defaultValue?: string }) => string;

type PickedFile = { uri: string; name: string; type: string; size?: number };

type HookShape = {
  t: TFn;
  theme: Theme | undefined;

  query: { isLoading: boolean; isError: boolean; isFetching: boolean };
  vacancy: VacancyDto | undefined;
  refetch: () => void;

  goBack: () => void;

  tags: { key: string; label: string }[];

  applyOpen: boolean;
  openApply: () => void;
  closeApply: () => void;

  coverLetter: string;
  setCoverLetter: (v: string) => void;

  pickedFile: PickedFile | null;
  pickResume: () => Promise<void>;
  removeResume: () => void;

  formError: string | null;

  submitApply: () => Promise<void>;
  applyState: { isLoading: boolean };

  safeText: (v: unknown, fb?: string) => string;
  formatPosted: (v?: string | null) => string;

  formatStatus: (v?: unknown) => string;

  alreadyApplied: boolean;
  applyDisabled: boolean;
  formatFileSize: (bytes?: number) => string;
};

const mockUseHook = useVacancyDetailsScreen as unknown as jest.Mock<HookShape>;

const t: TFn = (key, opts) => (opts?.defaultValue ? opts.defaultValue : key);

function makeTheme(): Theme {
  return {
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
}

function makeVacancy(id: string): VacancyDto {
  const v = {
    id,
    title: `Title ${id}`,
    companyId: "c1",
    jobType: "full_time",
    salaryFrom: 1000,
    salaryTo: 2000,
    location: "Yerevan",
    description: "Desc",
    createdAt: new Date().toISOString(),
    updatedAt: null,
  };

  return v as unknown as VacancyDto;
}

function baseHook(overrides?: Partial<HookShape>): HookShape {
  const theme = makeTheme();

  const base: HookShape = {
    t,
    theme,

    query: { isLoading: false, isError: false, isFetching: false },
    vacancy: makeVacancy("v1"),
    refetch: () => undefined,

    goBack: () => undefined,

    tags: [{ key: "loc", label: "loc" }],

    applyOpen: false,
    openApply: () => undefined,
    closeApply: () => undefined,

    coverLetter: "",
    setCoverLetter: () => undefined,

    pickedFile: null,
    pickResume: async () => undefined,
    removeResume: () => undefined,

    formError: null,

    submitApply: async () => undefined,
    applyState: { isLoading: false },

    safeText: (v, fb) => {
      if (typeof v === "string" && v.trim().length > 0) return v;
      return typeof fb === "string" ? fb : "—";
    },
    formatPosted: () => "—",

    formatStatus: () => "—",

    alreadyApplied: false,
    applyDisabled: false,
    formatFileSize: () => "",
  };

  return { ...base, ...(overrides ?? {}) };
}

beforeEach(() => {
  mockUseHook.mockReset();
});

test("renders loading state when query.isLoading is true", () => {
  mockUseHook.mockReturnValue(
    baseHook({
      query: { isLoading: true, isError: false, isFetching: false },
    }),
  );

  const { getByTestId, queryByTestId } = renderWithProviders(<VacancyDetailsScreen />);

  expect(getByTestId("vacancyDetails.loading")).toBeTruthy();
  expect(queryByTestId("vacancyDetails.inlineState")).toBeNull();
  expect(queryByTestId("vacancyDetails.content")).toBeNull();
});

test("renders error state and pressing retry calls refetch", () => {
  const refetch = jest.fn<void, []>();

  mockUseHook.mockReturnValue(
    baseHook({
      query: { isLoading: false, isError: true, isFetching: false },
      refetch,
    }),
  );

  const { getByTestId } = renderWithProviders(<VacancyDetailsScreen />);

  expect(getByTestId("vacancyDetails.inlineState")).toBeTruthy();

  fireEvent.press(getByTestId("screenState.retry"));
  expect(refetch).toHaveBeenCalledTimes(1);
});

test("renders content and pressing apply calls openApply when not disabled", () => {
  const openApply = jest.fn<void, []>();

  mockUseHook.mockReturnValue(
    baseHook({
      query: { isLoading: false, isError: false, isFetching: false },
      openApply,
      alreadyApplied: false,
      applyDisabled: false,
    }),
  );

  const { getByTestId } = renderWithProviders(<VacancyDetailsScreen />);

  expect(getByTestId("vacancyDetails.content")).toBeTruthy();

  fireEvent.press(getByTestId("vacancyDetails.apply"));
  expect(openApply).toHaveBeenCalledTimes(1);
});
