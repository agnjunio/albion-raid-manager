import {
  GetServer,
  GetServerChannels,
  GetServerMembers,
  GetServerSettings,
  GetServers,
  VerifyServer,
} from "@albion-raid-manager/types/api";
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
    addServer: builder.mutation<VerifyServer.Response, { body: VerifyServer.Body }>({
      query: ({ body }) => ({ url: `/servers`, method: "POST", data: body }),
      invalidatesTags: [{ type: "Server", id: "LIST" }],
    }),
    getServerMembers: builder.query<GetServerMembers.Response, { params: GetServerMembers.Params }>({
      query: ({ params }) => ({ url: `/servers/${params.serverId}/members` }),
      providesTags: (result, _error, { params }) =>
        result ? [{ type: "Server", id: `MEMBERS:${params.serverId}:LIST` }] : [],
    }),
    getServerSettings: builder.query<GetServerSettings.Response, { params: GetServerSettings.Params }>({
      query: ({ params }) => ({ url: `/servers/${params.serverId}/settings` }),
      providesTags: (result, _error, { params }) =>
        result ? [{ type: "Server", id: `SETTINGS:${params.serverId}` }] : [],
    }),
    getServerChannels: builder.query<GetServerChannels.Response, { params: GetServerChannels.Params }>({
      query: ({ params }) => ({ url: `/servers/${params.serverId}/channels` }),
      providesTags: (result, _error, { params }) =>
        result ? [{ type: "Server", id: `CHANNELS:${params.serverId}:LIST` }] : [],
    }),
  }),
});

export const {
  useGetServersQuery,
  useGetServerQuery,
  useAddServerMutation,
  useGetServerMembersQuery,
  useGetServerSettingsQuery,
  useGetServerChannelsQuery,
} = serversApi;
