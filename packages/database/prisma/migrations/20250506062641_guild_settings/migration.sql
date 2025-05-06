/*
  Warnings:

  - You are about to drop the column `announcementChannelId` on the `Guild` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Guild" DROP COLUMN "announcementChannelId",
ADD COLUMN     "adminRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "compositionRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "raidAnnouncementChannelId" TEXT,
ADD COLUMN     "raidRoles" TEXT[] DEFAULT ARRAY[]::TEXT[];
