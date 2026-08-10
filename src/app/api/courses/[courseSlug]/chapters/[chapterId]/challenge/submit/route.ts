import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { parseSessionToken } from "@/lib/auth-cookie";
import { XP_CONFIG } from "@/lib/xp-config";
import { awardXpAndStreak } from "@/lib/xp-service";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseSlug: string; chapterId: string }> }
) {
  try {
    const { courseSlug, chapterId } = await params;
    const body = await req.json().catch(() => ({}));
    const difficultyRaw = (body.difficulty || "EASY").toString().toUpperCase();

    // Check for explicit submission failure
    if (body.passed === false || body.status === "failed" || body.solved === false) {
      return NextResponse.json({
        success: false,
        passed: false,
        xpEarned: 0,
        message: "Challenge submission failed or test cases did not pass.",
      });
    }

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
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Determine course and chapter if available
    const course = await db.course.findFirst({
      where: { language: courseSlug.toLowerCase() },
    });

    const parsedOrder = parseInt(chapterId.replace(/[^0-9]/g, ""), 10);
    const orderNum = isNaN(parsedOrder) ? 0 : parsedOrder;
    const chapter = course
      ? await db.chapter.findFirst({
          where: {
            courseId: course.id,
            orderNumber: orderNum,
          },
        })
      : null;

    // Validate difficulty tier (EASY: 30 XP, MEDIUM: 75 XP, HARD: 150 XP)
    const validTiers = ["EASY", "MEDIUM", "HARD"] as const;
    const difficultyTier = validTiers.includes(difficultyRaw as any)
      ? (difficultyRaw as (typeof validTiers)[number])
      : "EASY";

    const amount = XP_CONFIG.CHALLENGE_SOLVED[difficultyTier];

    // Check if user has already solved this chapter challenge to enforce idempotency
    let isAlreadySolved = false;
    let existingProgress = null;

    if (chapter) {
      existingProgress = await db.chapterProgress.findUnique({
        where: {
          userId_chapterId: {
            userId: user.id,
            chapterId: chapter.id,
          },
        },
      });

      if (existingProgress?.codeSolved) {
        isAlreadySolved = true;
      }
    } else {
      // Fallback check in ActivityLog for non-chapter challenge idempotency
      const previousSolveLog = await db.activityLog.findFirst({
        where: {
          userId: user.id,
          actionType: "CHALLENGE_SOLVED",
          metadata: { contains: chapterId },
        },
      });
      if (previousSolveLog) {
        isAlreadySolved = true;
      }
    }

    // Idempotent behavior: if already solved, do NOT award duplicate XP
    if (isAlreadySolved) {
      const currentUser = await db.user.findUnique({
        where: { id: user.id },
        select: { id: true, currentStreak: true, longestStreak: true },
      });

      return NextResponse.json({
        success: true,
        alreadySolved: true,
        difficulty: difficultyTier,
        xpEarned: 0,
        currentStreak: currentUser?.currentStreak ?? 0,
        longestStreak: currentUser?.longestStreak ?? 0,
        message: "Challenge already solved previously; no additional XP awarded.",
      });
    }

    // Mark codeSolved on chapter progress if chapter exists
    if (chapter) {
      if (existingProgress) {
        await db.chapterProgress.update({
          where: { id: existingProgress.id },
          data: { codeSolved: true },
        });
      } else {
        await db.chapterProgress.create({
          data: {
            userId: user.id,
            chapterId: chapter.id,
            codeSolved: true,
          },
        });
      }
    }

    // Award XP and update streak with source="challenge_solved" for first accepted solve
    const xpResult = await awardXpAndStreak({
      userId: user.id,
      amount,
      source: "challenge_solved",
      courseId: course?.id ?? null,
    });

    // Log activity record
    await db.activityLog.create({
      data: {
        userId: user.id,
        actionType: "CHALLENGE_SOLVED",
        metadata: JSON.stringify({
          difficulty: difficultyTier,
          xpEarned: amount,
          courseSlug,
          chapterId,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      alreadySolved: false,
      difficulty: difficultyTier,
      xpEarned: xpResult.xpAwarded,
      currentStreak: xpResult.user.currentStreak,
      longestStreak: xpResult.user.longestStreak,
      user: {
        id: xpResult.user.id,
        currentStreak: xpResult.user.currentStreak,
        longestStreak: xpResult.user.longestStreak,
      },
    });
  } catch (error) {
    console.error("POST Challenge Submit Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
