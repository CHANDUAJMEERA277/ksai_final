import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.email) {
    return NextResponse.json({ history: [] });
  }

  const rows = await db.practice.findMany({ where: { userEmail: session.user.email }, orderBy: { createdAt: "desc" }, take: 20 });
  const history = rows.map((r) => {
    let meta: any = {};
    try {
      meta = r.meta ? JSON.parse(r.meta) : {};
    } catch (e) {
      meta = { raw: r.meta };
    }

    const course = meta.courseTitle || "Practice Session";
    const difficulty = meta.difficulty || "mixed";
    const duration = meta.timeTakenSeconds ?? meta.timeTaken ?? meta.duration ?? 0;
    const questionCount = Array.isArray(meta.quiz) ? meta.quiz.length : meta.generated ?? 0;

    return {
      id: r.id,
      courseId: r.courseId,
      courseTitle: course,
      createdAt: r.createdAt,
      score: typeof meta.scorePercent === "number" ? meta.scorePercent : (typeof meta.score === "number" ? meta.score : null),
      accuracy: meta.accuracy ?? null,
      difficulty,
      duration,
      questionCount,
      weakTopics: Array.isArray(meta.weakTopics) ? meta.weakTopics : [],
      meta,
    };
  });

  return NextResponse.json({ history });
}

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await db.practice.deleteMany({ where: { id, userEmail: session.user.email } });
  return NextResponse.json({ deleted: true });
}
