import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken =
      cookieStore.get("better-auth.session_token")?.value ||
      cookieStore.get("sessionToken")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const session = await db.session.findUnique({
      where: {
        token: sessionToken,
      },
      include: {
        user: true,
      },
    });

    if (!session || new Date() > session.expiresAt) {
      return NextResponse.json(
        { error: "Session expired or invalid" },
        { status: 401 }
      );
    }

    const u = session.user as any;

    return NextResponse.json({
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        country: u.country,
        college: u.college,
        department: u.department,
        currentYear: u.currentYear,
        provider: u.provider,
        googleId: u.googleId,
        emailVerified: u.emailVerified,
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}