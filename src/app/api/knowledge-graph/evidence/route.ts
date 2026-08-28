import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordLearningEvidence } from "@/lib/knowledge-graph/graph-service";
import { SupportedCourse } from "@/lib/knowledge-graph/types";

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
      source,
      score,
      summary,
      mistakes,
      visualReference,
    } = body;

    if (!userEmail || !topic) {
      return NextResponse.json(
        { success: false, error: "userEmail and topic are required." },
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

    const result = await recordLearningEvidence({
      userId: user.id,
      userEmail,
      course: (course || "python") as SupportedCourse,
      chapterId: chapterId || "general",
      topic,
      conceptSlug,
      source: source || "CHECKPOINT",
      score: typeof score === "number" ? score : 85,
      summary: summary || `Learning interaction on ${topic}`,
      mistakes,
      visualReference,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error("Knowledge Graph Evidence API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record knowledge evidence." },
      { status: 500 }
    );
  }
}
