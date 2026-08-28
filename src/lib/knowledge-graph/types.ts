export type SupportedCourse = "python" | "c" | "cpp" | "java";

export type ConceptState = "UNSEEN" | "DEVELOPING" | "NEEDS_REVIEW" | "MASTERED";

export type EvidenceSource = "CHECKPOINT" | "QUIZ" | "NOTE" | "VISION" | "PROJECT";

export type EdgeRelationType = "REQUIRES" | "EXTENDS" | "APPLIES" | "RELATED_TO";

export interface ConceptNode {
  id: string;
  slug: string;
  name: string;
  course: SupportedCourse;
  chapterOrder: number;
  topicName?: string;
  category: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  description: string;
  skills: string[];
}

export interface ConceptEdge {
  fromConceptSlug: string; // Prerequisite or base concept
  toConceptSlug: string; // Target concept that requires or extends fromConcept
  relation: EdgeRelationType;
  weight?: number; // 0.0 - 1.0 importance
}

export interface StudentConceptMastery {
  conceptSlug: string;
  conceptName: string;
  course: SupportedCourse;
  masteryScore: number; // 0 - 100
  state: ConceptState;
  attempts: number;
  lastEvaluatedAt: string;
  confidence: number; // 0.0 - 1.0
  evidenceCount: number;
  recentMistakes: string[];
}

export interface PrerequisiteGap {
  concept: ConceptNode;
  missingPrerequisites: ConceptNode[];
  reason: string;
}

export interface StudentKnowledgeState {
  studentId: string;
  studentEmail?: string;
  course: SupportedCourse;
  strongConcepts: ConceptNode[];
  developingConcepts: ConceptNode[];
  weakConcepts: ConceptNode[];
  unseenConcepts: ConceptNode[];
  recentConcepts: ConceptNode[];
  prerequisiteGaps: PrerequisiteGap[];
  recentMistakes: string[];
  masteredSkills: string[];
  overallMasteryPercentage: number;
  totalConceptsInCourse: number;
  masteredConceptsCount: number;
  lastActiveTimestamp?: string;
}

export interface LearningEvidenceInput {
  userId: string;
  userEmail?: string;
  course: SupportedCourse;
  chapterId: string;
  topic: string;
  conceptSlug?: string;
  source: EvidenceSource;
  score: number; // 0 - 100
  confidence?: number;
  summary: string;
  mistakes?: string[];
  visualReference?: string;
  question?: string;
  answer?: string;
}
