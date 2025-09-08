import { GetServer, GetServers, SetupServer } from "@albion-raid-manager/types/api";
import { createApi } from "@reduxjs/toolkit/query/react";

import { apiRTKRequest } from "@/lib/api";

export const serversApi = createApi({
  reducerPath: "servers",
  baseQuery: apiRTKRequest,
  endpoints: (builder) => ({
    getServers: builder.query<GetServers.Response, void>({
      query: () => ({ url: "/servers" }),
    }),
    getServer: builder.query<GetServer.Response, { params: GetServer.Params }>({
      query: ({ params }) => ({ url: `/servers/${params.serverId}` }),
    }),
    addServer: builder.mutation<SetupServer.Response, { body: SetupServer.Body }>({
      query: ({ body }) => ({ url: `/servers`, method: "POST", data: body }),
    }),
  }),
});

export const { useGetServersQuery, useGetServerQuery, useAddServerMutation } = serversApi;
