import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Example: Seeding users
  await prisma.guild.createMany({
    data: [{ name: "Alice" }, { name: "Bob" }],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding the database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
