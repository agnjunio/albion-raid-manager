import type {
  GetServersResponse,
  VerifyServerRequest,
  VerifyServerResponse,
} from "@albion-raid-manager/core/types/api/servers";

import { createApi } from "@reduxjs/toolkit/query/react";

import { apiRTKRequest } from "@/lib/api";

export const serversApi = createApi({
  reducerPath: "servers",
  baseQuery: apiRTKRequest,
  endpoints: (builder) => ({
    getServers: builder.query<GetServersResponse, void>({
      query: () => ({ url: "/servers" }),
    }),
    verifyServer: builder.mutation<VerifyServerResponse, VerifyServerRequest>({
      query: ({ serverId }) => ({ url: `/servers/${serverId}/verify` }),
    }),
  }),
});

export const { useGetServersQuery, useVerifyServerMutation } = serversApi;
