import { api } from "../../api/api";
import type {
  ApplyToVacancyResponseDto,
  GetVacancyResponseDto,
  VacancyDetailsDto,
  VacancyDto,
  ListVacanciesArgs,
  ListVacanciesResponseDto,
} from "./vacanciesTypes";

type VacancyDetailsApiPayload = VacancyDetailsDto | { vacancy: VacancyDetailsDto };

function hasVacancyKey(v: VacancyDetailsApiPayload): v is { vacancy: VacancyDetailsDto } {
  return typeof v === "object" && v !== null && "vacancy" in v;
}

function normalizeDetails(raw: GetVacancyResponseDto): VacancyDetailsDto {
  const payload: VacancyDetailsApiPayload = raw.data;

  const vacancy = hasVacancyKey(payload) ? payload.vacancy : payload;

  return {
    ...vacancy,
    location: vacancy.location ?? null,
    salaryFrom: vacancy.salaryFrom ?? null,
    salaryTo: vacancy.salaryTo ?? null,
  };
}

export type ApplyToVacancyArgs = {
  vacancyId: string;
  formData: FormData;
};

export const vacanciesApi = api.injectEndpoints({
  endpoints: (build) => ({
    listVacancies: build.query<
      { items: VacancyDto[]; nextCursor: string | null },
      ListVacanciesArgs | void
    >({
      query: (args) => {
        const params = new URLSearchParams();

        if (args?.q) params.set("q", args.q);
        if (args?.status) params.set("status", args.status);
        if (args?.jobType) params.set("jobType", args.jobType);
        if (typeof args?.limit === "number") params.set("limit", String(args.limit));
        if (args?.cursor) params.set("cursor", args.cursor);

        const qs = params.toString();

        return {
          url: `/vacancies${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      transformResponse: (raw: ListVacanciesResponseDto) => ({
        items: raw.data.vacancies,
        nextCursor: raw.data.nextCursor,
      }),
      providesTags: (result) =>
        result?.items?.length
          ? [
              { type: "Vacancy" as const, id: "LIST" },
              ...result.items.map((v) => ({ type: "Vacancy" as const, id: v.id })),
            ]
          : [{ type: "Vacancy" as const, id: "LIST" }],
    }),

    getVacancyById: build.query<VacancyDetailsDto, string>({
      query: (id) => ({
        url: `/vacancies/${id}`,
        method: "GET",
      }),
      transformResponse: (raw: GetVacancyResponseDto) => normalizeDetails(raw),
      providesTags: (_res, _err, id) => [{ type: "Vacancy" as const, id }],
    }),

    applyToVacancy: build.mutation<ApplyToVacancyResponseDto, ApplyToVacancyArgs>({
      query: ({ vacancyId, formData }) => ({
        url: `/vacancies/${vacancyId}/apply`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (_res, _err, args) => [
        { type: "Vacancy" as const, id: args.vacancyId },
        { type: "Vacancy" as const, id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const { useLazyListVacanciesQuery, useGetVacancyByIdQuery, useApplyToVacancyMutation } =
  vacanciesApi;
