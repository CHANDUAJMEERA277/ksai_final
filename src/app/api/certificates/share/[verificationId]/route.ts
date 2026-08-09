import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ verificationId: string }> }
) {
  try {
    const { verificationId } = await params;

    const cert = await db.certificate.findUnique({
      where: { verificationId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        course: {
          select: {
            title: true,
            instructor: true,
            duration: true,
          },
        },
      },
    });

    if (!cert) {
      return NextResponse.json({ error: "Certificate not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      certificate: {
        uniqueId: cert.uniqueId,
        verificationId: cert.verificationId,
        createdAt: cert.createdAt,
        studentName: cert.user.name,
        courseName: cert.course.title,
        instructor: cert.course.instructor,
        duration: cert.course.duration,
      },
    });
  } catch (error) {
    console.error("Fetch share certificate error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
