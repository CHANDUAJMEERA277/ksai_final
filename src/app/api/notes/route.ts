import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { parseSessionToken } from "@/lib/auth-cookie";

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
 * GET /api/notes
 *
 * Returns the logged-in student's notes.
 *
 * Optional:
 * ?courseId=...
 * ?chapterId=...
 * ?topic=...
 * ?type=...
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;

    const courseId = searchParams.get("courseId");
    const chapterId = searchParams.get("chapterId");
    const topic = searchParams.get("topic");
    const type = searchParams.get("type");

    const notes = await db.learningNote.findMany({
      where: {
        userId: user.id,

        ...(courseId
          ? {
              courseId,
            }
          : {}),

        ...(chapterId
          ? {
              chapterId,
            }
          : {}),

        ...(topic
          ? {
              topic,
            }
          : {}),

        ...(type
          ? {
              type,
            }
          : {}),
      },

      include: {
        course: {
          select: {
            id: true,
            title: true,
            language: true,
          },
        },

        chapter: {
          select: {
            id: true,
            title: true,
            orderNumber: true,
            explanation: true,
          },
        },
      },

      orderBy: [
        {
          isPinned: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      notes,
      count: notes.length,
    });
  } catch (error) {
    console.error("GET /api/notes error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load notes.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notes
 *
 * Creates a permanent learning note and optionally
 * records the corresponding learning event.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      courseId,
      chapterId,
      topic,
      title,
      type,
      content,
      metadata,
      importance,
      isPinned,
      eventType,
      saveEvent,
    } = body;

    if (
      !courseId ||
      !chapterId ||
      !topic ||
      !title ||
      !type ||
      !content
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "courseId, chapterId, topic, title, type and content are required.",
        },
        { status: 400 }
      );
    }

    const validTypes = [
      "EXPLANATION",
      "EXAMPLE",
      "QUESTION",
      "CORRECTION",
      "CODE",
      "VISUAL",
      "TIP",
      "MISTAKE",
      "PRACTICE",
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid note type: ${type}`,
        },
        { status: 400 }
      );
    }

    // Verify course
    const course = await db.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          error: "Course not found.",
        },
        { status: 404 }
      );
    }

    // Verify chapter belongs to course
    const chapter = await db.chapter.findFirst({
      where: {
        id: chapterId,
        courseId,
      },
      select: {
        id: true,
      },
    });

    if (!chapter) {
      return NextResponse.json(
        {
          success: false,
          error: "Chapter does not belong to this course.",
        },
        { status: 400 }
      );
    }

    const note = await db.learningNote.create({
      data: {
        userId: user.id,
        courseId,
        chapterId,
        topic,
        title,
        type,
        content,
        metadata:
          typeof metadata === "string"
            ? metadata
            : metadata
              ? JSON.stringify(metadata)
              : null,
        importance:
          typeof importance === "number"
            ? importance
            : 1,
        isPinned:
          typeof isPinned === "boolean"
            ? isPinned
            : false,
      },

      include: {
        course: {
          select: {
            id: true,
            title: true,
            language: true,
          },
        },

        chapter: {
          select: {
            id: true,
            title: true,
            orderNumber: true,
            explanation: true,
          },
        },
      },
    });

    // Record learning event when requested.
    if (saveEvent !== false) {
      await db.learningEvent.create({
        data: {
          userId: user.id,
          courseId,
          chapterId,
          topic,
          eventType:
            typeof eventType === "string"
              ? eventType
              : type,
          content,
          metadata:
            typeof metadata === "string"
              ? metadata
              : metadata
                ? JSON.stringify(metadata)
                : null,
          shouldSave: true,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        note,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/notes error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create note.",
      },
      { status: 500 }
    );
  }
}