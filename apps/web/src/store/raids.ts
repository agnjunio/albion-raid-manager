import type { CreateRaid, GetRaid, GetRaids, UpdateGuildRaid } from "@albion-raid-manager/core/types/api/raids";

import { createApi } from "@reduxjs/toolkit/query/react";

import { apiRTKRequest, createTagHelper } from "@/lib/api";

export const raidsApi = createApi({
  reducerPath: "raids",
  baseQuery: apiRTKRequest,
  tagTypes: ["Raid"],
  endpoints: (builder) => {
    const tagHelper = createTagHelper("Raid");
    return {
      getRaids: builder.query<GetRaids.Response, { params: GetRaids.Params }>({
        query: ({ params }) => ({
          url: `/servers/${params.serverId}/raids`,
        }),
        providesTags: tagHelper.list("raids"),
      }),
      getRaid: builder.query<GetRaid.Response, { params: GetRaid.Params; query?: GetRaid.Query }>({
        query: ({ params, query }) => ({
          url: `/servers/${params.serverId}/raids/${params.raidId}`,
          params: {
            ...query,
          },
        }),
        providesTags: tagHelper.single("raid"),
      }),
      createRaid: builder.mutation<CreateRaid.Response, { params: CreateRaid.Params; body: CreateRaid.Body }>({
        query: ({ params, body }) => ({
          url: `/servers/${params.serverId}/raids`,
          method: "POST",
          data: body,
        }),
        invalidatesTags: tagHelper.list("raids"),
      }),
      updateRaid: builder.mutation<
        UpdateGuildRaid.Response,
        { params: UpdateGuildRaid.Params; body: UpdateGuildRaid.Body }
      >({
        query: ({ params, body }) => ({
          url: `/servers/${params.serverId}/raids/${params.raidId}`,
          method: "PUT",
          data: body,
        }),
        invalidatesTags: tagHelper.single("raid"),
      }),
    };
  },
});

export const { useGetRaidsQuery, useGetRaidQuery, useCreateRaidMutation, useUpdateRaidMutation } = raidsApi;
