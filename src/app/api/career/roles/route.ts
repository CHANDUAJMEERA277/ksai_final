import { NextResponse } from "next/server";
import { getAvailableCareerRoles } from "@/lib/career/career-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const roles = getAvailableCareerRoles();
    return NextResponse.json({
      success: true,
      data: roles,
    });
  } catch (error: any) {
    console.error("Career Roles GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load career roles." },
      { status: 500 }
    );
  }
}
