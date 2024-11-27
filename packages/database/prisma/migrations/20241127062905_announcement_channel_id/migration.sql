-- DropIndex
DROP INDEX "Guild_name_key";

-- AlterTable
ALTER TABLE "Guild" ADD COLUMN     "announcementChannelId" TEXT,
ADD COLUMN     "icon" TEXT;
