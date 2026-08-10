import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const contests = await db.contest.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      include: {
        challenges: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            testCases: true,
            createdAt: true,
          },
        },
      },
    });

    const sanitizedContests = contests.map((contest) => ({
      ...contest,
      challenges: contest.challenges.map((ch) => {
        let sanitizedTestCases: any[] = [];
        try {
          const parsed = typeof ch.testCases === "string" ? JSON.parse(ch.testCases) : ch.testCases;
          if (Array.isArray(parsed)) {
            sanitizedTestCases = parsed.map((tc) => {
              if (tc && typeof tc === "object") {
                const { expectedOutput, output, expected_output, expected, result, actualOutput, ...rest } = tc as any;
                return rest;
              }
              return tc;
            });
          }
        } catch {
          sanitizedTestCases = [];
        }

        return {
          ...ch,
          testCases: JSON.stringify(sanitizedTestCases),
        };
      }),
    }));

    return NextResponse.json({ success: true, contests: sanitizedContests });
  } catch (error) {
    console.error("GET Public Contests Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
