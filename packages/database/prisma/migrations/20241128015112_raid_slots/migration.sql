/*
  Warnings:

  - You are about to drop the column `compositionId` on the `Raid` table. All the data in the column will be lost.
  - You are about to drop the `RaidSignup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Raid" DROP CONSTRAINT "Raid_compositionId_fkey";

-- DropForeignKey
ALTER TABLE "RaidSignup" DROP CONSTRAINT "RaidSignup_raidId_fkey";

-- DropForeignKey
ALTER TABLE "RaidSignup" DROP CONSTRAINT "RaidSignup_slotId_fkey";

-- AlterTable
ALTER TABLE "Raid" DROP COLUMN "compositionId";

-- DropTable
DROP TABLE "RaidSignup";

-- CreateTable
CREATE TABLE "RaidSlot" (
    "id" SERIAL NOT NULL,
    "raidId" INTEGER NOT NULL,
    "buildId" INTEGER NOT NULL,
    "userId" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RaidSlot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RaidSlot" ADD CONSTRAINT "RaidSlot_raidId_fkey" FOREIGN KEY ("raidId") REFERENCES "Raid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaidSlot" ADD CONSTRAINT "RaidSlot_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "Build"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
