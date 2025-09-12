import z from "zod";

import { searchItemsQuerySchema } from "../schemas/items";
import { Item } from "../services";

export namespace SearchItems {
  export type Params = {};
  export type Query = z.infer<typeof searchItemsQuerySchema>;
  export type Response = { items: Item[] };
}

export namespace GetItem {
  export type Params = { id: string };
  export type Query = {};
  export type Response = { item: Item };
}
