import { SupportedCourse } from "../knowledge-graph/types";

export type PathAction = "LEARN" | "PRACTICE" | "REVIEW" | "RETEACH" | "ASSESS" | "ADVANCE";

export type PathPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type PathItemStatus =
  | "NOT_STARTED"
  | "LEARNING"
  | "PRACTICED"
  | "NEEDS_REVIEW"
  | "MASTERED"
  | "BLOCKED";

export interface PathPrerequisiteInfo {
  slug: string;
  name: string;
  isMet: boolean;
  score?: number;
}

export interface PathItem {
  id: string;
  topic: string;
  chapterOrder: number;
  chapterTitle: string;
  conceptSlug: string;
  conceptName: string;
  status: PathItemStatus;
  action: PathAction;
  priority: PathPriority;
  reason: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  prerequisites: PathPrerequisiteInfo[];
  masteryScore: number;
  estimatedMinutes: number;
}

export interface PersonalizedLearningPath {
  studentId: string;
  course: SupportedCourse;
  currentFocusTopic: string;
  recommendedNextAction: PathAction;
  recommendedNextTopic: string;
  educationalRationale: string;
  path: PathItem[];
  overallCourseReadiness: number; // 0 - 100
  prerequisiteGapCount: number;
  reviewCount: number;
  lastCalculatedAt: string;
}
