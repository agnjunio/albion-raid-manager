import type {
  CreateRaid,
  CreateRaidSlot,
  DeleteRaid,
  DeleteRaidSlot,
  GetRaid,
  GetRaids,
  UpdateRaid,
  UpdateRaidSlot,
} from "@albion-raid-manager/types/api";

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
      createRaidSlot: builder.mutation<
        CreateRaidSlot.Response,
        { params: CreateRaidSlot.Params; body: CreateRaidSlot.Body }
      >({
        query: ({ params, body }) => ({
          url: `/servers/${params.serverId}/raids/${params.raidId}/slots`,
          method: "POST",
          data: body,
        }),
        invalidatesTags: (_result, _error, { params }) => [{ type: "Raid", id: params.raidId }],
      }),
      updateRaidSlot: builder.mutation<
        UpdateRaidSlot.Response,
        { params: { serverId: string } & UpdateRaidSlot.Params; body: UpdateRaidSlot.Body }
      >({
        query: ({ params, body }) => ({
          url: `/servers/${params.serverId}/raids/${params.raidId}/slots/${params.slotId}`,
          method: "PUT",
          data: body,
        }),
        invalidatesTags: (_result, _error, { params }) => [{ type: "Raid", id: params.raidId }],
      }),
      deleteRaidSlot: builder.mutation<
        DeleteRaidSlot.Response,
        { params: { serverId: string } & DeleteRaidSlot.Params }
      >({
        query: ({ params }) => ({
          url: `/servers/${params.serverId}/raids/${params.raidId}/slots/${params.slotId}`,
          method: "DELETE",
        }),
        invalidatesTags: (_result, _error, { params }) => [{ type: "Raid", id: params.raidId }],
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
  useCreateRaidSlotMutation,
  useUpdateRaidSlotMutation,
  useDeleteRaidSlotMutation,
} = raidsApi;
