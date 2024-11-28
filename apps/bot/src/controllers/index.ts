import logger from "@albion-raid-manager/logger";
import { Client } from "discord.js";
import raidsController from "./raids";

const controllers: Controller[] = [raidsController];

export type Controller = {
  id: string;
  preinit?: ({ discord }: ControllerParams) => Promise<void>;
  init: ({ discord }: ControllerParams) => Promise<void>;
};
export type ControllerParams = { discord: Client };

export async function loadControllers({ discord }: ControllerParams) {
  for (const controller of controllers) {
    try {
      logger.debug(`Controller loaded: ${controller.id}`);
      if (controller.preinit) await controller.preinit({ discord });
    } catch (error) {
      let message = "Unknown error";
      if (error instanceof Error) message = error.message;
      logger.error(`Error loading controller ${controller.id}: ${message}`, error);
    }
  }

  for (const controller of controllers) {
    try {
      if (controller.init) await controller.init({ discord });
    } catch (error) {
      let message = "Unknown error";
      if (error instanceof Error) message = error.message;
      logger.error(`Error in controller init ${controller.id}: ${message}`, error);
    }
  }
}
