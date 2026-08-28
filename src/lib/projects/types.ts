import { SupportedCourse } from "../knowledge-graph/types";

export type ProjectMilestoneStatus = "NOT_STARTED" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED";

export type ProjectDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type CoachAssistanceMode = "HINT" | "GUIDANCE" | "CODE_REVIEW" | "DEBUG" | "TESTING";

export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
  hint?: string;
}

export interface ProjectMilestone {
  id: string;
  order: number;
  title: string;
  description: string;
  tasks: ProjectTask[];
  status: ProjectMilestoneStatus;
  requiredConcepts: string[];
  deliverables: string[];
}

export interface ProjectDefinition {
  id: string;
  course: SupportedCourse;
  title: string;
  description: string;
  difficulty: ProjectDifficulty;
  technologies: string[];
  skillsGained: string[];
  requiredConcepts: string[];
  architectureOverview: string;
  milestones: ProjectMilestone[];
  starterCode?: string;
}

export interface ProjectKnowledgeGapAnalysis {
  projectId: string;
  isReady: boolean;
  readinessScore: number; // 0 - 100
  masteredConcepts: Array<{ slug: string; name: string; score: number }>;
  gapConcepts: Array<{ slug: string; name: string; score: number; reason: string }>;
  recommendation: string;
}

export interface ProjectCoachRequest {
  userId: string;
  userEmail: string;
  projectId: string;
  milestoneId: string;
  mode: CoachAssistanceMode;
  userQuery?: string;
  submittedCode?: string;
  errorMessage?: string;
  expectedOutput?: string;
}

export interface ProjectCoachResponse {
  mode: CoachAssistanceMode;
  feedback: string;
  hint?: string;
  suggestedFix?: string;
  identifiedProblem?: string;
  learningConcept?: string;
  followUpQuestion?: string;
  reviewMetrics?: {
    correctness: number; // 0 - 100
    memorySafety?: string;
    oopDesign?: string;
    codeQuality: string;
  };
}
