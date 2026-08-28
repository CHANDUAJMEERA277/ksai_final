import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateAdaptiveAnswer } from "@/lib/assessment/adaptive-engine";
import { SupportedCourse } from "@/lib/knowledge-graph/types";
import { AssessmentDifficulty } from "@/lib/assessment/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userEmail,
      course,
      chapterId,
      topic,
      conceptSlug,
      questionId,
      question,
      studentAnswer,
      difficulty,
      options,
      correctOptionIndex,
      expectedExplanation,
    } = body;

    if (!userEmail || !question || studentAnswer === undefined) {
      return NextResponse.json(
        { success: false, error: "userEmail, question, and studentAnswer are required." },
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

    const evaluation = await evaluateAdaptiveAnswer({
      userId: user.id,
      userEmail: user.email,
      course: (course || "python").toLowerCase() as SupportedCourse,
      chapterId: chapterId || "general",
      topic: topic || "Adaptive Assessment",
      conceptSlug,
      questionId: questionId || `q_${Date.now()}`,
      question,
      studentAnswer: String(studentAnswer),
      difficulty: (difficulty || "MEDIUM") as AssessmentDifficulty,
      options,
      correctOptionIndex,
      expectedExplanation,
    });

    return NextResponse.json({
      success: true,
      data: evaluation,
    });
  } catch (error: any) {
    console.error("Adaptive Assessment Evaluation POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to evaluate adaptive answer." },
      { status: 500 }
    );
  }
}
