/*
  Warnings:

  - Made the column `guildId` on table `Raid` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CALLER', 'TANK', 'SUPPORT', 'HEALER', 'RANGED_DPS', 'MEELE_DPS', 'BATTLEMOUNT');

-- CreateEnum
CREATE TYPE "RaidStatus" AS ENUM ('SCHEDULED', 'OPEN', 'CLOSED', 'ONGOING', 'FINISHED');

-- DropForeignKey
ALTER TABLE "Raid" DROP CONSTRAINT "Raid_guildId_fkey";

-- AlterTable
ALTER TABLE "Raid" ADD COLUMN     "status" "RaidStatus" NOT NULL DEFAULT 'SCHEDULED',
ALTER COLUMN "guildId" SET NOT NULL;

-- CreateTable
CREATE TABLE "Build" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role",

    CONSTRAINT "Build_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Raid" ADD CONSTRAINT "Raid_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
