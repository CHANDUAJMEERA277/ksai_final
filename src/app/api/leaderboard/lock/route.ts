import { NextResponse } from "next/server";
import { lockWeekSnapshot, getUtcWeekRange } from "@/lib/leaderboard-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/leaderboard/lock
 * 
 * Locking mechanism for Weekly Coding Leaderboard snapshots.
 * Supports external cron job triggers protected by x-cron-secret header.
 */
export async function POST(req: Request) {
  try {
    const cronSecret = req.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET || process.env.AUTH_SECRET || "dev-cron-secret";

    if (cronSecret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized: Invalid cron secret" }, { status: 401 });
    }

    let targetDate = new Date();
    try {
      const body = await req.json();
      if (body?.weekDate) {
        targetDate = new Date(body.weekDate);
      }
    } catch {
      // Empty body is valid; defaults to current date's week calculation
    }

    const { weekStart, weekEnd } = getUtcWeekRange(targetDate);
    await lockWeekSnapshot(weekStart, weekEnd);

    return NextResponse.json({
      success: true,
      message: `Weekly leaderboard snapshot locked for period ${weekStart.toISOString()} to ${weekEnd.toISOString()}`,
      period: {
        weekStart,
        weekEnd,
      },
    });
  } catch (error) {
    console.error("POST Leaderboard Lock Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
