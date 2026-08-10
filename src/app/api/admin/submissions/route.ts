import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    const submissions = await db.submission.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        challenge: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            contest: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    const formattedSubmissions = submissions.map((s) => ({
      id: s.id,
      studentName: s.user.name,
      studentEmail: s.user.email,
      challengeTitle: s.challenge.title,
      contestTitle: s.challenge.contest?.title || "Contest",
      difficulty: s.challenge.difficulty,
      status: s.status,
      xpAwarded: s.xpAwarded,
      createdAt: s.createdAt,
    }));

    return NextResponse.json({ success: true, submissions: formattedSubmissions });
  } catch (error) {
    console.error("GET Admin Submissions Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
