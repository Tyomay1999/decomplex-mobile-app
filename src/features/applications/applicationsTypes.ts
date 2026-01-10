export type ApplicationStatus = "applied" | "reviewed" | "rejected" | "accepted";

export type ApplicationDto = {
  id: string;
  vacancyId: string;
  candidateId: string;
  cvFilePath: string;
  coverLetter: string | null;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
};

export type ListMyApplicationsResponseDto = {
  success: true;
  data: {
    items: ApplicationDto[];
    nextCursor: string | null;
  };
};
