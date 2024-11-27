import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient({});

async function main() {
  const guild = await prisma.guild.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Black River",
      discordId: "738365346855256107",
      announcementChannelId: "815639086882095115",
    },
  });

  const composition = await prisma.composition.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Ava Roads 10p",
      guildId: guild.id,
      Builds: {
        create: [
          {
            name: "Mace PvE",
            role: Role.TANK,
          },
          {
            name: "Healer Holy",
            role: Role.HEALER,
          },
        ],
      },
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
