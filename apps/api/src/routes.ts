import { Router } from "express";

import { authRouter } from "./auth/router";
import { guildsRouter } from "./guilds/router";
import { serverRouter } from "./servers/router";

export const routes: Router = Router();

routes.use("/auth", authRouter);
routes.use("/guilds", guildsRouter);
routes.use("/servers", serverRouter);
