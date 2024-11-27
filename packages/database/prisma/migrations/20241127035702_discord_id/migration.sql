/*
  Warnings:

  - Added the required column `discordId` to the `Guild` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Guild" ADD COLUMN     "discordId" TEXT NOT NULL;
