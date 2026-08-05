import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
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
      const verifiedRecord = await db.verification.findFirst({
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

      return NextResponse.json({
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
    } else {
      // Create new user via Better Auth signUpEmail API to handle hashing, user record, account, and session!
      const sessionResponse = await auth.api.signUpEmail({
        body: {
          email: cleanEmail,
          password,
          name,
          phone: phone || "",
          college: targetCollege || "",
          department: department || "",
          currentYear: currentYear || "",
          role: role || "Student",
          country: country || "United States",
          provider: googleId ? "GOOGLE" : "CREDENTIALS",
          googleId: googleId || "",
          passwordHash, // Store custom passwordHash field on the User table as well, to support legacy logins!
        },
        asResponse: true,
        headers: req.headers,
      });

      // Clean up email verification record after successful registration
      await db.verification.deleteMany({
        where: { identifier: `verified:${cleanEmail}` },
      });

      const response = NextResponse.json({
        success: true,
        user: {
          email: cleanEmail,
          name,
        },
      });

      const setCookieHeader = sessionResponse.headers.get("set-cookie");
      if (setCookieHeader) {
        response.headers.set("set-cookie", setCookieHeader);
      }

      return response;
    }
  } catch (error) {
    console.error("SignUp API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during signup." },
      { status: 500 }
    );
  }
}
