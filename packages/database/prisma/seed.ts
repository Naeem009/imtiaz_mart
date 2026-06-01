import { PrismaClient } from "@prisma/client";
import { seedCatalog } from "./seed-catalog";

const prisma = new PrismaClient();

const ROLES = [
  { name: "Customer", slug: "customer", description: "Marketplace shopper" },
  { name: "Vendor", slug: "vendor", description: "Store owner" },
  { name: "Vendor Staff", slug: "vendor_staff", description: "Vendor team member" },
  { name: "Affiliate", slug: "affiliate", description: "Affiliate partner" },
  { name: "Support Agent", slug: "support_agent", description: "Customer support" },
  { name: "Admin", slug: "admin", description: "Platform administrator" },
  {
    name: "Super Admin",
    slug: "super_admin",
    description: "Full platform access",
  },
] as const;

async function main() {
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { slug: role.slug },
      update: { name: role.name, description: role.description },
      create: role,
    });
  }
  console.log(`Seeded ${ROLES.length} roles`);
  await seedCatalog();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
