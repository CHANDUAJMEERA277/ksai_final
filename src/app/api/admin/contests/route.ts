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

    const contests = await db.contest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { challenges: true },
        },
        challenges: {
          select: {
            id: true,
            _count: { select: { submissions: true } },
          },
        },
      },
    });

    const formattedContests = contests.map((c) => {
      const totalSubmissions = c.challenges.reduce((sum, ch) => sum + ch._count.submissions, 0);
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        status: c.status,
        startTime: c.startTime,
        endTime: c.endTime,
        challengesCount: c._count.challenges,
        submissionsCount: totalSubmissions,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    });

    return NextResponse.json({ success: true, contests: formattedContests });
  } catch (error) {
    console.error("GET Admin Contests Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, status, startTime, endTime } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
    }

    const contest = await db.contest.create({
      data: {
        title,
        description,
        status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ success: true, contest });
  } catch (error) {
    console.error("POST Admin Contest Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
