-- CreateEnum
CREATE TYPE "public"."GearSlot" AS ENUM ('MAIN_HAND', 'OFF_HAND', 'HEAD', 'BODY', 'FEET', 'CAPE', 'BAG', 'MOUNT', 'FOOD', 'POTION', 'INVENTORY');

-- AlterTable
ALTER TABLE "public"."RaidSlot" ADD COLUMN     "buildId" TEXT,
ADD COLUMN     "weapon" TEXT;

-- CreateTable
CREATE TABLE "public"."Build" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contentType" "public"."ContentType" NOT NULL,
    "description" TEXT,
    "role" "public"."RaidRole" NOT NULL,
    "serverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Build_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BuildPiece" (
    "id" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,
    "gearSlot" "public"."GearSlot" NOT NULL,
    "itemName" TEXT NOT NULL,
    "tier" INTEGER,
    "enchantment" INTEGER DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuildPiece_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."RaidSlot" ADD CONSTRAINT "RaidSlot_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "public"."Build"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Build" ADD CONSTRAINT "Build_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "public"."Server"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BuildPiece" ADD CONSTRAINT "BuildPiece_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "public"."Build"("id") ON DELETE CASCADE ON UPDATE CASCADE;
