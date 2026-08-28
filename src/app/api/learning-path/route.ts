import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPersonalizedLearningPath } from "@/lib/learning-path/path-engine";

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

    const path = await getPersonalizedLearningPath(user.id, courseSlug);

    return NextResponse.json({
      success: true,
      data: path,
    });
  } catch (error: any) {
    console.error("Personalized Learning Path API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to calculate personalized learning path." },
      { status: 500 }
    );
  }
}
