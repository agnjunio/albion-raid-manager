import type { Raid } from "@albion-raid-manager/core/types";
import type { CreateGuildRaid, GetGuildRaids } from "@albion-raid-manager/core/types/api/raids";

import { createApi } from "@reduxjs/toolkit/query/react";

import { apiRTKRequest, provideEntityTag } from "@/lib/api";

export const raidsApi = createApi({
  reducerPath: "raids",
  baseQuery: apiRTKRequest,
  tagTypes: ["Raid"],
  endpoints: (builder) => ({
    getGuildRaids: builder.query<GetGuildRaids.Response, { params: GetGuildRaids.Params }>({
      query: ({ params }) => ({
        url: `/guilds/${params.guildId}/raids`,
      }),
      providesTags: provideEntityTag<Raid, "Raid">("Raid").list,
    }),
    createGuildRaid: builder.mutation<
      CreateGuildRaid.Response,
      { params: CreateGuildRaid.Params; body: CreateGuildRaid.Body }
    >({
      query: ({ params, body }) => ({
        url: `/guilds/${params.guildId}/raids`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "Raid", id: "LIST" }],
    }),
  }),
});

export const { useGetGuildRaidsQuery, useCreateGuildRaidMutation } = raidsApi;
