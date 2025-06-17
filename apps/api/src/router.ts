import { Router } from "express";

import { authRouter } from "./auth/router";
import { guildsRouter } from "./guilds/router";
import { serverRouter } from "./servers/router";

export const router: Router = Router();

router.use("/auth", authRouter);
router.use("/guilds", guildsRouter);
router.use("/servers", serverRouter);
