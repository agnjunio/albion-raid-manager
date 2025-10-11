import { z } from "zod";

export const serverSettingsSchema = z.object({
  // Server Information
  name: z
    .string()
    .min(1, { message: "Server name is required" })
    .max(100, { message: "Server name should not exceed 100 characters" }),
  icon: z.string().optional().or(z.literal("")),

  // Admin Configuration
  auditChannelId: z
    .string()
    .regex(/^\d{17,19}$/, { message: "Audit channel ID must be a valid Discord channel ID" })
    .optional()
    .or(z.literal("")),
  adminRoles: z
    .array(z.string())
    .default([])
    .refine((roles) => roles.every((role) => /^\d{17,19}$/.test(role)), {
      message: "All admin role IDs must be valid Discord role IDs",
    }),

  // Raids Configuration
  raidAnnouncementChannelId: z
    .string()
    .regex(/^\d{17,19}$/, { message: "Channel ID must be a valid Discord channel ID" })
    .optional()
    .or(z.literal("")),
  callerRoles: z
    .array(z.string())
    .default([])
    .refine((roles) => roles.every((role) => /^\d{17,19}$/.test(role)), {
      message: "All raid role IDs must be valid Discord role IDs",
    }),

  // Registration Configuration
  serverGuildId: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/, { message: "Guild ID must be a valid Albion Online guild ID" })
    .optional()
    .or(z.literal("")),
  memberRoleId: z
    .string()
    .regex(/^\d{17,19}$/, { message: "Member role ID must be a valid Discord role ID" })
    .optional()
    .or(z.literal("")),
  registeredRoleId: z
    .string()
    .regex(/^\d{17,19}$/, { message: "Registered role ID must be a valid Discord role ID" })
    .optional()
    .or(z.literal("")),

  // Localization Configuration
  language: z.string().default("en"),
});
