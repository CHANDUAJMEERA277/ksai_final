import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { parseSessionToken } from "@/lib/auth-cookie";
import { generateCheckpointQuestionForTopic } from "@/lib/recap-bank";

export const dynamic = "force-dynamic";

async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    return session.user;
  }

  const cookieStore = await cookies();

  const sessionTokenRaw =
    cookieStore.get("better-auth.session_token")?.value ||
    cookieStore.get("sessionToken")?.value;

  if (!sessionTokenRaw) {
    return null;
  }

  const rawToken = parseSessionToken(sessionTokenRaw);

  const dbSession = await db.session.findUnique({
    where: {
      token: rawToken,
    },
    include: {
      user: true,
    },
  });

  if (!dbSession || new Date() >= dbSession.expiresAt) {
    return null;
  }

  return dbSession.user;
}

/**
 * GET /api/recap/daily
 * Query params:
 * - date (YYYY-MM-DD, optional defaults to today)
 * - language (python | c | cpp | java)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rawLanguage = (searchParams.get("language") || searchParams.get("course") || "python").toLowerCase().trim();
    const language = rawLanguage === "c++" ? "cpp" : rawLanguage;
    const requestedDate = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const dateStart = new Date(`${requestedDate}T00:00:00.000Z`);
    const dateEnd = new Date(`${requestedDate}T23:59:59.999Z`);

    // Fetch learning notes created by user today for this exact language
    const notes = await db.learningNote.findMany({
      where: {
        userId: user.id,
        course: {
          language: language,
        },
        createdAt: {
          gte: dateStart,
          lte: dateEnd,
        },
      },
      include: {
        course: { select: { id: true, title: true, language: true } },
        chapter: { select: { id: true, title: true, orderNumber: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const uniqueTopics = Array.from(
      new Set(
        notes
          .map((n) => n.topic || n.title)
          .filter((t) => t && !t.startsWith("Daily Recap") && !t.startsWith("Quick Recap") && !t.startsWith("Chapter"))
      )
    );

    const langDisplay = language === "cpp" ? "C++" : language.toUpperCase();

    if (uniqueTopics.length === 0) {
      return NextResponse.json({
        success: true,
        recap: {
          date: requestedDate,
          language,
          summary: `No completed ${langDisplay} topics recorded for ${requestedDate}. Complete chapter lessons to generate your personalized Daily Recap.`,
          topics: [],
          keyConcepts: [],
          importantSyntax: [],
          revisionAreas: [],
          questions: [
            `What is the most important ${langDisplay} concept you've learned so far?`,
          ],
          stats: { topicsCount: 0, notesCount: 0 },
        },
      });
    }

    const keyConcepts = notes.slice(0, 5).map((n) => `${n.topic || n.title}: Core principle mastered.`);
    const importantSyntax = [
      `Review standard ${langDisplay} syntax patterns practiced in today's completed topics.`,
    ];
    const revisionAreas = [
      `Revisit checkpoint questions and practice code snippets before starting tomorrow's topics.`,
    ];

    const summary = `Today you mastered ${uniqueTopics.length} ${langDisplay} topic${uniqueTopics.length > 1 ? "s" : ""}: ${uniqueTopics.join(", ")}. Solid foundational progress achieved!`;

    // Generate real interactive questions based on topics actually studied today
    const questions = uniqueTopics.map((t) => generateCheckpointQuestionForTopic(language, t));

    const recapData = {
      date: requestedDate,
      language,
      summary,
      topics: uniqueTopics,
      keyConcepts,
      importantSyntax,
      revisionAreas,
      questions,
      primaryQuestion: questions[0] || `What was the most challenging part of today's ${langDisplay} lessons?`,
      stats: {
        topicsCount: uniqueTopics.length,
        notesCount: notes.length,
      },
    };

    return NextResponse.json({
      success: true,
      recap: recapData,
    });
  } catch (error) {
    console.error("GET /api/recap/daily error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load daily recap." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recap/daily
 * Persists interactive daily recap into DailyRecap table and as a LearningNote
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      language = "python",
      date = new Date().toISOString().split("T")[0],
      summary,
      topics = [],
      keyConcepts = [],
      importantSyntax = [],
      revisionAreas = [],
      question,
      studentAnswer,
      aiFeedback,
      understandingDecision, // "CONTINUE" | "REVIEW_AGAIN"
    } = body;

    const langClean = language.toLowerCase() === "c++" ? "cpp" : language.toLowerCase();

    // 1. Upsert in DailyRecap
    const dailyRecap = await db.dailyRecap.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date,
        },
      },
      create: {
        userId: user.id,
        date,
        summary: summary || `Daily learning summary for ${date}`,
        topics: JSON.stringify(topics),
        keyConcepts: JSON.stringify(keyConcepts),
        importantSyntax: JSON.stringify(importantSyntax),
        revisionAreas: JSON.stringify(revisionAreas),
        stats: JSON.stringify({ count: topics.length, language: langClean, question, studentAnswer, aiFeedback, understandingDecision }),
      },
      update: {
        summary: summary || `Daily learning summary for ${date}`,
        topics: JSON.stringify(topics),
        keyConcepts: JSON.stringify(keyConcepts),
        importantSyntax: JSON.stringify(importantSyntax),
        revisionAreas: JSON.stringify(revisionAreas),
        stats: JSON.stringify({ count: topics.length, language: langClean, question, studentAnswer, aiFeedback, understandingDecision }),
      },
    });

    // 2. Resolve course for language
    const course = await db.course.findFirst({
      where: { language: langClean },
      include: { chapters: { take: 1, orderBy: { orderNumber: "asc" } } },
    });

    if (course && course.chapters.length > 0) {
      const chapterId = course.chapters[0].id;
      // Upsert note
      const existing = await db.learningNote.findFirst({
        where: {
          userId: user.id,
          courseId: course.id,
          topic: `Daily Recap • ${date}`,
        },
      });

      const content = `Daily Recap (${date})\n\n${summary}\n\nTopics Learned Today:\n${topics.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}\n\nReview Question:\n${question || ""}\n\nStudent Answer:\n${studentAnswer || "(Voice/Text response)"}\n\nTeacher Feedback:\n${aiFeedback || "Topics reviewed."}\n\nDecision: ${understandingDecision === "REVIEW_AGAIN" ? "Review Today's Topics Again" : "Understood & Continued"}`;

      if (existing) {
        await db.learningNote.update({
          where: { id: existing.id },
          data: {
            content,
            metadata: JSON.stringify({
              date,
              language: langClean,
              topics,
              keyConcepts,
              importantSyntax,
              revisionAreas,
              question,
              studentAnswer,
              aiFeedback,
              understandingDecision: understandingDecision || "CONTINUE",
            }),
            updatedAt: new Date(),
          },
        });
      } else {
        await db.learningNote.create({
          data: {
            userId: user.id,
            courseId: course.id,
            chapterId,
            topic: `Daily Recap • ${date}`,
            title: `Daily Learning Summary (${date})`,
            type: "DAILY_RECAP",
            content,
            metadata: JSON.stringify({
              date,
              language: langClean,
              topics,
              keyConcepts,
              importantSyntax,
              revisionAreas,
              question,
              studentAnswer,
              aiFeedback,
              understandingDecision: understandingDecision || "CONTINUE",
            }),
            importance: 3,
            isPinned: true,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      dailyRecap,
    });
  } catch (error) {
    console.error("POST /api/recap/daily error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to persist daily recap." },
      { status: 500 }
    );
  }
}
