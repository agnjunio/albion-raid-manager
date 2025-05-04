import { ReactNode } from "react";

export const ERROR_MESSAGES: Record<string, ReactNode> = {
  GUILD_ALREADY_EXISTS:
    "This guild already exists. If you can't see the bot, go to guild settings and invite it to the server.",
  RAID_CREATION_FAILED: "Faile to create Raid. Please try again later.",
  UNKNOWN_ERROR: "Something went wrong. Please try again.",
  SERVER_VERIFICATION_FAILED: "Failed to verify discord server. Please try again.",
};

export const translateErrorCode = (error: string) => ERROR_MESSAGES[error] || ERROR_MESSAGES.UNKNOWN_ERROR;
