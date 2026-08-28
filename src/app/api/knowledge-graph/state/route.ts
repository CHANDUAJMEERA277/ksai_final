import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentKnowledgeState } from "@/lib/knowledge-graph/graph-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.nextUrl.searchParams.get("userEmail");
    const courseSlug = request.nextUrl.searchParams.get("courseSlug") || "python";

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

    const state = await getStudentKnowledgeState(user.id, courseSlug);

    return NextResponse.json({
      success: true,
      data: state,
    });
  } catch (error: any) {
    console.error("Knowledge Graph State API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load knowledge state." },
      { status: 500 }
    );
  }
}
