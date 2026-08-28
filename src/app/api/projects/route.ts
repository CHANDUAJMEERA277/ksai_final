import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCourseProjects } from "@/lib/projects/project-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.nextUrl.searchParams.get("userEmail");
    const course = request.nextUrl.searchParams.get("course") || "all";

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

    const projects = await getCourseProjects(course, user.id);

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error: any) {
    console.error("Projects GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve projects." },
      { status: 500 }
    );
  }
}
