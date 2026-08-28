import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { completeProjectMilestone } from "@/lib/projects/project-service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, projectId, milestoneId } = body;

    if (!userEmail || !projectId || !milestoneId) {
      return NextResponse.json(
        { success: false, error: "userEmail, projectId, and milestoneId are required." },
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

    await completeProjectMilestone(user.id, user.email, projectId, milestoneId);

    return NextResponse.json({
      success: true,
      message: "Milestone completed and learning evidence recorded in Knowledge Graph.",
    });
  } catch (error: any) {
    console.error("Project Milestone Complete error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to complete milestone." },
      { status: 500 }
    );
  }
}
