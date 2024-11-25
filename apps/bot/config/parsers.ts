export function parseShardsTotal(SHARDS_TOTAL?: string) {
  if (!SHARDS_TOTAL) return undefined;
  if (SHARDS_TOTAL === "auto") return "auto";

  const totalShards = Number.parseInt(SHARDS_TOTAL);
  if (isNaN(totalShards)) return "auto";
  return totalShards;
}

export function parseShardList(SHARDS_SPAWN?: string) {
  if (!SHARDS_SPAWN) return undefined;
  if (SHARDS_SPAWN === "auto") return "auto";

  const shardList = SHARDS_SPAWN.split(",").map((x) => Number.parseInt(x));
  if (shardList.some((x) => isNaN(x))) return "auto";
  return shardList;
}
