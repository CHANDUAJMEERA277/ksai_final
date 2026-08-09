import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const sessionData = await auth.api.getSession({ headers: req.headers });
    if (!sessionData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = sessionData.user.id;

    // 1. Fetch all user enrollments
    const enrollments = await db.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            chapters: true,
          },
        },
      },
    });

    const certificatesList = [];
    const inProgressList = [];

    for (const enroll of enrollments) {
      const course = enroll.course;
      if (!course) continue;

      const totalChapters = course.chapters.length;
      if (totalChapters === 0) continue;

      const completedChapters = await db.chapterProgress.count({
        where: {
          userId,
          chapterId: { in: course.chapters.map((ch) => ch.id) },
          isCompleted: true,
        },
      });

      if (completedChapters === totalChapters) {
        // Course is fully completed! Check/create certificate record
        let cert = await db.certificate.findFirst({
          where: { userId, courseId: course.id },
        });

        if (!cert) {
          const uniqueId = `KSAI-CERT-${course.language.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
          const verificationId = `v_${Math.random().toString(36).substring(2, 10)}`;

          cert = await db.certificate.create({
            data: {
              userId,
              courseId: course.id,
              uniqueId,
              verificationId,
            },
          });
        }

        certificatesList.push({
          id: cert.id,
          uniqueId: cert.uniqueId,
          verificationId: cert.verificationId,
          createdAt: cert.createdAt,
          courseName: course.title,
          courseLanguage: course.language,
          instructor: course.instructor,
        });
      } else {
        inProgressList.push({
          courseId: course.id,
          courseName: course.title,
          courseLanguage: course.language,
          completedCount: completedChapters,
          totalCount: totalChapters,
        });
      }
    }

    return NextResponse.json({
      success: true,
      certificates: certificatesList,
      inProgress: inProgressList,
    });
  } catch (error) {
    console.error("Fetch certificates error:", error);
    return NextResponse.json({ error: "Failed to load certificates" }, { status: 500 });
  }
}
