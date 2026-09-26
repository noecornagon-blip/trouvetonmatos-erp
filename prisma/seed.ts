import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedDemoData } from "../src/lib/seed-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database avec des données de démonstration fictives…");
  const result = await seedDemoData(prisma);
  console.log("Seed terminé.");
  console.log(`Comptes de démonstration créés (mot de passe pour tous : "${result.password}") :`);
  for (const email of result.usersCreated) {
    console.log(`  - ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
