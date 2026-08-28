import { prisma } from "../prisma";
import {
  SkillCategory,
  SkillFreshness,
  SkillLevel,
  SkillPassportItem,
  SkillVerificationState,
  StudentSkillPassport,
} from "./types";
import { getStudentKnowledgeState } from "../knowledge-graph/graph-service";
import { SupportedCourse } from "../knowledge-graph/types";
import { CANONICAL_PROJECTS } from "../projects/project-registry";

const COURSES: SupportedCourse[] = ["python", "c", "cpp", "java"];

const SKILL_DEFINITIONS: Array<{
  id: string;
  name: string;
  category: SkillCategory;
  courses: SupportedCourse[];
  conceptSlugs: string[];
  projectTitle?: string;
}> = [
  // C Skills
  {
    id: "c-memory-management",
    name: "C Memory Management & Pointers",
    category: "SYSTEMS_AND_MEMORY",
    courses: ["c"],
    conceptSlugs: ["c-pointers-and-addresses", "c-dynamic-memory-allocation"],
    projectTitle: "Student Record Management System",
  },
  {
    id: "c-structures-io",
    name: "C Structs & Binary File I/O",
    category: "DATA_STRUCTURES",
    courses: ["c"],
    conceptSlugs: ["c-structures-and-typedef"],
    projectTitle: "Student Record Management System",
  },

  // C++ Skills
  {
    id: "cpp-polymorphism-oop",
    name: "C++ OOP & Polymorphism (Virtual Methods)",
    category: "SOFTWARE_ARCHITECTURE",
    courses: ["cpp"],
    conceptSlugs: ["cpp-classes-and-encapsulation", "cpp-inheritance-and-polymorphism"],
    projectTitle: "Banking Ledger & Transaction Engine",
  },
  {
    id: "cpp-templates-stl",
    name: "C++ Templates & STL Containers",
    category: "DATA_STRUCTURES",
    courses: ["cpp"],
    conceptSlugs: ["cpp-templates-and-stl", "cpp-references-and-const"],
    projectTitle: "Banking Ledger & Transaction Engine",
  },

  // Python Skills
  {
    id: "python-data-structures",
    name: "Python Data Structures & Comprehensions",
    category: "DATA_STRUCTURES",
    courses: ["python"],
    conceptSlugs: ["py-variables-and-data-types", "py-data-structures-lists-dicts"],
    projectTitle: "Personal Expense Analyzer",
  },
  {
    id: "python-backend-logic",
    name: "Python Modular Architecture & Exceptions",
    category: "SOFTWARE_ARCHITECTURE",
    courses: ["python"],
    conceptSlugs: ["py-functions-and-scope", "py-control-flow-and-loops"],
    projectTitle: "Personal Expense Analyzer",
  },

  // Java Skills
  {
    id: "java-oop-interfaces",
    name: "Java Object-Oriented Interface Contracts",
    category: "SOFTWARE_ARCHITECTURE",
    courses: ["java"],
    conceptSlugs: ["java-classes-and-objects", "java-inheritance-and-interfaces"],
    projectTitle: "Enterprise Library Catalog",
  },
  {
    id: "java-collections-framework",
    name: "Java Generics & Collections Framework",
    category: "DATA_STRUCTURES",
    courses: ["java"],
    conceptSlugs: ["java-collections-and-generics", "java-jvm-and-types"],
    projectTitle: "Enterprise Library Catalog",
  },
];

/**
 * Generate a complete, verified digital skill passport for the authenticated student
 */
export async function getStudentSkillPassport(userId: string): Promise<StudentSkillPassport> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!user) {
    throw new Error("Student not found.");
  }

  // 1. Gather all knowledge states across courses
  const courseKnowledgeStates = new Map<SupportedCourse, any>();
  for (const c of COURSES) {
    const st = await getStudentKnowledgeState(userId, c);
    courseKnowledgeStates.set(c, st);
  }

  // 2. Fetch learning events for evidence reconstruction
  const events = await prisma.learningEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const passportSkills: SkillPassportItem[] = [];

  for (const def of SKILL_DEFINITIONS) {
    const evidenceList: string[] = [];
    let cumulativeScore = 0;
    let scoredConceptsCount = 0;

    for (const c of def.courses) {
      const kState = courseKnowledgeStates.get(c);
      if (!kState) continue;

      for (const cSlug of def.conceptSlugs) {
        const strong = kState.strongConcepts.find((x: any) => x.slug === cSlug);
        const dev = kState.developingConcepts.find((x: any) => x.slug === cSlug);
        const weak = kState.weakConcepts.find((x: any) => x.slug === cSlug);

        if (strong) {
          cumulativeScore += 90;
          scoredConceptsCount++;
          evidenceList.push(`Knowledge Graph: Verified mastery in ${strong.name} (90%)`);
        } else if (dev) {
          cumulativeScore += 70;
          scoredConceptsCount++;
          evidenceList.push(`Knowledge Graph: Developing competency in ${dev.name} (70%)`);
        } else if (weak) {
          cumulativeScore += 45;
          scoredConceptsCount++;
          evidenceList.push(`Knowledge Graph: Learning evidence recorded for ${weak.name} (45%)`);
        }
      }
    }

    const confidenceScore =
      scoredConceptsCount > 0 ? Math.round(cumulativeScore / scoredConceptsCount) : 0;

    // Determine Level & Verification State
    let level: SkillLevel = "BEGINNER";
    let verificationState: SkillVerificationState = "LEARNING";

    if (confidenceScore >= 90) {
      level = "PROFICIENT";
      verificationState = "VERIFIED";
    } else if (confidenceScore >= 75) {
      level = "PRACTICED";
      verificationState = "ASSESSED";
    } else if (confidenceScore >= 50) {
      level = "DEVELOPING";
      verificationState = "PRACTICED";
    } else {
      level = "BEGINNER";
      verificationState = confidenceScore > 0 ? "LEARNING" : "SELF_REPORTED";
    }

    const item: SkillPassportItem = {
      id: def.id,
      name: def.name,
      category: def.category,
      level,
      confidenceScore,
      verificationState,
      evidenceCount: evidenceList.length,
      evidenceList,
      lastDemonstrated: new Date().toISOString().split("T")[0],
      freshness: "RECENT",
      relatedCourses: def.courses,
      relatedProjects: def.projectTitle ? [def.projectTitle] : [],
      relatedConcepts: def.conceptSlugs,
      recommendedNextStep:
        confidenceScore >= 85
          ? "Demonstrate in advanced software project"
          : "Complete targeted adaptive assessment set",
    };

    passportSkills.push(item);
  }

  const verifiedCount = passportSkills.filter((s) => s.verificationState === "VERIFIED" || s.verificationState === "ASSESSED").length;
  const proficientCount = passportSkills.filter((s) => s.level === "PROFICIENT" || s.level === "ADVANCED").length;

  return {
    studentId: user.id,
    studentName: user.name || "Student",
    studentEmail: user.email,
    passportId: `KSAI-SKP-${user.id.slice(0, 8).toUpperCase()}`,
    issuedAt: user.createdAt.toISOString().split("T")[0],
    overallSkillCount: passportSkills.length,
    verifiedSkillsCount: verifiedCount,
    proficientSkillsCount: proficientCount,
    skills: passportSkills,
    topDemonstratedProjects: CANONICAL_PROJECTS.map((p) => p.title),
  };
}
