import type { TFunction } from "i18next";

function shortId(id: string, take = 6) {
  if (!id) return "";
  return `${id.slice(0, take)}…`;
}

export function formatCompanyLabel(t: TFunction, companyId: string | null | undefined) {
  if (!companyId) return t("vacancy.companyNotSpecified");
  return t("vacancy.companyIdShort", { id: shortId(companyId) });
}

export function formatJobTypeLabel(t: TFunction, jobType: string | null | undefined) {
  if (!jobType) return t("vacancy.jobTypeNotSpecified");
  return t(`vacancy.jobType_${jobType}`);
}

export function formatSalaryLabel(
  t: TFunction,
  salaryFrom: number | null | undefined,
  salaryTo: number | null | undefined,
) {
  const from = salaryFrom ?? null;
  const to = salaryTo ?? null;

  if (from == null && to == null) return t("vacancy.salaryNotSpecified");
  if (from != null && to != null) return t("vacancy.salaryRange", { from, to });
  if (from != null) return t("vacancy.salaryFrom", { from });
  return t("vacancy.salaryTo", { to });
}

export function formatPostedLabel(t: TFunction, createdAtIso: string | null | undefined) {
  if (!createdAtIso) return "—";
  const d = new Date(createdAtIso);
  const date = Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
  return t("vacancy.postedDate", { date });
}

export function isNewByCreatedAt(createdAtIso: string | null | undefined): boolean {
  if (!createdAtIso) return false;
  const created = new Date(createdAtIso).getTime();
  if (Number.isNaN(created)) return false;
  const diffDays = (Date.now() - created) / (1000 * 60 * 60 * 24);
  return diffDays <= 3;
}
