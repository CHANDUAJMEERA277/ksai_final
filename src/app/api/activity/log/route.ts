import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { parseSessionToken } from "@/lib/auth-cookie";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { actionType, metadata } = await req.json();

    if (!actionType) {
      return NextResponse.json({ error: "actionType is required" }, { status: 400 });
    }

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
      user = await db.user.findFirst();
      if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
    }

    // 2. Log activity in database
    const activity = await db.activityLog.create({
      data: {
        userId: user.id,
        actionType,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    // 3. Award minor XP if it's an editor completion or debug session
    let xpToAdd = 0;
    if (actionType === "EDITOR_FIX" || actionType === "EDITOR_IMPROVEMENT" || actionType === "EDITOR_GUIDANCE") {
      xpToAdd = 10;
    } else if (actionType === "EDITOR_HINT") {
      xpToAdd = 5;
    }

    if (xpToAdd > 0) {
      const dbUser = await db.user.findUnique({ where: { id: user.id } });
      if (dbUser) {
        let currentXp = dbUser.xp + xpToAdd;
        let currentLevel = dbUser.level;
        
        // Handle level up boundary checks
        let targetXp = 1000;
        if (currentLevel >= 10) targetXp = 5000;
        else if (currentLevel >= 5) targetXp = 2500;

        if (currentXp >= targetXp) {
          currentXp -= targetXp;
          currentLevel += 1;
          
          await db.notification.create({
            data: {
              userId: user.id,
              title: "Level Up! 🎉",
              message: `Congratulations! You've reached Level ${currentLevel} through code editor practice!`,
              read: false,
            },
          });
        }

        await db.user.update({
          where: { id: user.id },
          data: {
            xp: currentXp,
            level: currentLevel,
          },
        });
      }
    }

    return NextResponse.json({ success: true, activityId: activity.id });

  } catch (error) {
    console.error("Activity Log API Error:", error);
    return NextResponse.json({ error: "Failed to record activity log" }, { status: 500 });
  }
}
