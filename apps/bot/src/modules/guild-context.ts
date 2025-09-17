import { logger } from "@albion-raid-manager/core/logger/index";
import { ServersService } from "@albion-raid-manager/core/services";
import { Guild } from "discord.js";
import { TFunction } from "i18next";

import { getFixedT, isLanguageSupported } from "../i18n";

export interface GuildContext {
  guild: Guild;
  guildId: string;
  t: TFunction<"translation", undefined>;
}

export async function createGuildContext(guild: Guild): Promise<GuildContext> {
  // Language detection
  const detectLanguage = async () => {
    try {
      // Get server configuration
      const server = await ServersService.getServerById(guild.id);
      const serverLanguage = server?.language;
      if (serverLanguage && isLanguageSupported(serverLanguage)) {
        return serverLanguage;
      }

      // Get Discord locale from guild
      const discordLocale = guild.preferredLocale;
      if (discordLocale && isLanguageSupported(discordLocale)) {
        return discordLocale;
      }
    } catch (error) {
      logger.warn(`Failed to detect language.`, { guildId: guild.id, guildName: guild.name, error });
    }

    return "en";
  };

  const language = await detectLanguage();
  const t = getFixedT(language);

  return {
    guild,
    guildId: guild.id,
    t,
  };
}
