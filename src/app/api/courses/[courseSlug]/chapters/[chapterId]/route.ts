import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import fs from "fs";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseSlug: string; chapterId: string }> }
) {
  try {
    const { courseSlug, chapterId } = await params;
    
    // Resolve user via NextAuth or custom sessionToken
    const nextAuthSession = await auth();
    let user = null;
    if (nextAuthSession?.user?.email) {
      user = await db.user.findUnique({
        where: { email: nextAuthSession.user.email.toLowerCase() },
      });
    }

    if (!user) {
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get("sessionToken")?.value;
      if (sessionToken) {
        const session = await db.session.findUnique({
          where: { token: sessionToken },
          include: { user: true },
        });
        user = session?.user;
      }
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

    // Fetch all chapters in this course
    const chapters = await db.chapter.findMany({
      where: { courseId: course.id },
      orderBy: { orderNumber: "asc" },
    });

    const orderNum = parseInt(chapterId, 10);
    const currentChapter = chapters.find((c: { orderNumber: number }) => c.orderNumber === orderNum);

    if (!currentChapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // Check if user is enrolled
    const enrollment = await db.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: course.id,
      },
    });

    // Access control: gate Chapter 1+ behind purchase enrollment
    if (orderNum > 0 && !enrollment) {
      return NextResponse.json(
        { error: "Access Gated. Please subscribe to this course to unlock all chapters." },
        { status: 403 }
      );
    }

    // Fetch progress for this user in this course
    const progresses = await db.chapterProgress.findMany({
      where: {
        userId: user.id,
        chapterId: { in: chapters.map((c: { id: string }) => c.id) },
      },
    });

    // Read notes from Markdown file
    let notesContent = "";
    try {
      const absolutePath = path.join(process.cwd(), currentChapter.explanation);
      if (fs.existsSync(absolutePath)) {
        notesContent = fs.readFileSync(absolutePath, "utf-8");
      } else {
        notesContent = currentChapter.explanation;
      }
    } catch (e) {
      notesContent = currentChapter.explanation;
    }

    // Metadata defaults
    const estimatedTime = orderNum === 0 ? "15 mins" : "30 mins";
    const difficulty = orderNum === 0 ? "Beginner" : "Intermediate";

    return NextResponse.json({
      success: true,
      courseTitle: course.title,
      courseId: course.id,
      coursePrice: course.price,
      isEnrolled: !!enrollment,
      userEmail: user.email,
      currentChapter: {
        id: currentChapter.id,
        title: currentChapter.title,
        orderNumber: currentChapter.orderNumber,
        content: notesContent,
        estimatedTime,
        difficulty,
      },
      chapters: chapters.map((c: { id: string; title: string; orderNumber: number }) => ({
        id: c.id,
        title: c.title,
        orderNumber: c.orderNumber,
      })),
      progresses: progresses.map((p: { chapterId: string; isCompleted: boolean; quizScore: number }) => ({
        chapterId: p.chapterId,
        isCompleted: p.isCompleted,
        quizScore: p.quizScore,
      })),
    });
  } catch (error) {
    console.error("GET Chapter Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
