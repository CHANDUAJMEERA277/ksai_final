import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      phone,
      collegeName,
      college,
      department,
      currentYear,
      role,
      country,
      googleId,
    } = body;

    const targetCollege = collegeName || college || null;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Enforce email verification for non-Google signups
    if (!googleId) {
      const verifiedRecord = await (db as any).verification.findFirst({
        where: { identifier: `verified:${cleanEmail}` },
      });

      if (!verifiedRecord || new Date() > verifiedRecord.expiresAt) {
        return NextResponse.json(
          { error: "Email verification is required before signing up. Please verify your email first." },
          { status: 403 }
        );
      }
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    const passwordHash = await bcrypt.hash(password, 10);
    let user: any;

    if (existingUser) {
      // If user exists and already has a password, reject duplicate registration
      if (existingUser.passwordHash && !googleId) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please log in." },
          { status: 409 }
        );
      }

      // Complete profile for existing Google user without password
      user = await db.user.update({
        where: { id: existingUser.id },
        data: {
          name,
          passwordHash,
          phone: phone || existingUser.phone,
          college: targetCollege || (existingUser as any).college,
          department: department || (existingUser as any).department,
          currentYear: currentYear || (existingUser as any).currentYear,
          role: role || existingUser.role,
          googleId: googleId || (existingUser as any).googleId,
          emailVerified: true,
        } as any,
      });
    } else {
      // Create new user
      user = await db.user.create({
        data: {
          name,
          email: cleanEmail,
          passwordHash,
          phone: phone || null,
          college: targetCollege,
          department: department || null,
          currentYear: currentYear || null,
          role: role || "Student",
          country: country || "United States",
          provider: googleId ? "GOOGLE" : "CREDENTIALS",
          googleId: googleId || null,
          emailVerified: true,
        } as any,
      });
    }

    // Clean up email verification record after successful registration
    await (db as any).verification.deleteMany({
      where: { identifier: `verified:${cleanEmail}` },
    });

    // Delete any previous sessions for single active session per user
    await db.session.deleteMany({
      where: { userId: user.id },
    });

    // Create session token
    const sessionToken = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const session = await db.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt,
      },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        country: user.country,
        college: user.college,
        department: user.department,
        currentYear: user.currentYear,
        createdAt: user.createdAt,
      },
    });

    // Set HTTP-Only Session Cookies
    response.cookies.set("better-auth.session_token", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: session.expiresAt,
      path: "/",
    });

    response.cookies.set("sessionToken", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: session.expiresAt,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("SignUp API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during signup." },
      { status: 500 }
    );
  }
}
