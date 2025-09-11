-- AlterTable
ALTER TABLE "public"."Raid" ADD COLUMN     "location" TEXT,
ADD COLUMN     "maxPlayers" INTEGER;

-- AlterTable
ALTER TABLE "public"."RaidSlot" ALTER COLUMN "role" DROP NOT NULL;
