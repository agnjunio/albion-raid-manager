import type { Composition } from "@albion-raid-manager/core/types";
import type { GetGuildCompositions } from "@albion-raid-manager/core/types/api/compositions";

import { createApi } from "@reduxjs/toolkit/query/react";

import { apiRTKRequest, provideEntityTag } from "@/lib/api";

export const compositionsApi = createApi({
  reducerPath: "compositions",
  baseQuery: apiRTKRequest,
  tagTypes: ["Composition"],
  endpoints: (builder) => ({
    getGuildCompositions: builder.query<GetGuildCompositions.Response, { params: GetGuildCompositions.Params }>({
      query: ({ params }) => ({
        url: `/guilds/${params.guildId}/compositions`,
      }),
      providesTags: provideEntityTag<Composition, "Composition">("Composition").list,
    }),
  }),
});

export const { useGetGuildCompositionsQuery } = compositionsApi;
