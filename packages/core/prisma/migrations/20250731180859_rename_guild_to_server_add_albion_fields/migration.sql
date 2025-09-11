/*
  Warnings:

  - You are about to drop the column `guildId` on the `Raid` table. All the data in the column will be lost.
  - You are about to drop the column `defaultGuildId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AlbionGuild` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AlbionPlayer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Guild` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GuildMember` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `serverId` to the `Raid` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AlbionGuild" DROP CONSTRAINT "AlbionGuild_discordGuildId_fkey";

-- DropForeignKey
ALTER TABLE "AlbionPlayer" DROP CONSTRAINT "AlbionPlayer_discordGuildId_fkey";

-- DropForeignKey
ALTER TABLE "AlbionPlayer" DROP CONSTRAINT "AlbionPlayer_discordUserId_fkey";

-- DropForeignKey
ALTER TABLE "GuildMember" DROP CONSTRAINT "GuildMember_guildId_fkey";

-- DropForeignKey
ALTER TABLE "GuildMember" DROP CONSTRAINT "GuildMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "Raid" DROP CONSTRAINT "Raid_guildId_fkey";

-- AlterTable
ALTER TABLE "Raid" DROP COLUMN "guildId",
ADD COLUMN     "serverId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "defaultGuildId",
ADD COLUMN     "defaultServerId" TEXT;

-- DropTable
DROP TABLE "AlbionGuild";

-- DropTable
DROP TABLE "AlbionPlayer";

-- DropTable
DROP TABLE "Guild";

-- DropTable
DROP TABLE "GuildMember";

-- CreateTable
CREATE TABLE "Server" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "discordId" TEXT NOT NULL,
    "adminRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "raidRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "compositionRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "raidAnnouncementChannelId" TEXT,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerMember" (
    "serverId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nickname" TEXT,
    "adminPermission" BOOLEAN NOT NULL DEFAULT false,
    "raidPermission" BOOLEAN NOT NULL DEFAULT false,
    "compositionPermission" BOOLEAN NOT NULL DEFAULT false,
    "albionPlayerId" TEXT,
    "albionGuildId" TEXT,
    "killFame" INTEGER NOT NULL DEFAULT 0,
    "deathFame" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServerMember_pkey" PRIMARY KEY ("serverId","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Server_discordId_key" ON "Server"("discordId");

-- AddForeignKey
ALTER TABLE "ServerMember" ADD CONSTRAINT "ServerMember_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServerMember" ADD CONSTRAINT "ServerMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Raid" ADD CONSTRAINT "Raid_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
