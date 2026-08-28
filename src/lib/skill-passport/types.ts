import { SupportedCourse } from "../knowledge-graph/types";

export type SkillCategory =
  | "PROGRAMMING_LANGUAGES"
  | "DATA_STRUCTURES"
  | "SYSTEMS_AND_MEMORY"
  | "SOFTWARE_ARCHITECTURE"
  | "TOOLS_AND_TESTING";

export type SkillLevel = "BEGINNER" | "DEVELOPING" | "PRACTICED" | "PROFICIENT" | "ADVANCED";

export type SkillVerificationState =
  | "SELF_REPORTED"
  | "LEARNING"
  | "PRACTICED"
  | "ASSESSED"
  | "PROJECT_DEMONSTRATED"
  | "VERIFIED";

export type SkillFreshness = "RECENT" | "AGING" | "STALE";

export interface SkillPassportItem {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  confidenceScore: number; // 0 - 100
  verificationState: SkillVerificationState;
  evidenceCount: number;
  evidenceList: string[];
  lastDemonstrated: string;
  freshness: SkillFreshness;
  relatedCourses: SupportedCourse[];
  relatedProjects: string[];
  relatedConcepts: string[];
  recommendedNextStep: string;
}

export interface StudentSkillPassport {
  studentId: string;
  studentName: string;
  studentEmail: string;
  passportId: string;
  issuedAt: string;
  overallSkillCount: number;
  verifiedSkillsCount: number;
  proficientSkillsCount: number;
  skills: SkillPassportItem[];
  topDemonstratedProjects: string[];
}
