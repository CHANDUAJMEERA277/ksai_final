import { CAREER_ROLES } from "./career-registry";
import {
  CareerAnalysisResult,
  CareerReadinessScore,
  CareerRoadmapStep,
  CareerRoleDefinition,
  SkillGapItem,
} from "./types";
import { getStudentKnowledgeState } from "../knowledge-graph/graph-service";
import { CANONICAL_PROJECTS } from "../projects/project-registry";

/**
 * Retrieve list of all available career roles
 */
export function getAvailableCareerRoles(): CareerRoleDefinition[] {
  return CAREER_ROLES;
}

/**
 * Analyze career skill gaps and readiness for a student against a target career role
 */
export async function analyzeCareerReadiness(
  userId: string,
  roleId: string
): Promise<CareerAnalysisResult> {
  const role = CAREER_ROLES.find((r) => r.id === roleId) || CAREER_ROLES[0];

  // 1. Query live Knowledge Graph state for the target role's primary course
  const primaryCourse = role.requiredSkills[0]?.course || "python";
  const knowledgeState = await getStudentKnowledgeState(userId, primaryCourse);

  const skillGaps: SkillGapItem[] = [];
  const strongSkills: SkillGapItem[] = [];

  let totalTechnicalScore = 0;

  for (const reqSkill of role.requiredSkills) {
    let skillScore = 0;
    const evidenceList: string[] = [];

    // Analyze concept scores in Knowledge Graph
    for (const conceptSlug of reqSkill.relevantConcepts) {
      const strongMatch = knowledgeState.strongConcepts.find((c) => c.slug === conceptSlug);
      const devMatch = knowledgeState.developingConcepts.find((c) => c.slug === conceptSlug);
      const weakMatch = knowledgeState.weakConcepts.find((c) => c.slug === conceptSlug);

      if (strongMatch) {
        skillScore = Math.max(skillScore, 90);
        evidenceList.push(`Knowledge Graph: Strong mastery in ${strongMatch.name} (90%)`);
      } else if (devMatch) {
        skillScore = Math.max(skillScore, 70);
        evidenceList.push(`Knowledge Graph: Developing proficiency in ${devMatch.name} (70%)`);
      } else if (weakMatch) {
        skillScore = Math.max(skillScore, 40);
        evidenceList.push(`Knowledge Graph: Needs reinforcement in ${weakMatch.name} (40%)`);
      }
    }

    const gap = Math.max(0, reqSkill.targetScore - skillScore);
    const isMet = skillScore >= reqSkill.targetScore;

    let recommendedAction = `Target mastery of ${reqSkill.name} through focused curriculum lessons.`;
    if (isMet) {
      recommendedAction = `Mastery achieved (${skillScore}%). Maintain proficiency with periodic reviews.`;
    } else if (skillScore >= 60) {
      recommendedAction = `Practice ${reqSkill.name} via Adaptive Assessment to reach the ${reqSkill.targetScore}% threshold.`;
    } else {
      recommendedAction = `Study foundational concepts and work through AI Teacher checkpoints.`;
    }

    const item: SkillGapItem = {
      skillName: reqSkill.name,
      category: reqSkill.category,
      course: reqSkill.course,
      currentScore: skillScore,
      targetScore: reqSkill.targetScore,
      gap,
      priority: reqSkill.importance,
      isMet,
      evidence: evidenceList,
      recommendedAction,
    };

    if (isMet) {
      strongSkills.push(item);
    } else {
      skillGaps.push(item);
    }

    totalTechnicalScore += skillScore;
  }

  const avgTechnicalScore =
    role.requiredSkills.length > 0
      ? Math.round(totalTechnicalScore / role.requiredSkills.length)
      : 0;

  // 2. Project and Problem Solving Dimensions
  const relevantProjects = CANONICAL_PROJECTS.filter((p) => p.course === primaryCourse);
  const projectsScore = Math.min(100, Math.round(avgTechnicalScore * 0.85));
  const problemSolvingScore = Math.min(100, Math.round(avgTechnicalScore * 0.9));

  const overallReadiness = Math.round(
    avgTechnicalScore * 0.5 + projectsScore * 0.3 + problemSolvingScore * 0.2
  );

  let readinessLevel: "EARLY_STAGE" | "DEVELOPING" | "PRACTICING" | "CAREER_READY" = "EARLY_STAGE";
  if (overallReadiness >= 85) {
    readinessLevel = "CAREER_READY";
  } else if (overallReadiness >= 65) {
    readinessLevel = "PRACTICING";
  } else if (overallReadiness >= 40) {
    readinessLevel = "DEVELOPING";
  }

  const readiness: CareerReadinessScore = {
    roleId: role.id,
    roleTitle: role.title,
    overallReadiness,
    technicalSkillsScore: avgTechnicalScore,
    projectsScore,
    problemSolvingScore,
    metSkillsCount: strongSkills.length,
    totalSkillsCount: role.requiredSkills.length,
    criticalGapsCount: skillGaps.filter((g) => g.priority === "CRITICAL").length,
    readinessLevel,
  };

  // 3. Construct Tailored Career Roadmap
  const roadmap: CareerRoadmapStep[] = [];
  let stepIdx = 1;

  // Step 1: Critical Knowledge Gaps
  const criticalGaps = skillGaps.filter((g) => g.priority === "CRITICAL");
  if (criticalGaps.length > 0) {
    roadmap.push({
      stepNumber: stepIdx++,
      title: `Master ${criticalGaps[0].skillName}`,
      actionType: "LEARN_CONCEPT",
      description: `Complete foundational lessons and checkpoints to eliminate the ${criticalGaps[0].gap}% gap.`,
      targetSkill: criticalGaps[0].skillName,
      course: criticalGaps[0].course,
      estimatedHours: 8,
    });
  }

  // Step 2: Practice & Assessments
  const developingGaps = skillGaps.filter((g) => g.priority !== "CRITICAL");
  if (developingGaps.length > 0) {
    roadmap.push({
      stepNumber: stepIdx++,
      title: `Targeted Practice: ${developingGaps[0].skillName}`,
      actionType: "PRACTICE_ASSESSMENT",
      description: `Complete adaptive assessment questions to push score past ${developingGaps[0].targetScore}%.`,
      targetSkill: developingGaps[0].skillName,
      course: developingGaps[0].course,
      estimatedHours: 6,
    });
  }

  // Step 3: Production Project Milestone
  if (relevantProjects.length > 0) {
    roadmap.push({
      stepNumber: stepIdx++,
      title: `Build Project: ${relevantProjects[0].title}`,
      actionType: "BUILD_PROJECT",
      description: `Implement the full milestone plan under the guidance of the AI Project Coach.`,
      targetSkill: relevantProjects[0].skillsGained[0] || "Software Architecture",
      course: relevantProjects[0].course,
      estimatedHours: 15,
    });
  }

  // Step 4: Technical Interview Preparation
  roadmap.push({
    stepNumber: stepIdx++,
    title: "Technical & Architectural Mock Interview",
    actionType: "INTERVIEW_PREP",
    description: `Review key interview topics for ${role.title}: ${role.interviewTopics.slice(0, 2).join(", ")}.`,
    targetSkill: "Interview Readiness",
    course: primaryCourse,
    estimatedHours: 5,
  });

  return {
    studentId: userId,
    role,
    readiness,
    skillGaps,
    strongSkills,
    roadmap,
    interviewFocusAreas: role.interviewTopics,
    recommendedProjects: role.projectExpectations,
  };
}
