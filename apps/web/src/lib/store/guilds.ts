import type { GetGuildsResponse } from "@albion-raid-manager/core/types/api/guilds";

import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQuery } from "./baseQuery";

export const guildsApi = createApi({
  reducerPath: "guildsApi",
  baseQuery,
  endpoints: (builder) => ({
    getGuilds: builder.query<GetGuildsResponse, void>({
      query: () => ({
        url: "/guilds",
      }),
    }),
  }),
});

export const { useGetGuildsQuery } = guildsApi;
