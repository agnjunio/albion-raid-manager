import type { GetGuildResponse, GetGuildsResponse } from "@albion-raid-manager/core/types/api/guilds";

import { createApi } from "@reduxjs/toolkit/query/react";

import { apiRTKRequest, createTagHelper } from "@/lib/api";

export const guildsApi = createApi({
  reducerPath: "guilds",
  baseQuery: apiRTKRequest,
  tagTypes: ["Guild"],
  endpoints: (builder) => {
    const tagHelper = createTagHelper("Guild");
    return {
      getGuilds: builder.query<GetGuildsResponse, void>({
        query: () => ({
          url: "/guilds",
        }),
        providesTags: tagHelper.list("guilds"),
      }),
      getGuild: builder.query<GetGuildResponse, string>({
        query: (guildId) => ({
          url: `/guilds/${guildId}`,
        }),
        providesTags: tagHelper.single("guild"),
      }),
    };
  },
});

export const { useGetGuildsQuery, useGetGuildQuery } = guildsApi;
