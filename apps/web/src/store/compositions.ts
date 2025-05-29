import type { GetGuildCompositions } from "@albion-raid-manager/core/types/api/compositions";

import { createApi } from "@reduxjs/toolkit/query/react";

import { apiRTKRequest, createTagHelper } from "@/lib/api";

export const compositionsApi = createApi({
  reducerPath: "compositions",
  baseQuery: apiRTKRequest,
  tagTypes: ["Composition"],
  endpoints: (builder) => {
    const tagHelper = createTagHelper("Composition");
    return {
      getGuildCompositions: builder.query<GetGuildCompositions.Response, { params: GetGuildCompositions.Params }>({
        query: ({ params }) => ({
          url: `/guilds/${params.guildId}/compositions`,
        }),
        providesTags: tagHelper.list("compositions"),
      }),
    };
  },
});

export const { useGetGuildCompositionsQuery } = compositionsApi;
