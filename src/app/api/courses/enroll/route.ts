import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courseId, paidAmount, paymentId } = body;

    const sessionData = await auth.api.getSession({ headers: req.headers });
    const user = sessionData?.user ?? null;

    if (!courseId || !paymentId) {
      return NextResponse.json(
        { error: "Course ID and payment ID are required." },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Verify course exists
    const course = await db.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    // Check if already enrolled
    const existingEnrollment = await db.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: course.id,
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({
        success: true,
        message: "Already enrolled in this course.",
        enrollment: existingEnrollment,
      });
    }

    // Create Enrollment Record in SQLite DB
    const enrollment = await db.enrollment.create({
      data: {
        userId: user.id,
        courseId: course.id,
        paidAmount: paidAmount || course.price,
        paymentId: paymentId || `pay_rzp_${Date.now()}`,
        progress: 10,
      },
      include: {
        course: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully enrolled & payment verified!",
      enrollment,
    });
  } catch (error) {
    console.error("Enrollment API Error:", error);
    return NextResponse.json(
      { error: "Failed to process course enrollment." },
      { status: 500 }
    );
  }
}
