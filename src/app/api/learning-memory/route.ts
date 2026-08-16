import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const userEmail =
      request.nextUrl.searchParams.get("userEmail");

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
        name: true,
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
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

    const needsReview = progress.filter(
      item =>
        item.status === "NEEDS_REVIEW"
    );

    const mastered = progress.filter(
      item =>
        item.status === "MASTERED"
    );

    const learning = progress.filter(
      item =>
        item.status === "LEARNING"
    );

    const practiced = progress.filter(
      item =>
        item.status === "PRACTICED"
    );

    const total = progress.length;

    const masteryPercentage =
      total > 0
        ? Math.round(
            (mastered.length / total) * 100
          )
        : 0;

    /*
     * Recent weak topics
     */
    const reviewTopics =
      needsReview
        .slice(0, 10)
        .map(item => ({
          topic: item.topic,
          chapterId: item.chapterId,
          masteryScore:
            item.masteryScore,
          attempts: item.attempts,
          accuracy:
            item.totalQuestions > 0
              ? Math.round(
                  (item.correctAnswers /
                    item.totalQuestions) *
                    100
                )
              : 0,
          recommendation:
            `Review ${item.topic} before moving to harder concepts.`,
        }));

    /*
     * Strong topics
     */
    const masteredTopics =
      mastered
        .slice(0, 10)
        .map(item => ({
          topic: item.topic,
          chapterId: item.chapterId,
          masteryScore:
            item.masteryScore,
        }));

    return NextResponse.json({
      success: true,

      memory: {
        totalTopics: total,

        mastered: mastered.length,
        learning: learning.length,
        practiced: practiced.length,
        needsReview: needsReview.length,

        masteryPercentage,

        reviewTopics,
        masteredTopics,
      },
    });
  } catch (error) {
    console.error(
      "Learning memory error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to load learning memory.",
      },
      { status: 500 }
    );
  }
}