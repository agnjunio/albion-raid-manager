import { Router } from "express";
import guildMembersRouter from "./guildMembers";
import guildsRouter from "./guilds";
import raidsRouter from "./raids";
import serversRouter from "./servers";
import settingsRouter from "./settings";
import usersRouter from "./users";

const router = Router();

router.use("/guild-members", guildMembersRouter);
router.use("/guilds", guildsRouter);
router.use("/settings", settingsRouter);
router.use("/servers", serversRouter);
router.use("/users", usersRouter);
router.use("/raids", raidsRouter);

export default router;
