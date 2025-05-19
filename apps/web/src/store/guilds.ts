import type { GetGuildsResponse } from "@albion-raid-manager/core/types/api/guilds";

import { createApi } from "@reduxjs/toolkit/query/react";

import { apiRequest } from "@/lib/api";

export const guildsApi = createApi({
  reducerPath: "guilds",
  baseQuery: apiRequest,
  endpoints: (builder) => ({
    getGuilds: builder.query<GetGuildsResponse, void>({
      query: () => ({
        url: "/guilds",
      }),
    }),
  }),
});

export const { useGetGuildsQuery } = guildsApi;
