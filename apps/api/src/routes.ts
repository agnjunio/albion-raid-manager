import { Router } from "express";

import { authRouter } from "./auth/router";
import { guildsRouter } from "./guilds/router";

export const routes: Router = Router();

routes.use("/auth", authRouter);
routes.use("/guilds", guildsRouter);
