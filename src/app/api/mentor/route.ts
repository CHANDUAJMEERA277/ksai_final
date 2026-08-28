import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildMentorContext } from "@/lib/mentor/mentor-service";
import { SupportedCourse } from "@/lib/knowledge-graph/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.nextUrl.searchParams.get("userEmail");
    const course = (request.nextUrl.searchParams.get("course") || "python").toLowerCase() as SupportedCourse;

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "userEmail is required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    const context = await buildMentorContext(user.id, course);

    return NextResponse.json({
      success: true,
      data: context,
    });
  } catch (error: any) {
    console.error("AI Mentor GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load AI Mentor context." },
      { status: 500 }
    );
  }
}
