import type {
  AddServerRequest,
  AddServerResponse,
  GetServersResponse,
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
    addServer: builder.mutation<AddServerResponse, AddServerRequest.Body>({
      query: (data) => ({ url: `/servers`, method: "POST", data }),
    }),
  }),
});

export const { useGetServersQuery, useAddServerMutation } = serversApi;
