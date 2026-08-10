import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { parseSessionToken } from "@/lib/auth-cookie";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all");

    const cookieStore = await cookies();
    const sessionTokenRaw =
      cookieStore.get("better-auth.session_token")?.value ||
      cookieStore.get("sessionToken")?.value;

    // 1. Resolve user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    let user = session?.user as any;

    if (!user && sessionTokenRaw) {
      const rawToken = parseSessionToken(sessionTokenRaw);
      const dbSession = await db.session.findUnique({
        where: { token: rawToken },
        include: { user: true },
      });

      if (dbSession && new Date() < dbSession.expiresAt) {
        user = dbSession.user;
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2. Perform updates
    if (all === "true") {
      await db.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true }
      });
    } else if (id) {
      await db.notification.updateMany({
        where: { id, userId: user.id },
        data: { read: true }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Mark notifications read error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
