-- CreateEnum
CREATE TYPE "GuildMemberRole" AS ENUM ('LEADER', 'OFFICER', 'PLAYER');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CALLER', 'TANK', 'SUPPORT', 'HEALER', 'RANGED_DPS', 'MELEE_DPS', 'BATTLEMOUNT');

-- CreateEnum
CREATE TYPE "RaidStatus" AS ENUM ('SCHEDULED', 'OPEN', 'CLOSED', 'ONGOING', 'FINISHED');

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "discordId" TEXT NOT NULL,
    "announcementChannelId" TEXT,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildMember" (
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "default" BOOLEAN NOT NULL DEFAULT false,
    "role" "GuildMemberRole" NOT NULL DEFAULT 'PLAYER',

    CONSTRAINT "GuildMember_pkey" PRIMARY KEY ("guildId","userId")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatar" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Composition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Composition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompositionBuild" (
    "id" TEXT NOT NULL,
    "compositionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "comment" TEXT,
    "count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "CompositionBuild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Raid" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "allowLateJoin" BOOLEAN NOT NULL DEFAULT false,
    "status" "RaidStatus" NOT NULL DEFAULT 'SCHEDULED',
    "announcementMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Raid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaidSlot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "comment" TEXT,
    "raidId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3),

    CONSTRAINT "RaidSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guild_discordId_key" ON "Guild"("discordId");

-- AddForeignKey
ALTER TABLE "GuildMember" ADD CONSTRAINT "GuildMember_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildMember" ADD CONSTRAINT "GuildMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Composition" ADD CONSTRAINT "Composition_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionBuild" ADD CONSTRAINT "CompositionBuild_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "Composition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Raid" ADD CONSTRAINT "Raid_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaidSlot" ADD CONSTRAINT "RaidSlot_raidId_fkey" FOREIGN KEY ("raidId") REFERENCES "Raid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaidSlot" ADD CONSTRAINT "RaidSlot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
