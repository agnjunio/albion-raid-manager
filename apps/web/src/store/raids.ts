import type {
  CreateGuildRaid,
  GetGuildRaid,
  GetGuildRaids,
  UpdateGuildRaid,
} from "@albion-raid-manager/core/types/api/raids";

import { createApi } from "@reduxjs/toolkit/query/react";

import { apiRTKRequest, createTagHelper } from "@/lib/api";

export const raidsApi = createApi({
  reducerPath: "raids",
  baseQuery: apiRTKRequest,
  tagTypes: ["Raid"],
  endpoints: (builder) => {
    const tagHelper = createTagHelper("Raid");
    return {
      createGuildRaid: builder.mutation<
        CreateGuildRaid.Response,
        { params: CreateGuildRaid.Params; body: CreateGuildRaid.Body }
      >({
        query: ({ params, body }) => ({
          url: `/guilds/${params.guildId}/raids`,
          method: "POST",
          data: body,
        }),
        invalidatesTags: tagHelper.list("raids"),
      }),
      getGuildRaids: builder.query<GetGuildRaids.Response, { params: GetGuildRaids.Params }>({
        query: ({ params }) => ({
          url: `/guilds/${params.guildId}/raids`,
        }),
        providesTags: tagHelper.list("raids"),
      }),
      getGuildRaid: builder.query<GetGuildRaid.Response, { params: GetGuildRaid.Params }>({
        query: ({ params }) => ({
          url: `/guilds/${params.guildId}/raids/${params.raidId}`,
        }),
        providesTags: tagHelper.single("raid"),
      }),
      updateGuildRaid: builder.mutation<
        UpdateGuildRaid.Response,
        { params: UpdateGuildRaid.Params; body: UpdateGuildRaid.Body }
      >({
        query: ({ params, body }) => ({
          url: `/guilds/${params.guildId}/raids/${params.raidId}`,
          method: "PUT",
          data: body,
        }),
        invalidatesTags: tagHelper.single("raid"),
      }),
    };
  },
});

export const { useGetGuildRaidsQuery, useCreateGuildRaidMutation, useGetGuildRaidQuery, useUpdateGuildRaidMutation } =
  raidsApi;
