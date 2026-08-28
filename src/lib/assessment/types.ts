import { SupportedCourse } from "../knowledge-graph/types";

export type AssessmentQuestionType =
  | "MULTIPLE_CHOICE"
  | "CODE_OUTPUT"
  | "DEBUGGING"
  | "CODE_REASONING"
  | "CONCEPT_EXPLANATION"
  | "SHORT_ANSWER"
  | "TRUE_FALSE"
  | "SCENARIO";

export type AssessmentDifficulty = "EASY" | "MEDIUM" | "HARD";

export type AssessmentResultType = "CORRECT" | "PARTIAL" | "INCORRECT";

export interface AdaptiveQuestion {
  id: string;
  course: SupportedCourse;
  chapterId: string;
  chapterTitle?: string;
  topic: string;
  conceptSlug: string;
  conceptName: string;
  type: AssessmentQuestionType;
  difficulty: AssessmentDifficulty;
  question: string;
  codeSnippet?: string;
  options?: string[];
  correctOptionIndex?: number;
  hint: string;
  explanation: string;
  pedagogicalGoal: string;
  fingerprint: string;
}

export interface AdaptiveAnswerEvaluation {
  score: number; // 0 - 100
  result: AssessmentResultType;
  appreciation: string;
  whatWasCorrect: string;
  whatIsMissing: string;
  feedback: string;
  explanation: string;
  example?: string;
  conceptsDemonstrated: string[];
  conceptsMissed: string[];
  nextDifficulty: AssessmentDifficulty;
  needsFollowUp: boolean;
  followUpQuestion?: string;
  nextRecommendation: "ADVANCE" | "PRACTICE" | "RETEACH" | "REVIEW_PREREQUISITE";
}

export interface GetAdaptiveQuestionParams {
  userId: string;
  userEmail?: string;
  course: SupportedCourse;
  chapterId?: string;
  topic?: string;
  preferredDifficulty?: AssessmentDifficulty;
  excludeFingerprints?: string[];
}

export interface EvaluateAdaptiveAnswerParams {
  userId: string;
  userEmail?: string;
  course: SupportedCourse;
  chapterId: string;
  topic: string;
  conceptSlug?: string;
  questionId: string;
  question: string;
  studentAnswer: string;
  difficulty: AssessmentDifficulty;
  options?: string[];
  correctOptionIndex?: number;
  expectedExplanation?: string;
}
