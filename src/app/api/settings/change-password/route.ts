import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const sessionData = await auth.api.getSession({ headers: req.headers });
    if (!sessionData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = sessionData.user.id;

    const body = await req.json();
    const { oldPassword, newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check old password if user already has a credentials password
    if (user.passwordHash) {
      const match = await bcrypt.compare(oldPassword || "", user.passwordHash);
      if (!match) {
        return NextResponse.json({ error: "Incorrect old password." }, { status: 400 });
      }
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    // Update User table
    await db.user.update({
      where: { id: userId },
      data: { passwordHash: hashed },
    });

    // Update or Create Account credentials record
    const account = await db.account.findFirst({
      where: { userId: userId, providerId: "credential" },
    });

    if (account) {
      await db.account.update({
        where: { id: account.id },
        data: { password: hashed },
      });
    } else {
      await db.account.create({
        data: {
          userId: userId,
          accountId: userId,
          providerId: "credential",
          password: hashed,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Failed to change password." }, { status: 500 });
  }
}
