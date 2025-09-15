import { GetServer, GetServerMembers, GetServers, SetupServer } from "@albion-raid-manager/types/api";
import { createApi } from "@reduxjs/toolkit/query/react";

import { apiRTKRequest } from "@/lib/api";

export const serversApi = createApi({
  reducerPath: "servers",
  baseQuery: apiRTKRequest,
  tagTypes: ["Server"],
  endpoints: (builder) => ({
    getServers: builder.query<GetServers.Response, void>({
      query: () => ({ url: "/servers" }),
      providesTags: (result) => (result ? [{ type: "Server", id: "LIST" }] : []),
    }),
    getServer: builder.query<GetServer.Response, { params: GetServer.Params }>({
      query: ({ params }) => ({ url: `/servers/${params.serverId}` }),
      providesTags: (result) => (result ? [{ type: "Server", id: result.server.id }] : []),
    }),
    addServer: builder.mutation<SetupServer.Response, { body: SetupServer.Body }>({
      query: ({ body }) => ({ url: `/servers`, method: "POST", data: body }),
      invalidatesTags: [{ type: "Server", id: "LIST" }],
    }),
    getServerMembers: builder.query<GetServerMembers.Response, { params: GetServerMembers.Params }>({
      query: ({ params }) => ({ url: `/servers/${params.serverId}/members` }),
      providesTags: (result, _error, { params }) =>
        result ? [{ type: "Server", id: `MEMBERS:${params.serverId}:LIST` }] : [],
    }),
  }),
});

export const { useGetServersQuery, useGetServerQuery, useAddServerMutation, useGetServerMembersQuery } = serversApi;
