import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseSessionToken } from "@/lib/auth-cookie";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionTokenRaw =
      cookieStore.get("better-auth.session_token")?.value ||
      cookieStore.get("sessionToken")?.value;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    let userId = (session?.user as any)?.id;

    if (!userId && sessionTokenRaw) {
      const rawToken = parseSessionToken(sessionTokenRaw);
      const dbSession = await db.session.findUnique({
        where: { token: rawToken },
        select: { userId: true, expiresAt: true },
      });
      if (dbSession && new Date() < dbSession.expiresAt) {
        userId = dbSession.userId;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { password } = body;

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.passwordHash) {
      if (!password) {
        return NextResponse.json(
          { error: "Password is required to confirm account deletion." },
          { status: 400 }
        );
      }
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { error: "Incorrect password. Account deletion aborted." },
          { status: 400 }
        );
      }
    }

    // Cascade delete user account and sessions
    await db.user.delete({
      where: { id: userId },
    });

    const res = NextResponse.json({
      success: true,
      message: "Account deleted successfully.",
    });

    // Clear session cookies
    res.cookies.set("better-auth.session_token", "", { maxAge: 0, path: "/" });
    res.cookies.set("sessionToken", "", { maxAge: 0, path: "/" });

    return res;
  } catch (error: any) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete account." },
      { status: 500 }
    );
  }
}
