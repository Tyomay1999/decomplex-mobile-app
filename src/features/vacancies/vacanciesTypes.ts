export type VacancyJobType = "full_time" | "part_time" | "remote" | "hybrid";
export type VacancyStatus = "active" | "archived";

export type VacancyDto = {
  id: string;
  companyId: string;
  title: string;
  description: string;
  salaryFrom: number | null;
  salaryTo: number | null;
  jobType: VacancyJobType;
  location: string | null;
  createdAt: string;
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
