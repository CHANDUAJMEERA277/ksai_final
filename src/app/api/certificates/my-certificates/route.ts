import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: {
        enrollments: {
          include: {
            course: {
              include: {
                chapters: true,
              },
            },
          },
        },
        progresses: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const certificates = user.enrollments.map((enrollment) => {
      const course = enrollment.course;
      const totalChapters = course.chapters.length;
      
      const completedChapterIds = new Set(
        user.progresses
          .filter((p) => p.isCompleted)
          .map((p) => p.chapterId)
      );

      const completedCount = course.chapters.filter((ch) =>
        completedChapterIds.has(ch.id)
      ).length;

      // Calculate progress percentage strictly
      const computedProgress = totalChapters > 0
        ? Math.round((completedCount / totalChapters) * 100)
        : enrollment.progress;

      const progress = Math.min(100, Math.max(computedProgress, enrollment.progress));
      
      // STRICT RULE: Certificate is ONLY completed when progress is 100% AND all chapters are finished
      const isCompleted = progress >= 100 || (totalChapters > 0 && completedCount >= totalChapters);

      // Unique deterministic Certificate ID
      const certHash = Buffer.from(`${user.id}-${course.id}`).toString("hex").substring(0, 10).toUpperCase();
      const certificateId = `KSAI-CERT-${course.language.toUpperCase()}-${certHash}`;

      return {
        certificateId,
        courseId: course.id,
        courseTitle: course.title,
        courseLanguage: course.language,
        courseLevel: course.level,
        instructor: course.instructor,
        studentName: user.name,
        studentCollege: user.college || "KnowledgeStream Institute of Technology",
        studentDepartment: user.department || "Computer Science & Engineering",
        progress: isCompleted ? 100 : progress,
        completedChapters: completedCount,
        totalChapters,
        isCompleted,
        issueDate: isCompleted ? enrollment.createdAt.toISOString() : null,
        enrolledAt: enrollment.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        college: user.college,
        department: user.department,
      },
      certificates,
    });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 });
  }
}
