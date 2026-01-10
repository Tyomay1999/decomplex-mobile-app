export type VacancyJobType = "full_time" | "part_time" | "remote" | "hybrid";
export type VacancyStatus = "active" | "archived";

export type VacancyDto = {
  id: string;

  title?: string | null;
  description?: string | null;
  location?: string | null;
  companyId?: string | null;

  jobType?: string | null;
  salaryFrom?: number | null;
  salaryTo?: number | null;

  status?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;

  applied?: boolean;
  isApplied?: boolean;
  hasApplied?: boolean;
  myApplicationId?: string | null;
};

export type VacancyDetailsDto = VacancyDto & {
  status: VacancyStatus;
  updatedAt: string;
  createdById?: string | null;
};

export type ListVacanciesArgs = {
  q?: string;
  status?: VacancyStatus;
  jobType?: VacancyJobType;
  limit?: number;
  cursor?: string;
  salaryOnly?: boolean;
  newOnly?: boolean;
};

export type ListVacanciesResponseDto = {
  success: true;
  data: {
    vacancies: VacancyDto[];
    nextCursor: string | null;
  };
};

export type GetVacancyResponseDto =
  | {
      success: true;
      data: VacancyDetailsDto;
    }
  | {
      success: true;
      data: { vacancy: VacancyDetailsDto };
    };

export type ApplyToVacancyResponseDto = {
  success: true;
  data: unknown;
};
