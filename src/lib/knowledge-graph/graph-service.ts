import { prisma } from "@/lib/prisma";
import {
  ConceptNode,
  LearningEvidenceInput,
  PrerequisiteGap,
  StudentKnowledgeState,
  SupportedCourse,
} from "./types";
import {
  CANONICAL_CONCEPTS,
  CANONICAL_PREREQUISITES,
  getConceptsByCourse,
  findConceptByTopic,
  getPrerequisitesForConcept,
} from "./concept-registry";

function normalizeCourse(slug: string): SupportedCourse {
  const norm = slug.toLowerCase().trim();
  if (norm.includes("python")) return "python";
  if (norm === "c") return "c";
  if (norm.includes("cpp") || norm.includes("c++")) return "cpp";
  if (norm.includes("java")) return "java";
  return "python";
}

/**
 * Get comprehensive student knowledge graph state for a specific course
 * Scoped strictly to the authenticated student and course.
 */
export async function getStudentKnowledgeState(
  userId: string,
  courseSlug: string
): Promise<StudentKnowledgeState> {
  const course = normalizeCourse(courseSlug);
  const courseConcepts = getConceptsByCourse(course);

  // 1. Fetch user's actual progress records
  const topicProgressRecords = await prisma.topicProgress.findMany({
    where: {
      userId,
      courseId: course,
    },
  });

  const lessonProgressRecords = await prisma.lessonProgress.findMany({
    where: {
      userId,
      chapter: {
        course: {
          language: course,
        },
      },
    },
    orderBy: {
      lastActivity: "desc",
    },
  });

  const learningMemories = await prisma.learningMemory.findMany({
    where: {
      userId,
      courseId: course,
      isActive: true,
    },
  });

  const strongConcepts: ConceptNode[] = [];
  const developingConcepts: ConceptNode[] = [];
  const weakConcepts: ConceptNode[] = [];
  const unseenConcepts: ConceptNode[] = [];
  const recentConcepts: ConceptNode[] = [];

  const conceptScores = new Map<string, number>();

  for (const concept of courseConcepts) {
    // Check topicProgress matching concept
    const tp = topicProgressRecords.find(
      (t) =>
        t.topic.toLowerCase().includes(concept.name.toLowerCase()) ||
        concept.name.toLowerCase().includes(t.topic.toLowerCase())
    );

    // Check lessonProgress matching concept
    const lp = lessonProgressRecords.find(
      (l) =>
        l.lesson.toLowerCase().includes(concept.name.toLowerCase()) ||
        concept.name.toLowerCase().includes(l.lesson.toLowerCase()) ||
        (concept.topicName && l.lesson.toLowerCase().includes(concept.topicName.toLowerCase()))
    );

    let score: number | null = null;
    if (tp && tp.masteryScore > 0) {
      score = tp.masteryScore;
    } else if (lp) {
      if (lp.status === "MASTERED") score = Math.max(90, lp.lastScore || 90);
      else if (lp.status === "PRACTICED") score = Math.max(75, lp.lastScore || 75);
      else if (lp.status === "NEEDS_REVIEW") score = Math.min(60, lp.lastScore || 50);
      else if (lp.status === "LEARNING") score = lp.lastScore || 55;
    }

    if (score !== null) {
      conceptScores.set(concept.slug, score);
      if (score >= 85) {
        strongConcepts.push(concept);
      } else if (score >= 60) {
        developingConcepts.push(concept);
      } else {
        weakConcepts.push(concept);
      }
    } else {
      unseenConcepts.push(concept);
    }
  }

  // 2. Identify Prerequisite Gaps
  const prerequisiteGaps: PrerequisiteGap[] = [];
  for (const concept of [...developingConcepts, ...weakConcepts, ...unseenConcepts]) {
    const requiredPrereqs = getPrerequisitesForConcept(concept.slug);
    const missing = requiredPrereqs.filter((prereq) => {
      const pScore = conceptScores.get(prereq.slug);
      return pScore === undefined || pScore < 70;
    });

    if (missing.length > 0) {
      prerequisiteGaps.push({
        concept,
        missingPrerequisites: missing,
        reason: `Requires solid mastery (>=70%) of ${missing.map((m) => m.name).join(", ")} before advancing.`,
      });
    }
  }

  // 3. Extract Recent Mistakes & Mastered Skills
  const recentMistakes = learningMemories
    .filter((m) => m.memoryType === "MISTAKE" || m.memoryType === "STRUGGLE")
    .map((m) => m.content)
    .slice(0, 5);

  const masteredSkills = Array.from(
    new Set(strongConcepts.flatMap((c) => c.skills))
  );

  // 4. Compute Overall Mastery
  const totalConcepts = courseConcepts.length || 1;
  const masteredCount = strongConcepts.length;
  const overallMasteryPercentage = Math.round((masteredCount / totalConcepts) * 100);

  return {
    studentId: userId,
    course,
    strongConcepts,
    developingConcepts,
    weakConcepts,
    unseenConcepts,
    recentConcepts: courseConcepts.slice(0, 3),
    prerequisiteGaps,
    recentMistakes,
    masteredSkills,
    overallMasteryPercentage,
    totalConceptsInCourse: totalConcepts,
    masteredConceptsCount: masteredCount,
  };
}

/**
 * Record learning evidence from Checkpoints, Quizzes, Notes, or Vision AI
 */
export async function recordLearningEvidence(
  evidence: LearningEvidenceInput
): Promise<{ success: boolean; conceptMatched?: string }> {
  try {
    const course = normalizeCourse(evidence.course);
    const matchedConcept =
      (evidence.conceptSlug && CANONICAL_CONCEPTS.find((c) => c.slug === evidence.conceptSlug)) ||
      findConceptByTopic(course, evidence.topic);

    const conceptName = matchedConcept ? matchedConcept.name : evidence.topic;

    // 1. Update TopicProgress
    const status =
      evidence.score >= 85
        ? "MASTERED"
        : evidence.score >= 70
        ? "PRACTICED"
        : evidence.score >= 50
        ? "LEARNING"
        : "NEEDS_REVIEW";

    await prisma.topicProgress.upsert({
      where: {
        userId_chapterId_topic: {
          userId: evidence.userId,
          chapterId: evidence.chapterId || "general",
          topic: evidence.topic,
        },
      },
      update: {
        status,
        masteryScore: evidence.score,
        attempts: { increment: 1 },
        correctAnswers: evidence.score >= 70 ? { increment: 1 } : undefined,
        totalQuestions: { increment: 1 },
        lastActivity: new Date(),
      },
      create: {
        userId: evidence.userId,
        courseId: course,
        chapterId: evidence.chapterId || "general",
        topic: evidence.topic,
        status,
        masteryScore: evidence.score,
        attempts: 1,
        correctAnswers: evidence.score >= 70 ? 1 : 0,
        totalQuestions: 1,
        lastActivity: new Date(),
      },
    });

    // 2. Persist LearningMemory if struggle or mastery
    if (evidence.score < 70) {
      await prisma.learningMemory.upsert({
        where: {
          userId_topic_memoryType_key: {
            userId: evidence.userId,
            topic: evidence.topic,
            memoryType: "STRUGGLE",
            key: `concept_gap_${evidence.source.toLowerCase()}`,
          },
        },
        update: {
          content: evidence.summary || `Needs review on ${conceptName}`,
          confidence: Math.round(evidence.score),
          occurrences: { increment: 1 },
          lastObserved: new Date(),
        },
        create: {
          userId: evidence.userId,
          courseId: course,
          chapterId: evidence.chapterId || "general",
          topic: evidence.topic,
          memoryType: "STRUGGLE",
          key: `concept_gap_${evidence.source.toLowerCase()}`,
          content: evidence.summary || `Needs review on ${conceptName}`,
          confidence: Math.round(evidence.score),
          priority: 2,
          occurrences: 1,
          lastObserved: new Date(),
        },
      });
    } else if (evidence.score >= 85) {
      await prisma.learningMemory.upsert({
        where: {
          userId_topic_memoryType_key: {
            userId: evidence.userId,
            topic: evidence.topic,
            memoryType: "MASTERY",
            key: `concept_mastery_${evidence.source.toLowerCase()}`,
          },
        },
        update: {
          content: `Mastered ${conceptName} with ${evidence.score}% comprehension`,
          confidence: Math.round(evidence.score),
          lastObserved: new Date(),
        },
        create: {
          userId: evidence.userId,
          courseId: course,
          chapterId: evidence.chapterId || "general",
          topic: evidence.topic,
          memoryType: "MASTERY",
          key: `concept_mastery_${evidence.source.toLowerCase()}`,
          content: `Mastered ${conceptName} with ${evidence.score}% comprehension`,
          confidence: Math.round(evidence.score),
          priority: 1,
          lastObserved: new Date(),
        },
      });
    }

    // 3. Write LearningEvent record
    await prisma.learningEvent.create({
      data: {
        userId: evidence.userId,
        courseId: course,
        chapterId: evidence.chapterId || "general",
        topic: evidence.topic,
        eventType: `EVIDENCE_${evidence.source}`,
        content: evidence.summary || `Learning evidence on ${conceptName}`,
        metadata: JSON.stringify({
          concept: conceptName,
          score: evidence.score,
          summary: evidence.summary,
          visualReference: evidence.visualReference,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return {
      success: true,
      conceptMatched: matchedConcept?.slug,
    };
  } catch (err) {
    console.error("Knowledge Graph evidence recording error:", err);
    return { success: false };
  }
}
