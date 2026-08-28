import {
  PathAction,
  PathItem,
  PathItemStatus,
  PathPriority,
  PersonalizedLearningPath,
} from "./types";
import { getStudentKnowledgeState } from "../knowledge-graph/graph-service";
import {
  getConceptsByCourse,
  getPrerequisitesForConcept,
} from "../knowledge-graph/concept-registry";
import { SupportedCourse } from "../knowledge-graph/types";

function normalizeCourse(slug: string): SupportedCourse {
  const norm = slug.toLowerCase().trim();
  if (norm.includes("python")) return "python";
  if (norm === "c") return "c";
  if (norm.includes("cpp") || norm.includes("c++")) return "cpp";
  if (norm.includes("java")) return "java";
  return "python";
}

/**
 * Compute the personalized learning path tailored to a student's Knowledge Graph state
 * Scoped strictly to the authenticated student and course language.
 */
export async function getPersonalizedLearningPath(
  userId: string,
  courseSlug: string
): Promise<PersonalizedLearningPath> {
  const course = normalizeCourse(courseSlug);

  // 1. Fetch live student knowledge state from Phase 16 graph
  const knowledgeState = await getStudentKnowledgeState(userId, course);
  const courseConcepts = getConceptsByCourse(course);

  // Build concept score lookup
  const conceptScores = new Map<string, number>();
  for (const c of knowledgeState.strongConcepts) conceptScores.set(c.slug, 90);
  for (const c of knowledgeState.developingConcepts) conceptScores.set(c.slug, 70);
  for (const c of knowledgeState.weakConcepts) conceptScores.set(c.slug, 45);

  const pathItems: PathItem[] = [];

  for (let i = 0; i < courseConcepts.length; i++) {
    const concept = courseConcepts[i];
    const score = conceptScores.get(concept.slug) ?? 0;

    // Prerequisite verification
    const prereqs = getPrerequisitesForConcept(concept.slug);
    const prereqDetails = prereqs.map((p) => {
      const pScore = conceptScores.get(p.slug);
      const isMet = pScore !== undefined && pScore >= 70;
      return {
        slug: p.slug,
        name: p.name,
        isMet,
        score: pScore,
      };
    });

    const hasUnmetPrereq = prereqDetails.some((p) => !p.isMet);

    let status: PathItemStatus = "NOT_STARTED";
    let action: PathAction = "LEARN";
    let priority: PathPriority = "MEDIUM";
    let reason = "Scheduled curriculum progression";

    if (hasUnmetPrereq) {
      status = "BLOCKED";
      action = "REVIEW";
      priority = "CRITICAL";
      const missingNames = prereqDetails
        .filter((p) => !p.isMet)
        .map((p) => p.name)
        .join(", ");
      reason = `Requires solid mastery (>=70%) of prerequisite: ${missingNames}`;
    } else if (score >= 85) {
      status = "MASTERED";
      action = "ADVANCE";
      priority = "LOW";
      reason = `Mastery confirmed at ${score}% comprehension. Ready for advanced applications.`;
    } else if (score >= 60) {
      status = "PRACTICED";
      action = "PRACTICE";
      priority = "HIGH";
      reason = `Demonstrated understanding (${score}%). Reinforced coding practice recommended.`;
    } else if (score > 0) {
      status = "NEEDS_REVIEW";
      action = "RETEACH";
      priority = "CRITICAL";
      reason = `Needs reinforcement (${score}%). AI Teacher will break down misconceptions.`;
    } else {
      status = "NOT_STARTED";
      action = "LEARN";
      priority = i === 0 || pathItems.every((p) => p.status === "MASTERED") ? "HIGH" : "MEDIUM";
      reason = "Next curriculum topic in learning sequence.";
    }

    pathItems.push({
      id: `path_${concept.slug}`,
      topic: concept.topicName || concept.name,
      chapterOrder: concept.chapterOrder,
      chapterTitle: `Chapter ${concept.chapterOrder}: ${concept.category}`,
      conceptSlug: concept.slug,
      conceptName: concept.name,
      status,
      action,
      priority,
      reason,
      difficulty: score >= 85 ? "HARD" : score >= 60 ? "MEDIUM" : "EASY",
      prerequisites: prereqDetails,
      masteryScore: score,
      estimatedMinutes: action === "RETEACH" ? 15 : action === "PRACTICE" ? 12 : 20,
    });
  }

  // 2. Identify the optimal Current Focus & Recommended Next Topic
  // Priority: Blocked/Prereq Review -> Needs Reteach -> Needs Practice -> Next Unseen
  const needsReviewItem = pathItems.find((p) => p.action === "REVIEW" || p.action === "RETEACH");
  const needsPracticeItem = pathItems.find((p) => p.action === "PRACTICE");
  const nextLearnItem = pathItems.find((p) => p.action === "LEARN" && p.status !== "BLOCKED");
  const defaultItem = pathItems[0] || {
    topic: "Introduction",
    action: "LEARN" as PathAction,
    reason: "Begin your learning journey.",
  };

  const focusItem = needsReviewItem || needsPracticeItem || nextLearnItem || defaultItem;

  const currentFocusTopic = focusItem.topic;
  const recommendedNextAction = focusItem.action;
  const recommendedNextTopic = focusItem.topic;
  const educationalRationale = focusItem.reason;

  const prereqGapCount = pathItems.filter((p) => p.status === "BLOCKED").length;
  const reviewCount = pathItems.filter((p) => p.action === "RETEACH" || p.action === "REVIEW").length;

  return {
    studentId: userId,
    course,
    currentFocusTopic,
    recommendedNextAction,
    recommendedNextTopic,
    educationalRationale,
    path: pathItems,
    overallCourseReadiness: knowledgeState.overallMasteryPercentage,
    prerequisiteGapCount: prereqGapCount,
    reviewCount,
    lastCalculatedAt: new Date().toISOString(),
  };
}
