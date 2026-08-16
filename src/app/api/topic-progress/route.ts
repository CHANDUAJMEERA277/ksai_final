import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const STATUSES = [
  "NOT_STARTED",
  "LEARNING",
  "PRACTICED",
  "NEEDS_REVIEW",
  "MASTERED",
] as const;

type TopicStatus = (typeof STATUSES)[number];

function calculateStatus(
  attempts: number,
  correctAnswers: number,
  totalQuestions: number,
  masteryScore: number
): TopicStatus {
  if (attempts <= 0) {
    return "NOT_STARTED";
  }

  if (totalQuestions <= 0) {
    return "LEARNING";
  }

  const accuracy = (correctAnswers / totalQuestions) * 100;

  /*
   * Mastery:
   * Strong accuracy + sufficient mastery score.
   */
  if (
    attempts >= 2 &&
    accuracy >= 85 &&
    masteryScore >= 85
  ) {
    return "MASTERED";
  }

  /*
   * Needs review:
   * Student has attempted the topic but performance
   * shows a clear weakness.
   */
  if (
    accuracy < 60 ||
    masteryScore < 50
  ) {
    return "NEEDS_REVIEW";
  }

  /*
   * Practiced:
   * Student has demonstrated reasonable understanding.
   */
  if (
    attempts >= 1 &&
    accuracy >= 70
  ) {
    return "PRACTICED";
  }

  return "LEARNING";
}

export async function GET(request: NextRequest) {
  try {
    const userEmail =
      request.nextUrl.searchParams.get("userEmail");

    const chapterId =
      request.nextUrl.searchParams.get("chapterId");

    const courseId =
      request.nextUrl.searchParams.get("courseId");

    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "userEmail is required.",
        },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: {
        email: userEmail,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found.",
        },
        { status: 404 }
      );
    }

    const progress =
      await db.topicProgress.findMany({
        where: {
          userId: user.id,

          ...(chapterId
            ? { chapterId }
            : {}),

          ...(courseId
            ? { courseId }
            : {}),
        },

        orderBy: {
          updatedAt: "desc",
        },
      });

    const summary = {
      total: progress.length,

      notStarted: progress.filter(
        p => p.status === "NOT_STARTED"
      ).length,

      learning: progress.filter(
        p => p.status === "LEARNING"
      ).length,

      practiced: progress.filter(
        p => p.status === "PRACTICED"
      ).length,

      needsReview: progress.filter(
        p => p.status === "NEEDS_REVIEW"
      ).length,

      mastered: progress.filter(
        p => p.status === "MASTERED"
      ).length,
    };

    const needsReview = progress.filter(
      p => p.status === "NEEDS_REVIEW"
    );

    const mastered = progress.filter(
      p => p.status === "MASTERED"
    );

    return NextResponse.json({
      success: true,
      progress,
      summary,
      memory: {
        needsReview,
        mastered,
      },
    });
  } catch (error) {
    console.error(
      "Topic progress GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load topic progress.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      userEmail,
      courseId,
      chapterId,
      topic,
      attempts,
      correctAnswers,
      totalQuestions,
      masteryScore,
    } = body;

    if (
      !userEmail ||
      !courseId ||
      !chapterId ||
      !topic
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields.",
        },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: {
        email: userEmail,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found.",
        },
        { status: 404 }
      );
    }

    const safeAttempts =
      typeof attempts === "number"
        ? Math.max(0, attempts)
        : 0;

    const safeCorrectAnswers =
      typeof correctAnswers === "number"
        ? Math.max(0, correctAnswers)
        : 0;

    const safeTotalQuestions =
      typeof totalQuestions === "number"
        ? Math.max(0, totalQuestions)
        : 0;

    const safeMasteryScore =
      typeof masteryScore === "number"
        ? Math.max(
            0,
            Math.min(100, masteryScore)
          )
        : 0;

    const status = calculateStatus(
      safeAttempts,
      safeCorrectAnswers,
      safeTotalQuestions,
      safeMasteryScore
    );

    const progress =
      await db.topicProgress.upsert({
        where: {
          userId_chapterId_topic: {
            userId: user.id,
            chapterId,
            topic,
          },
        },

        update: {
          status,

          attempts:
            typeof attempts === "number"
              ? safeAttempts
              : undefined,

          correctAnswers:
            typeof correctAnswers === "number"
              ? safeCorrectAnswers
              : undefined,

          totalQuestions:
            typeof totalQuestions === "number"
              ? safeTotalQuestions
              : undefined,

          masteryScore:
            typeof masteryScore === "number"
              ? safeMasteryScore
              : undefined,

          lastActivity: new Date(),
        },

        create: {
          userId: user.id,
          courseId,
          chapterId,
          topic,
          status,

          attempts: safeAttempts,
          correctAnswers: safeCorrectAnswers,
          totalQuestions: safeTotalQuestions,
          masteryScore: safeMasteryScore,

          lastActivity: new Date(),
        },
      });

    return NextResponse.json({
      success: true,
      progress,
      memory: {
        status,
        needsReview:
          status === "NEEDS_REVIEW",
        mastered:
          status === "MASTERED",
      },
    });
  } catch (error) {
    console.error(
      "Topic progress POST error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to save topic progress.",
      },
      { status: 500 }
    );
  }
}