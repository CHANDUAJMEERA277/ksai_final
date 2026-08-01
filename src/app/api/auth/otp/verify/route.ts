import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp || typeof otp !== "string") {
      return NextResponse.json(
        { error: "Email and 6-digit OTP code are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

    if (cleanOtp.length !== 6 || !/^\d+$/.test(cleanOtp)) {
      return NextResponse.json(
        { error: "OTP code must be exactly 6 digits." },
        { status: 400 }
      );
    }

    const identifier = `otp:${cleanEmail}`;

    const record = await (db as any).verification.findFirst({
      where: { identifier },
    });

    if (!record || new Date() > record.expiresAt) {
      return NextResponse.json(
        { error: "OTP has expired or is invalid. Please request a new code." },
        { status: 400 }
      );
    }

    let parsedValue = { otpHash: "", attempts: 0 };
    try {
      parsedValue = JSON.parse(record.value);
    } catch {
      parsedValue = { otpHash: record.value, attempts: 0 };
    }

    if (parsedValue.attempts >= 5) {
      await (db as any).verification.deleteMany({ where: { identifier } });
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new OTP." },
        { status: 429 }
      );
    }

    const isValid = await bcrypt.compare(cleanOtp, parsedValue.otpHash);

    if (!isValid) {
      const updatedAttempts = parsedValue.attempts + 1;
      await (db as any).verification.update({
        where: { id: record.id },
        data: {
          value: JSON.stringify({
            otpHash: parsedValue.otpHash,
            attempts: updatedAttempts,
          }),
        },
      });

      return NextResponse.json(
        { error: `Invalid OTP code. (${5 - updatedAttempts} attempts remaining)` },
        { status: 400 }
      );
    }

    await (db as any).verification.deleteMany({ where: { identifier } });

    const verifiedIdentifier = `verified:${cleanEmail}`;
    await (db as any).verification.deleteMany({ where: { identifier: verifiedIdentifier } });
    await (db as any).verification.create({
      data: {
        identifier: verifiedIdentifier,
        value: "verified",
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    console.log(`✅ [OTP VERIFIED] Email: ${cleanEmail}`);

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error("OTP Verify API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error verifying OTP." },
      { status: 500 }
    );
  }
}
