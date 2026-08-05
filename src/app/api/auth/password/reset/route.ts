import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and new password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Verify email verification has been completed recently
    const verifiedRecord = await db.verification.findFirst({
      where: { identifier: `verified:${cleanEmail}` },
    });

    if (!verifiedRecord || new Date() > verifiedRecord.expiresAt) {
      return NextResponse.json(
        { error: "Email verification is required before resetting password. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Find the user to ensure account exists
    const user = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address." },
        { status: 404 }
      );
    }

    // Hash new password and update user record
    const passwordHash = await bcrypt.hash(password, 10);
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        provider: "CREDENTIALS", // Reset provider to CREDENTIALS if they were social, or ensure they can log in
      },
    });

    // Delete verified OTP record after reset
    await db.verification.deleteMany({
      where: { identifier: `verified:${cleanEmail}` },
    });

    console.log(`✅ [PASSWORD RESET] Success for email: ${cleanEmail}`);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Password Reset API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error resetting password." },
      { status: 500 }
    );
  }
}
