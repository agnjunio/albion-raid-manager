/*
  Warnings:

  - You are about to drop the column `friendRoleId` on the `Server` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Server" DROP COLUMN "friendRoleId",
ADD COLUMN     "registeredRoleId" TEXT;
