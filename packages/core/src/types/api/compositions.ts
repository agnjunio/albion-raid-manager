import { Composition } from "@types";

export namespace GetGuildCompositions {
  export type Params = { guildId: string };
  export type Response = { compositions: Composition[] };
}
