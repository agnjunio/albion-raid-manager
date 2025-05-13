import { discord } from "@/bot";
import { type Raid } from "@albion-raid-manager/core/types";
import logger from "@albion-raid-manager/logger";
import { User } from "discord.js";
import EventEmitter from "events";
import { updateRaidAnnouncement } from "./handlers";

export const raidEvents = new EventEmitter();

raidEvents.on("raidAnnounced", (raid: Raid) => {
  logger.info(`Raid announced: ${raid.id}`, { raid });
});

raidEvents.on("raidSignup", async (raid: Raid, user: User) => {
  logger.info(`User ${user.displayName} signed up for raid: ${raid.id}`, {
    raid,
    user: user.toJSON(),
  });
  return updateRaidAnnouncement(discord, raid);
});

raidEvents.on("raidSignout", async (raid: Raid, user: User) => {
  logger.info(`User ${user.displayName} left raid: ${raid.id}`, {
    raid,
    user: user.toJSON(),
  });
  return updateRaidAnnouncement(discord, raid);
});
