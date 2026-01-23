import type { TFunction } from "i18next";

import {
  formatCompanyLabel,
  formatJobTypeLabel,
  formatSalaryLabel,
  formatPostedLabel,
  isNewByCreatedAt,
} from "../useHomeFormatters";

type TMock = jest.Mock<string, [string, Record<string, unknown> | undefined]>;

function makeT() {
  const t = jest.fn<string, [string, Record<string, unknown> | undefined]>((key, opts) => {
    if (!opts) return key;
    return `${key}:${JSON.stringify(opts)}`;
  });
  return { t: t as unknown as TFunction, tMock: t as unknown as TMock };
}

describe("useHomeFormatters: company & job type", () => {
  test("formatCompanyLabel: missing companyId", () => {
    const { t, tMock } = makeT();

    expect(formatCompanyLabel(t, "")).toBe("vacancy.companyNotSpecified");
    expect(tMock).toHaveBeenCalledWith("vacancy.companyNotSpecified");
  });

  test("formatCompanyLabel: shortens id to 6 chars", () => {
    const { t, tMock } = makeT();

    const out = formatCompanyLabel(t, "1234567890");
    expect(out).toBe('vacancy.companyIdShort:{"id":"123456…"}');
    expect(tMock).toHaveBeenCalledWith("vacancy.companyIdShort", { id: "123456…" });
  });

  test("formatCompanyLabel: exactly 6 chars still appends ellipsis", () => {
    const { t, tMock } = makeT();

    const out = formatCompanyLabel(t, "abcdef");
    expect(out).toBe('vacancy.companyIdShort:{"id":"abcdef…"}');
    expect(tMock).toHaveBeenCalledWith("vacancy.companyIdShort", { id: "abcdef…" });
  });

  test("formatJobTypeLabel: missing jobType", () => {
    const { t, tMock } = makeT();

    expect(formatJobTypeLabel(t, "")).toBe("vacancy.jobTypeNotSpecified");
    expect(tMock).toHaveBeenCalledWith("vacancy.jobTypeNotSpecified");
  });

  test("formatJobTypeLabel: builds key from jobType", () => {
    const { t, tMock } = makeT();

    const out = formatJobTypeLabel(t, "fullTime");
    expect(out).toBe("vacancy.jobType_fullTime");
    expect(tMock).toHaveBeenCalledWith("vacancy.jobType_fullTime");
  });
});

describe("useHomeFormatters: salary", () => {
  test("no salary specified", () => {
    const { t, tMock } = makeT();

    expect(formatSalaryLabel(t, null, null)).toBe("vacancy.salaryNotSpecified");
    expect(tMock).toHaveBeenCalledWith("vacancy.salaryNotSpecified");
  });

  test("salary range", () => {
    const { t, tMock } = makeT();

    const out = formatSalaryLabel(t, 1000, 2000);
    expect(out).toBe('vacancy.salaryRange:{"from":1000,"to":2000}');
    expect(tMock).toHaveBeenCalledWith("vacancy.salaryRange", { from: 1000, to: 2000 });
  });

  test("salary from only", () => {
    const { t, tMock } = makeT();

    const out = formatSalaryLabel(t, 1500, null);
    expect(out).toBe('vacancy.salaryFrom:{"from":1500}');
    expect(tMock).toHaveBeenCalledWith("vacancy.salaryFrom", { from: 1500 });
  });

  test("salary to only", () => {
    const { t, tMock } = makeT();

    const out = formatSalaryLabel(t, null, 2500);
    expect(out).toBe('vacancy.salaryTo:{"to":2500}');
    expect(tMock).toHaveBeenCalledWith("vacancy.salaryTo", { to: 2500 });
  });
});

describe("useHomeFormatters: posted date", () => {
  test("missing date returns dash", () => {
    const { t } = makeT();

    expect(formatPostedLabel(t, null)).toBe("—");
    expect(formatPostedLabel(t, undefined)).toBe("—");
    expect(formatPostedLabel(t, "")).toBe("—");
  });

  test("invalid date formats via t with dash date", () => {
    const { t, tMock } = makeT();

    const out = formatPostedLabel(t, "invalid-date");
    expect(out).toBe('vacancy.postedDate:{"date":"—"}');
    expect(tMock).toHaveBeenCalledWith("vacancy.postedDate", { date: "—" });
  });

  test("valid date formats via t", () => {
    const { t, tMock } = makeT();

    const iso = "2024-01-10T00:00:00.000Z";
    const date = new Date(iso).toLocaleDateString();

    const out = formatPostedLabel(t, iso);
    expect(out).toBe(`vacancy.postedDate:${JSON.stringify({ date })}`);
    expect(tMock).toHaveBeenCalledWith("vacancy.postedDate", { date });
  });
});

describe("useHomeFormatters: isNewByCreatedAt", () => {
  test("missing or invalid date is not new", () => {
    expect(isNewByCreatedAt(null)).toBe(false);
    expect(isNewByCreatedAt(undefined)).toBe(false);
    expect(isNewByCreatedAt("")).toBe(false);
    expect(isNewByCreatedAt("invalid")).toBe(false);
  });

  test("date within 3 days is new", () => {
    const now = Date.now();
    const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString();

    expect(isNewByCreatedAt(twoDaysAgo)).toBe(true);
  });

  test("date older than 3 days is not new", () => {
    const now = Date.now();
    const fourDaysAgo = new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString();

    expect(isNewByCreatedAt(fourDaysAgo)).toBe(false);
  });
});
