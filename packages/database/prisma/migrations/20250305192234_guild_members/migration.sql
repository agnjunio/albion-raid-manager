-- CreateEnum
CREATE TYPE "GuildMemberRole" AS ENUM ('LEADER', 'OFFICER', 'PLAYER');

-- CreateTable
CREATE TABLE "GuildMember" (
    "guildId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "default" BOOLEAN NOT NULL DEFAULT false,
    "role" "GuildMemberRole" NOT NULL DEFAULT 'PLAYER',

    CONSTRAINT "GuildMember_pkey" PRIMARY KEY ("guildId","userId")
);

-- AddForeignKey
ALTER TABLE "GuildMember" ADD CONSTRAINT "GuildMember_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildMember" ADD CONSTRAINT "GuildMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
