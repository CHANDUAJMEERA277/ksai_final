import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { parseSessionToken } from "@/lib/auth-cookie";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken =
      cookieStore.get("better-auth.session_token")?.value ||
      cookieStore.get("sessionToken")?.value;

    if (sessionToken) {
      // Clean up the session in the database
      try {
        const rawToken = parseSessionToken(sessionToken);
        await db.session.deleteMany({
          where: { token: rawToken },
        });
      } catch (dbError) {
        console.error("Error deleting session from DB during logout:", dbError);
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });

    // Clear the HTTP-Only cookies
    response.cookies.set("better-auth.session_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });

    response.cookies.set("sessionToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });

    console.log(`✅ [LOGOUT] Session cleared successfully.`);
    return response;
  } catch (error) {
    console.error("Logout API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during logout." },
      { status: 500 }
    );
  }
}
