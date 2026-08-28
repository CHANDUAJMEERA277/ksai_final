import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAIProjectCoachAdvice } from "@/lib/projects/project-service";
import { CoachAssistanceMode } from "@/lib/projects/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userEmail,
      projectId,
      milestoneId,
      mode,
      userQuery,
      submittedCode,
      errorMessage,
      expectedOutput,
    } = body;

    if (!userEmail || !projectId || !milestoneId || !mode) {
      return NextResponse.json(
        { success: false, error: "userEmail, projectId, milestoneId, and mode are required." },
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

    const advice = await getAIProjectCoachAdvice({
      userId: user.id,
      userEmail: user.email,
      projectId,
      milestoneId,
      mode: mode as CoachAssistanceMode,
      userQuery,
      submittedCode,
      errorMessage,
      expectedOutput,
    });

    return NextResponse.json({
      success: true,
      data: advice,
    });
  } catch (error: any) {
    console.error("AI Project Coach POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate project advice." },
      { status: 500 }
    );
  }
}
