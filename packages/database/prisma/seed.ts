import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedCatalog } from "./seed-catalog";

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

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

async function ensureDemoUsers() {
  const demoUsers = [
    {
      email: "admin@example.com",
      password: "Admin123!",
      firstName: "Marketplace",
      lastName: "Admin",
      roles: ["admin", "super_admin"],
    },
    {
      email: "vendor@example.com",
      password: "Vendor123!",
      firstName: "Vendor",
      lastName: "Owner",
      roles: ["vendor"],
    },
    {
      email: "vendor-staff@example.com",
      password: "Vendor123!",
      firstName: "Vendor",
      lastName: "Staff",
      roles: ["vendor_staff"],
    },
    {
      email: "customer@example.com",
      password: "Customer123!",
      firstName: "Demo",
      lastName: "Customer",
      roles: ["customer"],
    },
  ] as const;

  for (const demo of demoUsers) {
    const existing = await prisma.user.findUnique({
      where: { email: demo.email.toLowerCase() },
    });

    const passwordHash = await bcrypt.hash(demo.password, BCRYPT_ROUNDS);

    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            password: passwordHash,
            firstName: demo.firstName,
            lastName: demo.lastName,
            isActive: true,
          },
        })
      : await prisma.user.create({
          data: {
            email: demo.email.toLowerCase(),
            password: passwordHash,
            firstName: demo.firstName,
            lastName: demo.lastName,
            isActive: true,
          },
        });

    for (const roleSlug of demo.roles) {
      const role = await prisma.role.findUnique({ where: { slug: roleSlug } });
      if (!role) continue;

      const existingRole = await prisma.userRole.findUnique({
        where: { userId_roleId: { userId: user.id, roleId: role.id } },
      });
      if (!existingRole) {
        await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
      }
    }

    if (demo.roles.includes("vendor")) {
      const vendor = await prisma.vendor.findFirst({ where: { ownerId: user.id } });
      if (!vendor) {
        await prisma.vendor.create({
          data: {
            ownerId: user.id,
            name: "Demo Vendor Store",
            slug: `demo-vendor-${user.id.slice(0, 6)}`,
            description: "Seeded demo vendor store for local testing.",
            isVerified: true,
            isActive: true,
          },
        });
      }
    }

    if (demo.roles.includes("vendor_staff")) {
      const vendor = await prisma.vendor.findFirst();
      if (vendor) {
        const existingStaff = await prisma.vendorStaff.findFirst({
          where: { userId: user.id },
        });
        if (!existingStaff) {
          await prisma.vendorStaff.create({
            data: {
              vendorId: vendor.id,
              userId: user.id,
              title: "Demo Staff",
            },
          });
        }
      }
    }
  }

  console.log("Seeded demo accounts");
}

async function main() {
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { slug: role.slug },
      update: { name: role.name, description: role.description },
      create: role,
    });
  }
  console.log(`Seeded ${ROLES.length} roles`);
  await ensureDemoUsers();
  await seedCatalog();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
