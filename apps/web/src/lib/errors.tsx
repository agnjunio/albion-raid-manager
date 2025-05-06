export const ERROR_MESSAGES: Record<string, string> = {
  UNKNOWN_ERROR: "Something went wrong. Please try again.",
  GET_GUILD_FAILED: "Failed to retrive guild. Please try again.",
  GET_GUILD_MEMBER_FAILED: "Failed to retrive guild member. Please try again.",
  GUILD_ALREADY_EXISTS:
    "This guild already exists. If you can't see the bot, go to guild settings and invite it to the server.",
  RAID_CREATION_FAILED: "Faile to create Raid. Please try again later.",
  SERVER_VERIFICATION_FAILED: "Failed to verify discord server. Please try again.",
  HAS_PERMISSION_FAILED: "FORDIBBEN: You are not authorized to access this page.",
};

export const translateErrorCode = (error: string) => ERROR_MESSAGES[error] || ERROR_MESSAGES.UNKNOWN_ERROR;
