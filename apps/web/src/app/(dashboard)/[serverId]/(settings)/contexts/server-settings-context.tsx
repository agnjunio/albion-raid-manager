import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { ServerSettings } from "@albion-raid-manager/types/entities";
import { serverSettingsSchema } from "@albion-raid-manager/types/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormReturn } from "react-hook-form";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { apiClient } from "@/lib/api";
import { useGetServerSettingsQuery } from "@/store/servers";

interface ServerSettingsContextValue {
  // Server data
  server: ServerSettings | null;
  isLoading: boolean;
  isSaving: boolean;

  // Form state
  form: UseFormReturn<ServerSettings>;
  hasUnsavedChanges: boolean;

  // Actions
  loadServerSettings: () => Promise<void>;
  saveServerSettings: () => Promise<void>;
  resetForm: () => void;
}

const ServerSettingsContext = createContext<ServerSettingsContextValue | null>(null);

export function useServerSettings() {
  const context = useContext(ServerSettingsContext);
  if (!context) {
    throw new Error("useServerSettings must be used within a ServerSettingsProvider");
  }
  return context;
}

interface ServerSettingsProviderProps {
  children: React.ReactNode;
}

export function ServerSettingsProvider({ children }: ServerSettingsProviderProps) {
  const { serverId } = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isInitialLoad = useRef(true);
  const lastServerData = useRef<ServerSettings | null>(null);

  const {
    data: serverSettingsData,
    isLoading,
    error,
    refetch: refetchServerSettings,
  } = useGetServerSettingsQuery({ params: { serverId: serverId || "" } }, { skip: !serverId });

  const server = serverSettingsData?.settings as ServerSettings | null;

  // Initialize form with default values
  const form = useForm<ServerSettings>({
    resolver: zodResolver(serverSettingsSchema),
    defaultValues: {
      // Server Information
      name: "",
      icon: "",

      // Permissions
      adminRoles: [],
      raidRoles: [],
      compositionRoles: [],

      // Raids Configuration
      raidAnnouncementChannelId: "",

      // Registration Configuration
      serverGuildId: "",
      memberRoleId: "",
      friendRoleId: "",

      // Audit Configuration
      auditChannelId: "",

      // Localization
      language: "en",
    },
  });

  const loadServerSettings = useCallback(async () => {
    if (!serverId) return;
    await refetchServerSettings();
  }, [serverId, refetchServerSettings]);

  const saveServerSettings = async () => {
    if (!serverId) return;

    try {
      const formData = form.getValues();
      const validatedData = serverSettingsSchema.parse(formData);

      setIsSaving(true);
      await apiClient.put(`/servers/${serverId}/settings`, validatedData);

      // Refetch server settings to get updated data
      await refetchServerSettings();
      setHasUnsavedChanges(false);

      toast.success("Server settings saved successfully");
    } catch (error) {
      console.error("Failed to save server settings", { error, serverId });
      if (error instanceof Error && error.name === "ZodError") {
        toast.error("Please fix validation errors before saving");
      } else {
        toast.error("Failed to save server settings");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    if (server) {
      form.reset(server);
      setHasUnsavedChanges(false);
      isInitialLoad.current = true;
      lastServerData.current = server;
    }
  };

  // Watch form changes
  const watchedValues = form.watch();

  // Handle RTK Query errors
  useEffect(() => {
    if (error) {
      console.error("Failed to load server settings", { error });
      toast.error("Failed to load server settings");
    }
  }, [error]);

  // Update form when server data loads
  useEffect(() => {
    if (server) {
      form.reset(server);
      isInitialLoad.current = true;
      lastServerData.current = server;
    }
  }, [server, form]);

  // Track form changes and update context
  useEffect(() => {
    if (watchedValues && Object.keys(watchedValues).length > 0) {
      // Only mark as having unsaved changes if:
      // 1. This is not the initial load
      // 2. The form values are different from the server data
      if (!isInitialLoad.current && lastServerData.current) {
        const hasChanges = JSON.stringify(watchedValues) !== JSON.stringify(lastServerData.current);
        setHasUnsavedChanges(hasChanges);
      } else if (isInitialLoad.current) {
        isInitialLoad.current = false; // Mark initial load as complete
        setHasUnsavedChanges(false); // Ensure no unsaved changes on initial load
      }
    }
  }, [watchedValues]);

  const value: ServerSettingsContextValue = {
    server,
    isLoading,
    isSaving,
    form,
    hasUnsavedChanges,
    loadServerSettings,
    saveServerSettings,
    resetForm,
  };

  return <ServerSettingsContext.Provider value={value}>{children}</ServerSettingsContext.Provider>;
}
