import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCollegeAnalytics } from "@/lib/college/college-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.nextUrl.searchParams.get("userEmail");
    const collegeParam = request.nextUrl.searchParams.get("college");

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "userEmail is required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, role: true, college: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    const effectiveCollege = collegeParam || user.college || "KnowledgeStream Institute of Technology";

    const analytics = await getCollegeAnalytics(
      effectiveCollege,
      user.role || "Student",
      userEmail
    );

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    console.error("College Analytics GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load college analytics." },
      { status: 500 }
    );
  }
}
