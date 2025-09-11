/*
  Warnings:

  - You are about to drop the column `discordId` on the `Server` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Server_discordId_key";

-- AlterTable
ALTER TABLE "Server" DROP COLUMN "discordId";
