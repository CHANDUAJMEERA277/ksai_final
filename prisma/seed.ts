import { PrismaClient } from "../src/generated/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@ksai.local";
  const rawPassword = "Admin@12345";
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const adminUser = await prisma.user.create({
      data: {
        name: "KSAI System Admin",
        email: adminEmail,
        emailVerified: true,
        passwordHash: passwordHash,
        role: "Admin",
        provider: "CREDENTIALS",
        country: "United States",
      },
    });
    console.log("✅ Admin user seeded successfully:", adminUser.email);
  } else {
    // Ensure role is updated to Admin if existing
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        role: "Admin",
        passwordHash: passwordHash,
      },
    });
    console.log("ℹ️ Admin user already exists. Verified Admin role and password.");
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
