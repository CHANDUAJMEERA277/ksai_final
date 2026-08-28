import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNextAdaptiveQuestion } from "@/lib/assessment/adaptive-engine";
import { SupportedCourse } from "@/lib/knowledge-graph/types";
import { AssessmentDifficulty } from "@/lib/assessment/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.nextUrl.searchParams.get("userEmail");
    const course = (request.nextUrl.searchParams.get("course") || "python").toLowerCase() as SupportedCourse;
    const chapterId = request.nextUrl.searchParams.get("chapterId") || undefined;
    const topic = request.nextUrl.searchParams.get("topic") || undefined;
    const difficulty = (request.nextUrl.searchParams.get("difficulty") || undefined) as AssessmentDifficulty | undefined;
    const excludeFingerprints = request.nextUrl.searchParams.get("excludeFingerprints")?.split(",") || [];

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "userEmail is required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    const question = await getNextAdaptiveQuestion({
      userId: user.id,
      userEmail: user.email,
      course,
      chapterId,
      topic,
      preferredDifficulty: difficulty,
      excludeFingerprints,
    });

    return NextResponse.json({
      success: true,
      data: question,
    });
  } catch (error: any) {
    console.error("Adaptive Assessment Question GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate adaptive question." },
      { status: 500 }
    );
  }
}
