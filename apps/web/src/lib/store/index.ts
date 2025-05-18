import type { AxiosRequestConfig } from "axios";

import { APIResponse } from "@albion-raid-manager/core/types/api";
import { configureStore } from "@reduxjs/toolkit";

import { apiClient } from "@/lib/api";

import { authApi } from "./auth";
import { guildsApi } from "./guilds";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [guildsApi.reducerPath]: guildsApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authApi.middleware, guildsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const baseQuery = async (args: AxiosRequestConfig) => {
  try {
    const response = await apiClient.request(args);
    const data = response.data as APIResponse.Type<unknown>;
    if (APIResponse.isError(data)) {
      throw new Error(data.type);
    }

    return { data: data.data };
  } catch (error) {
    return { error };
  }
};
