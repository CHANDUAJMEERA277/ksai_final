import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseSlug: string; chapterId: string }> }
) {
  try {
    const { courseSlug, chapterId } = await params;
    
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

    const orderNum = parseInt(chapterId.replace(/[^0-9]/g, ""), 10) || 1;
    const chapter = await db.chapter.findFirst({
      where: {
        courseId: course.id,
        orderNumber: orderNum,
      },
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // Check if user is enrolled
    const enrollment = await db.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: course.id,
      },
    });

    // Access control: gate Chapter 1+ quiz questions behind purchase enrollment
    if (orderNum > 0 && !enrollment) {
      return NextResponse.json(
        { error: "Access Gated. Please subscribe to this course to unlock this assessment." },
        { status: 403 }
      );
    }

    // Parse quiz questions
    let questions = [];
    if (chapter.quizData) {
      const allQuestions = JSON.parse(chapter.quizData);
      // Strip correct answers to prevent cheat
      questions = allQuestions.map((q: any) => ({
        id: q.id,
        question: q.question,
        options: q.options,
      }));
    }

    return NextResponse.json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error("GET Quiz Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
