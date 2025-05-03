/*
  Warnings:

  - You are about to drop the column `role` on the `RaidSlot` table. All the data in the column will be lost.
  - You are about to drop the `CompositionBuild` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CompositionBuild" DROP CONSTRAINT "CompositionBuild_compositionId_fkey";

-- DropForeignKey
ALTER TABLE "GuildMember" DROP CONSTRAINT "GuildMember_guildId_fkey";

-- DropForeignKey
ALTER TABLE "GuildMember" DROP CONSTRAINT "GuildMember_userId_fkey";

-- AlterTable
ALTER TABLE "Raid" ALTER COLUMN "allowLateJoin" SET DEFAULT true;

-- AlterTable
ALTER TABLE "RaidSlot" DROP COLUMN "role",
ADD COLUMN     "buildId" TEXT;

-- DropTable
DROP TABLE "CompositionBuild";

-- CreateTable
CREATE TABLE "Build" (
    "id" TEXT NOT NULL,
    "compositionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "comment" TEXT,
    "count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Build_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GuildMember" ADD CONSTRAINT "GuildMember_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildMember" ADD CONSTRAINT "GuildMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Build" ADD CONSTRAINT "Build_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "Composition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaidSlot" ADD CONSTRAINT "RaidSlot_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "Build"("id") ON DELETE SET NULL ON UPDATE CASCADE;
