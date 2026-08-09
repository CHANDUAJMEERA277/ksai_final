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

      // Extract set-cookie headers securely across Node/Next versions
      if (sessionResponse && sessionResponse.headers) {
        const getSetCookieFn = (sessionResponse.headers as any).getSetCookie;
        if (typeof getSetCookieFn === "function") {
          const cookies = sessionResponse.headers.getSetCookie();
          cookies.forEach((c) => {
            response.headers.append("set-cookie", c);
          });
        } else {
          const setCookieHeader = sessionResponse.headers.get("set-cookie");
          if (setCookieHeader) {
            response.headers.set("set-cookie", setCookieHeader);
          }
        }
      }
    } catch (authErr) {
      console.warn("Better-auth session creation warning:", authErr);
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
