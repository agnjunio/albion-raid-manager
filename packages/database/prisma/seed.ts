import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({});

async function main() {
  const guild = await prisma.guild.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Black River",
      discordId: "180716126400020481",
    },
  });

  const composition = await prisma.composition.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Ava Roads 10p",
      guildId: guild.id,
    },
  });

  await prisma.raid.upsert({
    where: { id: 1 },
    update: {},
    create: {
      description: "Avalonian Raid",
      status: "SCHEDULED",
      date: new Date(),
      guildId: guild.id,
      compositionId: composition.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async () => {
    await prisma.$disconnect();
    process.exit(1);
  });
