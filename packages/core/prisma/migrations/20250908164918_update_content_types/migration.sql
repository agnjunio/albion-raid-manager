/*
  Warnings:

  - The values [AVALONIAN_DUNGEON_FULL_CLEAR,AVALONIAN_DUNGEON_BUFF_ONLY,ROADS_OF_AVALON_PVE,ROADS_OF_AVALON_PVP,GANKING_SQUAD,FIGHTING_SQUAD,ZVZ_CALL_TO_ARMS,HELLGATE_10V10] on the enum `ContentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ContentType_new" AS ENUM ('SOLO_DUNGEON', 'OPEN_WORLD_FARMING', 'GROUP_DUNGEON', 'AVALONIAN_DUNGEON', 'ROADS_OF_AVALON', 'DEPTHS_DUO', 'DEPTHS_TRIO', 'OPEN_WORLD_GANKING', 'OPEN_WORLD_SMALL_SCALE', 'OPEN_WORLD_ZVZ', 'HELLGATE_2V2', 'HELLGATE_5V5', 'MISTS_SOLO', 'MISTS_DUO', 'OTHER');
ALTER TABLE "public"."Raid" ALTER COLUMN "contentType" TYPE "public"."ContentType_new" USING ("contentType"::text::"public"."ContentType_new");
ALTER TYPE "public"."ContentType" RENAME TO "ContentType_old";
ALTER TYPE "public"."ContentType_new" RENAME TO "ContentType";
DROP TYPE "public"."ContentType_old";
COMMIT;
