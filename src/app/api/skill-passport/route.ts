import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentSkillPassport } from "@/lib/skill-passport/passport-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.nextUrl.searchParams.get("userEmail");

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

    const passport = await getStudentSkillPassport(user.id);

    return NextResponse.json({
      success: true,
      data: passport,
    });
  } catch (error: any) {
    console.error("Skill Passport GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load skill passport." },
      { status: 500 }
    );
  }
}
