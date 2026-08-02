import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

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
      const response = NextResponse.json({
        action: "login",
        message: "Google login successful.",
        user,
      });

      const sessionResponse = await auth.api.signInEmail({
        body: {
          email: user.email,
          password: "",
          rememberMe: true,
        },
        asResponse: true,
        headers: new Headers(),
      });

      const setCookieHeader = sessionResponse.headers.get("set-cookie");
      if (setCookieHeader) {
        response.headers.set("set-cookie", setCookieHeader);
      }

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