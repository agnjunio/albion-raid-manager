import type { CreateRaid, DeleteRaid, GetRaid, GetRaids, UpdateRaid } from "@albion-raid-manager/types/api";

import { createApi } from "@reduxjs/toolkit/query/react";

import { apiRTKRequest, createTagHelper } from "@/lib/api";

export const raidsApi = createApi({
  reducerPath: "raids",
  baseQuery: apiRTKRequest,
  tagTypes: ["Raid"],
  endpoints: (builder) => {
    const tagHelper = createTagHelper("Raid");
    return {
      getRaids: builder.query<GetRaids.Response, { params: GetRaids.Params }>({
        query: ({ params }) => ({
          url: `/servers/${params.serverId}/raids`,
        }),
        providesTags: tagHelper.list("raids"),
      }),
      getRaid: builder.query<GetRaid.Response, { params: GetRaid.Params; query?: GetRaid.Query }>({
        query: ({ params, query }) => ({
          url: `/servers/${params.serverId}/raids/${params.raidId}`,
          params: {
            ...query,
          },
        }),
        providesTags: tagHelper.single("raid"),
      }),
      createRaid: builder.mutation<CreateRaid.Response, { params: CreateRaid.Params; body: CreateRaid.Body }>({
        query: ({ params, body }) => ({
          url: `/servers/${params.serverId}/raids`,
          method: "POST",
          data: body,
        }),
        invalidatesTags: tagHelper.list("raids"),
      }),
      updateRaid: builder.mutation<UpdateRaid.Response, { params: UpdateRaid.Params; body: UpdateRaid.Body }>({
        query: ({ params, body }) => ({
          url: `/servers/${params.serverId}/raids/${params.raidId}`,
          method: "PUT",
          data: body,
        }),
        invalidatesTags: tagHelper.single("raid"),
      }),
      deleteRaid: builder.mutation<DeleteRaid.Response, { params: DeleteRaid.Params }>({
        query: ({ params }) => ({
          url: `/servers/${params.serverId}/raids/${params.raidId}`,
          method: "DELETE",
        }),
        invalidatesTags: tagHelper.list("raids"),
      }),
    };
  },
});

export const {
  useGetRaidsQuery,
  useGetRaidQuery,
  useCreateRaidMutation,
  useUpdateRaidMutation,
  useDeleteRaidMutation,
} = raidsApi;
