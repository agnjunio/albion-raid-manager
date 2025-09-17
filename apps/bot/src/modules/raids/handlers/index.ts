import { RaidEvent } from "@albion-raid-manager/core/redis";
import { Client, Interaction, Message } from "discord.js";

import { type GuildContext } from "@/modules/guild-context";

interface HandlerProps {
  discord: Client;
  context: GuildContext;
}

export interface InteractionHandlerProps extends HandlerProps {
  interaction: Interaction;
}

export interface MessageHandlerProps extends HandlerProps {
  message: Message;
}

export interface RaidEventHandlerProps extends HandlerProps {
  event: RaidEvent;
}

export * from "./handleMessageCreate";
export * from "./handleRaidEvents";
export * from "./handleSelectRole";
export * from "./handleSignOut";
export * from "./handleSignUp";
