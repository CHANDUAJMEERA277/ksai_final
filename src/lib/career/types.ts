import { SupportedCourse } from "../knowledge-graph/types";

export type SkillPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface RoleRequiredSkill {
  name: string;
  category: string;
  targetScore: number; // 0 - 100
  importance: SkillPriority;
  relevantConcepts: string[]; // Concept slugs from Knowledge Graph
  course: SupportedCourse;
}

export interface CareerRoleDefinition {
  id: string;
  title: string;
  category: string;
  description: string;
  requiredSkills: RoleRequiredSkill[];
  recommendedSkills: Array<{ name: string; targetScore: number; course: SupportedCourse }>;
  projectExpectations: string[];
  interviewTopics: string[];
}

export interface SkillGapItem {
  skillName: string;
  category: string;
  course: SupportedCourse;
  currentScore: number;
  targetScore: number;
  gap: number;
  priority: SkillPriority;
  isMet: boolean;
  evidence: string[];
  recommendedAction: string;
}

export interface CareerReadinessScore {
  roleId: string;
  roleTitle: string;
  overallReadiness: number; // 0 - 100
  technicalSkillsScore: number;
  projectsScore: number;
  problemSolvingScore: number;
  metSkillsCount: number;
  totalSkillsCount: number;
  criticalGapsCount: number;
  readinessLevel: "EARLY_STAGE" | "DEVELOPING" | "PRACTICING" | "CAREER_READY";
}

export interface CareerRoadmapStep {
  stepNumber: number;
  title: string;
  actionType: "LEARN_CONCEPT" | "PRACTICE_ASSESSMENT" | "BUILD_PROJECT" | "INTERVIEW_PREP";
  description: string;
  targetSkill: string;
  course: SupportedCourse;
  estimatedHours: number;
}

export interface CareerAnalysisResult {
  studentId: string;
  role: CareerRoleDefinition;
  readiness: CareerReadinessScore;
  skillGaps: SkillGapItem[];
  strongSkills: SkillGapItem[];
  roadmap: CareerRoadmapStep[];
  interviewFocusAreas: string[];
  recommendedProjects: string[];
}
