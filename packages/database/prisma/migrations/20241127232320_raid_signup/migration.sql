/*
  Warnings:

  - Added the required column `updatedAt` to the `Build` table without a default value. This is not possible if the table is not empty.
  - Made the column `role` on table `Build` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `Composition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Raid` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Guild_name_key";

-- AlterTable
ALTER TABLE "Build" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "role" SET NOT NULL;

-- AlterTable
ALTER TABLE "Composition" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Guild" ADD COLUMN     "announcementChannelId" TEXT,
ADD COLUMN     "icon" TEXT;

-- AlterTable
ALTER TABLE "Raid" ADD COLUMN     "announcementMessageId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "CompositionSlot" (
    "id" SERIAL NOT NULL,
    "compositionId" INTEGER NOT NULL,
    "buildId" INTEGER NOT NULL,
    "comment" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompositionSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaidSignup" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "raidId" INTEGER NOT NULL,
    "slotId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RaidSignup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CompositionSlot" ADD CONSTRAINT "CompositionSlot_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "Composition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionSlot" ADD CONSTRAINT "CompositionSlot_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "Build"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaidSignup" ADD CONSTRAINT "RaidSignup_raidId_fkey" FOREIGN KEY ("raidId") REFERENCES "Raid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaidSignup" ADD CONSTRAINT "RaidSignup_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "CompositionSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
