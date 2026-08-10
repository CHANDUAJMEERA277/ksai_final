import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    const { id: contestId } = await params;
    const body = await req.json();
    const { title, description, difficulty, testCases } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
    }

    const contest = await db.contest.findUnique({ where: { id: contestId } });
    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    const validDifficulties = ["EASY", "MEDIUM", "HARD"];
    const normalizedDifficulty = validDifficulties.includes(difficulty?.toUpperCase())
      ? difficulty.toUpperCase()
      : "EASY";

    const testCasesString =
      typeof testCases === "string"
        ? testCases
        : JSON.stringify(testCases || []);

    const challenge = await db.challenge.create({
      data: {
        contestId,
        title,
        description,
        difficulty: normalizedDifficulty,
        testCases: testCasesString,
      },
    });

    return NextResponse.json({ success: true, challenge });
  } catch (error) {
    console.error("POST Admin Create Challenge Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
