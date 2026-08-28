import { SupportedCourse } from "../knowledge-graph/types";
import { PathAction } from "../learning-path/types";

export interface MentorKnowledgeSummary {
  course: SupportedCourse;
  courseTitle: string;
  overallMastery: number; // 0 - 100
  strongConcepts: Array<{ slug: string; name: string }>;
  developingConcepts: Array<{ slug: string; name: string }>;
  weakConcepts: Array<{ slug: string; name: string }>;
  prerequisiteGaps: Array<{ conceptName: string; missingPrerequisites: string[] }>;
  recentMistakes: string[];
  focusTopic: string;
  recommendedAction: PathAction;
  educationalRationale: string;
}

export interface MentorContext {
  student: {
    id: string;
    email: string;
    name?: string;
    xp: number;
    currentStreak: number;
  };
  activeCourse: SupportedCourse;
  knowledgeSummaries: MentorKnowledgeSummary[];
  recentEvents: Array<{
    topic: string;
    eventType: string;
    summary: string;
    timestamp: string;
  }>;
  recentNotes: Array<{
    title: string;
    topic: string;
    content: string;
  }>;
}

export type MentorActionType =
  | "NAVIGATE_TOPIC"
  | "START_ASSESSMENT"
  | "OPEN_NOTES"
  | "REVIEW_PREREQUISITE"
  | "START_PROJECT"
  | "GENERAL_ADVICE";

export interface MentorActionSuggestion {
  type: MentorActionType;
  label: string;
  topic?: string;
  courseSlug?: string;
  chapterId?: string;
  reason: string;
}

export interface MentorMessage {
  id: string;
  sender: "user" | "mentor";
  text: string;
  timestamp: string;
  actions?: MentorActionSuggestion[];
}
