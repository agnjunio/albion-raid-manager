import type { GetServersResponse } from "@albion-raid-manager/core/types/api/servers";

import { createApi } from "@reduxjs/toolkit/query/react";

import { apiRTKRequest } from "@/lib/api";

export const serversApi = createApi({
  reducerPath: "servers",
  baseQuery: apiRTKRequest,
  endpoints: (builder) => ({
    getServers: builder.query<GetServersResponse, void>({
      query: () => ({ url: "/servers" }),
    }),
  }),
});

export const { useGetServersQuery } = serversApi;
