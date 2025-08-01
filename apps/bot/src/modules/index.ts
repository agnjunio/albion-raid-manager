export { initModules, type Module } from "./modules";
import { config } from "./config";
import { type Module } from "./modules";
import { raids } from "./raids";
import { register } from "./register";

export const MODULES_LIST: Module[] = [raids, register, config];
