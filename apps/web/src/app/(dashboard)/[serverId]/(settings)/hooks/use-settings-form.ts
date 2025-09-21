import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useServerSettings } from "../contexts/server-settings-context";
import { serverSettingsSchema, type ServerSettingsFormData } from "../schemas";

export function useSettingsForm() {
  const { formData } = useServerSettings();

  const form = useForm<ServerSettingsFormData>({
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

  // Update form when server data loads
  useEffect(() => {
    if (formData) {
      form.reset(formData);
    }
  }, [formData, form]);

  return form;
}
