import { api } from "../../api/api";
import type { ApplicationDto, ListMyApplicationsResponseDto } from "./applicationsTypes";

export type ListMyApplicationsArgs = {
    limit?: number;
    cursor?: string;
};

export const applicationsApi = api.injectEndpoints({
    endpoints: (build) => ({
        listMyApplications: build.query<
            { items: ApplicationDto[]; nextCursor: string | null },
            ListMyApplicationsArgs | void
            >({
            query: (args) => {
                const params = new URLSearchParams();
                if (typeof args?.limit === "number") params.set("limit", String(args.limit));
                if (args?.cursor) params.set("cursor", args.cursor);

                const qs = params.toString();

                return {
                    url: `/applications/my${qs ? `?${qs}` : ""}`,
                    method: "GET",
                };
            },
            transformResponse: (raw: ListMyApplicationsResponseDto) => ({
                items: raw.data.items,
                nextCursor: raw.data.nextCursor,
            }),
            providesTags: (result) =>
                result?.items?.length
                    ? [
                        { type: "Application" as const, id: "LIST" },
                        ...result.items.map((x) => ({ type: "Application" as const, id: x.id })),
                    ]
                    : [{ type: "Application" as const, id: "LIST" }],
        }),
    }),
    overrideExisting: false,
});

export const { useLazyListMyApplicationsQuery } = applicationsApi;