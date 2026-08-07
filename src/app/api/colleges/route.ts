import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const usersWithCollege = await db.user.findMany({
      where: {
        college: {
          not: null,
        },
      },
      select: {
        college: true,
      },
      distinct: ["college"],
    });

    const colleges = usersWithCollege
      .map((u) => u.college?.trim())
      .filter((c): c is string => Boolean(c && c.length > 0))
      .sort();

    return NextResponse.json({
      success: true,
      colleges,
    });
  } catch (error) {
    console.error("GET /api/colleges Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
