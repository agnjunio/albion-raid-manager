/*
  Warnings:

  - Added the required column `updatedAt` to the `Build` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Composition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Raid` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Build" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Composition" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Raid" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "RaidSignup" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "raidId" INTEGER NOT NULL,
    "buildId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RaidSignup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BuildToComposition" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BuildToComposition_AB_unique" ON "_BuildToComposition"("A", "B");

-- CreateIndex
CREATE INDEX "_BuildToComposition_B_index" ON "_BuildToComposition"("B");

-- AddForeignKey
ALTER TABLE "RaidSignup" ADD CONSTRAINT "RaidSignup_raidId_fkey" FOREIGN KEY ("raidId") REFERENCES "Raid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaidSignup" ADD CONSTRAINT "RaidSignup_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "Build"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BuildToComposition" ADD CONSTRAINT "_BuildToComposition_A_fkey" FOREIGN KEY ("A") REFERENCES "Build"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BuildToComposition" ADD CONSTRAINT "_BuildToComposition_B_fkey" FOREIGN KEY ("B") REFERENCES "Composition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
