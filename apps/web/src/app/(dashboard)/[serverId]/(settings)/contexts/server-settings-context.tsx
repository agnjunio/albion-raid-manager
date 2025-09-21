import type { ServerSettingsFormData } from "../schemas";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { apiClient } from "@/lib/api";
import { useGetServerSettingsQuery } from "@/store/servers";

interface ServerSettingsContextValue {
  // Server data
  server: ServerSettingsFormData | null;
  isLoading: boolean;
  isSaving: boolean;

  // Form state
  formData: ServerSettingsFormData | null;
  hasUnsavedChanges: boolean;

  // Actions
  loadServerSettings: () => Promise<void>;
  saveServerSettings: (data: ServerSettingsFormData) => Promise<void>;
  resetForm: () => void;
  setFormData: (data: ServerSettingsFormData) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
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
  const [formData, setFormData] = useState<ServerSettingsFormData | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    data: serverSettingsData,
    isLoading,
    error,
    refetch: refetchServerSettings,
  } = useGetServerSettingsQuery({ params: { serverId: serverId || "" } }, { skip: !serverId });

  const server = serverSettingsData?.settings as ServerSettingsFormData | null;

  const loadServerSettings = useCallback(async () => {
    if (!serverId) return;
    await refetchServerSettings();
  }, [serverId, refetchServerSettings]);

  const saveServerSettings = async (data: ServerSettingsFormData) => {
    if (!serverId) return;

    setIsSaving(true);
    try {
      await apiClient.put(`/servers/${serverId}/settings`, data);

      // Refetch server settings to get updated data
      await refetchServerSettings();
      setFormData(data);
      setHasUnsavedChanges(false);

      toast.success("Server settings saved successfully");
    } catch (error) {
      console.error("Failed to save server settings", { error, serverId, data });
      toast.error("Failed to save server settings");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    if (server) {
      setFormData(server);
      setHasUnsavedChanges(false);
    }
  };

  // Handle RTK Query errors
  useEffect(() => {
    if (error) {
      console.error("Failed to load server settings", { error });
      toast.error("Failed to load server settings");
    }
  }, [error]);

  // Track form changes
  useEffect(() => {
    if (server && formData) {
      const hasChanges = JSON.stringify(server) !== JSON.stringify(formData);
      setHasUnsavedChanges(hasChanges);
    }
  }, [server, formData]);

  // Reset form when server data changes
  useEffect(() => {
    if (server && !formData) {
      setFormData(server);
    }
  }, [server, formData]);

  const value: ServerSettingsContextValue = {
    server,
    isLoading,
    isSaving,
    formData,
    hasUnsavedChanges,
    loadServerSettings,
    saveServerSettings,
    resetForm,
    setFormData,
    setHasUnsavedChanges,
  };

  return <ServerSettingsContext.Provider value={value}>{children}</ServerSettingsContext.Provider>;
}
