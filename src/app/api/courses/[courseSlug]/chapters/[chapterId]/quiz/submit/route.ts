import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseSlug: string; chapterId: string }> }
) {
  try {
    const { courseSlug, chapterId } = await params;
    const body = await req.json();
    const { answers } = body;

    // Resolve user via Better Auth or custom sessionToken cookie
    const cookieStore = await cookies();
    const sessionToken =
      cookieStore.get("better-auth.session_token")?.value ||
      cookieStore.get("sessionToken")?.value;

    let user = null;
    if (sessionToken) {
      const session = await db.session.findUnique({
        where: { token: sessionToken },
        include: { user: true },
      });
      user = session?.user;
    }

    if (!user) {
      // Fallback for local development testing/mock support if no active user session
      user = await db.user.findFirst();
      if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
    }

    // Find course by slug
    const course = await db.course.findFirst({
      where: { language: courseSlug.toLowerCase() },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const parsed = parseInt(chapterId.replace(/[^0-9]/g, ""), 10);
    const orderNum = isNaN(parsed) ? 0 : parsed;
    const chapter = await db.chapter.findFirst({
      where: {
        courseId: course.id,
        orderNumber: orderNum,
      },
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    if (!chapter.quizData) {
      return NextResponse.json({ error: "No quiz data found for this chapter" }, { status: 400 });
    }

    const allQuestions = JSON.parse(chapter.quizData);
    let correctCount = 0;
    const totalCount = allQuestions.length;

    const breakdown = allQuestions.map((q: any) => {
      let userAnswer = -1;
      if (Array.isArray(answers)) {
        userAnswer = answers[q.id - 1] ?? -1;
      } else if (answers && typeof answers === "object") {
        userAnswer = answers[String(q.id)] ?? answers[Number(q.id)] ?? -1;
      }

      const isCorrect = userAnswer === q.answer;
      if (isCorrect) {
        correctCount++;
      }

      return {
        questionId: q.id,
        question: q.question,
        options: q.options,
        userAnswer,
        correctAnswer: q.answer,
        correct: isCorrect,
      };
    });

    const scorePercentage = Math.round((correctCount / totalCount) * 100);
    const passed = scorePercentage >= 70;

    // Update progress in database if passed
    if (passed) {
      const existingProgress = await db.chapterProgress.findUnique({
        where: {
          userId_chapterId: {
            userId: user.id,
            chapterId: chapter.id,
          },
        },
      });

      if (existingProgress) {
        await db.chapterProgress.update({
          where: { id: existingProgress.id },
          data: {
            isCompleted: true,
            quizScore: scorePercentage,
          },
        });
      } else {
        await db.chapterProgress.create({
          data: {
            userId: user.id,
            chapterId: chapter.id,
            isCompleted: true,
            quizScore: scorePercentage,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      score: scorePercentage,
      passed,
      correctCount,
      totalCount,
      breakdown,
    });
  } catch (error) {
    console.error("POST Quiz Submit Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
