import type { DiscordCallbackRequest, GetMeResponse } from "@albion-raid-manager/core/types/api/auth";

import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQuery } from "./baseQuery";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  endpoints: (builder) => ({
    getMe: builder.query<GetMeResponse, void>({
      query: () => ({ url: "/auth/me" }),
    }),
    discordCallback: builder.mutation<void, DiscordCallbackRequest>({
      query: ({ code, redirectUri }) => ({
        url: "/auth/discord/callback",
        method: "POST",
        data: { code, redirectUri },
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const { useGetMeQuery, useLogoutMutation, useDiscordCallbackMutation } = authApi;
