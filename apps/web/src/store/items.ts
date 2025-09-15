import type { GetItem, SearchItems } from "@albion-raid-manager/types/api";

import { createApi } from "@reduxjs/toolkit/query/react";

import { apiRTKRequest } from "@/lib/api";
import { getCurrentLanguage } from "@/lib/locale";

export const itemsApi = createApi({
  reducerPath: "items",
  baseQuery: apiRTKRequest,
  tagTypes: ["Item"],
  endpoints: (builder) => {
    return {
      searchItems: builder.query<SearchItems.Response, { query: SearchItems.Query }>({
        query: ({ query }) => ({
          url: "/items/search",
          params: {
            ...query,
            language: getCurrentLanguage(),
          },
        }),
        providesTags: (_result, _error, { query }) => [{ type: "Item", id: `search:${query.q}` }],
        keepUnusedDataFor: 315360000, // 1 year
      }),
      getItem: builder.query<GetItem.Response, { id: string }>({
        query: ({ id }) => ({
          url: `/items/${id}`,
        }),
        providesTags: (_result, _error, { id }) => [{ type: "Item", id }],
        keepUnusedDataFor: 315360000, // 1 year
      }),
    };
  },
});

export const { useSearchItemsQuery, useGetItemQuery } = itemsApi;
