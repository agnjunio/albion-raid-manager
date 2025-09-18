/*
  Warnings:

  - You are about to drop the column `adminPermission` on the `ServerMember` table. All the data in the column will be lost.
  - You are about to drop the column `compositionPermission` on the `ServerMember` table. All the data in the column will be lost.
  - You are about to drop the column `raidPermission` on the `ServerMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ServerMember" DROP COLUMN "adminPermission",
DROP COLUMN "compositionPermission",
DROP COLUMN "raidPermission";
