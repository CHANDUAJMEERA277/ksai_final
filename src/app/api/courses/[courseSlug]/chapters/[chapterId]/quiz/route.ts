import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { parseSessionToken } from "@/lib/auth-cookie";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseSlug: string; chapterId: string }> }
) {
  try {
    const { courseSlug, chapterId } = await params;
    
    // 1. Primary check: Resolve user via Better Auth session API
    const sessionData = await auth.api.getSession({ headers: req.headers });
    let user = sessionData?.user ?? null;

    // 2. Fallback check: Resolve user via cookie session token lookup in DB
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

    // Check if user is enrolled
    let enrollment = await db.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: course.id,
      },
    });

    if (!enrollment && user.id) {
      try {
        enrollment = await db.enrollment.create({
          data: {
            userId: user.id,
            courseId: course.id,
            paidAmount: 0,
            paymentId: "auto_enroll",
          },
        });
      } catch (e) {
        console.error("Auto enrollment failed", e);
      }
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
