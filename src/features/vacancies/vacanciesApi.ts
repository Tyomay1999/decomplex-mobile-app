import { api } from "../../api/api";
import type { VacancyDto, VacancyJobType, VacancyStatus } from "./vacanciesTypes";

type VacancyEntity = {
  id: string;
  companyId: string;
  createdById: string | null;
  title: string;
  description: string;
  salaryFrom: number | null;
  salaryTo: number | null;
  jobType: VacancyJobType;
  location: string | null;
  status: VacancyStatus;
  createdAt: string;
  updatedAt: string;
};

type ListVacanciesResponse = {
  success: true;
  data: {
    vacancies: VacancyEntity[];
  };
};

export type ListVacanciesArgs = {
  companyId?: string;
  status?: VacancyStatus;
  jobType?: VacancyJobType;
};

function mapEntityToDto(v: VacancyEntity): VacancyDto {
  return {
    id: v.id,
    companyId: v.companyId,
    createdById: v.createdById,

    title: v.title,
    description: v.description,

    salaryFrom: v.salaryFrom,
    salaryTo: v.salaryTo,

    jobType: v.jobType,
    location: v.location ?? null,
    status: v.status,

    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
  };
}

export const vacanciesApi = api.injectEndpoints({
  endpoints: (build) => ({
    listVacancies: build.query<VacancyDto[], ListVacanciesArgs | void>({
      query: (args) => {
        const params = new URLSearchParams();

        if (args?.companyId) params.set("companyId", args.companyId);
        if (args?.status) params.set("status", args.status);
        if (args?.jobType) params.set("jobType", args.jobType);

        const qs = params.toString();

        return {
          url: `/vacancies${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      transformResponse: (raw: ListVacanciesResponse) => raw.data.vacancies.map(mapEntityToDto),
      providesTags: (result) =>
        result
          ? [
              { type: "Vacancy" as const, id: "LIST" },
              ...result.map((v) => ({ type: "Vacancy" as const, id: v.id })),
            ]
          : [{ type: "Vacancy" as const, id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const { useListVacanciesQuery } = vacanciesApi;
