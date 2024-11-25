import logger from "@albion-raid-manager/logger";
import { Client } from "discord.js";

export type Controller = {
  name: string;
  preinit?: (client: Client) => Promise<void>;
  init: (client: Client) => Promise<void>;
};

const controllers: Controller[] = [];

export async function loadControllers(client: Client) {
  for (const controller of controllers) {
    try {
      logger.debug(`Controller loaded: ${controller.name}`);
      if (controller.preinit) await controller.preinit(client);
    } catch (error) {
      let message = "Unknown error";
      if (error instanceof Error) message = error.message;
      logger.error(
        `Error loading controller ${controller.name}: ${message}`,
        error
      );
    }
  }

  for (const controller of controllers) {
    try {
      if (controller.init) await controller.init(client);
    } catch (error) {
      let message = "Unknown error";
      if (error instanceof Error) message = error.message;
      logger.error(
        `Error in controller init ${controller.name}: ${message}`,
        error
      );
    }
  }
}
