/*
  Warnings:

  - Added the required column `guildId` to the `Composition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Composition" ADD COLUMN     "guildId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Composition" ADD CONSTRAINT "Composition_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
