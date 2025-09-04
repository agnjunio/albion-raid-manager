import { AddServer, GetServers } from "@albion-raid-manager/core/types/api/servers";
import { createApi } from "@reduxjs/toolkit/query/react";

import { apiRTKRequest } from "@/lib/api";

export const serversApi = createApi({
  reducerPath: "servers",
  baseQuery: apiRTKRequest,
  endpoints: (builder) => ({
    getServers: builder.query<GetServers.Response, void>({
      query: () => ({ url: "/servers" }),
    }),
    addServer: builder.mutation<AddServer.Response, { body: AddServer.Body }>({
      query: ({ body }) => ({ url: `/servers`, method: "POST", data: body }),
    }),
  }),
});

export const { useGetServersQuery, useAddServerMutation } = serversApi;
