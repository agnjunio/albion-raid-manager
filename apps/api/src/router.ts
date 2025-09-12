import { Router } from "express";

import { authRouter } from "./auth/router";
import { itemsRouter } from "./items/router";
import { serverRouter } from "./servers/router";

export const router: Router = Router();

router.use("/auth", authRouter);
router.use("/items", itemsRouter);
router.use("/servers", serverRouter);
