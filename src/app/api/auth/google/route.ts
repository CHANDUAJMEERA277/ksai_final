import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, googleId, image } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Name and email are required from Google verification." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    let user = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    // If user exists and profile is fully set up with a password, log them in
    if (user && user.passwordHash) {
      await db.session.deleteMany({ where: { userId: user.id } });

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
        action: "login",
        message: "Google login successful.",
        user,
      });

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
    }

    // User is new or incomplete Google account -> return prefill data for existing SignUp form
    return NextResponse.json({
      action: "register",
      message: "Google email verified. Please complete your registration details.",
      prefill: {
        name,
        email: cleanEmail,
        googleId: googleId || `google_${randomUUID()}`,
        image: image || null,
        emailVerified: true,
      },
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during Google authentication." },
      { status: 500 }
    );
  }
}