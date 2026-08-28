import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildMentorContext, generateMentorGuidance } from "@/lib/mentor/mentor-service";
import { SupportedCourse } from "@/lib/knowledge-graph/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, message, course } = body;

    if (!userEmail || !message) {
      return NextResponse.json(
        { success: false, error: "userEmail and message are required." },
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

    const preferredCourse = (course || "python").toLowerCase() as SupportedCourse;
    const context = await buildMentorContext(user.id, preferredCourse);
    const guidance = await generateMentorGuidance(context, message);

    return NextResponse.json({
      success: true,
      data: {
        text: guidance.text,
        actions: guidance.actions,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("AI Mentor Chat POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process mentor message." },
      { status: 500 }
    );
  }
}
