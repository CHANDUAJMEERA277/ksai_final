import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    let user = null;
    if (email) {
      user = await db.user.findUnique({
        where: { email: email.toLowerCase() },
      });
    }

    if (!user) {
      return NextResponse.json({ success: true, enrollments: [] });
    }

    const enrollments = await db.enrollment.findMany({
      where: { userId: user.id },
      include: { course: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, enrollments });
  } catch (error) {
    console.error("My Courses API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrolled courses." },
      { status: 500 }
    );
  }
}
