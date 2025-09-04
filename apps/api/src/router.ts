import { Router } from "express";

import { authRouter } from "./auth/router";
import { serverRouter } from "./servers/router";

export const router: Router = Router();

router.use("/auth", authRouter);
router.use("/servers", serverRouter);
