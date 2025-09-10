/*
  Warnings:

  - The values [CALLER] on the enum `RaidRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."RaidRole_new" AS ENUM ('TANK', 'SUPPORT', 'HEALER', 'RANGED_DPS', 'MELEE_DPS', 'BATTLEMOUNT');
ALTER TABLE "public"."RaidSlot" ALTER COLUMN "role" TYPE "public"."RaidRole_new" USING ("role"::text::"public"."RaidRole_new");
ALTER TYPE "public"."RaidRole" RENAME TO "RaidRole_old";
ALTER TYPE "public"."RaidRole_new" RENAME TO "RaidRole";
DROP TYPE "public"."RaidRole_old";
COMMIT;
