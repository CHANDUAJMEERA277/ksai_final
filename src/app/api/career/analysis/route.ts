import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeCareerReadiness } from "@/lib/career/career-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.nextUrl.searchParams.get("userEmail");
    const roleId = request.nextUrl.searchParams.get("roleId") || "python-backend-engineer";

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

    const analysis = await analyzeCareerReadiness(user.id, roleId);

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error("Career Analysis GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to analyze career readiness." },
      { status: 500 }
    );
  }
}
