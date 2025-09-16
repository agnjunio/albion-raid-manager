/*
  Warnings:

  - You are about to drop the column `contentType` on the `Build` table. All the data in the column will be lost.
  - You are about to drop the column `enchantment` on the `BuildPiece` table. All the data in the column will be lost.
  - You are about to drop the column `tier` on the `BuildPiece` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."RaidSlot" DROP CONSTRAINT "RaidSlot_raidId_fkey";

-- AlterTable
ALTER TABLE "public"."Build" DROP COLUMN "contentType";

-- AlterTable
ALTER TABLE "public"."BuildPiece" DROP COLUMN "enchantment",
DROP COLUMN "tier";

-- AddForeignKey
ALTER TABLE "public"."RaidSlot" ADD CONSTRAINT "RaidSlot_raidId_fkey" FOREIGN KEY ("raidId") REFERENCES "public"."Raid"("id") ON DELETE CASCADE ON UPDATE CASCADE;
