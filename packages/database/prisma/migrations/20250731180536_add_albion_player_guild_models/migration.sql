-- CreateTable
CREATE TABLE "AlbionPlayer" (
    "id" TEXT NOT NULL,
    "albionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "guildId" TEXT,
    "guildName" TEXT,
    "allianceId" TEXT,
    "allianceName" TEXT,
    "avatar" TEXT,
    "avatarRing" TEXT,
    "killFame" INTEGER NOT NULL DEFAULT 0,
    "deathFame" INTEGER NOT NULL DEFAULT 0,
    "fameRatio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalKills" INTEGER,
    "gvgKills" INTEGER,
    "gvgWon" INTEGER,
    "server" TEXT NOT NULL DEFAULT 'AMERICAS',
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discordUserId" TEXT NOT NULL,
    "discordGuildId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlbionPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlbionGuild" (
    "id" TEXT NOT NULL,
    "albionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "allianceId" TEXT,
    "allianceName" TEXT,
    "deathFame" INTEGER NOT NULL DEFAULT 0,
    "server" TEXT NOT NULL DEFAULT 'AMERICAS',
    "discordGuildId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlbionGuild_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlbionPlayer_albionId_key" ON "AlbionPlayer"("albionId");

-- CreateIndex
CREATE UNIQUE INDEX "AlbionPlayer_discordUserId_key" ON "AlbionPlayer"("discordUserId");

-- CreateIndex
CREATE INDEX "AlbionPlayer_albionId_idx" ON "AlbionPlayer"("albionId");

-- CreateIndex
CREATE INDEX "AlbionPlayer_guildId_idx" ON "AlbionPlayer"("guildId");

-- CreateIndex
CREATE INDEX "AlbionPlayer_server_idx" ON "AlbionPlayer"("server");

-- CreateIndex
CREATE INDEX "AlbionPlayer_discordGuildId_idx" ON "AlbionPlayer"("discordGuildId");

-- CreateIndex
CREATE UNIQUE INDEX "AlbionGuild_albionId_key" ON "AlbionGuild"("albionId");

-- CreateIndex
CREATE UNIQUE INDEX "AlbionGuild_discordGuildId_key" ON "AlbionGuild"("discordGuildId");

-- CreateIndex
CREATE INDEX "AlbionGuild_albionId_idx" ON "AlbionGuild"("albionId");

-- CreateIndex
CREATE INDEX "AlbionGuild_server_idx" ON "AlbionGuild"("server");

-- AddForeignKey
ALTER TABLE "AlbionPlayer" ADD CONSTRAINT "AlbionPlayer_discordUserId_fkey" FOREIGN KEY ("discordUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbionPlayer" ADD CONSTRAINT "AlbionPlayer_discordGuildId_fkey" FOREIGN KEY ("discordGuildId") REFERENCES "Guild"("discordId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbionGuild" ADD CONSTRAINT "AlbionGuild_discordGuildId_fkey" FOREIGN KEY ("discordGuildId") REFERENCES "Guild"("discordId") ON DELETE CASCADE ON UPDATE CASCADE;
