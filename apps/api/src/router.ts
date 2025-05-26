import { Router } from "express";

import { authRouter } from "./auth/router";
import { guildsRouter } from "./guilds/router";
import { initContext } from "./middleware";
import { serverRouter } from "./servers/router";

export const router: Router = Router();

router.use(initContext);
router.use("/auth", authRouter);
router.use("/guilds", guildsRouter);
router.use("/servers", serverRouter);
