import { Composition } from "@albion-raid-manager/database/models";
import { compareAsc } from "date-fns";
import { distance } from "fastest-levenshtein";

export function filterCompositions(compositions: Composition[], filter: string) {
  return compositions
    .map((composition) => ({
      ...composition,
      distance: composition.name.length - distance(composition.name.toLowerCase(), filter.toLowerCase()),
    }))
    .filter((composition) => composition.distance >= 0)
    .sort((a, b) => compareAsc(new Date(a.updatedAt), new Date(b.updatedAt)))
    .sort((a, b) => b.distance - a.distance)
    .map((composition) => ({ ...composition, distance: undefined }));
}
