import type { GetGuildRaids, GetGuildsResponse } from "@albion-raid-manager/core/types/api/guilds";

import { createApi } from "@reduxjs/toolkit/query/react";

import { apiRTKRequest } from "@/lib/api";

export const guildsApi = createApi({
  reducerPath: "guilds",
  baseQuery: apiRTKRequest,
  endpoints: (builder) => ({
    getGuilds: builder.query<GetGuildsResponse, void>({
      query: () => ({
        url: "/guilds",
      }),
    }),

    getGuildRaids: builder.query<GetGuildRaids.Response, { params: GetGuildRaids.Params }>({
      query: ({ params }) => ({
        url: `/guilds/${params.guildId}/raids`,
      }),
    }),
  }),
});

export const { useGetGuildsQuery, useGetGuildRaidsQuery } = guildsApi;
