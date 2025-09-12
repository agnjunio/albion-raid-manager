import type { SearchItems } from "@albion-raid-manager/types/api";

import { createApi } from "@reduxjs/toolkit/query/react";

import { apiRTKRequest } from "@/lib/api";

export const itemsApi = createApi({
  reducerPath: "items",
  baseQuery: apiRTKRequest,
  tagTypes: ["Item"],
  endpoints: (builder) => {
    return {
      searchItems: builder.query<SearchItems.Response, { query: SearchItems.Query }>({
        query: ({ query }) => ({
          url: "/items/search",
          params: query,
        }),
        providesTags: (_result, _error, { query }) => [{ type: "Item", id: `search:${query.q}` }],
        keepUnusedDataFor: 300,
      }),
    };
  },
});

export const { useSearchItemsQuery } = itemsApi;
