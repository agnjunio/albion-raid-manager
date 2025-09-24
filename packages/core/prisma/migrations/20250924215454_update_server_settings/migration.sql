/*
  Warnings:

  - You are about to drop the column `compositionRoles` on the `Server` table. All the data in the column will be lost.
  - You are about to drop the column `raidRoles` on the `Server` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Server" DROP COLUMN "compositionRoles",
DROP COLUMN "raidRoles",
ADD COLUMN     "callerRoles" TEXT[] DEFAULT ARRAY[]::TEXT[];
