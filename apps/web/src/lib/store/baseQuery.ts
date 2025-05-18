import type { AxiosRequestConfig } from "axios";

import { APIResponse } from "@albion-raid-manager/core/types/api";

import { apiClient } from "@/lib/api";

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
