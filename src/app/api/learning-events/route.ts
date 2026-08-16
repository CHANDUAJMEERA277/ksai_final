import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const EVENT_TYPES = [
  "EXPLANATION",
  "EXAMPLE",
  "QUESTION",
  "ANSWER",
  "MISTAKE",
  "CORRECTION",
  "VISUAL",
  "PRACTICE",
  "CHAT",
];

const SAVEABLE_EVENTS = new Set([
  "EXPLANATION",
  "EXAMPLE",
  "QUESTION",
  "MISTAKE",
  "CORRECTION",
  "VISUAL",
  "PRACTICE",
]);

type MemoryInput = {
  memoryType:
    | "STRUGGLE"
    | "STRENGTH"
    | "PREFERENCE"
    | "MISTAKE"
    | "MASTERY"
    | "REVIEW";
  key: string;
  content: string;
  confidence: number;
  priority: number;
};

function buildMemoryFromEvent(
  eventType: string,
  topic: string,
  content: string
): MemoryInput | null {
  const cleanTopic = topic.trim();

  if (!cleanTopic || !content.trim()) {
    return null;
  }

  switch (eventType) {
    case "MISTAKE":
      return {
        memoryType: "MISTAKE",
        key: cleanTopic,
        content: `Student made a mistake related to ${cleanTopic}: ${content}`,
        confidence: 70,
        priority: 4,
      };

    case "CORRECTION":
      return {
        memoryType: "REVIEW",
        key: cleanTopic,
        content: `Student received a correction related to ${cleanTopic}: ${content}`,
        confidence: 70,
        priority: 3,
      };

    case "QUESTION":
      return {
        memoryType: "STRUGGLE",
        key: cleanTopic,
        content: `Student asked about ${cleanTopic}: ${content}`,
        confidence: 60,
        priority: 3,
      };

    case "PRACTICE":
      return {
        memoryType: "STRENGTH",
        key: cleanTopic,
        content: `Student practiced ${cleanTopic}: ${content}`,
        confidence: 55,
        priority: 2,
      };

    case "EXPLANATION":
      return {
        memoryType: "MASTERY",
        key: cleanTopic,
        content: `Student received an explanation about ${cleanTopic}: ${content}`,
        confidence: 40,
        priority: 1,
      };

    case "EXAMPLE":
      return {
        memoryType: "STRENGTH",
        key: cleanTopic,
        content: `Student studied an example related to ${cleanTopic}: ${content}`,
        confidence: 45,
        priority: 1,
      };

    case "VISUAL":
      return {
        memoryType: "PREFERENCE",
        key: cleanTopic,
        content: `Student used a visual explanation for ${cleanTopic}: ${content}`,
        confidence: 40,
        priority: 1,
      };

    default:
      return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      userEmail,
      courseId,
      chapterId,
      topic,
      eventType,
      content,
      metadata,
    } = body;

    if (
      !userEmail ||
      !courseId ||
      !chapterId ||
      !topic ||
      !eventType ||
      !content
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required learning event fields.",
        },
        { status: 400 }
      );
    }

    if (!EVENT_TYPES.includes(eventType)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid event type.",
        },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: {
        email: userEmail,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found.",
        },
        { status: 404 }
      );
    }

    const shouldSave = SAVEABLE_EVENTS.has(eventType);

    const event = await db.learningEvent.create({
      data: {
        userId: user.id,
        courseId,
        chapterId,
        topic,
        eventType,
        content,
        metadata:
          typeof metadata === "string"
            ? metadata
            : metadata
              ? JSON.stringify(metadata)
              : null,
        shouldSave,
      },
    });

    let note = null;

    if (shouldSave) {
      const titleMap: Record<string, string> = {
        EXPLANATION: "Explanation",
        EXAMPLE: "Example",
        QUESTION: "Your Question",
        MISTAKE: "Common Mistake",
        CORRECTION: "Correction",
        VISUAL: "Visual",
        PRACTICE: "Practice",
      };

      const typeMap: Record<string, string> = {
        EXPLANATION: "EXPLANATION",
        EXAMPLE: "EXAMPLE",
        QUESTION: "QUESTION",
        MISTAKE: "MISTAKE",
        CORRECTION: "CORRECTION",
        VISUAL: "VISUAL",
        PRACTICE: "PRACTICE",
      };

      note = await db.learningNote.create({
        data: {
          userId: user.id,
          courseId,
          chapterId,
          topic,
          title: titleMap[eventType] || "Learning Note",
          type: typeMap[eventType] || "TIP",
          content,
          metadata: event.metadata,
          importance:
            eventType === "MISTAKE" || eventType === "CORRECTION"
              ? 4
              : 2,
        },
      });
    }

    // =====================================================
    // LEARNING MEMORY
    // =====================================================

    const memory = buildMemoryFromEvent(
      eventType,
      topic,
      content
    );

    let savedMemory = null;

    if (memory) {
      const existingMemory = await db.learningMemory.findUnique({
        where: {
          userId_topic_memoryType_key: {
            userId: user.id,
            topic,
            memoryType: memory.memoryType,
            key: memory.key,
          },
        },
      });

      if (existingMemory) {
        const newOccurrences = existingMemory.occurrences + 1;

        const newConfidence = Math.min(
          100,
          Math.max(
            existingMemory.confidence,
            memory.confidence
          ) + 5
        );

        savedMemory = await db.learningMemory.update({
          where: {
            id: existingMemory.id,
          },
          data: {
            content: memory.content,
            confidence: newConfidence,
            priority: Math.max(
              existingMemory.priority,
              memory.priority
            ),
            occurrences: newOccurrences,
            lastObserved: new Date(),
            isActive: true,
          },
        });
      } else {
        savedMemory = await db.learningMemory.create({
          data: {
            userId: user.id,
            courseId,
            chapterId,
            topic,
            memoryType: memory.memoryType,
            key: memory.key,
            content: memory.content,
            confidence: memory.confidence,
            priority: memory.priority,
            occurrences: 1,
            lastObserved: new Date(),
            isActive: true,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      event,
      note,
      memory: savedMemory,
    });
  } catch (error) {
    console.error("Learning event error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to record learning event.",
      },
      { status: 500 }
    );
  }
}