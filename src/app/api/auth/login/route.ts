import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Find user by email in local database
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Google/OAuth users without a set password
    if (!user.passwordHash) {
      return NextResponse.json(
        {
          error:
            "This account was registered using Google. Please sign in using 'Continue with Google'.",
        },
        { status: 401 }
      );
    }

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        country: user.country,
        createdAt: user.createdAt,
      },
    });

    let setCookieHeader = null;
    try {
      const sessionResponse = await auth.api.signInEmail({
        body: {
          email: user.email,
          password,
          rememberMe: true,
        },
        asResponse: true,
        headers: req.headers,
      });
      setCookieHeader = sessionResponse?.headers?.get("set-cookie") || null;
    } catch (e) {
      // Fallback to manual session creation
    }

    if (setCookieHeader) {
      response.headers.set("set-cookie", setCookieHeader);
    } else {
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await db.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });
      response.cookies.set("better-auth.session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
        path: "/",
      });
      response.cookies.set("sessionToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during login." },
      { status: 500 }
    );
  }
}
