import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { parseSessionToken } from "@/lib/auth-cookie";
import {
  getLeaderboardData,
  LeaderboardScope,
  LeaderboardWindow,
} from "@/lib/leaderboard-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const scopeRaw = searchParams.get("scope")?.toLowerCase() || "global";
    const windowRaw = searchParams.get("window")?.toLowerCase() || "weekly";
    const courseId = searchParams.get("courseId");
    const collegeQuery = searchParams.get("college");
    const weekDateParam = searchParams.get("weekDate");

    const validScopes: LeaderboardScope[] = ["global", "course", "college"];
    const validWindows: LeaderboardWindow[] = ["weekly", "monthly", "alltime"];

    const scope: LeaderboardScope = validScopes.includes(scopeRaw as LeaderboardScope)
      ? (scopeRaw as LeaderboardScope)
      : "global";

    const window: LeaderboardWindow = validWindows.includes(windowRaw as LeaderboardWindow)
      ? (windowRaw as LeaderboardWindow)
      : "weekly";

    // 1. Resolve requesting user via Better Auth or session token cookie
    const sessionData = await auth.api.getSession({ headers: req.headers });
    let user = sessionData?.user ?? null;

    if (!user) {
      const cookieStore = await cookies();
      const sessionToken =
        cookieStore.get("better-auth.session_token")?.value ||
        cookieStore.get("sessionToken")?.value;

      if (sessionToken) {
        const rawToken = parseSessionToken(sessionToken);
        const session = await db.session.findUnique({
          where: { token: rawToken },
          include: { user: true },
        });
        user = session?.user ?? null;
      }
    }

    if (!user) {
      user = await db.user.findFirst();
    }

    // 2. Validate scope-specific required parameters
    if (scope === "course" && (!courseId || courseId.trim() === "")) {
      return NextResponse.json(
        { error: "Missing required parameter: courseId is required for scope=course" },
        { status: 400 }
      );
    }

    let targetCollege = collegeQuery;
    if (scope === "college") {
      if (!targetCollege || targetCollege.trim() === "") {
        targetCollege = user?.college ?? null;
      }
      if (!targetCollege || targetCollege.trim() === "") {
        return NextResponse.json(
          {
            error:
              "Missing required parameter: college is required for scope=college (or must be configured on user profile)",
          },
          { status: 400 }
        );
      }
    }

    // 3. Compute and fetch leaderboard response data
    const leaderboardResult = await getLeaderboardData({
      scope,
      window,
      courseId,
      college: targetCollege,
      requestingUserId: user?.id ?? null,
      targetWeekDate: weekDateParam ? new Date(weekDateParam) : null,
    });

    return NextResponse.json(leaderboardResult);
  } catch (error) {
    console.error("GET Leaderboard Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
