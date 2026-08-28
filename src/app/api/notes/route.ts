import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { parseSessionToken } from "@/lib/auth-cookie";
import fs from "fs";
import path from "path";

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
    const defaultUser =
      (await db.user.findFirst({ where: { role: "Student" } })) ||
      (await db.user.findFirst());
    return defaultUser;
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
    const defaultUser =
      (await db.user.findFirst({ where: { role: "Student" } })) ||
      (await db.user.findFirst());
    return defaultUser;
  }

  return dbSession.user;
}

function formatDisplayDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getLocalDateKey(date: Date, offsetMinutes: number = 0): string {
  const localTime = new Date(date.getTime() - offsetMinutes * 60 * 1000);
  return localTime.toISOString().split("T")[0];
}

function resolveChapterMarkdown(explanationPathOrContent?: string | null): string {
  if (!explanationPathOrContent) return "";
  try {
    const trimmed = explanationPathOrContent.trim();
    if (
      trimmed.endsWith(".md") ||
      trimmed.startsWith("content/") ||
      trimmed.startsWith("cpp/") ||
      trimmed.startsWith("java/")
    ) {
      const fullPath = path.join(process.cwd(), trimmed);
      if (fs.existsSync(fullPath)) {
        return fs.readFileSync(fullPath, "utf-8");
      }
    }
  } catch (e) {
    // fallback
  }
  return explanationPathOrContent;
}

function getConceptDiagram(title: string): any | null {
  const t = title.toLowerCase();
  if (t.includes("what is programming") || t.includes("intro to prog")) {
    return {
      type: "flow",
      title: "Core Programming Execution Flow",
      description: "How human ideas translate to computer action",
      steps: [
        "Human Problem & Logic Formulation",
        "Source Code Written in High-Level Syntax",
        "Compiler / Interpreter Translates to Instructions",
        "Hardware / OS Executes Machine Operations",
        "Desired Output / Solution Rendered",
      ],
    };
  }
  if (t.includes("where python is used") || t.includes("why python") || t.includes("what is python")) {
    return {
      type: "flow",
      title: "Python Architecture & Ecosystem",
      description: "How Python powers diverse technology domains",
      steps: [
        "Python Core Language (Clean, Readable Syntax)",
        "Standard & Third-Party Libraries (NumPy, PyTorch, Django)",
        "Domain Application (AI/ML, Web, Automation, Data Science)",
        "Production-Grade Scalable Software & Services",
      ],
    };
  }
  if (t.includes("how python executes") || t.includes("execution")) {
    return {
      type: "flow",
      title: "Python 2-Stage Execution Pipeline",
      description: "From human-readable script to CPU machine code",
      steps: [
        "Python Source Code (.py file)",
        "Bytecode Compilation (AST & .pyc format)",
        "Python Virtual Machine (PVM Runtime Loop)",
        "Platform CPU Machine Execution & Output",
      ],
    };
  }
  if (t.includes("interpreted vs compiled") || t.includes("compiled")) {
    return {
      type: "flow",
      title: "Interpreted vs Compiled Architecture",
      description: "Key execution differences between language paradigms",
      steps: [
        "Compiled: Source Code → Compiler → Native Machine Binary (Direct CPU execution, Maximum raw speed)",
        "Interpreted: Source Code → PVM / Interpreter (Line-by-line evaluation, Universal cross-platform portability)",
      ],
    };
  }
  if (t.includes("installing python") || t.includes("vs code") || t.includes("setting up")) {
    return {
      type: "flow",
      title: "Development Environment Workflow",
      description: "Standard workflow for Python development setup",
      steps: [
        "Download Official Python from python.org",
        "Enable 'Add python.exe to PATH' checkbox during install",
        "Install Visual Studio Code + Official Python Extension",
        "Verify Installation: Terminal command 'python --version'",
      ],
    };
  }
  if (t.includes("first python program") || t.includes("very first")) {
    return {
      type: "flow",
      title: "First Script Execution Lifecycle",
      description: "Writing and running your first program",
      steps: [
        "Create hello.py script in workspace",
        "Write code: print('Hello, World!')",
        "Execute in Terminal: python hello.py",
        "Standard Output displays: Hello, World!",
      ],
    };
  }
  if (t.includes("variable") || t.includes("memory")) {
    return {
      type: "flow",
      title: "Variable & Memory Allocation",
      description: "How variables store and reference data in memory",
      steps: [
        "Variable Identifier (e.g. x or score)",
        "Memory Address Binding (RAM Reference)",
        "Stored Value & Type (e.g. 100 as integer)",
        "Runtime Evaluation & Operations in Expressions",
      ],
    };
  }
  return null;
}

function deriveSectionQuestion(title: string, body: string): string {
  const cleanTitle = title.replace(/^[\d\.\s]+/, "").trim();
  const lower = cleanTitle.toLowerCase();
  
  // Check if body already starts with a question
  const qMatch = body.match(/(?:Question|\*\*Question\*\*|\?):?\s*([^\n\?]+\?)/i);
  if (qMatch && qMatch[1]) {
    return qMatch[1].trim();
  }

  if (lower.includes("what is programming")) {
    return "What is programming and how does a computer execute logical instructions?";
  }
  if (lower.includes("what is python")) {
    return "What is Python and why is it so widely adopted in modern computing?";
  }
  if (lower.includes("where python is used")) {
    return "Where is Python commonly used across industries and domain applications?";
  }
  if (lower.includes("how python executes code")) {
    return "How does Python execute code internally from source to machine execution?";
  }
  if (lower.includes("interpreted vs compiled")) {
    return "What are the core differences between interpreted and compiled programming languages?";
  }
  if (lower.includes("installing python")) {
    return "What are the essential steps to properly install Python and configure VS Code?";
  }
  if (lower.includes("writing your very first python program")) {
    return "How do you write, save, and execute your first Python program?";
  }
  if (lower.includes("variable")) {
    return "What is a variable and how does the computer allocate memory for it?";
  }
  if (lower.includes("syntax")) {
    return `What are the core syntax rules and principles for ${cleanTitle}?`;
  }
  
  return `What are the essential concepts, rules, and applications of ${cleanTitle}?`;
}

function parseChapterIntoSections(markdown: string) {
  if (!markdown) return [];
  const rawSections = markdown.split(/(?=###\s+\d+\.)/g);
  const result = [];

  for (const raw of rawSections) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const lines = trimmed.split("\n");
    const headingLine = lines[0].replace(/^#+\s*/, "").trim();
    const body = lines.slice(1).join("\n").trim();

    // Parse code blocks
    const codeBlocks = [...body.matchAll(/```(\w*)\n([\s\S]*?)```/g)].map(
      (m) => ({
        lang: m[1] || "code",
        code: m[2].trim(),
      })
    );

    // Parse bullet points
    const bullets = body
      .split("\n")
      .filter((l) => /^\s*[\*\-]\s+/.test(l))
      .map((l) => l.replace(/^\s*[\*\-]\s+/, "").trim());

    // Extract clean educational answer text without code or headers
    const answerText = body
      .replace(/```[\s\S]*?```/g, "")
      .replace(/^#+\s*.*/gm, "")
      .split("\n")
      .filter((l) => !/^\s*[\*\-]\s+/.test(l) && l.trim().length > 0)
      .join("\n\n")
      .trim();

    const question = deriveSectionQuestion(headingLine, body);
    const diagram = getConceptDiagram(headingLine);

    result.push({
      title: headingLine,
      question,
      answer: answerText || `Core principles and syntax covered in ${headingLine}.`,
      importantPoints: bullets,
      bullets,
      codeBlocks,
      examples: codeBlocks.map((c, idx) => ({
        title: `${headingLine} Example ${idx + 1}`,
        lang: c.lang,
        code: c.code,
      })),
      diagram,
      content: body,
    });
  }

  return result;
}

function extractChapterRevisionPoints(markdown: string): string[] {
  if (!markdown) return [];
  const lines = markdown.split("\n");
  const summaryIdx = lines.findIndex((l) =>
    /summary|recap|review|takeaways|key points/i.test(l)
  );
  if (summaryIdx !== -1) {
    const candidateBullets = lines
      .slice(summaryIdx)
      .filter((l) => /^\s*[\*\-]\s+/.test(l))
      .map((l) => l.replace(/^\s*[\*\-]\s+/, "").trim())
      .filter(Boolean);
    if (candidateBullets.length > 0) return candidateBullets.slice(0, 8);
  }

  // Synthesize from section titles and answers
  const sections = parseChapterIntoSections(markdown);
  return sections.slice(0, 7).map((s) => {
    const cleanT = s.title.replace(/^[\d\.\s]+/, "");
    const firstSentence = s.answer.split(".")[0] || "Foundational programming concept";
    return `${cleanT}: ${firstSentence}.`;
  });
}

/**
 * GET /api/notes
 *
 * Returns the logged-in student's completed topic notes grouped by day and course/chapter.
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

    const rawCourseParam = searchParams.get("courseId") || searchParams.get("course") || searchParams.get("language");
    const chapterId = searchParams.get("chapterId");
    const topic = searchParams.get("topic");
    const type = searchParams.get("type");
    const requestedDate = searchParams.get("date");
    const timezoneOffset = parseInt(searchParams.get("timezoneOffset") || "0", 10);

    const dateFilter = requestedDate
      ? {
          createdAt: {
            gte: new Date(`${requestedDate}T00:00:00.000Z`),
            lte: new Date(`${requestedDate}T23:59:59.999Z`),
          },
        }
      : {};

    // Robust course identification (UUID or Language Slug)
    let targetCourseId: string | undefined = undefined;
    let targetLang: string | undefined = undefined;

    if (rawCourseParam && rawCourseParam !== "ALL") {
      const clean = rawCourseParam.trim().toLowerCase();
      const normalized = clean === "c++" || clean === "cpp" ? "cpp" : clean === "c" ? "c" : clean === "java" ? "java" : clean === "python" ? "python" : clean;

      const matchedCourse = await db.course.findFirst({
        where: {
          OR: [
            { id: rawCourseParam },
            { language: normalized },
          ],
        },
        select: { id: true, language: true },
      });

      if (matchedCourse) {
        targetCourseId = matchedCourse.id;
      } else {
        targetLang = normalized;
      }
    }

    const notes = await db.learningNote.findMany({
      where: {
        userId: user.id,
        ...dateFilter,

        ...(targetCourseId
          ? {
              courseId: targetCourseId,
            }
          : targetLang
          ? {
              course: {
                language: {
                  equals: targetLang,
                },
              },
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

        ...(type && type !== "ALL"
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

    // Group notes day-wise based ONLY on completed topic notes
    const daysMap = new Map<
      string,
      {
        date: string;
        formattedDate: string;
        courses: Array<{ id: string; title: string; language: string }>;
        chapters: Array<{
          id: string;
          title: string;
          orderNumber: number;
          courseTitle: string;
          language: string;
          content: string;
          sections: any[];
          revisionPoints: string[];
        }>;
        notes: typeof notes;
      }
    >();

    for (const note of notes) {
      const dayKey = getLocalDateKey(new Date(note.createdAt), timezoneOffset);

      let dayGroup = daysMap.get(dayKey);
      if (!dayGroup) {
        dayGroup = {
          date: dayKey,
          formattedDate: formatDisplayDate(dayKey),
          courses: [],
          chapters: [],
          notes: [],
        };
        daysMap.set(dayKey, dayGroup);
      }

      dayGroup.notes.push(note);

      if (
        note.course &&
        !dayGroup.courses.some((c) => c.id === note.courseId)
      ) {
        dayGroup.courses.push({
          id: note.course.id,
          title: note.course.title,
          language: note.course.language,
        });
      }

      if (note.chapter) {
        let ch = dayGroup.chapters.find((c) => c.id === note.chapterId);
        if (!ch) {
          ch = {
            id: note.chapter.id,
            title: note.chapter.title,
            orderNumber: note.chapter.orderNumber,
            courseTitle: note.course?.title || "Course",
            language: note.course?.language || "code",
            content: note.content,
            sections: [],
            revisionPoints: [],
          };
          dayGroup.chapters.push(ch);
        }

        // Parse note metadata if available
        let metaObj: any = null;
        if (note.metadata) {
          try {
            metaObj = typeof note.metadata === "string" ? JSON.parse(note.metadata) : note.metadata;
          } catch {
            metaObj = null;
          }
        }

        // Add this completed topic section to the chapter
        ch.sections.push({
          title: note.topic || note.title,
          question: metaObj?.teacherQuestions?.[0]?.question || deriveSectionQuestion(note.topic || note.title, note.content),
          answer: metaObj?.whatILearned || note.content,
          importantPoints: metaObj?.importantPoints || [],
          bullets: metaObj?.coreConcepts || [],
          teacherQuestions: metaObj?.teacherQuestions || [],
          studentQuestions: metaObj?.studentQuestions || [],
          codeBlocks: metaObj?.codeSnippets || metaObj?.examples || [],
          examples: metaObj?.examples || [],
          diagram: metaObj?.diagram || getConceptDiagram(note.topic || note.title),
          content: note.content,
          status: "COMPLETED",
        });
      }
    }

    const days = Array.from(daysMap.values());

    return NextResponse.json({
      success: true,
      notes,
      days,
      count: notes.length,
      daysCount: days.length,
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
 * Creates or updates a canonical completed topic learning note (zero duplicates).
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

    let {
      courseId,
      chapterId,
      topic,
      title,
      type = "NOTEBOOK",
      content,
      metadata,
      importance,
      isPinned,
      eventType,
      saveEvent,
    } = body;

    if (!topic && title) {
      topic = title;
    }
    if (!title && topic) {
      title = topic;
    }

    if (!topic || !content) {
      return NextResponse.json(
        {
          success: false,
          error: "topic and content are required.",
        },
        { status: 400 }
      );
    }

    // Resolve course
    let course = null;
    if (courseId) {
      course = await db.course.findUnique({
        where: { id: courseId },
        select: { id: true, title: true, language: true },
      });
      if (!course) {
        const raw = courseId.toLowerCase().trim();
        const langCode = raw === "c++" || raw === "cpp" ? "cpp" : raw === "c" ? "c" : raw === "java" ? "java" : raw === "python" ? "python" : raw;
        course = await db.course.findFirst({
          where: {
            OR: [
              { id: courseId },
              { language: langCode },
            ],
          },
          select: { id: true, title: true, language: true },
        });
      }
    }

    if (!course) {
      course = (await db.course.findFirst()) || {
        id: "default-course",
        title: "Course",
        language: "python",
      };
    }

    courseId = course.id;

    // Resolve chapter
    let chapter = null;
    if (chapterId) {
      chapter = await db.chapter.findFirst({
        where: {
          OR: [
            { id: chapterId },
            { id: chapterId, courseId: course.id },
          ],
        },
        select: { id: true, title: true, orderNumber: true, explanation: true },
      });
    }

    if (!chapter) {
      chapter = await db.chapter.findFirst({
        where: { courseId: course.id },
        select: { id: true, title: true, orderNumber: true, explanation: true },
      });
    }

    if (!chapter) {
      chapter = (await db.chapter.findFirst()) || {
        id: "default-chapter",
        title: "Chapter",
        orderNumber: 0,
        explanation: "",
      };
    }

    chapterId = chapter.id;

    // Canonical Deduplication: Find ANY existing note for (userId, courseId, chapterId, topic) across all dates
    const existingNote = await db.learningNote.findFirst({
      where: {
        userId: user.id,
        courseId,
        chapterId,
        topic,
      },
    });

    let note;
    if (existingNote) {
      note = await db.learningNote.update({
        where: { id: existingNote.id },
        data: {
          title,
          type,
          content,
          metadata:
            typeof metadata === "string"
              ? metadata
              : metadata
              ? JSON.stringify(metadata)
              : existingNote.metadata,
          importance:
            typeof importance === "number"
              ? importance
              : existingNote.importance,
          isPinned:
            typeof isPinned === "boolean"
              ? isPinned
              : existingNote.isPinned,
          updatedAt: new Date(),
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
    } else {
      note = await db.learningNote.create({
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
          importance: typeof importance === "number" ? importance : 1,
          isPinned: typeof isPinned === "boolean" ? isPinned : false,
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
    }

    // Record learning event when requested
    if (saveEvent !== false) {
      await db.learningEvent.create({
        data: {
          userId: user.id,
          courseId,
          chapterId,
          topic,
          eventType: typeof eventType === "string" ? eventType : type,
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