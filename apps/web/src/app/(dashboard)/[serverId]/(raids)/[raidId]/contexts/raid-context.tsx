import type { Raid, RaidSlot, RaidStatus } from "@albion-raid-manager/types";
import type { RaidConfiguration } from "@albion-raid-manager/types/entities";

import { createContext, useCallback, useContext, type ReactNode } from "react";

import { APIServerMember } from "@albion-raid-manager/types/api";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  useCreateRaidSlotMutation,
  useDeleteRaidMutation,
  useDeleteRaidSlotMutation,
  useGetRaidQuery,
  useImportRaidConfigurationMutation,
  useReorderRaidSlotsMutation,
  useUpdateRaidMutation,
  useUpdateRaidSlotMutation,
} from "@/store/raids";
import { useGetServerMembersQuery } from "@/store/servers";

interface RaidContextValue {
  raid: Raid | undefined;
  isLoading: boolean;
  error: unknown;
  serverMembers: APIServerMember[];
  hasStatus: (...statuses: RaidStatus[]) => boolean;
  handleCopyRaidLink: () => void;
  handleDeleteRaid: () => void;
  handleImportRaidConfiguration: (configuration: RaidConfiguration) => Promise<void>;
  handleRaidSlotCreate: (slot: Omit<RaidSlot, "id" | "createdAt" | "joinedAt" | "order">) => void;
  handleRaidSlotDelete: (slotId: string) => void;
  handleRaidSlotUpdate: (slotId: string, updates: Partial<RaidSlot>) => void;
  handleRaidSlotsReorder: (slotIds: string[]) => void;
  handleShareRaid: () => void;
  handleUpdateRaidNotes: (notes: string) => void;
  handleUpdateRaidStatus: (status: RaidStatus) => void;
  handleUpdateRaid: (updates: { title?: string; description?: string; date?: Date; location?: string }) => void;
  canManageRaid: boolean;
  isFlexRaid: boolean;
  currentSlotCount: number;
  maxSlots: number;
}

const RaidContext = createContext<RaidContextValue | undefined>(undefined);

interface RaidProviderProps {
  children: ReactNode;
  serverId: string;
  raidId: string;
  onSlotUpdate?: (slotId: string, updates: Partial<RaidSlot>) => void;
  onSlotDelete?: (slotId: string) => void;
  onSlotCreate?: (slot: Omit<RaidSlot, "id" | "createdAt" | "joinedAt">) => void;
}

export function RaidProvider({ children, serverId, raidId }: RaidProviderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [updateRaid] = useUpdateRaidMutation();
  const [deleteRaid] = useDeleteRaidMutation();
  const [createRaidSlot] = useCreateRaidSlotMutation();
  const [updateRaidSlot] = useUpdateRaidSlotMutation();
  const [deleteRaidSlot] = useDeleteRaidSlotMutation();
  const [reorderRaidSlots] = useReorderRaidSlotsMutation();
  const [importRaidConfiguration] = useImportRaidConfigurationMutation();

  // Get raid data - this will automatically update when cache is invalidated
  const {
    data: raidData,
    isLoading: isRaidLoading,
    error: raidError,
  } = useGetRaidQuery({
    params: {
      serverId,
      raidId,
    },
    query: {
      slots: true,
    },
  });

  // Get server members for member selection
  const { data } = useGetServerMembersQuery({
    params: { serverId },
  });

  const serverMembers = data?.members || [];

  // Define hasStatus callback - handle case where raid data might not be available yet
  const hasStatus = useCallback(
    (...statuses: RaidStatus[]) => {
      if (!raidData?.raid) return false;
      return statuses.includes(raidData.raid.status);
    },
    [raidData?.raid],
  );

  // Get raid data - will be undefined during loading or on error
  const raid = raidData?.raid;

  const canManageRaid = true; // TODO: Use the permission system to determine if the user has permission to edit raid
  const isFlexRaid = raid?.type === "FLEX";
  const currentSlotCount = raid?.slots?.length || 0;
  const maxSlots = raid?.maxPlayers || 0;

  const handleUpdateRaidStatus = async (status: RaidStatus) => {
    try {
      await updateRaid({
        params: {
          serverId,
          raidId,
        },
        body: { status },
      }).unwrap();

      toast.success(t("toasts.raid.statusUpdated"), {
        description: t("toasts.raid.statusUpdatedDescription", {
          status: t(`raids.raidStatus.${status.toLowerCase()}`).toUpperCase(),
        }),
      });
    } catch {
      toast.error(t("toasts.raid.statusUpdateError"), {
        description: t("toasts.raid.statusUpdateErrorDescription"),
      });
    }
  };

  const handleUpdateRaidNotes = async (notes: string) => {
    try {
      await updateRaid({
        params: {
          serverId,
          raidId,
        },
        body: { note: notes },
      }).unwrap();

      toast.success(t("toasts.raid.notesUpdated"));
    } catch {
      toast.error(t("toasts.raid.notesUpdateError"), {
        description: t("toasts.raid.notesUpdateErrorDescription"),
      });
    }
  };

  const handleUpdateRaid = async (updates: {
    title?: string;
    description?: string;
    date?: Date;
    location?: string;
  }) => {
    try {
      await updateRaid({
        params: {
          serverId,
          raidId,
        },
        body: updates,
      }).unwrap();

      toast.success(t("toasts.raid.updated"), {
        description: t("toasts.raid.updatedDescription"),
      });
    } catch {
      toast.error(t("toasts.raid.updateError"), {
        description: t("toasts.raid.updateErrorDescription"),
      });
    }
  };

  const handleCopyRaidLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success(t("toasts.raid.linkCopied"));
  };

  const handleShareRaid = () => {
    if (!raid) return;

    if (navigator.share) {
      navigator.share({
        title: raid.title,
        text: `Join ${raid.title} - ${new Date(raid.date).toLocaleString()}`,
        url: window.location.href,
      });
    } else {
      handleCopyRaidLink();
    }
  };

  const handleDeleteRaid = async () => {
    if (!raid) return;

    if (!window.confirm(t("toasts.confirmations.deleteRaid", { title: raid.title }))) {
      return;
    }

    try {
      await deleteRaid({
        params: {
          serverId,
          raidId,
        },
      }).unwrap();

      toast.success(t("toasts.raid.deleted"), {
        description: t("toasts.raid.deletedDescription", { title: raid?.title }),
      });

      navigate(`/dashboard/${serverId}/raids`);
    } catch {
      toast.error(t("toasts.raid.deleteError"), {
        description: t("toasts.raid.deleteErrorDescription"),
      });
    }
  };

  const handleRaidSlotCreate = async (slot: Omit<RaidSlot, "id" | "createdAt" | "joinedAt" | "order">) => {
    if (!raid) return;

    try {
      const currentSlotCount = raid?.slots?.length || 0;
      const requestBody = {
        name: slot.name,
        role: slot.role || undefined,
        comment: slot.comment ?? null,
        weapon: slot.weapon ?? null,
        userId: slot.userId ?? null,
        order: currentSlotCount,
      };
      await createRaidSlot({
        params: { serverId, raidId },
        body: requestBody,
      }).unwrap();

      toast.success(t("toasts.slot.created"));
    } catch {
      toast.error(t("toasts.slot.createError"), {
        description: t("toasts.slot.createErrorDescription"),
      });
    }
  };

  const handleRaidSlotDelete = async (slotId: string) => {
    try {
      await deleteRaidSlot({
        params: { serverId, raidId, slotId },
      }).unwrap();

      toast.success(t("toasts.slot.deleted"));
    } catch {
      toast.error(t("toasts.slot.deleteError"), {
        description: t("toasts.slot.deleteErrorDescription"),
      });
    }
  };

  const handleRaidSlotUpdate = async (slotId: string, updates: Partial<RaidSlot>) => {
    try {
      await updateRaidSlot({
        params: { serverId, raidId, slotId },
        body: {
          name: updates.name,
          role: updates.role || undefined,
          comment: updates.comment,
          userId: updates.userId,
          weapon: updates.weapon,
          order: updates.order !== undefined ? updates.order : undefined,
        },
      }).unwrap();

      if (updates.order !== undefined) {
        toast.success(t("toasts.slot.reordered"), {
          duration: 1000,
        });
      } else {
        toast.success(t("toasts.slot.updated"));
      }
    } catch {
      toast.error(t("toasts.slot.updateError"), {
        description: t("toasts.slot.updateErrorDescription"),
      });
    }
  };

  const handleRaidSlotsReorder = async (slotIds: string[]) => {
    try {
      await reorderRaidSlots({
        params: { serverId, raidId },
        body: { slotIds },
      }).unwrap();

      toast.success(t("toasts.slot.reordered"), {
        duration: 1000,
      });
    } catch {
      toast.error(t("toasts.slot.reorderError"), {
        description: t("toasts.slot.reorderErrorDescription"),
      });
    }
  };

  const handleImportRaidConfiguration = async (configuration: RaidConfiguration) => {
    try {
      await importRaidConfiguration({
        params: { serverId, raidId },
        body: configuration,
      }).unwrap();

      toast.success(t("toasts.raid.configurationImported"), {
        description: t("toasts.raid.configurationImportedDescription", {
          count: configuration.composition.slots.length,
        }),
      });
    } catch (error) {
      toast.error(t("toasts.raid.configurationImportError"), {
        description: error instanceof Error ? error.message : t("toasts.raid.configurationImportErrorDescription"),
      });
    }
  };

  const value: RaidContextValue = {
    raid,
    isLoading: isRaidLoading,
    error: raidError,
    serverMembers,
    hasStatus,
    handleCopyRaidLink,
    handleDeleteRaid,
    handleImportRaidConfiguration,
    handleRaidSlotCreate,
    handleRaidSlotDelete,
    handleRaidSlotUpdate,
    handleRaidSlotsReorder,
    handleShareRaid,
    handleUpdateRaidNotes,
    handleUpdateRaidStatus,
    handleUpdateRaid,
    canManageRaid,
    isFlexRaid,
    currentSlotCount,
    maxSlots,
  };

  return <RaidContext.Provider value={value}>{children}</RaidContext.Provider>;
}

export function useRaidContext() {
  const context = useContext(RaidContext);
  if (context === undefined) {
    throw new Error("useRaidContext must be used within a RaidProvider");
  }
  return context;
}
