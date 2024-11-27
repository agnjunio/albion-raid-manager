/* eslint-disable no-console */
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

  const tank = await prisma.build.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Mace PvE",
      role: Role.TANK,
    },
  });

  const healer = await prisma.build.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: "Queda Santa",
      role: Role.HEALER,
    },
  });

  const rdps = await prisma.build.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: "DPS Ranged Genérico",
      role: Role.RANGED_DPS,
    },
  });

  const mdps = await prisma.build.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: "DPS Melee Genérico",
      role: Role.MEELE_DPS,
    },
  });

  const support = await prisma.build.upsert({
    where: { id: 5 },
    update: {},
    create: {
      name: "Support Genérico",
      role: Role.SUPPORT,
    },
  });

  const bmount = await prisma.build.upsert({
    where: { id: 6 },
    update: {},
    create: {
      name: "Montaria de Batalha",
      role: Role.BATTLEMOUNT,
    },
  });

  const composition = await prisma.composition.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Ava Roads 10p",
      guildId: guild.id,
      slots: {
        connectOrCreate: [tank, healer, healer, mdps, rdps, rdps, rdps, support, bmount].map((build, i) => ({
          where: { id: i + 1 },
          create: {
            buildId: build.id,
          },
        })),
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
    console.log("Seed successful.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    process.exit(1);
  });
