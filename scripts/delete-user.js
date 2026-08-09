const { PrismaClient } = require("../src/generated/client");
const prisma = new PrismaClient();

async function main() {
  const emailToDelete = process.argv[2];

  if (!emailToDelete) {
    console.log("Usage: node scripts/delete-user.js <email>");
    console.log("\nCurrently registered users in database:\n");
    const users = await prisma.user.findMany({
      select: { email: true, name: true, role: true, createdAt: true },
    });
    if (users.length === 0) {
      console.log("No registered users found.");
    } else {
      console.table(users);
    }
    return;
  }

  const targetEmail = emailToDelete.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: targetEmail },
  });

  if (!user) {
    console.log(`❌ User with email "${targetEmail}" not found in database.`);
    return;
  }

  // Delete user (Prisma cascade deletes sessions, accounts, enrollments, etc.)
  await prisma.user.delete({
    where: { email: targetEmail },
  });

  // Delete OTP verification records for this email
  await prisma.verification.deleteMany({
    where: { identifier: targetEmail },
  });

  console.log(`✅ Successfully removed registered user: ${targetEmail} (${user.name})`);
}

main()
  .catch((err) => console.error("Error deleting user:", err))
  .finally(() => prisma.$disconnect());
