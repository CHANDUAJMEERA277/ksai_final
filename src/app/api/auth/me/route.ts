import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const sessionData = await auth.api.getSession({ headers: req.headers });

    if (!sessionData?.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const u = sessionData.user as any;

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