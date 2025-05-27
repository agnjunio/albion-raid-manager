import type { Guild } from "@albion-raid-manager/core/types";
import type { GetGuildResponse, GetGuildsResponse } from "@albion-raid-manager/core/types/api/guilds";

import { createApi } from "@reduxjs/toolkit/query/react";

import { apiRTKRequest, provideEntityTag } from "@/lib/api";

export const guildsApi = createApi({
  reducerPath: "guilds",
  baseQuery: apiRTKRequest,
  tagTypes: ["Guild"],
  endpoints: (builder) => ({
    getGuilds: builder.query<GetGuildsResponse, void>({
      query: () => ({
        url: "/guilds",
      }),
      providesTags: provideEntityTag<Guild, "Guild">("Guild").list,
    }),
    getGuild: builder.query<GetGuildResponse, string>({
      query: (guildId) => ({
        url: `/guilds/${guildId}`,
      }),
      providesTags: provideEntityTag<Guild, "Guild">("Guild").single,
    }),
  }),
});

export const { useGetGuildsQuery, useGetGuildQuery } = guildsApi;
