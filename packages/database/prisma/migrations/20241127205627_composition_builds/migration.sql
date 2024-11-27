/*
  Warnings:

  - You are about to drop the column `buildId` on the `RaidSignup` table. All the data in the column will be lost.
  - You are about to drop the `_BuildToComposition` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `role` on table `Build` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `compositionBuildId` to the `RaidSignup` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RaidSignup" DROP CONSTRAINT "RaidSignup_buildId_fkey";

-- DropForeignKey
ALTER TABLE "_BuildToComposition" DROP CONSTRAINT "_BuildToComposition_A_fkey";

-- DropForeignKey
ALTER TABLE "_BuildToComposition" DROP CONSTRAINT "_BuildToComposition_B_fkey";

-- AlterTable
ALTER TABLE "Build" ALTER COLUMN "role" SET NOT NULL;

-- AlterTable
ALTER TABLE "RaidSignup" DROP COLUMN "buildId",
ADD COLUMN     "compositionBuildId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_BuildToComposition";

-- CreateTable
CREATE TABLE "CompositionBuild" (
    "id" SERIAL NOT NULL,
    "compositionId" INTEGER NOT NULL,
    "buildId" INTEGER NOT NULL,
    "comment" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompositionBuild_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CompositionBuild" ADD CONSTRAINT "CompositionBuild_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "Composition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionBuild" ADD CONSTRAINT "CompositionBuild_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "Build"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaidSignup" ADD CONSTRAINT "RaidSignup_compositionBuildId_fkey" FOREIGN KEY ("compositionBuildId") REFERENCES "CompositionBuild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
