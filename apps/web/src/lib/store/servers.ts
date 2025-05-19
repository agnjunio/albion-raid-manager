import type { GetServersResponse } from "@albion-raid-manager/core/types/api/servers";

import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQuery } from "./baseQuery";

export const serversApi = createApi({
  reducerPath: "serversApi",
  baseQuery,
  endpoints: (builder) => ({
    getServers: builder.query<GetServersResponse, void>({
      query: () => ({ url: "/servers" }),
    }),
  }),
});

export const { useGetServersQuery } = serversApi;
